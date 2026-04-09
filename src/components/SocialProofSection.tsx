import { Instagram } from "lucide-react";

const SocialProofSection = () => {
  return (
    <section className="section-padding">
      <div className="container mx-auto text-center">
        <span className="text-sm font-semibold text-accent uppercase tracking-wider">Follow Us</span>
        <h2 className="text-3xl md:text-4xl font-bold font-heading text-foreground mt-2 mb-8">
          Stay Connected
        </h2>

        <a
          href="https://www.instagram.com/edugoclasses"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-[hsl(330,70%,50%)] to-[hsl(25,90%,55%)] text-primary-foreground font-semibold text-lg shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300"
        >
          <Instagram className="w-6 h-6" />
          @edugoclasses on Instagram
        </a>

        <p className="text-muted-foreground mt-4 text-sm">Follow us for latest updates, tips & success stories</p>
      </div>
    </section>
  );
};

export default SocialProofSection;
