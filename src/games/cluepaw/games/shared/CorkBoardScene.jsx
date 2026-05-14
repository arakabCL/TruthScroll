import React from 'react';

export default function CorkBoardScene({
  topControls,
  boardContent,
  rightNote,
  trayItems,
  leftControl,
  rightControl,
}) {
  const hasTrayItems = React.Children.count(trayItems) > 0;

  return (
    <div className={`cork-scene${hasTrayItems ? ' has-clue-tray' : ' no-clue-tray'}`}>
      {topControls && <div className="game-top-controls">{topControls}</div>}
      <main className="cork-stage">
        {leftControl && <div className="cork-side-control left">{leftControl}</div>}
        <section className="redesign-cork-board" aria-label="Investigation corkboard">
          <div className="redesign-cork-surface">
            <div className="board-pinned-area">{boardContent}</div>
          </div>
          {rightNote && <aside className="board-verdict-area">{rightNote}</aside>}
        </section>
        {rightControl && <div className="cork-side-control right">{rightControl}</div>}
      </main>
      {hasTrayItems && (
        <div className="bottom-clue-tray" aria-label="Clues">
          {trayItems}
        </div>
      )}
    </div>
  );
}
