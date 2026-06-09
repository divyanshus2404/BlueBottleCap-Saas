import React, { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

function Plane() {
  const mesh = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.u_time.value = state.clock.elapsedTime;
    }
  });

  const uniforms = React.useMemo(() => ({
    u_time: { value: 0 }
  }), []);

  return (
    <mesh ref={mesh} scale={[10, 10, 1]}>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        ref={materialRef}
        uniforms={uniforms}
        fragmentShader={`
          uniform float u_time;
          void main() {
            vec2 st = gl_FragCoord.xy / 800.0;
            float wave = sin(st.x * 10.0 + u_time) * 0.5 +
                         cos(st.y * 10.0 + u_time) * 0.5;
            // Using a soft blue-slate color palette to match the light theme
            vec3 color = vec3(0.85 + wave * 0.1, 0.90 + wave * 0.1, 1.0);
            gl_FragColor = vec4(color, 1.0);
          }
        `}
      />
    </mesh>
  );
}

export const ShaderBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 z-0 w-screen h-screen pointer-events-none">
      <Canvas dpr={[1, 1.5]}>
        <Plane />
      </Canvas>
    </div>
  );
};
