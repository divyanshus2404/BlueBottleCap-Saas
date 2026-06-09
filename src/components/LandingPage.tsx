import React, { useRef, useEffect, useMemo } from "react";
import { Sparkles, BookOpen } from "lucide-react";
import { ActiveView } from "../types";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { EffectComposer, Bloom, ChromaticAberration, Noise } from "@react-three/postprocessing";
import { BlendFunction } from "postprocessing";
import { LiquidImage } from "./LiquidImage";
import { MagneticWrapper } from "./MagneticWrapper";
import { TiltCard } from "./TiltCard";
import { VelocityMarquee } from "./VelocityMarquee";
import { HeroBackgroundMarquee } from "./HeroBackgroundMarquee";
import { SplitTextReveal } from "./SplitTextReveal";
import NeuralBrainIntro from "./intro/NeuralBrainIntro";
import useIntroAnimation from "../hooks/useIntroAnimation";

if (typeof window !== "undefined") {
  (window as any).globalScrollProxy = { velocity: 0 };
}

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

// FRAGMENT SHADER: Light "Apple Frost" Glass
const fragmentShader = `
  uniform float uTime;
  varying vec2 vUv;
  varying vec3 vPosition;
  varying vec3 vNormal;

  void main() {
    // Frosted Glass Colors
    vec3 color1 = vec3(0.94, 0.96, 1.0); // Light blue
    vec3 color2 = vec3(0.88, 0.94, 1.0); // Cyan tint
    vec3 color3 = vec3(1.0, 1.0, 1.0);   // Pure white
    
    // Melting color blend
    float mix1 = sin(vUv.x * 4.0 + uTime * 0.4) * 0.5 + 0.5;
    float mix2 = cos(vUv.y * 6.0 - uTime * 0.3) * 0.5 + 0.5;
    
    vec3 finalColor = mix(color1, color2, mix1);
    finalColor = mix(finalColor, color3, mix2);
    
    // Fresnel / Glass Edge Refraction (Darkens edges slightly)
    float fresnel = dot(vNormal, vec3(0.0, 0.0, 1.0));
    fresnel = clamp(1.0 - fresnel, 0.0, 1.0);
    fresnel = pow(fresnel, 2.5);
    
    finalColor -= fresnel * 0.15; // subtle edge definition
    
    gl_FragColor = vec4(finalColor, 0.5); // semi-transparent
  }
`;

