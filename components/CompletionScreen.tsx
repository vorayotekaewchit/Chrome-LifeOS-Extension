import { useState, useEffect } from 'react';
import { Check, ArrowRight } from 'lucide-react';
import { Mission } from '../App';

type CompletionScreenProps = {
  mission: Mission;
  onComplete: () => void;
  onSkip: () => void;
};

export function CompletionScreen({ mission, onComplete, onSkip }: CompletionScreenProps) {
  const [showXP, setShowXP] = useState(false);

  const handleComplete = () => {
    setShowXP(true);
    setTimeout(() => {
      setShowXP(false);
      onComplete();
    }, 800);
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <div className="px-6 pt-8 pb-6">
        <h1 className="text-neutral-900">Current Mission</h1>
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center px-6">
        <div className="w-full">
          {/* Central Mission Card */}
          <div className="bg-white border border-neutral-200 rounded-2xl p-8 shadow-sm mb-8 relative">
            <h2 className="text-neutral-900 mb-4">{mission.title}</h2>
            <p className="text-neutral-700 mb-3">{mission.action}</p>
            <p className="text-neutral-500">{mission.why}</p>

            {/* XP Feedback */}
            {showXP && (
              <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-4 py-2 rounded-full shadow-lg animate-bounce">
                +8 XP
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={handleComplete}
              className="w-full py-4 bg-neutral-900 text-white rounded-2xl hover:bg-neutral-800 transition-colors flex items-center justify-center gap-2"
            >
              <Check className="w-5 h-5" strokeWidth={2} />
              <span>Done</span>
            </button>
            <button
              onClick={onSkip}
              className="w-full py-4 bg-white text-neutral-600 border border-neutral-200 rounded-2xl hover:bg-neutral-50 transition-colors flex items-center justify-center gap-2"
            >
              <span>Skip</span>
              <ArrowRight className="w-5 h-5" strokeWidth={2} />
            </button>
          </div>
        </div>
      </div>

      {/* Bottom spacing for visual balance */}
      <div className="h-20"></div>
    </div>
  );
}
