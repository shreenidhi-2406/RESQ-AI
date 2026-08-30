import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import CommandCenter from './pages/CommandCenter';
import LiveIncidents from './pages/LiveIncidents';
import AIIntelligence from './pages/AIIntelligence';
import { ShieldAlert, CheckCircle2 } from 'lucide-react';

function App() {
    const [activeTab, setActiveTab] = useState('Live Incidents');

    const isCoreModule = ['Command Center', 'Live Incidents', 'AI Intelligence'].includes(activeTab);

    return (
        <div className="min-h-screen bg-slate-50 flex">
            <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
            
            {activeTab === 'Command Center' && <CommandCenter />}
            {activeTab === 'Live Incidents' && <LiveIncidents />}
            {activeTab === 'AI Intelligence' && <AIIntelligence />}

            {!isCoreModule && (
                <main className="flex-1 p-8 ml-64 flex items-center justify-center">
                    <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-xs max-w-md text-center">
                        <div className="w-14 h-14 bg-slate-100 text-slate-600 rounded-full flex items-center justify-center mx-auto mb-4">
                            <ShieldAlert size={28} />
                        </div>
                        <h2 className="text-lg font-bold text-slate-900 mb-1">{activeTab} Module</h2>
                        <p className="text-xs text-slate-500 mb-6 leading-relaxed">
                            This operational section is reserved for future deployment phases. Please access active real-time AI capabilities via the core operational modules below:
                        </p>
                        <div className="space-y-2 text-xs font-semibold text-slate-700">
                            <button 
                                onClick={() => setActiveTab('Live Incidents')}
                                className="w-full bg-slate-100 hover:bg-slate-200 p-2.5 rounded-lg flex items-center justify-between text-indigo-700 font-bold transition-colors"
                            >
                                <span>Live Incidents Stream</span>
                                <CheckCircle2 size={16} className="text-emerald-500" />
                            </button>
                            <button 
                                onClick={() => setActiveTab('AI Intelligence')}
                                className="w-full bg-slate-100 hover:bg-slate-200 p-2.5 rounded-lg flex items-center justify-between text-indigo-700 font-bold transition-colors"
                            >
                                <span>AI Intelligence & Grouping</span>
                                <CheckCircle2 size={16} className="text-emerald-500" />
                            </button>
                            <button 
                                onClick={() => setActiveTab('Command Center')}
                                className="w-full bg-slate-100 hover:bg-slate-200 p-2.5 rounded-lg flex items-center justify-between text-indigo-700 font-bold transition-colors"
                            >
                                <span>Command Center</span>
                                <CheckCircle2 size={16} className="text-emerald-500" />
                            </button>
                        </div>
                    </div>
                </main>
            )}
        </div>
    );
}

export default App;
