import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams } from 'react-router-dom';
import { GraduationCap, Loader2, Book, Code, Award, CheckCircle2, Calendar, Sparkles, FileText, GitBranch, ExternalLink, BookmarkCheck, ChevronRight, Layers } from 'lucide-react';
import { GlassCard } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ErrorState } from '@/components/error-state';
import { LoadingState } from '@/components/loading-state';
import { Badge } from '@/components/ui/badge';
import { generateLearningRoadmap, getUserResumes, getReportHistory } from '@/services/api';

export default function LearningPage() {
  const [targetRole, setTargetRole] = useState('');
  const [selectedResumeId, setSelectedResumeId] = useState('');
  const [selectedReportId, setSelectedReportId] = useState('');
  const [resumes, setResumes] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [roadmap, setRoadmap] = useState<any>(null);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'weekly' | 'milestones' | 'resources'>('weekly');
  const [searchParams] = useSearchParams();

  useEffect(() => {
    fetchData();
    const paramResumeId = searchParams.get('resume_id');
    if (paramResumeId) setSelectedResumeId(paramResumeId);
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

  const handleGenerate = async () => {
    if (!targetRole.trim()) return;
    setLoading(true);
    setError('');
    try {
      const data = await generateLearningRoadmap(targetRole, selectedResumeId || undefined, selectedReportId || undefined);
      setRoadmap(data);
    } catch (e: any) {
      setError(e.response?.data?.detail || e.message || 'Failed to generate roadmap.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight mb-2 flex items-center gap-2">
          <GraduationCap className="w-7 h-7 text-pink-400" /> Career Intelligence & Detailed Learning Planners
        </h1>
        <p className="text-sm text-muted-foreground">Synthesize your Resume, ATS evaluations, and GitHub repository analysis into high-precision weekly skill acceleration schedules.</p>
      </div>

      <GlassCard className="p-6 space-y-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-pink-500/10 flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5 text-pink-400" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-foreground">Target Role & Intelligence Source</h2>
            <p className="text-xs text-muted-foreground">Select your profile snapshot and set your aspiring career milestone</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-border/40">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
              <FileText className="w-3.5 h-3.5 text-indigo-400" /> Source Resume & ATS Feedback
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

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <Input
            placeholder="e.g. Senior Machine Learning Architect / Lead Distributed Systems Engineer"
            value={targetRole}
            onChange={(e) => setTargetRole(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
            className="flex-1"
          />
          <Button onClick={handleGenerate} disabled={loading || !targetRole.trim()} variant="brand" className="shrink-0">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Generate Detailed Planner'}
          </Button>
        </div>
      </GlassCard>

      {loading && <LoadingState rows={4} />}
      {error && <ErrorState message={error} onRetry={() => setError('')} />}

      {roadmap && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <GlassCard className="p-6 bg-gradient-to-r from-pink-500/10 via-purple-500/5 to-transparent border-pink-500/20">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-bold text-pink-400 uppercase tracking-wider">Custom Skill Architecture</span>
                <h2 className="text-2xl font-bold text-foreground mt-1">{roadmap.target_role}</h2>
                <p className="text-sm text-muted-foreground mt-1">Current Assessed Level: <span className="text-foreground font-semibold capitalize">{roadmap.current_level || 'Mid'}</span></p>
              </div>
              
              {/* Tabs */}
              <div className="flex bg-background/60 p-1 rounded-lg border border-border/60 gap-1 text-xs font-medium">
                <button
                  onClick={() => setActiveTab('weekly')}
                  className={`px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5 ${activeTab === 'weekly' ? 'bg-pink-600 text-white font-semibold shadow' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  <Calendar className="w-3.5 h-3.5" /> Detailed Weekly Planner
                </button>
                <button
                  onClick={() => setActiveTab('milestones')}
                  className={`px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5 ${activeTab === 'milestones' ? 'bg-indigo-600 text-white font-semibold shadow' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  <Layers className="w-3.5 h-3.5" /> 30/60/90 Day Milestones
                </button>
                <button
                  onClick={() => setActiveTab('resources')}
                  className={`px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5 ${activeTab === 'resources' ? 'bg-emerald-600 text-white font-semibold shadow' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  <Book className="w-3.5 h-3.5" /> Projects & Resources
                </button>
              </div>
            </div>

            {Array.isArray(roadmap.key_skills_to_acquire) && (
              <div className="mt-5 pt-4 border-t border-border/40">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">Primary Target Skills to Master:</span>
                <div className="flex flex-wrap gap-2">
                  {roadmap.key_skills_to_acquire.map((skill: any, i: number) => (
                    <Badge key={i} variant="outline" className="px-3 py-1 bg-pink-500/10 text-pink-200 border-pink-500/30 font-mono text-xs">
                      + {typeof skill === 'string' ? skill : skill.name || skill.skill || JSON.stringify(skill)}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </GlassCard>

          {/* TAB 1: Detailed Weekly Planner */}
          {activeTab === 'weekly' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
              <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                <Calendar className="w-5 h-5 text-pink-400" /> Step-by-Step Weekly Execution Plan
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Array.isArray(roadmap.weekly_planner) && roadmap.weekly_planner.length > 0 ? (
                  roadmap.weekly_planner.map((week: any, i: number) => (
                    <GlassCard key={i} className="p-5 space-y-4 hover:border-pink-500/40 transition-all flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-extrabold text-pink-400 bg-pink-500/10 px-2.5 py-1 rounded-full border border-pink-500/30">
                            WEEK {week.week_number || i + 1}
                          </span>
                        </div>
                        <h4 className="text-base font-bold text-foreground mb-3">{week.theme || 'Focused Sprint'}</h4>
                        
                        <div className="space-y-2">
                          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">Actionable Daily Study & Code Goals:</span>
                          <ul className="space-y-2">
                            {Array.isArray(week.daily_goals) && week.daily_goals.map((goal: string, j: number) => (
                              <li key={j} className="text-xs text-indigo-100 flex items-start gap-2 bg-black/30 p-2.5 rounded-lg border border-white/5">
                                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                                <span>{goal}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      {week.expected_outcome && (
                        <div className="pt-3 border-t border-border/40 mt-4">
                          <div className="flex items-start gap-2 text-xs">
                            <BookmarkCheck className="w-4 h-4 text-pink-400 shrink-0 mt-0.5" />
                            <div>
                              <span className="font-semibold text-foreground block">Expected Deliverable & Outcome:</span>
                              <p className="text-muted-foreground mt-0.5">{week.expected_outcome}</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </GlassCard>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground col-span-2 text-center py-8">Weekly breakdown will appear here for newly generated roadmaps.</p>
                )}
              </div>
            </motion.div>
          )}

          {/* TAB 2: 30/60/90 Day Milestones */}
          {activeTab === 'milestones' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
              <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                <Layers className="w-5 h-5 text-indigo-400" /> 30 / 60 / 90 Day Strategic Milestones
              </h3>
              
              <div className="space-y-4">
                {Array.isArray(roadmap.milestones) ? (
                  roadmap.milestones.map((ms: any, i: number) => (
                    <GlassCard key={i} className="p-6 space-y-4 border-indigo-500/20">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/40 pb-3">
                        <div className="flex items-center gap-3">
                          <span className="w-9 h-9 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 font-bold text-sm">
                            {i + 1}
                          </span>
                          <div>
                            <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">{ms.day_range || `Milestone ${i+1}`}</span>
                            <h4 className="text-lg font-bold text-foreground">{ms.focus_area}</h4>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Milestone Core Objectives:</span>
                        <ul className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                          {Array.isArray(ms.tasks) && ms.tasks.map((task: string, j: number) => (
                            <li key={j} className="text-sm text-muted-foreground flex items-start gap-2 bg-white/[0.02] p-3 rounded-lg border border-border/30">
                              <ChevronRight className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                              <span className="text-foreground text-xs leading-relaxed">{task}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </GlassCard>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-8">No milestones found.</p>
                )}
              </div>
            </motion.div>
          )}

          {/* TAB 3: Projects & Resources */}
          {activeTab === 'resources' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
              {/* Recommended Projects */}
              <div className="space-y-3">
                <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                  <Code className="w-5 h-5 text-emerald-400" /> Portfolio-Worthy Projects to Build
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Array.isArray(roadmap.recommended_projects) && roadmap.recommended_projects.map((p: any, i: number) => (
                    <GlassCard key={i} className="p-5 border-emerald-500/20 space-y-2 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between">
                          <h4 className="font-bold text-base text-emerald-300">{p.name}</h4>
                          {p.url && (
                            <a href={p.url} target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-emerald-400 transition-colors">
                              <ExternalLink className="w-4 h-4" />
                            </a>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed mt-2">{p.reason}</p>
                      </div>
                    </GlassCard>
                  ))}
                </div>
              </div>

              {/* Recommended Courses & Books */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                    <Book className="w-4 h-4 text-blue-400" /> Recommended Courses & Certifications
                  </h3>
                  <div className="space-y-3">
                    {[...(roadmap.recommended_courses || []), ...(roadmap.recommended_certifications || [])].map((c: any, i: number) => (
                      <GlassCard key={i} className="p-4 space-y-1.5 border-blue-500/20">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-sm text-blue-300">{c.name}</span>
                          <Badge variant="outline" className="text-[10px] capitalize bg-blue-500/10 text-blue-300">{c.type}</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">{c.reason}</p>
                      </GlassCard>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                    <Award className="w-4 h-4 text-amber-400" /> Recommended Books
                  </h3>
                  <div className="space-y-3">
                    {Array.isArray(roadmap.recommended_books) && roadmap.recommended_books.map((b: any, i: number) => (
                      <GlassCard key={i} className="p-4 space-y-1.5 border-amber-500/20">
                        <span className="font-semibold text-sm text-amber-300 block">{b.name}</span>
                        <p className="text-xs text-muted-foreground">{b.reason}</p>
                      </GlassCard>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>
      )}
    </div>
  );
}

