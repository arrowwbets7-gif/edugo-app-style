import { Target, Globe, ShieldCheck, Clock } from "lucide-react";

const stats = [
  { number: "500+", label: "Students Guided", icon: Target, color: "text-blue-600 bg-blue-500/10" },
  { number: "Pan India", label: "Admission Support", icon: Globe, color: "text-emerald-600 bg-emerald-500/10" },
  { number: "Trusted", label: "Education Partner", icon: ShieldCheck, color: "text-amber-600 bg-amber-500/10" },
  { number: "Limited", label: "Seats Available", icon: Clock, color: "text-rose-600 bg-rose-500/10" },
];

const TrustSection = () => {
  return (
    <section className="section-padding">
      <div className="container mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {stats.map((s, i) => (
            <div
              key={s.label}
              className="glass-card p-6 text-center opacity-0 animate-fade-in-up"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <div className={`w-12 h-12 rounded-xl ${s.color} flex items-center justify-center mx-auto mb-3`}>
                <s.icon className="w-6 h-6" />
              </div>
              <div className="text-2xl md:text-3xl font-extrabold font-heading text-foreground">{s.number}</div>
              <p className="text-muted-foreground text-sm mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrustSection;
