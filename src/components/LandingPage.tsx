import React, { useRef, useEffect, useMemo } from "react";
import { Sparkles, BookOpen } from "lucide-react";
import { ActiveView } from "../types";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";

gsap.registerPlugin(ScrollTrigger);

interface LandingPageProps {
  onNavigate: (view: ActiveView) => void;
}

// ─── 3D SHADERS & COMPONENTS ────────────────────────────────────────────────

// VERTEX SHADER: Handles shape distortion and mouse bending
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

// FRAGMENT SHADER: Handles iridescent melting colors
const fragmentShader = `
  uniform float uTime;
  varying vec2 vUv;
  varying vec3 vPosition;
  varying vec3 vNormal;

  void main() {
    // Brand Colors
    vec3 color1 = vec3(0.06, 0.20, 0.45); // Brand Navy
    vec3 color2 = vec3(0.23, 0.51, 0.96); // Cobalt Blue
    vec3 color3 = vec3(0.06, 0.72, 0.50); // Emerald
    
    // Melting color blend
    float mix1 = sin(vUv.x * 4.0 + uTime * 0.4) * 0.5 + 0.5;
    float mix2 = cos(vUv.y * 6.0 - uTime * 0.3) * 0.5 + 0.5;
    
    vec3 finalColor = mix(color1, color2, mix1);
    finalColor = mix(finalColor, color3, mix2);
    
    // Fresnel / Iridescent Edge Glow
    float fresnel = dot(vNormal, vec3(0.0, 0.0, 1.0));
    fresnel = clamp(1.0 - fresnel, 0.0, 1.0);
    fresnel = pow(fresnel, 2.5);
    
    finalColor += fresnel * 0.8; // intense glow on edges
    
    gl_FragColor = vec4(finalColor, 0.65);
  }
`;

const CustomShape = ({ position, scale }: { position: [number, number, number], scale: number }) => {
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
      // Smoothly interpolate mouse position into the shader
      materialRef.current.uniforms.uMouse.value.lerp(
        new THREE.Vector2(state.pointer.x, state.pointer.y),
        0.1
      );
    }
    // Slowly rotate the entire mesh as well
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

// Camera Controller: Flies through the 3D space based on page scroll
const SceneController = () => {
  const { camera } = useThree();

  useFrame(() => {
    // Get scroll progress from 0 to 1
    const scrollY = window.scrollY;
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    const progress = maxScroll > 0 ? Math.min(Math.max(scrollY / maxScroll, 0), 1) : 0;

    // Fly through the Z-axis, rotating slightly
    const targetZ = 8 - progress * 25; // Fly deep into the tunnel
    const targetRotZ = progress * Math.PI * 0.3;
    const targetRotY = progress * Math.PI * 0.15;

    camera.position.z = THREE.MathUtils.lerp(camera.position.z, targetZ, 0.05);
    camera.rotation.z = THREE.MathUtils.lerp(camera.rotation.z, targetRotZ, 0.05);
    camera.rotation.y = THREE.MathUtils.lerp(camera.rotation.y, targetRotY, 0.05);
  });

  return null;
};

