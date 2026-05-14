import React, { useEffect, useState } from 'react';
import MascotPose from '../../components/MascotPose';

const MAX_HINTS = 2;

export default function TibbeeHintPanel({ hints = [], hintKey }) {
  const [revealedHints, setRevealedHints] = useState([]);
  const hintsLeft = Math.max(0, MAX_HINTS - revealedHints.length);
  const hasHintAvailable = hintsLeft > 0 && hints.length > revealedHints.length;
  const latestHint = revealedHints[revealedHints.length - 1];

  useEffect(() => {
    setRevealedHints([]);
  }, [hintKey]);

  const askForHint = () => {
    if (!hasHintAvailable) return;
    setRevealedHints(current => [...current, hints[current.length]]);
  };

  return (
    <aside className="tibbee-hint-panel" aria-label="Tibbee hints">
      <div className="tibbee-hint-topline">
        <MascotPose pose="thinking" className="tibbee-hint-mascot" label="Tibbee ready to help" />
        <div>
          <span>Tibbee hints</span>
          <strong>{hintsLeft}/2 left</strong>
        </div>
      </div>
      {latestHint ? (
        <p className="tibbee-hint-message" aria-live="polite">{latestHint}</p>
      ) : (
        <p className="tibbee-hint-message muted">Ask for a small clue when you get stuck.</p>
      )}
      <button type="button" className="tibbee-hint-button" onClick={askForHint} disabled={!hasHintAvailable}>
        {hintsLeft === 0 ? 'No hints left' : 'Ask Tibbee'}
      </button>
    </aside>
  );
}
