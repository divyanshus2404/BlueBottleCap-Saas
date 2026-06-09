import React, { useState } from "react";
import { flashcardsData as mockFlashcards } from "../data/flashcardsData";
import { ChevronRight, ChevronLeft, RotateCcw, Brain, CheckCircle, AlertTriangle, RefreshCw } from "lucide-react";
import { Flashcard } from "../types";

interface FlashcardsPageProps {
  flashcards?: Flashcard[];
  onUpdateFlashcard?: (id: string, updates: Partial<Flashcard>) => void;
}

export const FlashcardsPage: React.FC<FlashcardsPageProps> = ({ 
  flashcards = [], 
  onUpdateFlashcard 
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [filter, setFilter] = useState<string>("Due Today");

  // Merge user flashcards with mock data for display
  const allCards = [...flashcards, ...mockFlashcards];
  
  const categories = ["Due Today", "All", "Physics", "Chemistry", "Mathematics", "AI Academic Suite"];
  
  const filteredCards = allCards.filter(c => {
    if (filter === "All") return true;
    if (filter === "Due Today") {
      if (!c.nextReview) return true; // new cards are due
      return new Date(c.nextReview) <= new Date();
    }
    return c.category === filter;
  });
  
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

  const handleReview = (quality: number) => {
    if (!currentCard || !onUpdateFlashcard || currentCard.id.startsWith("mock-")) {
      nextCard();
      return;
    }

    // SuperMemo-2 (SM-2) Spaced Repetition Algorithm
    let { interval = 0, easeFactor = 2.5 } = currentCard;
    
    if (quality >= 3) {
      if (interval === 0) {
        interval = 1;
      } else if (interval === 1) {
        interval = 6;
      } else {
        interval = Math.round(interval * easeFactor);
      }
    } else {
      interval = 1; // Reset on fail
    }

    easeFactor = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
    if (easeFactor < 1.3) easeFactor = 1.3;

    const nextReviewDate = new Date();
    nextReviewDate.setDate(nextReviewDate.getDate() + interval);

    onUpdateFlashcard(currentCard.id, {
      interval,
      easeFactor,
      nextReview: nextReviewDate.toISOString(),
    });

    nextCard();
  };

  if (filteredCards.length === 0) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8 text-center">
        <h1 className="text-3xl font-black font-display text-brand-navy mb-4">Flashcards</h1>
        <div className="bg-white rounded-3xl border border-gray-100 p-12 shadow-sm">
          <Brain className="w-16 h-16 text-brand-cobalt mx-auto mb-4 opacity-50" />
          <h2 className="text-xl font-bold text-gray-700">You're all caught up!</h2>
          <p className="text-gray-500 mt-2">No flashcards {filter === "Due Today" ? "due for review today" : "in this category"}.</p>
          <div className="mt-6 flex justify-center gap-4">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => { setFilter(cat); setCurrentIndex(0); setIsFlipped(false); }}
                className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-colors whitespace-nowrap ${
                  filter === cat 
                    ? "bg-brand-cobalt text-white" 
                    : "text-gray-600 bg-gray-50 hover:bg-gray-100"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-col items-center justify-between sm:flex-row gap-4">
        <div>
          <h1 className="text-3xl font-black font-display text-brand-navy">Flashcards</h1>
          <p className="mt-1 text-sm text-gray-500">Spaced repetition for long-term retention.</p>
        </div>
        
        {/* Category Filters */}
        <div className="flex gap-2 bg-white p-1 rounded-xl shadow-sm border border-gray-100 overflow-x-auto max-w-full">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => { setFilter(cat); setCurrentIndex(0); setIsFlipped(false); }}
              className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-colors whitespace-nowrap ${
                filter === cat 
                  ? "bg-brand-cobalt text-white" 
                  : "text-gray-600 hover:bg-gray-50"
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
            <div className="absolute inset-0 backface-hidden bg-white border-2 border-gray-100 shadow-xl rounded-3xl p-8 flex flex-col items-center justify-center text-center group">
              <div className="absolute top-6 left-6 text-xs font-bold text-brand-cobalt bg-brand-cobalt/10 px-3 py-1 rounded-full">
                {currentCard.category} {currentCard.topic ? `• ${currentCard.topic}` : ''}
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-brand-navy leading-relaxed">
                {currentCard.question}
              </h2>
              <div className="absolute bottom-6 text-sm text-gray-400 font-medium flex items-center gap-2 opacity-50 group-hover:opacity-100 transition-opacity">
                <RotateCcw className="w-4 h-4" /> Click to flip
              </div>
            </div>

            {/* Back of Card */}
            <div className="absolute inset-0 backface-hidden rotate-y-180 bg-brand-navy text-white border-2 border-brand-navy shadow-xl rounded-3xl p-8 flex flex-col items-center justify-center text-center">
              <div className="absolute top-6 left-6 text-xs font-bold text-white/70 bg-white/10 px-3 py-1 rounded-full">
                Answer
              </div>
              <h2 className="text-2xl sm:text-3xl font-medium leading-relaxed overflow-y-auto max-h-[60%]">
                {currentCard.answer}
              </h2>
            </div>
          </div>
        </div>

        {/* Spaced Repetition Controls (Only visible when flipped) */}
        <div className={`mt-8 transition-opacity duration-300 w-full max-w-xl ${isFlipped ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
          <p className="text-center text-xs font-bold text-gray-400 mb-3 uppercase tracking-wider">How well did you know this?</p>
          <div className="grid grid-cols-3 gap-4">
            <button onClick={(e) => { e.stopPropagation(); handleReview(1); }} className="flex flex-col items-center gap-2 p-3 rounded-2xl border-2 border-red-100 bg-red-50 hover:bg-red-100 text-red-600 transition">
              <AlertTriangle className="w-6 h-6" />
              <span className="text-sm font-bold">Again</span>
              <span className="text-xs opacity-70">&lt; 1m</span>
            </button>
            <button onClick={(e) => { e.stopPropagation(); handleReview(3); }} className="flex flex-col items-center gap-2 p-3 rounded-2xl border-2 border-amber-100 bg-amber-50 hover:bg-amber-100 text-amber-600 transition">
              <RefreshCw className="w-6 h-6" />
              <span className="text-sm font-bold">Hard</span>
              <span className="text-xs opacity-70">1d</span>
            </button>
            <button onClick={(e) => { e.stopPropagation(); handleReview(5); }} className="flex flex-col items-center gap-2 p-3 rounded-2xl border-2 border-emerald-100 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 transition">
              <CheckCircle className="w-6 h-6" />
              <span className="text-sm font-bold">Got It</span>
              <span className="text-xs opacity-70">4d</span>
            </button>
          </div>
        </div>

        {/* Standard Controls */}
        <div className={`flex items-center gap-6 mt-8 transition-opacity duration-300 ${isFlipped ? 'opacity-0' : 'opacity-100'}`}>
          <button 
            onClick={prevCard}
            className="w-12 h-12 rounded-full bg-white border border-gray-200 shadow-sm flex items-center justify-center text-gray-600 hover:text-brand-cobalt hover:border-brand-cobalt transition-colors"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          
          <div className="text-sm font-bold text-gray-500 font-mono bg-white px-4 py-2 rounded-xl border border-gray-100 shadow-3xs">
            {currentIndex + 1} / {filteredCards.length}
          </div>

          <button 
            onClick={nextCard}
            className="w-12 h-12 rounded-full bg-white border border-gray-200 shadow-sm flex items-center justify-center text-gray-600 hover:text-brand-cobalt hover:border-brand-cobalt transition-colors"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
};
