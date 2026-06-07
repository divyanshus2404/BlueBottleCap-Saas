import React from "react";
import { Sparkles, BookOpen } from "lucide-react";
import { ActiveView } from "../types";
import { motion, useScroll, useTransform } from "framer-motion";

interface LandingPageProps {
  onNavigate: (view: ActiveView) => void;
}

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.2 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate }) => {
  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 500], [0, 150]);
  const heroOpacity = useTransform(scrollY, [0, 300], [1, 0]);

  return (
    <div className="fade-in dark:bg-slate-950 min-h-screen transition-colors duration-300 overflow-hidden">
      {/* HERO SECTION */}
      <section className="relative pt-16 pb-20 md:pt-24 md:pb-28 min-h-screen flex items-center">
        <motion.div 
          style={{ y: heroY, opacity: heroOpacity }}
          className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10 text-center w-full"
        >
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="inline-flex items-center gap-1.5 rounded-full bg-brand-cobalt/10 dark:bg-brand-cobalt/20 px-4 py-1.5 text-xs font-semibold text-brand-cobalt dark:text-blue-400 mb-6"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>The intelligent way to study</span>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1, ease: "easeOut" }}
            className="font-display text-4.5xl font-black tracking-tight text-brand-navy dark:text-white sm:text-6xl md:text-7xl leading-tight max-w-4xl mx-auto"
          >
            The ultimate arsenal for{" "}
            <span className="bg-linear-to-r from-brand-cobalt to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent inline-block">
              every ambitious student.
            </span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
            className="mt-6 mx-auto max-w-2xl text-base text-gray-500 dark:text-slate-400 md:text-lg leading-relaxed"
          >
            Stop wasting time gathering scattered notes. Get premium study material, instant AI-driven answers, and immersive test modes — all in one place.
          </motion.p>

          {/* MOCK DASHBOARD PREVIEW UI */}
          <motion.div 
            initial={{ opacity: 0, y: 60, rotateX: 10 }}
            animate={{ opacity: 1, y: 0, rotateX: 0 }}
            transition={{ duration: 1, delay: 0.4, type: "spring", bounce: 0.4 }}
            className="mt-14 max-w-5xl mx-auto relative group perspective-1000"
          >
            <motion.div 
              animate={{ y: [0, -10, 0] }}
              transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
              className="absolute inset-0 bg-linear-to-b from-brand-sky/20 to-transparent blur-3xl opacity-50 rounded-[3rem] -z-10 transition duration-700 group-hover:opacity-70 group-hover:scale-105"
            />
            
            <motion.div 
              whileHover={{ scale: 1.02, rotateY: 2, rotateX: 2 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="relative rounded-2xl md:rounded-[2rem] border border-slate-200 dark:border-slate-800/60 dark:border-slate-800 bg-white dark:bg-slate-900/50 backdrop-blur-sm p-2 md:p-3 shadow-2xl transition duration-500 hover:shadow-brand-cobalt/10"
            >
              <div className="absolute inset-x-0 -top-px h-px bg-linear-to-r from-transparent via-brand-cobalt/30 to-transparent"></div>
              
              {/* BROWSER BAR MOCK */}
              <div className="rounded-xl md:rounded-3xl overflow-hidden bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-800 shadow-sm relative z-10">
                <div className="flex items-center justify-between px-4 py-3 bg-slate-50 dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex space-x-2">
                    <div className="w-3 h-3 rounded-full bg-red-400 dark:bg-red-500"></div>
                    <div className="w-3 h-3 rounded-full bg-amber-400 dark:bg-amber-500"></div>
                    <div className="w-3 h-3 rounded-full bg-emerald-400 dark:bg-emerald-500"></div>
                  </div>
                  <div className="flex-1 px-4 flex justify-center">
                    <div className="bg-slate-200/50 dark:bg-slate-800 rounded-md px-32 py-1.5 text-[9px] font-mono text-slate-400 dark:text-slate-500 flex items-center gap-2">
                      <span>🔒</span> bluebottlecap.com/workspace
                    </div>
                  </div>
                </div>
                
                <div className="p-8 pb-16 bg-slate-50 dark:bg-slate-950 flex justify-center relative overflow-hidden">
                  <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
                    className="absolute -right-20 -top-20 w-64 h-64 bg-brand-sky/5 dark:bg-brand-sky/10 rounded-full blur-3xl"
                  />
                  
                  <div className="max-w-md text-left w-full space-y-6 relative z-10">
                    <motion.div 
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 1 }}
                      className="flex items-center gap-3"
                    >
                        <div className="w-12 h-12 rounded-xl bg-brand-cobalt/10 dark:bg-brand-cobalt/20 flex items-center justify-center font-bold text-brand-cobalt dark:text-blue-400 text-xl">S</div>
                        <div>
                          <div className="font-bold text-slate-800 dark:text-slate-200">Welcome back, Scholar</div>
                          <div className="text-xs text-slate-500 dark:text-slate-400">Your study streak is on fire! 🔥</div>
                        </div>
                    </motion.div>
                    <motion.div 
                      variants={containerVariants}
                      initial="hidden"
                      animate="show"
                      className="grid grid-cols-2 gap-4"
                    >
                        <motion.div variants={itemVariants} className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                          <div className="text-xs font-bold text-slate-400 dark:text-slate-500 mb-1">MOCK TESTS</div>
                          <div className="text-2xl font-black text-brand-navy dark:text-white">12<span className="text-sm font-medium text-slate-400 dark:text-slate-500 ml-1">completed</span></div>
                        </motion.div>
                        <motion.div variants={itemVariants} className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                          <div className="text-xs font-bold text-slate-400 dark:text-slate-500 mb-1">CHAPTERS REVISED</div>
                          <div className="text-2xl font-black text-brand-navy dark:text-white">34<span className="text-sm font-medium text-slate-400 dark:text-slate-500 ml-1">/ 90</span></div>
                        </motion.div>
                    </motion.div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      </section>

      {/* EMOTIONAL PAIN POINT SECTION */}
      <section className="py-24 bg-slate-50 dark:bg-slate-900/50 border-y border-gray-100 dark:border-slate-800 text-center relative">
        <motion.div 
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: false, margin: "-100px" }}
          transition={{ duration: 0.8, type: "spring" }}
          className="mx-auto max-w-3xl px-4"
        >
          <h2 className="text-3xl font-black font-display text-brand-navy dark:text-white mb-6">Stop searching for the "perfect" notes.</h2>
          <p className="text-lg text-gray-600 dark:text-slate-400 leading-relaxed">
            You spend more time looking for good study material and downloading scattered PDFs than actually studying. Stop wasting your energy. We compiled the absolute best chapter-wise notes, formulas, and mock tests so you can just sit down and study.
          </p>
        </motion.div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-32 bg-white dark:bg-slate-950">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <motion.h2 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="text-3.5xl md:text-5xl font-black font-display text-brand-navy dark:text-white mb-20"
          >
            Everything you need to succeed.
          </motion.h2>
          
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: false, margin: "-100px" }}
            className="grid md:grid-cols-3 gap-10 max-w-6xl mx-auto"
          >
            <motion.div variants={itemVariants} className="flex flex-col items-center group">
              <div className="w-20 h-20 rounded-[2rem] bg-brand-cobalt/10 dark:bg-brand-cobalt/20 text-brand-cobalt dark:text-blue-400 flex items-center justify-center text-3xl font-bold mb-8 transition-transform duration-300 group-hover:-translate-y-2 group-hover:scale-110">📚</div>
              <h3 className="text-xl font-bold text-brand-navy dark:text-white mb-3">Premium Notes</h3>
              <p className="text-gray-500 dark:text-slate-400 leading-relaxed">Access exhaustive, topper-grade notes carefully organized by subject and chapter.</p>
            </motion.div>
            <motion.div variants={itemVariants} className="flex flex-col items-center group">
              <div className="w-20 h-20 rounded-[2rem] bg-brand-cobalt/10 dark:bg-brand-cobalt/20 text-brand-cobalt dark:text-blue-400 flex items-center justify-center text-3xl font-bold mb-8 transition-transform duration-300 group-hover:-translate-y-2 group-hover:scale-110">⏱️</div>
              <h3 className="text-xl font-bold text-brand-navy dark:text-white mb-3">Virtual Test Mode</h3>
              <p className="text-gray-500 dark:text-slate-400 leading-relaxed">Practice past papers in an immersive, distraction-free environment with an active timer.</p>
            </motion.div>
            <motion.div variants={itemVariants} className="flex flex-col items-center group">
              <div className="w-20 h-20 rounded-[2rem] bg-brand-cobalt/10 dark:bg-brand-cobalt/20 text-brand-cobalt dark:text-blue-400 flex items-center justify-center text-3xl font-bold mb-8 transition-transform duration-300 group-hover:-translate-y-2 group-hover:scale-110">🤖</div>
              <h3 className="text-xl font-bold text-brand-navy dark:text-white mb-3">AI Powered</h3>
              <p className="text-gray-500 dark:text-slate-400 leading-relaxed">Get instant solutions and flashcard generation to retain concepts longer.</p>
            </motion.div>
          </motion.div>

          {/* CTA */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: false }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-20"
          >
            <button
              onClick={() => onNavigate("study-material-page")}
              className="inline-flex items-center gap-2.5 bg-brand-navy dark:bg-brand-cobalt hover:bg-brand-cobalt dark:hover:bg-indigo-500 text-white font-bold text-lg px-10 py-5 rounded-2xl transition-all duration-300 shadow-xl hover:shadow-2xl hover:-translate-y-1 cursor-pointer ring-4 ring-transparent hover:ring-brand-cobalt/20"
            >
              <span>Explore Study Material</span>
              <BookOpen className="w-6 h-6" />
            </button>
            <p className="text-xs text-gray-400 dark:text-slate-500 font-medium mt-4">Free preview available · No signup needed</p>
          </motion.div>
        </div>
      </section>

      {/* COACHING COMPARISON */}
      <section className="py-32 bg-slate-50 dark:bg-slate-900/30 border-y border-gray-100 dark:border-slate-800 overflow-hidden">
        <div className="mx-auto max-w-5xl px-4 text-center">
          <motion.h2 
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false }}
            className="text-3.5xl md:text-5xl font-black font-display text-brand-navy dark:text-white mb-16"
          >
            Traditional Learning vs <br className="hidden sm:block" />BlueBottleCap
          </motion.h2>
          
          <motion.div 
            initial={{ opacity: 0, rotateX: -15, y: 50 }}
            whileInView={{ opacity: 1, rotateX: 0, y: 0 }}
            viewport={{ once: false, margin: "-100px" }}
            transition={{ duration: 0.8, type: "spring", bounce: 0.3 }}
            className="overflow-hidden border border-gray-200 dark:border-slate-700/50 rounded-[2rem] shadow-2xl text-left text-sm md:text-base bg-white dark:bg-slate-900 perspective-1000"
          >
            <div className="grid grid-cols-3 bg-slate-100/50 dark:bg-slate-800/50 border-b border-gray-200 dark:border-slate-700/50 font-black text-brand-navy dark:text-white p-6 sm:p-8">
              <div className="col-span-1 uppercase tracking-widest text-xs text-slate-400">Feature</div>
              <div className="col-span-1 text-gray-400 dark:text-slate-500">Traditional</div>
              <div className="col-span-1 text-brand-cobalt dark:text-blue-400 flex items-center gap-2">
                <Sparkles className="w-4 h-4 hidden sm:block" /> BlueBottleCap
              </div>
            </div>
            
            <motion.div whileHover={{ backgroundColor: "var(--tw-colors-slate-50)" }} className="grid grid-cols-3 border-b border-gray-100 dark:border-slate-800/50 p-6 sm:p-8 transition-colors">
              <div className="col-span-1 font-bold text-gray-700 dark:text-slate-300">Cost</div>
              <div className="col-span-1 text-gray-500 dark:text-slate-400 pr-4">₹1,00,000+ per year</div>
              <div className="col-span-1 font-bold text-brand-navy dark:text-white">Extremely affordable.</div>
            </motion.div>
            
            <motion.div whileHover={{ backgroundColor: "var(--tw-colors-slate-50)" }} className="grid grid-cols-3 border-b border-gray-100 dark:border-slate-800/50 p-6 sm:p-8 transition-colors">
              <div className="col-span-1 font-bold text-gray-700 dark:text-slate-300">Material</div>
              <div className="col-span-1 text-gray-500 dark:text-slate-400 pr-4">Heavy, outdated books.</div>
              <div className="col-span-1 font-bold text-brand-navy dark:text-white">Digital, constantly updated notes.</div>
            </motion.div>

            <motion.div whileHover={{ backgroundColor: "var(--tw-colors-slate-50)" }} className="grid grid-cols-3 border-b border-gray-100 dark:border-slate-800/50 p-6 sm:p-8 transition-colors">
              <div className="col-span-1 font-bold text-gray-700 dark:text-slate-300">Tests</div>
              <div className="col-span-1 text-gray-500 dark:text-slate-400 pr-4">Rigid schedule.</div>
              <div className="col-span-1 font-bold text-brand-navy dark:text-white">Take full mock tests instantly.</div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* TESTIMONIALS / TRUST */}
      <section className="py-32 bg-white dark:bg-slate-950 border-b border-gray-100 dark:border-slate-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: false }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3.5xl md:text-4xl font-black font-display text-brand-navy dark:text-white mb-4">Built for serious students.</h2>
            <p className="text-gray-500 dark:text-slate-400 mb-16 font-medium text-lg">Trusted by ambitious learners everywhere.</p>
          </motion.div>
          
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: false, margin: "-100px" }}
            className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto text-left"
          >
            <motion.div variants={itemVariants} className="bg-slate-50 dark:bg-slate-900 p-10 rounded-[2rem] border border-gray-100 dark:border-slate-800 shadow-lg relative transition-transform hover:-translate-y-2">
              <div className="absolute -top-6 -left-2 text-brand-cobalt/20 dark:text-blue-500/20 text-8xl font-serif">"</div>
              <p className="text-gray-700 dark:text-slate-300 leading-relaxed font-medium mb-8 relative z-10 text-lg">I was struggling to find good concise notes until I found this suite. The interactive UI and the mock test environment is better than anything else out there.</p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-brand-cobalt to-indigo-600 rounded-full"></div>
                <div>
                  <div className="font-bold text-brand-navy dark:text-white text-lg">Rahul S.</div>
                  <div className="text-sm text-brand-cobalt dark:text-blue-400 font-bold">Premium User</div>
                </div>
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="bg-slate-50 dark:bg-slate-900 p-10 rounded-[2rem] border border-gray-100 dark:border-slate-800 shadow-lg relative transition-transform hover:-translate-y-2">
              <div className="absolute -top-6 -left-2 text-brand-cobalt/20 dark:text-blue-500/20 text-8xl font-serif">"</div>
              <p className="text-gray-700 dark:text-slate-300 leading-relaxed font-medium mb-8 relative z-10 text-lg">The layout is just gorgeous and distraction-free. No ads, no annoying popups, just pure study material and test modes that help me stay focused for hours.</p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-teal-600 rounded-full"></div>
                <div>
                  <div className="font-bold text-brand-navy dark:text-white text-lg">Ananya M.</div>
                  <div className="text-sm text-emerald-500 font-bold">Science Major</div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="py-32 text-center relative overflow-hidden bg-brand-navy dark:bg-slate-900 text-white">
        <motion.div 
          animate={{ scale: [1, 1.1, 1], rotate: [0, 5, 0] }}
          transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
          className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-brand-cobalt/40 via-brand-navy to-brand-navy dark:from-blue-900/40 dark:via-slate-900 dark:to-slate-900 opacity-50 blur-2xl"
        />
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: false }}
          transition={{ duration: 0.7, type: "spring" }}
          className="mx-auto max-w-4xl px-4 relative z-10 space-y-10"
        >
          <h2 className="font-display text-5xl sm:text-7xl font-black tracking-tight leading-tight drop-shadow-lg">
            Stop procrastinating.
          </h2>
          <p className="text-xl text-slate-300 dark:text-slate-400 max-w-2xl mx-auto font-medium">
            Join thousands of ambitious students and start your serious prep tonight.
          </p>
          <div className="pt-8 flex justify-center items-center">
            <button
              onClick={() => onNavigate("onboarding")}
              className="rounded-2xl bg-white text-brand-navy hover:bg-slate-100 px-12 py-6 font-black text-xl cursor-pointer shadow-2xl w-full sm:w-auto transition-transform hover:scale-105 hover:-translate-y-1 ring-4 ring-white/20"
            >
              Start Studying Smarter
            </button>
          </div>
        </motion.div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-gray-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 dark:bg-slate-950 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center text-xs text-gray-400 dark:text-slate-600 space-y-4">
          <span className="font-display font-black text-brand-navy dark:text-slate-500 text-lg">BlueBottleCap</span>
          <p className="font-mono text-[10px]">© 2026 BlueBottleCap Suite. All Rights Reserved.</p>
        </div>
      </footer>
    </div>
  );
};