const CustomShape = ({ position, scale }: { position: [number, number, number], scale: number }) => {
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

const SceneController = () => {
  const { camera } = useThree();

  useFrame(() => {
    const scrollY = window.scrollY;
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    const progress = maxScroll > 0 ? Math.min(Math.max(scrollY / maxScroll, 0), 1) : 0;

    const targetZ = 8 - progress * 25; 
    const targetRotZ = progress * Math.PI * 0.3;
    const targetRotY = progress * Math.PI * 0.15;

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
      // Calculate a target offset based on the absolute scroll velocity
      const velocity = Math.abs((window as any).globalScrollProxy.velocity);
      // Clamp the max intensity
      const intensity = Math.min(velocity * 0.0001, 0.02);
      
      const targetOffset = new THREE.Vector2(intensity, intensity);
      aberrationRef.current.offset.lerp(targetOffset, 0.1);
    }
  });

  return (
    <EffectComposer multisampling={0}>
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

function Background3D() {
  return (
    <div className="fixed inset-0 -z-20 h-screen w-screen bg-transparent pointer-events-none">
      <Canvas camera={{ position: [0, 0, 8], fov: 45 }} className="w-full h-full">
        <SceneController />
        
        {/* A deep tunnel of frosted liquid geometry */}
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
  useIntroAnimation();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power4.out" } });
      tl.fromTo(".hero-badge", { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 1, delay: 0.1 })
        .fromTo(".hero-title .word", { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 1.2, stagger: 0.1 }, "-=0.8")
        .fromTo(".hero-desc", { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 1 }, "-=1.0")
        .fromTo(".hero-dashboard", { 
          y: 120, 
          rotationX: 25, 
          scale: 0.9,
          opacity: 0 
        }, {
          y: 0,
          rotationX: 0,
          scale: 1,
          opacity: 1, 
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

      gsap.fromTo(".feature-card", {
        y: 60,
        opacity: 0,
      }, {
        y: 0,
        opacity: 1,
        duration: 1,
        stagger: 0.2,
        ease: "power3.out",
        scrollTrigger: {
          trigger: ".features-section",
          start: "top 80%",
        }
      });

      gsap.fromTo(".comparison-row", {
        x: -30,
        opacity: 0,
      }, {
        x: 0,
        opacity: 1,
        duration: 0.8,
        stagger: 0.15,
        ease: "power2.out",
        scrollTrigger: {
          trigger: ".comparison-section",
          start: "top 75%",
        }
      });
      
      gsap.fromTo(".testimonial-card", {
        y: 50,
        scale: 0.95,
        opacity: 0,
      }, {
        y: 0,
        scale: 1,
        opacity: 1,
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

      const skewSetter = gsap.quickSetter(".hero-title .word", "skewY", "deg");
      let proxy = { skew: 0 };
      
      ScrollTrigger.create({
        onUpdate: (self) => {
          let velocity = self.getVelocity();
          if (typeof window !== "undefined") {
            (window as any).globalScrollProxy.velocity = velocity;
          }
          
          let skew = Math.min(Math.max(velocity / -200, -10), 10);
          if (Math.abs(skew) > Math.abs(proxy.skew)) {
            proxy.skew = skew;
            gsap.to(proxy, {
              skew: 0,
              duration: 0.8,
              ease: "power3",
              overwrite: true,
              onUpdate: () => skewSetter(proxy.skew)
            });
          }
        }
      });

    }, containerRef);
    
    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className="bg-transparent min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            "name": "BlueBottleCap",
            "applicationCategory": "EducationalApplication",
            "operatingSystem": "Web",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "USD"
            },
            "description": "Advanced Academic Workspace for College and University Students. Generate flashcards, compress files, and practice in a distraction-free mock test environment.",
            "url": "https://bluebottlecap.com"
          })
        }}
      />
      <div id="intro-overlay" className="fixed inset-0 z-50 bg-bg-primary" />
      <NeuralBrainIntro />
      
      <Background3D />
      
      {/* ── HERO SECTION ── */}
      <section className="hero-section relative pt-16 pb-20 md:pt-24 md:pb-28 min-h-screen flex flex-col justify-center perspective-1000 z-10 overflow-hidden">

        <HeroBackgroundMarquee />

        <div className="hero-content mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-20 text-center w-full mt-10 pointer-events-none">
          <div className="hero-badge hero-reveal-element inline-flex items-center gap-1.5 rounded-full bg-surface-glass px-4 py-1.5 text-xs font-semibold text-slate-800 mb-6 backdrop-blur-md border border-border-subtle shadow-sm pointer-events-auto">
            <Sparkles className="w-3.5 h-3.5 text-blue-500" />
            <span>The intelligent way to study</span>
          </div>
          
          <h1 className="hero-title hero-reveal-element font-display text-4.5xl font-black tracking-tight text-slate-900 sm:text-6xl md:text-7xl leading-tight max-w-4xl mx-auto drop-shadow-sm pointer-events-auto">
            <span className="word inline-block">The</span>{" "}
            <span className="word inline-block">ultimate</span>{" "}
            <span className="word inline-block">arsenal</span>{" "}
            <span className="word inline-block">for</span>{" "}
            <span className="word inline-block bg-linear-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              every ambitious student.
            </span>
          </h1>
          
          <p className="hero-desc hero-reveal-element mt-6 mx-auto max-w-2xl text-base text-slate-600 md:text-xl leading-relaxed font-medium pointer-events-auto">
            Stop wasting time gathering scattered notes. Get premium study material, instant AI-driven answers, and immersive test modes — all in one place.
          </p>

          {/* MOCK DASHBOARD PREVIEW UI */}
          <div className="hero-dashboard hero-reveal-element mt-14 max-w-5xl mx-auto relative group transform-gpu pointer-events-auto">
            <div className="absolute inset-0 bg-linear-to-b from-blue-100 to-transparent blur-3xl opacity-80 rounded-[3rem] -z-10 transition duration-700 group-hover:scale-105" />
            
            <div className="relative rounded-2xl md:rounded-[2rem] border border-white/60 bg-white/60 backdrop-blur-2xl p-2 md:p-3 shadow-2xl transition duration-500 hover:shadow-blue-500/10">
              <div className="absolute inset-x-0 -top-px h-px bg-linear-to-r from-transparent via-blue-200 to-transparent"></div>
              
              {/* BROWSER BAR MOCK */}
              <div className="rounded-xl md:rounded-3xl overflow-hidden bg-white border border-border-subtle shadow-inner relative z-10">
                <div className="flex items-center justify-between px-4 py-3 bg-surface-solid border-b border-border-subtle">
                  <div className="flex space-x-2">
                    <div className="w-3 h-3 rounded-full bg-red-400 shadow-sm"></div>
                    <div className="w-3 h-3 rounded-full bg-amber-400 shadow-sm"></div>
                    <div className="w-3 h-3 rounded-full bg-emerald-400 shadow-sm"></div>
                  </div>
                  <div className="flex-1 px-4 flex justify-center">
                    <div className="bg-white rounded-md px-32 py-1.5 text-[9px] font-mono text-text-secondary flex items-center gap-2 shadow-sm border border-border-subtle">
                      <span>🔒</span> bluebottlecap.com/workspace
                    </div>
                  </div>
                </div>
                
                <div className="p-8 pb-16 bg-white flex justify-center relative overflow-hidden">
                  <div className="max-w-md text-left w-full space-y-6 relative z-10">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-surface-glass flex items-center justify-center font-black text-slate-700 text-2xl shadow-inner border border-border-subtle">S</div>
                        <div>
                          <div className="font-bold text-slate-900 text-lg">Welcome back, Scholar</div>
                          <div className="text-sm text-text-muted">Your study streak is on fire! 🔥</div>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-5 bg-surface-solid rounded-2xl border border-border-subtle shadow-sm">
                          <div className="text-xs font-black tracking-widest text-text-secondary mb-1">MOCK TESTS</div>
                          <div className="text-3xl font-black text-slate-900">12<span className="text-sm font-bold text-text-secondary ml-1">completed</span></div>
                        </div>
                        <div className="p-5 bg-surface-solid rounded-2xl border border-border-subtle shadow-sm">
                          <div className="text-xs font-black tracking-widest text-text-secondary mb-1">CHAPTERS REVISED</div>
                          <div className="text-3xl font-black text-slate-900">34<span className="text-sm font-bold text-text-secondary ml-1">/ 90</span></div>
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
      <section className="py-32 bg-white/60 backdrop-blur-xl border-y border-white/50 text-center relative z-20 shadow-sm overflow-hidden">
        <div className="mx-auto max-w-4xl px-4">
          <SplitTextReveal 
            text="Stop searching for the perfect notes." 
            className="text-4xl md:text-5xl lg:text-6xl font-black font-display text-slate-900 mb-6 leading-tight" 
          />
          <p className="text-xl text-slate-600 leading-relaxed font-medium mt-6 max-w-3xl mx-auto">
            You spend more time looking for good study material and downloading scattered PDFs than actually studying. Stop wasting your energy. We compiled the absolute best chapter-wise notes, formulas, and mock tests so you can just sit down and study.
          </p>
        </div>
      </section>

      {/* ── INFINITE VELOCITY MARQUEE ── */}
      <VelocityMarquee text="STUDY SMARTER • RETAIN FASTER • ACE EXAMS • " className="my-0" />

      {/* ── HOW IT WORKS (FEATURES) ── */}
      <section className="features-section py-40 bg-surface-solid backdrop-blur-2xl relative z-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <SplitTextReveal 
            text="Everything you need to succeed." 
            className="text-4xl md:text-5xl font-black font-display text-slate-900 mb-24" 
          />
          
          <div className="grid md:grid-cols-3 gap-12 max-w-6xl mx-auto">
            <TiltCard className="h-[400px]">
              <div className="feature-card h-full flex flex-col items-center group bg-white rounded-[2rem] p-8 lg:p-10 shadow-2xl transition-shadow duration-500 overflow-hidden justify-between border border-border-subtle ring-1 ring-slate-900/5 hover:ring-brand-cobalt/20">
                <div className="w-full h-48 rounded-[2rem] overflow-hidden mb-6 relative">
                  <LiquidImage src="/images/physics.png" className="w-full h-full absolute inset-0 z-0 scale-105 transition-transform duration-700 group-hover:scale-100" />
                </div>
                <h3 className="text-2xl font-black text-slate-900 mb-2">Premium Notes</h3>
                <p className="text-text-muted leading-relaxed text-sm font-medium max-w-sm">Access exhaustive, topper-grade notes carefully organized by subject and chapter.</p>
              </div>
            </TiltCard>
            
            <TiltCard className="h-[400px]">
              <div className="feature-card h-full flex flex-col items-center group bg-white rounded-[2rem] p-8 lg:p-10 shadow-2xl transition-shadow duration-500 overflow-hidden justify-between border border-border-subtle ring-1 ring-slate-900/5 hover:ring-brand-cobalt/20">
                <div className="w-full h-48 rounded-[2rem] overflow-hidden mb-6 relative">
                  <LiquidImage src="/images/chemistry.png" className="w-full h-full absolute inset-0 z-0 scale-105 transition-transform duration-700 group-hover:scale-100" />
                </div>
                <h3 className="text-2xl font-black text-slate-900 mb-2">Virtual Test Mode</h3>
                <p className="text-text-muted leading-relaxed text-sm font-medium max-w-sm">Practice past papers in an immersive, distraction-free environment with an active timer.</p>
              </div>
            </TiltCard>
            
            <TiltCard className="h-[400px]">
              <div className="feature-card h-full flex flex-col items-center group bg-white rounded-[2rem] p-8 lg:p-10 shadow-2xl transition-shadow duration-500 overflow-hidden justify-between border border-border-subtle ring-1 ring-slate-900/5 hover:ring-brand-cobalt/20">
                <div className="w-full h-48 rounded-[2rem] overflow-hidden mb-6 relative">
                  <LiquidImage src="/images/math.png" className="w-full h-full absolute inset-0 z-0 scale-105 transition-transform duration-700 group-hover:scale-100" />
                </div>
                <h3 className="text-2xl font-black text-slate-900 mb-2">AI Powered</h3>
                <p className="text-text-muted leading-relaxed text-sm font-medium max-w-sm">Get instant solutions and flashcard generation to retain concepts longer.</p>
              </div>
            </TiltCard>
          </div>

          <div className="mt-24 feature-card">
            <button
              onClick={() => onNavigate("study-material-page")}
              className="inline-flex items-center gap-3 bg-bg-primary hover:bg-surface-solid text-white font-black text-lg px-10 py-5 rounded-2xl transition-all duration-300 shadow-xl hover:shadow-2xl hover:-translate-y-1 cursor-pointer ring-4 ring-transparent hover:ring-slate-900/10"
            >
              <span>Explore Study Material</span>
              <BookOpen className="w-6 h-6" />
            </button>
            <p className="text-sm text-text-secondary font-bold mt-5 uppercase tracking-widest">Free preview available · No signup needed</p>
          </div>
        </div>
      </section>

      {/* ── COACHING COMPARISON ── */}
      <section className="comparison-section py-32 bg-white/90 backdrop-blur-xl border-y border-border-subtle overflow-hidden relative z-20 shadow-sm">
        <div className="mx-auto max-w-5xl px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-black font-display text-slate-900 mb-20">
            Traditional Learning vs <br className="hidden sm:block" />BlueBottleCap
          </h2>
          
          <div className="overflow-hidden border border-border-subtle rounded-[2rem] shadow-xl text-left text-sm md:text-lg bg-white/95 backdrop-blur-xl">
            <div className="comparison-row grid grid-cols-3 bg-surface-solid border-b border-border-subtle font-black text-slate-900 p-6 sm:p-8">
              <div className="col-span-1 uppercase tracking-widest text-xs text-text-secondary">Feature</div>
              <div className="col-span-1 text-text-muted">Traditional</div>
              <div className="col-span-1 text-blue-600 flex items-center gap-2">
                <Sparkles className="w-5 h-5 hidden sm:block" /> BlueBottleCap
              </div>
            </div>
            
            <div className="comparison-row grid grid-cols-3 border-b border-border-subtle p-6 sm:p-8 hover:bg-surface-solid transition-colors">
              <div className="col-span-1 font-bold text-slate-700">Cost</div>
              <div className="col-span-1 text-text-muted pr-4">₹1,00,000+ per year</div>
              <div className="col-span-1 font-black text-slate-900">Extremely affordable.</div>
            </div>
            
            <div className="comparison-row grid grid-cols-3 border-b border-border-subtle p-6 sm:p-8 hover:bg-surface-solid transition-colors">
              <div className="col-span-1 font-bold text-slate-700">Material</div>
              <div className="col-span-1 text-text-muted pr-4">Heavy, outdated books.</div>
              <div className="col-span-1 font-bold text-slate-900">Digital, constantly updated notes.</div>
            </div>

            <div className="comparison-row grid grid-cols-3 p-6 sm:p-8 hover:bg-surface-solid transition-colors">
              <div className="col-span-1 font-bold text-slate-700">Tests</div>
              <div className="col-span-1 text-text-muted pr-4">Rigid schedule.</div>
              <div className="col-span-1 font-bold text-slate-900">Take full mock tests instantly.</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS / TRUST ── */}
      <section className="testimonials-section py-40 bg-surface-solid backdrop-blur-2xl border-b border-border-subtle relative z-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-black font-display text-slate-900 mb-6">Built for serious students.</h2>
          <p className="text-text-muted mb-20 font-medium text-xl">Trusted by ambitious learners everywhere.</p>
          
          <div className="grid md:grid-cols-2 gap-10 max-w-5xl mx-auto text-left">
            <div className="testimonial-card bg-white p-12 rounded-[2rem] border border-border-subtle shadow-xl relative transition-transform hover:-translate-y-2">
              <div className="absolute -top-6 -left-2 text-slate-100 text-9xl font-serif leading-none">"</div>
              <p className="text-slate-700 leading-relaxed font-medium mb-10 relative z-10 text-lg">I was struggling to find good concise notes until I found this suite. The interactive UI and the mock test environment is better than anything else out there.</p>
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full shadow-inner border-2 border-white"></div>
                <div>
                  <div className="font-black text-slate-900 text-xl">Rahul S.</div>
                  <div className="text-sm text-blue-600 font-bold uppercase tracking-wide mt-1">Premium User</div>
                </div>
              </div>
            </div>

            <div className="testimonial-card bg-white p-12 rounded-[2rem] border border-border-subtle shadow-xl relative transition-transform hover:-translate-y-2">
              <div className="absolute -top-6 -left-2 text-slate-100 text-9xl font-serif leading-none">"</div>
              <p className="text-slate-700 leading-relaxed font-medium mb-10 relative z-10 text-lg">The layout is just gorgeous and distraction-free. No ads, no annoying popups, just pure study material and test modes that help me stay focused for hours.</p>
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full shadow-inner border-2 border-white"></div>
                <div>
                  <div className="font-black text-slate-900 text-xl">Ananya M.</div>
                  <div className="text-sm text-emerald-600 font-bold uppercase tracking-wide mt-1">Science Major</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA SECTION ── */}
      <section className="cta-section py-40 text-center relative overflow-hidden bg-bg-primary text-white z-20">
        <div className="cta-glow absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/40 via-slate-900 to-slate-900 opacity-80 blur-3xl pointer-events-none" />
        
        <div className="mx-auto max-w-4xl px-4 relative z-10 space-y-12">
          <h2 className="font-display text-5xl sm:text-7xl font-black tracking-tight leading-tight drop-shadow-2xl">
            Stop procrastinating.
          </h2>
          <p className="text-2xl text-text-primary max-w-2xl mx-auto font-medium leading-relaxed">
            Join thousands of ambitious students and start your serious prep tonight.
          </p>
          <div className="pt-10 flex justify-center items-center">
            <MagneticWrapper strength={60}>
              <button
                onClick={() => onNavigate("onboarding")}
                className="rounded-2xl bg-white text-slate-900 hover:bg-surface-solid px-14 py-7 font-black text-2xl cursor-pointer shadow-2xl transition-colors ring-8 ring-white/10 hover:ring-white/20 w-full sm:w-auto"
              >
                Start Studying Smarter
              </button>
            </MagneticWrapper>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-slate-800 bg-bg-primary py-16 relative z-20 text-center">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-xs text-text-muted space-y-4">
          <span className="font-display font-black text-text-secondary text-xl tracking-tight">BlueBottleCap</span>
          <p className="font-mono text-[11px] uppercase tracking-widest mt-2">© 2026 BlueBottleCap Suite. All Rights Reserved.</p>
        </div>
      </footer>
    </div>
  );
};
