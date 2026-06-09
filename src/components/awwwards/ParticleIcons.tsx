import React, { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

export const ParticleIcons = ({ count = 40 }) => {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  
  const dummy = useMemo(() => new THREE.Object3D(), []);
  
  // Generate random data for particles
  const particles = useMemo(() => {
    const temp = [];
    for (let i = 0; i < count; i++) {
      const x = (Math.random() - 0.5) * 40;
      const y = (Math.random() - 0.5) * 40;
      const z = (Math.random() - 0.5) * 30 - 10;
      
      const speed = 0.01 + Math.random() * 0.02;
      const rotSpeed = (Math.random() - 0.5) * 0.02;
      
      temp.push({ x, y, z, speed, rotSpeed, rand: Math.random() });
    }
    return temp;
  }, [count]);

  useFrame((state) => {
    if (!meshRef.current) return;
    
    const time = state.clock.elapsedTime;
    
    particles.forEach((particle, i) => {
      // Gentle floating upward
      let currentY = particle.y + (time * particle.speed * 20);
      // Reset if it goes too high
      if (currentY > 20) {
        particle.y = -20 - (time * particle.speed * 20);
        currentY = particle.y + (time * particle.speed * 20);
      }
      
      // Gentle horizontal swaying
      const currentX = particle.x + Math.sin(time * particle.speed + particle.rand * 100) * 2;
      
      dummy.position.set(currentX, currentY, particle.z);
      
      // Rotate slowly
      dummy.rotation.x = particle.rand * Math.PI * 2 + time * particle.rotSpeed;
      dummy.rotation.y = particle.rand * Math.PI * 2 + time * particle.rotSpeed;
      dummy.rotation.z = particle.rand * Math.PI * 2 + time * particle.rotSpeed;
      
      const scale = 0.1 + particle.rand * 0.15;
      dummy.scale.set(scale, scale, scale);
      
      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);
    });
    
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      {/* We use abstract tetrahedron geometry as "particles" representing abstract fragments of knowledge/study */}
      <tetrahedronGeometry args={[1, 0]} />
      <meshStandardMaterial 
        color="#3b82f6" 
        transparent 
        opacity={0.3} 
        wireframe={Math.random() > 0.5}
        roughness={0.2}
        metalness={0.8}
      />
    </instancedMesh>
  );
};
