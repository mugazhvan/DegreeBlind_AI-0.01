import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Search, Loader2, CheckCircle, XCircle, AlertTriangle, Briefcase, GraduationCap, FileText, GitBranch, Target } from 'lucide-react';
import { GlassCard } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ScoreRing } from '@/components/score-ring';
import { Badge } from '@/components/ui/badge';
import { ErrorState } from '@/components/error-state';
import { LoadingState } from '@/components/loading-state';
import { analyzeJobMatch, getUserResumes, getReportHistory } from '@/services/api';

export default function JobMatchPage() {
  const [jobTitle, setJobTitle] = useState('');
  const [jobDesc, setJobDesc] = useState('');
  const [selectedResumeId, setSelectedResumeId] = useState('');
  const [selectedReportId, setSelectedReportId] = useState('');
  const [resumes, setResumes] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
    const paramResumeId = searchParams.get('resume_id');
    if (paramResumeId) {
      setSelectedResumeId(paramResumeId);
    }
  }, [searchParams]);

  const fetchData = async () => {
    try {
      const rData = await getUserResumes();
      setResumes(rData.filter((r: any) => r.status === 'completed'));
    } catch {}
    try {
      const gData = await getReportHistory();
      setReports(gData);
    } catch {}
  };

  const handleAnalyze = async () => {
    if (!jobTitle || !jobDesc) return;
    setLoading(true);
    setError('');
    try {
      const data = await analyzeJobMatch(jobTitle, jobDesc, selectedResumeId || undefined, selectedReportId || undefined);
      setResult(data);
    } catch (e: any) {
      setError(e.response?.data?.detail || e.message || 'Analysis failed. Make sure you have uploaded a resume.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight mb-2">Job Match Analysis</h1>
        <p className="text-sm text-muted-foreground">Synthesizes your selected Resume, ATS compatibility scores, and GitHub Developer Portfolio report against any job description.</p>
      </div>

      <GlassCard className="p-6 space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
              <Search className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-foreground">Multi-Source Candidate Intelligence</h2>
              <p className="text-xs text-muted-foreground">Select profile snapshots and enter the target role details</p>
            </div>
          </div>
          {selectedResumeId && (
            <Badge variant="outline" className="text-xs bg-orange-500/10 text-orange-300 border-orange-500/30">
              <Target className="w-3 h-3 mr-1" /> ATS & Resume Included
            </Badge>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-border/40">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
              <FileText className="w-3.5 h-3.5 text-indigo-400" /> Target Resume & ATS Score
            </label>
            <select 
              className="flex h-9 w-full rounded-md border border-input bg-background/60 px-3 py-1 text-xs text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              value={selectedResumeId}
              onChange={(e) => setSelectedResumeId(e.target.value)}
            >
              <option value="">Latest Completed Resume (Default)</option>
              {resumes.map(r => (
                <option key={r.id} value={r.id}>{r.filename} ({new Date(r.uploaded_at).toLocaleDateString()})</option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
              <GitBranch className="w-3.5 h-3.5 text-emerald-400" /> GitHub Developer Portfolio Report
            </label>
            <select 
              className="flex h-9 w-full rounded-md border border-input bg-background/60 px-3 py-1 text-xs text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              value={selectedReportId}
              onChange={(e) => setSelectedReportId(e.target.value)}
            >
              <option value="">Latest GitHub Portfolio Report (Default)</option>
              {reports.map(rep => (
                <option key={rep.id} value={rep.id}>Report #{rep.id} ({new Date(rep.created_at).toLocaleDateString()})</option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-3 pt-2">
          <Input placeholder="Job Title (e.g. Senior Machine Learning Engineer)" value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} />
          <Textarea placeholder="Paste the full job description here..." value={jobDesc} onChange={(e) => setJobDesc(e.target.value)} rows={6} />
          <Button onClick={handleAnalyze} disabled={loading || !jobTitle || !jobDesc} variant="brand" className="w-full sm:w-auto">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Analyze Multi-Source Match'}
          </Button>
        </div>
      </GlassCard>

      {loading && <LoadingState rows={3} />}
      {error && <ErrorState message={error} onRetry={() => setError('')} />}

      {result && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <GlassCard className="p-6 flex items-center gap-8">
            <ScoreRing score={result.match_percentage} size={100} strokeWidth={8} label="Match" />
            <div className="flex-1">
              <h3 className="text-lg font-semibold mb-2">Match Percentage</h3>
              <p className="text-sm text-muted-foreground">
                {result.match_percentage >= 80 ? 'Strong match! You are a highly competitive candidate for this role.' :
                 result.match_percentage >= 60 ? 'Good match. Consider bridging the skill gaps identified below.' :
                 'Low match. This role might require skills or experience outside your current profile.'}
              </p>
              <div className="flex items-center gap-4 mt-4">
                <Badge variant={result.interview_probability === 'High' ? 'success' : result.interview_probability === 'Medium' ? 'warning' : 'destructive'}>
                  Interview Probability: {result.interview_probability}
                </Badge>
                {result.salary_estimate && (
                  <span className="text-xs text-muted-foreground font-medium">Est. Salary: {result.salary_estimate}</span>
                )}
              </div>
            </div>
          </GlassCard>

          {result.skill_analysis && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <GlassCard className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="w-4 h-4 text-success" />
                  <span className="text-sm font-semibold text-success">Strong</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {Array.isArray(result.skill_analysis.strong_match) && result.skill_analysis.strong_match.map((s: any, i: number) => <Badge key={i} variant="success">{typeof s === 'string' ? s : s.name || s.skill || JSON.stringify(s)}</Badge>)}
                </div>
              </GlassCard>
              <GlassCard className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-4 h-4 text-warning" />
                  <span className="text-sm font-semibold text-warning">Partial</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {Array.isArray(result.skill_analysis.partial_match) && result.skill_analysis.partial_match.map((s: any, i: number) => <Badge key={i} variant="warning">{typeof s === 'string' ? s : s.name || s.skill || JSON.stringify(s)}</Badge>)}
                </div>
              </GlassCard>
              <GlassCard className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <XCircle className="w-4 h-4 text-destructive" />
                  <span className="text-sm font-semibold text-destructive">Missing</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {Array.isArray(result.skill_analysis.missing) && result.skill_analysis.missing.map((s: any, i: number) => <Badge key={i} variant="destructive">{typeof s === 'string' ? s : s.name || s.skill || JSON.stringify(s)}</Badge>)}
                </div>
              </GlassCard>
            </div>
          )}

          {result.recruiter_summary && (
            <GlassCard className="p-6">
              <div className="flex items-center gap-2 mb-3">
                <FileText className="w-4 h-4 text-muted-foreground" />
                <h3 className="text-sm font-semibold">Recruiter Summary</h3>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">{result.recruiter_summary}</p>
            </GlassCard>
          )}

          {Array.isArray(result.learning_plan) && result.learning_plan.length > 0 && (
            <GlassCard className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <GraduationCap className="w-4 h-4 text-indigo-400" />
                <h3 className="text-sm font-semibold">Learning Plan to Bridge Gaps</h3>
              </div>
              <ul className="space-y-3">
                {result.learning_plan.map((plan: any, i: number) => (
                  <li key={i} className="text-sm text-muted-foreground flex items-start gap-3">
                    <span className="w-5 h-5 rounded-full bg-indigo-500/10 text-indigo-400 text-xs flex items-center justify-center shrink-0 mt-0.5">{i + 1}</span>
                    {typeof plan === 'string' ? plan : plan.step || plan.action || JSON.stringify(plan)}
                  </li>
                ))}
              </ul>
            </GlassCard>
          )}
        </motion.div>
      )}
    </div>
  );
}
