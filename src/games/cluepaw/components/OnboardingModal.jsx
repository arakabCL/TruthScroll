import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import MascotPose from './MascotPose';

const STEPS = [
  {
    title: 'Welcome, Detective!',
    body: 'I am Tibbee. Let us solve internet mysteries together. You pick a case, check clues, and choose what is really going on.',
    pose: 'pointing',
  },
  {
    title: 'Four Ways to Play',
    body: 'Scroll posts, sort clues, listen to witnesses, and check websites. Tibbee will guide you step by step.',
    pose: 'investigate',
  },
  {
    title: 'Win Badges',
    body: 'Solve cases to earn XP, coins, and badges. Short daily practice counts.',
    pose: 'reward',
  },
  {
    title: 'Start Your First Case',
    body: 'Open the case on your desk. Read the clues, choose a verdict, and earn your first badge.',
    pose: 'celebrate',
    showHowToPlay: true
  },
];

const LOOP_STEPS = [
  { label: 'Pick', value: 'a case' },
  { label: 'Spot', value: 'clues' },
  { label: 'Choose', value: 'a verdict' },
  { label: 'Earn', value: 'rewards' },
];

export default function OnboardingModal() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const dialogRef = useRef(null);
  const previousFocusRef = useRef(null);

  useEffect(() => {
    const seen = localStorage.getItem('clupaw-onboarding-seen');
    if (!seen) setOpen(true);
  }, []);

  useEffect(() => {
    if (!open) return undefined;

    previousFocusRef.current = document.activeElement;
    const focusableSelector = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
    const focusFirstControl = () => {
      const focusable = dialogRef.current?.querySelectorAll(focusableSelector);
      focusable?.[0]?.focus();
    };
    const animationFrame = window.requestAnimationFrame(focusFirstControl);

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        close();
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
  }, [open]);

  const close = () => {
    localStorage.setItem('clupaw-onboarding-seen', '1');
    setOpen(false);
  };

  const next = () => {
    if (step < STEPS.length - 1) setStep(s => s + 1);
    else close();
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="onboarding-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          role="presentation"
        >
          <motion.div
            className="onboarding-card-wrapper"
            initial={{ scale: 0.9, y: 40 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 40 }}
            transition={{ type: 'spring', damping: 22, stiffness: 200 }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="onboarding-title"
            aria-describedby="onboarding-body"
            ref={dialogRef}
          >
            <div className="onboarding-mascot">
              <MascotPose pose={STEPS[step].pose} />
            </div>
            <div className="onboarding-card speech-bubble">
              <h2 className="onboarding-title" id="onboarding-title">{STEPS[step].title}</h2>
              <p className="onboarding-body" id="onboarding-body">{STEPS[step].body}</p>

              {STEPS[step].showHowToPlay && (
                <div className="onboarding-how-to">
                  <h3 className="onboarding-how-to-title">HOW TO PLAY</h3>
                  <div className="onboarding-how-to-list">
                    {LOOP_STEPS.map((loopStep, index) => (
                      <div key={loopStep.label} className="onboarding-how-to-step">
                        <span className="step-number">{index + 1}</span>
                        <div className="step-text">
                          <strong>{loopStep.label}</strong>
                          <span>{loopStep.value}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="onboarding-dots">
                {STEPS.map((_, i) => (
                  <span key={i} className={`onboarding-dot ${i === step ? 'active' : ''}`} />
                ))}
              </div>

              <div className="onboarding-actions">
                {step > 0 && (
                  <button className="onboarding-btn secondary" onClick={() => setStep(s => s - 1)} type="button">
                    Back
                  </button>
                )}
                <button className="onboarding-btn primary" onClick={next} type="button">
                  {step === STEPS.length - 1 ? 'Start Playing' : 'Next'}
                </button>
              </div>

              <button className="onboarding-skip" onClick={close} type="button">
                Skip intro
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
