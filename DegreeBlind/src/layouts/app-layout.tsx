import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '@/stores/auth-store';
import { useSidebarStore } from '@/stores/sidebar-store';
import { useThemeStore } from '@/stores/theme-store';
import {
  LayoutDashboard, GitBranch, FileText, Target, Briefcase, Search, GraduationCap,
  MessageSquare, BarChart3, Settings, LogOut, PanelLeftClose, PanelLeft, Moon, Sun, ChevronRight, Info
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Logo } from '@/components/logo';

const navItems = [
  { to: '/app/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/app/github', label: 'GitHub', icon: GitBranch },
  { to: '/app/resume', label: 'Resume', icon: FileText },
  { to: '/app/resumes/history', label: 'My Resumes', icon: FileText },
  { to: '/app/ats', label: 'ATS', icon: Target },
  { to: '/app/career', label: 'Career', icon: Briefcase },
  { to: '/app/job-match', label: 'Job Match', icon: Search },
  { to: '/app/learning', label: 'Learning', icon: GraduationCap },
  { to: '/app/interview', label: 'Interview', icon: MessageSquare },
  { to: '/app/reports', label: 'Reports', icon: BarChart3 },
  { to: '/app/about', label: 'About', icon: Info },
];

function SidebarLink({ to, label, icon: Icon, collapsed }: { to: string; label: string; icon: any; collapsed: boolean }) {
  const location = useLocation();
  const isActive = location.pathname === to || location.pathname.startsWith(to + '/');

  return (
    <Link
      to={to}
      className={cn(
        'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150',
        isActive
          ? 'bg-white/[0.06] text-foreground'
          : 'text-sidebar-foreground hover:text-foreground hover:bg-white/[0.04]',
        collapsed && 'justify-center px-2'
      )}
      title={collapsed ? label : undefined}
    >
      <Icon className="w-4 h-4 shrink-0" />
      {!collapsed && <span>{label}</span>}
    </Link>
  );
}

export function AppLayout() {
  const { user, logout } = useAuthStore();
  const { collapsed, toggle } = useSidebarStore();
  const { theme, toggle: toggleTheme } = useThemeStore();
  const navigate = useNavigate();
  const location = useLocation();

  // Get breadcrumb from path
  const pathParts = location.pathname.replace('/app/', '').split('/');
  const breadcrumb = pathParts.map(p => p.charAt(0).toUpperCase() + p.slice(1).replace('-', ' '));

  return (
    <div className="min-h-screen flex bg-background">
      {/* Sidebar */}
      <motion.aside
        animate={{ width: collapsed ? 64 : 240 }}
        transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
        className="fixed top-0 left-0 bottom-0 z-40 flex flex-col bg-sidebar border-r border-border overflow-hidden"
      >
        {/* Logo area */}
        <div className={cn('h-14 flex items-center px-4 border-b border-border shrink-0', collapsed && 'justify-center')}>
          <Link to="/app/dashboard" className="flex items-center gap-2">
            <Logo className="w-7 h-7" />
            {!collapsed && (
              <span className="text-sm font-semibold text-foreground tracking-tight">DegreeBlind</span>
            )}
          </Link>
        </div>

        {/* Nav items */}
        <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
          {navItems.map((item) => (
            <SidebarLink key={item.to} {...item} collapsed={collapsed} />
          ))}
        </nav>

        {/* Bottom */}
        <div className="px-3 py-3 border-t border-border space-y-0.5 shrink-0">
          <SidebarLink to="/app/settings" label="Settings" icon={Settings} collapsed={collapsed} />
          <button
            onClick={() => { logout(); navigate('/'); }}
            className={cn(
              'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-sidebar-foreground hover:text-destructive hover:bg-destructive/5 transition-all duration-150 w-full',
              collapsed && 'justify-center px-2'
            )}
          >
            <LogOut className="w-4 h-4 shrink-0" />
            {!collapsed && <span>Log out</span>}
          </button>
        </div>
      </motion.aside>

      {/* Main area */}
      <div
        className="flex-1 flex flex-col transition-all duration-200"
        style={{ marginLeft: collapsed ? 64 : 240 }}
      >
        {/* Top bar */}
        <header className="h-14 border-b border-border flex items-center justify-between px-6 shrink-0 sticky top-0 bg-background/80 backdrop-blur-xl z-30">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={toggle} className="w-8 h-8">
              {collapsed ? <PanelLeft className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
            </Button>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              {breadcrumb.map((part, i) => (
                <span key={i} className="flex items-center gap-1">
                  {i > 0 && <ChevronRight className="w-3 h-3" />}
                  <span className={i === breadcrumb.length - 1 ? 'text-foreground font-medium' : ''}>{part}</span>
                </span>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={toggleTheme} className="w-8 h-8">
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </Button>
            {user && (
              <div className="flex items-center gap-2">
                <img
                  src={user.avatar_url}
                  alt={user.name}
                  className="w-7 h-7 rounded-full border border-border"
                />
                <span className="text-sm font-medium text-foreground hidden md:block">{user.name}</span>
              </div>
            )}
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-6 overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
              className="max-w-6xl mx-auto"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
