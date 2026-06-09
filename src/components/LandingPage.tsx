import React, { useRef, useEffect } from "react";
import { Sparkles, BookOpen, Brain, Layers, Clock, FileText, Download, Zap, Shield, Target, Smartphone } from "lucide-react";
import { ActiveView } from "../types";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { LiquidImage } from "./LiquidImage";
import { MagneticWrapper } from "./MagneticWrapper";
import { TiltCard } from "./TiltCard";
import { VelocityMarquee } from "./VelocityMarquee";
import { HeroBackgroundMarquee } from "./HeroBackgroundMarquee";
import { SplitTextReveal } from "./SplitTextReveal";
import NeuralBrainIntro from "./intro/NeuralBrainIntro";
import { AuroraBackground } from "./AuroraBackground";
import { ShaderBackground } from "./ShaderBackground";
import useIntroAnimation from "../hooks/useIntroAnimation";

if (typeof window !== "undefined") {
  (window as any).globalScrollProxy = { velocity: 0 };
}

gsap.registerPlugin(ScrollTrigger);

interface LandingPageProps {
  onNavigate: (view: ActiveView) => void;
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
        stagger: 0.2,
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

      // Awwwards Premium: Pin the Hero Section
      ScrollTrigger.create({
        trigger: ".hero-section",
        start: "top top",
        end: "+=800",
        pin: true,
        scrub: true,
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
      
      <ShaderBackground />
      
      {/* ── HERO SECTION ── */}
      <section className="hero-section relative pt-16 pb-20 md:pt-24 md:pb-28 min-h-screen flex flex-col justify-center perspective-1000 z-10 overflow-hidden">

        <HeroBackgroundMarquee />

        <div className="hero-content mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-20 text-center w-full mt-10 pointer-events-none">
          <div className="hero-badge hero-reveal-element inline-flex items-center gap-1.5 rounded-full bg-slate-100/80 px-4 py-1.5 text-xs font-semibold text-slate-800 mb-6 backdrop-blur-md border border-slate-200 shadow-sm pointer-events-auto">
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

          <div className="hero-reveal-element mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 pointer-events-auto">
            <button
              onClick={() => onNavigate("tools")}
              className="group relative inline-flex items-center gap-3 overflow-hidden rounded-2xl bg-linear-to-br from-blue-600 to-indigo-700 px-8 py-4 font-display text-lg font-bold text-white shadow-[0_0_40px_-10px_rgba(37,99,235,0.5)] transition-all duration-300 hover:scale-105 hover:shadow-[0_0_60px_-15px_rgba(37,99,235,0.7)]"
            >
              <div className="absolute inset-0 flex h-full w-full justify-center [transform:skew(-12deg)_translateX(-150%)] group-hover:duration-1000 group-hover:[transform:skew(-12deg)_translateX(150%)]">
                <div className="relative h-full w-8 bg-white/20" />
              </div>
              <Sparkles className="w-5 h-5 animate-bounce-subtle" />
              Start Your Streak
            </button>
            <button
              onClick={() => {
                const el = document.querySelector('.features-section');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="inline-flex items-center gap-2 rounded-2xl border-2 border-slate-200 bg-white/50 px-8 py-4 font-display text-lg font-bold text-slate-700 backdrop-blur-sm transition-all hover:bg-slate-50 hover:border-blue-200"
            >
              See how it works
            </button>
          </div>

          <div className="hero-reveal-element mt-8 flex flex-col items-center justify-center gap-2 pointer-events-auto">
            <div className="flex -space-x-3">
              {[
                "https://api.dicebear.com/7.x/notionists/svg?seed=Felix",
                "https://api.dicebear.com/7.x/notionists/svg?seed=Aneka",
                "https://api.dicebear.com/7.x/notionists/svg?seed=John",
                "https://api.dicebear.com/7.x/notionists/svg?seed=Sara",
                "https://api.dicebear.com/7.x/notionists/svg?seed=Mike"
              ].map((avatar, i) => (
                <img key={i} src={avatar} alt="User avatar" className="w-10 h-10 rounded-full border-2 border-white bg-slate-100 shadow-sm" />
              ))}
            </div>
            <div className="flex flex-col items-center">
              <div className="flex gap-1 text-amber-400 mb-1">
                {[...Array(5)].map((_, i) => <svg key={i} className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>)}
              </div>
              <p className="text-sm font-semibold text-slate-600">Loved by <span className="text-blue-600 font-bold">15,000+</span> ambitious students.</p>
            </div>
          </div>

          {/* Quirky floating elements */}
          <div className="absolute top-10 left-10 w-16 h-16 bg-blue-500/10 rounded-2xl backdrop-blur-xl border border-blue-200/50 flex items-center justify-center animate-float-slow hidden md:flex pointer-events-none -rotate-12">
            <Brain className="w-8 h-8 text-blue-500" />
          </div>
          <div className="absolute top-40 right-10 w-20 h-20 bg-indigo-500/10 rounded-full backdrop-blur-xl border border-indigo-200/50 flex items-center justify-center animate-float-fast hidden md:flex pointer-events-none rotate-12">
            <Zap className="w-10 h-10 text-indigo-500" />
          </div>

          {/* MOCK DASHBOARD PREVIEW UI */}
          <div className="hero-dashboard hero-reveal-element mt-14 max-w-5xl mx-auto relative group transform-gpu pointer-events-auto">
            <div className="absolute inset-0 bg-linear-to-b from-blue-100 to-transparent blur-3xl opacity-80 rounded-[3rem] -z-10 transition duration-700 group-hover:scale-105" />
            
            <div className="relative rounded-2xl md:rounded-[2rem] border border-white/60 bg-white/60 backdrop-blur-2xl p-2 md:p-3 shadow-2xl transition duration-500 hover:shadow-blue-500/10">
              <div className="absolute inset-x-0 -top-px h-px bg-linear-to-r from-transparent via-blue-200 to-transparent"></div>
              
              {/* BROWSER BAR MOCK */}
              <div className="rounded-xl md:rounded-3xl overflow-hidden bg-white border border-slate-200/50 shadow-inner relative z-10">
                <div className="flex items-center justify-between px-4 py-3 bg-slate-50 border-b border-slate-200/50">
                  <div className="flex space-x-2">
                    <div className="w-3 h-3 rounded-full bg-red-400 shadow-sm"></div>
                    <div className="w-3 h-3 rounded-full bg-amber-400 shadow-sm"></div>
                    <div className="w-3 h-3 rounded-full bg-emerald-400 shadow-sm"></div>
                  </div>
                  <div className="flex-1 px-4 flex justify-center">
                    <div className="bg-white rounded-md px-32 py-1.5 text-[9px] font-mono text-slate-400 flex items-center gap-2 shadow-sm border border-slate-100">
                      <span>🔒</span> bluebottlecap.com/workspace
                    </div>
                  </div>
                </div>
                
                <div className="p-8 pb-16 bg-white flex justify-center relative overflow-hidden">
                  <div className="max-w-md text-left w-full space-y-6 relative z-10">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center font-black text-slate-700 text-2xl shadow-inner border border-slate-200/50">S</div>
                        <div>
                          <div className="font-bold text-slate-900 text-lg">Welcome back, Scholar</div>
                          <div className="text-sm text-slate-500">Your study streak is on fire! 🔥</div>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 shadow-sm">
                          <div className="text-xs font-black tracking-widest text-slate-400 mb-1">MOCK TESTS</div>
                          <div className="text-3xl font-black text-slate-900">12<span className="text-sm font-bold text-slate-400 ml-1">completed</span></div>
                        </div>
                        <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 shadow-sm">
                          <div className="text-xs font-black tracking-widest text-slate-400 mb-1">CHAPTERS REVISED</div>
                          <div className="text-3xl font-black text-slate-900">34<span className="text-sm font-bold text-slate-400 ml-1">/ 90</span></div>
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
      <section className="features-section py-40 bg-slate-50/80 backdrop-blur-2xl relative z-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <SplitTextReveal 
            text="Everything you need to succeed." 
            className="text-4xl md:text-5xl font-black font-display text-slate-900 mb-24" 
          />
          
          <div className="grid md:grid-cols-3 gap-12 max-w-6xl mx-auto">
            <TiltCard className="h-[400px]">
              <div className="feature-card h-full flex flex-col items-center group bg-white rounded-[2rem] p-8 lg:p-10 shadow-2xl transition-shadow duration-500 overflow-hidden justify-between border border-slate-100 ring-1 ring-slate-900/5 hover:ring-brand-cobalt/20">
                <div className="w-full h-48 rounded-[2rem] overflow-hidden mb-6 relative">
                  <LiquidImage src="/images/physics.png" className="w-full h-full absolute inset-0 z-0 scale-105 transition-transform duration-700 group-hover:scale-100" />
                </div>
                <h3 className="text-2xl font-black text-slate-900 mb-2">Premium Notes</h3>
                <p className="text-slate-500 leading-relaxed text-sm font-medium max-w-sm">Access exhaustive, topper-grade notes carefully organized by subject and chapter.</p>
              </div>
            </TiltCard>
            
            <TiltCard className="h-[400px]">
              <div className="feature-card h-full flex flex-col items-center group bg-white rounded-[2rem] p-8 lg:p-10 shadow-2xl transition-shadow duration-500 overflow-hidden justify-between border border-slate-100 ring-1 ring-slate-900/5 hover:ring-brand-cobalt/20">
                <div className="w-full h-48 rounded-[2rem] overflow-hidden mb-6 relative">
                  <LiquidImage src="/images/chemistry.png" className="w-full h-full absolute inset-0 z-0 scale-105 transition-transform duration-700 group-hover:scale-100" />
                </div>
                <h3 className="text-2xl font-black text-slate-900 mb-2">Virtual Test Mode</h3>
                <p className="text-slate-500 leading-relaxed text-sm font-medium max-w-sm">Practice past papers in an immersive, distraction-free environment with an active timer.</p>
              </div>
            </TiltCard>
            
            <TiltCard className="h-[400px]">
              <div className="feature-card h-full flex flex-col items-center group bg-white rounded-[2rem] p-8 lg:p-10 shadow-2xl transition-shadow duration-500 overflow-hidden justify-between border border-slate-100 ring-1 ring-slate-900/5 hover:ring-brand-cobalt/20">
                <div className="w-full h-48 rounded-[2rem] overflow-hidden mb-6 relative">
                  <LiquidImage src="/images/math.png" className="w-full h-full absolute inset-0 z-0 scale-105 transition-transform duration-700 group-hover:scale-100" />
                </div>
                <h3 className="text-2xl font-black text-slate-900 mb-2">AI Powered</h3>
                <p className="text-slate-500 leading-relaxed text-sm font-medium max-w-sm">Get instant solutions and flashcard generation to retain concepts longer.</p>
              </div>
            </TiltCard>
          </div>

          <div className="mt-24 feature-card">
            <button
              onClick={() => onNavigate("study-material-page")}
              className="inline-flex items-center gap-3 bg-slate-900 hover:bg-slate-800 text-white font-black text-lg px-10 py-5 rounded-2xl transition-all duration-300 shadow-xl hover:shadow-2xl hover:-translate-y-1 cursor-pointer ring-4 ring-transparent hover:ring-slate-900/10"
            >
              <span>Explore Study Material</span>
              <BookOpen className="w-6 h-6" />
            </button>
            <p className="text-sm text-slate-400 font-bold mt-5 uppercase tracking-widest">Free preview available · No signup needed</p>
          </div>
        </div>
      </section>

      {/* ── COACHING COMPARISON ── */}
      <section className="comparison-section py-32 bg-white/90 backdrop-blur-xl border-y border-slate-100 overflow-hidden relative z-20 shadow-sm">
        <div className="mx-auto max-w-5xl px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-black font-display text-slate-900 mb-20">
            Traditional Learning vs <br className="hidden sm:block" />BlueBottleCap
          </h2>
          
          <div className="overflow-hidden border border-slate-200 rounded-[2rem] shadow-xl text-left text-sm md:text-lg bg-white/95 backdrop-blur-xl">
            <div className="comparison-row grid grid-cols-3 bg-slate-50 border-b border-slate-200 font-black text-slate-900 p-6 sm:p-8">
              <div className="col-span-1 uppercase tracking-widest text-xs text-slate-400">Feature</div>
              <div className="col-span-1 text-slate-500">Traditional</div>
              <div className="col-span-1 text-blue-600 flex items-center gap-2">
                <Sparkles className="w-5 h-5 hidden sm:block" /> BlueBottleCap
              </div>
            </div>
            
            <div className="comparison-row grid grid-cols-3 border-b border-slate-100 p-6 sm:p-8 hover:bg-slate-50 transition-colors">
              <div className="col-span-1 font-bold text-slate-700">Cost</div>
              <div className="col-span-1 text-slate-500 pr-4">₹1,00,000+ per year</div>
              <div className="col-span-1 font-black text-slate-900">Extremely affordable.</div>
            </div>
            
            <div className="comparison-row grid grid-cols-3 border-b border-slate-100 p-6 sm:p-8 hover:bg-slate-50 transition-colors">
              <div className="col-span-1 font-bold text-slate-700">Material</div>
              <div className="col-span-1 text-slate-500 pr-4">Heavy, outdated books.</div>
              <div className="col-span-1 font-bold text-slate-900">Digital, constantly updated notes.</div>
            </div>

            <div className="comparison-row grid grid-cols-3 p-6 sm:p-8 hover:bg-slate-50 transition-colors">
              <div className="col-span-1 font-bold text-slate-700">Tests</div>
              <div className="col-span-1 text-slate-500 pr-4">Rigid schedule.</div>
              <div className="col-span-1 font-bold text-slate-900">Take full mock tests instantly.</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS / TRUST ── */}
      <section className="testimonials-section py-40 bg-slate-50/90 backdrop-blur-2xl border-b border-slate-200 relative z-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-black font-display text-slate-900 mb-6">Built for serious students.</h2>
          <p className="text-slate-500 mb-20 font-medium text-xl">Trusted by ambitious learners everywhere.</p>
          
          <div className="grid md:grid-cols-2 gap-10 max-w-5xl mx-auto text-left">
            <div className="testimonial-card bg-white p-12 rounded-[2rem] border border-slate-100 shadow-xl relative transition-transform hover:-translate-y-2">
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

            <div className="testimonial-card bg-white p-12 rounded-[2rem] border border-slate-100 shadow-xl relative transition-transform hover:-translate-y-2">
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
      <section className="cta-section py-40 text-center relative overflow-hidden bg-linear-to-b from-blue-700 to-indigo-900 text-white z-20">
        <div className="cta-glow absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-400/30 via-indigo-900/50 to-transparent opacity-100 blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-4xl mx-auto px-6">
          <h2 className="text-5xl md:text-7xl font-display font-black mb-8 leading-tight drop-shadow-xl text-white">
            Ready to upgrade your<br/>
            <span className="text-transparent bg-clip-text bg-linear-to-r from-cyan-300 to-blue-200">academic life?</span>
          </h2>
          <p className="text-xl md:text-2xl text-blue-100 mb-14 font-medium max-w-2xl mx-auto drop-shadow-sm">
            Join 15,000+ top students who have already transformed their grades with BlueBottleCap.
          </p>
          <div className="flex flex-col sm:flex-row justify-center items-center gap-6">
            <button 
              onClick={() => onNavigate("tools")}
              className="rounded-2xl bg-white text-indigo-700 font-display hover:bg-slate-50 px-14 py-7 font-black text-2xl cursor-pointer shadow-[0_0_50px_-10px_rgba(255,255,255,0.5)] transition-all hover:scale-105 hover:shadow-[0_0_80px_-15px_rgba(255,255,255,0.7)] w-full sm:w-auto"
            >
              Start for Free
            </button>
            <button 
              onClick={() => onNavigate("dashboard")}
              className="rounded-2xl bg-transparent border-2 border-white/30 text-white font-display hover:bg-white/10 px-14 py-7 font-bold text-xl cursor-pointer transition-colors w-full sm:w-auto"
            >
              View Dashboard
            </button>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-indigo-800 bg-indigo-950 py-16 relative z-20 text-center">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-xs text-slate-500 space-y-4">
          <span className="font-display font-black text-slate-400 text-xl tracking-tight">BlueBottleCap</span>
          <p className="font-mono text-[11px] uppercase tracking-widest mt-2">© 2026 BlueBottleCap Suite. All Rights Reserved.</p>
        </div>
      </footer>
    </div>
  );
};
