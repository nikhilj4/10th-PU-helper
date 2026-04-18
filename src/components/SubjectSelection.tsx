import { useState } from "react";
import { Button } from "@/components/ui/button";

interface SubjectSelectionProps {
  studentClass: string;
  onComplete: (subject: string) => void;
}

const subjectsByClass: Record<string, Array<{ value: string; label: string; emoji: string; color: string }>> = {
  "10th": [
    { value: "math", label: "Mathematics", emoji: "📐", color: "bg-primary/10 border-primary/30" },
    { value: "science", label: "Science", emoji: "🔬", color: "bg-accent/10 border-accent/30" },
    { value: "english", label: "English", emoji: "📝", color: "bg-destructive/10 border-destructive/30" },
    { value: "social", label: "Social Science", emoji: "🌍", color: "bg-muted border-border" },
  ],
  puc: [
    { value: "physics", label: "Physics", emoji: "⚡", color: "bg-primary/10 border-primary/30" },
    { value: "chemistry", label: "Chemistry", emoji: "🧪", color: "bg-accent/10 border-accent/30" },
    { value: "math", label: "Mathematics", emoji: "📐", color: "bg-destructive/10 border-destructive/30" },
    { value: "biology", label: "Biology", emoji: "🧬", color: "bg-muted border-border" },
  ],
};

const SubjectSelection = ({ studentClass, onComplete }: SubjectSelectionProps) => {
  const [selected, setSelected] = useState<string | null>(null);
  const subjects = subjectsByClass[studentClass] || subjectsByClass["10th"];

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-lg animate-slide-up">
        <h1 className="text-3xl font-bold mb-2">Choose a Subject</h1>
        <p className="text-muted-foreground mb-8">Pick the subject you want to study right now</p>

        <div className="grid grid-cols-2 gap-4 mb-8">
          {subjects.map(s => (
            <button
              key={s.value}
              onClick={() => setSelected(s.value)}
              className={`p-6 rounded-xl border-2 text-center transition-all ${s.color} ${
                selected === s.value ? "ring-2 ring-primary shadow-glow scale-[1.02]" : "hover:scale-[1.01]"
              }`}
            >
              <span className="text-4xl block mb-3">{s.emoji}</span>
              <p className="font-semibold">{s.label}</p>
            </button>
          ))}
        </div>

        <Button variant="hero" size="lg" className="w-full" disabled={!selected} onClick={() => selected && onComplete(selected)}>
          Start Chatting
        </Button>
      </div>
    </div>
  );
};

export default SubjectSelection;
