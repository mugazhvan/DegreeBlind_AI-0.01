import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Trash2, Loader2, GitBranch, AlertCircle, FileText, Calendar } from 'lucide-react';
import { GlassCard } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LoadingState } from '@/components/loading-state';
import { EmptyState } from '@/components/empty-state';
import { getReportHistory, deleteReport } from '@/services/api';

export default function ReportsPage() {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<number | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const data = await getReportHistory();
      setReports(data);
    } catch {
      // handle error
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this report?')) {
      setDeleting(id);
      try {
        await deleteReport(id);
        setReports(prev => prev.filter(r => r.id !== id));
      } catch {
        alert('Failed to delete report');
      } finally {
        setDeleting(null);
      }
    }
  };

  const handleView = (reportData: any, repositoryData: any) => {
    navigate('/app/github/report', { 
      state: { 
        report: {
          repository: repositoryData,
          analysis: reportData
        },
        repoUrl: repositoryData?.url || ''
      } 
    });
  };

  if (loading) {
    return <div className="max-w-4xl mx-auto"><LoadingState rows={4} /></div>;
  }

  if (reports.length === 0) {
    return (
      <EmptyState
        icon={FileText}
        title="No reports found"
        description="You haven't generated any career or engineering reports yet."
        action={{ label: 'Analyze GitHub', onClick: () => navigate('/app/github') }}
      />
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight mb-2">Report History</h1>
        <p className="text-sm text-muted-foreground">View your past engineering and career intelligence reports.</p>
      </div>

      <div className="grid gap-4">
        <AnimatePresence>
          {reports.map((r, i) => {
            const date = new Date(r.created_at).toLocaleDateString();
            const reportContent = typeof r.report_data === 'string' ? JSON.parse(r.report_data) : r.report_data;
            const score = reportContent?.analysis?.overallScore || reportContent?.engineering_score;
            const repoUrl = r.repository?.url || '';

            return (
              <motion.div
                key={r.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: i * 0.05 }}
                className="group cursor-pointer"
                onClick={() => handleView(reportContent, r.repository)}
              >
                <GlassCard className="p-5 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center">
                      <GitBranch className="w-5 h-5 text-indigo-400" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                        {repoUrl.replace('https://github.com/', '') || 'Unknown Repository'}
                        {score && <Badge variant="outline" className="text-xs">Score: {typeof score === 'string' || typeof score === 'number' ? score : JSON.stringify(score)}</Badge>}
                      </h3>
                      <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {date}</span>
                        <span className={r.status === 'completed' ? 'text-success' : r.status === 'failed' ? 'text-destructive' : 'text-warning'}>
                          {r.status?.charAt(0).toUpperCase() + r.status?.slice(1)}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); handleView(reportContent, r.repository); }}>
                      View
                    </Button>
                    <Button variant="ghost" size="icon" onClick={(e) => handleDelete(e, r.id)} disabled={deleting === r.id}>
                      {deleting === r.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4 text-destructive hover:text-destructive/80" />}
                    </Button>
                  </div>
                </GlassCard>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
