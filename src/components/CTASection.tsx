import { Phone, MessageCircle } from "lucide-react";

const CTASection = () => {
  return (
    <section className="section-padding bg-secondary/50">
      <div className="container mx-auto text-center max-w-xl">
        <h2 className="text-3xl md:text-4xl font-bold font-heading text-foreground mb-4">
          Start Your Journey Today
        </h2>
        <p className="text-muted-foreground mb-8">Take the first step towards your dream education</p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="#contact"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-accent text-accent-foreground font-semibold text-lg shadow-lg shadow-accent/30 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300"
          >
            Apply Now
          </a>
          <a
            href="tel:7439010107"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl border-2 border-foreground/20 text-foreground font-semibold text-lg hover:bg-foreground/5 transition-all duration-300"
          >
            <Phone className="w-5 h-5" />
            Call Now
          </a>
          <a
            href="https://wa.me/917439010107"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-[hsl(142,70%,40%)] text-primary-foreground font-semibold text-lg shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300"
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
