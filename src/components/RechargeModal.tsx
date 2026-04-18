import { Button } from "@/components/ui/button";
import { Coins, Zap } from "lucide-react";
import { toast } from "sonner";

interface RechargeModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const RechargeModal = ({ open, onClose, onSuccess: _onSuccess }: RechargeModalProps) => {
  if (!open) return null;

  const handlePayment = async () => {
    // Razorpay integration - requires API keys to be set up
    toast.info("Razorpay integration requires API keys. Please configure them to enable payments.");
    // When Razorpay is configured, this will:
    // 1. Call edge function to create Razorpay order
    // 2. Open Razorpay checkout
    // 3. Verify payment on success
    // 4. Update token balance
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 backdrop-blur-sm">
      <div className="bg-card rounded-xl shadow-card border border-border p-8 w-full max-w-sm mx-4 animate-slide-up relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground text-lg">
          ✕
        </button>

        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center mx-auto mb-4">
            <Coins className="w-8 h-8 text-primary-foreground" />
          </div>
          <h2 className="text-2xl font-bold">Recharge Tokens</h2>
          <p className="text-muted-foreground text-sm mt-1">Continue your learning journey</p>
        </div>

        <div className="border-2 border-primary rounded-xl p-5 mb-6 bg-primary/5">
          <div className="flex items-center justify-between mb-2">
            <span className="font-semibold text-lg">1,000 Tokens</span>
            <span className="text-2xl font-bold text-primary">₹9</span>
          </div>
          <div className="flex items-center gap-1 text-muted-foreground text-sm">
            <Zap className="w-3.5 h-3.5" />
            <span>~100 questions</span>
          </div>
        </div>

        <Button variant="hero" size="lg" className="w-full" onClick={handlePayment}>
          Pay ₹9 with Razorpay
        </Button>

        <p className="text-center text-xs text-muted-foreground mt-4">
          Secure payment powered by Razorpay
        </p>
      </div>
    </div>
  );
};

export default RechargeModal;
