import React, { useRef, useMemo, useEffect } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import gsap from "gsap";

const vertexShader = `
  uniform float uTime;
  uniform vec2 uMouse;
  varying vec2 vUv;
  varying vec3 vPosition;
  varying vec3 vNormal;

  void main() {
    vUv = uv;
    vPosition = position;
    vNormal = normal;

    vec3 pos = position;
    
    // Liquid distortion
    float noiseFreq = 1.2;
    float noiseAmp = 0.6;
    vec3 noisePos = vec3(pos.x * noiseFreq + uTime, pos.y * noiseFreq + uTime, pos.z);
    
    pos.x += sin(noisePos.y) * noiseAmp;
    pos.y += cos(noisePos.z) * noiseAmp;
    pos.z += sin(noisePos.x) * noiseAmp;
    
    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    
    // Mouse hover warping (bending space around the cursor)
    vec2 viewMouse = uMouse * 8.0; 
    float dist = distance(mvPosition.xy, viewMouse);
    float force = smoothstep(4.0, 0.0, dist); 
    
    mvPosition.xy += normalize(mvPosition.xy - viewMouse) * force * 1.5;
    
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const fragmentShader = `
  uniform float uTime;
  varying vec2 vUv;
  varying vec3 vPosition;
  varying vec3 vNormal;

  void main() {
    // Apple Frost Light Glass
    vec3 color1 = vec3(0.4, 0.7, 1.0); // Soft Cyan/Blue
    vec3 color2 = vec3(0.8, 0.6, 1.0); // Soft Violet
    vec3 color3 = vec3(1.0, 1.0, 1.0); // Pure white highlight
    
    float mix1 = sin(vUv.x * 4.0 + uTime * 0.4) * 0.5 + 0.5;
    float mix2 = cos(vUv.y * 6.0 - uTime * 0.3) * 0.5 + 0.5;
    
    vec3 finalColor = mix(color1, color2, mix1);
    finalColor = mix(finalColor, color3, mix2 * 0.7); // More white for brightness
    
    // Fresnel
    float fresnel = dot(vNormal, vec3(0.0, 0.0, 1.0));
    fresnel = clamp(1.0 - fresnel, 0.0, 1.0);
    fresnel = pow(fresnel, 2.0); // Softer fresnel for light mode
    
    finalColor += fresnel * 0.5; // Stronger edge highlight
    
    gl_FragColor = vec4(finalColor, 0.6); // Less transparent to pop against white
  }
`;

export const FloatingBlobs = () => {
  const groupRef = useRef<THREE.Group>(null);
  const { size } = useThree();

  const blobsData = [
    { position: [-3.5, 1.5, 0] as [number, number, number], scale: 1.8, delay: 0 },
    { position: [3.5, -1.0, -3] as [number, number, number], scale: 1.4, delay: 0.2 },
    { position: [-2.0, -3.0, -6] as [number, number, number], scale: 1.2, delay: 0.4 },
    { position: [4.0, 3.0, -9] as [number, number, number], scale: 2.0, delay: 0.1 },
    { position: [-3.0, 2.0, -12] as [number, number, number], scale: 1.6, delay: 0.5 },
    { position: [2.5, -2.5, -15] as [number, number, number], scale: 1.9, delay: 0.3 },
    { position: [-4.5, -1.0, -18] as [number, number, number], scale: 2.2, delay: 0.6 },
    { position: [3.0, 2.0, -21] as [number, number, number], scale: 1.5, delay: 0.2 },
    { position: [-2.0, -3.0, -24] as [number, number, number], scale: 2.5, delay: 0.4 },
  ];

  useEffect(() => {
    if (!groupRef.current) return;
    
    // GSAP Breathing animations
    groupRef.current.children.forEach((mesh, index) => {
      gsap.to(mesh.position, {
        y: `+=${Math.random() * 0.5 + 0.5}`, // Move up
        duration: 4 + Math.random() * 2,
        yoyo: true,
        repeat: -1,
        ease: "sine.inOut",
        delay: blobsData[index].delay
      });
    });

    // Mouse parallax listener
    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 4;
      const y = -(e.clientY / window.innerHeight - 0.5) * 4;
      
      gsap.to(groupRef.current!.position, {
        x: x,
        y: y,
        duration: 1.5,
        ease: "power3.out"
      });
      
      gsap.to(groupRef.current!.rotation, {
        x: y * 0.05,
        y: -x * 0.05,
        duration: 2,
        ease: "power2.out"
      });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      if (groupRef.current) {
        gsap.killTweensOf(groupRef.current.position);
        groupRef.current.children.forEach(m => gsap.killTweensOf(m.position));
      }
    };
  }, []);

  return (
    <group ref={groupRef}>
      {blobsData.map((data, i) => (
        <BlobMesh key={i} position={data.position} scale={data.scale} />
      ))}
    </group>
  );
};

const BlobMesh = ({ position, scale }: { position: [number, number, number], scale: number }) => {
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
      materialRef.current.uniforms.uMouse.value.lerp(
        new THREE.Vector2(state.pointer.x, state.pointer.y),
        0.1
      );
    }
    if (meshRef.current) {
      meshRef.current.rotation.x += 0.002;
      meshRef.current.rotation.y += 0.003;
    }
  });

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uMouse: { value: new THREE.Vector2(0, 0) },
    }),
    []
  );

  return (
    <mesh ref={meshRef} position={position} scale={scale}>
      <icosahedronGeometry args={[1, 32]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent={true}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
};
