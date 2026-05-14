import React from 'react';
import TibbeeHintPanel from './TibbeeHintPanel';

export default function GameTopControls({ onBack, claim, progress, skill, hints, hintKey }) {
  return (
    <>
      <button type="button" className="ui-button ui-button-ghost scene-back-button" onClick={onBack} aria-label="Back to cases">
        Back
      </button>
      <div className="scene-claim-strip">
        <span>Your mission</span>
        <p>{claim}</p>
        {skill && <strong className="scene-skill-chip">{skill}</strong>}
      </div>
      <div className="scene-progress-badge">{progress}</div>
      {hints?.length > 0 && <TibbeeHintPanel hints={hints} hintKey={hintKey} />}
    </>
  );
}
