import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import CommandCenter from './pages/CommandCenter';
import LiveIncidents from './pages/LiveIncidents';

function App() {
    const [activeTab, setActiveTab] = useState('Live Incidents');

    return (
        <>
            <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
            {activeTab === 'Command Center' && <CommandCenter />}
            {activeTab === 'Live Incidents' && <LiveIncidents />}
            {/* Other tabs can go here later */}
        </>
    );
}

export default App;
