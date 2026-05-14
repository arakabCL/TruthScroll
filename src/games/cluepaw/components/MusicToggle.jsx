import React from 'react';
import AppIcon from './AppIcon';
import { useMusic } from '../context/MusicContext';

export default function MusicToggle({ className = '' }) {
  const { enabled, playing, toggleMusic } = useMusic();

  return (
    <button
      type="button"
      className={`music-toggle${enabled ? ' is-playing' : ''}${className ? ` ${className}` : ''}`}
      onClick={toggleMusic}
      aria-pressed={enabled}
      aria-label={enabled ? 'Turn detective music off' : 'Turn detective music on'}
    >
      <AppIcon name="music" size={17} />
      <span>{enabled ? (playing ? 'Music On' : 'Music Ready') : 'Music Off'}</span>
    </button>
  );
}
