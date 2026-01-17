import { motion } from "motion/react";
import { MomentumRow } from "../MomentumRow";
import { MissionRow } from "../MissionRow";
import { Mission } from "../../utils/storage";
import { calculateLevel } from "../XPLevelChip";
import { useLifeOStore } from "../../hooks/useLifeOState";

interface DashboardScreenProps {
  missions: Mission[];
  xp: number;
  streak: number;
  last7Days: number[];
  onResetDay: () => void;
}

export function DashboardScreen({ 
  missions, 
  xp, 
  streak, 
  last7Days,
  onResetDay 
}: DashboardScreenProps) {
  const { momentumBar } = useLifeOStore();
  const level = calculateLevel(xp);
  const completedMissions = missions.filter(m => m.completed);
  const completionRate = missions.length > 0 
    ? Math.round((completedMissions.length / missions.length) * 100) 
    : 0;
  
  return (
    <div className="min-h-full bg-gradient-to-br from-neutral-50 via-white to-neutral-50 px-3 py-4">
      <div className="max-w-md mx-auto space-y-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-3 p-5 rounded-xl border border-neutral-200 bg-white/80 backdrop-blur-sm shadow-sm"
        >
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-neutral-900 tracking-tight">Life OS</h1>
            <div className="flex gap-1.5">
              <div className="px-2.5 py-1 rounded-full text-[10px] font-bold text-orange-600 bg-orange-50 border border-orange-200">
                {streak} 🔥
              </div>
              <div className="px-2.5 py-1 rounded-full text-[10px] font-bold text-blue-600 bg-blue-50 border border-blue-200">
                LVL {level}
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-r from-neutral-50 to-white rounded-lg p-4 border border-neutral-100 space-y-3">
            <div className="flex justify-between items-center text-xs font-medium text-neutral-600">
              <span>Daily Progress</span>
              <span className="text-orange-600">{completionRate}%</span>
            </div>
            <div className="w-full h-2 bg-neutral-200 rounded-full overflow-hidden shadow-inner">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${completionRate}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="h-full bg-gradient-to-r from-orange-500 to-orange-600 rounded-full shadow-sm"
              />
            </div>
          </div>
        </motion.div>
        
        {/* Momentum - conditionally rendered */}
        {momentumBar.show && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="space-y-3 p-4 rounded-xl border border-neutral-200 bg-white/80 backdrop-blur-sm shadow-sm"
          >
            <MomentumRow last7Days={last7Days} />
          </motion.div>
        )}
        
        {/* Today's missions */}
        {missions.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="space-y-3"
          >
            <h2 className="text-sm font-semibold text-neutral-900 tracking-tight">Today's missions</h2>
            <div className="mission-card mission-card-divider bg-white/80 backdrop-blur-sm shadow-sm">
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
            </div>
          </motion.div>
        )}
        
        {/* Encouragement */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center space-y-2 py-5"
        >
          {completedMissions.length === missions.length && missions.length > 0 ? (
            <>
              <p className="text-base font-semibold text-neutral-900 tracking-tight">Amazing work today! 🎉</p>
              <p className="text-sm text-neutral-600">You completed all your missions.</p>
            </>
          ) : completedMissions.length > 0 ? (
            <>
              <p className="text-base font-semibold text-neutral-900 tracking-tight">You showed up today.</p>
              <p className="text-sm text-neutral-600">Tiny step, real progress.</p>
            </>
          ) : (
            <>
              <p className="text-base font-semibold text-neutral-900 tracking-tight">Ready when you are.</p>
              <p className="text-sm text-neutral-600">Every journey starts with showing up.</p>
            </>
          )}
        </motion.div>
        
        {/* Reset button */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          onClick={onResetDay}
          className="w-full px-4 py-2.5 text-sm font-medium rounded-lg border border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50 hover:border-neutral-300 active:bg-neutral-100 transition-all duration-200 hover:scale-[1.01] active:scale-[0.99]"
        >
          Reset tomorrow
        </motion.button>
      </div>
    </div>
  );
}
