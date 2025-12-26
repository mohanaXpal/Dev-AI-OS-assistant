
import React, { useEffect, useState } from 'react';
import { Activity, Terminal } from 'lucide-react';
import { wsManager, ActivityEvent } from '@/lib/websocket';

const ActivityLog = () => {
    const [logs, setLogs] = useState<ActivityEvent[]>([]);
    const [isHydrated, setIsHydrated] = useState(false);

    useEffect(() => {
        // Set hydration flag after initial render
        setIsHydrated(true);

        // Initialize with default log after hydration
        setLogs([
            { timestamp: new Date().toLocaleTimeString(), type: "info", title: "System", message: "Dashboard initialized" },
        ]);

        // Try to connect to WebSocket
        wsManager.connect().catch(() => {
            console.log('WebSocket not available, using polling');
        });

        // Listen for activity events
        const unsubscribe = wsManager.on('activity', (data: ActivityEvent) => {
            setLogs(prev => [data, ...prev.slice(0, 19)]);
        });

        return () => {
            unsubscribe();
        };
    }, []);

    return (
        <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-[0_0_30px_rgba(0,0,0,0.5)] transition-all hover:border-cyan-500/30 flex flex-col h-full group relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-purple-500/50 to-transparent group-hover:via-purple-400 transition-all duration-500" />
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <Activity className="w-5 h-5 text-purple-400" /> Activity Log
                </h2>
                <div className="px-2 py-1 rounded bg-slate-800 border border-white/10 text-[10px] text-slate-400 font-mono">
                    {wsManager.isConnected() ? '🟢 LIVE' : '⚪ OFFLINE'}
                </div>
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto pr-2 custom-scrollbar min-h-0">
                {!isHydrated ? (
                    <div className="flex items-center justify-center h-full text-slate-500">
                        <p>Loading...</p>
                    </div>
                ) : logs.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-slate-500">
                        <p>Waiting for activity...</p>
                    </div>
                ) : (
                    logs.map((log, i) => (
                        <div key={i} className="relative pl-6 pb-3 border-l border-slate-700 last:border-l-0 last:pb-0">
                            <div className={`absolute left-[-5px] top-0 w-2.5 h-2.5 rounded-full border-2 border-slate-900 ${log.type === 'success' ? 'bg-green-500' :
                                log.type === 'warning' ? 'bg-yellow-500' :
                                    log.type === 'error' ? 'bg-red-500' : 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]'
                                }`}></div>

                            <div className="p-2.5 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                                <div className="flex justify-between items-start mb-0.5">
                                    <span className={`text-[11px] font-bold tracking-wider uppercase ${log.type === 'success' ? 'text-green-400' :
                                        log.type === 'warning' ? 'text-yellow-400' :
                                            log.type === 'error' ? 'text-red-400' : 'text-blue-400'
                                        }`}>{log.title}</span>
                                    <span className="text-[9px] text-slate-500 font-mono">{log.timestamp}</span>
                                </div>
                                <p className="text-xs text-slate-300 font-mono leading-relaxed">{log.message}</p>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <div className="mt-4 pt-3 border-t border-white/5">
                <div className="flex items-center gap-2 text-xs text-slate-500 font-mono bg-slate-900/50 p-2 rounded">
                    <Terminal className="w-3 h-3" />
                    <span className="animate-pulse">_</span>
                </div>
            </div>
        </div>
    );
};

export default ActivityLog;
