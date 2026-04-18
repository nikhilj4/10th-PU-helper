import Script from "next/script";
import { useState } from "react";

import AuthModal from "../components/AuthModal";
import ChatInterface from "../components/ChatInterface";
import LandingPage from "../components/LandingPage";
import ProfileSetup from "../components/ProfileSetup";
import SubjectSelection from "../components/SubjectSelection";
import { getTokens, updateProfile } from "../services/api";
import { SUBJECTS_BY_CLASS } from "../utils/subjects";

export default function HomePage() {
  const [step, setStep] = useState<"landing" | "auth" | "profile" | "subject" | "chat">("landing");
  const [classLevel, setClassLevel] = useState<"10th" | "PUC">("10th");
  const [subject, setSubject] = useState("");
  const [tokens, setTokens] = useState(1000);

  const handlePostAuth = async () => {
    setStep("profile");
    try {
      const tokenRes = await getTokens();
      setTokens(tokenRes.data.balance_tokens);
    } catch {
      setTokens(1000);
    }
  };

  return (
    <main className="min-h-screen">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="afterInteractive" />
      {step === "landing" && <LandingPage onStart={() => setStep("auth")} />}
      {step === "profile" && <ProfileSetup onDone={(selectedClass) => { setClassLevel(selectedClass); setStep("subject"); }} />}
      {step === "subject" && (
        <SubjectSelection
          classLevel={classLevel}
          onDone={async (selectedSubject) => {
            setSubject(selectedSubject);
            setStep("chat");
            // Don't block navigation on transient profile-save failure.
            // Chat can still proceed, and profile save can be retried later.
            try {
              await updateProfile(classLevel, SUBJECTS_BY_CLASS[classLevel]);
            } catch {
              // no-op
            }
          }}
        />
      )}
      {step === "chat" && <ChatInterface subject={subject} classLevel={classLevel} onBack={() => setStep("subject")} tokens={tokens} onTokenChange={setTokens} />}
      <AuthModal open={step === "auth"} onClose={() => setStep("landing")} onDone={handlePostAuth} />
    </main>
  );
}
