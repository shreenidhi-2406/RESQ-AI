import express from 'express';
import { getLiveData } from '../services/sourceManager.js';

const router = express.Router();

router.get('/', (req, res) => {
    const data = getLiveData();

    const critical = data.incidents.filter(i => 
        i.severity === 'Critical' || i.severity === 'Red' || i.severity === 'High' || i.severity === 'Orange'
    );

    const locationsSet = new Set();
    data.incidents.forEach(i => {
        const loc = i.location_name || i.location;
        if (loc && loc !== 'Unknown' && loc !== 'India') {
            locationsSet.add(loc);
        }
    });

    const activeLocations = locationsSet.size > 0 ? locationsSet.size : (data.incidents.length > 0 ? Math.min(data.incidents.length, 12) : 0);
    const totalAffected = data.incidents.reduce((sum, item) => sum + (item.people_affected || item.affected || 0), 0);

    // Dynamic resources needed calculation based on active incidents
    let rescueRequired = 0;
    let medicalRequired = 0;
    let shelterRequired = 0;

    data.incidents.forEach(inc => {
        const sev = (inc.severity || '').toLowerCase();
        const affected = inc.people_affected || inc.affected || 0;
        
        if (sev === 'critical' || sev === 'red') {
            rescueRequired += 4;
            medicalRequired += Math.max(affected, 40);
            shelterRequired += Math.max(affected, 120);
        } else if (sev === 'high' || sev === 'orange') {
            rescueRequired += 2;
            medicalRequired += Math.max(Math.floor(affected * 0.5), 15);
            shelterRequired += Math.max(affected, 50);
        } else {
            rescueRequired += 1;
            medicalRequired += 5;
            shelterRequired += 10;
        }
    });

    const totalResourceDemands = rescueRequired + Math.ceil(medicalRequired / 10) + Math.ceil(shelterRequired / 50);

    const stats = {
        criticalCount: critical.length,
        activeLocations,
        totalAffected,
        resourcesNeeded: totalResourceDemands,
        resourceDetails: {
            rescue: { total: rescueRequired + 8, deployed: Math.floor(rescueRequired * 0.7), available: Math.ceil(rescueRequired * 0.3) + 8 },
            ambulances: { total: Math.ceil(medicalRequired / 5) + 6, deployed: Math.floor((medicalRequired / 5) * 0.6), available: Math.ceil((medicalRequired / 5) * 0.4) + 6 },
            shelter: { capacity: shelterRequired + 600, occupied: Math.floor(shelterRequired * 0.8), available: Math.ceil(shelterRequired * 0.2) + 600 },
            medicalkits: { available: Math.max(800 - medicalRequired, 100), required: medicalRequired || 150 }
        },
        lastUpdated: data.lastUpdated
    };

    res.json(stats);
});

export default router;

