import { Outlet, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Logo } from '@/components/logo';

export function PublicLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Minimal top bar */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-border/50">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-base font-semibold text-foreground tracking-tight">
            <Logo className="w-6 h-6" />
            DegreeBlind
          </Link>
          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Log in
            </Link>
            <Link
              to="/login"
              className="text-sm font-medium bg-foreground text-background px-4 py-1.5 rounded-lg hover:opacity-90 transition-opacity"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Content */}
      <main className="flex-1 pt-14">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <Outlet />
        </motion.div>
      </main>
    </div>
  );
}
