import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Loader2, Play, Check, AlertCircle } from 'lucide-react';
import { GlassCard } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ErrorState } from '@/components/error-state';
import { ScoreRing } from '@/components/score-ring';
import { Badge } from '@/components/ui/badge';
import { startInterview, submitInterviewAnswer, completeInterview } from '@/services/api';

const INTERVIEW_TYPES = [
  { id: 'technical', label: 'Technical' },
  { id: 'hr', label: 'HR / Behavioral' },
  { id: 'system_design', label: 'System Design' },
];

export default function InterviewPage() {
  const [type, setType] = useState('technical');
  const [role, setRole] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [session, setSession] = useState<any>(null);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [answer, setAnswer] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<any>(null);
  const [finalReport, setFinalReport] = useState<any>(null);

  const handleStart = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await startInterview(type, role || undefined);
      setSession(data);
      setCurrentQIndex(0);
      setAnswer('');
      setFeedback(null);
      setFinalReport(null);
    } catch (e: any) {
      setError(e.response?.data?.detail || e.message || 'Failed to start session');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitAnswer = async () => {
    if (!answer.trim() || !session) return;
    setSubmitting(true);
    try {
      const q = session.questions[currentQIndex];
      const data = await submitInterviewAnswer(q.id, answer);
      setFeedback(data.feedback);
    } catch (e: any) {
      setError(e.response?.data?.detail || 'Failed to submit answer');
    } finally {
      setSubmitting(false);
    }
  };

  const handleNext = () => {
    setFeedback(null);
    setAnswer('');
    setCurrentQIndex(prev => prev + 1);
  };

  const handleComplete = async () => {
    if (!session) return;
    setLoading(true);
    try {
      const report = await completeInterview(session.id);
      setFinalReport(report);
      setSession(null);
    } catch (e: any) {
      setError(e.response?.data?.detail || 'Failed to complete interview');
    } finally {
      setLoading(false);
    }
  };

  if (finalReport) {
    return (
      <div className="max-w-3xl mx-auto space-y-8">
        <h1 className="text-2xl font-bold tracking-tight text-center">Interview Complete</h1>
        <GlassCard className="p-8 text-center flex flex-col items-center">
          <ScoreRing score={finalReport.overall_score} size={120} strokeWidth={8} label="Overall Score" />
          <Badge className="mt-4" variant={finalReport.hire_recommendation === 'Strong Yes' ? 'success' : finalReport.hire_recommendation === 'Yes' ? 'success' : 'warning'}>
            Recommendation: {finalReport.hire_recommendation}
          </Badge>
          <div className="mt-6 text-left w-full space-y-6">
            <div>
              <h3 className="text-sm font-semibold mb-2">Strengths</h3>
              <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1">
                {Array.isArray(finalReport.strengths) && finalReport.strengths.map((s: any, i: number) => <li key={i}>{typeof s === 'string' ? s : s.strength || s.point || JSON.stringify(s)}</li>)}
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold mb-2">Areas for Improvement</h3>
              <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1">
                {Array.isArray(finalReport.improvements) && finalReport.improvements.map((s: any, i: number) => <li key={i}>{typeof s === 'string' ? s : s.improvement || s.point || JSON.stringify(s)}</li>)}
              </ul>
            </div>
          </div>
          <Button className="mt-8" onClick={() => setFinalReport(null)}>Start New Session</Button>
        </GlassCard>
      </div>
    );
  }

  if (session) {
    const q = session.questions[currentQIndex];
    const isLast = currentQIndex === session.questions.length - 1;

    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold">Question {currentQIndex + 1} of {session.questions.length}</h1>
          <Badge variant="outline">{session.status}</Badge>
        </div>

        <GlassCard className="p-6">
          <h2 className="text-lg font-medium text-foreground mb-4">{q.question_text}</h2>
          
          <AnimatePresence mode="wait">
            {!feedback ? (
              <motion.div key="input" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <Textarea 
                  placeholder="Type your answer here..." 
                  rows={6} 
                  value={answer}
                  onChange={e => setAnswer(e.target.value)}
                />
                <div className="mt-4 flex justify-end">
                  <Button onClick={handleSubmitAnswer} disabled={!answer.trim() || submitting} variant="brand">
                    {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Check className="w-4 h-4 mr-2" />}
                    Submit Answer
                  </Button>
                </div>
              </motion.div>
            ) : (
              <motion.div key="feedback" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                <div className="p-4 rounded-lg bg-white/[0.02] border border-white/[0.05]">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold">Score: {feedback.score}/100</span>
                    <Badge variant={feedback.score >= 80 ? 'success' : feedback.score >= 60 ? 'warning' : 'destructive'}>
                      {feedback.score >= 80 ? 'Good' : 'Needs Work'}
                    </Badge>
                  </div>
                  <div className="space-y-3 mt-4">
                    <div>
                      <span className="text-xs font-semibold uppercase text-success block mb-1">Strengths</span>
                      <p className="text-sm text-muted-foreground">{feedback.strengths}</p>
                    </div>
                    <div>
                      <span className="text-xs font-semibold uppercase text-warning block mb-1">Improvements</span>
                      <p className="text-sm text-muted-foreground">{feedback.improvements}</p>
                    </div>
                    {feedback.model_answer && (
                      <div>
                        <span className="text-xs font-semibold uppercase text-indigo-400 block mb-1">Model Answer</span>
                        <p className="text-sm text-muted-foreground italic">{feedback.model_answer}</p>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex justify-end gap-3 mt-4">
                  {!isLast ? (
                    <Button onClick={handleNext}>Next Question</Button>
                  ) : (
                    <Button variant="brand" onClick={handleComplete} disabled={loading}>
                      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Complete Interview'}
                    </Button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight mb-2">Interview Practice</h1>
        <p className="text-sm text-muted-foreground">Practice answering interview questions and get real-time AI feedback.</p>
      </div>

      <GlassCard className="p-6 space-y-6">
        <div className="space-y-3">
          <label className="text-sm font-medium">Interview Type</label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {INTERVIEW_TYPES.map(t => (
              <div 
                key={t.id} 
                onClick={() => setType(t.id)}
                className={`p-3 rounded-lg border text-center cursor-pointer transition-colors ${type === t.id ? 'border-indigo-500 bg-indigo-500/10 text-indigo-400' : 'border-border hover:bg-white/[0.02]'}`}
              >
                <span className="text-sm font-medium">{t.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <label className="text-sm font-medium">Target Role (Optional)</label>
          <Input placeholder="e.g. Frontend Developer" value={role} onChange={e => setRole(e.target.value)} />
        </div>

        <Button onClick={handleStart} disabled={loading} variant="brand" className="w-full">
          {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Play className="w-4 h-4 mr-2" />}
          Start Session
        </Button>

        {error && (
          <div className="mt-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            {error}
          </div>
        )}
      </GlassCard>
    </div>
  );
}
