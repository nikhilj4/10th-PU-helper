import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
  onAuthenticated: () => void;
}

const AuthModal = ({ open, onClose, onAuthenticated }: AuthModalProps) => {
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  const handleSendOtp = async () => {
    if (!name.trim() || !phone.trim()) {
      toast.error("Please fill in all fields");
      return;
    }
    if (!/^\+\d{10,15}$/.test(phone)) {
      toast.error("Enter phone with country code (e.g. +919876543210)");
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({ phone });
      if (error) throw error;
      toast.success("OTP sent to your phone!");
      setStep("otp");
    } catch (err: any) {
      toast.error(err.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp.trim() || otp.length < 6) {
      toast.error("Enter a valid 6-digit OTP");
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        phone,
        token: otp,
        type: "sms",
      });
      if (error) throw error;

      // Store name in user metadata
      if (data.user) {
        await supabase.auth.updateUser({
          data: { full_name: name.trim() },
        });
      }

      toast.success("Verified successfully!");
      onAuthenticated();
    } catch (err: any) {
      toast.error(err.message || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 backdrop-blur-sm">
      <div className="bg-card rounded-xl shadow-card border border-border p-8 w-full max-w-md mx-4 animate-slide-up">
        <h2 className="text-2xl font-bold mb-2">Welcome to StudyAI</h2>
        <p className="text-muted-foreground text-sm mb-6">
          {step === "phone" ? "Create your account to start learning" : "Enter the OTP sent to your phone"}
        </p>

        {step === "phone" ? (
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" placeholder="Your name" value={name} onChange={e => setName(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <Input id="phone" placeholder="+919876543210" value={phone} onChange={e => setPhone(e.target.value)} />
            </div>
            <Button variant="hero" className="w-full" onClick={handleSendOtp} disabled={loading}>
              {loading ? "Sending..." : "Send OTP"}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <Label htmlFor="otp">Enter OTP</Label>
              <Input id="otp" placeholder="123456" maxLength={6} value={otp} onChange={e => setOtp(e.target.value)} />
            </div>
            <Button variant="hero" className="w-full" onClick={handleVerifyOtp} disabled={loading}>
              {loading ? "Verifying..." : "Verify OTP"}
            </Button>
            <Button variant="ghost" className="w-full" onClick={() => setStep("phone")}>
              Change phone number
            </Button>
          </div>
        )}

        <button onClick={onClose} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground">
          ✕
        </button>
      </div>
    </div>
  );
};

export default AuthModal;
