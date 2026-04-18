import { api } from "./client";

export const sendOtp = (phone: string) => api.post("/auth/send-otp", { phone });
export const verifyOtp = (phone: string, code: string) => api.post("/auth/verify-otp", { phone, code });
export const createUser = (name: string) => api.post("/user/create", { name });
export const updateProfile = (class_level: "10th" | "PUC", subjects: string[]) =>
  api.patch("/user/profile", { class_level, subjects });
export const getTokens = () => api.get("/user/tokens");
export const chatQuery = (subject: string, query: string, session_id?: string) =>
  api.post("/chat/query", { subject, query, session_id });
export const createPaymentOrder = () => api.post("/payment/create-order", { plan_code: "INR9_1000TOKENS" });
export const verifyPayment = (payload: {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}) => api.post("/payment/verify", payload);
