import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { CASES } from './data/cases';
import MascotPose from './components/MascotPose';
import AppIcon from './components/AppIcon';

const TUTORIALS_BY_TYPE = {
  'detective-board': {
    title: 'Detective Board',
    intro: 'Open the clue cards, sort what each one proves, and make your verdict when the board makes sense.',
    steps: [
      {
        title: 'Read the claim',
        body: 'Start with the mission sentence. Ask: what exactly is this claim saying?',
        selector: '.scene-claim-strip',
        action: 'Read claim',
      },
      {
        title: 'Open a clue',
        body: 'Tap a clue card. Look for where it came from, when it was made, and what it proves.',
        selector: '.bottom-clue-tray .tray-clue-card, .tray-clue-card.active',
        action: 'Open clue',
      },
      {
        title: 'Sort the clue',
        body: 'Mark the clue as helpful or suspicious. Tibbee tip: proof beats panic.',
        selector: '.stamp-actions .stamp-button',
        action: 'Sort clue',
      },
      {
        title: 'Make your verdict',
        body: 'When the board makes sense, pick the verdict you can explain.',
        selector: '.verdict-note',
        action: 'Choose verdict',
      },
    ],
  },
  'witness-stories': {
    title: 'Witness Stories',
    intro: 'Listen like a careful detective. Good witnesses are specific, steady, and close to what happened.',
    steps: [
      {
        title: 'Hear the story',
        body: 'Read each witness card. Notice who saw something themselves.',
        selector: '.witness-tabs .witness-polaroid',
        action: 'Read witness',
      },
      {
        title: 'Check details',
        body: 'Strong witnesses give clear details that match other clues.',
        selector: '.witness-report-paper',
        action: 'Check details',
      },
      {
        title: 'Spot changes',
        body: 'Be careful when a story changes or someone has a reason to stretch the truth.',
        selector: '.witness-report-paper .desk-alert-note, .stamp-actions .stamp-button',
        action: 'Spot conflict',
      },
      {
        title: 'Choose the best fit',
        body: 'Pick the verdict that fits all the stories together.',
        selector: '.verdict-note',
        action: 'Choose verdict',
      },
    ],
  },
  'web-investigation': {
    title: 'Web Investigation',
    intro: 'Check the websites, compare sources, and pin the pages that give the clearest proof.',
    steps: [
      {
        title: 'Open pages',
        body: 'Visit each website before you decide. One page is never enough.',
        selector: '.phone-source-tab',
        action: 'Open site',
      },
      {
        title: 'Ask who made it',
        body: 'Look for the author, the purpose, and whether the site shows proof.',
        selector: '.reliability-stamp',
        action: 'Check source',
      },
      {
        title: 'Pin the best evidence',
        body: 'Save the strongest source so your verdict has support.',
        selector: '.phone-article .receipt-button',
        action: 'Pin evidence',
        scroll: 'mobile',
      },
      {
        title: 'Make the call',
        body: 'Use the pinned evidence to choose the most careful verdict.',
        selector: '.verdict-note',
        action: 'Choose verdict',
      },
    ],
  },
  'social-scroll': {
    title: 'Social Scroll',
    intro: 'A popular post is not always true. Slow the feed down, compare posts, and look for what changed.',
    steps: [
      {
        title: 'Pause the feed',
        body: 'Tap the post making the biggest claim. Popular does not mean proven.',
        selector: '.social-post-card, .investigate-feed-button',
        action: 'Investigate post',
        advanceOnClick: true,
        nextAction: {
          type: 'click',
          selector: '.investigate-feed-button, .social-post-open',
        },
      },
      {
        title: 'Check the source',
        body: 'Look for who posted it first and whether there is a real source.',
        selector: '.social-investigation-top button:nth-child(2), .investigate-feed-button',
        action: 'Check source',
      },
      {
        title: 'Find what changed',
        body: 'Watch for missing labels, cropped context, jokes, or edited reposts.',
        selector: '.social-focus-post, .social-signal-card',
        action: 'Compare posts',
        scroll: 'mobile',
      },
      {
        title: 'Pin signals',
        body: 'Save strong signals, then make the safest verdict.',
        selector: '.social-signal-card .receipt-button, .verdict-note',
        action: 'Pin signal',
      },
    ],
  },
};

const DEFAULT_TUTORIAL = TUTORIALS_BY_TYPE['detective-board'];
const MOBILE_TOUR_QUERY = '(max-width: 900px)';

