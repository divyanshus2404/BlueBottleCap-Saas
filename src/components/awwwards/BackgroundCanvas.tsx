import React, { useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { EffectComposer, Bloom, ChromaticAberration, DepthOfField, Noise } from "@react-three/postprocessing";
import { BlendFunction } from "postprocessing";
import * as THREE from "three";
import { FloatingBlobs } from "./FloatingBlobs";
import { ParticleIcons } from "./ParticleIcons";

const SceneController = () => {
  const { camera } = useThree();

  useFrame(() => {
    const scrollY = window.scrollY;
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    const progress = maxScroll > 0 ? Math.min(Math.max(scrollY / maxScroll, 0), 1) : 0;

    const targetZ = 8 - progress * 15; 
    const targetRotZ = progress * Math.PI * 0.1;
    const targetRotY = progress * Math.PI * 0.05;

    camera.position.z = THREE.MathUtils.lerp(camera.position.z, targetZ, 0.05);
    camera.rotation.z = THREE.MathUtils.lerp(camera.rotation.z, targetRotZ, 0.05);
    camera.rotation.y = THREE.MathUtils.lerp(camera.rotation.y, targetRotY, 0.05);
  });

  return null;
};

const PostProcessingEffects = () => {
  const aberrationRef = useRef<any>(null);
  
  useFrame(() => {
    if (aberrationRef.current && (window as any).globalScrollProxy) {
      const velocity = Math.abs((window as any).globalScrollProxy.velocity || 0);
      const intensity = Math.min(velocity * 0.00005, 0.015);
      
      const targetOffset = new THREE.Vector2(intensity, intensity);
      aberrationRef.current.offset.lerp(targetOffset, 0.1);
    }
  });

  return (
    <EffectComposer multisampling={0}>
      <DepthOfField focusDistance={0.01} focalLength={0.1} bokehScale={3} />
      <Bloom luminanceThreshold={0.5} mipmapBlur intensity={1.5} />
      <Noise opacity={0.03} />
      <ChromaticAberration
        ref={aberrationRef}
        blendFunction={BlendFunction.NORMAL}
        offset={new THREE.Vector2(0, 0)}
        radialModulation={false}
        modulationOffset={0}
      />
    </EffectComposer>
  );
};

export const BackgroundCanvas = () => {
  return (
    <div className="fixed inset-0 -z-20 h-screen w-screen bg-slate-50 pointer-events-none">
      {/* Dynamic Background Glows for Light Theme */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(59,130,246,0.08),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_70%,rgba(139,92,246,0.08),transparent_50%)]" />
      
      <Canvas camera={{ position: [0, 0, 8], fov: 45 }} className="w-full h-full">
        <ambientLight intensity={0.8} />
        <directionalLight position={[10, 10, 5]} intensity={1.5} color="#3b82f6" />
        <directionalLight position={[-10, -10, -5]} intensity={1} color="#8b5cf6" />
        
        <SceneController />
        
        <ParticleIcons count={60} />
        <FloatingBlobs />
        
        <PostProcessingEffects />
      </Canvas>
    </div>
  );
};
