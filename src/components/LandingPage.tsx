import { Button } from "@/components/ui/button";
import { BookOpen, Brain, Zap, Shield } from "lucide-react";

interface LandingPageProps {
  onStart: () => void;
}

const features = [
  { icon: Brain, title: "AI-Powered Learning", desc: "Get instant answers to your academic questions" },
  { icon: BookOpen, title: "Curriculum Aligned", desc: "Covers 10th & PUC subjects thoroughly" },
  { icon: Zap, title: "Instant Responses", desc: "No waiting — learn at your own pace" },
  { icon: Shield, title: "Accurate & Reliable", desc: "Powered by curated educational content" },
];

const LandingPage = ({ onStart }: LandingPageProps) => {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="gradient-hero relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 left-10 w-72 h-72 rounded-full bg-primary/20 blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 rounded-full bg-accent/20 blur-3xl" />
        </div>
        <div className="relative container mx-auto px-6 py-24 md:py-36 text-center">
          <span className="inline-block px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide bg-primary/10 text-primary mb-6 animate-fade-in">
            Your AI Study Companion
          </span>
          <h1 className="text-4xl md:text-6xl font-extrabold text-primary-foreground leading-tight mb-6 animate-slide-up">
            Learn Smarter with
            <br />
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              AI Tutoring
            </span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 animate-slide-up" style={{ animationDelay: "0.1s" }}>
            Get personalized, instant answers for your 10th & PUC subjects.
            Math, Science, Physics, Chemistry — all covered.
          </p>
          <Button variant="hero" size="lg" onClick={onStart} className="text-lg px-10 py-6 animate-slide-up animate-pulse-glow" style={{ animationDelay: "0.2s" }}>
            Start Learning
          </Button>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-6 py-20">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-12">Why Students Love Us</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f, i) => (
            <div
              key={f.title}
              className="p-6 rounded-xl bg-card shadow-card border border-border hover:border-primary/30 transition-all animate-fade-in"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <div className="w-12 h-12 rounded-lg gradient-primary flex items-center justify-center mb-4">
                <f.icon className="w-6 h-6 text-primary-foreground" />
              </div>
              <h3 className="font-semibold text-lg mb-2">{f.title}</h3>
              <p className="text-muted-foreground text-sm">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 text-center text-muted-foreground text-sm">
        <p>© 2026 StudyAI. Built for students, by students.</p>
      </footer>
    </div>
  );
};

export default LandingPage;
