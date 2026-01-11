import { useState } from 'react';
import { InputScreen } from './components/InputScreen';
import { AIPlanScreen } from './components/AIPlanScreen';
import { CompletionScreen } from './components/CompletionScreen';
import { DashboardScreen } from './components/DashboardScreen';
import { ChromeExtensionPopup } from './components/ChromeExtensionPopup';

export type Mission = {
  id: number;
  title: string;
  action: string;
  why: string;
  time: string;
  type: 'primary' | 'secondary' | 'momentum';
  completed: boolean;
};

export type PlanInputs = {
  timeframe: 'Today' | 'This Week' | 'This Month';
  goals: string[];
  tasks: string[];
  opportunities: string[];
};

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<'input' | 'plan' | 'completion' | 'dashboard'>('input');
  
  // Show Chrome Extension Popup instead of mobile screens
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-8">
      <div className="shadow-2xl rounded-xl overflow-hidden">
        <ChromeExtensionPopup />
      </div>
    </div>
  );

  /* Original mobile app code - commented out for now
  const [planInputs, setPlanInputs] = useState<PlanInputs>({
    timeframe: 'Today',
    goals: ['', ''],
    tasks: ['', ''],
    opportunities: ['', '', '']
  });
  const [missions, setMissions] = useState<Mission[]>([]);
  const [currentMissionIndex, setCurrentMissionIndex] = useState(0);
  const [xp, setXp] = useState(42);
  const [level] = useState(3);
  const [streak, setStreak] = useState(4);
  const [weeklyProgress] = useState([true, true, false, true, false, false, false]);

  const generateMissions = (inputs: PlanInputs) => {
    const generatedMissions: Mission[] = [
      {
        id: 1,
        title: 'Mission 1 — Primary',
        action: inputs.goals[0] || 'Complete your most important goal',
        why: 'This drives your biggest impact today',
        time: '45 min',
        type: 'primary',
        completed: false
      },
      {
        id: 2,
        title: 'Mission 2 — Secondary',
        action: inputs.tasks[0] || 'Finish essential task',
        why: 'Keeps momentum going',
        time: '30 min',
        type: 'secondary',
        completed: false
      },
      {
        id: 3,
        title: 'Mission 3 — Momentum',
        action: inputs.opportunities[0] || 'Quick win to build energy',
        why: 'Keeps streak alive',
        time: '15 min',
        type: 'momentum',
        completed: false
      }
    ];
    setMissions(generatedMissions);
  };

  const handleGeneratePlan = () => {
    generateMissions(planInputs);
    setCurrentScreen('plan');
  };

  const handleStartDay = () => {
    setCurrentMissionIndex(0);
    setCurrentScreen('completion');
  };

  const handleCompleteMission = () => {
    const updatedMissions = [...missions];
    updatedMissions[currentMissionIndex].completed = true;
    setMissions(updatedMissions);
    setXp(xp + 8);
    
    if (currentMissionIndex < missions.length - 1) {
      setCurrentMissionIndex(currentMissionIndex + 1);
    } else {
      setCurrentScreen('dashboard');
    }
  };

  const handleSkipMission = () => {
    if (currentMissionIndex < missions.length - 1) {
      setCurrentMissionIndex(currentMissionIndex + 1);
    } else {
      setCurrentScreen('dashboard');
    }
  };

  const handleNavigation = (screen: 'input' | 'plan' | 'completion' | 'dashboard') => {
    if (screen === 'input') {
      setCurrentScreen('input');
    } else if (screen === 'completion' && missions.length > 0) {
      setCurrentMissionIndex(missions.findIndex(m => !m.completed));
      setCurrentScreen('completion');
    } else if (screen === 'dashboard') {
      setCurrentScreen('dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="w-full max-w-[375px] min-h-screen bg-white">
        {currentScreen === 'input' && (
          <InputScreen
            planInputs={planInputs}
            setPlanInputs={setPlanInputs}
            onGeneratePlan={handleGeneratePlan}
          />
        )}
        {currentScreen === 'plan' && (
          <AIPlanScreen
            missions={missions}
            xp={xp}
            streak={streak}
            onStartDay={handleStartDay}
          />
        )}
        {currentScreen === 'completion' && missions[currentMissionIndex] && (
          <CompletionScreen
            mission={missions[currentMissionIndex]}
            onComplete={handleCompleteMission}
            onSkip={handleSkipMission}
          />
        )}
        {currentScreen === 'dashboard' && (
          <DashboardScreen
            missions={missions}
            xp={xp}
            level={level}
            streak={streak}
            weeklyProgress={weeklyProgress}
            onNavigate={handleNavigation}
          />
        )}
      </div>
    </div>
  );
  */
}