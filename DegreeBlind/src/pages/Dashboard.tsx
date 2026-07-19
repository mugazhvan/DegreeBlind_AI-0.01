import { useState, useEffect } from 'react';
import RepositoryInput from '../components/RepositoryInput';
import { getDashboardStats } from '../services/api';

const Dashboard = () => {
  const [stats, setStats] = useState({
    repositories_analysed: 0,
    candidates_evaluated: 0,
    average_skill_score: 'N/A'
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await getDashboardStats();
        if (data) {
          setStats(data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      {/* Hero */}
      <div className="text-center">
        <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-gray-900 via-gray-700 to-gray-900 tracking-tight sm:text-6xl drop-shadow-sm pb-2">
          Analyser AI
        </h1>
        <p className="mt-4 text-lg text-gray-700 max-w-lg mx-auto font-medium drop-shadow-sm">
          Analyze GitHub repositories to understand real developer skills.
        </p>
        <RepositoryInput />
      </div>

      {/* Stat cards */}
      <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-5">
        {[
          { label: 'Repositories Analysed', icon: '📊', value: stats.repositories_analysed },
          { label: 'Candidates Evaluated', icon: '👤', value: stats.candidates_evaluated },
          { label: 'Average Skill Score', icon: '⭐', value: stats.average_skill_score },
        ].map((stat) => (
          <div key={stat.label} className="glass-panel rounded-2xl p-6 text-center transform hover:-translate-y-1 transition-all duration-300">
            <span className="text-3xl mb-3 block drop-shadow-md">{stat.icon}</span>
            <h3 className="text-xs font-semibold text-[#1d1d1f]/70 uppercase tracking-wider mb-2">{stat.label}</h3>
            {loading ? (
              <p className="text-[#1d1d1f]/50 italic text-sm animate-pulse">Loading...</p>
            ) : (
              <p className="text-3xl font-bold text-[#1d1d1f] drop-shadow-sm">{stat.value}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
