import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    name: "Rahul Sharma",
    course: "CBSE Coaching",
    text: "EduGoClasses helped me score 95% in my boards. The personal attention and small batch size made all the difference.",
    rating: 5,
  },
  {
    name: "Priya Das",
    course: "NIOS Admission",
    text: "I was confused about NIOS admission process. EduGoClasses guided me through every step seamlessly. Highly recommended!",
    rating: 5,
  },
  {
    name: "Amit Kumar",
    course: "B.Ed Admission",
    text: "Got my B.Ed admission without any hassle. The team was very supportive and responsive throughout.",
    rating: 5,
  },
  {
    name: "Sneha Roy",
    course: "WB Board Coaching",
    text: "Best coaching center for WB Board. The teachers are experienced and the doubt-solving sessions are very helpful.",
    rating: 5,
  },
];

const TestimonialsSection = () => {
  return (
    <section className="section-padding">
      <div className="container mx-auto">
        <div className="text-center mb-14">
          <span className="inline-block text-xs font-bold text-accent uppercase tracking-[0.2em] mb-3">Testimonials</span>
          <h2 className="text-3xl md:text-4xl font-bold font-heading text-foreground">
            What Our Students Say
          </h2>
          <p className="text-muted-foreground mt-3 max-w-md mx-auto">Real stories from students who achieved their goals with EduGoClasses</p>
        </div>

        <div className="flex gap-4 overflow-x-auto scroll-hide pb-4 md:grid md:grid-cols-2 lg:grid-cols-4 md:overflow-visible">
          {testimonials.map((t, i) => (
            <div
              key={t.name}
              className="glass-card p-6 min-w-[280px] md:min-w-0 flex flex-col opacity-0 animate-fade-in-up"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <Quote className="w-8 h-8 text-accent/20 mb-3" />
              <p className="text-foreground/80 text-sm leading-relaxed flex-1 mb-4">"{t.text}"</p>
              <div className="flex gap-0.5 mb-3">
                {Array.from({ length: t.rating }).map((_, j) => (
                  <Star key={j} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <div>
                <p className="font-bold text-foreground text-sm">{t.name}</p>
                <p className="text-muted-foreground text-xs">{t.course}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
