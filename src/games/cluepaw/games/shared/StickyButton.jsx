import React from 'react';

export default function StickyButton({ children, className = '', direction = 'right', ...props }) {
  return (
    <button className={`ui-button ui-button-accent sticky-button sticky-${direction} ${className}`.trim()} {...props}>
      <span>{children}</span>
      <span className="sticky-arrow" aria-hidden="true">{direction === 'left' ? '<-' : '->'}</span>
    </button>
  );
}
