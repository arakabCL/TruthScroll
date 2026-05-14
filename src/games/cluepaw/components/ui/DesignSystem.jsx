import React from 'react';

function joinClasses(...classes) {
  return classes.filter(Boolean).join(' ');
}

export function BrandButton({
  children,
  className = '',
  variant = 'primary',
  size = 'md',
  ...props
}) {
  return (
    <button className={joinClasses('ui-button', `ui-button-${variant}`, `ui-button-${size}`, className)} {...props}>
      {children}
    </button>
  );
}

export function BrandCard({ children, className = '', tone = 'paper', as: Component = 'div', ...props }) {
  return (
    <Component className={joinClasses('ui-card', `ui-card-${tone}`, className)} {...props}>
      {children}
    </Component>
  );
}

export function BrandBadge({ children, className = '', tone = 'sky', ...props }) {
  return (
    <span className={joinClasses('ui-badge', `ui-badge-${tone}`, className)} {...props}>
      {children}
    </span>
  );
}

export function BrandPanel({ children, className = '', ...props }) {
  return (
    <section className={joinClasses('ui-panel', className)} {...props}>
      {children}
    </section>
  );
}

export function EmptyState({ title, children, action, className = '' }) {
  return (
    <div className={joinClasses('ui-empty-state', className)}>
      {title && <h2>{title}</h2>}
      {children && <p>{children}</p>}
      {action}
    </div>
  );
}

export function LoadingScreen({ label = 'Loading case files...' }) {
  return (
    <div className="ui-loading-screen" role="status" aria-live="polite">
      <span className="ui-loading-mark" aria-hidden="true" />
      <span>{label}</span>
    </div>
  );
}
