import React from 'react';

const LogoIcon = ({ size = 24, className = '' }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 100 100"
    width={size}
    height={size}
    className={className}
    fill="none"
  >
    {/* Shield Base */}
    <path
      d="M50 5 L90 20 L80 75 Q50 95 50 95 Q50 95 20 75 L10 20 Z"
      fill="#7F8CA8"
      stroke="#FFAD2F"
      strokeWidth="6"
      strokeLinejoin="round"
    />
    
    {/* Light internal circle for Magnifying Glass */}
    <circle cx="45" cy="45" r="30" fill="#FFE0A3" stroke="#FFAD2F" strokeWidth="6" />

    {/* Magnifying Glass Handle */}
    <line x1="68" y1="68" x2="88" y2="88" stroke="#C87428" strokeWidth="12" strokeLinecap="round" />
    <line x1="66" y1="66" x2="72" y2="72" stroke="#FFAD2F" strokeWidth="12" strokeLinecap="round" />

    {/* Paw Print */}
    <circle cx="35" cy="35" r="6" fill="#2B1B12" />
    <circle cx="45" cy="28" r="6" fill="#2B1B12" />
    <circle cx="55" cy="35" r="6" fill="#2B1B12" />
    <path d="M45 42 Q30 45 35 55 Q45 60 55 55 Q60 45 45 42 Z" fill="#2B1B12" />
  </svg>
);

export default LogoIcon;
