import React from 'react';

export default function PhoneFrame({ children, title, progress }) {
  return (
    <div className="phone-frame" aria-label={title}>
      <div className="phone-shell">
        <div className="phone-notch" aria-hidden="true" />
        <div className="phone-screen">
          <div className="phone-app-bar">
            <span className="phone-app-title">{title}</span>
            {progress && <span className="phone-app-progress">{progress}</span>}
          </div>
          <div className="phone-app-body">{children}</div>
        </div>
      </div>
    </div>
  );
}
