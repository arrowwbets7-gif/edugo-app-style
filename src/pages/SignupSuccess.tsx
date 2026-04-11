import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Copy, MessageSquare, ArrowRight, ShieldCheck, Smartphone, Star, BookOpen, Video, HelpCircle } from "lucide-react";
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

  const features = [
    { icon: Video, label: "All recorded lectures" },
    { icon: BookOpen, label: "Live classes" },
    { icon: HelpCircle, label: "Quizzes & assignments" },
    { icon: Star, label: "Community access" },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Banner */}
      <div className="bg-primary px-6 pt-12 pb-16 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-accent/20 opacity-80" />
        <div className="relative z-10">
          <Link to="/" className="text-lg font-extrabold font-heading text-primary-foreground">
            EduGo<span className="text-accent">Classes</span>
          </Link>
          <div className="mt-6">
            <div className="w-16 h-16 rounded-full bg-accent/20 backdrop-blur-sm flex items-center justify-center mx-auto mb-4 border border-accent/30">
              <CheckCircle2 className="w-8 h-8 text-accent" />
            </div>
            <h1 className="text-2xl font-bold text-primary-foreground font-heading">
              Account Created Successfully
            </h1>
            <p className="text-primary-foreground/60 text-sm mt-2 max-w-xs mx-auto">
              Complete your payment to unlock full access
            </p>
          </div>
        </div>
      </div>

      {/* Content pulled up over banner */}
      <div className="px-5 -mt-8 pb-10 space-y-5 max-w-lg mx-auto">
        {/* Pricing Card */}
        <Card className="border border-accent/20 shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-accent to-accent/80 px-5 py-3 flex items-center justify-between">
            <span className="text-accent-foreground text-sm font-semibold">Limited Time Offer</span>
            <span className="bg-accent-foreground/20 text-accent-foreground text-xs font-bold px-2.5 py-1 rounded-full backdrop-blur-sm">
              BEST VALUE
            </span>
          </div>
          <CardContent className="p-5">
            <div className="text-center mb-5">
              <div className="flex items-baseline justify-center gap-1">
                <span className="text-4xl font-extrabold font-heading text-foreground">₹99</span>
                <span className="text-muted-foreground text-sm font-medium">/month</span>
              </div>
              <p className="text-muted-foreground text-xs mt-1.5">
                Full access to all features for 30 days
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {features.map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-2.5 bg-secondary/60 rounded-xl px-3 py-2.5">
                  <Icon className="w-4 h-4 text-accent flex-shrink-0" />
                  <span className="text-xs font-medium text-foreground">{label}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Steps */}
        <div className="space-y-3">
          <h3 className="font-semibold text-base font-heading text-foreground px-1">
            How to activate your account
          </h3>

          {/* Step 1 */}
          <Card className="border border-border/60 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-start gap-3.5">
                <div className="w-9 h-9 rounded-xl bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold flex-shrink-0">
                  1
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-sm text-foreground">Pay ₹99 via UPI</h4>
                  <p className="text-xs text-muted-foreground mt-0.5 mb-3">
                    Open any UPI app and send ₹99 to
                  </p>
                  <button
                    onClick={copyUPI}
                    className="w-full flex items-center gap-3 bg-secondary rounded-xl border border-border/50 px-4 py-3 hover:bg-secondary/80 transition-colors group"
                  >
                    <Smartphone className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                    <code className="text-sm font-mono font-bold text-foreground flex-1 text-left tracking-wide">
                      {UPI_ID}
                    </code>
                    {copiedUPI ? (
                      <CheckCircle2 className="w-5 h-5 text-accent flex-shrink-0" />
                    ) : (
                      <Copy className="w-5 h-5 text-muted-foreground group-hover:text-foreground flex-shrink-0 transition-colors" />
                    )}
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Step 2 */}
          <Card className="border border-border/60 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-start gap-3.5">
                <div className="w-9 h-9 rounded-xl bg-accent text-accent-foreground flex items-center justify-center text-sm font-bold flex-shrink-0">
                  2
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-sm text-foreground">Send proof on WhatsApp</h4>
                  <p className="text-xs text-muted-foreground mt-0.5 mb-3">
                    Share your payment screenshot along with your verification code
                  </p>
                  <Button
                    onClick={openWhatsApp}
                    className="w-full bg-[#25D366] hover:bg-[#1ebe5d] text-white rounded-xl h-12 font-semibold text-sm shadow-sm"
                  >
                    <MessageSquare className="w-5 h-5 mr-2" />
                    Message on WhatsApp
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Step 3 */}
          <Card className="border border-border/60 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-start gap-3.5">
                <div className="w-9 h-9 rounded-xl bg-foreground text-background flex items-center justify-center text-sm font-bold flex-shrink-0">
                  3
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-sm text-foreground flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-accent" />
                    Get verified
                  </h4>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                    Once we confirm your payment, your account will be verified and you'll get full access for 1 month.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* CTA */}
        <div className="pt-2 space-y-3">
          <Link to="/dashboard" className="block">
            <Button className="w-full h-12 rounded-xl text-sm font-semibold bg-accent hover:bg-accent/90 text-accent-foreground shadow-md">
              Go to Dashboard
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
          <p className="text-center text-xs text-muted-foreground leading-relaxed">
            Your verification code is available on your dashboard.
            <br />
            Share it along with your payment screenshot.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignupSuccess;
