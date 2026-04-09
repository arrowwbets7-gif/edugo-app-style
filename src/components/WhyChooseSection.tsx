import { Compass, GraduationCap, BookMarked, Heart, CheckCircle2 } from "lucide-react";

const reasons = [
  { icon: Compass, title: "Complete Admission Guidance", desc: "End-to-end support from application to enrollment", highlights: ["Document assistance", "University selection", "Application support"] },
  { icon: GraduationCap, title: "School Coaching + Career Support", desc: "Holistic approach to student success", highlights: ["Board exam prep", "Career counseling", "Skill development"] },
  { icon: BookMarked, title: "Regular & Distance Courses", desc: "Flexible learning options for every student", highlights: ["NIOS & IGNOU", "Online classes", "Study materials"] },
  { icon: Heart, title: "Personal Mentorship", desc: "One-on-one guidance from experienced mentors", highlights: ["Dedicated mentor", "Progress tracking", "Parent updates"] },
];

const WhyChooseSection = () => {
  return (
    <section className="section-padding bg-primary text-primary-foreground overflow-hidden relative">
      {/* Decorative */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-accent/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />

      <div className="container mx-auto relative z-10">
        <div className="text-center mb-14">
          <span className="inline-block text-xs font-bold text-accent uppercase tracking-[0.2em] mb-3">Our Promise</span>
          <h2 className="text-3xl md:text-4xl font-bold font-heading">
            Why Choose EduGo?
          </h2>
          <p className="text-primary-foreground/60 mt-3 max-w-md mx-auto">We go beyond teaching — we build futures</p>
        </div>

        <div className="grid md:grid-cols-2 gap-5 max-w-4xl mx-auto">
          {reasons.map((r, i) => (
            <div
              key={r.title}
              className="p-6 rounded-2xl bg-primary-foreground/[0.07] backdrop-blur-sm border border-primary-foreground/10 hover:bg-primary-foreground/10 transition-all duration-300 opacity-0 animate-fade-in-up"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="p-3 rounded-xl bg-accent/20 shrink-0">
                  <r.icon className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">{r.title}</h3>
                  <p className="text-primary-foreground/60 text-sm mt-1">{r.desc}</p>
                </div>
              </div>
              <div className="space-y-2 ml-[60px]">
                {r.highlights.map((h) => (
                  <div key={h} className="flex items-center gap-2 text-sm text-primary-foreground/70">
                    <CheckCircle2 className="w-4 h-4 text-accent shrink-0" />
                    {h}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyChooseSection;
