"use client";
import React, { useRef, useEffect } from "react";
import { ArrowLeft, Heart } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitTextReveal } from "./SplitTextReveal";
import { TiltCard } from "./TiltCard";
import { ActiveView } from "../types";
import { MagneticWrapper } from "./MagneticWrapper";

gsap.registerPlugin(ScrollTrigger);

interface AboutPageProps {
  onNavigate: (view: ActiveView) => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({ onNavigate }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let ctx = gsap.context(() => {
      // Add a simple fade-in for the image and text block
      gsap.from(".about-content", {
        y: 40,
        opacity: 0,
        duration: 1.2,
        stagger: 0.2,
        ease: "power3.out",
        delay: 0.5
      });
    }, containerRef);
    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className="min-h-screen bg-slate-50 pt-32 pb-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Back Button */}
        <div className="mb-12">
          <MagneticWrapper strength={30}>
            <button 
              onClick={() => onNavigate("landing")}
              className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </button>
          </MagneticWrapper>
        </div>

        <div className="grid lg:grid-cols-12 gap-16 items-start">
          
          {/* Image Column */}
          <div className="lg:col-span-5 about-content relative z-10">
            <TiltCard className="h-[600px] w-full">
              <div className="w-full h-full rounded-[2rem] overflow-hidden shadow-2xl border-4 border-white relative group bg-white flex items-center justify-center">
                <div className="absolute inset-0 bg-slate-100 flex flex-col items-center justify-center -z-10 p-8 text-center border-2 border-dashed border-slate-300 rounded-[2rem]">
                  <div className="text-slate-400 font-bold mb-2">Image Missing</div>
                  <div className="text-slate-400 text-sm">Please drag your photo into <br/><code className="bg-slate-200 px-1 py-0.5 rounded text-xs text-slate-600">public/images/founder.jpg</code></div>
                </div>
                <img 
                  src="/images/founder.jpg" 
                  alt="Divyanshu Singh - Founder" 
                  className="w-full h-full object-cover relative z-10 transition-transform duration-700 group-hover:scale-105"
                  onError={(e) => { (e.target as HTMLImageElement).style.opacity = '0'; }}
                />
              </div>
            </TiltCard>
            
            <div className="mt-8 text-center lg:text-left about-content">
              <h3 className="font-display font-black text-2xl text-slate-900">Divyanshu Singh</h3>
              <p className="text-blue-600 font-bold uppercase tracking-widest text-sm mt-1">Founder & Developer</p>
            </div>
          </div>

          {/* Text Column */}
          <div className="lg:col-span-7 space-y-12">
            <SplitTextReveal 
              text="The Story Behind BlueBottleCap" 
              className="text-5xl md:text-6xl lg:text-7xl font-black font-display text-slate-900 leading-[1.1] text-left !justify-start" 
            />
            
            <div className="prose prose-lg prose-slate about-content text-slate-600 leading-relaxed font-medium">
              <p className="text-xl text-slate-700">
                The idea began with a simple, frustrating realization: finding quality previous year question papers—whether for university finals or competitive prep exams—was needlessly difficult. Students were spending more time hunting for materials than actually studying them.
              </p>
              
              <p>
                I built this platform entirely on my own, dedicating it to students who want to cut the noise and just get to work.
              </p>

              <h3 className="text-2xl font-black text-slate-900 mt-12 mb-4">Why are some features paid?</h3>
              <p>
                The answer is completely transparent. Running complex AI models, updating databases, and maintaining fast servers is incredibly expensive. I don't have venture capital funding or a corporate team backing me. I'm a solo entrepreneur who started this from a single idea, building it from the ground up.
              </p>

              <div className="bg-blue-50/50 border border-blue-100 rounded-3xl p-8 my-10 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-10">
                  <Heart className="w-32 h-32 text-blue-600" />
                </div>
                <p className="relative z-10 text-slate-700 font-bold text-lg mb-0">
                  If BlueBottleCap has helped you study smarter, retain information faster, or score better on an exam, please consider supporting the project by upgrading or contributing. Your support is the only thing keeping the servers running and allowing me to build even better tools for you.
                </p>
              </div>

              <p className="text-xl font-bold text-slate-900 italic">
                Whatever you decide to do in life, I hope this tool helps you get there. Wish you all the best, mate.
              </p>
            </div>
            
            <div className="about-content pt-8 border-t border-slate-200">
              <MagneticWrapper strength={40}>
                <button 
                  onClick={() => onNavigate("study-material-page")}
                  className="bg-slate-900 hover:bg-slate-800 text-white px-8 py-4 rounded-2xl font-black text-lg transition-transform hover:-translate-y-1 shadow-xl hover:shadow-2xl"
                >
                  Explore Study Material
                </button>
              </MagneticWrapper>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
};
