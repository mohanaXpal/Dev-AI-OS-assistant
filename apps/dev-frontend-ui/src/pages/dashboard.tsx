
import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import Layout from '@/components/Layout';
import CodeBuddy from '@/components/CodeBuddy';
import CommandHistory from '@/components/CommandHistory';
import TasksControls from '@/components/TasksControls';
import ActivityLog from '@/components/ActivityLog';
import Permissions from '@/components/Permissions';
import PermissionModal from '@/components/PermissionModal';
import { motion } from 'framer-motion';

export default function Dashboard() {
    const [showPermissions, setShowPermissions] = useState(false);
    const [isHydrated, setIsHydrated] = useState(false);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const handleRefresh = () => setRefreshTrigger(prev => prev + 1);

    // Check for Auth Token on Load
    React.useEffect(() => {
        setIsHydrated(true);

        const params = new URLSearchParams(window.location.search);
        const token = params.get('token');
        const name = params.get('name');

        if (token) {
            localStorage.setItem('dev_token', token);
            if (name) localStorage.setItem('dev_user_name', name);

            // Clean URL (Remove query params so it looks clean: /dashboard)
            window.history.replaceState({}, document.title, window.location.pathname);

            // Trigger Permissions Request if new login (roughly)
            // For now, simple check:
            if (!localStorage.getItem('perm_mic')) {
                setShowPermissions(true);
            }
        }
    }, []);

    return (
        <Layout>
            <PermissionModal isOpen={showPermissions} onComplete={() => setShowPermissions(false)} />
            {isHydrated && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8, ease: "circOut" }}
                    className="grid grid-cols-12 gap-8 pb-10 min-h-full"
                >

                    {/* Column 1 (Left): Quick Actions & System Controls */}
                    <div className="col-span-12 lg:col-span-3 reveal">
                        <TasksControls onCommandExecuted={handleRefresh} />
                    </div>

                    {/* Column 2 (Center): Activity Log & Command History */}
                    <div className="col-span-12 lg:col-span-6 flex flex-col gap-8 reveal">
                        <div className="flex-1">
                            <ActivityLog />
                        </div>
                        <div className="flex-1">
                            <CommandHistory refreshTrigger={refreshTrigger} />
                        </div>
                    </div>

                    {/* Column 3 (Right): Code Buddy (AI Sidebar) */}
                    <div className="col-span-12 lg:col-span-3 reveal h-full">
                        <div className="sticky top-6 h-[calc(100vh-120px)]">
                            <CodeBuddy onCommandExecuted={handleRefresh} />
                        </div>
                    </div>

                </motion.div>
            )}
        </Layout>
    );
}
