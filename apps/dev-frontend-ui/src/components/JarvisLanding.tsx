import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { motion } from 'framer-motion';
import {
    Terminal,
    Shield,
    Zap,
    Github,
    Mail,
    Globe,
    ChevronRight,
    MessageSquare,
    Cpu,
    Workflow
} from 'lucide-react';
import dynamic from 'next/dynamic';

const ThreeScene = dynamic(() => import('./ThreeScene'), { ssr: false });

interface JarvisLandingProps {
    onInitialize: () => void;
}

const JarvisLanding: React.FC<JarvisLandingProps> = ({ onInitialize }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const textRef = useRef<HTMLHeadingElement>(null);
    const orbital1Ref = useRef<HTMLDivElement>(null);
    const orbital2Ref = useRef<HTMLDivElement>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        const tl = gsap.timeline();
        gsap.set([orbital1Ref.current, orbital2Ref.current], { scale: 0.8, opacity: 0, rotation: 0 });
        gsap.set(textRef.current, { y: 50, opacity: 0 });
        gsap.set(buttonRef.current, { y: 20, opacity: 0 });

        tl.to([orbital1Ref.current, orbital2Ref.current], { duration: 2, scale: 1, opacity: 0.6, stagger: 0.2, ease: 'power3.out' })
            .to(textRef.current, { duration: 1, y: 0, opacity: 1, ease: 'power4.out' }, "-=1.5")
            .to(buttonRef.current, { duration: 0.8, y: 0, opacity: 1, ease: 'back.out(1.7)' }, "-=0.5");

        gsap.to(orbital1Ref.current, { rotation: 360, duration: 20, repeat: -1, ease: 'none' });
        gsap.to(orbital2Ref.current, { rotation: -360, duration: 25, repeat: -1, ease: 'none' });
    }, []);

    const handleInitialize = () => {
        gsap.to(containerRef.current, {
            opacity: 0,
            duration: 1,
            ease: 'power2.in',
            onComplete: () => {
                window.location.href = '/api/auth/google';
            }
        });
        gsap.to([orbital1Ref.current, orbital2Ref.current], { scale: 5, opacity: 0, duration: 1.5, ease: 'power2.in' });
    };

    const features = [
        { icon: Terminal, title: "Neural Shell", desc: "Execute complex OS commands with simple natural language." },
        { icon: Shield, title: "Secure Vault", desc: "Biometric and OAuth2 protection for all system protocols." },
        { icon: Zap, title: "Zero Latency", desc: "Real-time sync between your brain and your machine." },
        { icon: Cpu, title: "AI Core", desc: "Gemini-powered reasoning for code and workflow optimization." }
    ];

    return (
        <div ref={containerRef} className="min-h-screen w-screen bg-[#020202] text-white flex flex-col items-center justify-start relative overflow-x-hidden font-sans">

            <div className="fixed inset-0 z-0 pointer-events-none opacity-40">
                <ThreeScene />
            </div>

            <div className="mt-10 flex items-center gap-2 px-4 py-2 rounded-full border border-teal-500/30 bg-teal-900/10 backdrop-blur-sm z-30">
                <div className="w-2 h-2 rounded-full bg-teal-400 animate-pulse shadow-[0_0_10px_#2dd4bf]"></div>
                <span className="text-teal-400 text-[10px] font-mono tracking-widest uppercase">Kernel Version: 1.0.4 - STABLE</span>
            </div>

            <section className="h-screen flex flex-col items-center justify-center relative z-20 px-6">
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none -translate-y-20">
                    <div ref={orbital1Ref} className="w-[600px] h-[600px] rounded-full border border-teal-500/20 shadow-[0_0_50px_rgba(45,212,191,0.1)] absolute"></div>
                    <div ref={orbital2Ref} className="w-[450px] h-[750px] rounded-[100%] border border-white/10 absolute transform rotate-12"></div>
                </div>

                <div className="text-center">
                    <h1 ref={textRef} className="text-8xl md:text-[12rem] font-black text-white tracking-tighter mb-4 drop-shadow-[0_0_30px_rgba(255,255,255,0.2)]">
                        DEV<span className="text-teal-500">.OS</span>
                    </h1>
                    <p className="text-slate-300 text-xl tracking-[0.2em] uppercase font-light mb-12 max-w-2xl mx-auto leading-relaxed">
                        The definitive neural interface for <span className="text-teal-400 font-medium">autonomous development.</span>
                    </p>

                    <div className="flex justify-center gap-6">
                        <button
                            ref={buttonRef}
                            onClick={handleInitialize}
                            className="group relative px-10 py-5 bg-white text-black rounded-full font-bold text-xl tracking-tight hover:scale-105 transition-all duration-300 shadow-[0_0_50px_rgba(255,255,255,0.4)] hover:shadow-[0_0_80px_rgba(255,255,255,0.6)]"
                        >
                            <span className="flex items-center gap-2">Initialize Core <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" /></span>
                        </button>
                        <button className="px-10 py-5 border border-white/20 text-white rounded-full font-semibold hover:bg-white/5 transition-colors backdrop-blur-md">
                            Documentation
                        </button>
                    </div>
                </div>
            </section>

            <section className="relative z-20 py-32 px-6 max-w-7xl mx-auto w-full">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {features.map((f, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 50 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, delay: i * 0.1 }}
                            className="group p-8 rounded-3xl bg-white/[0.03] border border-white/10 hover:border-teal-500/50 transition-all duration-500 hover:bg-white/[0.05]"
                        >
                            <f.icon className="w-10 h-10 text-teal-400 mb-6 group-hover:scale-110 transition-transform duration-500" />
                            <h3 className="text-2xl font-bold mb-3">{f.title}</h3>
                            <p className="text-slate-400 leading-relaxed">{f.desc}</p>
                        </motion.div>
                    ))}
                </div>
            </section>

            <section className="relative z-20 py-32 px-6 w-full bg-gradient-to-b from-transparent to-teal-500/5">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-5xl font-black mb-8 italic tracking-tight uppercase">Stay Synced.</h2>
                    <div className="flex flex-wrap justify-center gap-10">
                        <div className="flex items-center gap-3 text-slate-400 hover:text-white transition-colors cursor-pointer">
                            <Shield className="w-5 h-5" /> <span>Enterprise Security</span>
                        </div>
                        <div className="flex items-center gap-3 text-slate-400 hover:text-white transition-colors cursor-pointer">
                            <Workflow className="w-5 h-5" /> <span>Automated Flows</span>
                        </div>
                        <div className="flex items-center gap-3 text-slate-400 hover:text-white transition-colors cursor-pointer">
                            <MessageSquare className="w-5 h-5" /> <span>24/7 Support</span>
                        </div>
                    </div>
                </div>
            </section>

            <footer className="relative z-20 py-20 px-6 w-full border-t border-white/5 bg-black">
                <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
                    <div className="col-span-1 md:col-span-2">
                        <h2 className="text-3xl font-black mb-4">DEV<span className="text-teal-500">.OS</span></h2>
                        <p className="text-slate-500 max-w-sm mb-8">
                            Building the future of human-computer interaction through neural automation and autonomous system management.
                        </p>
                        <div className="flex gap-4">
                            <div className="p-3 rounded-full bg-slate-900 border border-white/5 hover:border-teal-500/50 transition-colors cursor-pointer text-slate-400 hover:text-white">
                                <Github className="w-5 h-5" />
                            </div>
                            <div className="p-3 rounded-full bg-slate-900 border border-white/5 hover:border-teal-500/50 transition-colors cursor-pointer text-slate-400 hover:text-white">
                                <Globe className="w-5 h-5" />
                            </div>
                            <div className="p-3 rounded-full bg-slate-900 border border-white/5 hover:border-teal-500/50 transition-colors cursor-pointer text-slate-400 hover:text-white">
                                <Mail className="w-5 h-5" />
                            </div>
                        </div>
                    </div>
                    <div>
                        <h4 className="text-sm font-bold uppercase tracking-widest text-slate-500 mb-6 font-mono">Support</h4>
                        <ul className="space-y-4 text-slate-400">
                            <li className="hover:text-teal-400 cursor-pointer transition-colors">Documentation</li>
                            <li className="hover:text-teal-400 cursor-pointer transition-colors">API Status</li>
                            <li className="hover:text-teal-400 cursor-pointer transition-colors">Security Protocols</li>
                            <li className="hover:text-teal-400 cursor-pointer transition-colors">Contact Us</li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="text-sm font-bold uppercase tracking-widest text-slate-500 mb-6 font-mono">System</h4>
                        <ul className="space-y-4 text-slate-400">
                            <li className="hover:text-teal-400 cursor-pointer transition-colors">Neural Engine</li>
                            <li className="hover:text-teal-400 cursor-pointer transition-colors">Cluster Sync</li>
                            <li className="hover:text-teal-400 cursor-pointer transition-colors">Privacy Policy</li>
                            <li className="hover:text-teal-400 cursor-pointer transition-colors">Terms of Service</li>
                        </ul>
                    </div>
                </div>
                <div className="max-w-7xl mx-auto mt-20 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] text-slate-600 font-mono tracking-widest">
                    <p>© 2025 DEV.OS NEURAL SYSTEMS. ALL RIGHTS RESERVED.</p>
                    <p>POWERED BY GEMINI PRO & THREE.JS</p>
                </div>
            </footer>

            <div className="fixed inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px] pointer-events-none"></div>
        </div>
    );
};

export default JarvisLanding;
