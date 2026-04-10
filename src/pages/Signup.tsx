import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Mail, Lock, User, GraduationCap, Eye, EyeOff, ArrowRight } from "lucide-react";
import { toast } from "sonner";

const classOptions = [
  "Class 5", "Class 6", "Class 7", "Class 8", "Class 9", "Class 10",
  "Class 11", "Class 12", "Graduation", "NIOS", "IGNOU", "B.Ed", "D.El.Ed",
  "LL.B", "B.Pharma", "GNM", "BBA", "MBA", "BCA", "Other",
];

const Signup = () => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [studentClass, setStudentClass] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signUp, signIn } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim() || !password.trim() || !studentClass) {
      toast.error("Please fill all fields");
      return;
    }
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    setLoading(true);
    const { error } = await signUp(email.trim(), password, fullName.trim(), studentClass);
    setLoading(false);
    if (error) {
      toast.error(error.message);
    } else {
      const { error: signInError } = await signIn(email.trim(), password);
      if (signInError) {
        toast.error(signInError.message);
      } else {
        toast.success("Account created! Share your code with your teacher.");
        navigate("/dashboard");
      }
    }
  };

  return (
    <div className="min-h-screen bg-primary flex flex-col">
      {/* Top decorative area */}
      <div className="flex-shrink-0 px-6 pt-12 pb-6">
        <Link to="/" className="text-xl font-extrabold font-heading text-primary-foreground">
          EduGo<span className="text-accent">Classes</span>
        </Link>
        <h1 className="text-3xl font-bold font-heading text-primary-foreground mt-6 leading-tight">
          Create your<br />account
        </h1>
        <p className="text-primary-foreground/60 text-sm mt-2">Start your learning journey today</p>
      </div>

      {/* Form card */}
      <div className="flex-1 bg-background rounded-t-[2rem] px-6 pt-7 pb-8 animate-fade-in">
        <form onSubmit={handleSubmit} className="space-y-4 max-w-md mx-auto">
          <div className="space-y-1.5">
            <Label htmlFor="fullName" className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Full Name</Label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50" />
              <Input
                id="fullName"
                placeholder="John Doe"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="pl-11 h-12 rounded-xl bg-secondary/50 border-border/30 focus:bg-card transition-colors"
                required
                maxLength={100}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50" />
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-11 h-12 rounded-xl bg-secondary/50 border-border/30 focus:bg-card transition-colors"
                required
                maxLength={255}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="class" className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Class / Course</Label>
            <Select value={studentClass} onValueChange={setStudentClass}>
              <SelectTrigger className="w-full h-12 rounded-xl bg-secondary/50 border-border/30">
                <div className="flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-muted-foreground/50" />
                  <SelectValue placeholder="Select your class" />
                </div>
              </SelectTrigger>
              <SelectContent>
                {classOptions.map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password" className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Password</Label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50" />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Min 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-11 pr-11 h-12 rounded-xl bg-secondary/50 border-border/30 focus:bg-card transition-colors"
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/50 hover:text-foreground transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full h-12 rounded-xl text-sm font-semibold bg-accent hover:bg-accent/90 text-accent-foreground shadow-lg shadow-accent/20"
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-accent-foreground/30 border-t-accent-foreground rounded-full animate-spin" />
                Creating account...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                Create Account <ArrowRight className="w-4 h-4" />
              </span>
            )}
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground mt-6">
          Already have an account?{" "}
          <Link to="/login" className="text-accent font-semibold hover:underline">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
