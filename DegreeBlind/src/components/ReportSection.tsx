import type { ReactNode } from 'react';

interface Props {
  title: string;
  children: ReactNode;
}

const ReportSection = ({ title, children }: Props) => {
  return (
    <div className="mb-12">
      <h2 className="text-2xl font-bold text-gray-900 mb-6 pb-3 border-b border-white/30 drop-shadow-sm">
        {title}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {children}
      </div>
    </div>
  );
};

export default ReportSection;
