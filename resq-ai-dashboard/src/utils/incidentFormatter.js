export function generateIncidentSentence(incident) {
    if (!incident) return '';

    const typeRaw = incident.disaster_type || 'disaster';
    let type = typeRaw.toLowerCase();

    // Normalize codes
    if (type === 'tc') type = 'cyclone';
    if (type === 'fl') type = 'flood';
    if (type === 'eq') type = 'earthquake';

    let severityStr = '';
    if (incident.severity && incident.severity !== 'Unknown') {
        if (incident.severity === 'Critical') {
            severityStr = 'Critical ';
        } else if (incident.severity === 'High') {
            severityStr = 'High-severity ';
        }
    }

    const location = incident.location || 'an unknown location';
    let sentence = severityStr + type + ' reported in ' + location;
    sentence = sentence.charAt(0).toUpperCase() + sentence.slice(1);

    const affected = incident.people_affected || 0;
    const trapped = incident.people_trapped || 0;
    const medical = incident.medical_cases || 0;

    let impactClauses = [];

    if (affected > 0 || trapped > 0) {
        if (trapped > 0 && affected > 0) {
            impactClauses.push('affecting ' + affected + ' people, including ' + trapped + ' people reported trapped and requiring immediate rescue assistance');
        } else if (trapped > 0) {
            impactClauses.push('with ' + trapped + ' people reported trapped and requiring immediate rescue assistance');
        } else if (medical > 0) {
            impactClauses.push('affecting ' + affected + ' people, including ' + medical + ' people requiring immediate medical assistance');
        } else {
            impactClauses.push('affecting ' + affected + ' people');
        }
    } else if (type.includes('blockage') || type.includes('traffic')) {
        impactClauses.push('potentially affecting emergency access in the area');
    }

    let resourceClauses = [];
    if (incident.resource_needs && Object.keys(incident.resource_needs).length > 0) {
        const needs = Object.entries(incident.resource_needs);

        let needsText = needs.map(([res, count]) => {
            let resStr = res.toLowerCase();
            if (resStr === 'rescue_team') return count + ' rescue teams';
            if (resStr === 'ambulance') return count + (count > 1 ? ' ambulances' : ' ambulance');
            if (resStr === 'food') return count + ' food packets';
            if (resStr === 'water') return count + ' units of drinking water';
            if (resStr === 'shelter') return 'emergency shelter';
            return count + ' ' + resStr;
        });

        if (needsText.length === 1) {
            let n0 = needs[0][0];
            if (n0 === 'food' || n0 === 'water' || n0 === 'shelter') {
                if (trapped === 0) impactClauses.push('who require immediate ' + needsText[0] + ' assistance');
            } else {
                resourceClauses.push('with ' + needsText[0] + ' required');
            }
        } else if (needsText.length > 1) {
            const last = needsText.pop();
            const combinedNeeds = needsText.join(', ') + ' and ' + last;
            if (trapped === 0) {
                impactClauses.push('who require ' + combinedNeeds);
            } else {
                resourceClauses.push('with ' + combinedNeeds + ' required');
            }
        }
    }

    if (impactClauses.length > 0) {
        let joinedImpact = impactClauses[0];
        if (impactClauses.length > 1 && impactClauses[1].startsWith('who')) {
            joinedImpact += ' ' + impactClauses[1];
        } else if (impactClauses.length > 1) {
            joinedImpact += ', ' + impactClauses.slice(1).join(', ');
        }
        sentence += ', ' + joinedImpact;
    }

    if (resourceClauses.length > 0) {
        sentence += ', ' + resourceClauses.join(' and ');
    }

    return sentence + '.';
}

export function formatIncidentTime(dateStr) {
    if (!dateStr) return 'Unknown time';
    const diff = Math.floor((new Date() - new Date(dateStr)) / 60000);
    if (diff < 1) return 'Just now';
    if (diff < 60) return diff + ' min ago';
    if (diff < 1440) return Math.floor(diff / 60) + ' hours ago';
    return Math.floor(diff / 1440) + ' days ago';
}
