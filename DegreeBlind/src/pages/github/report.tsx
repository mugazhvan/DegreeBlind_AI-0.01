import { useLocation, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ScoreRing } from '@/components/score-ring';
import { GlassCard } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/empty-state';
import { Separator } from '@/components/ui/separator';
import { GitBranch, Star, GitFork, Code, Shield, TestTube, FileText, Wrench, TrendingUp, ArrowLeft, ChevronDown } from 'lucide-react';
import { useState } from 'react';

function ScoreCard({ label, icon: Icon, content }: { label: string; icon: any; content: any }) {
  const [expanded, setExpanded] = useState(false);
  if (!content) return null;

  const isScoreDimension = content && typeof content === 'object' && 'score' in content && 'reasoning' in content;

  return (
    <GlassCard className="p-5 cursor-pointer" onClick={() => setExpanded(!expanded)}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Icon className="w-5 h-5 text-indigo-400" />
          <h3 className="text-sm font-semibold text-foreground">{label}</h3>
        </div>
        {isScoreDimension && (
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold">{content.score}</span>
            <span className="text-xs text-muted-foreground">/100</span>
          </div>
        )}
      </div>
      
      {isScoreDimension && (
        <div className="w-full bg-secondary/50 rounded-full h-2 mb-4 overflow-hidden">
          <div 
            className="bg-indigo-500 h-2 rounded-full transition-all duration-1000" 
            style={{ width: `${content.score}%` }} 
          />
        </div>
      )}

      <p className={`text-sm text-muted-foreground leading-relaxed ${expanded ? '' : 'line-clamp-2'}`}>
        {isScoreDimension ? content.reasoning : (typeof content === 'string' ? content : JSON.stringify(content))}
      </p>
      
      {!expanded && (
        <div className="mt-2 text-xs text-indigo-400/70 text-center flex items-center justify-center gap-1">
          <ChevronDown className="w-3 h-3" /> Click to expand
        </div>
      )}
    </GlassCard>
  );
}

