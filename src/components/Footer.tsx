const Footer = () => {
  return (
    <footer className="bg-primary text-primary-foreground/60 py-8 pb-24 md:pb-8">
      <div className="container mx-auto px-5 text-center">
        <p className="font-heading font-bold text-lg text-primary-foreground mb-2">
          Edu<span className="text-accent">Go</span> – All India Admission Forum
        </p>
        <p className="text-sm">© {new Date().getFullYear()} EduGo. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
