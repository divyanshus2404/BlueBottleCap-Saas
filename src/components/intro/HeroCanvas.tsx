"use client";
import { Canvas, useFrame } from "@react-three/fiber";
import { Text } from "@react-three/drei";
import { useRef, useMemo, useState, useEffect } from "react";
import * as THREE from "three";
import { introState } from "./LoaderSequence";

const WORDS = [
  "Physics", "DSA", "Algorithms", "Calculus", "Thermodynamics", 
  "Notes", "Mechanics", "History", "Biology", "Chemistry",
  "Algebra", "Data", "Geometry", "Logic", "Code", 
  "AI", "Machine Learning", "Statistics", "Economics", "Literature",
  "Genetics", "Astronomy", "Ethics", "Philosophy", "Cybersecurity"
];

function KnowledgeText({ word, index, total }: { word: string; index: number; total: number }) {
  const mesh = useRef<any>(null);
  const [hovered, setHover] = useState(false);
  
  // Random starting position spread far out
  const startPos = useMemo(() => {
    const r = 8 + Math.random() * 10; // 8 to 18 units away
    const theta = Math.random() * 2 * Math.PI;
    const phi = Math.acos((Math.random() * 2) - 1);
    
    return new THREE.Vector3(
      r * Math.sin(phi) * Math.cos(theta),
      r * Math.sin(phi) * Math.sin(theta),
      r * Math.cos(phi)
    );
  }, []);

  // Target formation position (Brain sphere approximation)
  const targetPos = useMemo(() => {
    // Form a denser core like a brain lobe
    const r = 2 + Math.random() * 2; 
    const theta = (index / total) * Math.PI * 4; // Golden spiral-ish
    const y = (Math.random() - 0.5) * 3;
    
    return new THREE.Vector3(
      r * Math.cos(theta),
      y,
      r * Math.sin(theta)
    );
  }, [index, total]);

  useEffect(() => {
    // Add custom properties to mesh for GSAP to animate
    if (mesh.current) {
      mesh.current.userData = {
        startPos: startPos.clone(),
        targetPos: targetPos.clone(),
        currentPos: startPos.clone(),
        progress: 0, // 0 to 1
        driftSpeed: 0.01 + Math.random() * 0.02,
        driftPhase: Math.random() * Math.PI * 2
      };
      mesh.current.position.copy(startPos);
    }
  }, [startPos, targetPos]);

  useFrame((state) => {
    if (!mesh.current) return;
    
    const data = mesh.current.userData;
    
    // Read from GSAP driven state
    const progress = introState.convergenceProgress;
    mesh.current.fillOpacity = introState.particleOpacity;
    mesh.current.scale.setScalar(introState.scale);
    
    // Idle drift when progress is 0
    if (progress < 0.01) {
      const time = state.clock.getElapsedTime();
      mesh.current.position.x = data.startPos.x + Math.sin(time * data.driftSpeed + data.driftPhase) * 1;
      mesh.current.position.y = data.startPos.y + Math.cos(time * data.driftSpeed * 0.8 + data.driftPhase) * 1;
      
      // Face camera slowly
      mesh.current.quaternion.slerp(state.camera.quaternion, 0.02);
    } else {
      // Interpolate towards target formation based on GSAP progress
      mesh.current.position.lerpVectors(data.startPos, data.targetPos, progress);
      
      // Faster face camera during formation
      mesh.current.quaternion.slerp(state.camera.quaternion, 0.1);
    }
  });

  return (
    <Text
      ref={mesh}
      fontSize={0.4 + Math.random() * 0.4}
      color="#4F46E5" // Indigo 600
      anchorX="center"
      anchorY="middle"
      onPointerOver={() => setHover(true)}
      onPointerOut={() => setHover(false)}
      fillOpacity={0} // Controlled by GSAP
    >
      {word}
    </Text>
  );
}

function Particles() {
  const group = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (group.current) {
      // Very slow global rotation
      group.current.rotation.y += introState.rotationSpeed;
      group.current.rotation.z = Math.sin(state.clock.getElapsedTime() * 0.02) * 0.1;
    }
  });

  return (
    <group ref={group}>
      {WORDS.map((word, i) => (
        <KnowledgeText key={i} word={word} index={i} total={WORDS.length} />
      ))}
    </group>
  );
}

export default function HeroCanvas() {
  return (
    <div className="fixed inset-0 z-10 pointer-events-none" id="intro-canvas-container">
      <Canvas camera={{ position: [0, 0, 15], fov: 45 }}>
        <ambientLight intensity={1} />
        <Particles />
      </Canvas>
    </div>
  );
}
