import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, GitBranch, FileText, Brain, Target, Briefcase, Search, GraduationCap, MessageSquare, Sparkles, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: [0.4, 0, 0.2, 1] },
};

const stagger = {
  animate: { transition: { staggerChildren: 0.1 } },
};

const steps = [
  { num: '01', title: 'Analyze GitHub', description: 'We scan your repositories to understand your real engineering skills.', icon: GitBranch },
  { num: '02', title: 'Upload Resume', description: 'Our AI parses your resume to extract skills, experience, and education.', icon: FileText },
  { num: '03', title: 'Receive AI Report', description: 'Get a comprehensive career intelligence report powered by AI.', icon: Brain },
];

const features = [
  { title: 'Engineering Intelligence', description: 'Deep analysis of your GitHub repositories.', icon: GitBranch },
  { title: 'Resume Intelligence', description: 'AI-powered resume parsing and analysis.', icon: FileText },
  { title: 'ATS Analysis', description: 'Score your resume against job descriptions.', icon: Target },
  { title: 'Career Score', description: 'Unified career readiness assessment.', icon: Briefcase },
  { title: 'Interview Readiness', description: 'AI mock interviews with instant feedback.', icon: MessageSquare },
  { title: 'Learning Roadmap', description: 'Personalized 30/60/90 day growth plans.', icon: GraduationCap },
  { title: 'Job Matching', description: 'Match your profile against job descriptions.', icon: Search },
  { title: 'Resume Generator', description: 'Generate tailored resumes for any role.', icon: Sparkles },
];

export default function LandingPage() {
  return (
    <div className="relative overflow-hidden">
      {/* ─── Hero ─── */}
      <section className="relative min-h-[90vh] flex items-center justify-center px-6">
        {/* Background grid */}
        <div className="absolute inset-0 bg-dot-grid opacity-50" />
        {/* Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-radial from-indigo-500/[0.07] to-transparent rounded-full blur-3xl" />

        <motion.div
          className="relative z-10 text-center max-w-3xl mx-auto"
          initial="initial"
          animate="animate"
          variants={stagger}
        >
          {/* Badge */}
          <motion.div variants={fadeUp} className="mb-8">
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card/50 px-4 py-1.5 text-xs font-medium text-muted-foreground backdrop-blur-sm">
              <Sparkles className="w-3 h-3 text-indigo-400" />
              AI-Powered Career Intelligence
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            variants={fadeUp}
            className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight leading-[1.1] mb-6"
          >
            Hire Skills.
            <br />
            <span className="text-gradient-brand">Not Degrees.</span>
          </motion.h1>

          {/* Subheading */}
          <motion.p
            variants={fadeUp}
            className="text-lg sm:text-xl text-muted-foreground max-w-xl mx-auto mb-10 leading-relaxed"
          >
            DegreeBlind analyzes your GitHub repositories and resume to generate a
            comprehensive, degree-blind career intelligence report.
          </motion.p>

          {/* CTAs */}
          <motion.div variants={fadeUp} className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button asChild variant="brand" size="lg" className="group">
              <Link to="/login">
                Create Report
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link to="/login">
                Analyze Resume
              </Link>
            </Button>
          </motion.div>
        </motion.div>
      </section>

      {/* ─── How It Works ─── */}
      <section className="relative py-32 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">How It Works</h2>
            <p className="text-muted-foreground max-w-md mx-auto">Three simple steps to unlock your career intelligence.</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {steps.map((step, i) => (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.15 }}
                className="glass-card rounded-2xl p-8 text-center relative group hover:border-indigo-500/20 transition-all duration-300"
              >
                <div className="text-xs font-mono text-indigo-400 mb-4">{step.num}</div>
                <div className="w-12 h-12 mx-auto rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center mb-4">
                  <step.icon className="w-5 h-5 text-muted-foreground" />
                </div>
                <h3 className="text-base font-semibold text-foreground mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
                {i < steps.length - 1 && (
                  <div className="hidden md:block absolute -right-3 top-1/2 -translate-y-1/2 z-10">
                    <ChevronRight className="w-5 h-5 text-border" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Features ─── */}
      <section className="relative py-32 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">Platform Features</h2>
            <p className="text-muted-foreground max-w-md mx-auto">Everything you need to understand and grow your career.</p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
                className="glass-card rounded-xl p-5 group hover:border-white/10 transition-all duration-300 cursor-default"
              >
                <div className="w-9 h-9 rounded-lg bg-white/[0.04] border border-white/[0.06] flex items-center justify-center mb-3 group-hover:border-indigo-500/20 transition-colors">
                  <feature.icon className="w-4 h-4 text-muted-foreground group-hover:text-indigo-400 transition-colors" />
                </div>
                <h3 className="text-sm font-semibold text-foreground mb-1">{feature.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="relative py-32 px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="max-w-2xl mx-auto text-center"
        >
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">Ready to get started?</h2>
          <p className="text-muted-foreground mb-8">Join developers who are proving their skills beyond degrees.</p>
          <Button asChild variant="brand" size="xl" className="group">
            <Link to="/login">
              Start Free Analysis
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
        </motion.div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="border-t border-border py-8 px-6">
        <div className="max-w-5xl mx-auto flex items-center justify-between text-xs text-muted-foreground">
          <span>© 2026 DegreeBlind. All rights reserved.</span>
          <span>Hire Skills. Not Degrees.</span>
        </div>
      </footer>
    </div>
  );
}
