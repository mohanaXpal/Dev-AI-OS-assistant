
import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import Layout from '@/components/Layout';
import CodeBuddy from '@/components/CodeBuddy';
import CommandHistory from '@/components/CommandHistory';
import TasksControls from '@/components/TasksControls';
import ActivityLog from '@/components/ActivityLog';
import Permissions from '@/components/Permissions';
import PermissionModal from '@/components/PermissionModal';
import { motion, Reorder } from 'framer-motion';

export default function Dashboard() {
    const [showPermissions, setShowPermissions] = useState(false);
    const [isHydrated, setIsHydrated] = useState(false);
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [items, setItems] = useState(['controls', 'activity', 'buddy']);

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
                <Reorder.Group
                    axis="x"
                    values={items}
                    onReorder={setItems}
                    className="grid grid-cols-12 gap-8 pb-10 min-h-full"
                    as="div"
                >
                    {items.map((item) => (
                        <Reorder.Item
                            key={item}
                            value={item}
                            className={`col-span-12 ${item === 'activity' ? 'lg:col-span-6' : 'lg:col-span-3'
                                } reveal`}
                            as="div"
                            dragListener={true}
                        >
                            {/* Drag Handle Overlay (Visible on Hover) */}
                            <div className="absolute top-2 right-2 z-50 opacity-0 hover:opacity-100 cursor-grab active:cursor-grabbing p-1 bg-white/10 rounded backdrop-blur">
                                <span className="text-xs text-white/50">drag</span>
                            </div>

                            {item === 'controls' && (
                                <TasksControls onCommandExecuted={handleRefresh} />
                            )}
                            {item === 'activity' && (
                                <div className="flex flex-col gap-8 h-full">
                                    <div className="flex-1">
                                        <ActivityLog />
                                    </div>
                                    <div className="flex-1">
                                        <CommandHistory refreshTrigger={refreshTrigger} />
                                    </div>
                                </div>
                            )}
                            {item === 'buddy' && (
                                <div className="h-full">
                                    <div className="sticky top-6 h-[calc(100vh-120px)]">
                                        <CodeBuddy onCommandExecuted={handleRefresh} />
                                    </div>
                                </div>
                            )}
                        </Reorder.Item>
                    ))}
                </Reorder.Group>
            )}
        </Layout>
    );
}
