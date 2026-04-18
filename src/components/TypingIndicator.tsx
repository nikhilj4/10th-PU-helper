import { Bot } from "lucide-react";

const TypingIndicator = () => (
  <div className="flex gap-3 animate-fade-in">
    <div className="w-8 h-8 rounded-lg gradient-accent flex items-center justify-center shrink-0">
      <Bot className="w-4 h-4 text-accent-foreground" />
    </div>
    <div className="bg-card border border-border rounded-xl rounded-tl-sm p-4 flex items-center gap-1.5">
      <span className="w-2 h-2 rounded-full bg-muted-foreground animate-typing" style={{ animationDelay: "0s" }} />
      <span className="w-2 h-2 rounded-full bg-muted-foreground animate-typing" style={{ animationDelay: "0.2s" }} />
      <span className="w-2 h-2 rounded-full bg-muted-foreground animate-typing" style={{ animationDelay: "0.4s" }} />
    </div>
  </div>
);

export default TypingIndicator;
