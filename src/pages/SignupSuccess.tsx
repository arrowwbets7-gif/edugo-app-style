import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mail, ShieldCheck, MessageSquare, ArrowRight, CheckCircle2 } from "lucide-react";

const SignupSuccess = () => {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="text-2xl font-extrabold font-heading text-primary">
            EduGo<span className="text-accent">Classes</span>
          </Link>
        </div>

        <Card className="border-border/50 shadow-xl">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto w-14 h-14 rounded-2xl bg-green-500/10 flex items-center justify-center mb-3">
              <CheckCircle2 className="w-7 h-7 text-green-500" />
            </div>
            <CardTitle className="text-xl">Account Created! 🎉</CardTitle>
            <CardDescription className="text-sm">
              Follow these steps to get started
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-2">
            {/* Step 1 */}
            <div className="flex gap-3 items-start p-3 rounded-xl bg-primary/5 border border-primary/10">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-bold shrink-0">
                1
              </div>
              <div>
                <h4 className="font-semibold text-sm flex items-center gap-1.5">
                  <Mail className="w-4 h-4 text-primary" /> Confirm Your Email
                </h4>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Check your inbox and click the confirmation link we sent you.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex gap-3 items-start p-3 rounded-xl bg-accent/5 border border-accent/10">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-accent text-accent-foreground text-sm font-bold shrink-0">
                2
              </div>
              <div>
                <h4 className="font-semibold text-sm flex items-center gap-1.5">
                  <ArrowRight className="w-4 h-4 text-accent" /> Sign In & Get Your Code
                </h4>
                <p className="text-xs text-muted-foreground mt-0.5">
                  After confirming, sign in to see your unique verification code on your dashboard.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex gap-3 items-start p-3 rounded-xl bg-green-500/5 border border-green-500/10">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-green-600 text-white text-sm font-bold shrink-0">
                3
              </div>
              <div>
                <h4 className="font-semibold text-sm flex items-center gap-1.5">
                  <MessageSquare className="w-4 h-4 text-green-600" /> Share Code With Teacher
                </h4>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Share your verification code with your teacher. Once they verify you, you'll get full access!
                </p>
              </div>
            </div>

            {/* Step 4 */}
            <div className="flex gap-3 items-start p-3 rounded-xl bg-muted/50 border border-border/50">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-foreground text-background text-sm font-bold shrink-0">
                4
              </div>
              <div>
                <h4 className="font-semibold text-sm flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4" /> Access Unlocked!
                </h4>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Once verified, enjoy videos, live classes, quizzes, and more.
                </p>
              </div>
            </div>

            <Link to="/login" className="block mt-4">
              <Button className="w-full" size="lg">
                Go to Sign In <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </Link>

            <p className="text-center text-[11px] text-muted-foreground">
              Didn't get the email? Check your spam folder or try signing up again.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SignupSuccess;
