import { motion } from 'framer-motion';
import { GitBranch } from 'lucide-react';
import { Button } from '@/components/ui/button';

const API_BASE = 'http://127.0.0.1:8000/api/v1';

function GoogleIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-[calc(100vh-56px)] flex items-center justify-center px-6 relative">
      {/* Background */}
      <div className="absolute inset-0 bg-dot-grid opacity-30" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-radial from-indigo-500/[0.05] to-transparent rounded-full blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
        className="relative z-10 w-full max-w-sm"
      >
        <div className="glass-card rounded-2xl p-8">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-lg font-bold mb-4">
              D
            </div>
            <h1 className="text-xl font-semibold text-foreground tracking-tight">Welcome back</h1>
            <p className="text-sm text-muted-foreground mt-1">Sign in to continue to DegreeBlind</p>
          </div>

          {/* Auth buttons */}
          <div className="space-y-3">
            <Button
              asChild
              variant="outline"
              size="lg"
              className="w-full justify-center gap-3 h-12 rounded-xl"
            >
              <a href={`${API_BASE}/auth/github/login`}>
                <GitBranch className="w-4 h-4" />
                Continue with GitHub
              </a>
            </Button>

            <Button
              asChild
              variant="outline"
              size="lg"
              className="w-full justify-center gap-3 h-12 rounded-xl"
            >
              <a href={`${API_BASE}/auth/google/login`}>
                <GoogleIcon />
                Continue with Google
              </a>
            </Button>
          </div>

          {/* Divider */}
          <div className="mt-8 text-center">
            <p className="text-xs text-muted-foreground">
              By continuing, you agree to our Terms of Service.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
