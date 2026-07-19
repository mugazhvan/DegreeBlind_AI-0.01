import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import LoadingTimeline from '../components/LoadingTimeline';
import { analyzeRepository } from '../services/api';
import type { RepositoryData, LanguageDistribution, AIAnalysisReport } from '../types';

// Analysis page — shows loading timeline, then redirects to report
const AnalysisPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [repoData, setRepoData] = useState<RepositoryData | null>(null);
  const [langData, setLangData] = useState<LanguageDistribution | null>(null);
  const [analysisData, setAnalysisData] = useState<AIAnalysisReport | null>(null);
  const [roles, setRoles] = useState<any[]>([]);
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const repoUrl = (location.state as { repoUrl?: string })?.repoUrl || '';

  // Redirect to home if no URL was provided
  useEffect(() => {
    if (!repoUrl) {
      navigate('/');
    }
  }, [repoUrl, navigate]);

  // Fetch data from the backend
  useEffect(() => {
    if (!repoUrl) return;

    const fetchData = async () => {
      const report = await analyzeRepository(repoUrl);
      if (report) {
        setRepoData(report.repository);
        setLangData(report.languages);
        setAnalysisData(report.analysis);
        setRoles(report.roles || []);
        setRecommendations(report.recommendations || []);
      } else {
        setError('Failed to analyze repository. Please try again.');
      }
      setLoading(false); // End loading once the API call finishes
    };

    fetchData();
  }, [repoUrl]);

  // Called when the loading animation finishes visually (if we wanted artificial delays)
  // But now we just use the real API call duration.

  // Navigate to report page once loading is done
  useEffect(() => {
    if (!loading && repoUrl && !error) {
      navigate('/report', {
        state: { repoUrl, repoData, langData, analysisData, roles, recommendations },
        replace: true,
      });
    }
  }, [loading, repoUrl, repoData, langData, analysisData, roles, recommendations, error, navigate]);

  if (!repoUrl) return null;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {error ? (
        <div className="text-center p-8 glass-panel rounded-2xl max-w-md mx-auto transform hover:scale-105 transition-all duration-300">
          <p className="text-[#FF3B30] font-medium mb-6 drop-shadow-sm">{error}</p>
          <button 
            onClick={() => navigate('/')}
            className="rounded-2xl bg-white/20 backdrop-blur-md border border-white/40 px-6 py-3 text-sm font-semibold text-gray-800 shadow-md hover:bg-white/40 transition-all duration-300"
          >
            Go Back
          </button>
        </div>
      ) : (
        <LoadingTimeline onComplete={() => {}} />
      )}
    </div>
  );
};

export default AnalysisPage;
