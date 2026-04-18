import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, ArrowLeft } from "lucide-react";
import ChatMessage from "./ChatMessage";
import TypingIndicator from "./TypingIndicator";
import TokenCounter from "./TokenCounter";
import RechargeModal from "./RechargeModal";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type Msg = { role: "user" | "assistant"; content: string };

interface ChatInterfaceProps {
  subject: string;
  studentClass: string;
  onBack: () => void;
}

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/student-chat`;

const ChatInterface = ({ subject, studentClass, onBack }: ChatInterfaceProps) => {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [tokens, setTokens] = useState(1000);
  const [showRecharge, setShowRecharge] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  // Load token balance
  useEffect(() => {
    const loadTokens = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase.from("profiles").select("tokens").eq("id", user.id).single();
      if (data) setTokens(data.tokens);
    };
    loadTokens();
  }, []);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;

    if (tokens <= 0) {
      setShowRecharge(true);
      return;
    }

    const userMsg: Msg = { role: "user", content: text };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          messages: [...messages, userMsg],
          subject,
          studentClass,
        }),
      });

      if (resp.status === 429) {
        toast.error("Too many requests. Please wait a moment.");
        setLoading(false);
        return;
      }
      if (resp.status === 402) {
        toast.error("AI credits exhausted. Please try later.");
        setLoading(false);
        return;
      }
      if (!resp.ok || !resp.body) throw new Error("Failed to get response");

      // Stream response
      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let assistantText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        let newlineIdx: number;
        while ((newlineIdx = buffer.indexOf("\n")) !== -1) {
          let line = buffer.slice(0, newlineIdx);
          buffer = buffer.slice(newlineIdx + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              assistantText += content;
              setMessages(prev => {
                const last = prev[prev.length - 1];
                if (last?.role === "assistant") {
                  return prev.map((m, i) => i === prev.length - 1 ? { ...m, content: assistantText } : m);
                }
                return [...prev, { role: "assistant", content: assistantText }];
              });
            }
          } catch {
            buffer = line + "\n" + buffer;
            break;
          }
        }
      }

      // Deduct tokens (roughly 10 per query)
      const cost = 10;
      setTokens(prev => Math.max(0, prev - cost));

      // Update tokens in DB
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from("profiles").update({ tokens: Math.max(0, tokens - cost) }).eq("id", user.id);
      }
    } catch (err: any) {
      toast.error("Failed to get response. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const subjectLabel = subject.charAt(0).toUpperCase() + subject.slice(1);

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-border bg-card">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="font-semibold">{subjectLabel} Tutor</h1>
            <p className="text-xs text-muted-foreground">{studentClass === "10th" ? "10th Standard" : "PUC"}</p>
          </div>
        </div>
        <TokenCounter tokens={tokens} onRecharge={() => setShowRecharge(true)} />
      </header>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center py-16 animate-fade-in">
            <p className="text-4xl mb-4">👋</p>
            <h2 className="text-xl font-semibold mb-2">Hello! I'm your {subjectLabel} tutor</h2>
            <p className="text-muted-foreground">Ask me anything about {subjectLabel}. I'm here to help!</p>
          </div>
        )}
        {messages.map((m, i) => (
          <ChatMessage key={i} role={m.role} content={m.content} />
        ))}
        {loading && messages[messages.length - 1]?.role === "user" && <TypingIndicator />}
      </div>

      {/* Input */}
      <div className="p-4 border-t border-border bg-card">
        <div className="flex gap-2 max-w-3xl mx-auto">
          <Input
            placeholder={tokens > 0 ? `Ask about ${subjectLabel}...` : "No tokens remaining. Please recharge."}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && sendMessage()}
            disabled={loading || tokens <= 0}
            className="flex-1"
          />
          <Button variant="hero" size="icon" onClick={sendMessage} disabled={loading || !input.trim() || tokens <= 0}>
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <RechargeModal open={showRecharge} onClose={() => setShowRecharge(false)} onSuccess={() => {
        setTokens(prev => prev + 1000);
        setShowRecharge(false);
        toast.success("Tokens recharged!");
      }} />
    </div>
  );
};

export default ChatInterface;
