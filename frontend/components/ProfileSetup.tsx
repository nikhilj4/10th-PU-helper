import { useState } from "react";
export default function ProfileSetup({ onDone }: { onDone: (c: "10th" | "PUC") => void }) {
  const [classLevel, setClassLevel] = useState<"10th" | "PUC" | "">("");

  const classes = [
    { value: "10th" as const, label: "10th Standard", emoji: "📚", desc: "Math, Science, English and more" },
    { value: "PUC" as const, label: "PUC (11th-12th)", emoji: "🎓", desc: "Physics, Chemistry, Math, Biology" },
  ];

  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <div className="animate-slide-up w-full max-w-md">
        <h1 className="mb-2 text-3xl font-bold">Select Your Class</h1>
        <p className="mb-8 text-slate-500">This helps us tailor content just for you</p>
        <div className="mb-8 space-y-4">
          {classes.map((c) => (
            <button
              key={c.value}
              onClick={() => setClassLevel(c.value)}
              className={`w-full rounded-xl border-2 p-5 text-left transition ${
                classLevel === c.value ? "border-blue-500 bg-blue-50 shadow-glow" : "border-slate-200 bg-white"
              }`}
            >
              <div className="flex items-center gap-4">
                <span className="text-3xl">{c.emoji}</span>
                <div>
                  <p className="text-lg font-semibold">{c.label}</p>
                  <p className="text-sm text-slate-500">{c.desc}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
        <button
          className="gradient-primary w-full rounded-xl py-3 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
          disabled={!classLevel}
          onClick={() => onDone(classLevel as "10th" | "PUC")}
        >
          Continue
        </button>
      </div>
    </div>
  );
}
