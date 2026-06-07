"use client";

import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import gsap from 'gsap';

const fragmentShader = `
  uniform float uProgress; // 0 to 2
  uniform vec3 uColor;
  varying vec2 vUv;

  void main() {
    // Liquid wave effect
    float noise = sin(vUv.x * 8.0 + uProgress * 10.0) * 0.15;
    float alpha = 0.0;
    
    if (uProgress <= 1.0) {
      // Wipe IN (top to bottom)
      float edge = uProgress * 1.3 - 0.15;
      alpha = smoothstep(edge - 0.1 + noise, edge + 0.1 + noise, 1.0 - vUv.y);
      alpha = 1.0 - alpha;
    } else {
      // Wipe OUT (top to bottom)
      float p = uProgress - 1.0;
      float edge = p * 1.3 - 0.15;
      alpha = smoothstep(edge - 0.1 + noise, edge + 0.1 + noise, 1.0 - vUv.y);
    }
    
    gl_FragColor = vec4(uColor, alpha);
  }
`;

const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position, 1.0);
  }
`;

const TransitionPlane = ({ progress }: { progress: number }) => {
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  useFrame(() => {
    if (materialRef.current) {
      materialRef.current.uniforms.uProgress.value = progress;
    }
  });

  return (
    <mesh>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={{
          uProgress: { value: 0 },
          uColor: { value: new THREE.Color("#0f172a") } // slate-900 / brand-navy
        }}
        transparent={true}
        depthWrite={false}
      />
    </mesh>
  );
};

export const LiquidTransition = ({ 
  isAnimating, 
  onMidpoint,
  onComplete
}: { 
  isAnimating: boolean; 
  onMidpoint: () => void;
  onComplete: () => void;
}) => {
  const [progress, setProgress] = useState(0);
  const isRunning = useRef(false);

  useEffect(() => {
    if (isAnimating && !isRunning.current) {
      isRunning.current = true;
      setProgress(0);
      
      // Phase 1: Wipe down to cover screen
      gsap.to({ p: 0 }, {
        p: 1,
        duration: 0.7,
        ease: "power2.in",
        onUpdate: function() {
          setProgress(this.targets()[0].p);
        },
        onComplete: () => {
          onMidpoint();
          
          // Phase 2: Wipe away to reveal new screen
          gsap.to({ p: 1 }, {
            p: 2,
            duration: 0.8,
            ease: "power3.out",
            onUpdate: function() {
              setProgress(this.targets()[0].p);
            },
            onComplete: () => {
              isRunning.current = false;
              setProgress(0);
              onComplete();
            }
          });
        }
      });
    }
  }, [isAnimating, onMidpoint, onComplete]);

  if (!isAnimating && progress === 0) return null;

  return (
    <div className="fixed inset-0 z-[100] pointer-events-none">
      <Canvas camera={{ position: [0, 0, 1] }} gl={{ alpha: true }} style={{ width: '100%', height: '100%' }}>
        <TransitionPlane progress={progress} />
      </Canvas>
    </div>
  );
};
