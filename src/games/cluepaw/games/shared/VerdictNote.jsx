import React, { useId } from 'react';
import { VERDICT_OPTIONS } from './gameVerdict';

export default function VerdictNote({
  value,
  onChange,
  onSubmit,
  disabled = false,
  disabledReason,
  submitLabel = 'Seal Verdict',
}) {
  const headingId = useId();

  const moveSelection = (currentIndex, direction, currentTarget) => {
    if (disabled) return;
    const nextIndex = (currentIndex + direction + VERDICT_OPTIONS.length) % VERDICT_OPTIONS.length;
    onChange(VERDICT_OPTIONS[nextIndex].value);
    window.requestAnimationFrame(() => {
      currentTarget.parentElement?.querySelectorAll('[role="radio"]')?.[nextIndex]?.focus();
    });
  };

  const handleChoiceKeyDown = (event, option, index) => {
    if (disabled) return;

    if (event.key === ' ' || event.key === 'Enter') {
      event.preventDefault();
      onChange(option.value);
      return;
    }

    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
      event.preventDefault();
      moveSelection(index, 1, event.currentTarget);
    } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
      event.preventDefault();
      moveSelection(index, -1, event.currentTarget);
    }
  };

  return (
    <div className={`verdict-note${disabled ? ' is-locked' : ''}`}>
      <h3 id={headingId}>What do you think?</h3>
      <div className="verdict-options" role="radiogroup" aria-labelledby={headingId}>
        {VERDICT_OPTIONS.map((option, index) => {
          const selected = value === option.value;
          return (
          <button
            key={option.value}
            type="button"
            className={`verdict-choice${value === option.value ? ' selected' : ''}`}
            onClick={() => !disabled && onChange(option.value)}
            onKeyDown={(event) => handleChoiceKeyDown(event, option, index)}
            disabled={disabled}
            role="radio"
            aria-checked={selected}
            tabIndex={disabled ? -1 : (selected || (!value && index === 0) ? 0 : -1)}
          >
            <span className="verdict-box" aria-hidden="true">{selected ? 'x' : ''}</span>
            <span>
              <strong>{option.label}</strong>
              <small>{option.hint}</small>
            </span>
          </button>
        );
        })}
      </div>
      {disabled ? (
        <p className="verdict-hint">{disabledReason}</p>
      ) : (
        <button
          type="button"
          className="verdict-submit"
          onClick={onSubmit}
          disabled={!value}
        >
          {submitLabel}
        </button>
      )}
    </div>
  );
}