function Background3D() {
  return (
    <div className="fixed inset-0 -z-20 h-screen w-screen">
      <Canvas camera={{ position: [0, 0, 8], fov: 45 }} className="w-full h-full">
        <SceneController />
        
        {/* A deep tunnel of liquid geometry */}
        <CustomShape position={[-3.5, 1.5, 0]} scale={1.8} />
        <CustomShape position={[3.5, -1.0, -3]} scale={1.4} />
        <CustomShape position={[-2.0, -3.0, -6]} scale={1.2} />
        <CustomShape position={[4.0, 3.0, -9]} scale={2.0} />
        <CustomShape position={[-3.0, 2.0, -12]} scale={1.6} />
        <CustomShape position={[2.5, -2.5, -15]} scale={1.9} />
        <CustomShape position={[-4.5, -1.0, -18]} scale={2.2} />
        <CustomShape position={[3.0, 2.0, -21]} scale={1.5} />
        <CustomShape position={[-2.0, -3.0, -24]} scale={2.5} />
      </Canvas>
    </div>
  );
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power4.out" } });
      tl.from(".hero-badge", { y: 30, opacity: 0, duration: 1, delay: 0.1 })
        .from(".hero-title .word", { y: 40, opacity: 0, duration: 1.2, stagger: 0.1 }, "-=0.8")
        .from(".hero-desc", { y: 20, opacity: 0, duration: 1 }, "-=1.0")
        .from(".hero-dashboard", { 
          y: 120, 
          rotationX: 25, 
          scale: 0.9,
          opacity: 0, 
          duration: 1.5, 
          ease: "expo.out" 
        }, "-=0.8");

      gsap.to(".hero-dashboard", {
        y: -150,
        ease: "none",
        scrollTrigger: {
          trigger: ".hero-section",
          start: "top top",
          end: "bottom top",
          scrub: 0.5,
        }
      });

      gsap.to(".hero-content", {
        y: 100,
        opacity: 0,
        ease: "none",
        scrollTrigger: {
          trigger: ".hero-section",
          start: "top top",
          end: "bottom top",
          scrub: true,
        }
      });

      gsap.from(".feature-card", {
        y: 60,
        opacity: 0,
        duration: 1,
        stagger: 0.2,
        ease: "power3.out",
        scrollTrigger: {
          trigger: ".features-section",
          start: "top 80%",
        }
      });

      gsap.from(".comparison-row", {
        x: -30,
        opacity: 0,
        duration: 0.8,
        stagger: 0.15,
        ease: "power2.out",
        scrollTrigger: {
          trigger: ".comparison-section",
          start: "top 75%",
        }
      });
      
      gsap.from(".testimonial-card", {
        y: 50,
        scale: 0.95,
        opacity: 0,
        duration: 1,
        stagger: 0.3,
        ease: "back.out(1.2)",
        scrollTrigger: {
          trigger: ".testimonials-section",
          start: "top 80%",
        }
      });

      gsap.to(".cta-glow", {
        scale: 1.8,
        rotation: 90,
        ease: "none",
        scrollTrigger: {
          trigger: ".cta-section",
          start: "top bottom",
          end: "bottom top",
          scrub: 1,
        }
      });

    }, containerRef);
    
    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className="dark:bg-slate-950 min-h-screen">
      
      <Background3D />
      
      {/* ── HERO SECTION ── */}
      <section className="hero-section relative pt-16 pb-20 md:pt-24 md:pb-28 min-h-screen flex flex-col justify-center perspective-1000 z-10">
        
        <div className="hero-content mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10 text-center w-full mt-10">
          <div className="hero-badge inline-flex items-center gap-1.5 rounded-full bg-brand-cobalt/10 dark:bg-brand-cobalt/20 px-4 py-1.5 text-xs font-semibold text-brand-cobalt dark:text-blue-400 mb-6 backdrop-blur-md border border-brand-cobalt/10">
            <Sparkles className="w-3.5 h-3.5" />
            <span>The intelligent way to study</span>
          </div>
          
          <h1 className="hero-title font-display text-4.5xl font-black tracking-tight text-brand-navy dark:text-white sm:text-6xl md:text-7xl leading-tight max-w-4xl mx-auto drop-shadow-sm">
            <span className="word inline-block">The</span>{" "}
            <span className="word inline-block">ultimate</span>{" "}
            <span className="word inline-block">arsenal</span>{" "}
            <span className="word inline-block">for</span>{" "}
            <span className="word inline-block bg-linear-to-r from-brand-cobalt to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
              every ambitious student.
            </span>
          </h1>
          
          <p className="hero-desc mt-6 mx-auto max-w-2xl text-base text-gray-600 dark:text-slate-400 md:text-xl leading-relaxed">
            Stop wasting time gathering scattered notes. Get premium study material, instant AI-driven answers, and immersive test modes — all in one place.
          </p>

          {/* MOCK DASHBOARD PREVIEW UI */}
          <div className="hero-dashboard mt-14 max-w-5xl mx-auto relative group transform-gpu">
            <div className="absolute inset-0 bg-linear-to-b from-brand-sky/20 to-transparent blur-3xl opacity-60 rounded-[3rem] -z-10 transition duration-700 group-hover:opacity-100 group-hover:scale-105" />
            
            <div className="relative rounded-2xl md:rounded-[2rem] border border-white/40 dark:border-slate-700/50 bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl p-2 md:p-3 shadow-2xl transition duration-500 hover:shadow-brand-cobalt/20">
              <div className="absolute inset-x-0 -top-px h-px bg-linear-to-r from-transparent via-brand-cobalt/50 to-transparent"></div>
              
              {/* BROWSER BAR MOCK */}
              <div className="rounded-xl md:rounded-3xl overflow-hidden bg-white dark:bg-slate-950 border border-slate-200/50 dark:border-slate-800 shadow-inner relative z-10">
                <div className="flex items-center justify-between px-4 py-3 bg-slate-100/50 dark:bg-slate-900 border-b border-slate-200/50 dark:border-slate-800 backdrop-blur-md">
                  <div className="flex space-x-2">
                    <div className="w-3 h-3 rounded-full bg-red-400 dark:bg-red-500 shadow-sm"></div>
                    <div className="w-3 h-3 rounded-full bg-amber-400 dark:bg-amber-500 shadow-sm"></div>
                    <div className="w-3 h-3 rounded-full bg-emerald-400 dark:bg-emerald-500 shadow-sm"></div>
                  </div>
                  <div className="flex-1 px-4 flex justify-center">
                    <div className="bg-slate-200/70 dark:bg-slate-800 rounded-md px-32 py-1.5 text-[9px] font-mono text-slate-500 flex items-center gap-2 shadow-inner">
                      <span>🔒</span> bluebottlecap.com/workspace
                    </div>
                  </div>
                </div>
                
                <div className="p-8 pb-16 bg-slate-50/50 dark:bg-slate-950 flex justify-center relative overflow-hidden">
                  <div className="max-w-md text-left w-full space-y-6 relative z-10">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-brand-cobalt/10 dark:bg-brand-cobalt/20 flex items-center justify-center font-black text-brand-cobalt dark:text-blue-400 text-2xl shadow-inner border border-brand-cobalt/10">S</div>
                        <div>
                          <div className="font-bold text-slate-800 dark:text-slate-200 text-lg">Welcome back, Scholar</div>
                          <div className="text-sm text-slate-500 dark:text-slate-400">Your study streak is on fire! 🔥</div>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-800 shadow-sm transition hover:shadow-md hover:-translate-y-0.5">
                          <div className="text-xs font-black tracking-widest text-slate-400 dark:text-slate-500 mb-1">MOCK TESTS</div>
                          <div className="text-3xl font-black text-brand-navy dark:text-white">12<span className="text-sm font-bold text-slate-400 dark:text-slate-500 ml-1">completed</span></div>
                        </div>
                        <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-800 shadow-sm transition hover:shadow-md hover:-translate-y-0.5">
                          <div className="text-xs font-black tracking-widest text-slate-400 dark:text-slate-500 mb-1">CHAPTERS REVISED</div>
                          <div className="text-3xl font-black text-brand-navy dark:text-white">34<span className="text-sm font-bold text-slate-400 dark:text-slate-500 ml-1">/ 90</span></div>
                        </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── EMOTIONAL PAIN POINT SECTION ── */}
      <section className="py-32 bg-slate-50/80 dark:bg-slate-900/50 backdrop-blur-md border-y border-gray-100 dark:border-slate-800/80 text-center relative z-20">
        <div className="mx-auto max-w-3xl px-4">
          <h2 className="text-4xl font-black font-display text-brand-navy dark:text-white mb-6">Stop searching for the "perfect" notes.</h2>
          <p className="text-xl text-gray-600 dark:text-slate-400 leading-relaxed font-medium">
            You spend more time looking for good study material and downloading scattered PDFs than actually studying. Stop wasting your energy. We compiled the absolute best chapter-wise notes, formulas, and mock tests so you can just sit down and study.
          </p>
        </div>
      </section>

      {/* ── HOW IT WORKS (FEATURES) ── */}
      <section className="features-section py-40 bg-white/90 dark:bg-slate-950/90 backdrop-blur-lg relative z-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-black font-display text-brand-navy dark:text-white mb-24">
            Everything you need to succeed.
          </h2>
          
          <div className="grid md:grid-cols-3 gap-12 max-w-6xl mx-auto">
            <div className="feature-card flex flex-col items-center group">
              <div className="w-24 h-24 rounded-[2rem] bg-brand-cobalt/10 dark:bg-brand-cobalt/20 text-brand-cobalt dark:text-blue-400 flex items-center justify-center text-4xl font-bold mb-8 transition-transform duration-500 group-hover:-translate-y-4 group-hover:scale-110 shadow-lg group-hover:shadow-brand-cobalt/20">📚</div>
              <h3 className="text-2xl font-black text-brand-navy dark:text-white mb-4">Premium Notes</h3>
              <p className="text-gray-500 dark:text-slate-400 leading-relaxed text-lg">Access exhaustive, topper-grade notes carefully organized by subject and chapter.</p>
            </div>
            <div className="feature-card flex flex-col items-center group">
              <div className="w-24 h-24 rounded-[2rem] bg-brand-cobalt/10 dark:bg-brand-cobalt/20 text-brand-cobalt dark:text-blue-400 flex items-center justify-center text-4xl font-bold mb-8 transition-transform duration-500 group-hover:-translate-y-4 group-hover:scale-110 shadow-lg group-hover:shadow-brand-cobalt/20">⏱️</div>
              <h3 className="text-2xl font-black text-brand-navy dark:text-white mb-4">Virtual Test Mode</h3>
              <p className="text-gray-500 dark:text-slate-400 leading-relaxed text-lg">Practice past papers in an immersive, distraction-free environment with an active timer.</p>
            </div>
            <div className="feature-card flex flex-col items-center group">
              <div className="w-24 h-24 rounded-[2rem] bg-brand-cobalt/10 dark:bg-brand-cobalt/20 text-brand-cobalt dark:text-blue-400 flex items-center justify-center text-4xl font-bold mb-8 transition-transform duration-500 group-hover:-translate-y-4 group-hover:scale-110 shadow-lg group-hover:shadow-brand-cobalt/20">🤖</div>
              <h3 className="text-2xl font-black text-brand-navy dark:text-white mb-4">AI Powered</h3>
              <p className="text-gray-500 dark:text-slate-400 leading-relaxed text-lg">Get instant solutions and flashcard generation to retain concepts longer.</p>
            </div>
          </div>

          <div className="mt-24 feature-card">
            <button
              onClick={() => onNavigate("study-material-page")}
              className="inline-flex items-center gap-3 bg-brand-navy dark:bg-brand-cobalt hover:bg-brand-cobalt dark:hover:bg-indigo-500 text-white font-black text-lg px-10 py-5 rounded-2xl transition-all duration-300 shadow-2xl hover:shadow-brand-cobalt/30 hover:-translate-y-1 cursor-pointer ring-4 ring-transparent hover:ring-brand-cobalt/20"
            >
              <span>Explore Study Material</span>
              <BookOpen className="w-6 h-6" />
            </button>
            <p className="text-sm text-gray-400 dark:text-slate-500 font-bold mt-5 uppercase tracking-widest">Free preview available · No signup needed</p>
          </div>
        </div>
      </section>

      {/* ── COACHING COMPARISON ── */}
      <section className="comparison-section py-32 bg-slate-50/80 dark:bg-slate-900/80 backdrop-blur-md border-y border-gray-100 dark:border-slate-800/50 overflow-hidden relative z-20">
        <div className="mx-auto max-w-5xl px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-black font-display text-brand-navy dark:text-white mb-20">
            Traditional Learning vs <br className="hidden sm:block" />BlueBottleCap
          </h2>
          
          <div className="overflow-hidden border border-gray-200 dark:border-slate-700/50 rounded-[2rem] shadow-2xl text-left text-sm md:text-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl">
            <div className="comparison-row grid grid-cols-3 bg-slate-100/50 dark:bg-slate-800/50 border-b border-gray-200 dark:border-slate-700/50 font-black text-brand-navy dark:text-white p-6 sm:p-8">
              <div className="col-span-1 uppercase tracking-widest text-xs text-slate-400">Feature</div>
              <div className="col-span-1 text-gray-400 dark:text-slate-500">Traditional</div>
              <div className="col-span-1 text-brand-cobalt dark:text-blue-400 flex items-center gap-2">
                <Sparkles className="w-5 h-5 hidden sm:block" /> BlueBottleCap
              </div>
            </div>
            
            <div className="comparison-row grid grid-cols-3 border-b border-gray-100 dark:border-slate-800/50 p-6 sm:p-8 hover:bg-white dark:hover:bg-slate-800 transition-colors">
              <div className="col-span-1 font-bold text-gray-700 dark:text-slate-300">Cost</div>
              <div className="col-span-1 text-gray-500 dark:text-slate-400 pr-4">₹1,00,000+ per year</div>
              <div className="col-span-1 font-black text-brand-navy dark:text-white text-brand-cobalt">Extremely affordable.</div>
            </div>
            
            <div className="comparison-row grid grid-cols-3 border-b border-gray-100 dark:border-slate-800/50 p-6 sm:p-8 hover:bg-white dark:hover:bg-slate-800 transition-colors">
              <div className="col-span-1 font-bold text-gray-700 dark:text-slate-300">Material</div>
              <div className="col-span-1 text-gray-500 dark:text-slate-400 pr-4">Heavy, outdated books.</div>
              <div className="col-span-1 font-bold text-brand-navy dark:text-white">Digital, constantly updated notes.</div>
            </div>

            <div className="comparison-row grid grid-cols-3 border-b border-gray-100 dark:border-slate-800/50 p-6 sm:p-8 hover:bg-white dark:hover:bg-slate-800 transition-colors">
              <div className="col-span-1 font-bold text-gray-700 dark:text-slate-300">Tests</div>
              <div className="col-span-1 text-gray-500 dark:text-slate-400 pr-4">Rigid schedule.</div>
              <div className="col-span-1 font-bold text-brand-navy dark:text-white">Take full mock tests instantly.</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS / TRUST ── */}
      <section className="testimonials-section py-40 bg-white/90 dark:bg-slate-950/90 backdrop-blur-xl border-b border-gray-100 dark:border-slate-800/50 relative z-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-black font-display text-brand-navy dark:text-white mb-6">Built for serious students.</h2>
          <p className="text-gray-500 dark:text-slate-400 mb-20 font-medium text-xl">Trusted by ambitious learners everywhere.</p>
          
          <div className="grid md:grid-cols-2 gap-10 max-w-5xl mx-auto text-left">
            <div className="testimonial-card bg-slate-50 dark:bg-slate-900 p-12 rounded-[2rem] border border-gray-100 dark:border-slate-800 shadow-xl relative transition-transform hover:-translate-y-2">
              <div className="absolute -top-6 -left-2 text-brand-cobalt/20 dark:text-blue-500/20 text-9xl font-serif leading-none">"</div>
              <p className="text-gray-700 dark:text-slate-300 leading-relaxed font-medium mb-10 relative z-10 text-lg">I was struggling to find good concise notes until I found this suite. The interactive UI and the mock test environment is better than anything else out there.</p>
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 bg-gradient-to-br from-brand-cobalt to-indigo-600 rounded-full shadow-inner border-2 border-white dark:border-slate-800"></div>
                <div>
                  <div className="font-black text-brand-navy dark:text-white text-xl">Rahul S.</div>
                  <div className="text-sm text-brand-cobalt dark:text-blue-400 font-bold uppercase tracking-wide mt-1">Premium User</div>
                </div>
              </div>
            </div>

            <div className="testimonial-card bg-slate-50 dark:bg-slate-900 p-12 rounded-[2rem] border border-gray-100 dark:border-slate-800 shadow-xl relative transition-transform hover:-translate-y-2">
              <div className="absolute -top-6 -left-2 text-brand-cobalt/20 dark:text-blue-500/20 text-9xl font-serif leading-none">"</div>
              <p className="text-gray-700 dark:text-slate-300 leading-relaxed font-medium mb-10 relative z-10 text-lg">The layout is just gorgeous and distraction-free. No ads, no annoying popups, just pure study material and test modes that help me stay focused for hours.</p>
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 bg-gradient-to-br from-emerald-400 to-teal-600 rounded-full shadow-inner border-2 border-white dark:border-slate-800"></div>
                <div>
                  <div className="font-black text-brand-navy dark:text-white text-xl">Ananya M.</div>
                  <div className="text-sm text-emerald-500 font-bold uppercase tracking-wide mt-1">Science Major</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA SECTION ── */}
      <section className="cta-section py-40 text-center relative overflow-hidden bg-brand-navy/95 dark:bg-slate-950/95 backdrop-blur-xl text-white z-20">
        <div className="cta-glow absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-brand-cobalt/50 via-brand-navy to-brand-navy dark:from-blue-900/50 dark:via-slate-950 dark:to-slate-950 opacity-60 blur-3xl pointer-events-none" />
        
        <div className="mx-auto max-w-4xl px-4 relative z-10 space-y-12">
          <h2 className="font-display text-5xl sm:text-7xl font-black tracking-tight leading-tight drop-shadow-2xl">
            Stop procrastinating.
          </h2>
          <p className="text-2xl text-slate-300 dark:text-slate-400 max-w-2xl mx-auto font-medium leading-relaxed">
            Join thousands of ambitious students and start your serious prep tonight.
          </p>
          <div className="pt-10 flex justify-center items-center">
            <button
              onClick={() => onNavigate("onboarding")}
              className="rounded-2xl bg-white text-brand-navy hover:bg-slate-100 px-14 py-7 font-black text-2xl cursor-pointer shadow-2xl w-full sm:w-auto transition-all hover:scale-105 hover:-translate-y-2 ring-8 ring-white/10 hover:ring-white/30"
            >
              Start Studying Smarter
            </button>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-white/5 dark:border-slate-800/50 bg-slate-900/95 dark:bg-slate-950/95 backdrop-blur-xl py-16 relative z-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center text-xs text-slate-500 space-y-4">
          <span className="font-display font-black text-slate-400 text-xl tracking-tight">BlueBottleCap</span>
          <p className="font-mono text-[11px] uppercase tracking-widest mt-2">© 2026 BlueBottleCap Suite. All Rights Reserved.</p>
        </div>
      </footer>
    </div>
  );
};
