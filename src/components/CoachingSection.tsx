import { BookOpen, Users, HelpCircle, BookMarked, ClipboardList, GraduationCap, Award } from "lucide-react";

const programs = [
  { title: "WB Board Coaching", icon: BookOpen, color: "bg-blue-500/10 text-blue-600" },
  { title: "Bihar Board Coaching", icon: BookMarked, color: "bg-emerald-500/10 text-emerald-600" },
  { title: "CBSE Coaching", icon: ClipboardList, color: "bg-orange-500/10 text-orange-600" },
  { title: "ICSE Coaching", icon: Award, color: "bg-violet-500/10 text-violet-600" },
];

const features = [
  { icon: Users, text: "Small Batches", desc: "Max 15 students per batch" },
  { icon: GraduationCap, text: "Personal Attention", desc: "Dedicated mentors for each student" },
  { icon: HelpCircle, text: "Doubt Solving", desc: "One-on-one doubt clearing sessions" },
];

const CoachingSection = () => {
  return (
    <section id="coaching" className="section-padding">
      <div className="container mx-auto">
        <div className="text-center mb-14">
          <span className="inline-block text-xs font-bold text-accent uppercase tracking-[0.2em] mb-3">For School Students</span>
          <h2 className="text-3xl md:text-4xl font-bold font-heading text-foreground">
            School Coaching Programs
          </h2>
          <p className="text-muted-foreground mt-3 max-w-md mx-auto">Expert coaching for all major boards with proven results</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-12">
          {programs.map((p, i) => (
            <div
              key={p.title}
              className="glass-card p-6 text-center cursor-pointer group opacity-0 animate-fade-in-up"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <div className={`w-14 h-14 rounded-2xl ${p.color} flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300`}>
                <p.icon className="w-7 h-7" />
              </div>
              <h3 className="font-bold text-foreground text-sm md:text-base">{p.title}</h3>
            </div>
          ))}
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          {features.map((f, i) => (
            <div key={f.text} className="flex items-start gap-4 p-5 rounded-2xl bg-secondary/80 opacity-0 animate-fade-in-up" style={{ animationDelay: `${i * 0.1 + 0.3}s` }}>
              <div className="p-2.5 rounded-xl bg-accent/10 shrink-0">
                <f.icon className="w-5 h-5 text-accent" />
              </div>
              <div>
                <h4 className="font-bold text-foreground text-sm">{f.text}</h4>
                <p className="text-muted-foreground text-xs mt-0.5">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CoachingSection;
