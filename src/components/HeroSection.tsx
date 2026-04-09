import { MessageCircle, ArrowRight, Sparkles } from "lucide-react";
import heroBg from "@/assets/hero-bg.jpg";

const HeroSection = () => {
  return (
    <section className="relative min-h-[92vh] flex items-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <img src={heroBg} alt="Students achieving their dreams with EduGo" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-primary/95 via-primary/85 to-primary/95" />
      </div>

      {/* Decorative elements */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-accent/10 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />

      {/* Content */}
      <div className="relative z-10 container mx-auto px-5 py-24 text-center">
        <div className="max-w-2xl mx-auto space-y-7">
          <span className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-accent/15 text-accent-foreground text-sm font-semibold animate-pulse-soft border border-accent/25 backdrop-blur-sm">
            <Sparkles className="w-4 h-4 text-accent" />
            Limited Seats – Apply Now
          </span>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold font-heading text-primary-foreground leading-[1.1] animate-fade-in-up">
            Coaching + Admissions –{" "}
            <span className="bg-gradient-to-r from-accent to-[hsl(355,78%,70%)] bg-clip-text text-transparent">
              All in One Place
            </span>
          </h1>

          <p className="text-lg md:text-xl text-primary-foreground/75 font-medium max-w-lg mx-auto opacity-0 animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
            From School Success to Career Growth with EduGo – Your Trusted Education Partner
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-2 opacity-0 animate-fade-in-up" style={{ animationDelay: "0.4s" }}>
            <a
              href="#contact"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-accent text-accent-foreground font-bold text-lg shadow-lg shadow-accent/30 hover:shadow-xl hover:shadow-accent/40 hover:-translate-y-1 transition-all duration-300 group"
            >
              Apply Now
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </a>
            <a
              href="https://wa.me/917439010107?text=Hi%20EduGo%2C%20I%20need%20help%20with%20admissions"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl border-2 border-primary-foreground/20 text-primary-foreground font-semibold text-lg hover:bg-primary-foreground/10 backdrop-blur-sm transition-all duration-300"
            >
              <MessageCircle className="w-5 h-5" />
              Chat on WhatsApp
            </a>
          </div>

          {/* Trust badges */}
          <div className="flex flex-wrap justify-center gap-6 pt-6 opacity-0 animate-fade-in-up" style={{ animationDelay: "0.6s" }}>
            <div className="flex items-center gap-2 text-primary-foreground/60 text-sm">
              <div className="w-2 h-2 rounded-full bg-green-400" />
              500+ Students Guided
            </div>
            <div className="flex items-center gap-2 text-primary-foreground/60 text-sm">
              <div className="w-2 h-2 rounded-full bg-green-400" />
              Pan India Support
            </div>
            <div className="flex items-center gap-2 text-primary-foreground/60 text-sm">
              <div className="w-2 h-2 rounded-full bg-green-400" />
              Expert Mentors
            </div>
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
