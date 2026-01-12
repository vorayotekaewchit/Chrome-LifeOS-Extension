import { memo } from "react";
import { Flame } from "lucide-react";

interface StreakPillProps {
  streak: number;
  isFull?: boolean;
}

/**
 * Displays the user's current streak in a pill-shaped badge.
 * Memoized to prevent unnecessary re-renders when props haven't changed.
 */
export const StreakPill = memo(function StreakPill({ streak, isFull = true }: StreakPillProps) {
  return (
    <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full ${isFull ? 'bg-orange-50' : 'bg-neutral-100'}`}>
      <Flame 
        className={`w-3 h-3 ${isFull ? 'text-orange-500 fill-orange-500' : 'text-neutral-400 fill-neutral-400'}`}
      />
      <span className={`text-xs ${isFull ? 'text-orange-600' : 'text-neutral-500'}`}>
        {streak} {streak === 1 ? 'day' : 'days'}
      </span>
    </div>
  );
});
