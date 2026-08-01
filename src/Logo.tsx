import React from 'react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ className = '', size = 'md', showText = true }) => {
  const iconSizes = {
    xs: 'w-5 h-5',
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-14 h-14'
  };

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {/* Colosseum Arch & Eye SVG Logo */}
      <div className={`relative flex items-center justify-center flex-shrink-0 ${iconSizes[size]}`}>
        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md overflow-visible">
          {/* Outer Arches (Terracotta / Reddish Brown) */}
          <path
            d="M 10 90 A 40 40 0 0 1 90 90"
            fill="none"
            stroke="#A83822"
            strokeWidth="10"
            strokeLinecap="butt"
          />
          <path
            d="M 23 90 A 27 27 0 0 1 77 90"
            fill="none"
            stroke="#111827"
            strokeWidth="5"
            strokeLinecap="butt"
          />
          <path
            d="M 32 90 A 18 18 0 0 1 68 90"
            fill="none"
            stroke="#A83822"
            strokeWidth="7"
            strokeLinecap="butt"
          />

          {/* Central Eye Motif */}
          <g transform="translate(50, 60)">
            {/* Eye Shape */}
            <path
              d="M -18 0 Q 0 -14 18 0 Q 0 14 -18 0 Z"
              fill="#FFFFFF"
              stroke="#111827"
              strokeWidth="3.5"
            />
            {/* Pupil */}
            <circle cx="0" cy="0" r="6" fill="#111827" />
            <circle cx="-2" cy="-2" r="2" fill="#FFFFFF" />
          </g>
        </svg>
      </div>

      {/* Brand Name Text */}
      {showText && (
        <div className="flex flex-col leading-tight select-none">
          <span className="font-extrabold text-white tracking-tight text-sm md:text-base font-['Cairo','Plus_Jakarta_Sans',sans-serif]">
            El Jem Live
          </span>
          <span className="text-[9px] md:text-[10px] font-black tracking-[0.2em] text-amber-500 uppercase font-['IBM_Plex_Mono',monospace]">
            WATCHERS
          </span>
        </div>
      )}
    </div>
  );
};
