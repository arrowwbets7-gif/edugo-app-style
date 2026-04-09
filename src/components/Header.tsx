const Header = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-primary/95 backdrop-blur-lg border-b border-primary-foreground/10">
      <div className="container mx-auto px-5 py-3.5 flex items-center justify-between">
        <a href="#" className="flex items-center">
          <span className="text-lg font-extrabold font-heading text-primary-foreground leading-none">
            EduGo<span className="text-accent">Classes</span>
          </span>
        </a>

        <nav className="hidden md:flex items-center gap-8">
          <a href="#coaching" className="text-primary-foreground/70 hover:text-primary-foreground text-sm font-medium transition-colors">Coaching</a>
          <a href="#admissions" className="text-primary-foreground/70 hover:text-primary-foreground text-sm font-medium transition-colors">Admissions</a>
          <a href="#contact" className="text-primary-foreground/70 hover:text-primary-foreground text-sm font-medium transition-colors">Contact</a>
          <a
            href="#contact"
            className="px-6 py-2.5 rounded-xl bg-accent text-accent-foreground text-sm font-bold hover:bg-accent/90 shadow-md shadow-accent/20 transition-all"
          >
            Apply Now
          </a>
        </nav>
      </div>
    </header>
  );
};

export default Header;
