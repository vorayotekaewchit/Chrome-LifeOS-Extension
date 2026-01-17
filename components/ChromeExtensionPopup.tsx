import { useState, useEffect } from "react";
import { InputScreen } from "./screens/InputScreen";
import { PlanScreen } from "./screens/PlanScreen";
import { FocusScreen } from "./screens/FocusScreen";
import { DashboardScreen } from "./screens/DashboardScreen";
import { BottomTabBar, type Tab } from "./BottomTabBar";
import { safeGetFromStorage, safeSetToStorage, isAppState, type Mission, type AppState, getWeekStartDate, getDayIndex } from "../utils/storage";
import { useLifeOStore, hydrateLifeOState } from "../hooks/useLifeOState";

const INITIAL_STATE: AppState = {
  missions: [],
  xp: 0,
  streak: 0,
  last7Days: [0, 0, 0, 0, 0, 0, 0],
  currentView: "input",
  lastResetDate: new Date().toDateString(),
  weekStartDate: getWeekStartDate()
};

export function ChromeExtensionPopup() {
  const [isLoading, setIsLoading] = useState(true);
  const [state, setState] = useState<AppState>(INITIAL_STATE);
  const { currentPage: activeTab, setPage } = useLifeOStore();
  
  // Load state on mount
  useEffect(() => {
    const loadState = async () => {
      // Hydrate UI state first
      await hydrateLifeOState();
      const savedState = await safeGetFromStorage<AppState>("lifeOS", isAppState, INITIAL_STATE);
      
      // Check if we need to reset for a new week (Monday) during load
      const currentWeekStart = getWeekStartDate();
      const needsWeeklyReset = !savedState.weekStartDate || savedState.weekStartDate !== currentWeekStart;
      
      setState({
        ...savedState,
        weekStartDate: savedState.weekStartDate || currentWeekStart,
        last7Days: needsWeeklyReset ? [0, 0, 0, 0, 0, 0, 0] : savedState.last7Days
      });
      setIsLoading(false);
    };
    loadState();
  }, []);
  
  // Save to storage whenever state changes
  useEffect(() => {
    if (!isLoading) {
      safeSetToStorage("lifeOS", state);
    }
  }, [state, isLoading]);
  
  // Check if we need to reset for a new week (Monday) - only runs when weekStartDate changes
  useEffect(() => {
    if (isLoading) return; // Don't run during initial load
    
    const currentWeekStart = getWeekStartDate();
    if (state.weekStartDate && state.weekStartDate !== currentWeekStart) {
      setState(prev => ({
        ...prev,
        last7Days: [0, 0, 0, 0, 0, 0, 0], // Reset weekly streak on Monday
        weekStartDate: currentWeekStart
      }));
    }
  }, [state.weekStartDate, isLoading]);

  // Check if we need to reset for a new day
  useEffect(() => {
    const today = new Date().toDateString();
    if (state.lastResetDate !== today) {
      setState(prev => {
        // Only reset if there were missions yesterday
        if (prev.missions.length === 0) return prev;
        
        // Get yesterday's completed count
        const completedCount = prev.missions.filter(m => m.completed).length;
        
        // Update the specific day in last7Days based on yesterday's day index
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayDayIndex = getDayIndex(yesterday);
        
        // Update yesterday's count in the array
        const newLast7Days = [...prev.last7Days];
        newLast7Days[yesterdayDayIndex] = completedCount;
        
        // If at least one mission was completed, maintain or increment streak
        const newStreak = completedCount >= 1 ? prev.streak + 1 : 0;
        
        return {
          ...prev,
          missions: [],
          last7Days: newLast7Days,
          streak: newStreak,
          lastResetDate: today,
          currentView: "input"
        };
      });
    }
  }, [state.lastResetDate]);
  
  /**
   * Handles the generation of a new plan from the input screen.
   * Updates state with the new missions and switches to the plan view.
   */
  const handleGeneratePlan = (missions: Mission[]) => {
    setState(prev => ({
      ...prev,
      missions,
      currentView: "plan"
    }));
    setPage("plan");
  };
  
  /**
   * Initiates the focus session by switching to the focus view.
   * Called when user starts their day from the plan screen.
   */
  const handleStartDay = () => {
    setState(prev => ({ ...prev, currentView: "focus" }));
    setPage("focus");
  };
  
  /**
   * Marks a mission as completed and awards XP.
   * Updates the mission's completed status and timestamp.
   * Also updates the current day's count in last7Days for real-time momentum display.
   */
  const handleCompleteMission = (missionId: string, _feeling?: "good" | "neutral" | "bad") => {
    setState(prev => {
      const updatedMissions = prev.missions.map(m => 
        m.id === missionId 
          ? { ...m, completed: true, completedAt: new Date() }
          : m
      );
      
      // Count completed missions for today
      const todayCompletedCount = updatedMissions.filter(m => m.completed).length;
      
      // Get current day index (0-6 for Monday-Sunday)
      const todayDayIndex = getDayIndex();
      
      // Update last7Days array with today's completed count
      const newLast7Days = [...prev.last7Days];
      newLast7Days[todayDayIndex] = todayCompletedCount;
      
      // Debug: Log the update
      console.log('Mission completed:', {
        todayDayIndex,
        todayCompletedCount,
        newLast7Days,
        dayName: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][todayDayIndex]
      });
      
      return {
        ...prev,
        missions: updatedMissions,
        xp: prev.xp + 10, // Award 10 XP per completed mission
        last7Days: newLast7Days
      };
    });
  };
  
  /**
   * Handles skipping a mission with a small XP reward for conscious decision-making.
   * Awards 2 XP for making a deliberate choice to skip rather than complete.
   */
  const handleSkipMission = (missionId: string) => {
    // Award 2 XP for conscious choice to skip
    setState(prev => ({
      ...prev,
      missions: prev.missions.map(m => 
        m.id === missionId 
          ? { ...m, completed: false }
          : m
      ),
      xp: prev.xp + 2
    }));
  };
  
  /**
   * Completes the current day and transitions to the dashboard.
   * Updates streak if at least one mission was completed.
   */
  const handleFinishDay = () => {
    // Update streak if at least one mission was completed
    const completedCount = state.missions.filter(m => m.completed).length;
    
    setState(prev => ({
      ...prev,
      currentView: "dashboard",
      streak: completedCount >= 1 ? prev.streak + 1 : prev.streak
    }));
    setPage("dashboard");
  };
  
  /**
   * Resets the current day, clearing all missions and returning to input view.
   * Useful for starting fresh or correcting mistakes.
   */
  const handleResetDay = () => {
    setState(prev => ({
      ...prev,
      missions: [],
      currentView: "input"
    }));
    setPage("plan");
  };
  
  const handleTabChange = (tab: Tab) => {
    setPage(tab);
    
    // Map tab to view
    if (tab === "plan") {
      if (state.missions.length === 0) {
        setState(prev => ({ ...prev, currentView: "input" }));
      } else {
        setState(prev => ({ ...prev, currentView: "plan" }));
      }
    } else if (tab === "focus") {
      setState(prev => ({ ...prev, currentView: "focus" }));
    } else if (tab === "dashboard") {
      setState(prev => ({ ...prev, currentView: "dashboard" }));
    }
  };
  
  // Get previous missions (for "import from yesterday" feature)
  const previousMissions = state.missions.filter(m => !m.completed);
  
  if (isLoading) {
    return (
      <div className="extension-container items-center justify-center bg-gradient-to-br from-neutral-50 to-white">
        <div className="flex flex-col items-center gap-3">
          <div className="relative w-12 h-12">
            <div className="absolute inset-0 border-4 border-orange-200 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-orange-500 rounded-full border-t-transparent animate-spin"></div>
          </div>
          <p className="text-sm font-medium text-neutral-600">Loading your day...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="extension-container">
      {/* Scrollable content area */}
      <div className="extension-scrollable">
        {state.currentView === "input" && (
          <InputScreen 
            onGeneratePlan={handleGeneratePlan}
            previousMissions={previousMissions}
          />
        )}
        
        {state.currentView === "plan" && (
          <PlanScreen
            missions={state.missions}
            streak={state.streak}
            onStartDay={handleStartDay}
          />
        )}
        
        {state.currentView === "focus" && (
          <FocusScreen
            missions={state.missions}
            streak={state.streak}
            xp={state.xp}
            onCompleteMission={handleCompleteMission}
            onSkipMission={handleSkipMission}
            onFinishDay={handleFinishDay}
          />
        )}
        
        {state.currentView === "dashboard" && (
          <DashboardScreen
            missions={state.missions}
            xp={state.xp}
            streak={state.streak}
            last7Days={state.last7Days}
            onResetDay={handleResetDay}
          />
        )}
      </div>
      
      {/* Bottom navigation - fixed at bottom */}
      <BottomTabBar 
        activeTab={activeTab}
        onTabChange={handleTabChange}
      />
    </div>
  );
}
