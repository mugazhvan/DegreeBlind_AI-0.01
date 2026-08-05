import { useCallback, useState } from 'react';
import { Upload, FileText, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface UploadAreaProps {
  onFileSelect: (file: File) => void;
  accept?: string;
  maxSizeMB?: number;
  className?: string;
  disabled?: boolean;
}

export function UploadArea({ onFileSelect, accept = '.pdf,.doc,.docx,.png,.jpg,.jpeg', maxSizeMB = 5, className, disabled }: UploadAreaProps) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true);
    if (e.type === 'dragleave') setDragActive(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      setSelectedFile(file);
      onFileSelect(file);
    }
  }, [onFileSelect]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      onFileSelect(file);
    }
  };

  const clearFile = () => setSelectedFile(null);

  return (
    <div className={cn('relative', className)}>
      <AnimatePresence mode="wait">
        {selectedFile ? (
          <motion.div
            key="file"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="glass-card rounded-2xl p-6 flex items-center gap-4"
          >
            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center">
              <FileText className="w-6 h-6 text-indigo-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{selectedFile.name}</p>
              <p className="text-xs text-muted-foreground">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
            </div>
            <button
              onClick={clearFile}
              className="p-2 rounded-lg hover:bg-muted transition-colors"
            >
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          </motion.div>
        ) : (
          <motion.label
            key="upload"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={cn(
              'flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-10 cursor-pointer transition-all duration-200',
              dragActive
                ? 'border-indigo-500/50 bg-indigo-500/5'
                : 'border-border hover:border-muted-foreground/30 hover:bg-muted/30',
              disabled && 'opacity-50 cursor-not-allowed'
            )}
          >
            <input
              type="file"
              accept={accept}
              onChange={handleChange}
              className="hidden"
              disabled={disabled}
            />
            <div className="w-12 h-12 rounded-2xl bg-muted/50 flex items-center justify-center mb-4">
              <Upload className="w-5 h-5 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium text-foreground mb-1">
              Drop your file here, or <span className="text-indigo-400">browse</span>
            </p>
            <p className="text-xs text-muted-foreground">
              PDF, DOCX, or Image (PNG/JPG) up to {maxSizeMB}MB
            </p>
          </motion.label>
        )}
      </AnimatePresence>
    </div>
  );
}
