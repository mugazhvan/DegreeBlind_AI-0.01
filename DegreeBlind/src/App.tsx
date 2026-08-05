import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/query-client';
import { useAuthStore } from '@/stores/auth-store';
import { useThemeStore } from '@/stores/theme-store';

// Layouts
import { PublicLayout } from '@/layouts/public-layout';
import { AppLayout } from '@/layouts/app-layout';

// Pages
import LandingPage from '@/pages/landing';
import LoginPage from '@/pages/login';
import AuthCallback from '@/pages/auth-callback';
import DashboardPage from '@/pages/dashboard';
import GitHubPage from '@/pages/github/analyze';
import GitHubReportPage from '@/pages/github/report';
import ResumePage from '@/pages/resume';
import ResumeHistoryPage from '@/pages/resume/history';
import ATSPage from '@/pages/ats';
import CareerPage from '@/pages/career';
import JobMatchPage from '@/pages/job-match';
import LearningPage from '@/pages/learning';
import InterviewPage from '@/pages/interview';
import ReportsPage from '@/pages/reports';
import SettingsPage from '@/pages/settings';
import AboutPage from '@/pages/about';
import { LoadingState } from './components/loading-state';

function RequireAuth() {
  const { token, isLoading } = useAuthStore();

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-background"><LoadingState rows={1} /></div>;
  }

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}

export default function App() {
  const { initialize } = useAuthStore();
  const { theme } = useThemeStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    document.documentElement.classList.toggle('light', theme === 'light');
  }, [theme]);

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
          </Route>
          
          <Route path="/auth/success" element={<AuthCallback />} />

          {/* Authenticated Routes */}
          <Route element={<RequireAuth />}>
            <Route path="/app" element={<AppLayout />}>
              <Route index element={<Navigate to="/app/dashboard" replace />} />
              <Route path="dashboard" element={<DashboardPage />} />
              <Route path="github" element={<GitHubPage />} />
              <Route path="github/report" element={<GitHubReportPage />} />
              <Route path="resume" element={<ResumePage />} />
              <Route path="resumes/history" element={<ResumeHistoryPage />} />
              <Route path="ats" element={<ATSPage />} />
              <Route path="career" element={<CareerPage />} />
              <Route path="job-match" element={<JobMatchPage />} />
              <Route path="learning" element={<LearningPage />} />
              <Route path="interview" element={<InterviewPage />} />
              <Route path="reports" element={<ReportsPage />} />
              <Route path="settings" element={<SettingsPage />} />
              <Route path="about" element={<AboutPage />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
