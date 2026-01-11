import { CheckCircle2, Circle, LayoutGrid, ListTodo, Target } from 'lucide-react';
import { Mission } from '../App';

type DashboardScreenProps = {
  missions: Mission[];
  xp: number;
  level: number;
  streak: number;
  weeklyProgress: boolean[];
  onNavigate: (screen: 'input' | 'plan' | 'completion' | 'dashboard') => void;
};

export function DashboardScreen({
  missions,
  xp,
  level,
  streak,
  weeklyProgress,
  onNavigate
}: DashboardScreenProps) {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <div className="px-6 pt-8 pb-6">
        <h1 className="text-neutral-900">Dashboard</h1>
      </div>

      {/* Content */}
      <div className="flex-1 px-6 pb-24 space-y-6">
        {/* Progress Section */}
        <div className="bg-white border border-neutral-200 rounded-2xl p-5 shadow-sm">
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-neutral-600">Level {level} — Focus Seeker</span>
            </div>
            <div className="w-full h-2 bg-neutral-100 rounded-full overflow-hidden mb-2">
              <div
                className="h-full bg-neutral-900 rounded-full transition-all"
                style={{ width: `${xp}%` }}
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-neutral-500">{xp} XP</span>
              <span className="text-neutral-500">{streak}-day streak</span>
            </div>
          </div>
        </div>

        {/* Today's Missions */}
        <div>
          <h2 className="text-neutral-900 mb-3">Today's Missions</h2>
          <div className="space-y-2">
            {missions.map((mission) => (
              <div
                key={mission.id}
                className="bg-white border border-neutral-200 rounded-xl p-4 shadow-sm flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  {mission.completed ? (
                    <CheckCircle2 className="w-5 h-5 text-green-500" strokeWidth={2} />
                  ) : (
                    <Circle className="w-5 h-5 text-neutral-300" strokeWidth={2} />
                  )}
                  <span className={mission.completed ? 'text-neutral-400 line-through' : 'text-neutral-700'}>
                    {mission.action}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Weekly Momentum Graph */}
        <div>
          <h2 className="text-neutral-900 mb-3">Weekly Momentum</h2>
          <div className="bg-white border border-neutral-200 rounded-2xl p-5 shadow-sm">
            <div className="flex items-end justify-between gap-2">
              {weeklyProgress.map((completed, index) => (
                <div key={index} className="flex-1 flex flex-col items-center gap-2">
                  <div
                    className={`w-full aspect-square rounded-full border-2 transition-all ${
                      completed
                        ? 'bg-neutral-900 border-neutral-900'
                        : 'bg-white border-neutral-200'
                    }`}
                  />
                  <span className="text-neutral-400">
                    {['M', 'T', 'W', 'T', 'F', 'S', 'S'][index]}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Navigation Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-neutral-200">
        <div className="max-w-[375px] mx-auto flex items-center justify-around py-4 px-6">
          <button
            onClick={() => onNavigate('input')}
            className="flex flex-col items-center gap-1 text-neutral-400 hover:text-neutral-900 transition-colors"
          >
            <Target className="w-6 h-6" strokeWidth={1.5} />
            <span>Plan</span>
          </button>
          <button
            onClick={() => onNavigate('completion')}
            className="flex flex-col items-center gap-1 text-neutral-400 hover:text-neutral-900 transition-colors"
          >
            <ListTodo className="w-6 h-6" strokeWidth={1.5} />
            <span>Missions</span>
          </button>
          <button
            onClick={() => onNavigate('dashboard')}
            className="flex flex-col items-center gap-1 text-neutral-900"
          >
            <LayoutGrid className="w-6 h-6" strokeWidth={1.5} />
            <span>Dashboard</span>
          </button>
        </div>
      </div>
    </div>
  );
}
