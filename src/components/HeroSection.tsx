import { MessageCircle } from "lucide-react";
import heroBg from "@/assets/hero-bg.jpg";

const HeroSection = () => {
  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <img src={heroBg} alt="Students achieving their dreams with EduGo" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-primary/90 via-primary/80 to-primary/95" />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-5 py-20 text-center">
        <div className="max-w-2xl mx-auto space-y-6">
          <span className="inline-block px-4 py-1.5 rounded-full bg-accent/20 text-accent-foreground text-sm font-medium animate-pulse-soft border border-accent/30">
            🔥 Limited Seats – Apply Now
          </span>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold font-heading text-primary-foreground leading-tight animate-fade-in-up">
            Coaching + Admissions –{" "}
            <span className="text-gradient bg-gradient-to-r from-accent to-[hsl(355,78%,70%)] bg-clip-text text-transparent">
              All in One Place
            </span>
          </h1>

          <p className="text-lg md:text-xl text-primary-foreground/80 font-medium opacity-0 animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
            From School Success to Career Growth with EduGo
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4 opacity-0 animate-fade-in-up" style={{ animationDelay: "0.4s" }}>
            <a
              href="#contact"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-accent text-accent-foreground font-semibold text-lg shadow-lg shadow-accent/30 hover:shadow-xl hover:shadow-accent/40 hover:-translate-y-0.5 transition-all duration-300"
            >
              Apply Now
            </a>
            <a
              href="https://wa.me/917439010107?text=Hi%20EduGo%2C%20I%20need%20help%20with%20admissions"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl border-2 border-primary-foreground/30 text-primary-foreground font-semibold text-lg hover:bg-primary-foreground/10 transition-all duration-300"
            >
              <MessageCircle className="w-5 h-5" />
              Chat on WhatsApp
            </a>
          </div>
        </div>
      </div>

      {/* Bottom curve */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 60" fill="none" className="w-full">
          <path d="M0 60L1440 60L1440 0C1440 0 1080 60 720 60C360 60 0 0 0 0L0 60Z" fill="hsl(210, 11%, 98%)" />
        </svg>
      </div>
    </section>
  );
};

export default HeroSection;
