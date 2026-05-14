export const VERDICT_OPTIONS = [
  { value: 'true', label: 'True', hint: 'It checks out.' },
  { value: 'false', label: 'False', hint: 'It is not real.' },
  { value: 'misleading', label: 'Misleading', hint: 'Some facts, but the story twists them.' },
];

export function formatVerdict(value) {
  const option = VERDICT_OPTIONS.find(item => item.value === value);
  return option ? option.label : 'Unfiled';
}

export function isCorrectVerdict(selectedVerdict, actualVerdict) {
  return selectedVerdict === actualVerdict;
}
