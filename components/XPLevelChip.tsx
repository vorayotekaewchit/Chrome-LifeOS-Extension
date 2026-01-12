import { memo } from "react";

interface XPLevelChipProps {
  level: number;
  xp: number;
}

const LEVEL_NAMES = [
  "Focus Explorer",
  "Focus Seeker",
  "Focus Builder",
  "Focus Architect",
  "Focus Master"
];

const XP_THRESHOLDS = [0, 50, 150, 300, 500];

/**
 * Displays the user's current level and level name based on XP.
 * Memoized to prevent unnecessary re-renders when props haven't changed.
 */
export const XPLevelChip = memo(function XPLevelChip({ level, xp }: XPLevelChipProps) {
  const levelName = LEVEL_NAMES[Math.min(level, LEVEL_NAMES.length - 1)];
  
  return (
    <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-neutral-100">
      <span className="text-xs text-neutral-900">
        LVL {level}
      </span>
      <span className="text-neutral-400 text-[10px]">•</span>
      <span className="text-[10px] text-neutral-500 truncate max-w-[60px]">{levelName}</span>
    </div>
  );
});

/**
 * Calculates the user's level based on their total XP.
 * Levels are determined by XP thresholds: 0, 50, 150, 300, 500.
 */
export function calculateLevel(xp: number): number {
  let level = 0;
  for (let i = XP_THRESHOLDS.length - 1; i >= 0; i--) {
    if (xp >= XP_THRESHOLDS[i]) {
      level = i;
      break;
    }
  }
  return level;
}
