import { useAuthStore } from '@/stores/auth-store';
import { useThemeStore } from '@/stores/theme-store';
import { GlassCard } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Monitor, Moon, Sun, User, GitBranch } from 'lucide-react';
import { Switch } from '@/components/ui/switch';

export default function SettingsPage() {
  const user = useAuthStore(s => s.user);
  const { theme, toggle } = useThemeStore();

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight mb-2">Settings</h1>
        <p className="text-sm text-muted-foreground">Manage your account settings and preferences.</p>
      </div>

      <GlassCard className="p-6 space-y-6">
        <div>
          <h2 className="text-sm font-semibold mb-4 flex items-center gap-2"><User className="w-4 h-4 text-indigo-400" /> Profile</h2>
          <div className="flex items-center gap-4 p-4 rounded-xl bg-white/[0.02] border border-white/[0.05]">
            <img src={user?.avatar_url} alt={user?.name} className="w-16 h-16 rounded-full border-2 border-border" />
            <div>
              <h3 className="text-lg font-medium">{user?.name}</h3>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="secondary" className="flex items-center gap-1">
                  <GitBranch className="w-3 h-3" /> {user?.provider}
                </Badge>
              </div>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-sm font-semibold mb-4 flex items-center gap-2"><Monitor className="w-4 h-4 text-indigo-400" /> Preferences</h2>
          <div className="flex items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-white/[0.05]">
            <div>
              <h3 className="text-sm font-medium">Dark Mode</h3>
              <p className="text-xs text-muted-foreground">Toggle between light and dark themes</p>
            </div>
            <div className="flex items-center gap-3">
              <Sun className="w-4 h-4 text-muted-foreground" />
              <Switch checked={theme === 'dark'} onCheckedChange={toggle} />
              <Moon className="w-4 h-4 text-muted-foreground" />
            </div>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}
