const Footer = () => {
  return (
    <footer className="border-t border-[#e5e5ea] mt-16 py-6 bg-white/60">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <p className="text-xs text-[#86868b]">
          &copy; {new Date().getFullYear()} Analyser AI &mdash; Student Project
        </p>
      </div>
    </footer>
  );
};

export default Footer;
