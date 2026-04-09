import { Home, BookOpen, GraduationCap, Phone } from "lucide-react";

const navItems = [
  { icon: Home, label: "Home", href: "#" },
  { icon: BookOpen, label: "Coaching", href: "#coaching" },
  { icon: GraduationCap, label: "Admissions", href: "#admissions" },
  { icon: Phone, label: "Contact", href: "#contact" },
];

const BottomNav = () => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-lg border-t border-border shadow-lg md:hidden">
      <div className="flex justify-around items-center py-2">
        {navItems.map((item) => (
          <a
            key={item.label}
            href={item.href}
            className="flex flex-col items-center gap-0.5 px-3 py-1.5 text-muted-foreground hover:text-accent transition-colors"
          >
            <item.icon className="w-5 h-5" />
            <span className="text-[10px] font-medium">{item.label}</span>
          </a>
        ))}
      </div>
    </nav>
  );
};

export default BottomNav;
