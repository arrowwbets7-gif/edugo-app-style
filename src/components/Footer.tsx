import { Phone, Mail, MapPin } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-primary text-primary-foreground pb-24 md:pb-8">
      <div className="container mx-auto px-5 py-12">
        <div className="grid md:grid-cols-3 gap-8 mb-10">
          {/* Brand */}
          <div>
            <div className="flex items-center mb-4">
              <span className="text-lg font-extrabold font-heading">
                EduGo<span className="text-accent">Classes</span>
              </span>
            </div>
            <p className="text-primary-foreground/50 text-sm leading-relaxed">All India Admission Forum – Your trusted partner for school coaching and higher education admissions.</p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold text-sm mb-4">Quick Links</h4>
            <div className="space-y-2.5">
              <a href="#coaching" className="block text-primary-foreground/60 text-sm hover:text-primary-foreground transition-colors">School Coaching</a>
              <a href="#admissions" className="block text-primary-foreground/60 text-sm hover:text-primary-foreground transition-colors">Admissions</a>
              <a href="#contact" className="block text-primary-foreground/60 text-sm hover:text-primary-foreground transition-colors">Contact Us</a>
            </div>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-bold text-sm mb-4">Contact Info</h4>
            <div className="space-y-3">
              <a href="tel:9477408004" className="flex items-center gap-2.5 text-primary-foreground/60 text-sm hover:text-primary-foreground transition-colors">
                <Phone className="w-4 h-4 text-accent" /> 94774 08004
              </a>
              <a href="mailto:edugo4u@gmail.com" className="flex items-center gap-2.5 text-primary-foreground/60 text-sm hover:text-primary-foreground transition-colors">
                <Mail className="w-4 h-4 text-accent" /> edugo4u@gmail.com
              </a>
              <div className="flex items-start gap-2.5 text-primary-foreground/60 text-sm">
                <MapPin className="w-4 h-4 text-accent shrink-0 mt-0.5" /> All India Admission Support
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-primary-foreground/10 pt-6 text-center">
          <p className="text-primary-foreground/40 text-sm">© {new Date().getFullYear()} EduGoClasses – All India Admission Forum. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
