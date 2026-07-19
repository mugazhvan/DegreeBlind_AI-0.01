import { useLocation, Link } from 'react-router-dom';
import RepositoryCard from '../components/RepositoryCard';
import LanguageCard from '../components/LanguageCard';
import AnalysisCard from '../components/AnalysisCard';
import StatusCard from '../components/StatusCard';
import ReportSection from '../components/ReportSection';
import type { RepositoryData, LanguageDistribution, AIAnalysisReport } from '../types';

interface LocationState {
  repoUrl: string;
  repoData: RepositoryData | null;
  langData: LanguageDistribution | null;
  analysisData: AIAnalysisReport | null;
  roles: any[] | null;
  recommendations: string[] | null;
}

const ReportPage = () => {
  const location = useLocation();
  const state = location.state as LocationState | null;

  if (!state?.repoUrl) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <div className="bg-white rounded-2xl p-10 shadow-sm border border-[#e5e5ea] max-w-md mx-auto">
          <span className="text-4xl block mb-4">📋</span>
          <h1 className="text-xl font-semibold text-[#1d1d1f] mb-2">No Report Available</h1>
          <p className="text-[#86868b] text-sm mb-6">
            Please analyse a repository first to generate a report.
          </p>
          <Link
            to="/"
            className="inline-block rounded-xl bg-[#007AFF] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#0066DD]"
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const { repoUrl, repoData, langData, analysisData, roles, recommendations } = state;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-gray-900 via-gray-700 to-gray-900 tracking-tight drop-shadow-sm">Analysis Report</h1>
        <p className="mt-3 text-sm text-gray-700 font-medium">
          Target:{' '}
          <a
            href={repoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 transition-colors"
          >
            {repoUrl}
          </a>
        </p>
      </div>

      <ReportSection title="Repository Overview">
        <RepositoryCard data={repoData} />
        <LanguageCard data={langData} repoFullName={repoData ? `${repoData.owner}/${repoData.name}` : null} />
      </ReportSection>

      <ReportSection title="Technical Analysis">
        <AnalysisCard data={analysisData} />
      </ReportSection>

      <ReportSection title="Suggested Improvements & Potential Roles">
        <div className="glass-panel rounded-2xl p-8 mb-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Recommendations</h3>
          {recommendations && recommendations.length > 0 ? (
            <ul className="list-disc pl-5 space-y-3">
              {recommendations.map((rec, i) => (
                <li key={i} className="text-base text-gray-800 leading-relaxed">{rec}</li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 italic text-sm">No recommendations available.</p>
          )}
        </div>

        <div className="glass-panel rounded-2xl p-8">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Potential Roles</h3>
          {roles && roles.length > 0 ? (
            <div className="flex flex-wrap gap-3">
              {roles.map((role, i) => (
                <span key={i} className="inline-block bg-white/40 text-gray-900 text-sm px-5 py-2.5 rounded-full border border-white/50 font-semibold shadow-sm hover:bg-white/60 hover:-translate-y-0.5 transition-all duration-300">
                  {role.roleName || role}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 italic text-sm">No roles recommended.</p>
          )}
        </div>
      </ReportSection>

      {/* Back link */}
      <div className="mt-8 text-center">
        <Link
          to="/"
          className="text-sm text-[#007AFF] hover:text-[#0066DD]"
        >
          ← Analyse another repository
        </Link>
      </div>
    </div>
  );
};

export default ReportPage;
