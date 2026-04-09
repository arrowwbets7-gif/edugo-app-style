import { ArrowRight } from "lucide-react";

const admissions = [
  { title: "NIOS / IGNOU", desc: "Open & distance learning", emoji: "🎓" },
  { title: "B.Ed / D.El.Ed", desc: "Teacher training programs", emoji: "👩‍🏫" },
  { title: "Graduation / LL.B / B.Pharma", desc: "Professional degrees", emoji: "⚖️" },
  { title: "GNM / BBA / MBA / BCA", desc: "Career-focused courses", emoji: "💼" },
];

const AdmissionsSection = () => {
  return (
    <section id="admissions" className="section-padding bg-secondary/50">
      <div className="container mx-auto">
        <div className="text-center mb-12">
          <span className="text-sm font-semibold text-accent uppercase tracking-wider">Higher Education</span>
          <h2 className="text-3xl md:text-4xl font-bold font-heading text-foreground mt-2">
            Admissions Open
          </h2>
        </div>

        {/* Horizontal scroll on mobile */}
        <div className="flex gap-4 overflow-x-auto scroll-hide pb-4 md:grid md:grid-cols-2 lg:grid-cols-4 md:overflow-visible">
          {admissions.map((a, i) => (
            <div
              key={a.title}
              className="glass-card p-6 min-w-[260px] md:min-w-0 flex flex-col opacity-0 animate-fade-in-up"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <span className="text-3xl mb-3">{a.emoji}</span>
              <h3 className="font-bold text-foreground text-lg mb-1">{a.title}</h3>
              <p className="text-muted-foreground text-sm mb-4 flex-1">{a.desc}</p>
              <a
                href="#contact"
                className="inline-flex items-center gap-1 text-accent font-semibold text-sm hover:gap-2 transition-all duration-300"
              >
                Apply Now <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AdmissionsSection;
