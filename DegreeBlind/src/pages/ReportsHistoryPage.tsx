import { useState, useEffect } from 'react';
import { getReportHistory } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const ReportsHistoryPage = () => {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, token } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchHistory = async () => {
      try {
        const data = await getReportHistory(token);
        if (data) {
          setReports(data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [user, token]);

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-semibold mb-4">Sign in to view your reports</h2>
        <p className="text-[#86868b] mb-8">You need to be logged in with GitHub to view your analysis history.</p>
        <a
          href="http://localhost:8000/api/v1/auth/github/login"
          className="inline-flex items-center gap-2 text-sm font-medium bg-[#1d1d1f] text-white px-6 py-3 rounded-full hover:bg-[#333336] transition-colors"
        >
          Sign In with GitHub
        </a>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-gray-900 via-gray-700 to-gray-900 tracking-tight mb-8 drop-shadow-sm">Your Reports</h1>

      {loading ? (
        <div className="text-center py-12 text-[#1d1d1f]/50 animate-pulse font-medium">Loading history...</div>
      ) : reports.length === 0 ? (
        <div className="text-center py-12 glass-panel rounded-3xl">
          <p className="text-gray-600 font-medium">You haven't analyzed any repositories yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reports.map((report) => (
            <div key={report.id} className="glass-panel rounded-2xl p-6 flex justify-between items-center transform hover:-translate-y-1 hover:shadow-xl transition-all duration-300">
              <div>
                <h3 className="font-bold text-xl text-gray-900 drop-shadow-sm">{report.repository.full_name}</h3>
                <p className="text-sm text-gray-600 mt-1 font-medium">
                  {new Date(report.created_at).toLocaleDateString()} • {report.repository.language} • {report.repository.stars} ⭐
                </p>
                {report.summary && <p className="text-sm text-gray-800 mt-3 line-clamp-2">{report.summary}</p>}
              </div>
              <div className="ml-6 flex-shrink-0">
                <button
                  onClick={() => {
                    const r = report.repository;
                    const ai = report.report_data;
                    if (!ai) return;

                    navigate('/report', {
                      state: {
                        repoUrl: r.url,
                        repoData: {
                          name: r.name,
                          owner: r.owner,
                          description: r.description,
                          primaryLanguage: r.language,
                          stars: r.stars,
                          forks: r.forks,
                          openIssues: 0,
                          defaultBranch: r.default_branch || 'main',
                          url: r.url,
                        },
                        langData: null,
                        analysisData: {
                          problemSolving: ai.technical_strengths?.[0] || 'Insufficient evidence',
                          architecture: ai.architecture_assessment,
                          codeQuality: ai.engineering_practices,
                          documentation: ai.documentation_review,
                          security: ai.security_observations,
                          testing: ai.testing_review,
                          maintainability: ai.maintainability_assessment,
                          scalability: ai.scalability_assessment,
                          overallSummary: ai.final_summary
                        },
                        roles: ai.potential_roles?.map((role: string) => ({ roleName: role })) || [],
                        recommendations: ai.areas_for_improvement
                      }
                    });
                  }}
                  className="px-5 py-2.5 bg-white/30 backdrop-blur-md border border-white/40 text-gray-900 font-semibold rounded-xl hover:bg-white/50 hover:shadow-md transition-all duration-300"
                >
                  View Report
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReportsHistoryPage;
