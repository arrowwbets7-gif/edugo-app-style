import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { X, Monitor, MapPin, Phone, GraduationCap } from "lucide-react";

const COACHING_CHOICE_KEY = "edugo_coaching_choice_shown";

const CoachingChoiceModal = () => {
  const [visible, setVisible] = useState(false);
  const [choice, setChoice] = useState<"online" | "offline" | null>(null);
  const [countdown, setCountdown] = useState(5);
  const navigate = useNavigate();

  useEffect(() => {
    const shown = sessionStorage.getItem(COACHING_CHOICE_KEY);
    if (!shown) setVisible(true);
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

  const handleOnline = () => {
    setChoice("online");
  };

  const handleOffline = () => {
    setChoice("offline");
  };

  const goToSignup = () => {
    sessionStorage.setItem(COACHING_CHOICE_KEY, "true");
    navigate("/signup");
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-300">
      <Card className="w-full max-w-md border-accent/30 shadow-2xl relative overflow-hidden">
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2 z-10 text-muted-foreground hover:text-foreground"
          onClick={handleClose}
        >
          <X className="w-5 h-5" />
        </Button>

        <CardContent className="pt-8 pb-6 px-6">
          {!choice ? (
            <div className="text-center space-y-6">
              <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto">
                <GraduationCap className="w-8 h-8 text-accent" />
              </div>
              <div>
                <h2 className="text-xl font-bold font-heading">Welcome to EduGo Classes!</h2>
                <p className="text-sm text-muted-foreground mt-2">How would you like to learn?</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={handleOnline}
                  className="flex flex-col items-center gap-3 p-5 rounded-2xl border-2 border-border hover:border-accent hover:bg-accent/5 transition-all duration-300 group"
                >
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-accent/10 transition-colors">
                    <Monitor className="w-6 h-6 text-primary group-hover:text-accent transition-colors" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">Online</p>
                    <p className="text-[10px] text-muted-foreground">Learn from anywhere</p>
                  </div>
                </button>
                <button
                  onClick={handleOffline}
                  className="flex flex-col items-center gap-3 p-5 rounded-2xl border-2 border-border hover:border-accent hover:bg-accent/5 transition-all duration-300 group"
                >
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-accent/10 transition-colors">
                    <MapPin className="w-6 h-6 text-primary group-hover:text-accent transition-colors" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">Offline</p>
                    <p className="text-[10px] text-muted-foreground">Visit our center</p>
                  </div>
                </button>
              </div>
            </div>
          ) : choice === "online" ? (
            <div className="text-center space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-300">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                <Monitor className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-bold">Online Coaching</h3>
                <p className="text-sm text-muted-foreground mt-2">
                  Sign up and contact our teacher to get verified and access all study materials.
                </p>
              </div>
              <Button onClick={goToSignup} className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-semibold">
                Sign Up Now
              </Button>
              <a
                href="https://wa.me/919477408004?text=Hi%20EduGoClasses,%20I%20want%20to%20join%20online%20coaching."
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <Phone className="w-4 h-4" /> Contact: 94774 08004
              </a>
              <p className="text-xs text-muted-foreground">Redirecting in {countdown}s...</p>
            </div>
          ) : (
            <div className="text-center space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-300">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                <MapPin className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-bold">Offline Coaching</h3>
                <p className="text-sm text-muted-foreground mt-2">
                  Visit our coaching center for in-person classes. Contact us for more details!
                </p>
              </div>
              <a
                href="https://maps.app.goo.gl/SeUgEj9H6KqZGqPd9"
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full"
              >
                <div className="relative rounded-xl overflow-hidden border border-border h-40">
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3684.0!2d88.3!3d22.5!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjLCsDMwJzAwLjAiTiA4OMKwMTgnMDAuMCJF!5e0!3m2!1sen!2sin!4v1234567890"
                    className="w-full h-full border-0 pointer-events-none"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent flex items-end justify-center pb-3">
                    <span className="text-sm font-semibold flex items-center gap-1.5 bg-accent/90 text-accent-foreground px-4 py-1.5 rounded-full">
                      <MapPin className="w-3.5 h-3.5" /> View on Google Maps
                    </span>
                  </div>
                </div>
              </a>
              <a
                href="https://wa.me/919477408004?text=Hi%20EduGoClasses,%20I%20want%20to%20know%20about%20offline%20coaching."
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 text-sm font-medium text-accent hover:underline"
              >
                <Phone className="w-4 h-4" /> Contact: 94774 08004
              </a>
              <p className="text-xs text-muted-foreground">Closing in {countdown}s...</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CoachingChoiceModal;
