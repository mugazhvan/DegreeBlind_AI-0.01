import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  description?: string;
  trend?: 'up' | 'down' | 'neutral';
  className?: string;
}

export function MetricCard({ icon: Icon, label, value, description, className }: MetricCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={cn(
        'glass-card rounded-2xl p-5 group hover:border-white/10 transition-all duration-300',
        className
      )}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="p-2 rounded-lg bg-white/[0.04] border border-white/[0.06]">
          <Icon className="w-4 h-4 text-muted-foreground" />
        </div>
      </div>
      <p className="text-2xl font-bold text-foreground tracking-tight">{value}</p>
      <p className="text-xs font-medium text-muted-foreground mt-1">{label}</p>
      {description && (
        <p className="text-xs text-muted-foreground/70 mt-2">{description}</p>
      )}
    </motion.div>
  );
}
