import { useState } from "react";
import { Plus, X, RotateCcw } from "lucide-react";
import { MissionTagChips } from "../MissionTagChips";
import { motion } from "motion/react";
import { Mission, MissionTag } from "../../utils/storage";

interface InputScreenProps {
  onGeneratePlan: (missions: Mission[]) => void;
  previousMissions: Mission[];
}

interface DraftMission {
  title: string;
  tag: MissionTag;
  why?: string;
}

export function InputScreen({ onGeneratePlan, previousMissions }: InputScreenProps) {
  const [missions, setMissions] = useState<DraftMission[]>([]);
  const [currentMission, setCurrentMission] = useState<Partial<DraftMission>>({});
  
  const addMission = () => {
    if (currentMission.title && currentMission.tag) {
      setMissions([...missions, currentMission as DraftMission]);
      setCurrentMission({});
    }
  };
  
  const removeMission = (index: number) => {
    setMissions(missions.filter((_, i) => i !== index));
  };
  
  const importFromYesterday = () => {
    const incompleteMissions = previousMissions.filter(m => !m.completed).slice(0, 3);
    setMissions(incompleteMissions.map(m => ({
      title: m.title,
      tag: m.tag,
      why: m.why
    })));
  };
  
  const handleGeneratePlan = () => {
    const finalMissions: Mission[] = missions.map((m, idx) => ({
      id: `mission-${Date.now()}-${idx}`,
      title: m.title,
      tag: m.tag,
      why: m.why,
      duration: Math.floor(Math.random() * 11) + 15, // 15-25 mins
      completed: false
    }));
    onGeneratePlan(finalMissions);
  };
  
  return (
    <div className="min-h-full bg-white">
      <div className="max-w-md mx-auto px-4 py-4 space-y-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h1 className="text-lg font-semibold text-neutral-900 mb-1">Pick today's missions</h1>
          <p className="text-xs text-neutral-500">Three missions a day. That's it.</p>
        </motion.div>
        
        {previousMissions.length > 0 && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            onClick={importFromYesterday}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium rounded-lg border border-neutral-200 bg-white text-neutral-700 hover:border-neutral-300 hover:bg-neutral-50 active:bg-neutral-100 transition-all duration-200 hover:scale-[1.01] active:scale-[0.99]"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Import from yesterday
          </motion.button>
        )}
        
        {/* Added missions */}
        {missions.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-2"
          >
            {missions.map((mission, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="flex items-start gap-2 p-3 rounded-lg bg-gradient-to-br from-neutral-50 to-white border border-neutral-200 shadow-sm hover:shadow-md transition-shadow duration-200"
              >
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-neutral-900 mb-0.5">{mission.title}</h3>
                  <p className="text-xs text-neutral-500">{mission.tag}</p>
                </div>
                <button
                  onClick={() => removeMission(idx)}
                  className="p-1 text-neutral-400 hover:text-neutral-600 transition-colors"
                  aria-label={`Remove mission: ${mission.title}`}
                  title={`Remove mission: ${mission.title}`}
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </motion.div>
            ))}
          </motion.div>
        )}
        
        {/* Add new mission form */}
        {missions.length < 3 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-3 p-4 rounded-xl border-2 border-dashed border-neutral-200 bg-gradient-to-br from-neutral-50/50 to-white hover:border-neutral-300 transition-colors duration-200"
          >
            <div>
              <label className="block text-xs font-medium text-neutral-700 mb-1.5">
                Mission {missions.length + 1}
              </label>
              <input
                type="text"
                value={currentMission.title || ""}
                onChange={(e) => setCurrentMission({ ...currentMission, title: e.target.value })}
                placeholder="e.g., Write first draft of proposal"
                className="w-full px-3 py-2 text-sm rounded-lg border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-xs font-medium text-neutral-700 mb-1.5">Tag</label>
              <MissionTagChips
                selectedTag={currentMission.tag}
                onSelect={(tag) => setCurrentMission({ ...currentMission, tag })}
              />
            </div>
            
            <div>
              <label className="block text-xs font-medium text-neutral-700 mb-1.5">
                Why? (optional)
              </label>
              <textarea
                value={currentMission.why || ""}
                onChange={(e) => setCurrentMission({ ...currentMission, why: e.target.value })}
                placeholder="Helps keep motivation clear"
                className="w-full px-3 py-2 text-sm rounded-lg border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                rows={2}
              />
            </div>
            
            <button
              onClick={addMission}
              disabled={!currentMission.title || !currentMission.tag}
              className="w-full flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg bg-neutral-100 text-neutral-700 hover:bg-neutral-200 active:bg-neutral-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Mission
            </button>
          </motion.div>
        )}
        
        {/* Generate plan button */}
        {missions.length > 0 && (
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={handleGeneratePlan}
            className="w-full px-4 py-2.5 text-sm font-semibold rounded-lg bg-orange-500 text-white hover:bg-orange-600 active:bg-orange-700 transition-all duration-200 shadow-md shadow-orange-500/20 hover:shadow-lg hover:shadow-orange-500/30 hover:scale-[1.02] active:scale-[0.98]"
          >
            Generate plan
          </motion.button>
        )}
      </div>
    </div>
  );
}
