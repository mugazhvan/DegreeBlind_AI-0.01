import type { RepositoryData } from '../types';
import { Star, GitFork, AlertCircle, GitBranch, Calendar, Clock, ExternalLink, Tag, HardDrive, Users } from 'lucide-react';

interface Props {
  data: RepositoryData | null;
}

const RepositoryCard = ({ data }: Props) => {
  if (!data) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#e5e5ea]">
        <h3 className="text-base font-semibold text-[#1d1d1f] mb-4">Repository Information</h3>
        <p className="text-[#86868b] italic text-sm">Not available</p>
      </div>
    );
  }

  const display = (val: string | number | null | undefined) => {
    if (val === null || val === undefined || val === '') return <span className="text-[#86868b] italic">Not available</span>;
    return <span className="text-[#1d1d1f]">{val}</span>;
  };

  const fields = [
    { icon: <span className="text-sm">📁</span>, label: 'Repository', value: data.name },
    { icon: <Users className="w-4 h-4 text-[#86868b]" />, label: 'Owner', value: data.owner },
    { icon: <Star className="w-4 h-4 text-[#FF9500]" />, label: 'Stars', value: data.stars },
    { icon: <GitFork className="w-4 h-4 text-[#5856D6]" />, label: 'Forks', value: data.forks },
    { icon: <AlertCircle className="w-4 h-4 text-[#FF3B30]" />, label: 'Open Issues', value: data.openIssues },
    { icon: <GitBranch className="w-4 h-4 text-[#34C759]" />, label: 'Default Branch', value: data.defaultBranch },
    { icon: <Tag className="w-4 h-4 text-[#007AFF]" />, label: 'Primary Language', value: data.primaryLanguage },
    { icon: <Tag className="w-4 h-4 text-[#AF52DE]" />, label: 'License', value: data.license },
    { icon: <Calendar className="w-4 h-4 text-[#FF9500]" />, label: 'Created', value: data.createdDate },
    { icon: <Clock className="w-4 h-4 text-[#5AC8FA]" />, label: 'Last Updated', value: data.lastUpdated },
    { icon: <HardDrive className="w-4 h-4 text-[#86868b]" />, label: 'Size', value: data.sizeKb ? `${data.sizeKb} KB` : null },
    { icon: <Users className="w-4 h-4 text-[#007AFF]" />, label: 'Contributors', value: data.contributorsCount },
  ];

  return (
    <div className="glass-panel rounded-2xl p-8 mb-6">
      <h3 className="text-xl font-bold text-gray-900 mb-1 drop-shadow-sm">{data.name}</h3>
      <p className="text-sm text-gray-600 font-medium mb-6">{data.description || 'No description'}</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {fields.map((f) => (
          <div key={f.label} className="flex items-center gap-3 text-sm py-2">
            <span className="text-gray-500">{f.icon}</span>
            <span className="text-gray-600 font-medium">{f.label}:</span>
            <span className="font-semibold text-gray-800">{display(f.value)}</span>
          </div>
        ))}
      </div>

      {data.url && (
        <div className="mt-6 pt-5 border-t border-white/40">
          <a
            href={data.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-800 transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            View on GitHub
          </a>
        </div>
      )}

      {data.topics && data.topics.length > 0 && (
        <div className="mt-5 flex flex-wrap gap-2">
          {data.topics.map((topic) => (
            <span
              key={topic}
              className="inline-block bg-white/40 border border-white/50 text-gray-800 text-xs font-semibold px-3 py-1.5 rounded-full shadow-sm hover:-translate-y-0.5 transition-all duration-300"
            >
              {topic}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

export default RepositoryCard;
