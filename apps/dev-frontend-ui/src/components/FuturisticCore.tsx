import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';

const FuturisticCore = () => {
    const canvasContainerRef = useRef<HTMLDivElement>(null);
    const coreRef = useRef<THREE.Mesh>();

    useEffect(() => {
        if (!canvasContainerRef.current) return;

        const width = canvasContainerRef.current.clientWidth;
        const height = canvasContainerRef.current.clientHeight;

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
        camera.position.z = 5;

        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(width, height);
        renderer.setPixelRatio(window.devicePixelRatio);
        canvasContainerRef.current.appendChild(renderer.domElement);

        // Core Sphere
        const geometry = new THREE.SphereGeometry(1, 64, 64);
        const material = new THREE.MeshStandardMaterial({
            color: 0x06b6d4,
            roughness: 0.1,
            metalness: 0.8,
            emissive: 0x0891b2,
            emissiveIntensity: 1.5,
            transparent: true,
            opacity: 0.9,
        });
        const core = new THREE.Mesh(geometry, material);
        coreRef.current = core;
        scene.add(core);

        // Orbits
        const ring1 = new THREE.Mesh(
            new THREE.TorusGeometry(1.6, 0.02, 16, 100),
            new THREE.MeshStandardMaterial({ color: 0x22d3ee, emissive: 0x22d3ee, emissiveIntensity: 5 })
        );
        ring1.rotation.x = Math.PI / 2;
        scene.add(ring1);

        const ring2 = new THREE.Mesh(
            new THREE.TorusGeometry(1.9, 0.01, 16, 100),
            new THREE.MeshStandardMaterial({ color: 0x818cf8, emissive: 0x818cf8, emissiveIntensity: 3 })
        );
        ring2.rotation.y = Math.PI / 2;
        scene.add(ring2);

        // Lighting
        scene.add(new THREE.AmbientLight(0xffffff, 0.4));
        const pointLight1 = new THREE.PointLight(0x06b6d4, 1.5);
        pointLight1.position.set(10, 10, 10);
        scene.add(pointLight1);

        let frameId: number;
        const animate = () => {
            frameId = requestAnimationFrame(animate);
            const t = performance.now() * 0.001;
            if (coreRef.current) {
                coreRef.current.rotation.y = t * 0.2;
                coreRef.current.rotation.x = t * 0.1;
                const s = 1 + Math.sin(t * 2) * 0.05;
                coreRef.current.scale.set(s, s, s);
            }
            ring1.rotation.z = t * 0.5;
            ring2.rotation.y = -t * 0.3;
            renderer.render(scene, camera);
        };
        animate();

        const handleResize = () => {
            if (!canvasContainerRef.current) return;
            const w = canvasContainerRef.current.clientWidth;
            const h = canvasContainerRef.current.clientHeight;
            camera.aspect = w / h;
            camera.updateProjectionMatrix();
            renderer.setSize(w, h);
        };
        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            cancelAnimationFrame(frameId);
            renderer.dispose();
            if (canvasContainerRef.current) canvasContainerRef.current.innerHTML = '';
        };
    }, []);

    return (
        <div
            ref={canvasContainerRef}
            className="fixed inset-0 z-0 opacity-40 pointer-events-none"
        />
    );
};

export default FuturisticCore;
