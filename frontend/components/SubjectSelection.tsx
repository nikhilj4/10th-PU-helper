import { SUBJECTS_BY_CLASS } from "../utils/subjects";

export default function SubjectSelection({
  classLevel,
  onDone,
}: {
  classLevel: "10th" | "PUC";
  onDone: (subject: string) => void;
}) {
  const subjects = SUBJECTS_BY_CLASS[classLevel];
  const subjectMeta: Record<string, string> = {
    Math: "📐",
    Science: "🔬",
    English: "📝",
    Physics: "⚡",
    Chemistry: "🧪",
    Biology: "🧬",
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <div className="animate-slide-up w-full max-w-lg">
        <h1 className="mb-2 text-3xl font-bold">Choose a Subject</h1>
        <p className="mb-8 text-slate-500">Pick the subject you want to study right now</p>
        <div className="grid grid-cols-2 gap-4">
          {subjects.map((subject) => (
            <button
              key={subject}
              onClick={() => onDone(subject)}
              className="rounded-xl border-2 border-slate-200 bg-white p-6 text-center transition hover:scale-[1.01] hover:border-blue-300"
            >
              <span className="mb-3 block text-4xl">{subjectMeta[subject] || "📘"}</span>
              <p className="font-semibold">{subject}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
