import { BookOpen, Users, HelpCircle } from "lucide-react";

const programs = [
  { title: "WB Board Coaching", emoji: "📘" },
  { title: "Bihar Board Coaching", emoji: "📗" },
  { title: "CBSE Coaching", emoji: "📕" },
  { title: "ICSE Coaching", emoji: "📙" },
];

const features = [
  { icon: Users, text: "Small Batches" },
  { icon: BookOpen, text: "Personal Attention" },
  { icon: HelpCircle, text: "Doubt Solving" },
];

const CoachingSection = () => {
  return (
    <section id="coaching" className="section-padding">
      <div className="container mx-auto">
        <div className="text-center mb-12">
          <span className="text-sm font-semibold text-accent uppercase tracking-wider">For School Students</span>
          <h2 className="text-3xl md:text-4xl font-bold font-heading text-foreground mt-2">
            School Coaching Programs
          </h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-10">
          {programs.map((p, i) => (
            <div
              key={p.title}
              className="glass-card p-6 text-center cursor-pointer group opacity-0 animate-fade-in-up"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <span className="text-4xl block mb-3 group-hover:scale-110 transition-transform duration-300">{p.emoji}</span>
              <h3 className="font-semibold text-foreground text-sm md:text-base">{p.title}</h3>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap justify-center gap-4">
          {features.map((f) => (
            <div key={f.text} className="flex items-center gap-2 px-4 py-2 rounded-full bg-secondary text-secondary-foreground text-sm font-medium">
              <f.icon className="w-4 h-4 text-accent" />
              {f.text}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CoachingSection;
