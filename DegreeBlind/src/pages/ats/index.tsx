import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useSearchParams } from 'react-router-dom';
import { GlassCard } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ScoreRing } from '@/components/score-ring';
import { Badge } from '@/components/ui/badge';
import { ErrorState } from '@/components/error-state';
import { scoreResumeATS, getUserResumes } from '@/services/api';
import { Target, Loader2, CheckCircle, XCircle, TrendingUp, AlertTriangle } from 'lucide-react';

export default function ATSPage() {
  const [resumeId, setResumeId] = useState('');
  const [jobDesc, setJobDesc] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');
  const [resumes, setResumes] = useState<any[]>([]);
  const [searchParams] = useSearchParams();

  useEffect(() => {
    fetchResumes();
    const paramResumeId = searchParams.get('resume_id');
    if (paramResumeId) {
      setResumeId(paramResumeId);
    }
  }, [searchParams]);

  const fetchResumes = async () => {
    try {
      const data = await getUserResumes();
      setResumes(data.filter((r: any) => r.status === 'completed'));
    } catch {
      // ignore
    }
  };

  const handleScore = async () => {
    if (!resumeId) return;
    setLoading(true);
    setError('');
    try {
      const data = await scoreResumeATS(Number(resumeId), jobDesc);
      setResult(data);
    } catch (e: any) {
      setError(e.response?.data?.detail || e.message || 'Scoring failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight mb-2">ATS Analysis</h1>
        <p className="text-sm text-muted-foreground">Score your resume against Applicant Tracking Systems.</p>
      </div>

      <GlassCard className="p-6 space-y-4">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center">
            <Target className="w-5 h-5 text-orange-400" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-foreground">Score Resume</h2>
            <p className="text-xs text-muted-foreground">Select an uploaded resume and optionally enter a job description</p>
          </div>
        </div>

        {resumes.length > 0 ? (
          <select 
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            value={resumeId}
            onChange={(e) => setResumeId(e.target.value)}
          >
            <option value="" disabled>Select a resume...</option>
            {resumes.map(r => (
              <option key={r.id} value={r.id}>{r.filename} ({new Date(r.uploaded_at).toLocaleDateString()})</option>
            ))}
          </select>
        ) : (
          <Input placeholder="Resume ID (from upload)" value={resumeId} onChange={(e) => setResumeId(e.target.value)} />
        )}
        
        <Textarea placeholder="Paste job description here (optional)..." value={jobDesc} onChange={(e) => setJobDesc(e.target.value)} rows={4} />
        <Button onClick={handleScore} disabled={loading || !resumeId} variant="brand">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Score Resume'}
        </Button>
      </GlassCard>

      {error && <ErrorState message={error} onRetry={() => setError('')} />}

      {result && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          {/* Overall score */}
          <GlassCard className="p-6 flex items-center gap-8">
            <ScoreRing score={result.overall_score} size={100} strokeWidth={8} label="ATS Score" />
            <div className="flex-1">
              <h3 className="text-lg font-semibold mb-2">Overall ATS Score</h3>
              <p className="text-sm text-muted-foreground">
                {result.overall_score >= 80 ? 'Excellent! Your resume is well-optimized.' :
                 result.overall_score >= 60 ? 'Good, but there\'s room for improvement.' :
                 'Needs significant improvements for ATS compatibility.'}
              </p>
            </div>
          </GlassCard>

          {/* Categories */}
          {Array.isArray(result.categories) && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {result.categories.map((cat: any, i: number) => (
                <GlassCard key={i} className="p-5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold">{typeof cat === 'string' ? cat : cat.category || cat.name || 'Category'}</span>
                    <Badge variant={cat.score >= 80 ? 'success' : cat.score >= 60 ? 'warning' : 'destructive'}>
                      {cat.score || 0}/100
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{typeof cat === 'string' ? '' : cat.feedback || ''}</p>
                </GlassCard>
              ))}
            </div>
          )}

          {/* Keywords */}
          {result.keyword_analysis && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <GlassCard className="p-5">
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle className="w-4 h-4 text-success" />
                  <h3 className="text-sm font-semibold">Found Keywords</h3>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {Array.isArray(result.keyword_analysis.found_keywords) && result.keyword_analysis.found_keywords.map((k: any, i: number) => <Badge key={i} variant="success">{typeof k === 'string' ? k : k.keyword || k.name || JSON.stringify(k)}</Badge>)}
                </div>
              </GlassCard>
              <GlassCard className="p-5">
                <div className="flex items-center gap-2 mb-3">
                  <XCircle className="w-4 h-4 text-destructive" />
                  <h3 className="text-sm font-semibold">Missing Keywords</h3>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {Array.isArray(result.keyword_analysis.missing_keywords) && result.keyword_analysis.missing_keywords.map((k: any, i: number) => <Badge key={i} variant="destructive">{typeof k === 'string' ? k : k.keyword || k.name || JSON.stringify(k)}</Badge>)}
                </div>
              </GlassCard>
            </div>
          )}

          {/* Improvements */}
          {Array.isArray(result.improvements) && result.improvements.length > 0 && (
            <GlassCard className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-4 h-4 text-indigo-400" />
                <h3 className="text-sm font-semibold">Improvement Suggestions</h3>
              </div>
              <div className="space-y-3">
                {result.improvements.map((imp: any, i: number) => (
                  <div key={i} className="flex items-start gap-3">
                    <AlertTriangle className="w-4 h-4 text-warning shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-foreground">{typeof imp === 'string' ? 'Improvement' : imp.category || imp.title || 'Suggestion'}</p>
                      <p className="text-xs text-muted-foreground">{typeof imp === 'string' ? imp : imp.suggestion || imp.description || JSON.stringify(imp)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </GlassCard>
          )}
        </motion.div>
      )}
    </div>
  );
}
