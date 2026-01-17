import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { StreakPill } from "../StreakPill";
import { XPLevelChip, calculateLevel } from "../XPLevelChip";
import { Mission } from "../../utils/storage";
import { Smile, Meh, Frown } from "lucide-react";
import { useLifeOStore } from "../../hooks/useLifeOState";

interface FocusScreenProps {
  missions: Mission[];
  streak: number;
  xp: number;
  onCompleteMission: (missionId: string, feeling?: "good" | "neutral" | "bad") => void;
  onSkipMission: (missionId: string) => void;
  onFinishDay: () => void;
}

export function FocusScreen({ 
  missions, 
  streak, 
  xp, 
  onCompleteMission, 
  onSkipMission,
  onFinishDay
}: FocusScreenProps) {
  const { focusWindow, setFocusWindow } = useLifeOStore();
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [showReflection, setShowReflection] = useState(false);
  const [showXPBurst, setShowXPBurst] = useState(false);
  
  // Use ref to store timer ID for proper cleanup
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const reflectionTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  // Determine current index: use persisted focusWindow, but find first incomplete if stored index is invalid/completed
  const getCurrentIndex = () => {
    if (focusWindow >= 0 && focusWindow < missions.length && !missions[focusWindow]?.completed) {
      return focusWindow;
    }
    const firstIncomplete = missions.findIndex(m => !m.completed);
    return firstIncomplete >= 0 ? firstIncomplete : 0;
  };
  
  const currentIndex = getCurrentIndex();
  const currentMission = missions[currentIndex];
  const level = calculateLevel(xp);
  const progress = timeRemaining > 0 && currentMission ? ((currentMission.duration * 60 - timeRemaining) / (currentMission.duration * 60)) * 100 : 0;
  
  // Initialize timer when mission changes
  useEffect(() => {
    if (currentMission && !currentMission.completed) {
      setTimeRemaining(currentMission.duration * 60);
      setIsRunning(false);
    }
  }, [currentIndex, currentMission]);
  
  // Timer effect with proper cleanup using refs
  useEffect(() => {
    // Clear any existing timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    if (isRunning && timeRemaining > 0) {
      timerRef.current = setInterval(() => {
        setTimeRemaining(prev => {
          const newTime = Math.max(0, prev - 1);
          // Auto-stop when timer reaches 0
          if (newTime === 0 && timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
            setIsRunning(false);
          }
          return newTime;
        });
      }, 1000);
    }
    
    // Cleanup function
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isRunning, timeRemaining]);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (reflectionTimeoutRef.current) {
        clearTimeout(reflectionTimeoutRef.current);
      }
    };
  }, []);
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  const handleComplete = () => {
    setIsRunning(false);
    setShowReflection(true);
  };
  
  const handleReflection = (feeling: "good" | "neutral" | "bad") => {
    // Clear any existing timeout
    if (reflectionTimeoutRef.current) {
      clearTimeout(reflectionTimeoutRef.current);
    }
    
    setShowXPBurst(true);
    reflectionTimeoutRef.current = setTimeout(() => {
      onCompleteMission(currentMission.id, feeling);
      setShowReflection(false);
      setShowXPBurst(false);
      
      if (currentIndex < missions.length - 1) {
        setFocusWindow(currentIndex + 1);
      } else {
        onFinishDay();
      }
      
      reflectionTimeoutRef.current = null;
    }, 1500);
  };
  
  const handleSkip = () => {
    setIsRunning(false);
    onSkipMission(currentMission.id);
    
    if (currentIndex < missions.length - 1) {
      setFocusWindow(currentIndex + 1);
    } else {
      onFinishDay();
    }
  };
  
  if (!currentMission) {
    return (
      <div className="min-h-full bg-gradient-to-br from-neutral-50 to-white flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-4 max-w-xs"
        >
          <div className="text-4xl mb-2">🎉</div>
          <h2 className="text-lg font-semibold text-neutral-900">All done!</h2>
          <p className="text-sm text-neutral-600">Check your dashboard to see your progress.</p>
        </motion.div>
      </div>
    );
  }
  
  return (
    <div className="min-h-full bg-white relative">
      <div className="max-w-md mx-auto px-4 py-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-4"
        >
          <StreakPill streak={streak} />
          <XPLevelChip level={level} xp={xp} />
        </motion.div>
        
        {/* Progress indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-center mb-6"
        >
          <p className="text-xs font-medium text-neutral-600 mb-2">
            Mission {currentIndex + 1} of {missions.length}
          </p>
          <div className="h-1.5 bg-neutral-100 rounded-full overflow-hidden shadow-inner">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${((currentIndex + 1) / missions.length) * 100}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="h-full bg-gradient-to-r from-orange-500 to-orange-600 rounded-full"
            />
          </div>
        </motion.div>
        
        {/* Main mission display */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentMission.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="text-center space-y-4 mb-6"
          >
            <div className="space-y-2">
              <h1 className="text-xl font-semibold text-neutral-900 tracking-tight">{currentMission.title}</h1>
              {currentMission.why && (
                <p className="text-sm text-neutral-600 leading-relaxed">{currentMission.why}</p>
              )}
            </div>
            
            {/* Timer with progress ring */}
            <div className="relative inline-flex items-center justify-center mb-2">
              <svg className="w-36 h-36 -rotate-90 drop-shadow-sm">
                <circle
                  cx="72"
                  cy="72"
                  r="66"
                  className="fill-none stroke-neutral-100"
                  strokeWidth="5"
                />
                <motion.circle
                  cx="72"
                  cy="72"
                  r="66"
                  className="fill-none stroke-orange-500"
                  strokeWidth="6"
                  strokeLinecap="round"
                  initial={{ strokeDasharray: "0 415" }}
                  animate={{ strokeDasharray: `${(progress / 100) * 415} 415` }}
                  transition={{ duration: 0.5 }}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-3xl font-bold text-neutral-900 tabular-nums tracking-tight">
                    {formatTime(timeRemaining)}
                  </div>
                  <div className="text-xs font-medium text-neutral-500 mt-1">
                    {currentMission.duration} min
                  </div>
                </div>
              </div>
            </div>
            
            {/* Timer controls */}
            {!isRunning && timeRemaining > 0 && (
              <button
                onClick={() => setIsRunning(true)}
                className="px-4 py-2 text-sm font-medium rounded-lg bg-orange-500 text-white hover:bg-orange-600 active:bg-orange-700 transition-all duration-200 shadow-md shadow-orange-500/20 hover:shadow-lg hover:shadow-orange-500/30 hover:scale-[1.02] active:scale-[0.98]"
              >
                Start timer
              </button>
            )}
            
            {isRunning && (
              <button
                onClick={() => setIsRunning(false)}
                className="px-4 py-2 text-sm font-medium rounded-lg bg-neutral-100 text-neutral-700 hover:bg-neutral-200 active:bg-neutral-300 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
              >
                Pause
              </button>
            )}
          </motion.div>
        </AnimatePresence>
        
        {/* Action buttons */}
        <div className="space-y-2">
          <button
            onClick={handleComplete}
            className="w-full px-4 py-2.5 text-sm font-semibold rounded-lg bg-orange-500 text-white hover:bg-orange-600 active:bg-orange-700 transition-all duration-200 shadow-md shadow-orange-500/20 hover:shadow-lg hover:shadow-orange-500/30 hover:scale-[1.02] active:scale-[0.98]"
          >
            Complete mission
          </button>
          
          <button
            onClick={handleSkip}
            className="w-full px-4 py-2.5 text-sm font-medium rounded-lg border border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50 hover:border-neutral-300 active:bg-neutral-100 transition-all duration-200 hover:scale-[1.01] active:scale-[0.99]"
          >
            Not today → Move on
          </button>
        </div>
      </div>
      
      {/* Reflection modal */}
      <AnimatePresence>
        {showReflection && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center px-6 z-50"
            onClick={() => {}}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl p-6 max-w-sm w-full text-center space-y-4 shadow-2xl border border-neutral-100"
              onClick={(e) => e.stopPropagation()}
            >
              {showXPBurst && (
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-orange-600 drop-shadow-sm"
                >
                  +10 XP
                </motion.div>
              )}
              
              {!showXPBurst && (
                <>
                  <h2 className="text-lg font-semibold text-neutral-900 tracking-tight">How did that feel?</h2>
                  <div className="flex justify-center gap-4">
                    <button
                      onClick={() => handleReflection("bad")}
                      className="p-3.5 rounded-full hover:bg-neutral-50 active:bg-neutral-100 transition-all duration-200 hover:scale-110 active:scale-95"
                      aria-label="Mission felt bad"
                      title="Mission felt bad"
                    >
                      <Frown className="w-9 h-9 text-neutral-400" />
                    </button>
                    <button
                      onClick={() => handleReflection("neutral")}
                      className="p-3.5 rounded-full hover:bg-neutral-50 active:bg-neutral-100 transition-all duration-200 hover:scale-110 active:scale-95"
                      aria-label="Mission felt neutral"
                      title="Mission felt neutral"
                    >
                      <Meh className="w-9 h-9 text-neutral-400" />
                    </button>
                    <button
                      onClick={() => handleReflection("good")}
                      className="p-3.5 rounded-full hover:bg-orange-50 active:bg-orange-100 transition-all duration-200 hover:scale-110 active:scale-95"
                      aria-label="Mission felt good"
                      title="Mission felt good"
                    >
                      <Smile className="w-9 h-9 text-orange-500" />
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