const scrollTargetIntoNestedView = (target) => {
  const scrollContainers = [];
  let node = target.parentElement;

  while (node && node !== document.body) {
    const style = window.getComputedStyle(node);
    const canScrollY = /(auto|scroll|overlay)/.test(style.overflowY);
    if (canScrollY && node.scrollHeight > node.clientHeight + 1) {
      scrollContainers.push(node);
    }
    node = node.parentElement;
  }

  scrollContainers.forEach(container => {
    const containerRect = container.getBoundingClientRect();
    const targetRect = target.getBoundingClientRect();
    const targetOffsetTop = targetRect.top - containerRect.top + container.scrollTop;
    const targetCenter = targetOffsetTop + targetRect.height / 2;
    const nextScrollTop = Math.max(0, targetCenter - container.clientHeight / 2);
    container.scrollTop = nextScrollTop;
  });

  if (scrollContainers.length === 0) {
    target.scrollIntoView({ block: 'center', inline: 'nearest', behavior: 'auto' });
    return;
  }

  const finalRect = target.getBoundingClientRect();
  if (finalRect.top < 12 || finalRect.bottom > window.innerHeight - 12) {
    const offset = finalRect.top + finalRect.height / 2 - window.innerHeight / 2;
    window.scrollBy({ top: offset, behavior: 'auto' });
  }
};

