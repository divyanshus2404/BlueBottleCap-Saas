import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Map, Network, ArrowRight, CheckCircle2, CircleDashed, Users, Plus, Loader2, Target } from "lucide-react";
import { ActiveView, Roadmap, PeerGroup } from "../types";

// Mock AI generated roadmaps
const mockRoadmaps: Record<string, Roadmap> = {
  default: {
    id: "rm-1",
    title: "Master Quantum Mechanics",
    prompt: "quantum mechanics in 3 months",
    nodes: [
      { id: "n-1", title: "Linear Algebra Fundamentals", description: "Vectors, Matrices, Eigenvalues & Eigenvectors", status: "completed", duration: "Week 1-2" },
      { id: "n-2", title: "Classical Mechanics Review", description: "Hamiltonian & Lagrangian formulations", status: "current", duration: "Week 3" },
      { id: "n-3", title: "Schrödinger Equation", description: "Wave functions, probability, 1D potentials", status: "locked", duration: "Week 4-5" },
      { id: "n-4", title: "Quantum Harmonic Oscillator", description: "Algebraic method, creation & annihilation operators", status: "locked", duration: "Week 6-7" },
      { id: "n-5", title: "Angular Momentum & Spin", description: "Commutation relations, Pauli matrices", status: "locked", duration: "Week 8-9" },
      { id: "n-6", title: "Perturbation Theory", description: "Time-independent approximations", status: "locked", duration: "Week 10-12" },
    ],
    coincidingGroups: [
      { id: "g-1", name: "Schrödinger's Cats", avatar: "🐱", members: 12, currentNodeId: "n-2" },
      { id: "g-2", name: "Matrix Masters", avatar: "🤓", members: 5, currentNodeId: "n-3" },
      { id: "g-3", name: "Spin Doctors", avatar: "🌀", members: 28, currentNodeId: "n-5" },
    ]
  }
};

