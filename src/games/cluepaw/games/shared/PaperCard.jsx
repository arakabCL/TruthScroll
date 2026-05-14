import React from 'react';

export default function PaperCard({
  children,
  className = '',
  pinned = false,
  as: Component = 'div',
  style,
  ...props
}) {
  return (
    <Component
      className={`ui-card ui-card-paper paper-card${pinned ? ' pinned-paper' : ''} ${className}`.trim()}
      style={style}
      {...props}
    >
      {pinned && <span className="paper-pin" aria-hidden="true" />}
      {children}
    </Component>
  );
}
