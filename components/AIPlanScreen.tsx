import { useState } from 'react';
import { Clock, Flame, ChevronDown } from 'lucide-react';
import { Mission } from '../App';
import { motion, AnimatePresence } from 'motion/react';

type AIPlanScreenProps = {
  missions: Mission[];
  xp: number;
  streak: number;
  onStartDay: () => void;
};

export function AIPlanScreen({ missions, xp, streak, onStartDay }: AIPlanScreenProps) {
  const [expandedMissionId, setExpandedMissionId] = useState<number | null>(null);

  const toggleMission = (id: number) => {
    setExpandedMissionId(expandedMissionId === id ? null : id);
  };

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Header */}
      <div className="px-6 pt-12 pb-8 flex items-end justify-between">
        <div>
          <motion.h1 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-2xl font-bold text-neutral-900 tracking-tight"
            style={{ fontWeight: 'bold' }}
          >
            Today's Plan
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="text-neutral-500 mt-1"
          >
            3 missions ready
          </motion.p>
        </div>
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="flex items-center gap-1.5 bg-orange-50 px-3 py-1.5 rounded-full"
        >
          <Flame className="w-4 h-4 text-orange-500 fill-orange-500" />
          <span className="text-sm font-medium text-orange-700">{streak}</span>
        </motion.div>
      </div>

      {/* Mission List */}
      <div className="flex-1 px-6 space-y-6">
        {missions.map((mission, index) => (
          <motion.div
            key={mission.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + (index * 0.1) }}
            onClick={() => toggleMission(mission.id)}
            className="relative pl-4 border-l-2 border-neutral-100 cursor-pointer group"
          >
            {/* Active/Inactive Indicator Line */}
            <motion.div 
              className="absolute left-[-2px] top-0 bottom-0 w-[2px] bg-neutral-900" 
              initial={{ scaleY: 0 }}
              animate={{ scaleY: expandedMissionId === mission.id ? 1 : 0 }}
            />

            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold tracking-wider text-neutral-400 uppercase">
                  {mission.type}
                </span>
                <span className="text-neutral-300">•</span>
                <div className="flex items-center gap-1 text-neutral-400">
                  <Clock className="w-3 h-3" />
                  <span className="text-xs font-medium">{mission.time}</span>
                </div>
              </div>
              <motion.div
                animate={{ rotate: expandedMissionId === mission.id ? 180 : 0 }}
                className="text-neutral-300"
              >
                <ChevronDown className="w-4 h-4" />
              </motion.div>
            </div>
            
            <h3 
              className="text-xl font-bold text-neutral-900 mb-1 leading-tight"
              style={{
                fontWeight: 'bold',
                textShadow: mission.completed ? '0 0 8px rgba(0, 0, 0, 0.3)' : 'none'
              }}
            >
              {mission.action}
            </h3>

            <AnimatePresence>
              {expandedMissionId === mission.id && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <p 
                    className="text-sm text-neutral-500 leading-relaxed pt-2 pb-2"
                    style={mission.completed ? { textShadow: '0 0 8px rgba(0, 0, 0, 0.3)' } : undefined}
                  >
                    {mission.why}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>

      {/* Bottom CTA */}
      <div className="px-6 pb-8 pt-4 bg-gradient-to-t from-white via-white to-transparent">
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          onClick={onStartDay}
          className="w-full py-4 bg-neutral-900 text-white font-medium text-lg rounded-2xl shadow-lg shadow-neutral-200 hover:bg-neutral-800 hover:scale-[1.02] active:scale-[0.98] transition-all"
        >
          Start Day
        </motion.button>
      </div>
    </div>
  );
}
