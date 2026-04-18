import { useState } from "react";
import { createUser, sendOtp, verifyOtp } from "../services/api";

export default function AuthModal({ open, onClose, onDone }: { open: boolean; onClose: () => void; onDone: () => void }) {
  if (!open) return null;
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSendOtp = async () => {
    if (!name.trim() || !phone.trim()) {
      setError("Please fill in all fields");
      return;
    }
    if (!/^\+\d{10,15}$/.test(phone.trim())) {
      setError("Enter phone with country code (e.g. +919876543210)");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await sendOtp(phone);
      setSent(true);
    } catch (e: any) {
      setError(e?.response?.data?.detail || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await verifyOtp(phone, otp);
      localStorage.setItem("access_token", res.data.access_token);
      await createUser(name);
      onDone();
    } catch (e: any) {
      setError(e?.response?.data?.detail || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="animate-slide-up relative mx-4 w-full max-w-md rounded-xl border border-slate-200 bg-white p-8 shadow-card">
        <h2 className="mb-2 text-2xl font-bold">Welcome to StudyAI</h2>
        <p className="mb-6 text-sm text-slate-500">
          {sent ? "Enter the OTP sent to your phone" : "Create your account to start learning"}
        </p>
        {!sent ? (
          <div className="space-y-4">
            <input className="w-full rounded-lg border px-3 py-2" placeholder="Full name" value={name} onChange={(e) => setName(e.target.value)} />
            <input className="w-full rounded-lg border px-3 py-2" placeholder="+919876543210" value={phone} onChange={(e) => setPhone(e.target.value)} />
            <button className="gradient-primary w-full rounded-lg py-2.5 font-semibold text-white" disabled={loading} onClick={handleSendOtp}>
              {loading ? "Sending..." : "Send OTP"}
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <input className="w-full rounded-lg border px-3 py-2" placeholder="123456" maxLength={6} value={otp} onChange={(e) => setOtp(e.target.value)} />
            <button className="gradient-primary w-full rounded-lg py-2.5 font-semibold text-white" disabled={loading} onClick={handleVerifyOtp}>
              {loading ? "Verifying..." : "Verify OTP"}
            </button>
          </div>
        )}
        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
        <button onClick={onClose} className="absolute right-4 top-4 text-slate-500 hover:text-slate-800">✕</button>
      </div>
    </div>
  );
}
