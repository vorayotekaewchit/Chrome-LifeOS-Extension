import { useState } from 'react';
import { Circle, ChevronDown } from 'lucide-react';
import { PlanInputs } from '../App';

type InputScreenProps = {
  planInputs: PlanInputs;
  setPlanInputs: (inputs: PlanInputs) => void;
  onGeneratePlan: () => void;
};

export function InputScreen({ planInputs, setPlanInputs, onGeneratePlan }: InputScreenProps) {
  const [showMoreOptions, setShowMoreOptions] = useState(false);
  const handleTimeframeChange = (timeframe: 'Today' | 'This Week' | 'This Month') => {
    setPlanInputs({ ...planInputs, timeframe });
  };

  const handleGoalChange = (index: number, value: string) => {
    const newGoals = [...planInputs.goals];
    newGoals[index] = value;
    setPlanInputs({ ...planInputs, goals: newGoals });
  };

  const handleTaskChange = (index: number, value: string) => {
    const newTasks = [...planInputs.tasks];
    newTasks[index] = value;
    setPlanInputs({ ...planInputs, tasks: newTasks });
  };

  const handleOpportunityChange = (index: number, value: string) => {
    const newOpportunities = [...planInputs.opportunities];
    newOpportunities[index] = value;
    setPlanInputs({ ...planInputs, opportunities: newOpportunities });
  };

  const goalSuggestions = [
    { label: 'Focus task', value: 'Complete deep work session' },
    { label: 'Health', value: 'Exercise for 30 minutes' },
    { label: 'Work', value: 'Finish priority project' },
    { label: 'Finance', value: 'Review monthly budget' }
  ];

  const taskSuggestions = [
    { label: 'Quick win', value: 'Clear inbox to zero' },
    { label: 'Cleanup task', value: 'Organize workspace' },
    { label: 'Work', value: 'Send pending emails' },
    { label: 'Health', value: 'Prep healthy meals' }
  ];

  const opportunitySuggestions = [
    { label: 'Quick win', value: 'Call a friend' },
    { label: 'Health', value: 'Take a walk outside' },
    { label: 'Work', value: 'Network with colleague' },
    { label: 'Finance', value: 'Review subscriptions' }
  ];

  const handleSuggestionClick = (type: 'goal' | 'task' | 'opportunity', index: number, value: string) => {
    if (type === 'goal') {
      handleGoalChange(index, value);
    } else if (type === 'task') {
      handleTaskChange(index, value);
    } else {
      handleOpportunityChange(index, value);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <div className="px-6 pt-8 pb-6">
        <div className="flex items-center gap-3 mb-2">
          <Circle className="w-6 h-6 text-neutral-900" strokeWidth={1.5} />
          <h1 className="text-neutral-900">Plan Your Day</h1>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-6 pb-6 space-y-8">
        {/* Timeframe Section */}
        <div>
          <label className="block text-neutral-500 mb-3">Timeframe</label>
          <div className="flex gap-2">
            {(['Today', 'This Week', 'This Month'] as const).map((option) => (
              <button
                key={option}
                onClick={() => handleTimeframeChange(option)}
                className={`flex-1 px-4 py-2.5 rounded-xl border transition-all ${
                  planInputs.timeframe === option
                    ? 'bg-neutral-900 text-white border-neutral-900'
                    : 'bg-white text-neutral-600 border-neutral-200 hover:border-neutral-300'
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        {/* Top Goals Section */}
        <div>
          <label className="block text-neutral-900 mb-3">Top Goals</label>
          <div className="space-y-4">
            {[0, 1].map((index) => (
              <div key={index}>
                <input
                  type="text"
                  value={planInputs.goals[index]}
                  onChange={(e) => handleGoalChange(index, e.target.value)}
                  placeholder={`Goal ${index + 1}`}
                  className="w-full px-4 py-3 rounded-xl border border-neutral-200 bg-white text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-neutral-400 transition-colors"
                />
                <div className="flex flex-wrap gap-2 mt-2">
                  {goalSuggestions.map((suggestion) => (
                    <button
                      key={suggestion.label}
                      onClick={() => handleSuggestionClick('goal', index, suggestion.value)}
                      className="px-3 py-1 bg-neutral-100 text-neutral-600 rounded-full hover:bg-neutral-200 hover:text-neutral-900 transition-colors"
                    >
                      {suggestion.label}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Essential Tasks Section */}
        <div>
          <label className="block text-neutral-900 mb-3">Essential Tasks</label>
          <div className="space-y-4">
            {[0, 1].map((index) => (
              <div key={index}>
                <input
                  type="text"
                  value={planInputs.tasks[index]}
                  onChange={(e) => handleTaskChange(index, e.target.value)}
                  placeholder={`Task ${index + 1}`}
                  className="w-full px-4 py-3 rounded-xl border border-neutral-200 bg-white text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-neutral-400 transition-colors"
                />
                <div className="flex flex-wrap gap-2 mt-2">
                  {taskSuggestions.map((suggestion) => (
                    <button
                      key={suggestion.label}
                      onClick={() => handleSuggestionClick('task', index, suggestion.value)}
                      className="px-3 py-1 bg-neutral-100 text-neutral-600 rounded-full hover:bg-neutral-200 hover:text-neutral-900 transition-colors"
                    >
                      {suggestion.label}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* More Options Dropdown */}
        <div>
          <button
            onClick={() => setShowMoreOptions(!showMoreOptions)}
            className="flex items-center gap-2 text-neutral-600 hover:text-neutral-900 transition-colors"
          >
            <span>More options</span>
            <ChevronDown 
              className={`w-4 h-4 transition-transform ${showMoreOptions ? 'rotate-180' : ''}`} 
              strokeWidth={2}
            />
          </button>
          
          {showMoreOptions && (
            <div className="mt-4">
              <label className="block text-neutral-900 mb-3">Opportunities</label>
              <div className="space-y-4">
                {[0, 1, 2].map((index) => (
                  <div key={index}>
                    <input
                      type="text"
                      value={planInputs.opportunities[index]}
                      onChange={(e) => handleOpportunityChange(index, e.target.value)}
                      placeholder={`Opportunity ${index + 1}`}
                      className="w-full px-4 py-3 rounded-xl border border-neutral-200 bg-white text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-neutral-400 transition-colors"
                    />
                    <div className="flex flex-wrap gap-2 mt-2">
                      {opportunitySuggestions.map((suggestion) => (
                        <button
                          key={suggestion.label}
                          onClick={() => handleSuggestionClick('opportunity', index, suggestion.value)}
                          className="px-3 py-1 bg-neutral-100 text-neutral-600 rounded-full hover:bg-neutral-200 hover:text-neutral-900 transition-colors"
                        >
                          {suggestion.label}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="px-6 pb-8">
        <button
          onClick={onGeneratePlan}
          className="w-full py-4 bg-neutral-900 text-white rounded-2xl hover:bg-neutral-800 transition-colors"
        >
          Generate Plan
        </button>
      </div>
    </div>
  );
}
