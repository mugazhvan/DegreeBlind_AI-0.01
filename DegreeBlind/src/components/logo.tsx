import { cn } from '@/lib/utils';

interface LogoProps extends React.SVGProps<SVGSVGElement> {}

export function Logo({ className, ...props }: LogoProps) {
  return (
    <svg
      viewBox="0 0 100 100"
      className={cn('w-8 h-8 text-[#2563eb]', className)}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      {/* Left upward arrow stem */}
      <path d="M30 85 L30 35 L12 35 L34 8 L56 35 L38 35 L38 48 L30 56 Z" fill="currentColor" />
      
      {/* The D curve on the right */}
      <path d="M48 35 C 80 35 90 55 90 85 L 45 85 L 75 55 C 70 45 55 42 48 42 Z" fill="currentColor" />
      
      {/* Network nodes inside the D */}
      <circle cx="58" cy="70" r="5" fill="currentColor" />
      <circle cx="68" cy="55" r="5" fill="currentColor" />
      <circle cx="58" cy="45" r="5" fill="currentColor" />
      <circle cx="78" cy="45" r="4" fill="currentColor" />
      
      {/* Network connecting lines */}
      <path d="M 34 85 L 68 55 M 58 70 L 58 45 M 68 55 L 78 45" stroke="currentColor" strokeWidth="3" />
    </svg>
  );
}
