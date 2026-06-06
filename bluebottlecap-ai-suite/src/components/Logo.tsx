import React, { useId } from 'react';

interface LogoProps {
  className?: string;
  transparent?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ className = "w-6 h-6", transparent = false }) => {
  const maskId = useId();

  if (transparent) {
    return (
      <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <mask id={maskId}>
            {/* Keep everything by default */}
            <rect x="0" y="0" width="100" height="100" fill="white" />
            
            {/* Cut out central bottle */}
            <path 
              d="M 45,26.5 C 43.8,26.5 43.5,27.5 43.5,28.5 L 43.5,30.5 C 43.5,31.5 44.2,32 45,32 L 46.5,32 L 46.5,36 L 41.5,46 L 41.5,70 C 41.5,71.5 42.5,72.5 44,72.5 L 56,72.5 C 57.5,72.5 58.5,71.5 58.5,70 L 58.5,46 L 53.5,36 L 53.5,32 L 55,32 C 55.8,32 56.5,31.5 56.5,30.5 L 56.5,28.5 C 56.5,27.5 56.2,26.5 55,26.5 Z" 
              fill="black" 
            />
            
            {/* Cut out horizontal lines */}
            <path d="M 16,49.2 L 41.5,49.2 L 41.5,50.8 L 16,50.8 Z" fill="black" />
            <path d="M 84,49.2 L 58.5,49.2 L 58.5,50.8 L 84,50.8 Z" fill="black" />
            
            {/* Cut out flares */}
            <path d="M 32,49.2 L 41.5,46 L 41.5,54 L 32,50.8 Z" fill="black" />
            <path d="M 68,49.2 L 58.5,46 L 58.5,54 L 68,50.8 Z" fill="black" />
            
            {/* Cut out outer ring circle of nodes */}
            <circle cx="16" cy="50" r="5" fill="black" />
            <circle cx="84" cy="50" r="5" fill="black" />
          </mask>
        </defs>
        
        {/* Main background block with mask */}
        <path 
          d="M 16,16 L 50,26 L 84,16 L 84,84 L 50,74 L 16,84 Z" 
          fill="currentColor" 
          mask={`url(#${maskId})`} 
        />
        
        {/* Render the inner dots of the nodes */}
        <circle cx="16" cy="50" r="2.2" fill="currentColor" />
        <circle cx="84" cy="50" r="2.2" fill="currentColor" />
      </svg>
    );
  }

  // Standard version (with solid white cutout shapes)
  return (
    <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Background block */}
      <path d="M 16,16 L 50,26 L 84,16 L 84,84 L 50,74 L 16,84 Z" fill="currentColor" />
      
      {/* Left connector */}
      <path d="M 16,49.2 L 32,49.2 L 41.5,46 L 41.5,54 L 32,50.8 L 16,50.8 Z" fill="white" />
      
      {/* Right connector */}
      <path d="M 84,49.2 L 68,49.2 L 58.5,46 L 58.5,54 L 68,50.8 L 84,50.8 Z" fill="white" />
      
      {/* Bottle */}
      <path d="M 45,26.5 C 43.8,26.5 43.5,27.5 43.5,28.5 L 43.5,30.5 C 43.5,31.5 44.2,32 45,32 L 46.5,32 L 46.5,36 L 41.5,46 L 41.5,70 C 41.5,71.5 42.5,72.5 44,72.5 L 56,72.5 C 57.5,72.5 58.5,71.5 58.5,70 L 58.5,46 L 53.5,36 L 53.5,32 L 55,32 C 55.8,32 56.5,31.5 56.5,30.5 L 56.5,28.5 C 56.5,27.5 56.2,26.5 55,26.5 Z" fill="white" />
      
      {/* Left circle ring & center dot */}
      <circle cx="16" cy="50" r="5" fill="white" />
      <circle cx="16" cy="50" r="2.2" fill="currentColor" />
      
      {/* Right circle ring & center dot */}
      <circle cx="84" cy="50" r="5" fill="white" />
      <circle cx="84" cy="50" r="2.2" fill="currentColor" />
    </svg>
  );
};
