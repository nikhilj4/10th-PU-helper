export default function LandingPage({ onStart }: { onStart: () => void }) {
  const features = [
    { icon: "🧠", title: "AI-Powered Learning", desc: "Get instant answers to your academic questions" },
    { icon: "📘", title: "Curriculum Aligned", desc: "Covers 10th and PUC subjects thoroughly" },
    { icon: "⚡", title: "Instant Responses", desc: "No waiting and learn at your own pace" },
    { icon: "✅", title: "Accurate and Reliable", desc: "Powered by curated educational content" },
  ];

  return (
    <div className="min-h-screen">
      <section className="gradient-hero relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute left-10 top-20 h-72 w-72 rounded-full bg-blue-500/20 blur-3xl" />
          <div className="absolute bottom-10 right-10 h-96 w-96 rounded-full bg-emerald-500/20 blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-5xl px-6 py-24 text-center md:py-36">
          <span className="animate-fade-in mb-6 inline-block rounded-full bg-blue-500/10 px-4 py-1.5 text-xs font-semibold tracking-wide text-blue-400">
            Your AI Study Companion
          </span>
          <h1 className="animate-slide-up mb-6 text-4xl font-extrabold leading-tight text-white md:text-6xl">
            Learn Smarter with
            <br />
            <span className="bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">AI Tutoring</span>
          </h1>
          <p className="animate-slide-up mx-auto mb-10 max-w-2xl text-lg text-slate-300 md:text-xl">
            Get personalized, instant answers for your 10th and PUC subjects.
            Math, Science, Physics, Chemistry and more.
          </p>
          <button
            onClick={onStart}
            className="animate-slide-up gradient-primary rounded-xl px-10 py-4 text-lg font-semibold text-white shadow-glow transition hover:scale-[1.02]"
          >
            Start Learning
          </button>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-20">
        <h2 className="mb-12 text-center text-2xl font-bold md:text-3xl">Why Students Love Us</h2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => (
            <div key={feature.title} className="shadow-card rounded-xl border border-slate-200 bg-white p-6">
              <div className="gradient-primary mb-4 flex h-12 w-12 items-center justify-center rounded-lg text-xl">{feature.icon}</div>
              <h3 className="mb-2 font-semibold">{feature.title}</h3>
              <p className="text-sm text-slate-500">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
