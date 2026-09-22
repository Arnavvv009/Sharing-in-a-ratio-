import React from 'react';

export default function Mascot({ mood = 'idle', bubble = null }) {
  // Render robot face expression based on mood
  const renderCuboFace = () => {
    switch (mood) {
      case 'happy':
        return (
          <g>
            {/* Happy arching eyes */}
            <path d="M16 26 Q20 20 24 26" stroke="#00f3ff" strokeWidth="3" fill="none" strokeLinecap="round" />
            <path d="M32 26 Q36 20 40 26" stroke="#00f3ff" strokeWidth="3" fill="none" strokeLinecap="round" />
            {/* Big open smile */}
            <path d="M22 36 Q28 42 34 36" stroke="#ffffff" strokeWidth="3" fill="none" strokeLinecap="round" />
          </g>
        );
      case 'thinking':
        return (
          <g>
            {/* Slanted thinking eyes */}
            <line x1="16" y1="24" x2="24" y2="28" stroke="#00f3ff" strokeWidth="3" strokeLinecap="round" />
            <circle cx="36" cy="26" r="3" fill="#00f3ff" />
            {/* Flat mouth */}
            <line x1="22" y1="36" x2="34" y2="36" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" />
            {/* Question mark bubble from antenna */}
            <circle cx="48" cy="10" r="1.5" fill="#ffbe1a" />
          </g>
        );
      case 'celebrating':
        return (
          <g>
            {/* Star/cross eyes */}
            <path d="M16 26 L24 26 M20 22 L20 30" stroke="#00f3ff" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M32 26 L40 26 M36 22 L36 30" stroke="#00f3ff" strokeWidth="2.5" strokeLinecap="round" />
            {/* Big curved smile */}
            <path d="M20 34 Q28 44 36 34" fill="#ffbe1a" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
          </g>
        );
      case 'curious':
        return (
          <g>
            {/* Uneven eyes (one big, one small) */}
            <circle cx="20" cy="26" r="4.5" fill="#00f3ff" />
            <circle cx="36" cy="26" r="3" fill="#00f3ff" />
            {/* Open round mouth */}
            <circle cx="28" cy="36" r="3" fill="#ffffff" />
          </g>
        );
      case 'idle':
      default:
        return (
          <g>
            {/* Standard friendly eyes */}
            <circle cx="20" cy="26" r="3" fill="#00f3ff" />
            <circle cx="36" cy="26" r="3" fill="#00f3ff" />
            {/* Small curve smile */}
            <path d="M23 35 Q28 39 33 35" stroke="#ffffff" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          </g>
        );
    }
  };

  return (
    <div className="mascot-container">
      <div className="mascot-avatar-circle" style={{ animation: mood === 'celebrating' ? 'celebrate 0.6s ease infinite' : 'none' }}>
        <svg viewBox="0 0 56 56" width="46" height="46" xmlns="http://www.w3.org/2000/svg">
          {/* Antenna */}
          <rect x="26" y="2" width="4" height="8" fill="#4d3b84" rx="2" />
          <circle cx="28" cy="4" r="3" fill="#ffbe1a" />
          
          {/* Ears */}
          <rect x="6" y="22" width="4" height="12" fill="#ff8a50" rx="2" />
          <rect x="46" y="22" width="4" height="12" fill="#ff8a50" rx="2" />

          {/* Metal head body */}
          <rect x="10" y="10" width="36" height="36" rx="8" fill="#2d1c69" stroke="#4d3b84" strokeWidth="2" />
          <rect x="13" y="13" width="30" height="30" rx="5" fill="#1b103c" />

          {/* Dynamic expression layer */}
          {renderCuboFace()}

          {/* Cheeks */}
          <circle cx="14" cy="33" r="2" fill="#ef4444" opacity="0.5" />
          <circle cx="42" cy="33" r="2" fill="#ef4444" opacity="0.5" />
        </svg>
      </div>

      {bubble && (
        <div className="mascot-speech-bubble">
          {bubble}
        </div>
      )}
    </div>
  );
}
