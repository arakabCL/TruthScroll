import React from 'react';

const ICONS = {
  magnify: (
    <>
      <circle cx="11" cy="11" r="7" strokeWidth="2" fill="none" />
      <line x1="20" y1="20" x2="16.65" y2="16.65" strokeWidth="2" strokeLinecap="round" />
    </>
  ),
  trophy: (
    <>
      <path d="M7 4h10M7 4v7a5 5 0 0 0 10 0V4M5 4h-1a2 2 0 0 0 0 4h1m14-4h1a2 2 0 0 1 0 4h-1" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12 16v4M8 22h8" strokeWidth="2" fill="none" strokeLinecap="round" />
    </>
  ),
  shield: (
    <>
      <path d="M12 2l8 4v6c0 5.5-3.8 10.7-8 12-4.2-1.3-8-6.5-8-12V6l8-4z" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9 12l2 2 4-4" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
  folder: (
    <>
      <path d="M4 4h6l2 3h8a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
  lock: (
    <>
      <rect x="5" y="11" width="14" height="10" rx="2" strokeWidth="2" fill="none" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" strokeWidth="2" fill="none" strokeLinecap="round" />
    </>
  ),
  unlock: (
    <>
      <rect x="5" y="11" width="14" height="10" rx="2" strokeWidth="2" fill="none" />
      <path d="M7 11V7a5 5 0 0 1 9-2" strokeWidth="2" fill="none" strokeLinecap="round" />
    </>
  ),
  check: (
    <>
      <path d="M20 6L9 17l-5-5" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
  close: (
    <>
      <line x1="6" y1="6" x2="18" y2="18" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="18" y1="6" x2="6" y2="18" strokeWidth="2.5" strokeLinecap="round" />
    </>
  ),
  document: (
    <>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <polyline points="14 2 14 8 20 8" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="8" y1="13" x2="16" y2="13" strokeWidth="2" strokeLinecap="round" />
      <line x1="8" y1="17" x2="14" y2="17" strokeWidth="2" strokeLinecap="round" />
    </>
  ),
  bookmark: (
    <>
      <path d="M6 2h12a2 2 0 0 1 2 2v18l-8-4-8 4V4a2 2 0 0 1 2-2z" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
  person: (
    <>
      <circle cx="12" cy="7" r="4" strokeWidth="2" fill="none" />
      <path d="M5 21v-2a4 4 0 0 1 4-4h6a4 4 0 0 1 4 4v2" strokeWidth="2" fill="none" strokeLinecap="round" />
    </>
  ),
  pin: (
    <>
      <path d="M12 2a7 7 0 0 0-7 7c0 3.5 3 6.5 7 11 4-4.5 7-7.5 7-11a7 7 0 0 0-7-7z" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="12" cy="9" r="2" strokeWidth="2" fill="none" />
    </>
  ),
  flame: (
    <>
      <path d="M12 2c0 0-5 4-5 9 0 3 2 5 5 5s5-2 5-5c0-5-5-9-5-9zM9 18c0 2 1.5 4 3 4s3-2 3-4" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
  star: (
    <>
      <polygon points="12 2 15 9 22 9 17 14 18.5 21 12 17 5.5 21 7 14 2 9 9 9" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
  diamond: (
    <>
      <path d="M6 3h12l4 7-10 11L2 10l4-7z" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="12" y1="3" x2="12" y2="21" strokeWidth="2" strokeLinecap="round" />
    </>
  ),
  arrowLeft: (
    <>
      <line x1="20" y1="12" x2="4" y2="12" strokeWidth="2" strokeLinecap="round" />
      <polyline points="9 6 3 12 9 18" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
  arrowRight: (
    <>
      <line x1="4" y1="12" x2="20" y2="12" strokeWidth="2" strokeLinecap="round" />
      <polyline points="15 18 21 12 15 6" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="10" strokeWidth="2" fill="none" />
      <polyline points="12 6 12 12 16 14" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
  globe: (
    <>
      <circle cx="12" cy="12" r="10" strokeWidth="2" fill="none" />
      <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" strokeWidth="2" fill="none" />
    </>
  ),
  target: (
    <>
      <circle cx="12" cy="12" r="10" strokeWidth="2" fill="none" />
      <circle cx="12" cy="12" r="6" strokeWidth="2" fill="none" />
      <circle cx="12" cy="12" r="2" strokeWidth="2" fill="none" />
      <line x1="12" y1="2" x2="12" y2="6" strokeWidth="2" strokeLinecap="round" />
      <line x1="12" y1="18" x2="12" y2="22" strokeWidth="2" strokeLinecap="round" />
      <line x1="2" y1="12" x2="6" y2="12" strokeWidth="2" strokeLinecap="round" />
      <line x1="18" y1="12" x2="22" y2="12" strokeWidth="2" strokeLinecap="round" />
    </>
  ),
  crown: (
    <>
      <path d="M4 18h16M4 18l2-8 4 4 4-4 4 4 2 8" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="6" cy="8" r="1.5" fill="currentColor" />
      <circle cx="12" cy="6" r="1.5" fill="currentColor" />
      <circle cx="18" cy="8" r="1.5" fill="currentColor" />
    </>
  ),
  rocket: (
    <>
      <path d="M12 2s-7 5-7 12a7 7 0 0 0 14 0c0-7-7-12-7-12z" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="12" cy="11" r="2" strokeWidth="2" fill="none" />
      <path d="M12 20v4M9 24h6" strokeWidth="2" fill="none" strokeLinecap="round" />
    </>
  ),
  eye: (
    <>
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="12" cy="12" r="3" strokeWidth="2" fill="none" />
    </>
  ),
  gear: (
    <>
      <circle cx="12" cy="12" r="3" strokeWidth="2" fill="none" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 8.6 19.4l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 5.51 15H3a2 2 0 1 1 0-4h2.51a1.65 1.65 0 0 0 1.2-1.2l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 10.4 5.51V3a2 2 0 1 1 4 0v2.51a1.65 1.65 0 0 0 1.2 1.2l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0 1.2 1.2H21a2 2 0 1 1 0 4h-2.51z" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
  mail: (
    <>
      <path d="M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <polyline points="22 6 12 13 2 6" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
  clipboard: (
    <>
      <path d="M9 2h6M12 2v4M7 6h10a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2z" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="9" y1="13" x2="15" y2="13" strokeWidth="2" strokeLinecap="round" />
      <line x1="9" y1="17" x2="13" y2="17" strokeWidth="2" strokeLinecap="round" />
    </>
  ),
  searchWeb: (
    <>
      <rect x="2" y="3" width="20" height="14" rx="2" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="8" y1="21" x2="16" y2="21" strokeWidth="2" strokeLinecap="round" />
      <line x1="12" y1="17" x2="12" y2="21" strokeWidth="2" strokeLinecap="round" />
      <circle cx="11" cy="10" r="3" strokeWidth="2" fill="none" />
      <line x1="16" y1="15" x2="13.5" y2="12.5" strokeWidth="2" strokeLinecap="round" />
    </>
  ),
  alert: (
    <>
      <path d="M10.3 3.9L2.2 17A2 2 0 0 0 4 20h16a2 2 0 0 0 1.8-3l-8.1-13a2 2 0 0 0-3.4 0z" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="12" y1="9" x2="12" y2="13" strokeWidth="2" strokeLinecap="round" />
      <circle cx="12" cy="16" r="1" fill="currentColor" />
    </>
  ),
  cart: (
    <>
      <circle cx="9" cy="21" r="1.5" fill="currentColor" />
      <circle cx="20" cy="21" r="1.5" fill="currentColor" />
      <path d="M1 1h4l2.7 13.4a2 2 0 0 0 2 1.6h9.7a2 2 0 0 0 2-1.6L23 6H6" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
  video: (
    <>
      <rect x="2" y="3" width="15" height="14" rx="2" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <polygon points="17 8 23 5 23 15 17 12" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
  userGroup: (
    <>
      <path d="M17 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2" strokeWidth="2" fill="none" strokeLinecap="round" />
      <circle cx="10" cy="7" r="4" strokeWidth="2" fill="none" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" strokeWidth="2" fill="none" strokeLinecap="round" />
      <circle cx="19.5" cy="7.5" r="3.5" strokeWidth="2" fill="none" />
    </>
  ),
  paw: (
    <>
      <ellipse cx="9" cy="9" rx="2.5" ry="3" strokeWidth="2" fill="none" />
      <ellipse cx="15" cy="9" rx="2.5" ry="3" strokeWidth="2" fill="none" />
      <ellipse cx="7" cy="15" rx="2" ry="2.5" strokeWidth="2" fill="none" />
      <ellipse cx="17" cy="15" rx="2" ry="2.5" strokeWidth="2" fill="none" />
      <ellipse cx="12" cy="17" rx="3.5" ry="3" strokeWidth="2" fill="none" />
    </>
  ),
  keys: (
    <>
      <circle cx="7.5" cy="15.5" r="3.5" strokeWidth="2" fill="none" />
      <path d="M11 12l8-8M17 4l3 3M15 6l3 3" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="7.5" cy="15.5" r="1" fill="currentColor" />
    </>
  ),
  notepad: (
    <>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="8" y1="13" x2="16" y2="13" strokeWidth="2" strokeLinecap="round" />
      <line x1="8" y1="17" x2="12" y2="17" strokeWidth="2" strokeLinecap="round" />
      <polyline points="14 2 14 8 20 8" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
  map: (
    <>
      <polygon points="1 6 9 2 15 6 23 2 23 18 15 22 9 18 1 22" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="9" y1="2" x2="9" y2="18" strokeWidth="2" strokeLinecap="round" />
      <line x1="15" y1="6" x2="15" y2="22" strokeWidth="2" strokeLinecap="round" />
    </>
  ),
  camera: (
    <>
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="12" cy="13" r="4" strokeWidth="2" fill="none" />
    </>
  ),
  wand: (
    <>
      <path d="M14.5 2l-9 9L2 20l9-3.5 9-9L14.5 2z" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="20" cy="4" r="2" strokeWidth="2" fill="none" />
      <circle cx="17" cy="7" r="1" fill="currentColor" />
    </>
  ),
  medal: (
    <>
      <circle cx="12" cy="9" r="7" strokeWidth="2" fill="none" />
      <path d="M8 15l-2 9M16 15l2 9" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12 6v6l3 2" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
  badge: (
    <>
      <path d="M12 1l3 2 3.5-.5 1.5 3 3 2.5L21 12l1.5 3.5L21 19l-1.5 3-3.5.5-3 2-3-2-3.5.5-1.5-3-3-2.5L3 12 1.5 8.5 3 5l1.5-3 3.5-.5 3-2z" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="12" cy="12" r="3" strokeWidth="2" fill="none" />
    </>
  ),
};

export default function DetectiveIcon({ name, size = 24, color = 'currentColor', strokeWidth, className = '', style = {} }) {
  const svgContent = ICONS[name];
  if (!svgContent) return null;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth || 2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`detective-icon ${className}`}
      style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0, ...style }}
      xmlns="http://www.w3.org/2000/svg"
    >
      {svgContent}
    </svg>
  );
}

export { ICONS };
