import React from 'react';

const POSES = {
  default: {
    src: '/mascots/tibbee1.png',
    label: 'Detective Tibbee standing',
  },
  pointing: {
    src: '/mascots/tibbee2.png',
    label: 'Detective Tibbee pointing to the next clue',
  },
  thinking: {
    src: '/mascots/tibbee3.png',
    label: 'Detective Tibbee thinking through a tricky clue',
  },
  investigate: {
    src: '/mascots/tibbee.png',
    label: 'Detective Tibbee holding a magnifying glass',
  },
  celebrate: {
    src: '/mascots/tibbee4.png',
    label: 'Detective Tibbee celebrating',
  },
  running: {
    src: '/mascots/tibbee5.png',
    label: 'Detective Tibbee running to the next case',
  },
  reward: {
    src: '/mascots/achievements.png',
    label: 'Detective Tibbee holding a reward badge',
  },
};

export default function MascotPose({ pose = 'investigate', className = '', label }) {
  const resolvedPose = POSES[pose] ? pose : 'default';
  const poseData = POSES[resolvedPose];

  return (
    <img
      src={poseData.src}
      className={`mascot-pose mascot-pose-${resolvedPose} ${className}`}
      alt={label || poseData.label}
      draggable="false"
    />
  );
}
