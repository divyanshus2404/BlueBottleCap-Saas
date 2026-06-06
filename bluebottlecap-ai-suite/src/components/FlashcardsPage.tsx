import React, { useState } from "react";
import { flashcardsData } from "../data/flashcardsData";
import { ChevronRight, ChevronLeft, RotateCcw } from "lucide-react";

export const FlashcardsPage: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [filter, setFilter] = useState<string>("All");

  const categories = ["All", "Physics", "Chemistry", "Mathematics"];
  const filteredCards = filter === "All" ? flashcardsData : flashcardsData.filter(c => c.category === filter);
  
  const currentCard = filteredCards[currentIndex];

  const nextCard = () => {
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % filteredCards.length);
    }, 150);
  };

  const prevCard = () => {
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev - 1 + filteredCards.length) % filteredCards.length);
    }, 150);
  };

  if (filteredCards.length === 0) {
    return <div className="p-8 text-center dark:text-white">No flashcards available for this category.</div>;
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-col items-center justify-between sm:flex-row gap-4">
        <div>
          <h1 className="text-3xl font-black font-display text-brand-navy dark:text-white">Flashcards</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">Quick revision for critical formulas and reactions.</p>
        </div>
        
        {/* Category Filters */}
        <div className="flex gap-2 bg-white dark:bg-slate-900 p-1 rounded-xl shadow-sm border border-gray-100 dark:border-slate-800 overflow-x-auto max-w-full">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => { setFilter(cat); setCurrentIndex(0); setIsFlipped(false); }}
              className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-colors whitespace-nowrap ${
                filter === cat 
                  ? "bg-brand-cobalt text-white" 
                  : "text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Flashcard Viewer */}
      <div className="flex flex-col items-center mt-12">
        <div className="w-full max-w-2xl perspective-1000">
          <div 
            onClick={() => setIsFlipped(!isFlipped)}
            className={`relative w-full h-80 sm:h-96 rounded-3xl cursor-pointer transition-all duration-500 transform-style-3d ${
              isFlipped ? "rotate-y-180" : ""
            }`}
          >
            {/* Front of Card */}
            <div className="absolute inset-0 backface-hidden bg-white dark:bg-slate-900 border-2 border-gray-100 dark:border-slate-800 shadow-xl rounded-3xl p-8 flex flex-col items-center justify-center text-center group">
              <div className="absolute top-6 left-6 text-xs font-bold text-brand-cobalt dark:text-blue-400 bg-brand-cobalt/10 dark:bg-brand-cobalt/20 px-3 py-1 rounded-full">
                {currentCard.category} • {currentCard.topic}
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-brand-navy dark:text-white leading-relaxed">
                {currentCard.question}
              </h2>
              <div className="absolute bottom-6 text-sm text-gray-400 dark:text-slate-500 font-medium flex items-center gap-2 opacity-50 group-hover:opacity-100 transition-opacity">
                <RotateCcw className="w-4 h-4" /> Click to flip
              </div>
            </div>

            {/* Back of Card */}
            <div className="absolute inset-0 backface-hidden rotate-y-180 bg-brand-navy dark:bg-brand-cobalt text-white border-2 border-brand-navy dark:border-brand-cobalt shadow-xl rounded-3xl p-8 flex flex-col items-center justify-center text-center">
              <div className="absolute top-6 left-6 text-xs font-bold text-white/70 bg-white/10 px-3 py-1 rounded-full">
                Answer
              </div>
              <h2 className="text-2xl sm:text-3xl font-medium leading-relaxed">
                {currentCard.answer}
              </h2>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-6 mt-10">
          <button 
            onClick={prevCard}
            className="w-12 h-12 rounded-full bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 shadow-sm flex items-center justify-center text-gray-600 dark:text-slate-400 hover:text-brand-cobalt hover:border-brand-cobalt transition-colors"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          
          <div className="text-sm font-bold text-gray-500 dark:text-slate-400 font-mono">
            {currentIndex + 1} / {filteredCards.length}
          </div>

          <button 
            onClick={nextCard}
            className="w-12 h-12 rounded-full bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 shadow-sm flex items-center justify-center text-gray-600 dark:text-slate-400 hover:text-brand-cobalt hover:border-brand-cobalt transition-colors"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
};
