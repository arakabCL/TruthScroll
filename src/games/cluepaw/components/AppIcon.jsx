import React from 'react';

const PATHS = {
  agent: (
    <>
      <path d="M6 11h12l-2.2-4H8.2L6 11Z" />
      <path d="M8 11c.4 5.2 2 8 4 8s3.6-2.8 4-8" />
      <path d="M9 16c1.5 1 4.5 1 6 0" />
    </>
  ),
  rank: (
    <>
      <path d="M12 3l2.4 5 5.4.8-3.9 3.8.9 5.4L12 15.5 7.2 18l.9-5.4-3.9-3.8 5.4-.8L12 3Z" />
      <path d="M8 21h8" />
    </>
  ),
  xp: (
    <>
      <path d="M12 4l7 4v8l-7 4-7-4V8l7-4Z" />
      <path d="M8.5 9.5l7 5" />
      <path d="M15.5 9.5l-7 5" />
    </>
  ),
  cloud: (
    <>
      <path d="M7 18h10a4 4 0 0 0 .5-8 6 6 0 0 0-11.1 2A3.2 3.2 0 0 0 7 18Z" />
      <path d="M9 14l2 2 4-5" />
    </>
  ),
  flame: (
    <>
      <path d="M12 21c4 0 7-2.8 7-6.8 0-3.2-2-5.6-5.2-8.6.2 2.2-.6 3.8-2.2 5.1.1-2.4-1.2-4.3-3.5-5.7.4 3.5-3.1 5.6-3.1 9.2C5 18.2 8 21 12 21Z" />
      <path d="M12 18c1.6 0 2.8-1 2.8-2.5 0-1.2-.7-2-1.8-3.1 0 1-.5 1.8-1.4 2.3 0-1-.5-1.8-1.4-2.4.1 1.7-1 2.3-1 3.3C9.2 17 10.4 18 12 18Z" />
    </>
  ),
  folder: (
    <>
      <path d="M3.5 7.5h6l1.7 2H20a1.5 1.5 0 0 1 1.5 1.5v7A2.5 2.5 0 0 1 19 20.5H5A2.5 2.5 0 0 1 2.5 18V9A1.5 1.5 0 0 1 4 7.5Z" />
      <path d="M3 10h18" />
    </>
  ),
  case: (
    <>
      <path d="M7 7h10a3 3 0 0 1 3 3v8H4v-8a3 3 0 0 1 3-3Z" />
      <path d="M9 7V5.8A1.8 1.8 0 0 1 10.8 4h2.4A1.8 1.8 0 0 1 15 5.8V7" />
      <path d="M4 12h16" />
    </>
  ),
  archive: (
    <>
      <path d="M5 4h14v5H5z" />
      <path d="M6.5 9h11v11h-11z" />
      <path d="M9 13h6" />
      <path d="M9 16h6" />
    </>
  ),
  briefing: (
    <>
      <path d="M5 4h14v16H5z" />
      <path d="M8 8h8" />
      <path d="M8 12h8" />
      <path d="M8 16h5" />
    </>
  ),
  trophy: (
    <>
      <path d="M8 4h8v4a4 4 0 0 1-8 0V4Z" />
      <path d="M8 6H5a3 3 0 0 0 3 5" />
      <path d="M16 6h3a3 3 0 0 1-3 5" />
      <path d="M12 12v5" />
      <path d="M8.5 20h7" />
      <path d="M10 17h4" />
    </>
  ),
  back: <path d="M15 5l-7 7 7 7" />,
  next: <path d="M9 5l7 7-7 7" />,
  board: (
    <>
      <path d="M6 5h12v14H6z" />
      <path d="M9 8h6" />
      <path d="M9 12h6" />
      <path d="M9 16h3" />
    </>
  ),
  witness: (
    <>
      <path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" />
      <path d="M5 20a7 7 0 0 1 14 0" />
    </>
  ),
  web: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18" />
      <path d="M12 3c2.5 2.6 3.8 5.6 3.8 9S14.5 18.4 12 21" />
      <path d="M12 3c-2.5 2.6-3.8 5.6-3.8 9s1.3 6.4 3.8 9" />
    </>
  ),
  social: (
    <>
      <rect x="6" y="3.5" width="12" height="17" rx="2.4" />
      <path d="M10 17.5h4" />
      <path d="M9 8h6" />
      <path d="M9 11h4" />
      <path d="M16.5 8.5l2.7-1.5v6l-2.7-1.5" />
      <path d="M5.5 10.2L3 8.8v5.4l2.5-1.4" />
    </>
  ),
  music: (
    <>
      <path d="M9 18V6l10-2v12" />
      <circle cx="6.5" cy="18" r="2.5" />
      <circle cx="16.5" cy="16" r="2.5" />
      <path d="M9 9l10-2" />
    </>
  ),
  check: <path d="M5 12l4 4 10-10" />,
  refresh: (
    <>
      <path d="M20 6v5h-5" />
      <path d="M4 18v-5h5" />
      <path d="M18.5 10A7 7 0 0 0 6.3 6.5L4 9" />
      <path d="M5.5 14a7 7 0 0 0 12.2 3.5L20 15" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="8" />
      <path d="M12 8v5l3 2" />
    </>
  ),
  source: (
    <>
      <path d="M6 5h12v14H6z" />
      <path d="M9 9h6" />
      <path d="M9 13h6" />
      <path d="M9 17h3" />
    </>
  ),
  lock: (
    <>
      <rect x="6" y="10" width="12" height="10" rx="2" />
      <path d="M8.5 10V7.5a3.5 3.5 0 0 1 7 0V10" />
    </>
  ),
  trend: (
    <>
      <path d="M4 18h16" />
      <path d="M6 15l4-4 3 3 5-7" />
      <path d="M15 7h3v3" />
    </>
  ),
  shield: (
    <>
      <path d="M12 3l7 3v5c0 4.4-2.7 7.8-7 10-4.3-2.2-7-5.6-7-10V6l7-3Z" />
      <path d="M8.5 12l2.3 2.3 4.7-5" />
    </>
  ),
  badge: (
    <>
      <circle cx="12" cy="10" r="5" />
      <path d="M9 14l-1.5 6 4.5-2 4.5 2L15 14" />
      <path d="M12 7.5l.8 1.6 1.7.2-1.2 1.2.3 1.7-1.6-.8-1.6.8.3-1.7-1.2-1.2 1.7-.2.8-1.6Z" />
    </>
  ),
  close: (
    <>
      <path d="M7 7l10 10" />
      <path d="M17 7L7 17" />
    </>
  ),
  settings: (
    <>
      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
      <circle cx="12" cy="12" r="3" />
    </>
  ),
};

export default function AppIcon({ name = 'case', size = 18, className = '', title }) {
  return (
    <svg
      className={`app-icon ${className}`.trim()}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      aria-hidden={title ? undefined : 'true'}
      role={title ? 'img' : undefined}
      focusable="false"
    >
      {title && <title>{title}</title>}
      <g fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        {PATHS[name] || PATHS.case}
      </g>
    </svg>
  );
}
