import { GlassCard } from '@/components/ui/card';
import { User, GitBranch, Globe, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-2">
          <h1 className="text-3xl font-bold tracking-tight">About</h1>
          <span className="text-xs px-2 py-0.5 bg-indigo-500/20 text-indigo-400 rounded-full font-semibold">v0.02</span>
        </div>
        <p className="text-sm text-muted-foreground">The creator behind DegreeBlind v0.02.</p>
      </div>

      <GlassCard className="p-8">
        <div className="flex flex-col md:flex-row items-center gap-8">
          <div className="w-32 h-32 rounded-full bg-indigo-500/20 flex items-center justify-center shrink-0">
            <User className="w-16 h-16 text-indigo-400" />
          </div>
          
          <div className="text-center md:text-left">
            <h2 className="text-2xl font-bold mb-2">Mugazhvan</h2>
            <p className="text-muted-foreground mb-4">
              Creator & Developer of DegreeBlind
            </p>
            <p className="text-sm text-foreground/80 max-w-xl mb-6">
              I built DegreeBlind to help engineers showcase their true skills through open-source contributions and objective AI analysis, bypassing the traditional degree-based hiring filters. 
            </p>
            
            <div className="flex flex-wrap gap-3 justify-center md:justify-start">
              <Button variant="outline" className="gap-2">
                <GitBranch className="w-4 h-4" /> GitHub
              </Button>
              <Button variant="outline" className="gap-2">
                <Globe className="w-4 h-4" /> LinkedIn
              </Button>
              <Button variant="outline" className="gap-2">
                <Mail className="w-4 h-4" /> Contact
              </Button>
            </div>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}
