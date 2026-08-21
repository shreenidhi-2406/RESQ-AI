export const mockStats = {
    critical: { value: 12, trend: "↑ 3 in last hour" },
    active: { value: 47, subtext: "Across 8 locations" },
    affected: { value: 1284, subtext: "Across active incidents" },
    resources: { value: 76, subtext: "Across active incidents" }
};

export const mockSourceStats = [
    { source: "GDACS", count: 12, color: "bg-purple-500" },
    { source: "News", count: 24, color: "bg-blue-500" },
    { source: "Community", count: 38, color: "bg-teal-500" },
    { source: "Emergency", count: 7, color: "bg-red-500" }
];

export const mockIncidents = [
    {
        id: "INC-024",
        title: "People trapped near Bhavani Bridge",
        location: "Bhavani, Erode",
        type: "Flood",
        severity: "Critical",
        lat: 11.447,
        lng: 77.678,
        affected: 30,
        trapped: 8,
        priorityScore: 96,
        required: ["Rescue Team", "Ambulance", "Water"],
        status: "Needs Immediate Response",
        reportsCount: 7,
        sources: ["Community", "News", "GDACS"]
    },
    {
        id: "INC-025",
        title: "Hospital emergency supply shortage",
        location: "Govt Hospital, Erode",
        type: "Medical",
        severity: "Critical",
        lat: 11.336,
        lng: 77.728,
        affected: 120,
        trapped: 0,
        priorityScore: 91,
        required: ["Medical Kits", "Generators"],
        status: "Needs Supplies",
        reportsCount: 4,
        sources: ["Emergency"]
    },
    {
        id: "INC-026",
        title: "Main road completely flooded",
        location: "Perundurai",
        type: "Flood",
        severity: "High",
        lat: 11.274,
        lng: 77.583,
        affected: 200,
        trapped: 0,
        priorityScore: 82,
        required: ["Boats", "Food"],
        status: "Monitoring",
        reportsCount: 12,
        sources: ["News", "Community"]
    },
    {
        id: "INC-027",
        title: "Landslide blocking highway",
        location: "Coonoor",
        type: "Landslide",
        severity: "High",
        lat: 11.353,
        lng: 76.795,
        affected: 45,
        trapped: 0,
        priorityScore: 78,
        required: ["Heavy Machinery", "Rescue Team"],
        status: "Response Deployed",
        reportsCount: 3,
        sources: ["GDACS", "News"]
    },
    {
        id: "INC-028",
        title: "Power grid failure",
        location: "Salem",
        type: "Infrastructure",
        severity: "Medium",
        lat: 11.664,
        lng: 78.146,
        affected: 5000,
        trapped: 0,
        priorityScore: 65,
        required: ["Engineering Team"],
        status: "Monitoring",
        reportsCount: 20,
        sources: ["News", "Community"]
    }
];

export const mockReports = [
    {
        id: "REP-101",
        source: "COMMUNITY",
        content: '"Water has entered several houses near Bhavani Bridge. Around 8 people are trapped."',
        location: "Bhavani, Erode",
        time: "2 min ago",
        badgeColor: "bg-teal-100 text-teal-800"
    },
    {
        id: "REP-102",
        source: "GDACS",
        content: "Flood event detected in Tamil Nadu region.",
        location: "Tamil Nadu",
        time: "4 min ago",
        badgeColor: "bg-purple-100 text-purple-800"
    },
    {
        id: "REP-103",
        source: "NEWS",
        content: '"Heavy rainfall causes severe flooding across Erode district."',
        location: "Erode",
        time: "12 min ago",
        badgeColor: "bg-blue-100 text-blue-800"
    },
    {
        id: "REP-104",
        source: "EMERGENCY",
        content: "District hospital requesting urgent backup generators and medical trauma kits.",
        location: "Erode City",
        time: "15 min ago",
        badgeColor: "bg-red-100 text-red-800"
    }
];

export const mockResources = {
    rescue: { total: 8, deployed: 5, available: 3 },
    ambulances: { total: 12, deployed: 8, available: 4 },
    shelter: { capacity: 500, occupied: 284, available: 216 },
    medicalkits: { available: 320, required: 180 }
};

export const mockChartData = [
    { name: "Flood", count: 24 },
    { name: "Heavy Rain", count: 10 },
    { name: "Medical", count: 6 },
    { name: "Road Blockage", count: 5 },
    { name: "Landslide", count: 2 }
];

export const mockSeverityData = {
    Critical: 12,
    High: 18,
    Medium: 11,
    Low: 6
};
