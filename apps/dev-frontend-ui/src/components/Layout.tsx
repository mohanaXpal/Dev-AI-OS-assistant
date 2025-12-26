import React, { ReactNode } from 'react';
import dynamic from 'next/dynamic';
import TopBar from './TopBar';

const SciFiBackground = dynamic(() => import('./SciFiBackground'), { ssr: false });
const FuturisticCore = dynamic(() => import('./FuturisticCore'), { ssr: false });

interface LayoutProps {
    children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
    return (
        <div className="min-h-screen bg-[#050505] text-white selection:bg-cyan-500/30 font-sans leading-relaxed overflow-x-hidden">
            <FuturisticCore />
            <SciFiBackground />

            {/* Scanline Overlay */}
            <div className="fixed inset-0 pointer-events-none z-50 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.03),rgba(0,255,0,0.01),rgba(0,0,255,0.03))] bg-[length:100%_4px,3px_100%] opacity-10" />

            <div className="fixed inset-0 pointer-events-none bg-cyber-grid opacity-20 z-0"></div>
            <TopBar />
            <main className="relative z-10 p-6 max-w-[2200px] mx-auto min-h-[calc(100vh-80px)]">
                {children}
            </main>
        </div>
    );
};

export default Layout;
