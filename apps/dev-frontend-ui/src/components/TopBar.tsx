import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { LayoutDashboard, Shield, Plug, User, Bell, X, Info, CheckCircle2, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const TopBar = () => {
    const router = useRouter();
    const [showNotifications, setShowNotifications] = useState(false);
    const [userData, setUserData] = useState({ name: 'User', avatar: '', token: '' });

    const [notifications, setNotifications] = useState([
        { id: 1, type: 'info', title: 'Security Patch', message: 'Kernel v1.0.4 is now active.', time: 'Just now' },
        { id: 2, type: 'permission', title: 'File Access', message: 'Requesting write access to Desktop.', time: '2m ago' }
    ]);

    const removeNotification = (id: number) => {
        setNotifications(notifications.filter(n => n.id !== id));
    };

    const clearAllNotifications = () => {
        setNotifications([]);
    };

    React.useEffect(() => {
        const name = localStorage.getItem('dev_user_name') || 'User';
        const avatar = localStorage.getItem('dev_user_avatar') || '';
        const token = localStorage.getItem('dev_token') || '';

        // Generate random avatar if none exists
        const fallbackAvatar = `https://api.dicebear.com/7.x/bottts-neutral/svg?seed=${encodeURIComponent(name)}`;

        setUserData({
            name,
            avatar: avatar || fallbackAvatar,
            token
        });
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('dev_token');
        localStorage.removeItem('dev_user_name');
        localStorage.removeItem('dev_user_avatar');
        router.push('/');
    };

    return (
        <div className="w-full h-16 glass-panel border-b border-white/10 flex items-center justify-between px-6 sticky top-0 z-50">
            {/* Logo */}
            <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shadow-neon-blue">
                    <Shield className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-xl font-bold tracking-wide text-white text-glow uppercase">
                    DEV.<span className="text-blue-400 font-light">OS</span>
                </h1>
            </div>

            {/* Navigation */}
            <div className="flex items-center gap-1 bg-slate-900/50 p-1 rounded-xl border border-white/5">
                <Link href="/dashboard" className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${router.pathname === '/dashboard' ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30' : 'hover:bg-white/5 text-slate-400'}`}>
                    <LayoutDashboard className="w-4 h-4" />
                    <span className="text-sm font-medium">Dashboard</span>
                </Link>
                <Link href="/permissions" className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${router.pathname === '/permissions' ? 'bg-teal-600/20 text-teal-400 border border-teal-500/30' : 'hover:bg-white/5 text-slate-400'}`}>
                    <Shield className="w-4 h-4" />
                    <span className="text-sm font-medium">Permissions</span>
                </Link>
                <Link href="/plugins" className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${router.pathname === '/plugins' ? 'bg-cyan-600/20 text-cyan-400 border border-cyan-500/30' : 'hover:bg-white/5 text-slate-400'}`}>
                    <Plug className="w-4 h-4" />
                    <span className="text-sm font-medium">Plugins</span>
                </Link>
            </div>

            {/* User Actions */}
            <div className="flex items-center gap-4">
                <div className="relative">
                    <button
                        onClick={() => setShowNotifications(!showNotifications)}
                        className={`p-2 rounded-lg transition-colors relative ${showNotifications ? 'bg-blue-600 text-white shadow-neon-blue' : 'hover:bg-white/5 text-slate-400 hover:text-white'}`}
                    >
                        <Bell className="w-5 h-5" />
                        {notifications.length > 0 && (
                            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border border-black animate-pulse"></span>
                        )}
                    </button>

                    <AnimatePresence>
                        {showNotifications && (
                            <motion.div
                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                className="absolute top-full right-0 mt-4 w-80 bg-black/90 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden z-50"
                            >
                                <div className="p-4 border-b border-white/5 flex justify-between items-center bg-white/5">
                                    <h3 className="text-sm font-bold text-white uppercase tracking-widest">Alert Center</h3>
                                    <X className="w-4 h-4 text-slate-500 cursor-pointer hover:text-white" onClick={() => setShowNotifications(false)} />
                                </div>
                                <div className="max-h-96 overflow-y-auto custom-scrollbar">
                                    {notifications.map(n => (
                                        <div key={n.id} className="p-4 border-b border-white/5 hover:bg-white/[0.02] transition-colors cursor-pointer group">
                                            <div className="flex gap-3">
                                                <div className={`mt-1 p-1.5 rounded-lg ${n.type === 'info' ? 'bg-blue-500/10 text-blue-400' : 'bg-amber-500/10 text-amber-400'}`}>
                                                    {n.type === 'info' ? <Info className="w-3.5 h-3.5" /> : <Shield className="w-3.5 h-3.5" />}
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex justify-between items-start mb-1">
                                                        <p className="text-sm font-bold text-white">{n.title}</p>
                                                        <span className="text-[10px] text-slate-500 font-mono italic">{n.time}</span>
                                                    </div>
                                                    <p className="text-xs text-slate-400 leading-relaxed">{n.message}</p>
                                                    {n.type === 'permission' && (
                                                        <div className="flex gap-2 mt-3">
                                                            <button
                                                                onClick={(e) => { e.stopPropagation(); removeNotification(n.id); }}
                                                                className="flex-1 py-1 px-3 bg-blue-600 text-white text-[10px] font-bold rounded-md hover:bg-blue-500 transition-colors"
                                                            >
                                                                Grant
                                                            </button>
                                                            <button
                                                                onClick={(e) => { e.stopPropagation(); removeNotification(n.id); }}
                                                                className="flex-1 py-1 px-3 bg-white/5 text-slate-400 text-[10px] font-bold rounded-md hover:bg-white/10 transition-colors border border-white/10"
                                                            >
                                                                Deny
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="p-3 text-center bg-white/[0.02]">
                                    <p
                                        onClick={clearAllNotifications}
                                        className="text-[10px] text-slate-600 font-bold uppercase tracking-widest hover:text-slate-400 cursor-pointer transition-colors"
                                    >
                                        Clear All Alerts
                                    </p>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
                <button
                    onClick={handleLogout}
                    className="p-2 rounded-lg hover:bg-red-500/10 text-slate-400 hover:text-red-400 transition-colors group"
                    title="Logout"
                >
                    <LogOut className="w-5 h-5" />
                </button>
                <div className="flex items-center gap-3 pl-4 border-l border-white/10">
                    <div className="text-right hidden sm:block">
                        <p className="text-sm font-medium text-white">{userData.name}</p>
                        <p className="text-xs text-blue-400">Owner</p>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-purple-600 p-[2px]">
                        <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center overflow-hidden">
                            {userData.avatar ? (
                                <img src={userData.avatar} alt="User Avatar" className="w-full h-full object-cover" />
                            ) : (
                                <User className="w-5 h-5 text-slate-300" />
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TopBar;
