import { Phone, MessageCircle, ArrowRight } from "lucide-react";

const CTASection = () => {
  return (
    <section className="section-padding relative overflow-hidden">
      {/* Decorative gradient bg */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />

      <div className="container mx-auto text-center max-w-xl relative z-10">
        <h2 className="text-3xl md:text-4xl font-bold font-heading text-foreground mb-3">
          Start Your Journey Today
        </h2>
        <p className="text-muted-foreground mb-10">Take the first step towards your dream education. We're here to help.</p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="#contact"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-accent text-accent-foreground font-bold text-lg shadow-lg shadow-accent/30 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group"
          >
            Apply Now
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </a>
          <a
            href="tel:7439010107"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl border-2 border-border text-foreground font-semibold text-lg hover:bg-secondary transition-all duration-300"
          >
            <Phone className="w-5 h-5" />
            Call Now
          </a>
          <a
            href="https://wa.me/917439010107"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-[hsl(142,70%,38%)] text-primary-foreground font-bold text-lg shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
          >
            <MessageCircle className="w-5 h-5" />
            WhatsApp
          </a>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
