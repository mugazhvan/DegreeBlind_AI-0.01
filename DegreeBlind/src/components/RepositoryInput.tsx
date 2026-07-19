import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';

const RepositoryInput = () => {
  const [url, setUrl] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url.trim()) {
      navigate('/analysis', { state: { repoUrl: url.trim() } });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-8 max-w-xl mx-auto">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500 transition-colors group-focus-within:text-blue-500" />
          <input
            type="url"
            className="w-full rounded-2xl border border-white/40 bg-white/40 backdrop-blur-md pl-12 pr-4 py-4 text-base text-gray-800 placeholder-gray-500 shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)] focus:bg-white/60 focus:border-white/60 focus:ring-4 focus:ring-white/30 outline-none transition-all duration-300"
            placeholder="https://github.com/owner/repository"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            required
          />
        </div>
        <button
          type="submit"
          className="rounded-2xl bg-white/20 backdrop-blur-md border border-white/40 px-8 py-4 text-base font-semibold text-gray-800 shadow-lg hover:bg-white/40 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 focus:outline-none focus:ring-4 focus:ring-white/30 transition-all duration-300"
        >
          Analyse Repository
        </button>
      </div>
    </form>
  );
};

export default RepositoryInput;
