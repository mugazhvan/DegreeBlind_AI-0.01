import type { AIAnalysisReport } from '../types';

interface Props {
  data: AIAnalysisReport | null;
}

const AnalysisCard = ({ data }: Props) => {
  const parameters = [
    { key: 'problemSolving', label: 'Problem Solving', icon: '🧩' },
    { key: 'architecture', label: 'Architecture', icon: '🏗️' },
    { key: 'codeQuality', label: 'Code Quality', icon: '✨' },
    { key: 'documentation', label: 'Documentation', icon: '📄' },
    { key: 'security', label: 'Security', icon: '🔒' },
    { key: 'testing', label: 'Testing', icon: '🧪' },
    { key: 'maintainability', label: 'Maintainability', icon: '🔧' },
    { key: 'scalability', label: 'Scalability', icon: '📈' },
  ];

  return (
    <div className="glass-panel rounded-2xl p-8 mb-6">
      <h3 className="text-xl font-bold text-gray-900 mb-4 drop-shadow-sm">AI Analysis</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {parameters.map((param, i) => {
          const value = data ? data[param.key as keyof AIAnalysisReport] : null;
          return (
            <div
              key={param.key}
              className="bg-white/30 backdrop-blur-md border border-white/40 p-5 rounded-2xl shadow-sm hover:shadow-md hover:bg-white/40 transition-all duration-300 flex flex-col"
            >
              <div className="flex items-center gap-3 mb-3 pb-3 border-b border-white/30">
                <span className="text-xl bg-white/50 w-10 h-10 flex items-center justify-center rounded-xl shadow-sm border border-white/60">{param.icon}</span>
                <span className="text-sm font-bold text-gray-900 uppercase tracking-wider">{param.label}</span>
              </div>
              <p className={`text-sm leading-relaxed flex-grow ${value ? 'text-gray-800 font-medium' : 'text-gray-500 italic'}`}>
                {value ?? 'Pending Analysis'}
              </p>
            </div>
          );
        })}
      </div>

      <div className="mt-6 pt-5 border-t border-white/40">
        <h4 className="text-base font-bold text-gray-900 mb-3 drop-shadow-sm">Overall Summary</h4>
        <div className="bg-black/5 p-5 rounded-2xl shadow-inner border border-white/30">
          <p className={`text-base leading-relaxed ${data?.overallSummary ? 'text-gray-800 font-medium' : 'text-gray-500 italic'}`}>
            {data?.overallSummary ?? 'Waiting for backend AI...'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default AnalysisCard;
