import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { GitBranch, ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { GlassCard } from '@/components/ui/card';
import { ErrorState } from '@/components/error-state';
import { analyzeRepository } from '@/services/api';

export default function GitHubPage() {
  const [repoUrl, setRepoUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleAnalyze = async () => {
    if (!repoUrl.trim()) return;
    setLoading(true);
    setError('');
    try {
      const report = await analyzeRepository(repoUrl);
      if (report) {
        navigate('/app/github/report', { state: { report, repoUrl } });
      } else {
        setError('Analysis failed. Please check the developer handle or URL and try again.');
      }
    } catch {
      setError('An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight mb-2">GitHub Developer Research</h1>
        <p className="text-sm text-muted-foreground">Enter a GitHub username, profile link, or repository URL to conduct deep research across the developer&apos;s project portfolio.</p>
      </div>

      <GlassCard className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
            <GitBranch className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-foreground">Developer Handle or Repository</h2>
            <p className="text-xs text-muted-foreground">e.g., mugazhvan or https://github.com/mugazhvan</p>
          </div>
        </div>

        <div className="flex gap-3">
          <Input
            placeholder="https://github.com/username or just username"
            value={repoUrl}
            onChange={(e) => setRepoUrl(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAnalyze()}
            disabled={loading}
            className="flex-1"
          />
          <Button onClick={handleAnalyze} disabled={loading || !repoUrl.trim()} variant="brand" className="shrink-0">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><span>Analyze</span><ArrowRight className="w-4 h-4" /></>}
          </Button>
        </div>

        {loading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-6">
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
              <span>AI is analyzing the developer&apos;s public repositories and compiling portfolio intelligence. This takes 30-60s...</span>
            </div>
            <div className="mt-3 h-1 bg-secondary rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
                initial={{ width: '0%' }}
                animate={{ width: '90%' }}
                transition={{ duration: 45, ease: 'linear' }}
              />
            </div>
          </motion.div>
        )}
      </GlassCard>

      {error && <ErrorState message={error} onRetry={() => setError('')} />}
    </div>
  );
}
