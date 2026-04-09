const stats = [
  { number: "500+", label: "Students Guided", emoji: "🎯" },
  { number: "Pan India", label: "Admission Support", emoji: "🇮🇳" },
  { number: "Trusted", label: "Education Partner", emoji: "🤝" },
  { number: "Limited", label: "Seats Available", emoji: "🔥" },
];

const TrustSection = () => {
  return (
    <section className="section-padding">
      <div className="container mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((s, i) => (
            <div
              key={s.label}
              className="glass-card p-6 text-center opacity-0 animate-fade-in-up"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <span className="text-3xl block mb-2">{s.emoji}</span>
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
