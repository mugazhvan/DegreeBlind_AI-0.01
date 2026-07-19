import { useState, useEffect } from 'react';
import type { LanguageDistribution } from '../types';

interface Props {
  data: LanguageDistribution | null;
  repoFullName?: string | null;
}

const LanguageCard = ({ data, repoFullName }: Props) => {
  const [langData, setLangData] = useState<LanguageDistribution | null>(data);
  const [loading, setLoading] = useState(!data && !!repoFullName);

  useEffect(() => {
    if (data) {
      setLangData(data);
      setLoading(false);
      return;
    }

    if (!data && repoFullName) {
      setLoading(true);
      fetch(`https://api.github.com/repos/${repoFullName}/languages`)
        .then(res => res.ok ? res.json() : null)
        .then(json => {
          setLangData(json);
          setLoading(false);
        })
        .catch(() => {
          setLangData(null);
          setLoading(false);
        });
    }
  }, [data, repoFullName]);

  if (loading) {
    return (
      <div className="glass-panel rounded-2xl p-8 mb-6 animate-pulse">
        <h3 className="text-xl font-bold text-gray-900 mb-6 drop-shadow-sm">Languages</h3>
        <div className="h-4 bg-white/40 rounded w-3/4 mb-4"></div>
        <div className="h-4 bg-white/40 rounded w-1/2"></div>
      </div>
    );
  }

  if (!langData || Object.keys(langData).length === 0) {
    return (
      <div className="glass-panel rounded-2xl p-8 mb-6">
        <h3 className="text-xl font-bold text-gray-900 mb-6 drop-shadow-sm">Languages</h3>
        <p className="text-gray-500 italic text-sm font-medium">Language information unavailable.</p>
      </div>
    );
  }

  const total = Object.values(langData).reduce((sum, val) => sum + val, 0);
  const sorted = Object.entries(langData).sort((a, b) => b[1] - a[1]);

  // Apple system colors
  const colors = [
    'bg-[#007AFF]', 'bg-[#34C759]', 'bg-[#FF9500]', 'bg-[#AF52DE]',
    'bg-[#FF3B30]', 'bg-[#5856D6]', 'bg-[#FF2D55]', 'bg-[#5AC8FA]',
  ];

  return (
    <div className="glass-panel rounded-2xl p-8 mb-6">
      <h3 className="text-xl font-bold text-gray-900 mb-6 drop-shadow-sm">Languages</h3>
      <div className="space-y-4">
        {sorted.map(([lang, value], index) => {
          const pct = total > 0 ? Math.round((value / total) * 100) : 0;
          return (
            <div key={lang}>
              <div className="flex justify-between text-sm mb-2">
                <span className="font-semibold text-gray-800">{lang}</span>
                <span className="text-gray-600 font-medium">{pct}%</span>
              </div>
              <div className="w-full bg-black/5 rounded-full h-3 shadow-inner">
                <div
                  className={`${colors[index % colors.length]} h-3 rounded-full shadow-sm`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default LanguageCard;
