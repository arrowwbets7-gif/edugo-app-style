import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { X, Monitor, MapPin, Phone, GraduationCap, ArrowRight } from "lucide-react";

const COACHING_CHOICE_KEY = "edugo_coaching_choice_shown";

const CoachingChoiceModal = () => {
  const [visible, setVisible] = useState(false);
  const [choice, setChoice] = useState<"online" | "offline" | null>(null);
  const [countdown, setCountdown] = useState(5);
  const navigate = useNavigate();

  useEffect(() => {
    const shown = sessionStorage.getItem(COACHING_CHOICE_KEY);
    if (!shown) {
      const timer = setTimeout(() => setVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
    if (!choice) return;
    if (countdown <= 0) {
      handleClose();
      return;
    }
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [choice, countdown]);

  const handleClose = () => {
    sessionStorage.setItem(COACHING_CHOICE_KEY, "true");
    setVisible(false);
  };

  const goToSignup = () => {
    sessionStorage.setItem(COACHING_CHOICE_KEY, "true");
    navigate("/signup");
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[100] px-4 pb-4 animate-in slide-in-from-bottom-8 duration-500">
      <div className="max-w-lg mx-auto rounded-2xl border border-border/60 bg-card/95 backdrop-blur-xl shadow-2xl overflow-hidden">
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2 z-10 h-7 w-7 text-muted-foreground hover:text-foreground"
          onClick={handleClose}
        >
          <X className="w-4 h-4" />
        </Button>

        {!choice ? (
          <div className="p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-accent" />
              </div>
              <div>
                <h2 className="text-sm font-bold font-heading">Welcome to EduGo Classes!</h2>
                <p className="text-xs text-muted-foreground">How would you like to learn?</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setChoice("online")}
                className="flex items-center gap-3 p-3 rounded-xl border border-border hover:border-accent hover:bg-accent/5 transition-all group text-left"
              >
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-accent/10 transition-colors flex-shrink-0">
                  <Monitor className="w-4 h-4 text-primary group-hover:text-accent transition-colors" />
                </div>
                <div>
                  <p className="font-semibold text-xs">Online</p>
                  <p className="text-[10px] text-muted-foreground">Learn from home</p>
                </div>
              </button>
              <button
                onClick={() => setChoice("offline")}
                className="flex items-center gap-3 p-3 rounded-xl border border-border hover:border-accent hover:bg-accent/5 transition-all group text-left"
              >
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-accent/10 transition-colors flex-shrink-0">
                  <MapPin className="w-4 h-4 text-primary group-hover:text-accent transition-colors" />
                </div>
                <div>
                  <p className="font-semibold text-xs">Offline</p>
                  <p className="text-[10px] text-muted-foreground">Visit our center</p>
                </div>
              </button>
            </div>
          </div>
        ) : choice === "online" ? (
          <div className="p-5 animate-in fade-in duration-300">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Monitor className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-bold">Online Coaching</h3>
                <p className="text-[10px] text-muted-foreground">Sign up & contact teacher to get verified</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={goToSignup} size="sm" className="flex-1 bg-accent hover:bg-accent/90 text-accent-foreground text-xs">
                Sign Up <ArrowRight className="w-3 h-3 ml-1" />
              </Button>
              <a
                href="https://wa.me/919477408004?text=Hi%20EduGoClasses,%20I%20want%20to%20join%20online%20coaching."
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant="outline" size="sm" className="text-xs gap-1">
                  <Phone className="w-3 h-3" /> Call
                </Button>
              </a>
            </div>
            <p className="text-[10px] text-muted-foreground text-center mt-2">Closing in {countdown}s</p>
          </div>
        ) : (
          <div className="p-5 animate-in fade-in duration-300">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <MapPin className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-bold">Offline Coaching</h3>
                <p className="text-[10px] text-muted-foreground">Visit our center for in-person classes</p>
              </div>
            </div>
            <div className="flex gap-2">
              <a
                href="https://maps.app.goo.gl/SeUgEj9H6KqZGqPd9"
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1"
              >
                <Button variant="outline" size="sm" className="w-full text-xs gap-1">
                  <MapPin className="w-3 h-3" /> Get Directions
                </Button>
              </a>
              <a
                href="https://wa.me/919477408004?text=Hi%20EduGoClasses,%20I%20want%20to%20know%20about%20offline%20coaching."
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant="outline" size="sm" className="text-xs gap-1">
                  <Phone className="w-3 h-3" /> Call
                </Button>
              </a>
            </div>
            <p className="text-[10px] text-muted-foreground text-center mt-2">Closing in {countdown}s</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CoachingChoiceModal;
