
import React, { useState, useEffect } from 'react';
import { Volume2, Wifi, Sun, Command, Play, Power, Lock, Moon } from 'lucide-react';
import { api } from '@/lib/api';
import { wsManager } from '@/lib/websocket';

interface SystemStatus {
    volume: number;
    wifi: { connected: boolean; name: string };
    brightness: number;
    network: string;
}

interface TasksControlsProps {
    onCommandExecuted?: () => void;
}

const TasksControls = ({ onCommandExecuted }: TasksControlsProps) => {
    const [isListening, setIsListening] = React.useState(false);
    const [systemStatus, setSystemStatus] = useState<SystemStatus>({
        volume: 0,
        wifi: { connected: false, name: 'Unknown' },
        brightness: 0,
        network: 'Unknown'
    });
    const [loading, setLoading] = useState(true); const [isHydrated, setIsHydrated] = useState(false);

    useEffect(() => {
        setIsHydrated(true);
        fetchSystemStatus();

        // Listen for status updates from backend
        const unsubscribe = wsManager.on('system_status_update', () => {
            fetchSystemStatus();
        });

        const interval = setInterval(fetchSystemStatus, 10000); // 10s fallback
        return () => {
            clearInterval(interval);
            unsubscribe();
        };
    }, []);

    const fetchSystemStatus = async () => {
        try {
            const response = await api.get('/system/status');
            if (response.data) {
                setSystemStatus({
                    volume: response.data.volume || 0,
                    wifi: response.data.wifi || { connected: false, name: 'Unknown' },
                    brightness: response.data.brightness || 0,
                    network: response.data.network || 'Offline'
                });
            }
            setLoading(false);
        } catch (error) {
            console.error('Failed to fetch system status:', error);
            setLoading(false);
        }
    };

    const handleVoiceCommand = () => {
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            alert("Voice recognition is not supported in this browser.");
            return;
        }

        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        const recognition = new SpeechRecognition();

        recognition.lang = 'en-US';
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;

        recognition.onstart = () => setIsListening(true);
        recognition.onend = () => setIsListening(false);
        recognition.onerror = (event: any) => {
            console.error("Speech recognition error", event.error);
            setIsListening(false);
        };

        recognition.onresult = async (event: any) => {
            const command = event.results[0][0].transcript;
            console.log("Voice Command:", command);

            try {
                const token = localStorage.getItem('dev_token');
                await api.post('/command',
                    { command },
                    { headers: { 'Authorization': `Bearer ${token}` } }
                );
                if (onCommandExecuted) onCommandExecuted(); // Trigger refresh
                fetchSystemStatus(); // Immediate status update
            } catch (err) {
                console.error("Failed to send voice command", err);
            }
        };

        recognition.start();
    };

    const executeQuickAction = async (action: string) => {
        try {
            const token = localStorage.getItem('dev_token');
            const response = await api.post('/command',
                { command: action },
                { headers: { 'Authorization': `Bearer ${token}` } }
            );
            console.log('Action executed:', response.data);
            if (onCommandExecuted) onCommandExecuted();
            fetchSystemStatus();
        } catch (e) {
            console.error('Action failed:', e);
        }
    };

    const executeSystemCommand = async (command: string) => {
        try {
            const response = await api.post('/system/execute', { command });
            console.log('System command executed:', response.data);
            if (onCommandExecuted) onCommandExecuted();
            fetchSystemStatus();
        } catch (e) {
            console.error('System command failed:', e);
        }
    };

    return (
        <div className="flex flex-col gap-6 h-full">
            {/* Quick Actions */}
            <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-[0_0_30px_rgba(0,0,0,0.5)] transition-all hover:border-cyan-500/30 group relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent group-hover:via-cyan-400 transition-all duration-500" />
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Quick Actions</h3>
                    <Command className="w-4 h-4 text-slate-500" />
                </div>
                <div className="space-y-2">
                    {[
                        { label: 'Open Chrome', action: 'Open Chrome' },
                        { label: 'Open VS Code', action: 'Open VS Code' },
                        { label: 'Calculator', action: 'Open Calculator' },
                        { label: 'File Manager', action: 'Open Explorer' }
                    ].map((action, i) => (
                        <button
                            key={i}
                            onClick={() => executeQuickAction(action.action)}
                            className="w-full flex items-center justify-between p-3 rounded-lg bg-slate-800/40 hover:bg-slate-700/50 border border-white/5 group transition-all active:scale-95"
                        >
                            <span className="text-sm text-slate-300 group-hover:text-white">{action.label}</span>
                            <div className="text-slate-500 group-hover:text-blue-400">
                                <Play className="w-3 h-3" />
                            </div>
                        </button>
                    ))}

                    {/* Voice Command Button */}
                    <button
                        onClick={handleVoiceCommand}
                        className={`w-full flex items-center justify-between p-3 rounded-lg border border-white/5 group transition-all ${isListening ? 'bg-red-500/20 border-red-500/50' : 'bg-slate-800/40 hover:bg-slate-700/50'}`}
                    >
                        <span className={`text-sm group-hover:text-white ${isListening ? 'text-red-400 animate-pulse' : 'text-slate-300'}`}>
                            {isListening ? 'Listening...' : 'Voice Command'}
                        </span>
                        <div className={`${isListening ? 'text-red-400' : 'text-slate-500'} group-hover:text-blue-400`}>
                            {isListening ? <Volume2 className="w-3 h-3 animate-ping" /> : <div className="text-xs">🎤</div>}
                        </div>
                    </button>
                </div>
            </div>

            {/* System Controls */}
            <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-[0_0_30px_rgba(0,0,0,0.5)] transition-all hover:border-cyan-500/30 group relative overflow-hidden flex-1 overflow-y-auto">
                <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-blue-500/50 to-transparent group-hover:via-blue-400 transition-all duration-500" />
                <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-5">System Controls</h3>

                {!isHydrated || loading ? (
                    <div className="text-center text-slate-500 py-8">Loading...</div>
                ) : (
                    <div className="space-y-6">
                        {/* Volume */}
                        <div>
                            <div className="flex justify-between items-center text-xs text-slate-400 mb-2">
                                <span className="flex items-center gap-2"><Volume2 className='w-3 h-3' /> Volume</span>
                                <div className="flex gap-2">
                                    <button onClick={() => executeQuickAction('Set Volume Down')} className="hover:text-blue-400 p-1">➖</button>
                                    <button onClick={() => executeQuickAction('Set Volume Up')} className="hover:text-blue-400 p-1">➕</button>
                                </div>
                            </div>
                            <div className="w-full bg-slate-800 rounded-full h-1.5">
                                <div
                                    className="bg-gradient-to-r from-blue-500 to-cyan-400 h-1.5 rounded-full shadow-neon-blue transition-all"
                                    style={{ width: `${systemStatus.volume}%` }}
                                ></div>
                            </div>
                        </div>

                        {/* WiFi */}
                        <div className="flex items-center justify-between pb-4 border-b border-white/5">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded bg-blue-500/20 text-blue-400">
                                    <Wifi className="w-4 h-4" />
                                </div>
                                <div>
                                    <p className="text-sm text-white">
                                        {systemStatus.wifi.connected ? 'Wi-Fi Connected' : 'Wi-Fi Disconnected'}
                                    </p>
                                    <p className="text-xs text-slate-500">{systemStatus.wifi.name}</p>
                                </div>
                            </div>
                            <div className={`w-2 h-2 rounded-full ${systemStatus.wifi.connected ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]' : 'bg-red-500'}`}></div>
                        </div>

                        {/* Brightness */}
                        <div>
                            <div className="flex justify-between items-center text-xs text-slate-400 mb-2">
                                <span className="flex items-center gap-3">
                                    <div className="p-2 rounded bg-yellow-500/20 text-yellow-400">
                                        <Sun className="w-4 h-4" />
                                    </div>
                                    Screen Brightness
                                </span>
                                <div className="flex gap-2">
                                    <button onClick={() => executeQuickAction('Set Brightness 20')} className="hover:text-yellow-400 p-1 text-[10px]">MIN</button>
                                    <button onClick={() => executeQuickAction('Set Brightness 80')} className="hover:text-yellow-400 p-1 text-[10px]">MAX</button>
                                </div>
                            </div>
                            <div className="w-full bg-slate-800 rounded-full h-1.5">
                                <div
                                    className="bg-gradient-to-r from-yellow-500 to-orange-400 h-1.5 rounded-full shadow-neon-yellow transition-all"
                                    style={{ width: `${systemStatus.brightness}%` }}
                                ></div>
                            </div>
                        </div>

                        {/* Network Status */}
                        <div className="p-3 rounded-lg bg-slate-800/30 border border-white/5">
                            <p className="text-xs text-slate-400">Network Status</p>
                            <p className="text-sm text-white mt-1">{systemStatus.network}</p>
                        </div>
                    </div>
                )}

                {/* Power Options */}
                <div className="mt-8 grid grid-cols-3 gap-2">
                    {[
                        { icon: <Lock className="w-4 h-4" />, label: 'Lock', cmd: 'lock' },
                        { icon: <Moon className="w-4 h-4" />, label: 'Sleep', cmd: 'sleep' },
                        { icon: <Power className="w-4 h-4" />, label: 'Shutdown', cmd: 'shutdown' }
                    ].map((opt, i) => (
                        <button
                            key={i}
                            onClick={() => executeSystemCommand(opt.cmd)}
                            className="flex flex-col items-center justify-center gap-2 p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 transition-all group active:scale-95"
                        >
                            <div className="text-slate-400 group-hover:text-orange-400 transition-colors">{opt.icon}</div>
                            <span className="text-[10px] text-slate-500 group-hover:text-slate-300">{opt.label}</span>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default TasksControls;
