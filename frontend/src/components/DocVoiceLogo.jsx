import React from 'react';
import { Link } from 'react-router-dom';

export default function DocVoiceLogo({ size = 'sm', showTagline = false, className = '' }) {
  // Sizing definitions
  const dimensions = {
    sm: { icon: 40, text: 'text-[20px]', gap: 'gap-3' },
    md: { icon: 60, text: 'text-[28px]', gap: 'gap-4' },
    lg: { icon: 80, text: 'text-[36px]', gap: 'gap-5' }
  };

  const { icon, text, gap } = dimensions[size];

  return (
    <div className={`flex items-center ${gap} ${className}`}>
      {/* Icon Part */}
      <div 
        className="relative flex items-center justify-center shrink-0"
        style={{
          width: icon,
          height: icon,
          background: 'linear-gradient(135deg, #0f0f1a, #1a1a3e)',
          borderRadius: '12px',
          border: '1px solid rgba(13,148,136,0.3)',
          boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
        }}
      >
        <svg 
          width={icon * 0.6} 
          height={icon * 0.6} 
          viewBox="0 0 40 40" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="gradient-teal-indigo" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0d9488" />
              <stop offset="100%" stopColor="#818cf8" />
            </linearGradient>
          </defs>

          {/* Speech Bubble Outline */}
          <path 
            d="M 6,18 C 6,10 12,5 20,5 C 28,5 34,10 34,18 C 34,26 28,31 20,31 C 18,31 16,30.5 14,29.5 L 7,33 L 8.5,27.5 C 7,25 6,22 6,18 Z" 
            stroke="url(#gradient-teal-indigo)" 
            strokeWidth="2" 
            fill="none"
          />

          {/* Microphone Icon Inside */}
          <g transform="translate(13, 10)">
            <rect x="2" y="2" width="4" height="8" rx="2" fill="url(#gradient-teal-indigo)" />
            <path d="M 0,8 C 0,11 3,12.5 4,12.5 C 5,12.5 8,11 8,8" stroke="url(#gradient-teal-indigo)" strokeWidth="1.5" fill="none" />
            <line x1="4" y1="12.5" x2="4" y2="15" stroke="url(#gradient-teal-indigo)" strokeWidth="1.5" />
          </g>

          {/* Horizontal Lines (Document Text) */}
          <g transform="translate(24, 11)" stroke="#0d9488" strokeWidth="2" strokeLinecap="round" opacity="0.7">
            <line x1="0" y1="0" x2="4" y2="0" />
            <line x1="0" y1="5" x2="3" y2="5" />
            <line x1="0" y1="10" x2="5" y2="10" />
          </g>
        </svg>
      </div>

      {/* Text Part */}
      <div className="flex flex-col justify-center">
        <span className={`font-bold text-white leading-tight ${text}`} style={{ fontFamily: 'Sora, sans-serif' }}>
          DocVoice
        </span>
        {showTagline && (
          <span 
            className="text-[#0d9488] font-semibold" 
            style={{ fontSize: '11px', letterSpacing: '2px', marginTop: '2px' }}
          >
            AI DOCUMENT READER
          </span>
        )}
      </div>
    </div>
  );
}
