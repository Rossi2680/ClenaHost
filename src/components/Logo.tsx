import React from 'react';

interface LogoProps {
  showSlogan?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'giant';
}

export default function Logo({ showSlogan = false, size = 'md' }: LogoProps) {
  // Dimensions & typography classes for perfect proportional scaling
  const sizeConfig = {
    sm: {
      badge: 'w-10 h-10',
      text: 'text-2xl',
      slogan: 'text-xs',
      dividerWidth: 'max-w-[150px]'
    },
    md: {
      badge: 'w-14 h-14',
      text: 'text-3.5xl',
      slogan: 'text-sm',
      dividerWidth: 'max-w-[200px]'
    },
    lg: {
      badge: 'w-20 h-20',
      text: 'text-5xl',
      slogan: 'text-base',
      dividerWidth: 'max-w-[260px]'
    },
    giant: {
      badge: 'w-28 h-28',
      text: 'text-6xl',
      slogan: 'text-lg',
      dividerWidth: 'max-w-[320px]'
    }
  };

  const { badge, text, slogan, dividerWidth } = sizeConfig[size];

  return (
    <div className="flex flex-col items-center justify-center text-center select-none">
      <div className="flex items-center gap-3.5">
        
        {/* PREMIUM CIRCULAR LOGO BADGE (HIGH-FIDELITY INLINE SVG) */}
        <div className={`${badge} shrink-0 relative drop-shadow-sm hover:rotate-3 transition-transform duration-350`}>
          <svg 
            viewBox="0 0 100 100" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full"
          >
            {/* White outer boundary ring container */}
            <circle cx="50" cy="50" r="47" fill="white" />
            
            {/* Brand circular border ring */}
            <circle cx="50" cy="50" r="43" stroke="#0A66FF" strokeWidth="4.5" fill="none" />
            
            {/* SPARKLES (TURQUOISE SHINING STARS) */}
            {/* Upper sparkle */}
            <path 
              d="M 28,21 Q 28,28 35,28 Q 28,28 28,35 Q 28,28 21,28 Q 28,28 28,21 Z" 
              fill="#12D6C5" 
            />
            {/* Lower small sparkle */}
            <path 
              d="M 21,34 Q 21,39 26,39 Q 21,39 21,44 Q 21,39 16,39 Q 21,39 21,34 Z" 
              fill="#12D6C5" 
            />
            
            {/* THE CHIMNEY / RECT */}
            <rect x="65" y="34" width="7" height="15" fill="#0A66FF" rx="0.5" />
            
            {/* THE ROOF OF HOUSE */}
            <path 
              d="M 21,56 L 50,30 L 79,56" 
              stroke="#0A66FF" 
              strokeWidth="7" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              fill="none"
            />
            
            {/* LEFT SIDE WALL OF THE HOUSE */}
            <path 
              d="M 27.5,54.5 L 27.5,73" 
              stroke="#0A66FF" 
              strokeWidth="6" 
              strokeLinecap="round" 
              fill="none"
            />
            
            {/* 4-PANE BLUE WINDOW IN CENTER */}
            <g fill="#0A66FF">
              <rect x="42.5" y="49" width="6" height="6" rx="0.5" />
              <rect x="51.5" y="49" width="6" height="6" rx="0.5" />
              <rect x="42.5" y="58" width="6" height="6" rx="0.5" />
              <rect x="51.5" y="58" width="6" height="6" rx="0.5" />
            </g>
            
            {/* TWO-TONE GRACEFUL SWOOP WAVE */}
            {/* Primary Turquoise Wave */}
            <path 
              d="M 18,74 C 29,87 48,87 60,74 C 71,62 81,67 82,71 C 77,82 65,85 50,85 C 32,85 21,80 18,74 Z" 
              fill="#12D6C5" 
            />
            {/* Highlight Dark Blue Wave Curve */}
            <path 
              d="M 23,79 C 32,87 46,86 56,77 C 66,68 76,71 78,74 C 74,80 64,82 50,82 C 35,82 27,81 23,79 Z" 
              fill="#0A66FF" 
            />
          </svg>
        </div>

        {/* BRAND TYPOGRAPHY TITLE */}
        <div className={`${text} font-display font-extrabold tracking-tight select-none flex items-center leading-none`}>
          <span className="text-[#0A66FF]">Clean</span>
          <span className="text-[#12D6C5]">Host</span>
        </div>

      </div>

      {/* OPTIONAL SLOGAN WITH DECORATIVE ACCENT LINES */}
      {showSlogan && (
        <div className="mt-3.5 flex flex-col items-center justify-center animate-fade-in w-full">
          <p className={`${slogan} text-slate-700 font-bold tracking-tight px-4 flex items-center justify-center font-sans`}>
            Seu imóvel pronto para o próximo hóspede
          </p>

          {/* Elegant starry accent underline divider from the logo specifications */}
          <div className={`flex items-center gap-3 w-full ${dividerWidth} mt-2.5 text-slate-300`}>
            <div className="h-[1px] bg-gradient-to-r from-transparent to-blue-200/70 flex-1" />
            <span className="text-[#0A66FF] text-[10px] animate-pulse">✦</span>
            <div className="h-[1px] bg-gradient-to-l from-transparent to-blue-200/70 flex-1" />
          </div>
        </div>
      )}
    </div>
  );
}
