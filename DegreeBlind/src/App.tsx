import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Dashboard from './pages/Dashboard';
import AnalysisPage from './pages/AnalysisPage';
import ReportPage from './pages/ReportPage';
import About from './pages/About';

import { AuthProvider } from './contexts/AuthContext';
import AuthCallback from './pages/AuthCallback';
import ReportsHistoryPage from './pages/ReportsHistoryPage';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen flex flex-col">
          <Navbar />
          <main className="flex-grow">
          <Routes>
            {/* Dashboard and Analyse are the same page */}
            <Route path="/" element={<Dashboard />} />
            {/* Analysis loading screen (navigated to programmatically from Dashboard) */}
            <Route path="/analysis" element={<AnalysisPage />} />
            <Route path="/reports" element={<ReportsHistoryPage />} />
            <Route path="/report" element={<ReportPage />} />
            <Route path="/about" element={<About />} />
            <Route path="/auth/success" element={<AuthCallback />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  </AuthProvider>
  );
}

export default App;
