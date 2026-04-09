import { useState } from "react";
import { Phone, Mail, Send, User, Smartphone } from "lucide-react";

const ContactSection = () => {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const msg = `Hi EduGoClasses, my name is ${name} and my phone number is ${phone}. I need help with admissions.`;
    window.open(`https://wa.me/919477408004?text=${encodeURIComponent(msg)}`, "_blank");
    setSubmitted(true);
  };

  return (
    <section id="contact" className="section-padding bg-secondary/40">
      <div className="container mx-auto max-w-lg">
        <div className="text-center mb-10">
          <span className="inline-block text-xs font-bold text-accent uppercase tracking-[0.2em] mb-3">Get in Touch</span>
          <h2 className="text-3xl md:text-4xl font-bold font-heading text-foreground">
            Contact Us
          </h2>
          <p className="text-muted-foreground mt-3">Reach out and we'll get back to you within 24 hours</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center mb-8">
          <a href="tel:9477408004" className="flex items-center gap-2.5 px-5 py-3 rounded-xl bg-card shadow-sm border border-border text-foreground text-sm font-medium hover:shadow-md transition-all">
            <Phone className="w-4 h-4 text-accent" /> 94774 08004
          </a>
          <a href="mailto:edugo4u@gmail.com" className="flex items-center gap-2.5 px-5 py-3 rounded-xl bg-card shadow-sm border border-border text-foreground text-sm font-medium hover:shadow-md transition-all">
            <Mail className="w-4 h-4 text-accent" /> edugo4u@gmail.com
          </a>
        </div>

        <div className="glass-card p-6 md:p-8">
          {submitted ? (
            <div className="text-center py-10">
              <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4">
                <Send className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">Message Sent!</h3>
              <p className="text-muted-foreground">We'll connect with you shortly on WhatsApp.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="name" className="block text-sm font-semibold text-foreground mb-2">Your Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    id="name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-secondary border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent/40 transition-all"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="phone" className="block text-sm font-semibold text-foreground mb-2">Phone Number</label>
                <div className="relative">
                  <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    id="phone"
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Enter your phone number"
                    className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-secondary border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent/40 transition-all"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-accent text-accent-foreground font-bold text-lg shadow-lg shadow-accent/30 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300"
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
