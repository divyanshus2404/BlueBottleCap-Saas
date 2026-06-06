import React, { useState } from 'react';
import { Sparkles } from 'lucide-react';

// Import the generated bottle image (transparent background)
import bottleImg from '../../assets/bottle_animation_1779953970540.png';

/**
 * BottleAnimation component showcases a sleek bottle that opens to reveal
 * feature highlights and professional quotes. The animation is self‑contained
 * and can be dropped into any page for a premium visual experience.
 */
const BottleAnimation: React.FC = () => {
  const [opened, setOpened] = useState(false);

  // Sample feature list and quotes – replace with real content as needed
  const features = [
    'Instant PDF summarization',
    'AI‑generated flashcards',
    'Study schedule optimizer',
    'Cross‑device sync',
  ];
  const quote = "Elevate your learning – let AI do the heavy lifting.";

  return (
    <div className="flex flex-col items-center space-y-4">
      {/* Bottle container */}
      <div
        className={`relative w-48 h-96 transition-transform duration-800 ease-out ${opened ? 'rotate-[-15deg] translate-y-[-10px]' : ''}`}
        onClick={() => setOpened(!opened)}
        style={{ cursor: 'pointer' }}
        aria-label="Toggle bottle animation"
      >
        {/* Bottle image – the visual of a closed glass bottle */}
        <img
          src={(bottleImg as any).src || bottleImg}
          alt="Glass bottle"
          className="w-full h-full object-contain pointer-events-none"
        />
        {/* Lid overlay – simple pseudo‑element effect */}
        <div
          className={`absolute inset-0 bg-white rounded-t-full transition-all duration-700 ${opened ? 'opacity-0 scale-0' : 'opacity-100'}`}
        />
      </div>

      {/* Content that appears after opening */}
      <div
        className={`max-w-md text-center transition-opacity duration-500 ${opened ? 'opacity-100' : 'opacity-0'}`}
        aria-live="polite"
      >
        <h3 className="font-display text-xl font-bold text-brand-navy mb-2">
          <Sparkles className="inline w-5 h-5 mr-1 text-amber-400" />
          What you get
        </h3>
        <ul className="list-disc list-inside text-gray-600 space-y-1 mb-4">
          {features.map((f) => (
            <li key={f}>{f}</li>
          ))}
        </ul>
        <blockquote className="italic text-gray-500 border-l-4 border-brand-cobalt pl-4">
          {quote}
        </blockquote>
      </div>
    </div>
  );
};

export default BottleAnimation;
