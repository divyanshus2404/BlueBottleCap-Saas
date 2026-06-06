const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const startStr = '      {currentView === "landing" && (';
const endStr = '      {currentView === "onboarding" && (';

const startIndex = code.indexOf(startStr);
const endIndex = code.indexOf(endStr);

if (startIndex === -1 || endIndex === -1) {
    console.log("Could not find start or end strings!");
    process.exit(1);
}

const replacement = `      {currentView === "landing" && (
        <div className="fade-in">
          {/* HERO SECTION */}
          <section className="relative overflow-hidden pt-16 pb-20 md:pt-24 md:pb-28">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10 text-center">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-brand-cobalt/5 px-4 py-1.5 text-xs font-semibold text-brand-cobalt">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Crack JEE on your first attempt</span>
              </div>
              
              <h1 className="mt-6 font-display text-4.5xl font-black tracking-tight text-brand-navy sm:text-6xl md:text-7xl leading-tight max-w-4xl mx-auto">
                The ultimate arsenal for{" "}
                <span className="bg-linear-to-r from-brand-cobalt to-indigo-600 bg-clip-text text-transparent">
                  JEE Mains & Advanced.
                </span>
              </h1>
              
              <p className="mt-6 mx-auto max-w-2xl text-base text-gray-500 md:text-lg leading-relaxed">
                Stop wasting time gathering scattered notes. Get premium study material, All India mock tests, and advice from IITians — all in one place.
              </p>

              {/* MOCK DASHBOARD PREVIEW UI */}
              <div className="mt-14 max-w-5xl mx-auto relative group perspective-1000">
                <div className="absolute inset-0 bg-linear-to-b from-brand-sky/20 to-transparent blur-3xl opacity-50 rounded-[3rem] -z-10 transition duration-700 group-hover:opacity-70 group-hover:scale-105"></div>
                
                <div className="relative rounded-2xl md:rounded-[2rem] border border-slate-200/60 bg-white/50 backdrop-blur-sm p-2 md:p-3 shadow-2xl transition duration-500 hover:shadow-brand-cobalt/10">
                  <div className="absolute inset-x-0 -top-px h-px bg-linear-to-r from-transparent via-brand-cobalt/30 to-transparent"></div>
                  
                  {/* BROWSER BAR MOCK */}
                  <div className="rounded-xl md:rounded-3xl overflow-hidden bg-white border border-slate-100 shadow-sm relative z-10">
                    <div className="flex items-center justify-between px-4 py-3 bg-slate-50 border-b border-slate-100">
                      <div className="flex space-x-2">
                        <div className="w-3 h-3 rounded-full bg-red-400"></div>
                        <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                        <div className="w-3 h-3 rounded-full bg-emerald-400"></div>
                      </div>
                      <div className="flex-1 px-4 flex justify-center">
                        <div className="bg-slate-200/50 rounded-md px-32 py-1.5 text-[9px] font-mono text-slate-400 flex items-center gap-2">
                          <span>🔒</span> bluebottlecap.com/workspace
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-8 pb-16 bg-slate-50 flex justify-center">
                      <div className="max-w-md text-left w-full space-y-6">
                        <div className="flex items-center gap-3">
                           <div className="w-12 h-12 rounded-xl bg-brand-cobalt/10 flex items-center justify-center font-bold text-brand-cobalt text-xl">S</div>
                           <div>
                             <div className="font-bold text-slate-800">Welcome back, Scholar</div>
                             <div className="text-xs text-slate-500">Your study streak is on fire! 🔥</div>
                           </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                           <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
                             <div className="text-xs font-bold text-slate-400 mb-1">MOCK TESTS</div>
                             <div className="text-2xl font-black text-brand-navy">12<span className="text-sm font-medium text-slate-400 ml-1">completed</span></div>
                           </div>
                           <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
                             <div className="text-xs font-bold text-slate-400 mb-1">CHAPTERS REVISED</div>
                             <div className="text-2xl font-black text-brand-navy">34<span className="text-sm font-medium text-slate-400 ml-1">/ 90</span></div>
                           </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* EMOTIONAL PAIN POINT SECTION */}
          <section className="py-20 bg-slate-50 border-y border-gray-100 text-center">
            <div className="mx-auto max-w-3xl px-4">
              <h2 className="text-3xl font-black font-display text-brand-navy mb-6">Stop searching for the "perfect" notes.</h2>
              <p className="text-lg text-gray-600 leading-relaxed">
                You spend more time looking for good study material and downloading scattered PDFs than actually studying. Stop wasting your energy. We compiled the absolute best chapter-wise notes, formulas, and mock tests so you can just sit down and study.
              </p>
            </div>
          </section>

          {/* HOW IT WORKS */}
          <section className="py-20 bg-white">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
              <h2 className="text-3.5xl font-black font-display text-brand-navy mb-16">Everything you need to clear the cutoff.</h2>
              
              <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 rounded-2xl bg-brand-cobalt/10 text-brand-cobalt flex items-center justify-center text-2xl font-bold mb-6">📚</div>
                  <h3 className="text-xl font-bold text-brand-navy mb-3">Premium Notes</h3>
                  <p className="text-gray-500">Access exhaustive, topper-grade notes for Physics, Chemistry, and Math.</p>
                </div>
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 rounded-2xl bg-brand-cobalt/10 text-brand-cobalt flex items-center justify-center text-2xl font-bold mb-6">⏱️</div>
                  <h3 className="text-xl font-bold text-brand-navy mb-3">Virtual Test Mode</h3>
                  <p className="text-gray-500">Practice past papers in an exam-like environment with an active timer.</p>
                </div>
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 rounded-2xl bg-brand-cobalt/10 text-brand-cobalt flex items-center justify-center text-2xl font-bold mb-6">🗣️</div>
                  <h3 className="text-xl font-bold text-brand-navy mb-3">Seniors Opinion</h3>
                  <p className="text-gray-500">Read advice, strategies, and download handwritten notes directly from IITians.</p>
                </div>
              </div>

              {/* CTA */}
              <div className="mt-14">
                <button
                  onClick={() => navigateToView("study-material-page")}
                  className="inline-flex items-center gap-2.5 bg-brand-navy hover:bg-brand-cobalt text-white font-bold text-base px-8 py-4 rounded-2xl transition-all duration-200 shadow-lg hover:shadow-xl hover:-translate-y-0.5 cursor-pointer"
                >
                  <span>Explore Study Material</span>
                  <BookOpen className="w-5 h-5" />
                </button>
                <p className="text-xs text-gray-400 font-medium mt-3">Free preview available · No signup needed</p>
              </div>
            </div>
          </section>

          {/* COACHING COMPARISON */}
          <section className="py-24 bg-white border-b border-gray-100">
            <div className="mx-auto max-w-5xl px-4 text-center">
              <h2 className="text-3.5xl font-black font-display text-brand-navy mb-16">Traditional Coaching vs <br/>BlueBottleCap</h2>
              
              <div className="overflow-hidden border border-gray-200 rounded-3xl shadow-sm text-left text-sm md:text-base">
                <div className="grid grid-cols-3 bg-slate-50 border-b border-gray-200 font-bold text-brand-navy p-6">
                  <div className="col-span-1">Feature</div>
                  <div className="col-span-1 text-gray-500">Traditional Coaching</div>
                  <div className="col-span-1 text-brand-cobalt">BlueBottleCap</div>
                </div>
                
                <div className="grid grid-cols-3 border-b border-gray-100 p-6">
                  <div className="col-span-1 font-bold text-gray-700">Cost</div>
                  <div className="col-span-1 text-gray-500 pr-4">₹1,00,000+ per year</div>
                  <div className="col-span-1 font-medium text-brand-navy">₹281 for full lifetime access.</div>
                </div>
                
                <div className="grid grid-cols-3 border-b border-gray-100 p-6">
                  <div className="col-span-1 font-bold text-gray-700">Study Material</div>
                  <div className="col-span-1 text-gray-500 pr-4">Heavy, outdated physical books.</div>
                  <div className="col-span-1 font-medium text-brand-navy">Digital, updated, and concise chapter-wise notes.</div>
                </div>

                <div className="grid grid-cols-3 border-b border-gray-100 p-6">
                  <div className="col-span-1 font-bold text-gray-700">Mock Tests</div>
                  <div className="col-span-1 text-gray-500 pr-4">Rigid schedule, fixed timings.</div>
                  <div className="col-span-1 font-medium text-brand-navy">Take full syllabus mock tests whenever you want.</div>
                </div>

                <div className="grid grid-cols-3 p-6">
                  <div className="col-span-1 font-bold text-gray-700">Guidance</div>
                  <div className="col-span-1 text-gray-500 pr-4">Hard to reach teachers.</div>
                  <div className="col-span-1 font-medium text-brand-navy">Direct forum advice from recent graduates.</div>
                </div>
              </div>
            </div>
          </section>

          {/* TESTIMONIALS / TRUST */}
          <section className="py-20 bg-slate-50 border-b border-gray-100">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
              <h2 className="text-3xl font-black font-display text-brand-navy mb-4">Built for serious aspirants.</h2>
              <p className="text-gray-500 mb-12 font-medium">Trusted by students across India aiming for IITs and NITs.</p>
              
              <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto text-left">
                <div className="bg-white p-8 rounded-3xl border border-gray-200 shadow-sm relative">
                  <div className="text-brand-cobalt text-4xl mb-4 font-serif">"</div>
                  <p className="text-gray-700 leading-relaxed font-medium mb-6">I was struggling with Physics until I found the notes here. The derivation breakdowns and common mistakes sections literally saved me. Also the mock test UI feels exactly like the real JEE exam.</p>
                  <div className="font-bold text-brand-navy">Rahul S.</div>
                  <div className="text-sm text-gray-500">JEE Mains 99.2 %ile</div>
                </div>

                <div className="bg-white p-8 rounded-3xl border border-gray-200 shadow-sm relative">
                  <div className="text-brand-cobalt text-4xl mb-4 font-serif">"</div>
                  <p className="text-gray-700 leading-relaxed font-medium mb-6">The Seniors Opinion forum is gold. I downloaded a handwritten organic chemistry short notes PDF from an IIT Delhi senior and it cleared all my doubts in 2 hours.</p>
                  <div className="font-bold text-brand-navy">Ananya M.</div>
                  <div className="text-sm text-gray-500">Dropper</div>
                </div>
              </div>
            </div>
          </section>

          {/* CTA SECTION */}
          <section className="py-24 text-center relative overflow-hidden bg-brand-navy text-white">
            <div className="mx-auto max-w-4xl px-4 relative z-10 space-y-8">
              <h2 className="font-display text-4xl sm:text-5xl font-black tracking-tight leading-tight">
                Stop procrastinating.
              </h2>
              <p className="text-lg text-slate-300 max-w-xl mx-auto">
                Join thousands of students and start your serious prep tonight.
              </p>
              <div className="pt-4 flex justify-center items-center">
                <button
                  onClick={() => navigateToView("study-material-page")}
                  className="rounded-xl bg-brand-cobalt hover:bg-indigo-500 text-white px-10 py-5 font-bold text-lg cursor-pointer shadow-xl w-full sm:w-auto transition hover:scale-105"
                >
                  Start Studying Smarter
                </button>
              </div>
            </div>
          </section>

          {/* FOOTER */}
          <footer className="border-t border-gray-100 bg-slate-50/40 py-12">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center text-xs text-gray-400 space-y-4">
              <span className="font-display font-black text-brand-navy">BlueBottleCap</span>
              <p className="font-mono text-[10px]">© 2026 BlueBottleCap Suite. All Rights Reserved.</p>
            </div>
          </footer>

        </div>
      )}
`;

code = code.substring(0, startIndex) + replacement + code.substring(endIndex);
fs.writeFileSync('src/App.tsx', code);
console.log("Rewrote src/App.tsx successfully!");
