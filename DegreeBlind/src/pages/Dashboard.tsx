import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/stores/auth-store';
import { getDashboardStats, getLatestCareerIntelligence } from '@/services/api';
import { MetricCard } from '@/components/metric-card';
import { ScoreRing } from '@/components/score-ring';
import { GlassCard } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { GitBranch, FileText, Briefcase, MessageSquare, GraduationCap, BarChart3, ArrowRight, Activity, Users, Star } from 'lucide-react';

const quickActions = [
  { label: 'Analyze GitHub', to: '/app/github', icon: GitBranch, color: 'from-emerald-500/10 to-emerald-600/10' },
  { label: 'Upload Resume', to: '/app/resume', icon: FileText, color: 'from-blue-500/10 to-blue-600/10' },
  { label: 'Career Report', to: '/app/career', icon: Briefcase, color: 'from-purple-500/10 to-purple-600/10' },
  { label: 'Mock Interview', to: '/app/interview', icon: MessageSquare, color: 'from-orange-500/10 to-orange-600/10' },
  { label: 'Learning Path', to: '/app/learning', icon: GraduationCap, color: 'from-pink-500/10 to-pink-600/10' },
  { label: 'View Reports', to: '/app/reports', icon: BarChart3, color: 'from-cyan-500/10 to-cyan-600/10' },
];

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const [stats, setStats] = useState<any>(null);
  const [careerScore, setCareerScore] = useState<number | null>(null);

  useEffect(() => {
    getDashboardStats().then(setStats).catch(() => {});
    getLatestCareerIntelligence().then((d) => setCareerScore(d?.career_score)).catch(() => {});
  }, []);

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <motion.h1 initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="text-2xl font-bold tracking-tight">
            {greeting()}, {user?.name?.split(' ')[0] || 'there'}
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-sm text-muted-foreground mt-1">
            Here&apos;s your career intelligence overview.
          </motion.p>
        </div>
        {careerScore !== null && (
          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }}>
            <ScoreRing score={careerScore} size={80} strokeWidth={6} label="Career Score" />
          </motion.div>
        )}
      </div>

      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <MetricCard icon={Activity} label="Repositories Analyzed" value={stats.repositories_analysed || 0} />
          <MetricCard icon={Users} label="Candidates Evaluated" value={stats.candidates_evaluated || 0} />
          <MetricCard icon={Star} label="Average Skill Score" value={stats.average_skill_score || 'N/A'} />
        </div>
      )}

      <div>
        <h2 className="text-sm font-medium text-muted-foreground mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {quickActions.map((action, i) => (
            <motion.div key={action.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.05 }}>
              <Link to={action.to}>
                <GlassCard className="p-4 text-center group hover:border-indigo-500/20 cursor-pointer">
                  <div className={`w-10 h-10 mx-auto rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-200`}>
                    <action.icon className="w-4 h-4 text-foreground" />
                  </div>
                  <p className="text-xs font-medium text-foreground">{action.label}</p>
                </GlassCard>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>

      <GlassCard className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold text-foreground mb-1">Get your Career Intelligence Report</h3>
            <p className="text-sm text-muted-foreground">Analyze a GitHub repo and upload your resume to unlock your full career profile.</p>
          </div>
          <Button asChild variant="brand" size="default" className="shrink-0 group">
            <Link to="/app/github">
              Start <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
        </div>
      </GlassCard>
    </div>
  );
}
