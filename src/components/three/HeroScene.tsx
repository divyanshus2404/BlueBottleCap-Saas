"use client";

/**
 * HeroScene — the 3D centerpiece of the landing page.
 *
 * A liquid-glass orb (the "bottle cap") suspended inside two slowly
 * precessing rings, floating over a field of drifting particles.
 * The whole rig eases toward the cursor for a subtle parallax.
 *
 * Rendered inside a dark section, lit with the brand blue so the
 * refraction reads as "ink in glass". Kept deliberately low-poly and
 * single-canvas so it stays 60fps on mid-range laptops.
 */

import React, { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, MeshDistortMaterial, Environment } from "@react-three/drei";
import * as THREE from "three";

function GlassOrb() {
  const mesh = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (!mesh.current) return;
    mesh.current.rotation.y = state.clock.elapsedTime * 0.12;
  });
  return (
    <Float speed={1.4} rotationIntensity={0.4} floatIntensity={1.2}>
      <mesh ref={mesh}>
        <icosahedronGeometry args={[0.95, 24]} />
        <MeshDistortMaterial
          color="#1B3FCB"
          roughness={0.08}
          metalness={0.1}
          distort={0.32}
          speed={1.6}
          envMapIntensity={1.4}
        />
      </mesh>
    </Float>
  );
}

function Ring({ radius, tilt, speed, opacity }: { radius: number; tilt: number; speed: number; opacity: number }) {
  const group = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (!group.current) return;
    group.current.rotation.z = state.clock.elapsedTime * speed;
  });
  return (
    <group ref={group} rotation={[tilt, 0.4, 0]}>
      <mesh>
        <torusGeometry args={[radius, 0.012, 16, 128]} />
        <meshStandardMaterial color="#8DA4FF" transparent opacity={opacity} metalness={0.9} roughness={0.2} />
      </mesh>
    </group>
  );
}

function Particles({ count = 350 }: { count?: number }) {
  const points = useRef<THREE.Points>(null);
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const r = 3.2 + Math.random() * 4.5;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      arr[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      arr[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      arr[i * 3 + 2] = r * Math.cos(phi);
    }
    return arr;
  }, [count]);

  useFrame((state) => {
    if (!points.current) return;
    points.current.rotation.y = state.clock.elapsedTime * 0.02;
  });

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.02} color="#6B8AFF" transparent opacity={0.55} sizeAttenuation depthWrite={false} />
    </points>
  );
}

/** Eases the whole rig toward the pointer for parallax. */
function ParallaxRig({ children }: { children: React.ReactNode }) {
  const group = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (!group.current) return;
    const x = state.pointer.x * 0.25;
    const y = state.pointer.y * 0.18;
    group.current.rotation.y = THREE.MathUtils.lerp(group.current.rotation.y, x, 0.04);
    group.current.rotation.x = THREE.MathUtils.lerp(group.current.rotation.x, -y, 0.04);
  });
  return <group ref={group} position={[0, -0.55, -1.2]}>{children}</group>;
}

export default function HeroScene({ reducedMotion = false }: { reducedMotion?: boolean }) {
  return (
    <Canvas
      dpr={[1, 2]}
      camera={{ position: [0, 0, 7], fov: 42 }}
      gl={{ antialias: true, alpha: true }}
      frameloop={reducedMotion ? "demand" : "always"}
      style={{ background: "transparent" }}
    >
      <ambientLight intensity={0.35} />
      <pointLight position={[6, 4, 6]} intensity={40} color="#6B8AFF" />
      <pointLight position={[-6, -3, -4]} intensity={22} color="#122A8A" />
      <spotLight position={[0, 8, 2]} angle={0.4} penumbra={1} intensity={30} color="#ffffff" />

      <ParallaxRig>
        <GlassOrb />
        <Ring radius={1.6} tilt={1.15} speed={0.1} opacity={0.7} />
        <Ring radius={1.95} tilt={-0.9} speed={-0.07} opacity={0.35} />
        <Particles />
      </ParallaxRig>

      <Environment preset="city" />
    </Canvas>
  );
}
