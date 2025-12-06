import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingViewProps {
  mode: 'analyzing' | 'strategy';
}

export const LoadingView: React.FC<LoadingViewProps> = ({ mode }) => {
  const [step, setStep] = useState(0);
  
  const analyzingSteps = [
    "Connecting to domain...",
    "Understanding business context...",
    "Crawling site structure...",
    "Analyzing competitor keywords...",
    "Identifying content gaps...",
    "Calculating ranking difficulty...",
    "Finalizing SEO audit..."
  ];

  const strategySteps = [
    "Reviewing audit data...",
    "Brainstorming content hooks...",
    "Drafting high-conversion ad copy...",
    "Composing social media narratives...",
    "Structuring content calendar...",
    "Polishing strategy..."
  ];

  const steps = mode === 'analyzing' ? analyzingSteps : strategySteps;

  useEffect(() => {
    // Progress through steps, but don't loop endlessly on the last one
    const interval = setInterval(() => {
      setStep((prev) => (prev < steps.length - 1 ? prev + 1 : prev));
    }, 2000); // Change step every 2 seconds
    return () => clearInterval(interval);
  }, [steps.length]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] animate-fade-in p-8">
      <div className="relative mb-8">
        <div className="absolute inset-0 bg-blue-100 rounded-full animate-ping opacity-75"></div>
        <div className="relative bg-white p-4 rounded-full shadow-lg border border-slate-100">
           <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        </div>
      </div>
      
      <h2 className="text-2xl font-bold text-slate-800 mb-4 text-center">
        {mode === 'analyzing' ? 'Analyzing Domain & Market' : 'Generating Growth Strategy'}
      </h2>
      
      {/* Animated Text Step */}
      <div className="h-8 mb-8 flex flex-col items-center justify-center overflow-hidden w-full max-w-md">
         <p key={step} className="text-slate-500 font-medium text-lg animate-in fade-in slide-in-from-bottom-2 duration-500 text-center">
           {steps[step]}
         </p>
      </div>

      {/* Progress Bars */}
      <div className="flex gap-2 w-full max-w-xs justify-center">
        {steps.map((_, i) => (
          <div 
            key={i} 
            className={`h-1.5 rounded-full transition-all duration-500 ${i <= step ? 'w-full bg-blue-600' : 'w-full bg-slate-200'}`}
          />
        ))}
      </div>
    </div>
  );
};
