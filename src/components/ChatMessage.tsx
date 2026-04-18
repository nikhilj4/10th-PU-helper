import { Bot, User } from "lucide-react";

interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
}

const ChatMessage = ({ role, content }: ChatMessageProps) => {
  const isUser = role === "user";

  return (
    <div className={`flex gap-3 ${isUser ? "flex-row-reverse" : ""} animate-fade-in`}>
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
        isUser ? "gradient-primary" : "gradient-accent"
      }`}>
        {isUser ? <User className="w-4 h-4 text-primary-foreground" /> : <Bot className="w-4 h-4 text-accent-foreground" />}
      </div>
      <div className={`max-w-[75%] p-4 rounded-xl text-sm leading-relaxed ${
        isUser
          ? "gradient-primary text-primary-foreground rounded-tr-sm"
          : "bg-card border border-border text-card-foreground rounded-tl-sm"
      }`}>
        {content}
      </div>
    </div>
  );
};

export default ChatMessage;
