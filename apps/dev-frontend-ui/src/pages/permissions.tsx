import React, { useState } from 'react';
import Layout from '../components/Layout';
import { api } from '@/lib/api';
import { Shield, Lock, Eye, Check, AlertTriangle, Terminal, Folder, Mic, Monitor } from 'lucide-react';
import { motion } from 'framer-motion';

const PermissionsPage = () => {
    const [permissions, setPermissions] = useState([
        { id: 'fs', name: 'File System Access', desc: 'Allows AI to read/write project files on your Desktop.', icon: Folder, level: 'High', status: 'granted' },
        { id: 'voice', name: 'Voice Input', desc: 'Use voice commands to interface with JARVIS.', icon: Mic, level: 'Medium', status: 'granted' },
        { id: 'os', name: 'OS Control', desc: 'Volume, brightness, and application management.', icon: Terminal, level: 'Critical', status: 'granted' },
        { id: 'camera', name: 'Vision Interface', desc: 'Optional camera access for facial recognition.', icon: Eye, level: 'Medium', status: 'denied' },
        { id: 'screen', name: 'Screen Capture', desc: 'Allows AI to see your screen for visual debugging.', icon: Monitor, level: 'High', status: 'denied' },
    ]);

    const togglePermission = async (id: string, name: string, currentStatus: string) => {
        const newStatus = currentStatus === 'granted' ? 'denied' : 'granted';
        setPermissions(prev => prev.map(p =>
            p.id === id ? { ...p, status: newStatus } : p
        ));

        // Sync with system level
        try {
            const token = localStorage.getItem('dev_token');
            if (id === 'voice') {
                await api.post('/command',
                    { command: newStatus === 'denied' ? "mute microphone" : "unmute microphone" },
                    { headers: { 'Authorization': `Bearer ${token}` } }
                );
            } else if (id === 'os' && newStatus === 'denied') {
                await api.post('/system/execute', { command: 'lock' });
            }
        } catch (e) {
            console.error(`Failed to sync ${name} permission:`, e);
        }
    };

    return (
        <Layout>
            <div className="max-w-5xl mx-auto space-y-12 pb-20">
                <div className="flex justify-between items-end">
                    <div>
                        <h1 className="text-6xl font-black text-white mb-4 tracking-tighter italic">SECURITY<span className="text-teal-500">.LOG</span></h1>
                        <p className="text-slate-400 text-lg">Manage granular access control and security protocols.</p>
                    </div>
                    <div className="flex items-center gap-3 px-6 py-3 rounded-2xl bg-teal-500/10 border border-teal-500/30">
                        <Shield className="w-5 h-5 text-teal-400" />
                        <span className="text-teal-400 font-bold uppercase tracking-widest text-xs">Encryption: Active</span>
                    </div>
                </div>

                <div className="grid gap-6">
                    {permissions.map((p, idx) => (
                        <motion.div
                            key={p.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className="bg-black/40 backdrop-blur-xl border border-white/10 p-8 rounded-[2rem] flex items-center justify-between group hover:border-white/20 transition-all shadow-[0_0_30px_rgba(0,0,0,0.3)]"
                        >
                            <div className="flex items-center gap-8">
                                <div className={`p-5 rounded-2xl ${p.status === 'granted' ? 'bg-teal-500/10 text-teal-400 border border-teal-500/20' : 'bg-slate-800 text-slate-500'}`}>
                                    <p.icon className="w-8 h-8" />
                                </div>
                                <div className="max-w-md">
                                    <div className="flex items-center gap-3 mb-1">
                                        <h3 className="text-2xl font-bold text-white">{p.name}</h3>
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${p.level === 'Critical' ? 'border-red-500/50 text-red-500 bg-red-500/10' :
                                            p.level === 'High' ? 'border-orange-500/50 text-orange-500 bg-orange-500/10' :
                                                'border-blue-500/50 text-blue-500 bg-blue-500/10'
                                            }`}>
                                            {p.level}
                                        </span>
                                    </div>
                                    <p className="text-slate-500">{p.desc}</p>
                                </div>
                            </div>

                            <button
                                onClick={() => togglePermission(p.id, p.name, p.status)}
                                className={`px-8 py-3 rounded-xl font-bold transition-all flex items-center gap-2 ${p.status === 'granted'
                                    ? 'bg-transparent border border-teal-500/30 text-teal-400 hover:bg-teal-500/10'
                                    : 'bg-white text-black hover:scale-105'
                                    }`}
                            >
                                {p.status === 'granted' ? <><Check className="w-4 h-4" /> Allowed</> : <><Lock className="w-4 h-4" /> Grant Access</>}
                            </button>
                        </motion.div>
                    ))}
                </div>

                {/* Security Audit */}
                <div className="p-10 rounded-[2.5rem] bg-gradient-to-r from-teal-900/20 to-blue-900/20 border border-teal-500/20">
                    <div className="flex items-start gap-6">
                        <AlertTriangle className="w-10 h-10 text-teal-400" />
                        <div>
                            <h3 className="text-2xl font-bold text-white mb-2">Automated Security Audit</h3>
                            <p className="text-slate-400 mb-6">Last audit performed 4 hours ago. system is currently optimized for maximum security and minimal latency.</p>
                            <button className="px-6 py-2 bg-teal-500 text-black font-bold rounded-lg hover:bg-teal-400 transition-colors">
                                Re-run Full Audit
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default PermissionsPage;
