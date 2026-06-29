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
      
      gsap.from(".faq-item", {
        y: 30,
        opacity: 0,
        duration: 0.8,
        stagger: 0.15,
        ease: "power2.out",
        scrollTrigger: {
          trigger: ".faq-section",
          start: "top 85%",
        }
      });
    }, containerRef);
    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className="min-h-screen bg-slate-50 pt-32 pb-32 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Back Button */}
        <div className="mb-12 about-content">
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
          
          {/* Text Column */}
          <div className="lg:col-span-12 max-w-4xl mx-auto space-y-12">
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

              <div className="bg-blue-50/50 border border-blue-100 rounded-3xl p-8 my-10 relative overflow-hidden group hover:bg-blue-50 transition-colors duration-500">
                <div className="absolute top-0 right-0 p-8 opacity-10 transition-transform duration-700 group-hover:scale-110 group-hover:rotate-12">
                  <Heart className="w-32 h-32 text-blue-600" />
                </div>
                <p className="relative z-10 text-slate-700 font-bold text-lg mb-0">
                  If BlueBottleCap has helped you study smarter, retain information faster, or score better on an exam, please consider supporting the project by upgrading or contributing. Your support is the only thing keeping the servers running and allowing me to build even better tools for you.
                </p>
              </div>

              <p className="text-xl font-bold text-slate-900 italic relative mb-4">
                <span className="absolute -left-6 -top-2 text-4xl text-slate-200 font-serif">"</span>
                Whatever you decide to do in life, I hope this tool helps you get there. Wish you all the best, mate.
                <span className="absolute -right-4 -bottom-4 text-4xl text-slate-200 font-serif">"</span>
              </p>

              <div className="mt-8 about-content">
                <h3 className="font-display font-black text-xl text-slate-900">— Divyanshu Singh</h3>
                <p className="text-blue-600 font-bold uppercase tracking-widest text-sm mt-1">Founder & Developer</p>
              </div>
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

        {/* FAQs */}
        <div className="mt-40 faq-section max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black font-display text-slate-900 mb-4">Frequently Asked Questions</h2>
            <p className="text-lg text-slate-500 font-medium">Everything you need to know about the platform.</p>
          </div>
          
          <div className="space-y-6">
            <details className="faq-item group bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow border border-slate-200 overflow-hidden [&_summary::-webkit-details-marker]:hidden">
              <summary className="flex items-center justify-between cursor-pointer p-6 sm:p-8 font-black text-xl text-slate-900 select-none">
                What exactly does BlueBottleCap do?
                <span className="transition-transform duration-300 group-open:-rotate-180 bg-slate-50 rounded-full p-2 text-slate-400 group-hover:text-slate-900 group-hover:bg-slate-100">
                  <svg fill="none" height="24" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" width="24"><path d="M19 9l-7 7-7-7"></path></svg>
                </span>
              </summary>
              <div className="p-6 sm:p-8 pt-0 text-slate-600 leading-relaxed font-medium text-lg border-t border-slate-100 mt-2">
                BlueBottleCap is an intelligent study platform designed specifically for ambitious students. It aggregates premium, chapter-wise notes and Previous Year Question (PYQ) papers across universities and competitive exams. Beyond just a PDF library, it features an immersive, distraction-free AI mock test environment that instantly grades your answers, generates flashcards, and helps you retain information faster.
              </div>
            </details>

            <details className="faq-item group bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow border border-slate-200 overflow-hidden [&_summary::-webkit-details-marker]:hidden">
              <summary className="flex items-center justify-between cursor-pointer p-6 sm:p-8 font-black text-xl text-slate-900 select-none">
                Are the study materials and PYQs updated?
                <span className="transition-transform duration-300 group-open:-rotate-180 bg-slate-50 rounded-full p-2 text-slate-400 group-hover:text-slate-900 group-hover:bg-slate-100">
                  <svg fill="none" height="24" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" width="24"><path d="M19 9l-7 7-7-7"></path></svg>
                </span>
              </summary>
              <div className="p-6 sm:p-8 pt-0 text-slate-600 leading-relaxed font-medium text-lg border-t border-slate-100 mt-2">
                Yes! As a solo developer and student, I understand how crucial accurate data is. I've built automation systems that continuously source and verify the latest exam patterns, ensuring the database stays relevant to current academic requirements.
              </div>
            </details>

            <details className="faq-item group bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow border border-slate-200 overflow-hidden [&_summary::-webkit-details-marker]:hidden">
              <summary className="flex items-center justify-between cursor-pointer p-6 sm:p-8 font-black text-xl text-slate-900 select-none">
                Can I request specific university papers?
                <span className="transition-transform duration-300 group-open:-rotate-180 bg-slate-50 rounded-full p-2 text-slate-400 group-hover:text-slate-900 group-hover:bg-slate-100">
                  <svg fill="none" height="24" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" width="24"><path d="M19 9l-7 7-7-7"></path></svg>
                </span>
              </summary>
              <div className="p-6 sm:p-8 pt-0 text-slate-600 leading-relaxed font-medium text-lg border-t border-slate-100 mt-2">
                Absolutely. We have a rapidly expanding database, but if your specific university or exam isn't listed yet, you can request it through the dashboard and I prioritize adding those resources within a few days.
              </div>
            </details>
          </div>
        </div>

      </div>
    </div>
  );
};

