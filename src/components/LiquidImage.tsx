"use client";

import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';

const fragmentShader = `
  uniform float uTime;
  uniform vec2 uMouse;
  uniform sampler2D uTexture;
  varying vec2 vUv;

  void main() {
    vec2 uv = vUv;
    
    // Calculate distance between current pixel (uv) and mouse position
    float dist = distance(uv, uMouse);
    float effect = smoothstep(0.5, 0.0, dist); // Radius of 0.5
    
    // Liquid noise distortion
    float noise = sin(uv.y * 30.0 + uTime * 8.0) * 0.08 * effect;
    uv.x += noise;
    uv.y += cos(uv.x * 30.0 + uTime * 8.0) * 0.08 * effect;

    // Fetch the base texture
    vec4 color = texture2D(uTexture, uv);
    
    // RGB Shift (Chromatic Aberration) based on effect intensity
    float r = texture2D(uTexture, uv + vec2(0.015 * effect, 0.0)).r;
    float g = texture2D(uTexture, uv).g;
    float b = texture2D(uTexture, uv - vec2(0.015 * effect, 0.0)).b;
    
    color.rgb = mix(color.rgb, vec3(r, g, b), effect);
    
    // Add a slight brightness bump
    color.rgb += effect * 0.2;
    
    gl_FragColor = color;
  }
`;

const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    // Standard orthogonal projection plane
    gl_Position = vec4(position.x, position.y, 1.0, 1.0);
  }
`;

const ImagePlane = ({ src }: { src: string }) => {
  const texture = useTexture(src);
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  
  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uMouse: { value: new THREE.Vector2(-1, -1) }, // Offscreen initially
    uTexture: { value: texture }
  }), [texture]);

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.getElapsedTime();
      
      // Map pointer coordinates from [-1, 1] center origin to [0, 1] bottom-left origin for UVs
      const targetX = (state.pointer.x + 1) / 2;
      const targetY = (state.pointer.y + 1) / 2;
      
      materialRef.current.uniforms.uMouse.value.lerp(
        new THREE.Vector2(targetX, targetY),
        0.1
      );
    }
  });

  return (
    <mesh>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent={true}
      />
    </mesh>
  );
};

export const LiquidImage = ({ src, className }: { src: string, className?: string }) => {
  return (
    <div className={`relative overflow-hidden ${className}`}>
      <Canvas camera={{ position: [0, 0, 1] }} gl={{ alpha: true }} style={{ width: '100%', height: '100%', position: 'absolute', inset: 0 }}>
        <React.Suspense fallback={null}>
          <ImagePlane src={src} />
        </React.Suspense>
      </Canvas>
    </div>
  );
};
