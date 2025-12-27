import React, { useState, useEffect, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Sphere, MeshDistortMaterial, Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';

const SnowParticles = () => {
    const pointsRef = useRef<THREE.Points>(null);
    const [points] = useState(() => {
        const p = new Float32Array(3000 * 3);
        for (let i = 0; i < 3000; i++) {
            p[i * 3] = (Math.random() - 0.5) * 20;
            p[i * 3 + 1] = (Math.random() - 0.5) * 20;
            p[i * 3 + 2] = (Math.random() - 0.5) * 20;
        }
        return p;
    });

    useFrame((state, delta) => {
        if (pointsRef.current) {
            pointsRef.current.rotation.y += delta * 0.05;
            pointsRef.current.position.y -= delta * 0.2;
            if (pointsRef.current.position.y < -5) pointsRef.current.position.y = 5;
        }
    });

    return (
        <Points ref={pointsRef} positions={points} stride={3}>
            <PointMaterial
                transparent
                color="#ffffff"
                size={0.05}
                sizeAttenuation={true}
                depthWrite={false}
                opacity={0.4}
            />
        </Points>
    );
};

const NeuralOrb = () => {
    const groupRef = useRef<THREE.Group>(null);

    useFrame((state) => {
        if (groupRef.current) {
            groupRef.current.rotation.y = state.mouse.x * 0.5;
            groupRef.current.rotation.x = -state.mouse.y * 0.5;
        }
    });

    return (
        <group ref={groupRef}>
            {/* Core */}
            <Float speed={3} rotationIntensity={2} floatIntensity={2}>
                <Sphere args={[1, 100, 100]} scale={1.5}>
                    <MeshDistortMaterial
                        color="#2dd4bf"
                        attach="material"
                        distort={0.5}
                        speed={2}
                        roughness={0.1}
                        metalness={1}
                        emissive="#0d9488"
                        emissiveIntensity={1}
                    />
                </Sphere>
            </Float>

            {/* Orbiting Rings */}
            {[0, 1, 2].map((i) => (
                <Float key={i} speed={2} rotationIntensity={5}>
                    <mesh rotation={[Math.random() * Math.PI, Math.random() * Math.PI, 0]}>
                        <torusGeometry args={[2.5 + i * 0.8, 0.02, 16, 100]} />
                        <meshStandardMaterial color="#2dd4bf" emissive="#2dd4bf" emissiveIntensity={2} transparent opacity={0.3} />
                    </mesh>
                </Float>
            ))}

            {/* Glowing Dust */}
            <Points positions={new Float32Array(Array.from({ length: 300 }, () => (Math.random() - 0.5) * 10))}>
                <PointMaterial transparent color="#2dd4bf" size={0.08} sizeAttenuation depthWrite={false} opacity={0.6} />
            </Points>
        </group>
    );
};

const ThreeScene = () => {
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    if (!isMounted) return <div className="fixed inset-0 bg-[#020202]" />;

    return (
        <Canvas camera={{ position: [0, 0, 8], fov: 45 }}>
            <color attach="background" args={['#020202']} />
            <fog attach="fog" args={['#020202', 5, 20]} />
            <ambientLight intensity={0.2} />
            <pointLight position={[10, 10, 10]} intensity={2} color="#2dd4bf" />
            <pointLight position={[-10, -10, -10]} intensity={1} color="#ffffff" />

            <SnowParticles />
            <NeuralOrb />
        </Canvas>
    );
};

export default ThreeScene;
