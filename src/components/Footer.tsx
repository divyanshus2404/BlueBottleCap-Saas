import React from "react";
import { Twitter, Linkedin, Instagram, Github, ArrowUpRight } from "lucide-react";
import { ActiveView } from "../types";

export function Footer({ setActiveView }: { setActiveView: (v: ActiveView) => void }) {
  return (
    <footer className="bg-[#0B1120] text-slate-300 py-16 px-6 md:px-12 lg:px-20 border-t border-slate-800 relative z-10 font-sans selection:bg-brand-cobalt/30">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 mb-16">
          {/* Column 1: Product */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-6">Product</h4>
            <ul className="space-y-3 text-sm">
              <li>
                <button onClick={() => setActiveView("tools")} className="hover:text-white transition-colors cursor-pointer">
                  AI Tools Suite
                </button>
              </li>
              <li>
                <button onClick={() => setActiveView("virtual-test")} className="hover:text-white transition-colors cursor-pointer flex items-center gap-1 group">
                  Virtual Test Mode <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              </li>
              <li>
                <button onClick={() => setActiveView("roadmaps")} className="hover:text-white transition-colors cursor-pointer">
                  Interactive Roadmaps
                </button>
              </li>
              <li>
                <button onClick={() => setActiveView("pricing")} className="hover:text-white transition-colors cursor-pointer">
                  Pricing & Plans
                </button>
              </li>
            </ul>
          </div>

          {/* Column 2: Resources */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-6">Resources</h4>
            <ul className="space-y-3 text-sm">
              <li>
                <button onClick={() => setActiveView("study-material-page")} className="hover:text-white transition-colors cursor-pointer">
                  Study Material
                </button>
              </li>
              <li>
                <button onClick={() => setActiveView("flashcards")} className="hover:text-white transition-colors cursor-pointer">
                  Flashcard Hub
                </button>
              </li>
              <li>
                <button onClick={() => setActiveView("seniors-opinion")} className="hover:text-white transition-colors cursor-pointer">
                  Seniors' Opinions
                </button>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors cursor-pointer">Help Center</a>
              </li>
            </ul>
          </div>

          {/* Column 3: Company */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-6">Company</h4>
            <ul className="space-y-3 text-sm">
              <li>
                <button onClick={() => setActiveView("about")} className="hover:text-white transition-colors cursor-pointer">
                  About Us
                </button>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors cursor-pointer">Careers</a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors cursor-pointer">Pressroom</a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors cursor-pointer">Contact</a>
              </li>
            </ul>
          </div>

          {/* Column 4: Connect */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-6">Connect</h4>
            <div className="flex items-center gap-4">
              <a href="#" className="text-slate-400 hover:text-white transition-colors bg-white/5 hover:bg-brand-cobalt p-2 rounded-full">
                <Linkedin className="w-4 h-4" />
              </a>
              <a href="#" className="text-slate-400 hover:text-white transition-colors bg-white/5 hover:bg-brand-cobalt p-2 rounded-full">
                <Twitter className="w-4 h-4" />
              </a>
              <a href="#" className="text-slate-400 hover:text-white transition-colors bg-white/5 hover:bg-brand-cobalt p-2 rounded-full">
                <Instagram className="w-4 h-4" />
              </a>
              <a href="#" className="text-slate-400 hover:text-white transition-colors bg-white/5 hover:bg-brand-cobalt p-2 rounded-full">
                <Github className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Legal Section */}
        <div className="pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} BlueBottleCap. All rights reserved.</p>
          <div className="flex flex-wrap justify-center gap-6">
            <a href="#" className="hover:text-white transition-colors">Privacy and Cookies</a>
            <button onClick={() => setActiveView("terms")} className="hover:text-white transition-colors cursor-pointer">
              Terms & Conditions
            </button>
            <a href="#" className="hover:text-white transition-colors">Security Awareness</a>
            <button onClick={() => setActiveView("terms")} className="hover:text-white transition-colors cursor-pointer">
              Regulatory Disclosures
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
