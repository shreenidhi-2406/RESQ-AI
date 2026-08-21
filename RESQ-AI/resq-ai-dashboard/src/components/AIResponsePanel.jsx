import React from 'react';
import { Cpu } from 'lucide-react';

export default function AIResponsePanel({ reportsCount = 0, sourcesCount = 0 }) {
    return (
        <div className="bg-indigo-900 rounded-xl border border-indigo-800 shadow-sm text-white overflow-hidden flex flex-col h-full relative">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-purple-600/10 pointer-events-none"></div>

            <div className="px-5 py-4 border-b border-indigo-800 flex justify-between items-center relative z-10">
                <h3 className="font-semibold tracking-tight text-sm flex items-center gap-2">
                    <Cpu size={16} className="text-indigo-300" />
                    AI RESPONSE ENGINE
                </h3>
            </div>

            <div className="p-5 flex-1 relative z-10 flex flex-col justify-between text-sm">
                <div className="space-y-4">
                    <div className="text-indigo-200 font-medium">Waiting for live intelligence pipeline...</div>

                    <ul className="space-y-1.5 text-indigo-100">
                        <li className="flex items-center gap-2">
                            <span className="text-emerald-400">✓</span> {reportsCount} Live reports received
                        </li>
                        <li className="flex items-center gap-2">
                            <span className="text-emerald-400">✓</span> {sourcesCount} Sources connected
                        </li>
                    </ul>
                </div>

                <div className="mt-4 pt-4 border-t border-indigo-800/50">
                    <div className="text-indigo-50 font-medium text-xs mb-4 leading-relaxed">
                        AI prioritization will be activated in the next phase.
                    </div>
                    <button className="w-full bg-white/10 text-white-50 py-2 rounded-lg text-xs font-bold tracking-wider opacity-50 cursor-not-allowed">
                        AI PENDING
                    </button>
                </div>
            </div>
        </div>
    );
}
