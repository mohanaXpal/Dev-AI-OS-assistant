
import React, { useState, useEffect } from 'react';
import { Search, Clock, FileText, ChevronRight } from 'lucide-react';
import { api } from '@/lib/api';

interface CommandItem {
    id: string;
    title: string;
    sub: string;
    timestamp: string;
}

interface CommandHistoryProps {
    refreshTrigger?: number;
}

const CommandHistory = ({ refreshTrigger = 0 }: CommandHistoryProps) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [commands, setCommands] = useState<CommandItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [isHydrated, setIsHydrated] = useState(false);
    const [showAll, setShowAll] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(false);

    useEffect(() => {
        setIsHydrated(true);
        fetchCommandHistory();
        // Poll for updates every 2 seconds (faster for realtime feel)
        const interval = setInterval(fetchCommandHistory, 2000);
        return () => clearInterval(interval);
    }, [refreshTrigger]); // Re-fetch when trigger changes

    const fetchCommandHistory = async () => {
        try {
            const response = await api.get('/history');
            if (response.data && response.data.commands) {
                setCommands(response.data.commands.map((cmd: any) => ({
                    id: cmd.id || Math.random(),
                    title: cmd.command || 'Unknown Command',
                    sub: cmd.intent || 'Command executed',
                    timestamp: cmd.timestamp || new Date().toLocaleTimeString()
                })));
            }
            setLoading(false);
        } catch (error) {
            console.error('Failed to fetch command history:', error);
            setLoading(false);
        }
    };

    const handleClearHistory = async () => {
        if (!confirm('Are you sure you want to clear your command history?')) return;
        try {
            await api.delete('/history');
            fetchCommandHistory();
        } catch (error) {
            console.error('Failed to clear history:', error);
        }
    };

    const filteredCommands = commands.filter(cmd =>
        cmd.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cmd.sub.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const todayCommands = showAll ? filteredCommands.slice(0, 20) : filteredCommands.slice(0, 4);

    return (
        <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-[0_0_30px_rgba(0,0,0,0.5)] transition-all hover:border-cyan-500/30 flex flex-col h-full group relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-blue-500/50 to-transparent group-hover:via-blue-400 transition-all duration-500" />
            {/* Header & Search */}
            <div className="flex justify-between items-center mb-4 cursor-pointer" onClick={() => setIsCollapsed(!isCollapsed)}>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <Clock className={`w-5 h-5 text-blue-400 transition-transform ${isCollapsed ? '-rotate-90' : ''}`} /> Command History
                </h2>
            </div>

            <div className={`flex-1 flex flex-col transition-all duration-300 overflow-hidden ${isCollapsed ? 'max-h-0 opacity-0' : 'max-h-[1000px] opacity-100'}`}>
                <div className="relative mb-6">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                        type="text"
                        placeholder="Search history..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-slate-900/50 border border-white/10 rounded-lg py-2.5 pl-9 pr-4 text-sm text-slate-300 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 placeholder-slate-600"
                    />
                </div>

                {/* History List */}
                <div className="flex-1 overflow-y-auto pr-2 space-y-4 custom-scrollbar min-h-0">
                    {!isHydrated || loading ? (
                        <div className="flex items-center justify-center h-full text-slate-500">
                            <p>Loading history...</p>
                        </div>
                    ) : todayCommands.length === 0 ? (
                        <div className="text-center text-slate-500 py-8">
                            <p className="text-sm">No commands yet</p>
                        </div>
                    ) : (
                        <>
                            <div>
                                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 pl-1">Recent</h3>
                                <div className="space-y-2">
                                    {todayCommands.map((item) => (
                                        <div key={item.id} className="group p-3 rounded-xl bg-slate-800/30 hover:bg-slate-700/50 border border-white/5 cursor-pointer transition-all flex items-center justify-between">
                                            <div className="flex items-center gap-3 flex-1 min-w-0">
                                                <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 group-hover:text-blue-300 group-hover:shadow-[0_0_10px_rgba(59,130,246,0.3)] transition-all flex-shrink-0 border border-blue-500/20">
                                                    <FileText className="w-4 h-4" />
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <p className="text-sm font-medium text-slate-200 group-hover:text-white truncate">{item.title}</p>
                                                    <p className="text-[10px] text-slate-500">{item.sub}</p>
                                                </div>
                                            </div>
                                            <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-blue-400 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0 flex-shrink-0" />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Stats */}
                            <div className="grid grid-cols-2 gap-3 mt-4">
                                <div className="p-3 rounded-xl bg-slate-800/30 border border-white/5 hover:border-blue-500/30 transition-colors">
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="text-xs text-slate-400">Total Commands</span>
                                        <span className="text-[10px] bg-slate-700 px-1.5 py-0.5 rounded text-slate-300">{commands.length}</span>
                                    </div>
                                    <div className="h-1 w-full bg-slate-700 rounded-full overflow-hidden">
                                        <div className="h-full bg-blue-500 w-[60%]"></div>
                                    </div>
                                </div>
                                <div className="p-3 rounded-xl bg-slate-800/30 border border-white/5 hover:border-orange-500/30 transition-colors">
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="text-xs text-slate-400">Today</span>
                                        <span className="text-[10px] bg-slate-700 px-1.5 py-0.5 rounded text-slate-300">{todayCommands.length}</span>
                                    </div>
                                    <div className="h-1 w-full bg-slate-700 rounded-full overflow-hidden">
                                        <div className="h-full bg-orange-500 w-[40%]"></div>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </div>

                <div className="mt-4 pt-4 border-t border-white/5 flex gap-2">
                    <button
                        onClick={handleClearHistory}
                        className="flex-1 py-2 rounded-lg bg-slate-800 hover:bg-red-900/20 hover:text-red-400 hover:border-red-500/30 text-xs text-slate-300 transition-all border border-white/5"
                    >
                        Clear History
                    </button>
                    <button
                        onClick={() => setShowAll(!showAll)}
                        className={`flex-1 py-2 rounded-lg text-xs transition-all border ${showAll
                            ? 'bg-blue-600 text-white border-blue-500 shadow-neon-blue'
                            : 'bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border-blue-500/20'
                            }`}
                    >
                        {showAll ? 'Show Fewer' : 'View All'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CommandHistory;
