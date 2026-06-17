import React, { useRef, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Download, Share2, Sparkles, Target, Zap, Clock, Trophy } from "lucide-react";
import { toPng } from "html-to-image";
import { UserStats } from "../types";

interface WeeklyWrappedProps {
  onClose: () => void;
  userStats: UserStats;
}

export const WeeklyWrapped: React.FC<WeeklyWrappedProps> = ({ onClose, userStats }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

  // Derive mock fun stats for presentation if real stats are too low
  const displayStreak = Math.max(userStats.streakDays, 7);
  const displayHours = Math.max(userStats.hoursSaved, 14); // Use actual hours saved or mock minimum
  const topPercentile = Math.max(1, 100 - displayStreak * 2);

  // Random fun titles based on streak
  const getScholarTitle = () => {
    if (displayStreak > 30) return "Academic Weapon";
    if (displayStreak > 14) return "Quantum Genius";
    if (displayStreak > 7) return "Rising Scholar";
    return "Night Owl Student";
  };

  const handleShare = async () => {
    if (!cardRef.current) return;
    setIsCapturing(true);
    
    try {
      // Small delay to ensure any CSS animations or renders finish before capture
      await new Promise((resolve) => setTimeout(resolve, 300));
      
      const dataUrl = await toPng(cardRef.current, { 
        quality: 1, 
        pixelRatio: 2,
        style: {
          transform: 'none', // Prevent framer-motion scaling from affecting capture
          boxShadow: 'none'
        }
      });

      // Try native share if available (Mobile Safari/Chrome)
      if (navigator.share) {
        try {
          const blob = await (await fetch(dataUrl)).blob();
          const file = new File([blob], "my-weekly-wrapped.png", { type: blob.type });
          await navigator.share({
            title: "My Study Wrapped",
            text: `I'm in the top ${topPercentile}%! 🚀`,
            files: [file],
          });
        } catch (e) {
          console.log("Web Share API failed or was cancelled, falling back to download", e);
          triggerDownload(dataUrl);
        }
      } else {
        // Fallback to automatic download for Desktop
        triggerDownload(dataUrl);
      }
    } catch (err) {
      console.error("Failed to generate image", err);
      alert("Failed to generate image. Please try again.");
    } finally {
      setIsCapturing(false);
    }
  };

  const triggerDownload = (dataUrl: string) => {
    const link = document.createElement("a");
    link.download = "bluebottlecap-wrapped.png";
    link.href = dataUrl;
    link.click();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/90 backdrop-blur-xl font-sans">
      
      {/* Confetti Background Effect (Pure CSS) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-40">
        {[...Array(20)].map((_, i) => (
          <div 
            key={i} 
            className="absolute rounded-full bg-white animate-pulse"
            style={{
              width: Math.random() * 6 + 2 + 'px',
              height: Math.random() * 6 + 2 + 'px',
              top: Math.random() * 100 + '%',
              left: Math.random() * 100 + '%',
              animationDuration: (Math.random() * 2 + 1) + 's',
              animationDelay: Math.random() * 2 + 's'
            }}
          />
        ))}
      </div>

      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        className="relative w-full max-w-sm sm:max-w-md mx-auto"
      >
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute -top-12 right-0 p-2 bg-white/10 hover:bg-white/20 text-white rounded-full backdrop-blur-md transition z-10"
        >
          <X className="w-6 h-6" />
        </button>

        {/* The Capture Card */}
        <div 
          ref={cardRef} 
          className="relative rounded-[2rem] overflow-hidden shadow-2xl bg-slate-900 border border-slate-700/50"
          style={{ aspectRatio: "9/16", maxHeight: "80vh" }}
        >
          {/* Vibrant Gradients Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#120524] via-[#3B0764] to-[#0F172A]"></div>
          
          <div className="absolute -top-32 -left-32 w-64 h-64 bg-fuchsia-500 rounded-full mix-blend-screen filter blur-[80px] opacity-70"></div>
          <div className="absolute top-1/2 -right-32 w-80 h-80 bg-blue-500 rounded-full mix-blend-screen filter blur-[100px] opacity-60"></div>
          <div className="absolute -bottom-32 left-1/4 w-72 h-72 bg-violet-600 rounded-full mix-blend-screen filter blur-[90px] opacity-50"></div>

          {/* Noise overlay for texture */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E')" }}></div>

          {/* Card Content */}
          <div className="relative z-10 h-full w-full flex flex-col p-8 sm:p-10 justify-between">
            
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-400 to-indigo-500 flex items-center justify-center shadow-lg">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <span className="text-white font-bold tracking-wider text-xs uppercase opacity-90">BlueBottleCap</span>
              </div>
              <span className="text-white/60 font-medium text-xs tracking-widest uppercase">Weekly Insights</span>
            </div>

            {/* Main Stats Area */}
            <div className="space-y-8 flex-1 flex flex-col justify-center">
              
              <div className="space-y-2">
                <h2 className="text-white text-5xl sm:text-6xl font-black font-display leading-tight tracking-tight">
                  You were a <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 via-purple-400 to-blue-400">
                    {getScholarTitle()}
                  </span>
                </h2>
                <p className="text-white/80 text-lg">this week.</p>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-4">
                
                {/* Stat Block 1 */}
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10">
                  <div className="flex items-center gap-2 mb-2 text-fuchsia-300">
                    <Zap className="w-4 h-4" />
                    <span className="text-[10px] uppercase font-bold tracking-wider">Streak</span>
                  </div>
                  <div className="text-white text-3xl font-black font-display">
                    {displayStreak} <span className="text-lg font-medium text-white/60">Days</span>
                  </div>
                </div>

                {/* Stat Block 2 */}
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10">
                  <div className="flex items-center gap-2 mb-2 text-blue-300">
                    <Clock className="w-4 h-4" />
                    <span className="text-[10px] uppercase font-bold tracking-wider">Time Saved</span>
                  </div>
                  <div className="text-white text-3xl font-black font-display">
                    {displayHours} <span className="text-lg font-medium text-white/60">Hrs</span>
                  </div>
                </div>

                {/* Stat Block 3 */}
                <div className="col-span-2 bg-gradient-to-r from-white/10 to-transparent backdrop-blur-md rounded-2xl p-4 border border-white/10 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1 text-emerald-300">
                      <Trophy className="w-4 h-4" />
                      <span className="text-[10px] uppercase font-bold tracking-wider">Ranking</span>
                    </div>
                    <div className="text-white text-xl font-bold">
                      Top {topPercentile}% of all students
                    </div>
                  </div>
                  <div className="text-4xl">🚀</div>
                </div>

              </div>
            </div>

            {/* Footer */}
            <div className="flex flex-col gap-1 items-center justify-center pt-6 border-t border-white/10 mt-6">
              <p className="text-white/90 text-sm font-bold tracking-wide">
                2026 Season
              </p>
              <p className="text-white/40 text-[10px] tracking-widest uppercase">
                BlueBottleCap.ai
              </p>
            </div>

          </div>
        </div>

        {/* Action Buttons (Outside the capture card) */}
        <div className="mt-6 flex gap-3">
          <button 
            onClick={handleShare}
            disabled={isCapturing}
            className="flex-1 py-4 bg-gradient-to-r from-fuchsia-600 to-purple-600 hover:from-fuchsia-500 hover:to-purple-500 text-white rounded-2xl font-bold text-lg shadow-lg shadow-fuchsia-500/30 flex items-center justify-center gap-2 transition disabled:opacity-50"
          >
            {isCapturing ? (
              <span className="flex items-center gap-2">Processing...</span>
            ) : (
              <>
                <Share2 className="w-5 h-5" /> Share to IG / Snap
              </>
            )}
          </button>
          
          <button 
            onClick={handleShare}
            disabled={isCapturing}
            className="px-6 py-4 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl font-bold shadow-lg flex items-center justify-center transition disabled:opacity-50 border border-slate-700"
            title="Download PNG"
          >
            <Download className="w-5 h-5" />
          </button>
        </div>

      </motion.div>
    </div>
  );
};
