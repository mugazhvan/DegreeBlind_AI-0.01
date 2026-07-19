const About = () => {
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-gray-900 via-gray-700 to-gray-900 tracking-tight mb-8 drop-shadow-sm">About Analyser AI</h1>

      <div className="glass-panel rounded-2xl p-8 mb-6 transform hover:-translate-y-1 transition-all duration-300">
        <p className="text-gray-800 text-base leading-relaxed mb-4 font-medium">
          Analyser AI is a student project that aims to help recruiters understand a
          developer's coding skills by analyzing public GitHub repositories instead of
          relying only on academic degrees.
        </p>
        <p className="text-gray-800 text-base leading-relaxed mb-4 font-medium">
          The idea is simple: instead of filtering candidates by their college or
          degree, let the code speak for itself. By examining a developer's actual
          projects, we can get a much better picture of their real-world abilities.
        </p>
        <p className="text-gray-600 text-sm leading-relaxed italic">
          This project is currently a frontend prototype. The AI backend has not been
          connected yet. All analysis sections will show placeholder messages until the
          backend is ready.
        </p>
      </div>

      <div className="glass-panel rounded-2xl p-8 mb-6 transform hover:-translate-y-1 transition-all duration-300">
        <h2 className="text-xl font-bold text-gray-900 mb-4 drop-shadow-sm">How it works (planned)</h2>
        <ol className="list-decimal list-inside space-y-3 text-gray-800 text-base font-medium">
          <li>Enter a public GitHub repository URL</li>
          <li>The system fetches repository metadata from GitHub</li>
          <li>An AI backend analyzes the code structure, quality, and patterns</li>
          <li>A detailed report is generated with skill scores and recommendations</li>
        </ol>
      </div>

      <div className="glass-panel rounded-2xl p-8 transform hover:-translate-y-1 transition-all duration-300">
        <h2 className="text-xl font-bold text-gray-900 mb-4 drop-shadow-sm">Tech Stack</h2>
        <div className="flex flex-wrap gap-3">
          {['React', 'TypeScript', 'Vite', 'Tailwind CSS', 'React Router'].map((tech) => (
            <span
              key={tech}
              className="inline-block bg-white/40 text-gray-900 text-sm font-semibold px-4 py-2 rounded-xl border border-white/50 shadow-sm hover:bg-white/60 transition-colors"
            >
              {tech}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default About;
