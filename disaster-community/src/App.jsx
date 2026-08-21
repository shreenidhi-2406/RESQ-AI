import React from 'react';

const mockReports = [
    {
        id: "POST-001",
        title: "People trapped near Bhavani Bridge",
        author: "Arun Kumar",
        location: "Bhavani, Erode",
        time: "10 minutes ago",
        content: "Flood water has entered several houses near the bridge. Around 8 people are trapped.",
        disasterType: "Flood",
        severity: "Critical",
        peopleAffected: 8
    },
    {
        id: "POST-002",
        title: "Heavy rainfall causing waterlogging",
        author: "Priya Sharma",
        location: "T Nagar, Chennai",
        time: "32 minutes ago",
        content: "Continuous rainfall for the last 5 hours has caused severe waterlogging. Roads are completely blocked.",
        disasterType: "Heavy Rain",
        severity: "High",
        peopleAffected: 50
    },
    {
        id: "POST-003",
        title: "Cyclone warning for coastal areas",
        author: "Muthu Vel",
        location: "Nagapattinam",
        time: "1 hour ago",
        content: "Authorities have issued a cyclone warning. Fishermen are advised not to venture into the sea. Fast winds expected tonight.",
        disasterType: "Cyclone",
        severity: "Moderate",
        peopleAffected: 0
    },
    {
        id: "POST-004",
        title: "Landslide blocks main highway",
        author: "Kannan G",
        location: "Ooty",
        time: "2 hours ago",
        content: "A massive landslide has completely blocked the Mettupalayam-Ooty highway. Several vehicles are stranded.",
        disasterType: "Landslide",
        severity: "High",
        peopleAffected: 15
    },
    {
        id: "POST-005",
        title: "Earthquake tremors felt",
        author: "Sara V",
        location: "Coimbatore",
        time: "3 hours ago",
        content: "Mild earthquake tremors were felt in several parts of the city. People rushed out of their offices and homes.",
        disasterType: "Earthquake",
        severity: "Low",
        peopleAffected: 0
    },
    {
        id: "POST-006",
        title: "Dam water level critically high",
        author: "Rajesh K",
        location: "Mettur Dam, Salem",
        time: "3.5 hours ago",
        content: "Water levels at Mettur Dam are nearing maximum capacity. Authorities might release excess water soon. Nearby villages alerted.",
        disasterType: "Flood",
        severity: "High",
        peopleAffected: 200
    },
    {
        id: "POST-007",
        title: "Building collapse during storm",
        author: "Deepika R",
        location: "Madurai",
        time: "5 hours ago",
        content: "An old commercial building collapsed due to heavy storms. Rescue operations are currently underway.",
        disasterType: "Collapse",
        severity: "Critical",
        peopleAffected: 12
    },
    {
        id: "POST-008",
        title: "Evacuation organized for flooded area",
        author: "Vikram Reddy",
        location: "Velachery, Chennai",
        time: "6 hours ago",
        content: "Boats have been deployed to evacuate residents from flooded streets in Velachery.",
        disasterType: "Flood",
        severity: "High",
        peopleAffected: 120
    },
    {
        id: "POST-009",
        title: "Forest fire spreading rapidly",
        author: "Anita P",
        location: "Kodaikanal",
        time: "8 hours ago",
        content: "Dry weather and strong winds are causing a forest fire to spread quickly towards residential settlements.",
        disasterType: "Fire",
        severity: "Critical",
        peopleAffected: 45
    },
    {
        id: "POST-010",
        title: "Power lines down after severe storm",
        author: "Selvam T",
        location: "Trichy",
        time: "10 hours ago",
        content: "Hundreds of houses are without electricity as a storm took down several major power lines and trees.",
        disasterType: "Storm",
        severity: "Moderate",
        peopleAffected: 300
    },
    {
        id: "POST-011",
        title: "Flash floods destroy bridge",
        author: "Kavitha N",
        location: "Tenkasi",
        time: "12 hours ago",
        content: "A newly built wooden bridge was washed away entirely by unexpected flash floods yesterday evening.",
        disasterType: "Flood",
        severity: "High",
        peopleAffected: 0
    },
    {
        id: "POST-012",
        title: "Tsunami mock drill conducted",
        author: "Ramesh Iyer",
        location: "Cuddalore",
        time: "14 hours ago",
        content: "A successful mock drill was performed to check the preparedness of the coastal guard and local residents.",
        disasterType: "Tsunami",
        severity: "Low",
        peopleAffected: 0
    },
    {
        id: "POST-013",
        title: "Drinking water scarcity declared",
        author: "Mohammed A",
        location: "Ramanathapuram",
        time: "1 day ago",
        content: "Local authorities declared a severe drinking water shortage due to failed monsoons and dried up lakes.",
        disasterType: "Drought",
        severity: "High",
        peopleAffected: 5000
    },
    {
        id: "POST-014",
        title: "Temporary shelter setup",
        author: "Sneha G",
        location: "Tiruppur",
        time: "1 day ago",
        content: "A local school has been converted into a temporary shelter for victims displaced by the heavy rains.",
        disasterType: "Heavy Rain",
        severity: "Moderate",
        peopleAffected: 85
    },
    {
        id: "POST-015",
        title: "Missing fishing boat found",
        author: "Karthi S",
        location: "Kanyakumari",
        time: "2 days ago",
        content: "The missing fishing boat with 4 fishermen was found drifting safely. Coast guards towed them back.",
        disasterType: "Emergency",
        severity: "Moderate",
        peopleAffected: 4
    }
];

function App() {
    return (
        <div>
            <header>
                <h1>Disaster Community Feed</h1>
                <p>Live reports from the ground</p>
            </header>
            <main>
                {mockReports.map(report => (
                    <article key={report.id} className="disaster-post" data-post-id={report.id}>
                        <h2 className="post-title">{report.title}</h2>
                        <div className="post-meta">
                            <p className="post-author">{report.author}</p>
                            <p className="post-location">{report.location}</p>
                            <time className="post-time">{report.time}</time>
                        </div>
                        <p className="post-content">{report.content}</p>
                        <div className="post-tags">
                            <span className="post-disaster-type">Disaster: {report.disasterType}</span>
                            <span className="post-severity">Severity: {report.severity}</span>
                            <span className="post-people-affected">People affected: {report.peopleAffected}</span>
                        </div>
                    </article>
                ))}
            </main>
        </div>
    );
}

export default App;
