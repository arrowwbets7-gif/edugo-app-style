import { Compass, GraduationCap, BookMarked, Heart } from "lucide-react";

const reasons = [
  { icon: Compass, title: "Complete Admission Guidance", desc: "End-to-end support from application to enrollment" },
  { icon: GraduationCap, title: "School Coaching + Career Support", desc: "Holistic approach to student success" },
  { icon: BookMarked, title: "Regular & Distance Courses", desc: "Flexible learning options for every student" },
  { icon: Heart, title: "Personal Mentorship", desc: "One-on-one guidance from experienced mentors" },
];

const WhyChooseSection = () => {
  return (
    <section className="section-padding bg-primary text-primary-foreground">
      <div className="container mx-auto">
        <div className="text-center mb-12">
          <span className="text-sm font-semibold text-accent uppercase tracking-wider">Our Promise</span>
          <h2 className="text-3xl md:text-4xl font-bold font-heading mt-2">
            Why Choose EduGo?
          </h2>
        </div>

        <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {reasons.map((r, i) => (
            <div
              key={r.title}
              className="flex items-start gap-4 p-5 rounded-2xl bg-primary-foreground/10 backdrop-blur-sm opacity-0 animate-fade-in-up"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <div className="p-3 rounded-xl bg-accent/20 shrink-0">
                <r.icon className="w-6 h-6 text-accent" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">{r.title}</h3>
                <p className="text-primary-foreground/70 text-sm mt-1">{r.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyChooseSection;
