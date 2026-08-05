import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Loader2, FileCheck, AlertCircle, Calendar, Trash2, Edit3, Target, Search, Save, X, Check } from 'lucide-react';
import { GlassCard } from '@/components/ui/card';
import { LoadingState } from '@/components/loading-state';
import { EmptyState } from '@/components/empty-state';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { getUserResumes, deleteResume, getParsedResume, updateResume } from '@/services/api';
import { useNavigate } from 'react-router-dom';

export default function ResumeHistoryPage() {
  const [resumes, setResumes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<{ [id: number]: 'view' | 'edit' | null }>({});
  const [parsedData, setParsedData] = useState<{ [id: number]: any }>({});
  const [editFilename, setEditFilename] = useState<{ [id: number]: string }>({});
  const [editJsonStr, setEditJsonStr] = useState<{ [id: number]: string }>({});
  const [saving, setSaving] = useState<{ [id: number]: boolean }>({});
  const [successMsg, setSuccessMsg] = useState<{ [id: number]: boolean }>({});
  
  const navigate = useNavigate();

  useEffect(() => {
    fetchResumes();
  }, []);

  const fetchResumes = async () => {
    try {
      const data = await getUserResumes();
      setResumes(data);
    } catch {
      // handle error
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteResume(id);
      setResumes(resumes.filter(r => r.id !== id));
    } catch (e) {
      console.error(e);
    }
  };

  const handleToggleEdit = async (id: number, resumeFilename: string) => {
    const current = activeTab[id];
    if (current === 'edit') {
      setActiveTab({ ...activeTab, [id]: null });
      return;
    }
    setActiveTab({ ...activeTab, [id]: 'edit' });
    setEditFilename({ ...editFilename, [id]: resumeFilename });
    if (!parsedData[id]) {
      try {
        const data = await getParsedResume(id);
        setParsedData({ ...parsedData, [id]: data });
        setEditJsonStr({ ...editJsonStr, [id]: JSON.stringify(data, null, 2) });
      } catch (e) {
        console.error(e);
        setEditJsonStr({ ...editJsonStr, [id]: '{}' });
      }
    } else {
      setEditJsonStr({ ...editJsonStr, [id]: JSON.stringify(parsedData[id], null, 2) });
    }
  };

  const handleSave = async (id: number) => {
    setSaving({ ...saving, [id]: true });
    try {
      let parsedJson = undefined;
      if (editJsonStr[id]) {
        try {
          parsedJson = JSON.parse(editJsonStr[id]);
        } catch {
          alert('Invalid JSON formatting.');
          setSaving({ ...saving, [id]: false });
          return;
        }
      }
      const updated = await updateResume(id, {
        filename: editFilename[id],
        parsed_json: parsedJson
      });
      setResumes(resumes.map(r => r.id === id ? { ...r, filename: updated.filename || r.filename } : r));
      if (parsedJson) setParsedData({ ...parsedData, [id]: parsedJson });
      setSuccessMsg({ ...successMsg, [id]: true });
      setTimeout(() => setSuccessMsg({ ...successMsg, [id]: false }), 2500);
      setActiveTab({ ...activeTab, [id]: null });
    } catch (e) {
      console.error(e);
      alert('Failed to save updates.');
    } finally {
      setSaving({ ...saving, [id]: false });
    }
  };

  if (loading) {
    return <div className="max-w-5xl mx-auto"><LoadingState rows={4} /></div>;
  }

  if (resumes.length === 0) {
    return (
      <EmptyState
        icon={FileText}
        title="No resumes found"
        description="You haven't uploaded any resumes yet."
        action={{ label: 'Upload Resume', onClick: () => navigate('/app/resume') }}
      />
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight mb-1">Resume Management Center</h1>
          <p className="text-sm text-muted-foreground">Keep tabs on your resume history, customize parsed metadata, and launch intelligence evaluations.</p>
        </div>
        <Button variant="brand" onClick={() => navigate('/app/resume')}>
          + Upload New Resume
        </Button>
      </div>

      <div className="grid gap-4">
        <AnimatePresence>
          {resumes.map((r, i) => {
            const date = new Date(r.uploaded_at).toLocaleDateString();
            const isOpen = activeTab[r.id] === 'edit';

            return (
              <motion.div
                key={r.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: i * 0.04 }}
              >
                <GlassCard className="p-6 space-y-4">
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center shrink-0">
                        <FileText className="w-6 h-6 text-indigo-400" />
                      </div>
                      <div>
                        <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
                          {r.filename}
                        </h3>
                        <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {date}</span>
                          {r.status === 'completed' && <span className="flex items-center gap-1 text-emerald-400"><FileCheck className="w-3.5 h-3.5" /> Parsed & Ready</span>}
                          {r.status === 'failed' && <span className="flex items-center gap-1 text-destructive"><AlertCircle className="w-3.5 h-3.5" /> Failed</span>}
                          {r.status === 'pending' && <span className="flex items-center gap-1 text-warning"><Loader2 className="w-3.5 h-3.5 animate-spin" /> Processing</span>}
                          {successMsg[r.id] && <span className="flex items-center gap-1 text-emerald-400 font-medium animate-pulse"><Check className="w-3 h-3" /> Saved!</span>}
                        </div>
                        {r.error_message && (
                          <p className="text-xs text-destructive mt-1.5">{r.error_message}</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end">
                      {r.status === 'completed' && (
                        <>
                          <Button 
                            variant="default" 
                            size="sm" 
                            className="bg-orange-600/80 hover:bg-orange-600 gap-1.5 text-xs"
                            onClick={() => navigate(`/app/ats?resume_id=${r.id}`)}
                          >
                            <Target className="w-3.5 h-3.5" /> ATS Scorer
                          </Button>
                          <Button 
                            variant="default" 
                            size="sm" 
                            className="bg-blue-600/80 hover:bg-blue-600 gap-1.5 text-xs"
                            onClick={() => navigate(`/app/job-match?resume_id=${r.id}`)}
                          >
                            <Search className="w-3.5 h-3.5" /> Job Match
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleToggleEdit(r.id, r.filename)} className="gap-1.5 text-xs">
                            {isOpen ? <X className="w-3.5 h-3.5" /> : <Edit3 className="w-3.5 h-3.5" />} {isOpen ? 'Close Editor' : 'Edit Resume'}
                          </Button>
                        </>
                      )}
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(r.id)} className="text-destructive hover:text-destructive hover:bg-destructive/10">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Expandable Edit Drawer */}
                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="pt-4 border-t border-border/50 space-y-4 overflow-hidden"
                      >
                        <div className="space-y-2">
                          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Resume Name / Title</label>
                          <Input
                            value={editFilename[r.id] || ''}
                            onChange={(e) => setEditFilename({ ...editFilename, [r.id]: e.target.value })}
                            placeholder="e.g., Senior Software Engineer Resume 2026.pdf"
                            className="max-w-md"
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Extracted & Parsed Content (JSON)</label>
                          <p className="text-xs text-muted-foreground mb-1">Customize skills, summary, or work history below. This customized profile will feed into ATS Scoring and Job Matching!</p>
                          <Textarea
                            value={editJsonStr[r.id] || ''}
                            onChange={(e) => setEditJsonStr({ ...editJsonStr, [r.id]: e.target.value })}
                            rows={10}
                            className="font-mono text-xs bg-black/40 text-indigo-200/90 leading-relaxed"
                          />
                        </div>

                        <div className="flex justify-end gap-2 pt-2">
                          <Button variant="ghost" size="sm" onClick={() => setActiveTab({ ...activeTab, [r.id]: null })}>
                            Cancel
                          </Button>
                          <Button variant="brand" size="sm" onClick={() => handleSave(r.id)} disabled={saving[r.id]} className="gap-2">
                            {saving[r.id] ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                            Save Changes
                          </Button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </GlassCard>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}

