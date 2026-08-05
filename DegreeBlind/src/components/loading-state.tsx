import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface LoadingStateProps {
  rows?: number;
  className?: string;
}

export function LoadingState({ rows = 3, className }: LoadingStateProps) {
  return (
    <div className={cn('space-y-6 py-8', className)}>
      <div className="flex items-center gap-4">
        <Skeleton className="h-12 w-12 rounded-xl" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="space-y-3">
          <Skeleton className="h-4 w-2/5" />
          <Skeleton className="h-24 w-full rounded-xl" />
        </div>
      ))}
    </div>
  );
}
