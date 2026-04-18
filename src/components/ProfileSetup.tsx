import { useState } from "react";
import { Button } from "@/components/ui/button";

interface ProfileSetupProps {
  onComplete: (studentClass: string) => void;
}

const classes = [
  { value: "10th", label: "10th Standard", emoji: "📚" },
  { value: "puc", label: "PUC (11th-12th)", emoji: "🎓" },
];

const ProfileSetup = ({ onComplete }: ProfileSetupProps) => {
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md animate-slide-up">
        <h1 className="text-3xl font-bold mb-2">Select Your Class</h1>
        <p className="text-muted-foreground mb-8">This helps us tailor content just for you</p>

        <div className="space-y-4 mb-8">
          {classes.map(c => (
            <button
              key={c.value}
              onClick={() => setSelected(c.value)}
              className={`w-full p-5 rounded-xl border-2 text-left transition-all flex items-center gap-4 ${
                selected === c.value
                  ? "border-primary bg-primary/5 shadow-glow"
                  : "border-border bg-card hover:border-primary/30"
              }`}
            >
              <span className="text-3xl">{c.emoji}</span>
              <div>
                <p className="font-semibold text-lg">{c.label}</p>
                <p className="text-muted-foreground text-sm">
                  {c.value === "10th" ? "Math, Science, English & more" : "Physics, Chemistry, Math, Biology"}
                </p>
              </div>
            </button>
          ))}
        </div>

        <Button variant="hero" size="lg" className="w-full" disabled={!selected} onClick={() => selected && onComplete(selected)}>
          Continue
        </Button>
      </div>
    </div>
  );
};

export default ProfileSetup;
