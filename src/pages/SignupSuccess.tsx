import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, IndianRupee, Copy, MessageSquare, ArrowRight, ShieldCheck, Smartphone } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const WHATSAPP_NUMBER = "9477408004";
const UPI_ID = "edugoclasses@ibl";

const SignupSuccess = () => {
  const [copiedUPI, setCopiedUPI] = useState(false);

  const copyUPI = () => {
    navigator.clipboard.writeText(UPI_ID);
    setCopiedUPI(true);
    toast.success("UPI ID copied!");
    setTimeout(() => setCopiedUPI(false), 2000);
  };

  const openWhatsApp = () => {
    const message = encodeURIComponent(
      "Hi EduGo Classes! I have made the payment of ₹99 for 1 month access. Here is my payment screenshot and verification code."
    );
    window.open(`https://wa.me/91${WHATSAPP_NUMBER}?text=${message}`, "_blank");
  };

  return (
    <div className="min-h-screen bg-primary flex flex-col">
      {/* Header */}
      <div className="flex-shrink-0 px-6 pt-10 pb-5 text-center">
        <Link to="/" className="text-xl font-extrabold font-heading text-primary-foreground">
          EduGo<span className="text-accent">Classes</span>
        </Link>
        <div className="mt-5">
          <div className="w-14 h-14 rounded-full bg-accent/20 flex items-center justify-center mx-auto mb-3">
            <CheckCircle2 className="w-7 h-7 text-accent" />
          </div>
          <h1 className="text-2xl font-bold text-primary-foreground">Account Created! 🎉</h1>
          <p className="text-primary-foreground/60 text-sm mt-1">One more step to unlock everything</p>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 bg-background rounded-t-[2rem] px-5 pt-6 pb-8 space-y-4">
        {/* ₹99 Offer Card */}
        <Card className="border-2 border-accent/30 bg-gradient-to-br from-accent/10 via-accent/5 to-transparent overflow-hidden">
          <CardContent className="p-5">
            <div className="text-center mb-4">
              <div className="inline-flex items-center gap-1 bg-accent text-accent-foreground text-xs font-bold px-3 py-1 rounded-full mb-3">
                <IndianRupee className="w-3 h-3" /> LIMITED TIME OFFER
              </div>
              <h2 className="text-xl font-bold">Get Full Access for just</h2>
              <div className="flex items-center justify-center gap-1 mt-1">
                <span className="text-4xl font-extrabold text-accent">₹99</span>
                <span className="text-muted-foreground text-sm">/month</span>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Access all videos, live classes, quizzes & more!
              </p>
            </div>

            {/* What you get */}
            <div className="space-y-2 mb-4">
              {["All recorded video lectures", "Live classes with teacher", "Quizzes & assignments", "Community posts & polls", "1 month full access"].map((item) => (
                <div key={item} className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-accent flex-shrink-0" />
                  <span className="text-sm">{item}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Payment Steps */}
        <div className="space-y-3">
          <h3 className="font-bold text-base">How to activate:</h3>

          {/* Step 1: Pay via UPI */}
          <Card className="border-0 bg-secondary/50">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold flex-shrink-0">1</div>
                <div className="flex-1">
                  <h4 className="font-semibold text-sm">Pay ₹99 via UPI</h4>
                  <p className="text-xs text-muted-foreground mt-0.5 mb-2">Send ₹99 to the UPI ID below</p>
                  <div className="flex items-center gap-2 bg-card rounded-xl border border-border/50 px-3 py-2.5">
                    <Smartphone className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    <code className="text-sm font-mono font-semibold flex-1">{UPI_ID}</code>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={copyUPI}>
                      {copiedUPI ? <CheckCircle2 className="w-4 h-4 text-accent" /> : <Copy className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Step 2: WhatsApp */}
          <Card className="border-0 bg-secondary/50">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-accent text-accent-foreground flex items-center justify-center text-sm font-bold flex-shrink-0">2</div>
                <div className="flex-1">
                  <h4 className="font-semibold text-sm">Send payment screenshot on WhatsApp</h4>
                  <p className="text-xs text-muted-foreground mt-0.5 mb-2">
                    Send your payment screenshot + your verification code (visible on dashboard) to get verified
                  </p>
                  <Button
                    onClick={openWhatsApp}
                    className="w-full bg-[#25D366] hover:bg-[#20BD5A] text-white rounded-xl h-11 font-semibold"
                  >
                    <MessageSquare className="w-4 h-4 mr-2" />
                    WhatsApp: {WHATSAPP_NUMBER}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Step 3: Get verified */}
          <Card className="border-0 bg-secondary/50">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-foreground text-background flex items-center justify-center text-sm font-bold flex-shrink-0">3</div>
                <div className="flex-1">
                  <h4 className="font-semibold text-sm flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-accent" /> Get Verified & Access Unlocked!
                  </h4>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Once we confirm your payment, your account will be verified and you'll get full access for 1 month.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* CTA */}
        <Link to="/dashboard" className="block">
          <Button className="w-full h-12 rounded-xl text-sm font-semibold bg-accent hover:bg-accent/90 text-accent-foreground shadow-lg shadow-accent/20">
            Go to Dashboard <ArrowRight className="w-4 h-4 ml-1.5" />
          </Button>
        </Link>

        <p className="text-center text-[11px] text-muted-foreground">
          Your verification code is available on your dashboard. Share it along with payment screenshot.
        </p>
      </div>
    </div>
  );
};

export default SignupSuccess;
