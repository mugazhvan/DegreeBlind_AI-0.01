import { useState } from 'react';
import { motion } from 'framer-motion';
import { GlassCard } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScoreRing } from '@/components/score-ring';
import { Badge } from '@/components/ui/badge';
import { ErrorState } from '@/components/error-state';
import { LoadingState } from '@/components/loading-state';
import { generateCareerIntelligence } from '@/services/api';
import { Briefcase, Loader2, TrendingUp, TrendingDown, Star, DollarSign, ArrowRight } from 'lucide-react';

export default function CareerPage() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    setLoading(true);
    setError('');
    try {
      const result = await generateCareerIntelligence();
      setData(result);
    } catch (e: any) {
      setError(e.response?.data?.detail || 'Failed to generate career report. Ensure you have analyzed a repo and uploaded a resume.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight mb-2">Career Intelligence</h1>
          <p className="text-sm text-muted-foreground">Unified career readiness assessment powered by AI.</p>
        </div>
        {!data && (
          <Button onClick={handleGenerate} disabled={loading} variant="brand">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Generate Report'}
          </Button>
        )}
      </div>

      {loading && <LoadingState rows={4} />}
      {error && <ErrorState message={error} onRetry={() => setError('')} />}

      {data && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          {/* Career Score */}
          <GlassCard className="p-8 flex flex-col items-center text-center">
            <ScoreRing score={data.career_score} size={140} strokeWidth={10} />
            <h2 className="text-xl font-bold mt-4">Career Score</h2>
            <p className="text-sm text-muted-foreground mt-1 max-w-md">Your overall career readiness based on resume, engineering skills, ATS, and interview preparation.</p>
          </GlassCard>

          {/* Dimensions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { label: 'Resume', dim: data.resume_score },
              { label: 'ATS', dim: data.ats_score },
              { label: 'Engineering', dim: data.engineering_score },
              { label: 'Employability', dim: data.employability },
              { label: 'Interview Ready', dim: data.interview_readiness },
            ].map((item) => item.dim && (
              <GlassCard key={item.label} className="p-5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold">{item.label}</span>
                  <Badge variant={item.dim.score >= 70 ? 'success' : item.dim.score >= 50 ? 'warning' : 'destructive'}>{item.dim.score}</Badge>
                </div>
                <p className="text-xs text-muted-foreground">{item.dim.reasoning}</p>
              </GlassCard>
            ))}
          </div>

          {/* Strengths & Weaknesses */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <GlassCard className="p-5">
              <div className="flex items-center gap-2 mb-3"><TrendingUp className="w-4 h-4 text-success" /><h3 className="text-sm font-semibold">Strengths</h3></div>
              <ul className="space-y-2">{Array.isArray(data.strengths) && data.strengths.map((s: any, i: number) => <li key={i} className="text-xs text-muted-foreground flex items-start gap-2"><Star className="w-3 h-3 text-success shrink-0 mt-0.5" />{typeof s === 'string' ? s : s.strength || s.name || JSON.stringify(s)}</li>)}</ul>
            </GlassCard>
            <GlassCard className="p-5">
              <div className="flex items-center gap-2 mb-3"><TrendingDown className="w-4 h-4 text-warning" /><h3 className="text-sm font-semibold">Areas to Improve</h3></div>
              <ul className="space-y-2">{Array.isArray(data.weaknesses) && data.weaknesses.map((w: any, i: number) => <li key={i} className="text-xs text-muted-foreground flex items-start gap-2"><ArrowRight className="w-3 h-3 text-warning shrink-0 mt-0.5" />{typeof w === 'string' ? w : w.weakness || w.name || JSON.stringify(w)}</li>)}</ul>
            </GlassCard>
          </div>

          {/* Recommended Roles & Salary */}
          <GlassCard className="p-6">
            <h3 className="text-sm font-semibold mb-3">Recommended Roles</h3>
            <div className="flex flex-wrap gap-2 mb-4">
              {Array.isArray(data.recommended_roles) && data.recommended_roles.map((r: any, i: number) => <Badge key={i} variant="info">{typeof r === 'string' ? r : r.role || r.name || JSON.stringify(r)}</Badge>)}
            </div>
            {data.salary_range && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <DollarSign className="w-4 h-4" />
                <span>Estimated Range: <strong className="text-foreground">{data.salary_range}</strong></span>
              </div>
            )}
          </GlassCard>

          {/* Next Steps */}
          {Array.isArray(data.next_steps) && data.next_steps.length > 0 && (
            <GlassCard className="p-6">
              <h3 className="text-sm font-semibold mb-3">Next Steps</h3>
              <ol className="space-y-2">
                {data.next_steps.map((step: any, i: number) => (
                  <li key={i} className="text-xs text-muted-foreground flex items-start gap-3">
                    <span className="w-5 h-5 rounded-full bg-indigo-500/10 text-indigo-400 text-xs flex items-center justify-center shrink-0">{i + 1}</span>
                    {typeof step === 'string' ? step : step.step || step.description || JSON.stringify(step)}
                  </li>
                ))}
              </ol>
            </GlassCard>
          )}
        </motion.div>
      )}
    </div>
  );
}
