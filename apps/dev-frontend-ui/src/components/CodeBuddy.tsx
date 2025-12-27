import React, { useState } from 'react';
import { Mic, Globe, Cpu, Send } from 'lucide-react';
import { api } from '@/lib/api';

interface CodeBuddyProps {
    onCommandExecuted?: () => void;
}

const CodeBuddy = ({ onCommandExecuted }: CodeBuddyProps) => {
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [lastResponse, setLastResponse] = useState("Everything is running smoothly.");
    const [userName, setUserName] = useState('User');
    const [isMuted, setIsMuted] = useState(false);
    const [isListening, setIsListening] = useState(false);

    const speakResponse = (text: string) => {
        if (!window.speechSynthesis) return;

        // Cancel any ongoing speech
        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 1.0;
        utterance.pitch = 0.9; // Slightly deeper for DEV character

        // Try to find a good English voice
        const voices = window.speechSynthesis.getVoices();
        const preferredVoice = voices.find(v => v.name.includes('Google US English') || v.name.includes('Desktop')) || voices[0];
        if (preferredVoice) utterance.voice = preferredVoice;

        window.speechSynthesis.speak(utterance);
    };

    React.useEffect(() => {
        const name = localStorage.getItem('dev_user_name');
        if (name) setUserName(name);
    }, []);

    const handleSend = async () => {
        if (!input.trim()) return;

        setIsLoading(true);
        try {
            const result = await api.post('/command', { command: input });
            const message = result.data?.response?.text || result.data?.message || "Command processed.";
            setLastResponse(message);
            speakResponse(message);
            if (onCommandExecuted) onCommandExecuted();
        } catch (e: any) {
            setLastResponse(e.response?.data?.message || "Error: System unavailable.");
        } finally {
            setIsLoading(false);
            setInput('');
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !isLoading) handleSend();
    };

    const handleMicrophone = async () => {
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            alert("Voice recognition is not supported in this browser.");
            return;
        }

        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        const recognition = new SpeechRecognition();

        recognition.lang = 'en-US';
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;

        recognition.onstart = () => {
            setIsLoading(true);
            setIsListening(true);
        };

        recognition.onend = () => {
            setIsListening(false);
            // Stay loading? No, depend on result.
        };

        recognition.onerror = (event: any) => {
            console.error("Speech recognition error", event.error);
            setIsLoading(false);
            setIsListening(false);
            setLastResponse("Voice recognition failed. Try typing instead.");
        };

        recognition.onresult = async (event: any) => {
            if (isMuted) return;
            const voiceInput = event.results[0][0].transcript;
            setInput(voiceInput);

            // Automatically send the voice input
            try {
                const result = await api.post('/command', { command: voiceInput });
                const message = result.data?.response?.text || result.data?.message || "Command processed.";
                setLastResponse(message);
                speakResponse(message);
                if (onCommandExecuted) onCommandExecuted();
            } catch (e: any) {
                setLastResponse(e.response?.data?.message || "Error executing command.");
            } finally {
                setIsLoading(false);
                setInput('');
            }
        };

        recognition.start();
    };

    return (
        <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-0.5 relative overflow-hidden group h-full flex flex-col shadow-[0_0_30px_rgba(0,0,0,0.5)] hover:border-cyan-500/30 transition-all">
            <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent group-hover:via-cyan-400 transition-all duration-500" />
            <div className="absolute inset-0 bg-gradient-to-b from-blue-500/10 to-transparent opacity-50 group-hover:opacity-100 transition-opacity" />

            <div className="relative bg-slate-900/40 rounded-xl p-6 flex flex-col h-full border border-white/5 overflow-hidden">
                {/* Status Indicators */}
                <div className="w-full flex justify-between items-start mb-4 shrink-0">
                    <div className="flex gap-2">
                        <div className="px-2 py-1 rounded bg-blue-500/20 border border-blue-500/30 text-[10px] text-blue-300 flex items-center gap-1">
                            <Globe className="w-3 h-3" /> Online
                        </div>
                        <div className={`px-2 py-1 rounded border text-[10px] flex items-center gap-1 ${isMuted ? 'bg-red-500/20 border-red-500/30 text-red-400' : 'bg-green-500/20 border-green-500/30 text-green-400'}`}>
                            <Mic className="w-3 h-3" /> {isMuted ? 'Muted' : 'Listening'}
                        </div>
                        <div className="px-2 py-1 rounded bg-purple-500/20 border border-purple-500/30 text-[10px] text-purple-300 flex items-center gap-1">
                            <Cpu className="w-3 h-3" /> v2.4
                        </div>
                    </div>
                </div>

                {/* Avatar */}
                <div className="relative mb-6 shrink-0 flex flex-col items-center">
                    <div className={`absolute inset-0 bg-blue-500 blur-[40px] opacity-20 ${isLoading ? 'animate-pulse' : ''}`} />
                    <div className="w-32 h-32 rounded-full bg-gradient-to-br from-slate-800 to-slate-900 border-2 border-blue-500/30 flex items-center justify-center relative z-10 shadow-neon-blue animate-float">
                        <div className="text-4xl">🤖</div>
                    </div>
                    <button
                        onClick={async () => {
                            const newMute = !isMuted;
                            setIsMuted(newMute);
                            try {
                                const token = localStorage.getItem('dev_token');
                                await api.post('/command',
                                    { command: newMute ? "mute" : "unmute" },
                                    { headers: { 'Authorization': `Bearer ${token}` } }
                                );
                            } catch (e) {
                                console.error("Failed to sync mic status:", e);
                            }
                        }}
                        className="px-3 py-1 -mt-4 bg-black/60 rounded-full border border-blue-500/50 text-xs font-bold text-blue-400 shadow-neon-blue z-20 backdrop-blur-md hover:bg-blue-600/20 active:scale-95 transition-all cursor-pointer"
                    >
                        DEV
                    </button>
                    <h2 className="text-lg font-medium text-white mt-4">
                        Hello {userName}
                    </h2>
                </div>

                {/* Scrollable Message Area */}
                <div className="flex-1 min-h-0 overflow-y-auto mb-4 pr-2 scrollbar-thin scrollbar-thumb-blue-500/20 scrollbar-track-transparent">
                    <div className="text-slate-400 text-sm whitespace-pre-wrap">
                        {isLoading ? "Processing..." : lastResponse}
                    </div>
                </div>

                {/* Fixed Interaction Area */}
                <div className="w-full shrink-0 pt-4 border-t border-white/5">
                    <div className="relative group/input">
                        <div className="absolute inset-0 bg-blue-500/20 blur-md rounded-xl opacity-0 group-hover/input:opacity-100 transition-opacity" />
                        <div className="relative flex items-center gap-2 bg-slate-800/50 border border-white/10 rounded-xl p-1 pr-2 backdrop-blur-sm focus-within:border-blue-500/50 focus-within:bg-slate-800/80 transition-all">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Type a command..."
                                className="flex-1 bg-transparent border-none outline-none text-sm text-white px-3 py-2 placeholder-slate-500"
                                disabled={isLoading}
                            />

                            <button
                                onClick={handleSend}
                                disabled={isLoading}
                                className="w-8 h-8 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-50 flex items-center justify-center transition-colors shadow-neon-blue"
                                title="Send command"
                            >
                                {isLoading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Send className="w-4 h-4 text-white" />}
                            </button>
                            <button
                                onClick={async () => {
                                    const newMute = !isMuted;
                                    setIsMuted(newMute);
                                    try {
                                        const token = localStorage.getItem('dev_token');
                                        await api.post('/command',
                                            { command: newMute ? "mute microphone" : "unmute microphone" },
                                            { headers: { 'Authorization': `Bearer ${token}` } }
                                        );
                                    } catch (e) {
                                        console.error("Failed to sync mic status:", e);
                                    }
                                }}
                                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${isMuted ? 'bg-red-600 hover:bg-red-500' : 'bg-slate-700/50 hover:bg-slate-600'}`}
                                title={isMuted ? "Unmute Microphone" : "Mute Microphone"}
                            >
                                <Mic className={`w-4 h-4 ${isMuted ? 'text-white' : 'text-slate-400'}`} />
                            </button>
                            <button
                                onClick={handleMicrophone}
                                disabled={isLoading || isMuted}
                                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${isListening ? 'bg-blue-600 animate-pulse' : 'bg-slate-700/50 hover:bg-slate-600'} disabled:opacity-50`}
                                title="Voice Activation"
                            >
                                <div className="text-xs">🎤</div>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Decorative Lines */}
                <div className="absolute top-1/2 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-blue-500/20 to-transparent pointer-events-none" />
                <div className="absolute top-0 left-1/2 h-full w-[1px] bg-gradient-to-b from-transparent via-blue-500/10 to-transparent pointer-events-none" />
            </div>
        </div>
    );
};

export default CodeBuddy;
