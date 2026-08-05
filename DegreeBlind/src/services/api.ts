import axios from 'axios';
import type { FullReport } from '@/types';

const API_BASE_URL = 'http://127.0.0.1:8000/api/v1';

// ─── Axios Instance ───
export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 300000, // 5 min for LLM calls
  headers: { 'Content-Type': 'application/json' },
});

// Auth interceptor
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ─── Auth ───
export const getMe = async (token?: string) => {
  const res = await api.get('/auth/me', {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  return res.data;
};

// ─── Dashboard Stats ───
export const getDashboardStats = async () => {
  const res = await api.get('/stats/dashboard');
  return res.data;
};

// ─── Reports ───
export const getReportHistory = async () => {
  const res = await api.get('/reports/history');
  return res.data;
};

export const deleteReport = async (analysisId: number) => {
  await api.delete(`/reports/${analysisId}`);
};

// ─── GitHub Analysis ───
export const startAnalysis = async (repoUrl: string) => {
  const res = await api.post('/analysis/analyze', { repo_url: repoUrl });
  return res.data; // { analysis_id }
};

export const pollAnalysisStatus = async (analysisId: number) => {
  const res = await api.get(`/analysis/${analysisId}/status`);
  return res.data; // { status, report?, error? }
};

export const analyzeRepository = async (repoUrl: string): Promise<FullReport | null> => {
  try {
    const { analysis_id } = await startAnalysis(repoUrl);

    while (true) {
      await new Promise(resolve => setTimeout(resolve, 3000));
      const statusData = await pollAnalysisStatus(analysis_id);

      if (statusData.status === 'completed') return statusData.report;
      if (statusData.status === 'failed') return null;
    }
  } catch {
    return null;
  }
};

// ─── Resume ───
export const getUserResumes = async () => {
  const res = await api.get('/resumes/');
  return res.data;
};

export const uploadResume = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  const res = await api.post('/resumes/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
};

export const getResumeStatus = async (resumeId: number) => {
  const res = await api.get(`/resumes/${resumeId}/status`);
  return res.data;
};

export const getParsedResume = async (resumeId: number) => {
  const res = await api.get(`/resumes/${resumeId}`);
  return res.data;
};

export const deleteResume = async (resumeId: number) => {
  await api.delete(`/resumes/${resumeId}`);
};

export const generateResume = async (targetRole: string, theme: string = 'modern') => {
  const res = await api.post('/resumes/generate', { target_role: targetRole, theme });
  return res.data;
};

export const updateResume = async (resumeId: number, data: { filename?: string; parsed_json?: any }) => {
  const res = await api.patch(`/resumes/${resumeId}`, data);
  return res.data;
};

// ─── ATS ───
export const scoreResumeATS = async (resumeId: number, jobDescription: string = '') => {
  const res = await api.post('/ats/score', { resume_id: resumeId, job_description: jobDescription });
  return res.data;
};

export const getATSScore = async (scoreId: number) => {
  const res = await api.get(`/ats/${scoreId}`);
  return res.data;
};

// ─── Cross-Reference ───
export const triggerCrossReference = async (resumeId?: number | null) => {
  const res = await api.post('/crossref/analyze', resumeId ? { resume_id: resumeId } : {});
  return res.data;
};

export const getLatestCrossRef = async () => {
  const res = await api.get('/crossref/latest');
  return res.data;
};

// ─── Career Intelligence ───
export const generateCareerIntelligence = async () => {
  const res = await api.post('/career/generate');
  return res.data;
};

export const getLatestCareerIntelligence = async () => {
  const res = await api.get('/career/latest');
  return res.data;
};

// ─── Job Match ───
export const analyzeJobMatch = async (jobTitle: string, jobDescription: string, resumeId?: number | string, githubReportId?: number | string) => {
  const payload: any = { job_title: jobTitle, job_description: jobDescription };
  if (resumeId) payload.resume_id = Number(resumeId);
  if (githubReportId) payload.github_report_id = Number(githubReportId);
  const res = await api.post('/job-match/analyze', payload);
  return res.data;
};

export const getJobMatchHistory = async (limit: number = 10) => {
  const res = await api.get(`/job-match/history?limit=${limit}`);
  return res.data;
};

// ─── Learning Roadmap ───
export const generateLearningRoadmap = async (targetRole: string, resumeId?: number | string, githubReportId?: number | string) => {
  const payload: any = { target_role: targetRole };
  if (resumeId) payload.resume_id = Number(resumeId);
  if (githubReportId) payload.github_report_id = Number(githubReportId);
  const res = await api.post('/learning/generate', payload);
  return res.data;
};

export const getLearningHistory = async (limit: number = 5) => {
  const res = await api.get(`/learning/history?limit=${limit}`);
  return res.data;
};

// ─── Interview ───
export const startInterview = async (interviewType: string, targetRole?: string) => {
  const res = await api.post('/interview/start', { interview_type: interviewType, target_role: targetRole });
  return res.data;
};

export const submitInterviewAnswer = async (questionId: number, answerText: string) => {
  const res = await api.post(`/interview/question/${questionId}/answer`, { answer_text: answerText });
  return res.data;
};

export const completeInterview = async (sessionId: number) => {
  const res = await api.post(`/interview/session/${sessionId}/complete`);
  return res.data;
};
