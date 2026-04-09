import { Search, FileCheck, UserCheck, Rocket } from "lucide-react";

const steps = [
  { icon: Search, title: "Explore Courses", desc: "Browse our coaching programs and admission options", step: "01" },
  { icon: FileCheck, title: "Apply Online", desc: "Fill a quick form or message us on WhatsApp", step: "02" },
  { icon: UserCheck, title: "Get Guidance", desc: "Our expert team guides you through every step", step: "03" },
  { icon: Rocket, title: "Start Learning", desc: "Begin your journey towards academic success", step: "04" },
];

const HowItWorksSection = () => {
  return (
    <section className="section-padding bg-secondary/40">
      <div className="container mx-auto">
        <div className="text-center mb-14">
          <span className="inline-block text-xs font-bold text-accent uppercase tracking-[0.2em] mb-3">Simple Process</span>
          <h2 className="text-3xl md:text-4xl font-bold font-heading text-foreground">
            How It Works
          </h2>
          <p className="text-muted-foreground mt-3 max-w-md mx-auto">Getting started with EduGoClasses is easy — just 4 simple steps</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 max-w-4xl mx-auto">
          {steps.map((s, i) => (
            <div
              key={s.title}
              className="glass-card p-6 text-center relative opacity-0 animate-fade-in-up"
              style={{ animationDelay: `${i * 0.15}s` }}
            >
              <span className="text-5xl font-extrabold font-heading text-accent/10 absolute top-3 right-4">{s.step}</span>
              <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mx-auto mb-4">
                <s.icon className="w-6 h-6 text-accent" />
              </div>
              <h3 className="font-bold text-foreground text-sm md:text-base mb-1">{s.title}</h3>
              <p className="text-muted-foreground text-xs">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
