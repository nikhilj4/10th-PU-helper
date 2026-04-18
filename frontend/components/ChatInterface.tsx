import { useEffect, useRef, useState } from "react";
import { chatQuery } from "../services/api";
import RechargeModal from "./RechargeModal";
import TokenCounter from "./TokenCounter";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function ChatInterface({
  subject,
  classLevel,
  onBack,
  tokens,
  onTokenChange,
}: {
  subject: string;
  classLevel: "10th" | "PUC";
  onBack: () => void;
  tokens: number;
  onTokenChange: (value: number) => void;
}) {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | undefined>();
  const [showRecharge, setShowRecharge] = useState(false);
  const [errorText, setErrorText] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  const send = async () => {
    if (!input.trim() || loading) return;
    if (tokens <= 0) return;
    const question = input;
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: question }]);
    setErrorText("");
    setLoading(true);
    try {
      const res = await chatQuery(subject, question, sessionId);
      setSessionId(res.data.session_id);
      setMessages((prev) => [...prev, { role: "assistant", content: res.data.answer }]);
      onTokenChange(res.data.remaining_tokens);
    } catch (error: any) {
      if (error?.response?.status === 402) {
        onTokenChange(0);
        setErrorText("Token limit reached. Please recharge.");
      } else {
        const detail = error?.response?.data?.detail;
        setErrorText(detail || "Unable to get response right now. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const displaySubject = subject.charAt(0).toUpperCase() + subject.slice(1);
  const showPay = tokens <= 0 || showRecharge;

  return (
    <div className="flex h-screen flex-col bg-[hsl(var(--background))]">
      <header className="flex items-center justify-between border-b bg-white px-4 py-3">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="rounded-lg px-2 py-1 hover:bg-slate-100">←</button>
          <div>
            <h1 className="font-semibold">{displaySubject} Tutor</h1>
            <p className="text-xs text-slate-500">{classLevel === "10th" ? "10th Standard" : "PUC"}</p>
          </div>
        </div>
        <TokenCounter tokens={tokens} onRecharge={() => setShowRecharge(true)} />
      </header>
      <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto p-4">
        {messages.length === 0 && (
          <div className="animate-fade-in py-16 text-center">
            <p className="mb-4 text-4xl">👋</p>
            <h2 className="mb-2 text-xl font-semibold">Hello! I'm your {displaySubject} tutor</h2>
            <p className="text-slate-500">Ask me anything about {displaySubject}. I'm here to help.</p>
          </div>
        )}
        {messages.map((m, idx) => (
          <div key={idx} className={`mb-2 flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[80%] rounded-2xl px-3 py-2 ${m.role === "user" ? "bg-blue-600 text-white" : "bg-white border"}`}>{m.content}</div>
          </div>
        ))}
        {loading && <div className="text-slate-500">Typing...</div>}
        {errorText && <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">{errorText}</div>}
      </div>
      <div className="border-t bg-white p-4">
        <div className="mx-auto flex max-w-3xl gap-2">
        <input
          className="flex-1 rounded-lg border p-2"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder={tokens > 0 ? `Ask about ${displaySubject}...` : "No tokens remaining. Please recharge."}
          disabled={tokens <= 0}
        />
        <button className="gradient-primary rounded-lg px-4 py-2 font-semibold text-white disabled:opacity-50" disabled={!input.trim() || loading || tokens <= 0} onClick={send}>Send</button>
        </div>
      </div>
      <RechargeModal open={showPay} onClose={() => setShowRecharge(false)} onPaid={onTokenChange} />
    </div>
  );
}
