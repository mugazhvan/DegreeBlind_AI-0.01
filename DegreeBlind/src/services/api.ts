// API service functions for Analyser AI
import type { FullReport } from '../types';

const API_BASE_URL = 'http://localhost:8000/api/v1';

export const getAuthHeaders = (token?: string | null) => {
  const t = token || localStorage.getItem('token');
  return t ? { 'Authorization': `Bearer ${t}` } : {};
};

export const getMe = async (token: string) => {
  const res = await fetch(`${API_BASE_URL}/auth/me`, {
    headers: { ...getAuthHeaders(token) }
  });
  if (!res.ok) return null;
  return res.json();
};

export const getDashboardStats = async () => {
  const res = await fetch(`${API_BASE_URL}/stats/dashboard`);
  if (!res.ok) return null;
  return res.json();
};

export const getReportHistory = async (token?: string | null) => {
  const res = await fetch(`${API_BASE_URL}/reports/history`, {
    headers: { ...getAuthHeaders(token) }
  });
  if (!res.ok) return [];
  return res.json();
};

export const analyzeRepository = async (repoUrl: string): Promise<FullReport | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}/analysis/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      },
      body: JSON.stringify({ repo_url: repoUrl }),
    });

    if (!response.ok) {
      console.error('Failed to analyze repository:', await response.text());
      return null;
    }

    const data: FullReport = await response.json();
    return data;
  } catch (error) {
    console.error('Error during analysis:', error);
    return null;
  }
};
