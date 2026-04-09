import { useState } from "react";
import { Phone, Mail, Send } from "lucide-react";

const ContactSection = () => {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const msg = `Hi EduGo, my name is ${name} and my phone number is ${phone}. I need help with admissions.`;
    window.open(`https://wa.me/917439010107?text=${encodeURIComponent(msg)}`, "_blank");
    setSubmitted(true);
  };

  return (
    <section id="contact" className="section-padding">
      <div className="container mx-auto max-w-lg">
        <div className="text-center mb-10">
          <span className="text-sm font-semibold text-accent uppercase tracking-wider">Get in Touch</span>
          <h2 className="text-3xl md:text-4xl font-bold font-heading text-foreground mt-2">
            Contact Us
          </h2>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
          <a href="tel:7439010107" className="flex items-center gap-2 px-4 py-2 rounded-full bg-secondary text-secondary-foreground text-sm font-medium">
            <Phone className="w-4 h-4 text-accent" /> 7439010107
          </a>
          <a href="mailto:edugo4u@gmail.com" className="flex items-center gap-2 px-4 py-2 rounded-full bg-secondary text-secondary-foreground text-sm font-medium">
            <Mail className="w-4 h-4 text-accent" /> edugo4u@gmail.com
          </a>
        </div>

        <div className="glass-card p-6 md:p-8">
          {submitted ? (
            <div className="text-center py-8">
              <span className="text-5xl block mb-4">🎉</span>
              <h3 className="text-xl font-bold text-foreground mb-2">Thank You!</h3>
              <p className="text-muted-foreground">We'll connect with you shortly on WhatsApp.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-foreground mb-1.5">Your Name</label>
                <input
                  id="name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                  className="w-full px-4 py-3 rounded-xl bg-secondary border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all"
                />
              </div>
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-foreground mb-1.5">Phone Number</label>
                <input
                  id="phone"
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Enter your phone number"
                  className="w-full px-4 py-3 rounded-xl bg-secondary border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all"
                />
              </div>
              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-accent text-accent-foreground font-semibold text-lg shadow-lg shadow-accent/30 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300"
              >
                <Send className="w-5 h-5" /> Send via WhatsApp
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
