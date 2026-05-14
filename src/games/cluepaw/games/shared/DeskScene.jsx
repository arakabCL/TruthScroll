import React from 'react';

export default function DeskScene({ children, className = '', variant = 'mixed' }) {
  return (
    <div className={`scene-desk scene-desk-${variant} ${className}`.trim()}>
      <div className="scene-desk-props" aria-hidden="true">
        <span className="scene-paperclip clip-one" />
        <span className="scene-paperclip clip-two" />
        <span className="scene-paperclip clip-three" />
        <span className="scene-pen" />
        <span className="scene-binder binder-one" />
        <span className="scene-binder binder-two" />
        <span className="scene-corner-paper" />
      </div>
      <div className="scene-desk-content">{children}</div>
    </div>
  );
}