export default function GitHubReportPage() {
  const location = useLocation();
  const state = location.state as { report: any; repoUrl: string } | null;

  if (!state?.report) {
    return <EmptyState icon={GitBranch} title="No Report" description="Analyze a repository first." action={{ label: 'Analyze', onClick: () => {} }} />;
  }

  const { report, repoUrl } = state;
  const repo = report.repository;
  const analysis = report.analysis;

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3">
        <Link to="/app/github" className="text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {repo?.name === 'Portfolio Research' ? 'Developer Portfolio Intelligence' : 'Engineering Report'}
          </h1>
          <a href={repoUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-indigo-400 hover:underline">{repoUrl}</a>
        </div>
      </div>

      {/* Repository info */}
      {repo && (
        <GlassCard className="p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center">
              <GitBranch className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">
                {repo.name === 'Portfolio Research'
                  ? `Developer Portfolio: ${typeof repo.owner === 'string' ? repo.owner : 'Owner'}`
                  : `${typeof repo.owner === 'string' ? repo.owner : 'Owner'}/${typeof repo.name === 'string' ? repo.name : 'Repo'}`}
              </h2>
              {repo.description && <p className="text-sm text-muted-foreground">{typeof repo.description === 'string' ? repo.description : JSON.stringify(repo.description)}</p>}
            </div>
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            {repo.primaryLanguage && <span className="flex items-center gap-1"><Code className="w-3 h-3" />{typeof repo.primaryLanguage === 'string' ? repo.primaryLanguage : JSON.stringify(repo.primaryLanguage)}</span>}
            {repo.stars !== null && repo.stars !== undefined && <span className="flex items-center gap-1"><Star className="w-3 h-3" />{repo.stars}</span>}
            {repo.forks !== null && repo.forks !== undefined && <span className="flex items-center gap-1"><GitFork className="w-3 h-3" />{repo.forks}</span>}
          </div>
        </GlassCard>
      )}

      {/* Analysis sections */}
      {analysis && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ScoreCard label="Architecture" icon={Code} content={analysis.architecture} />
          <ScoreCard label="Code Quality" icon={Wrench} content={analysis.code_quality || analysis.codeQuality} />
          <ScoreCard label="Security" icon={Shield} content={analysis.security} />
          <ScoreCard label="Testing" icon={TestTube} content={analysis.testing} />
          <ScoreCard label="Documentation" icon={FileText} content={analysis.documentation} />
          <ScoreCard label="Maintainability" icon={TrendingUp} content={analysis.maintainability} />
          <ScoreCard label="Scalability" icon={TrendingUp} content={analysis.scalability} />
          <ScoreCard label="Project Complexity" icon={Code} content={analysis.project_complexity || analysis.projectComplexity} />
          <ScoreCard label="Engineering Maturity" icon={Shield} content={analysis.engineering_maturity || analysis.engineeringMaturity} />
          <ScoreCard label="Best Practices" icon={Star} content={analysis.best_practices || analysis.bestPractices} />
          <ScoreCard label="Recruiter Summary" icon={Star} content={analysis.recruiter_summary || analysis.overallSummary} />
        </div>
      )}

      {/* Career Recommendations */}
      {Array.isArray(analysis?.career_recommendations) && analysis.career_recommendations.length > 0 && (
        <GlassCard className="p-6">
          <h3 className="text-base font-semibold mb-4">Career Recommendations</h3>
          <ul className="space-y-3">
            {analysis.career_recommendations.map((rec: any, i: number) => (
              <motion.li key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }} className="flex items-start gap-3 text-sm text-muted-foreground">
                <span className="w-5 h-5 rounded-full bg-indigo-500/10 text-indigo-400 text-xs flex items-center justify-center shrink-0 mt-0.5">{i + 1}</span>
                {typeof rec === 'string' ? rec : (rec.suggestion || rec.recommendation || rec.title || JSON.stringify(rec))}
              </motion.li>
            ))}
          </ul>
        </GlassCard>
      )}

      {/* Learning Recommendations */}
      {Array.isArray(analysis?.learning_recommendations) && analysis.learning_recommendations.length > 0 && (
        <GlassCard className="p-6">
          <h3 className="text-base font-semibold mb-4">Learning Recommendations</h3>
          <ul className="space-y-3">
            {analysis.learning_recommendations.map((rec: any, i: number) => (
              <motion.li key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }} className="flex items-start gap-3 text-sm text-muted-foreground">
                <span className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-400 text-xs flex items-center justify-center shrink-0 mt-0.5">{i + 1}</span>
                {typeof rec === 'string' ? rec : (rec.suggestion || rec.recommendation || rec.title || JSON.stringify(rec))}
              </motion.li>
            ))}
          </ul>
        </GlassCard>
      )}

      {/* Strengths and Weaknesses */}
      {(analysis?.strengths?.length > 0 || analysis?.weaknesses?.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {analysis?.strengths?.length > 0 && (
            <GlassCard className="p-6 border-emerald-500/20 bg-emerald-500/5">
              <h3 className="text-base font-semibold mb-4 text-emerald-400">Strengths</h3>
              <ul className="list-disc pl-5 space-y-2 text-sm text-muted-foreground">
                {analysis.strengths.map((str: string, i: number) => <li key={i}>{str}</li>)}
              </ul>
            </GlassCard>
          )}
          {analysis?.weaknesses?.length > 0 && (
            <GlassCard className="p-6 border-red-500/20 bg-red-500/5">
              <h3 className="text-base font-semibold mb-4 text-red-400">Areas for Improvement</h3>
              <ul className="list-disc pl-5 space-y-2 text-sm text-muted-foreground">
                {analysis.weaknesses.map((wk: string, i: number) => <li key={i}>{wk}</li>)}
              </ul>
            </GlassCard>
          )}
        </div>
      )}

      {/* Skill Radar */}
      {analysis?.skill_radar && Object.keys(analysis.skill_radar).length > 0 && (
        <GlassCard className="p-6">
          <h3 className="text-base font-semibold mb-4">Skill Radar</h3>
          <div className="flex flex-wrap gap-2">
            {Object.entries(analysis.skill_radar).map(([skill, score]: [string, any], i: number) => (
              <Badge key={i} variant="secondary" className="flex gap-2 py-1.5 px-3">
                <span>{skill}</span>
                <span className="text-indigo-400 font-bold">{score}</span>
              </Badge>
            ))}
          </div>
        </GlassCard>
      )}
    </div>
  );
}
