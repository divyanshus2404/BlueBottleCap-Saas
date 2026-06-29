"use client";

import React from "react";
import Link from "next/link";
import { Sparkles, FileText, Info, Shield, Mail } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-[#0B1120] text-slate-300 py-16 px-6 md:px-12 lg:px-20 border-t border-slate-800 relative z-10 font-sans selection:bg-brand-cobalt/30">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 md:gap-12 mb-16">

          {/* Col 1: Brand */}
          <div className="md:col-span-2 space-y-4 max-w-sm">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-brand-cobalt flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="font-display text-lg font-bold text-white">BlueBottleCap</span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              The AI-powered exam prep workspace built specifically for JEE, B.Tech, and engineering students across India. Upload your notes, chat with an AI co-pilot, and study smarter.
            </p>
            <div className="flex items-center gap-2 text-xs text-slate-500 pt-2">
              <Shield className="w-3.5 h-3.5 text-emerald-500" />
              <span>Secure payments via Razorpay. 100% money-back within 7 days.</span>
            </div>
          </div>

          {/* Col 3: Product */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-6">Product</h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href="/pdf-editor" className="hover:text-white transition-colors cursor-pointer flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3 text-brand-cobalt" /> PDF Copilot
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-white transition-colors cursor-pointer">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-white transition-colors cursor-pointer">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-white transition-colors cursor-pointer">
                  Terms &amp; Conditions
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Support */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-6">Support</h4>
            <ul className="space-y-3 text-sm">
              <li>
                <a
                  href="mailto:support@bluebottlecap.com"
                  className="hover:text-white transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Mail className="w-3 h-3 text-slate-400" /> support@bluebottlecap.com
                </a>
              </li>
              <li>
                <Link href="/terms" className="hover:text-white transition-colors cursor-pointer">
                  Refund Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-white transition-colors cursor-pointer">
                  Privacy Policy
                </Link>
              </li>
              <li className="flex items-center gap-1.5 text-slate-500 text-xs pt-1">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Early Access — Actively improving
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Legal */}
        <div className="pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-600">
          <p>© {new Date().getFullYear()} BlueBottleCap. All rights reserved. Built in India 🇮🇳</p>
          <div className="flex flex-wrap justify-center gap-6">
            <Link href="/terms" className="hover:text-white transition-colors cursor-pointer">Terms &amp; Conditions</Link>
            <a href="mailto:support@bluebottlecap.com" className="hover:text-white transition-colors">Contact Us</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
