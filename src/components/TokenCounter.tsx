import { Coins } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TokenCounterProps {
  tokens: number;
  onRecharge: () => void;
}

const TokenCounter = ({ tokens, onRecharge }: TokenCounterProps) => {
  const isLow = tokens < 200;

  return (
    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm font-medium ${
      isLow ? "border-destructive/50 bg-destructive/10 text-destructive" : "border-border bg-card text-foreground"
    }`}>
      <Coins className="w-4 h-4" />
      <span>{tokens.toLocaleString()} tokens</span>
      {isLow && (
        <Button variant="destructive" size="sm" className="ml-1 h-6 text-xs px-2" onClick={onRecharge}>
          Recharge
        </Button>
      )}
    </div>
  );
};

export default TokenCounter;