export const RoadmapBuilder: React.FC<{ onNavigate: (view: ActiveView) => void }> = ({ onNavigate }) => {
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeRoadmap, setActiveRoadmap] = useState<Roadmap | null>(null);
  const [nodesRevealed, setNodesRevealed] = useState(0);
  const [requestedGroups, setRequestedGroups] = useState<Record<string, boolean>>({});

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);
    setActiveRoadmap(null);
    setNodesRevealed(0);

    try {
      const res = await fetch("/api/gemini/generate-roadmap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      if (!res.ok) throw new Error("Failed to generate roadmap");
      const data = await res.json();
      
      setActiveRoadmap({
        id: `rm-${Date.now()}`,
        title: `Path: ${prompt}`,
        prompt,
        nodes: data.nodes || [],
        coincidingGroups: data.coincidingGroups || []
      });
    } catch (err) {
      console.error(err);
      // Fallback if API fails
      setActiveRoadmap({ ...mockRoadmaps.default, title: `Path: ${prompt}`, prompt });
    } finally {
      setIsGenerating(false);
    }
  };

  // Node reveal effect
  useEffect(() => {
    if (activeRoadmap && nodesRevealed < activeRoadmap.nodes.length) {
      const timer = setTimeout(() => {
        setNodesRevealed(prev => prev + 1);
      }, 600); // Reveal one node every 600ms
      return () => clearTimeout(timer);
    }
  }, [activeRoadmap, nodesRevealed]);

  const handleJoinGroup = (groupId: string) => {
    setRequestedGroups(prev => ({ ...prev, [groupId]: true }));
  };

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 min-h-[calc(100vh-64px)] relative font-sans custom-scrollbar">
      
      {/* Dynamic Grid Background */}
      <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#4f46e5 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>

      <div className="max-w-6xl mx-auto p-4 lg:p-10 relative z-10 pt-12">
        
        {/* Header Search Section */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-6 mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-bold tracking-wide uppercase">
            <Sparkles className="w-4 h-4" />
            AI Roadmap Architect
          </div>
          <h1 className="text-4xl md:text-5xl font-black font-display tracking-tight text-slate-900">
            Map your <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-cobalt to-indigo-500">Academic Journey</span>
          </h1>
          <p className="text-slate-500 max-w-xl mx-auto text-sm md:text-base">
            Enter your ultimate goal, and our AI will forge a realistic, step-by-step roadmap. Plus, discover and join study groups of peers on the exact same path.
          </p>

          <div className="max-w-2xl mx-auto relative group mt-8">
            <div className="absolute inset-0 bg-brand-cobalt/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition duration-500 pointer-events-none"></div>
            <div className="relative flex items-center bg-white rounded-full border border-slate-200 shadow-sm overflow-hidden p-1.5 focus-within:ring-2 focus-within:ring-brand-cobalt focus-within:border-brand-cobalt transition-all">
              <div className="pl-4">
                <Target className="w-5 h-5 text-slate-400" />
              </div>
              <input 
                type="text" 
                placeholder="E.g. Crack JEE Advanced 2027 starting from scratch..." 
                className="flex-1 bg-transparent border-none outline-none px-4 py-3 text-sm md:text-base text-slate-800 placeholder-slate-400"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
              />
              <button 
                onClick={handleGenerate}
                disabled={isGenerating || !prompt.trim()}
                className="bg-brand-cobalt hover:bg-indigo-700 text-white rounded-full px-6 py-3 font-bold text-sm shadow-md transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 cursor-pointer"
              >
                {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Map className="w-4 h-4" />}
                <span className="hidden sm:inline">Generate</span>
              </button>
            </div>
          </div>
        </motion.div>

        {/* Loading State */}
        <AnimatePresence>
          {isGenerating && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="py-20 flex flex-col items-center justify-center space-y-6"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-indigo-500 blur-2xl opacity-30 rounded-full animate-pulse"></div>
                <div className="w-20 h-20 bg-white rounded-full shadow-lg flex items-center justify-center relative z-10 border border-indigo-100">
                  <Network className="w-10 h-10 text-indigo-600 animate-pulse" />
                </div>
              </div>
              <div className="text-center space-y-2">
                <h3 className="text-xl font-bold text-slate-800 font-display">Forging your path...</h3>
                <p className="text-sm text-slate-500">Analyzing prerequisites, gathering materials, locating peers.</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Generated Roadmap */}
        {activeRoadmap && !isGenerating && (
          <div className="mt-12 lg:grid lg:grid-cols-12 gap-8 items-start pb-20">
            
            
            {/* The Timeline Graph */}
            <div className="lg:col-span-8 relative w-full pt-10">
              
              {/* Central DNA Spine */}
              <div className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-1.5 bg-indigo-100 rounded-full overflow-hidden">
                <motion.div 
                  className="w-full bg-gradient-to-b from-brand-cobalt via-indigo-500 to-purple-500 origin-top"
                  initial={{ scaleY: 0 }}
                  animate={{ scaleY: nodesRevealed / activeRoadmap.nodes.length }}
                  transition={{ duration: 0.5, ease: "easeInOut" }}
                  style={{ transformOrigin: "top" }}
                />
              </div>

              <div className="space-y-16 lg:space-y-24 relative z-10 pb-20">
                {activeRoadmap.nodes.map((node, idx) => {
                  const isRevealed = idx < nodesRevealed;
                  const groupsAtThisNode = activeRoadmap.coincidingGroups.filter(g => g.currentNodeId === node.id);
                  const isEven = idx % 2 === 0;

                  return (
                    <motion.div 
                      key={node.id}
                      initial={{ opacity: 0, y: 30, filter: "blur(10px)" }}
                      animate={isRevealed ? { opacity: 1, y: 0, filter: "blur(0px)" } : {}}
                      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
                      className={`relative w-full flex items-center ${!isRevealed ? 'hidden' : ''} ${isEven ? 'justify-start' : 'justify-end'}`}
                    >
                      
                      {/* Desktop Layout (Alternating DNA Structure) */}
                      <div className="hidden lg:flex items-center w-full relative">
                        {/* Node Content Container - Left Side */}
                        {isEven && (
                          <div className="w-[45%] pr-12 text-right flex justify-end">
                            <div className={`w-full max-w-sm bg-white rounded-3xl p-6 border shadow-sm transition-all duration-500 hover:-translate-y-1 hover:shadow-xl relative ${
                              node.status === 'current' ? 'border-brand-cobalt shadow-indigo-100 ring-2 ring-indigo-500/20' : 'border-slate-200'
                            }`}>
                              <h3 className="text-xl font-bold text-slate-900 mb-2 font-display">{node.title}</h3>
                              <p className="text-sm text-slate-600 leading-relaxed">{node.description}</p>
                              {groupsAtThisNode.length > 0 && (
                                <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col items-end">
                                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                                    Peers currently here <Users className="w-3 h-3" />
                                  </p>
                                  <div className="flex flex-wrap justify-end gap-2">
                                    {groupsAtThisNode.map(group => (
                                      <div key={group.id} className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-full pl-2 pr-1 py-1">
                                        <span className="text-[10px] text-slate-500 tracking-tighter">({group.members})</span>
                                        <span className="text-xs font-bold text-slate-700">{group.name}</span>
                                        <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-xs text-xs border border-slate-100">{group.avatar}</div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                              
                              {/* Curved Connector Line to Center */}
                              <svg className="absolute top-1/2 -right-[48px] w-[48px] h-2 -translate-y-1/2 z-[-1]" preserveAspectRatio="none">
                                <path d="M 0 4 Q 24 4 48 4" stroke={node.status === 'completed' ? '#10b981' : node.status === 'current' ? '#4f46e5' : '#e2e8f0'} strokeWidth="3" fill="none" strokeDasharray={node.status === 'locked' ? '4 4' : 'none'} className={node.status === 'current' ? 'animate-pulse' : ''} />
                              </svg>
                            </div>
                          </div>
                        )}

                        {/* Center Icon */}
                        <div className="absolute left-1/2 -translate-x-1/2 z-20">
                          <motion.div 
                            animate={node.status === 'current' ? { y: [0, -5, 0] } : {}}
                            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                            className={`w-16 h-16 rounded-full flex flex-col items-center justify-center border-4 shadow-lg backdrop-blur-md ${
                              node.status === 'completed' ? 'bg-emerald-500 text-white border-white shadow-emerald-500/30' :
                              node.status === 'current' ? 'bg-brand-cobalt text-white border-white shadow-brand-cobalt/40 ring-4 ring-indigo-500/20' :
                              'bg-white text-slate-400 border-slate-200 shadow-slate-200/50'
                            }`}
                          >
                            {node.status === 'completed' && <CheckCircle2 className="w-6 h-6 mb-0.5" />}
                            {node.status === 'current' && <ArrowRight className="w-6 h-6 mb-0.5" />}
                            {node.status === 'locked' && <CircleDashed className="w-6 h-6 mb-0.5" />}
                            <span className="text-[9px] font-bold uppercase tracking-wider">{node.duration}</span>
                          </motion.div>
                        </div>

                        {/* Node Content Container - Right Side */}
                        {!isEven && (
                          <div className="w-[45%] pl-12 ml-auto flex justify-start">
                            <div className={`w-full max-w-sm bg-white rounded-3xl p-6 border shadow-sm transition-all duration-500 hover:-translate-y-1 hover:shadow-xl relative ${
                              node.status === 'current' ? 'border-brand-cobalt shadow-indigo-100 ring-2 ring-indigo-500/20' : 'border-slate-200'
                            }`}>
                              <h3 className="text-xl font-bold text-slate-900 mb-2 font-display">{node.title}</h3>
                              <p className="text-sm text-slate-600 leading-relaxed">{node.description}</p>
                              {groupsAtThisNode.length > 0 && (
                                <div className="mt-4 pt-4 border-t border-slate-100">
                                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                                    <Users className="w-3 h-3" /> Peers currently here
                                  </p>
                                  <div className="flex flex-wrap gap-2">
                                    {groupsAtThisNode.map(group => (
                                      <div key={group.id} className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-full pl-1 pr-3 py-1">
                                        <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-xs text-xs border border-slate-100">{group.avatar}</div>
                                        <span className="text-xs font-bold text-slate-700">{group.name}</span>
                                        <span className="text-[10px] text-slate-500 tracking-tighter">({group.members})</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                              
                              {/* Curved Connector Line to Center */}
                              <svg className="absolute top-1/2 -left-[48px] w-[48px] h-2 -translate-y-1/2 z-[-1]" preserveAspectRatio="none">
                                <path d="M 0 4 Q 24 4 48 4" stroke={node.status === 'completed' ? '#10b981' : node.status === 'current' ? '#4f46e5' : '#e2e8f0'} strokeWidth="3" fill="none" strokeDasharray={node.status === 'locked' ? '4 4' : 'none'} className={node.status === 'current' ? 'animate-pulse' : ''} />
                              </svg>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Mobile Layout (Standard vertical list, hidden on large screens) */}
                      <div className="lg:hidden flex w-full relative pl-8">
                        {/* Mobile Icon */}
                        <div className="absolute left-[-24px] top-1/2 -translate-y-1/2 z-20">
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center border-4 shadow-sm ${
                            node.status === 'completed' ? 'bg-emerald-500 text-white border-white' :
                            node.status === 'current' ? 'bg-brand-cobalt text-white border-white ring-2 ring-indigo-500/20' :
                            'bg-white text-slate-400 border-slate-200'
                          }`}>
                            {node.status === 'completed' && <CheckCircle2 className="w-5 h-5" />}
                            {node.status === 'current' && <ArrowRight className="w-5 h-5" />}
                            {node.status === 'locked' && <CircleDashed className="w-5 h-5" />}
                          </div>
                        </div>

                        <div className={`w-full bg-white rounded-2xl p-5 border shadow-sm relative ${
                          node.status === 'current' ? 'border-brand-cobalt shadow-indigo-100 ring-1 ring-indigo-500/20' : 'border-slate-200'
                        }`}>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 block">{node.duration}</span>
                          <h3 className="text-lg font-bold text-slate-900 mb-1.5 font-display">{node.title}</h3>
                          <p className="text-sm text-slate-600">{node.description}</p>
                          {groupsAtThisNode.length > 0 && (
                            <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap gap-2">
                                {groupsAtThisNode.map(group => (
                                  <div key={group.id} className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-full pl-1 pr-2 py-1">
                                    <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center text-[10px] border border-slate-100">{group.avatar}</div>
                                    <span className="text-[10px] font-bold text-slate-700">{group.name}</span>
                                  </div>
                                ))}
                            </div>
                          )}
                        </div>
                      </div>

                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Sidebar Networking Panel */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: nodesRevealed > 1 ? 1 : 0, x: nodesRevealed > 1 ? 0 : 20 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="lg:col-span-4 mt-12 lg:mt-0 sticky top-24"
            >
              <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xl shadow-slate-200/50 relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-brand-cobalt to-indigo-500"></div>
                
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-indigo-50 rounded-xl">
                    <Network className="w-5 h-5 text-brand-cobalt" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">Coinciding Journeys</h3>
                    <p className="text-xs text-slate-500">Peers on this exact path</p>
                  </div>
                </div>

                <div className="space-y-4">
                  {activeRoadmap.coincidingGroups.map((group, idx) => {
                    const isRequested = requestedGroups[group.id];
                    return (
                      <motion.div 
                        key={group.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.8 + (idx * 0.1) }}
                        className="p-4 rounded-2xl border border-slate-100 bg-slate-50 hover:bg-white hover:border-indigo-100 transition-colors group/card"
                      >
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 rounded-full bg-white shadow-sm border border-slate-200 flex items-center justify-center text-xl">
                            {group.avatar}
                          </div>
                          <div>
                            <h4 className="font-bold text-sm text-slate-900">{group.name}</h4>
                            <p className="text-xs text-slate-500">{group.members} active members</p>
                          </div>
                        </div>
                        
                        <button
                          onClick={() => handleJoinGroup(group.id)}
                          disabled={isRequested}
                          className={`w-full py-2 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                            isRequested 
                              ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                              : 'bg-white border border-slate-200 text-slate-700 hover:bg-brand-cobalt hover:text-white hover:border-brand-cobalt shadow-xs'
                          }`}
                        >
                          {isRequested ? (
                            <><CheckCircle2 className="w-3.5 h-3.5" /> Request Sent</>
                          ) : (
                            <><Plus className="w-3.5 h-3.5" /> Ask to Join</>
                          )}
                        </button>
                      </motion.div>
                    );
                  })}
                </div>
                
                <div className="mt-6 pt-5 border-t border-slate-100 text-center">
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">
                    Group matchmaking is powered by AI
                  </p>
                </div>
              </div>
            </motion.div>

          </div>
        )}
      </div>
    </div>
  );
};
