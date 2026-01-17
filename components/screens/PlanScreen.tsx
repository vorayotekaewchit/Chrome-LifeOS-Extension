import { motion } from "motion/react";
import { MissionRow } from "../MissionRow";
import { StreakPill } from "../StreakPill";
import { Mission } from "../../utils/storage";

interface PlanScreenProps {
  missions: Mission[];
  streak: number;
  onStartDay: () => void;
}

export function PlanScreen({ missions, streak, onStartDay }: PlanScreenProps) {
  const totalDuration = missions.reduce((sum, m) => sum + m.duration, 0);
  
  return (
    <div className="min-h-full bg-white">
      <div className="max-w-md mx-auto px-4 py-4 space-y-4">
        <div className="flex items-center justify-between">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-lg font-semibold text-neutral-900"
          >
            Today's Plan
          </motion.h1>
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
          >
            <StreakPill streak={streak} />
          </motion.div>
        </div>
        
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="space-y-1"
        >
          <p className="text-xs font-medium text-neutral-600">
            {missions.length} {missions.length === 1 ? 'mission' : 'missions'} • {totalDuration} min total
          </p>
          <p className="text-[11px] text-neutral-500 italic">
            You showed up today.
          </p>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mission-card mission-card-divider bg-white/80 backdrop-blur-sm shadow-sm"
        >
          {missions.map((mission, idx) => (
            <motion.div
              key={mission.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 + idx * 0.1 }}
            >
              <MissionRow mission={mission} isDraggable={false} />
            </motion.div>
          ))}
        </motion.div>
        
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          onClick={onStartDay}
          className="w-full px-4 py-2.5 text-sm font-semibold rounded-lg bg-orange-500 text-white hover:bg-orange-600 active:bg-orange-700 transition-all duration-200 shadow-md shadow-orange-500/20 hover:shadow-lg hover:shadow-orange-500/30 hover:scale-[1.02] active:scale-[0.98]"
        >
          Start day
        </motion.button>
      </div>
    </div>
  );
}
