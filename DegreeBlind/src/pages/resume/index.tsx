import { useState } from 'react';
import { motion } from 'framer-motion';
import { UploadArea } from '@/components/upload-area';
import { GlassCard } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LoadingState } from '@/components/loading-state';
import { ErrorState } from '@/components/error-state';
import { uploadResume, getResumeStatus, getParsedResume } from '@/services/api';
import { FileText, Briefcase, GraduationCap, Code, Clock, CheckCircle, Loader2, Copy, Check, Sparkles, Target, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ResumePage() {
  const [status, setStatus] = useState<'idle' | 'uploading' | 'processing' | 'completed' | 'error'>('idle');
  const [parsed, setParsed] = useState<any>(null);
  const [currentResumeId, setCurrentResumeId] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const handleUpload = async (file: File) => {
    setStatus('uploading');
    setError('');
    try {
      const { resume_id } = await uploadResume(file);
      setCurrentResumeId(resume_id);
      setStatus('processing');

      // Poll
      while (true) {
        await new Promise((r) => setTimeout(r, 2000));
        const s = await getResumeStatus(resume_id);
        if (s.status === 'completed') {
          const data = await getParsedResume(resume_id);
          setParsed(data.parsed_data || data);
          setStatus('completed');
          return;
        }
        if (s.status === 'failed') {
          setError('Resume parsing failed. Please try a different file.');
          setStatus('error');
          return;
        }
      }
    } catch (e: any) {
      setError(e.message || 'Upload failed.');
      setStatus('error');
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(parsed, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight mb-2">Resume Intelligence</h1>
        <p className="text-sm text-muted-foreground">Upload your resume to extract and analyze your professional profile.</p>
      </div>

      <UploadArea onFileSelect={handleUpload} disabled={status === 'uploading' || status === 'processing'} />

      {(status === 'uploading' || status === 'processing') && (
        <GlassCard className="p-6">
          <div className="flex items-center gap-3">
            <Loader2 className="w-5 h-5 animate-spin text-indigo-400" />
            <div>
              <p className="text-sm font-medium text-foreground">{status === 'uploading' ? 'Uploading...' : 'AI is parsing your resume...'}</p>
              <p className="text-xs text-muted-foreground">This usually takes 15-30 seconds.</p>
            </div>
          </div>
        </GlassCard>
      )}

      {status === 'error' && <ErrorState message={error} onRetry={() => setStatus('idle')} />}

      {status === 'completed' && parsed && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-success" />
              <span className="text-sm font-medium text-success">Successfully parsed</span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button 
                variant="default" 
                size="sm" 
                className="bg-orange-600/80 hover:bg-orange-600 gap-2"
                onClick={() => window.location.href = `/app/ats?resume_id=${currentResumeId}`}
              >
                <Target className="w-4 h-4" />
                Evaluate in ATS
              </Button>
              <Button 
                variant="default" 
                size="sm" 
                className="bg-blue-600/80 hover:bg-blue-600 gap-2"
                onClick={() => window.location.href = `/app/job-match?resume_id=${currentResumeId}`}
              >
                <Search className="w-4 h-4" />
                Match Jobs
              </Button>
              <Button variant="ghost" size="sm" onClick={handleCopy}>
                {copied ? <Check className="w-3 h-3 mr-1" /> : <Copy className="w-3 h-3 mr-1" />}
                {copied ? 'Copied' : 'Copy'}
              </Button>
            </div>
          </div>

          {/* Skills */}
          {Array.isArray(parsed.skills) && parsed.skills.length > 0 && (
            <GlassCard className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Code className="w-4 h-4 text-muted-foreground" />
                <h3 className="text-sm font-semibold">Skills</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {parsed.skills.map((s: any, i: number) => {
                  if (typeof s === 'string') return <Badge key={i} variant="secondary">{s}</Badge>;
                  if (typeof s === 'object' && s !== null) {
                    if (Array.isArray(s.skills)) {
                      return (
                        <div key={i} className="w-full mb-2 last:mb-0">
                          {s.category && <h4 className="text-xs font-semibold mb-2 text-indigo-400/80">{s.category}</h4>}
                          <div className="flex flex-wrap gap-2">
                            {s.skills.map((skill: any, j: number) => (
                              <Badge key={`${i}-${j}`} variant="secondary">{typeof skill === 'string' ? skill : JSON.stringify(skill)}</Badge>
                            ))}
                          </div>
                        </div>
                      );
                    }
                    return <Badge key={i} variant="secondary">{s.name || s.skill || 'Unknown Skill'}</Badge>;
                  }
                  return null;
                })}
              </div>
            </GlassCard>
          )}

          {/* Experience */}
          {Array.isArray(parsed.experience) && parsed.experience.length > 0 && (
            <GlassCard className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Briefcase className="w-4 h-4 text-muted-foreground" />
                <h3 className="text-sm font-semibold">Experience</h3>
              </div>
              <div className="space-y-4">
                {parsed.experience.map((exp: any, i: number) => (
                  <div key={i} className="border-l-2 border-border pl-4 py-1">
                    <p className="text-sm font-medium text-foreground">{typeof exp === 'string' ? exp : (exp.title || exp.role || exp.name || 'Unknown Role')}</p>
                    {exp.company && <p className="text-xs text-muted-foreground">{typeof exp.company === 'string' ? exp.company : JSON.stringify(exp.company)}</p>}
                    {exp.duration && <p className="text-xs text-muted-foreground flex items-center gap-1"><Clock className="w-3 h-3" />{typeof exp.duration === 'string' ? exp.duration : JSON.stringify(exp.duration)}</p>}
                    {exp.description && <p className="text-xs text-muted-foreground mt-1">{typeof exp.description === 'string' ? exp.description : JSON.stringify(exp.description)}</p>}
                  </div>
                ))}
              </div>
            </GlassCard>
          )}

          {/* Education */}
          {Array.isArray(parsed.education) && parsed.education.length > 0 && (
            <GlassCard className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <GraduationCap className="w-4 h-4 text-muted-foreground" />
                <h3 className="text-sm font-semibold">Education</h3>
              </div>
              <div className="space-y-3">
                {parsed.education.map((edu: any, i: number) => (
                  <div key={i} className="border-l-2 border-border pl-4 py-1">
                    <p className="text-sm font-medium text-foreground">{typeof edu === 'string' ? edu : (edu.degree || edu.name || 'Unknown Degree')}</p>
                    {edu.institution && <p className="text-xs text-muted-foreground">{typeof edu.institution === 'string' ? edu.institution : JSON.stringify(edu.institution)}</p>}
                    {edu.year && <p className="text-xs text-muted-foreground">{typeof edu.year === 'string' ? edu.year : JSON.stringify(edu.year)}</p>}
                  </div>
                ))}
              </div>
            </GlassCard>
          )}

          {/* Projects */}
          {Array.isArray(parsed.projects) && parsed.projects.length > 0 && (
            <GlassCard className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <FileText className="w-4 h-4 text-muted-foreground" />
                <h3 className="text-sm font-semibold">Projects</h3>
              </div>
              <div className="space-y-3">
                {parsed.projects.map((proj: any, i: number) => (
                  <div key={i} className="border-l-2 border-border pl-4 py-1">
                    <p className="text-sm font-medium text-foreground">{typeof proj === 'string' ? proj : (proj.name || proj.title || 'Unknown Project')}</p>
                    {proj.description && <p className="text-xs text-muted-foreground mt-1">{typeof proj.description === 'string' ? proj.description : JSON.stringify(proj.description)}</p>}
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
