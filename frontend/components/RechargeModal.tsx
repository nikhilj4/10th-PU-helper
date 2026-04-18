import { createPaymentOrder, verifyPayment } from "../services/api";

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function RechargeModal({ open, onClose, onPaid }: { open: boolean; onClose: () => void; onPaid: (tokens: number) => void }) {
  if (!open) return null;
  const startPayment = async () => {
    const orderRes = await createPaymentOrder();
    if (typeof window.Razorpay === "undefined") throw new Error("Razorpay SDK not loaded");
    const options = {
      key: orderRes.data.key_id || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      amount: orderRes.data.amount,
      currency: "INR",
      order_id: orderRes.data.order_id,
      name: "Student Bot Recharge",
      description: "1000 token recharge",
      handler: async (response: any) => {
        const verifyRes = await verifyPayment(response);
        onPaid(verifyRes.data.balance_tokens);
        onClose();
      },
    };
    const razorpay = new window.Razorpay(options);
    razorpay.open();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="animate-slide-up relative mx-4 w-full max-w-sm rounded-xl border border-slate-200 bg-white p-8 shadow-card">
        <button onClick={onClose} className="absolute right-4 top-4 text-slate-500 hover:text-slate-800">✕</button>
        <div className="mb-6 text-center">
          <div className="gradient-primary mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl text-2xl text-white">🪙</div>
          <h3 className="text-2xl font-bold">Recharge Tokens</h3>
          <p className="mt-1 text-sm text-slate-500">Continue your learning journey</p>
        </div>
        <div className="mb-6 rounded-xl border-2 border-blue-500 bg-blue-50 p-5">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-lg font-semibold">1,000 Tokens</span>
            <span className="text-2xl font-bold text-blue-600">₹9</span>
          </div>
          <p className="text-sm text-slate-500">Approximately 100 questions</p>
        </div>
        <button className="gradient-primary w-full rounded-xl py-3 font-semibold text-white" onClick={startPayment}>Pay ₹9 with Razorpay</button>
      </div>
    </div>
  );
}
