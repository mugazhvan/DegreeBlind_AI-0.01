import { useEffect, useState, useCallback } from 'react';
import { CheckCircle, Circle, Loader } from 'lucide-react';

interface Props {
  onComplete: () => void;
}

const LoadingTimeline = ({ onComplete }: Props) => {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    'Connecting to GitHub...',
    'Fetching repository...',
    'Reading project structure...',
    'Preparing analysis...',
    'Waiting for AI backend...',
  ];

  useEffect(() => {
    // Only advance automatically for the first few steps
    // The last step ("Waiting for AI backend...") will spin indefinitely
    // until the parent component unmounts this component.
    if (currentStep < steps.length - 1) {
      const timer = setTimeout(() => {
        setCurrentStep((prev) => prev + 1);
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [currentStep, steps.length]);

  return (
    <div className="glass-panel rounded-3xl p-10 max-w-sm mx-auto mt-10 shadow-2xl backdrop-blur-2xl border-white/50 relative overflow-hidden">
      {/* Decorative blurry blob behind the text */}
      <div className="absolute top-[-50px] right-[-50px] w-32 h-32 bg-blue-400/20 rounded-full blur-3xl pointer-events-none"></div>
      
      <h3 className="text-lg font-bold text-[#1d1d1f]/90 mb-8 text-center drop-shadow-sm">
        Analysing Repository
      </h3>
      <div className="space-y-4">
        {steps.map((step, index) => {
          const isPast = index < currentStep;
          const isActive = index === currentStep;

          return (
            <div key={index} className="flex items-center gap-3">
              <div className="flex-shrink-0">
                {isPast ? (
                  <CheckCircle className="w-5 h-5 text-[#34C759]" />
                ) : isActive ? (
                  <Loader className="w-5 h-5 text-[#007AFF] animate-spin" />
                ) : (
                  <Circle className="w-5 h-5 text-[#d1d1d6]" />
                )}
              </div>
              <p className={`text-sm ${
                isPast ? 'text-[#86868b]' : isActive ? 'text-[#1d1d1f] font-medium' : 'text-[#d1d1d6]'
              }`}>
                {step}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default LoadingTimeline;
