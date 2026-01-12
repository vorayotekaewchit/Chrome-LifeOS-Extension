import { Target, Zap, ChartBar } from "lucide-react";

export type Tab = "plan" | "focus" | "dashboard";

interface BottomTabBarProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
}

export function BottomTabBar({ activeTab, onTabChange }: BottomTabBarProps) {
  const tabs = [
    { id: "plan" as Tab, label: "Plan", icon: Target },
    { id: "focus" as Tab, label: "Focus", icon: Zap },
    { id: "dashboard" as Tab, label: "Dashboard", icon: ChartBar }
  ];
  
  return (
    <div className="absolute bottom-0 left-0 right-0 h-14 bg-white/95 backdrop-blur-md border-t border-neutral-100 z-50 shadow-lg">
      <div className="flex items-center justify-around h-full px-1">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => onTabChange(id)}
            className={`flex flex-col items-center justify-center gap-0.5 py-1.5 px-3 transition-all duration-300 ${
              activeTab === id 
                ? 'text-blue-600 scale-105' 
                : 'text-neutral-400 hover:text-neutral-600'
            }`}
          >
            <Icon className="w-4 h-4" />
            <span className="text-[9px] font-medium">{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
