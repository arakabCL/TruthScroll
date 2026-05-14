import React, { useEffect, useId, useRef } from 'react';
import { motion } from 'framer-motion';
import DeskScene from './DeskScene';
import StickyButton from './StickyButton';
import { formatVerdict } from './gameVerdict';
import EvidenceVisual from '../../components/EvidenceVisual';
import MascotPose from '../../components/MascotPose';

export default function CaseReport({
  caseData,
  selectedVerdict,
  isCorrect,
  findings = [],
  conclusion,
  mediaPreview,
  canRetry = true,
  onTryAgain,
  onContinue,
}) {
  const verdictText = formatVerdict(caseData.actualVerdict).toUpperCase();
  const selectedText = formatVerdict(selectedVerdict);
  const titleId = useId();
  const descriptionId = useId();
  const dialogRef = useRef(null);
  const previousFocusRef = useRef(null);

  useEffect(() => {
    previousFocusRef.current = document.activeElement;
    const focusableSelector = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
    const animationFrame = window.requestAnimationFrame(() => {
      const focusable = dialogRef.current?.querySelectorAll(focusableSelector);
      focusable?.[0]?.focus();
    });

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onContinue();
        return;
      }

      if (event.key !== 'Tab') return;
      const focusable = Array.from(dialogRef.current?.querySelectorAll(focusableSelector) || [])
        .filter(element => !element.hasAttribute('disabled'));
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      window.cancelAnimationFrame(animationFrame);
      document.removeEventListener('keydown', handleKeyDown);
      previousFocusRef.current?.focus?.();
    };
  }, [onContinue]);

  return (
    <motion.div
      className="case-report-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      role="presentation"
    >
      <DeskScene variant="report">
        <div
          className="case-report-dialog"
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          aria-describedby={descriptionId}
          ref={dialogRef}
        >
        {canRetry && (
          <StickyButton className="report-try-again" direction="left" onClick={onTryAgain}>
            Try Again
          </StickyButton>
        )}
        <motion.article
          className="case-report-sheet"
          initial={{ rotate: -2, y: 28, opacity: 0 }}
          animate={{ rotate: -1, y: 0, opacity: 1 }}
          transition={{ type: 'spring', damping: 24, stiffness: 180 }}
          aria-live="polite"
        >
          <div className="report-polaroid">
            <div className="report-media-box">
              <MascotPose pose={isCorrect ? 'celebrate' : 'thinking'} className="case-report-mascot" />
              <EvidenceVisual kind="report" data={caseData} />
              <span>{mediaPreview || 'Case Evidence'}</span>
            </div>
          </div>
          <div className="report-body">
            <p className="report-field">
              <span>Subject:</span>
              <strong id={titleId}>{caseData.title}</strong>
            </p>
            <div className="report-rule" />
            <section>
              <h2>Findings:</h2>
              <ul>
                {findings.slice(0, 4).map(finding => (
                  <li key={finding}>{finding}</li>
                ))}
              </ul>
            </section>
            <div className="report-rule" />
            <section>
              <h2>Conclusion:</h2>
              <p id={descriptionId}>{conclusion || caseData.verdictExplanation}</p>
              {!isCorrect && !canRetry && (
                <p>Case closed. Another detective will follow up on this trail.</p>
              )}
            </section>
            <div className={`report-verdict-box${isCorrect ? ' correct' : ' incorrect'}`}>
              <span>Verdict:</span>
              <strong>{verdictText}</strong>
              <small>Your call: {selectedText}</small>
            </div>
          </div>
        </motion.article>
        <StickyButton className="report-continue" direction="right" onClick={onContinue}>
          Continue
        </StickyButton>
        </div>
      </DeskScene>
    </motion.div>
  );
}
