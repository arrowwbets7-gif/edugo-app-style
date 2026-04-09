import { ArrowRight, School, BookOpen, Scale, Briefcase } from "lucide-react";

const admissions = [
  { title: "NIOS / IGNOU", desc: "Open & distance learning programs", icon: School, color: "bg-sky-500/10 text-sky-600" },
  { title: "B.Ed / D.El.Ed", desc: "Teacher training & education degrees", icon: BookOpen, color: "bg-amber-500/10 text-amber-600" },
  { title: "Graduation / LL.B / B.Pharma", desc: "Professional degree admissions", icon: Scale, color: "bg-rose-500/10 text-rose-600" },
  { title: "GNM / BBA / MBA / BCA", desc: "Career-focused course admissions", icon: Briefcase, color: "bg-indigo-500/10 text-indigo-600" },
];

const AdmissionsSection = () => {
  return (
    <section id="admissions" className="section-padding bg-secondary/40">
      <div className="container mx-auto">
        <div className="text-center mb-14">
          <span className="inline-block text-xs font-bold text-accent uppercase tracking-[0.2em] mb-3">Higher Education</span>
          <h2 className="text-3xl md:text-4xl font-bold font-heading text-foreground">
            Admissions Open
          </h2>
          <p className="text-muted-foreground mt-3 max-w-md mx-auto">Get admission guidance for top universities across India</p>
        </div>

        {/* Horizontal scroll on mobile */}
        <div className="flex gap-4 overflow-x-auto scroll-hide pb-4 md:grid md:grid-cols-2 lg:grid-cols-4 md:overflow-visible">
          {admissions.map((a, i) => (
            <div
              key={a.title}
              className="glass-card p-6 min-w-[260px] md:min-w-0 flex flex-col opacity-0 animate-fade-in-up"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <div className={`w-12 h-12 rounded-xl ${a.color} flex items-center justify-center mb-4`}>
                <a.icon className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-foreground text-lg mb-1">{a.title}</h3>
              <p className="text-muted-foreground text-sm mb-5 flex-1">{a.desc}</p>
              <a
                href="#contact"
                className="inline-flex items-center gap-1.5 text-accent font-semibold text-sm hover:gap-3 transition-all duration-300 group"
              >
                Apply Now <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AdmissionsSection;
