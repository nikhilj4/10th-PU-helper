import { useState, useEffect } from "react";
import LandingPage from "@/components/LandingPage";
import AuthModal from "@/components/AuthModal";
import ProfileSetup from "@/components/ProfileSetup";
import SubjectSelection from "@/components/SubjectSelection";
import ChatInterface from "@/components/ChatInterface";
import { supabase } from "@/integrations/supabase/client";

type AppStep = "landing" | "auth" | "profile" | "subject" | "chat";

const Index = () => {
  const [step, setStep] = useState<AppStep>("landing");
  const [studentClass, setStudentClass] = useState("");
  const [subject, setSubject] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check existing session
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setIsAuthenticated(true);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleStart = () => {
    if (isAuthenticated) {
      setStep("profile");
    } else {
      setStep("auth");
    }
  };

  const handleAuthenticated = () => {
    setIsAuthenticated(true);
    setStep("profile");
  };

  const handleClassSelected = (cls: string) => {
    setStudentClass(cls);
    setStep("subject");
  };

  const handleSubjectSelected = (subj: string) => {
    setSubject(subj);
    setStep("chat");
  };

  if (step === "chat" && studentClass && subject) {
    return <ChatInterface subject={subject} studentClass={studentClass} onBack={() => setStep("subject")} />;
  }

  return (
    <div className="min-h-screen bg-background">
      {step === "landing" && <LandingPage onStart={handleStart} />}
      {step === "profile" && <ProfileSetup onComplete={handleClassSelected} />}
      {step === "subject" && <SubjectSelection studentClass={studentClass} onComplete={handleSubjectSelected} />}

      <AuthModal
        open={step === "auth"}
        onClose={() => setStep("landing")}
        onAuthenticated={handleAuthenticated}
      />
    </div>
  );
};

export default Index;