const FieldKit = () => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [targetFound, setTargetFound] = useState(false);
  const [targetBox, setTargetBox] = useState(null);
  const activeTargetRef = useRef(null);
  const advanceTargetRef = useRef(null);
  const advanceHandlerRef = useRef(null);

  const isInvestigation = location.pathname.startsWith('/investigate/');
  const isHelpAvailable = isInvestigation;
  const activeCaseId = useMemo(() => {
    const match = location.pathname.match(/^\/investigate\/(\d+)/);
    return match ? parseInt(match[1], 10) : null;
  }, [location.pathname]);

  const caseData = useMemo(() => {
    if (!activeCaseId) return null;
    return CASES.find(c => c.id === activeCaseId);
  }, [activeCaseId]);

  const tutorial = useMemo(() => {
    if (!caseData) return DEFAULT_TUTORIAL;
    return TUTORIALS_BY_TYPE[caseData.gameType] || DEFAULT_TUTORIAL;
  }, [caseData]);
  const tutorialStorageKey = caseData?.gameType
    ? `clupaw-field-kit-seen-${caseData.gameType}`
    : null;

  useEffect(() => {
    if (!isHelpAvailable) {
      setIsOpen(false);
    }
  }, [isHelpAvailable]);

  useEffect(() => {
    if (isInvestigation) {
      setStepIndex(0);
      setTargetFound(false);
      if (!tutorialStorageKey || typeof window === 'undefined') {
        setIsOpen(false);
        return;
      }

      let hasSeenTutorial = false;
      try {
        hasSeenTutorial = window.localStorage.getItem(tutorialStorageKey) === '1';
        if (!hasSeenTutorial) window.localStorage.setItem(tutorialStorageKey, '1');
      } catch {
        hasSeenTutorial = true;
      }

      setIsOpen(!hasSeenTutorial);
    }
  }, [location.pathname, tutorialStorageKey, isInvestigation]);

  useEffect(() => {
    if (!isOpen) return undefined;

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen]);

  const currentStep = tutorial.steps[stepIndex] || tutorial.steps[0];
  const isLastStep = stepIndex === tutorial.steps.length - 1;
  const overlaySide = targetBox && targetBox.left > window.innerWidth * 0.52 ? 'left' : 'right';
  const overlayDock = targetBox && targetBox.top > window.innerHeight * 0.5 ? 'top' : 'bottom';

  const detachAdvanceHandler = useCallback(() => {
    if (advanceTargetRef.current && advanceHandlerRef.current) {
      advanceTargetRef.current.removeEventListener('click', advanceHandlerRef.current);
    }
    advanceTargetRef.current = null;
    advanceHandlerRef.current = null;
  }, []);

  const clearTarget = useCallback(() => {
    document.querySelectorAll('.tibbee-tour-highlight, .tibbee-tour-flash').forEach(node => {
      node.classList.remove('tibbee-tour-highlight', 'tibbee-tour-flash');
      node.removeAttribute('data-tibbee-step');
      node.removeAttribute('data-tibbee-action');
    });
    detachAdvanceHandler();
    activeTargetRef.current = null;
  }, [detachAdvanceHandler]);

  const findTarget = useCallback(() => {
    if (!currentStep?.selector) return null;
    const candidates = Array.from(document.querySelectorAll(currentStep.selector));
    const visibleCandidates = candidates.filter(node => {
      const rect = node.getBoundingClientRect();
      const style = window.getComputedStyle(node);
      return (
        rect.width > 8 &&
        rect.height > 8 &&
        style.display !== 'none' &&
        style.visibility !== 'hidden' &&
        Number(style.opacity) !== 0 &&
        !node.closest('.field-kit-overlay')
      );
    });
    return visibleCandidates[0] || candidates[0] || null;
  }, [currentStep?.selector]);

  const shouldScrollForStep = useCallback(() => {
    if (currentStep?.scroll === true) return true;
    if (currentStep?.scroll === 'mobile') {
      return window.matchMedia(MOBILE_TOUR_QUERY).matches;
    }
    return false;
  }, [currentStep?.scroll]);

  const goNext = () => {
    detachAdvanceHandler();
    if (currentStep?.nextAction?.type === 'click' && currentStep?.nextAction?.selector) {
      const target = document.querySelector(currentStep.nextAction.selector);
      if (target && typeof target.click === 'function') {
        target.click();
      }
    }

    if (isLastStep) setIsOpen(false);
    else setStepIndex(index => Math.min(index + 1, tutorial.steps.length - 1));
  };

  const goBack = () => {
    detachAdvanceHandler();
    setStepIndex(index => Math.max(index - 1, 0));
  };

  const updateTarget = useCallback((options = {}) => {
    const target = findTarget();
    setTargetFound(Boolean(target));

    if (!target) {
      clearTarget();
      setTargetBox(null);
      return null;
    }

    if (activeTargetRef.current !== target) {
      clearTarget();
      activeTargetRef.current = target;
      target.classList.add('tibbee-tour-highlight');
      target.setAttribute('data-tibbee-step', `${stepIndex + 1}`);
      target.setAttribute('data-tibbee-action', currentStep.action || 'Try this');
    }

    if (currentStep?.advanceOnClick && advanceTargetRef.current !== target) {
      detachAdvanceHandler();
      const handler = () => {
        if (isLastStep) setIsOpen(false);
        else setStepIndex(index => Math.min(index + 1, tutorial.steps.length - 1));
      };
      advanceTargetRef.current = target;
      advanceHandlerRef.current = handler;
      target.addEventListener('click', handler, { once: true });
    }

    let rect = target.getBoundingClientRect();
    const isOutsideViewport = rect.bottom < 12 || rect.top > window.innerHeight - 12;
    if (options.scroll || isOutsideViewport) {
      scrollTargetIntoNestedView(target);
      rect = target.getBoundingClientRect();
    }
    const padding = Math.min(18, Math.max(8, Math.min(rect.width, rect.height) * 0.08));
    const nextBox = {
      top: Math.max(8, rect.top - padding),
      left: Math.max(8, rect.left - padding),
      width: Math.min(window.innerWidth - 16, rect.width + padding * 2),
      height: Math.min(window.innerHeight - 16, rect.height + padding * 2),
      label: currentStep.action || 'Try this',
    };
    setTargetBox(previous => {
      if (
        previous &&
        Math.abs(previous.top - nextBox.top) < 1 &&
        Math.abs(previous.left - nextBox.left) < 1 &&
        Math.abs(previous.width - nextBox.width) < 1 &&
        Math.abs(previous.height - nextBox.height) < 1 &&
        previous.label === nextBox.label
      ) {
        return previous;
      }
      return nextBox;
    });
    return target;
  }, [clearTarget, currentStep.action, currentStep?.advanceOnClick, findTarget, isLastStep, detachAdvanceHandler, stepIndex, tutorial.steps.length]);

  const focusCurrentTarget = (shouldScroll = true) => {
    const target = updateTarget({ scroll: shouldScroll });
    if (!target) return;
    target.classList.add('tibbee-tour-flash');
    window.setTimeout(() => target.classList.remove('tibbee-tour-flash'), 900);
  };

  useEffect(() => {
    if (!isOpen || !currentStep?.selector) return undefined;
    clearTarget();
    const scrollOnFirstTarget = shouldScrollForStep();
    const updateWithoutScroll = () => updateTarget({ scroll: false });
    const raf = window.requestAnimationFrame(() => updateTarget({ scroll: scrollOnFirstTarget }));
    const retryShort = window.setTimeout(() => updateTarget({ scroll: scrollOnFirstTarget }), 260);
    const retryAfterAnimation = window.setTimeout(updateWithoutScroll, 720);
    const observer = new MutationObserver(updateWithoutScroll);
    observer.observe(document.body, { childList: true, subtree: true });
    window.addEventListener('resize', updateWithoutScroll);
    window.addEventListener('scroll', updateWithoutScroll, true);
    return () => {
      window.cancelAnimationFrame(raf);
      window.clearTimeout(retryShort);
      window.clearTimeout(retryAfterAnimation);
      observer.disconnect();
      window.removeEventListener('resize', updateWithoutScroll);
      window.removeEventListener('scroll', updateWithoutScroll, true);
      clearTarget();
      setTargetBox(null);
    };
  }, [clearTarget, currentStep?.selector, isOpen, location.pathname, shouldScrollForStep, stepIndex, updateTarget]);

  if (!isHelpAvailable) return null;

  return (
    <>
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            className="field-kit-trigger"
            onClick={() => {
              setStepIndex(0);
              setTargetFound(false);
              setIsOpen(true);
            }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.05 }}
            type="button"
            aria-label="Show Tibbee tutorial"
          >
            <MascotPose pose="thinking" className="field-kit-trigger-mascot" />
            <span>Help</span>
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.button
              className="field-kit-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              type="button"
              aria-label="Close Tibbee help"
            ></motion.button>

            <motion.aside
              className={`field-kit-overlay field-kit-overlay-${overlaySide} field-kit-overlay-${overlayDock}`}
              initial={{ opacity: 0, x: overlaySide === 'left' ? -80 : 80, y: 12 }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              exit={{ opacity: 0, x: overlaySide === 'left' ? -120 : 120 }}
              transition={{ type: 'spring', damping: 20, stiffness: 100 }}
              role="dialog"
              aria-modal="false"
              aria-label={`${tutorial.title} tutorial`}
            >
              <div className="field-kit-header">
                <h3 className="field-kit-title">Tibbee Tutorial</h3>
                <button
                  onClick={() => setIsOpen(false)}
                  className="field-kit-close"
                  title="Close tutorial"
                  type="button"
                >
                  <AppIcon name="close" size={18} />
                </button>
              </div>

              <div className="field-kit-avatar">
                <motion.div
                  initial={{ scale: 0, y: 50 }}
                  animate={{ scale: 1, y: 0 }}
                  transition={{ type: 'spring', delay: 0.1, stiffness: 200 }}
                  className="field-kit-avatar-image"
                >
                  <MascotPose pose="thinking" />
                </motion.div>
              </div>

              <div className="field-kit-context">
                <span className="field-kit-kicker">{tutorial.title}</span>
                <span className="field-kit-step-count">Step {stepIndex + 1}</span>
                <h4>{currentStep.title}</h4>
                <p>{currentStep.body}</p>
              </div>

              <div className="field-kit-progress" aria-label={`Tutorial step ${stepIndex + 1} of ${tutorial.steps.length}`}>
                {tutorial.steps.map((step, index) => (
                  <button
                    key={step.title}
                    type="button"
                    className={index === stepIndex ? 'active' : ''}
                    onClick={() => {
                      setStepIndex(index);
                    }}
                    aria-label={`Go to ${step.title}`}
                  />
                ))}
              </div>

              <div className="field-kit-actions">
                <button type="button" className="field-kit-nav-btn" onClick={goBack} disabled={stepIndex === 0}>
                  Back
                </button>
                <button type="button" className="field-kit-start" onClick={goNext}>
                  {isLastStep ? 'Start Game' : 'Next'}
                </button>
              </div>
            </motion.aside>

            <AnimatePresence>
              {targetBox && (
                <motion.div
                  className="tibbee-tour-spotlight"
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{
                    opacity: 1,
                    scale: 1,
                    top: targetBox.top,
                    left: targetBox.left,
                    width: targetBox.width,
                    height: targetBox.height,
                  }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ type: 'spring', damping: 22, stiffness: 180 }}
                  style={{
                    top: targetBox.top,
                    left: targetBox.left,
                    width: targetBox.width,
                    height: targetBox.height,
                  }}
                  aria-hidden="true"
                >
                  <span>{targetBox.label}</span>
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default FieldKit;
