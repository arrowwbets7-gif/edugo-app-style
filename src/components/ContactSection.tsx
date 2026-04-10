import { useState } from "react";
import { Phone, Mail, Send, User, Smartphone, MapPin, Navigation } from "lucide-react";

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

        {/* Coaching Center Location */}
        <div className="glass-card p-5 mb-6 border border-accent/20">
          <div className="flex items-start gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
              <MapPin className="w-5 h-5 text-accent" />
            </div>
            <div>
              <h3 className="font-bold text-foreground text-sm">EduGo Offline Coaching Center</h3>
              <p className="text-muted-foreground text-xs mt-0.5">Visit us for in-person classes & guidance</p>
            </div>
          </div>
          <div className="rounded-xl overflow-hidden border border-border mb-3">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3888.0!2d77.59!3d12.97!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTLCsDU4JzEyLjAiTiA3N8KwMzUnMjQuMCJF!5e0!3m2!1sen!2sin!4v1700000000000"
              width="100%"
              height="180"
              style={{ border: 0 }}
              allowFullScreen={false}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="w-full"
            />
          </div>
          <a
            href="https://maps.app.goo.gl/SeUgEj9H6KqZGqPd9"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-xl bg-accent text-accent-foreground font-semibold text-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
          >
            <Navigation className="w-4 h-4" /> Get Directions
          </a>
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
