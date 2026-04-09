import { Instagram, ExternalLink } from "lucide-react";

const SocialProofSection = () => {
  return (
    <section className="section-padding bg-secondary/40">
      <div className="container mx-auto text-center">
        <span className="inline-block text-xs font-bold text-accent uppercase tracking-[0.2em] mb-3">Follow Us</span>
        <h2 className="text-3xl md:text-4xl font-bold font-heading text-foreground mb-3">
          Stay Connected
        </h2>
        <p className="text-muted-foreground mb-8 max-w-md mx-auto">Follow us for latest updates, tips & success stories</p>

        <a
          href="https://www.instagram.com/edugoclasses"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-[hsl(330,70%,50%)] to-[hsl(25,90%,55%)] text-primary-foreground font-bold text-lg shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group"
        >
          <Instagram className="w-6 h-6" />
          @edugoclasses
          <ExternalLink className="w-4 h-4 opacity-60 group-hover:opacity-100 transition-opacity" />
        </a>
      </div>
    </section>
  );
};

export default SocialProofSection;
