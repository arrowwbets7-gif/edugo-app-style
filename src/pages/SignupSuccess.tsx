import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Copy, MessageSquare, ArrowRight, Shield, Smartphone, Video, BookOpen, HelpCircle, Star, Info } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

const WHATSAPP_NUMBER = "9477408004";
const UPI_ID = "edugoclasses@ibl";

const SignupSuccess = () => {
  const [copiedUPI, setCopiedUPI] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const { profile } = useAuth();
  const verificationCode = profile?.verification_code || "------";

  const copyToClipboard = (text: string, type: "upi" | "code") => {
    navigator.clipboard.writeText(text);
    if (type === "upi") {
      setCopiedUPI(true);
      toast.success("UPI ID copied!");
      setTimeout(() => setCopiedUPI(false), 2000);
    } else {
      setCopiedCode(true);
      toast.success("Verification code copied!");
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const openWhatsApp = () => {
    const message = encodeURIComponent(
      `Hi EduGo Classes! I have made the payment of ₹99 for 1 month access.\n\nMy verification code: ${verificationCode}\n\nPlease find my payment screenshot attached.`
    );
    window.open(`https://wa.me/91${WHATSAPP_NUMBER}?text=${message}`, "_blank");
  };

  const features = [
    { icon: Video, label: "Recorded lectures" },
    { icon: BookOpen, label: "Live classes" },
    { icon: HelpCircle, label: "Quizzes & tests" },
    { icon: Star, label: "Community" },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Compact header */}
      <div className="bg-primary px-6 pt-10 pb-14 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary to-primary/80" />
        <div className="relative z-10">
          <Link to="/" className="text-lg font-extrabold font-heading text-primary-foreground">
            EduGo<span className="text-accent">Classes</span>
          </Link>
          <div className="mt-5 flex flex-col items-center">
            <div className="w-14 h-14 rounded-full bg-accent/15 backdrop-blur-sm flex items-center justify-center mb-3">
              <CheckCircle2 className="w-7 h-7 text-accent" />
            </div>
            <h1 className="text-xl font-bold text-primary-foreground font-heading">
              Account Created
            </h1>
            <p className="text-primary-foreground/50 text-sm mt-1">
              One more step to unlock full access
            </p>
          </div>
        </div>
      </div>

      <div className="px-5 -mt-6 pb-10 space-y-4 max-w-lg mx-auto">
        {/* Verification Code Card - PROMINENT */}
        <Card className="border-2 border-accent/30 shadow-lg bg-card">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <Shield className="w-5 h-5 text-accent" />
              <h3 className="font-semibold text-sm text-foreground">Your Verification Code</h3>
            </div>
            <p className="text-xs text-muted-foreground mb-3 leading-relaxed">
              Save this code. You'll need to share it on WhatsApp along with your payment screenshot to activate your account.
            </p>
            <button
              onClick={() => copyToClipboard(verificationCode, "code")}
              className="w-full flex items-center justify-between bg-primary/5 border border-primary/10 rounded-xl px-5 py-4 hover:bg-primary/10 transition-colors group"
            >
              <code className="text-2xl font-mono font-bold text-foreground tracking-[0.3em]">
                {verificationCode}
              </code>
              {copiedCode ? (
                <CheckCircle2 className="w-5 h-5 text-accent flex-shrink-0" />
              ) : (
                <Copy className="w-5 h-5 text-muted-foreground group-hover:text-foreground flex-shrink-0 transition-colors" />
              )}
            </button>
          </CardContent>
        </Card>

        {/* Pricing */}
        <Card className="shadow-md overflow-hidden">
          <div className="bg-accent px-4 py-2.5 flex items-center justify-between">
            <span className="text-accent-foreground text-xs font-semibold">Limited Time Offer</span>
            <span className="bg-accent-foreground/20 text-accent-foreground text-[10px] font-bold px-2 py-0.5 rounded-full">
              BEST VALUE
            </span>
          </div>
          <CardContent className="p-4">
            <div className="text-center mb-4">
              <div className="flex items-baseline justify-center gap-1">
                <span className="text-3xl font-extrabold font-heading text-foreground">₹99</span>
                <span className="text-muted-foreground text-sm">/month</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {features.map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-2 bg-secondary/50 rounded-lg px-3 py-2">
                  <Icon className="w-3.5 h-3.5 text-accent flex-shrink-0" />
                  <span className="text-xs text-foreground">{label}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Steps - Compact */}
        <div className="space-y-2.5">
          <h3 className="font-semibold text-sm font-heading text-foreground px-1">
            How to activate
          </h3>

          {/* Step 1: Pay */}
          <Card className="shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold flex-shrink-0">
                  1
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-sm text-foreground">Pay ₹99 via UPI</h4>
                  <p className="text-xs text-muted-foreground mt-0.5 mb-2.5">
                    Send ₹99 using any UPI app
                  </p>
                  <button
                    onClick={() => copyToClipboard(UPI_ID, "upi")}
                    className="w-full flex items-center gap-3 bg-secondary/60 rounded-lg border border-border/40 px-3.5 py-2.5 hover:bg-secondary transition-colors group"
                  >
                    <Smartphone className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    <code className="text-sm font-mono font-bold text-foreground flex-1 text-left">
                      {UPI_ID}
                    </code>
                    {copiedUPI ? (
                      <CheckCircle2 className="w-4 h-4 text-accent flex-shrink-0" />
                    ) : (
                      <Copy className="w-4 h-4 text-muted-foreground group-hover:text-foreground flex-shrink-0 transition-colors" />
                    )}
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Step 2: WhatsApp */}
          <Card className="shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-accent text-accent-foreground flex items-center justify-center text-xs font-bold flex-shrink-0">
                  2
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-sm text-foreground">Send proof on WhatsApp</h4>
                  <p className="text-xs text-muted-foreground mt-0.5 mb-2.5">
                    Share payment screenshot + your verification code
                  </p>
                  <Button
                    onClick={openWhatsApp}
                    className="w-full bg-[#25D366] hover:bg-[#1ebe5d] text-white rounded-lg h-11 font-semibold text-sm"
                  >
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Message on WhatsApp
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Step 3: Get verified */}
          <Card className="shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-foreground text-background flex items-center justify-center text-xs font-bold flex-shrink-0">
                  3
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-sm text-foreground">Get verified & start learning</h4>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                    Once payment is confirmed, your account will be activated for 1 month.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Info banner */}
        <div className="flex items-start gap-2.5 bg-accent/5 border border-accent/15 rounded-xl px-4 py-3">
          <Info className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />
          <p className="text-xs text-muted-foreground leading-relaxed">
            Your verification code is also available on your dashboard. You can complete the payment anytime.
          </p>
        </div>

        {/* CTA */}
        <Link to="/dashboard" className="block pt-1">
          <Button className="w-full h-12 rounded-xl text-sm font-semibold bg-primary hover:bg-primary/90 text-primary-foreground">
            Go to Dashboard
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default SignupSuccess;
