import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { LogIn, LayoutDashboard } from "lucide-react";

const Header = () => {
  const { user } = useAuth();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-primary/95 backdrop-blur-lg border-b border-primary-foreground/10">
      <div className="container mx-auto px-5 py-3.5 flex items-center justify-between">
        <Link to="/" className="flex items-center">
          <span className="text-lg font-extrabold font-heading text-primary-foreground leading-none">
            EduGo<span className="text-accent">Classes</span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          <a href="#coaching" className="text-primary-foreground/70 hover:text-primary-foreground text-sm font-medium transition-colors">Coaching</a>
          <a href="#admissions" className="text-primary-foreground/70 hover:text-primary-foreground text-sm font-medium transition-colors">Admissions</a>
          <a href="#contact" className="text-primary-foreground/70 hover:text-primary-foreground text-sm font-medium transition-colors">Contact</a>
          {user ? (
            <Link to="/dashboard">
              <Button size="sm" className="bg-accent hover:bg-accent/90 text-accent-foreground rounded-xl px-5 font-bold shadow-md shadow-accent/20">
                <LayoutDashboard className="w-4 h-4 mr-1.5" /> Dashboard
              </Button>
            </Link>
          ) : (
            <Link to="/login">
              <Button size="sm" className="bg-accent hover:bg-accent/90 text-accent-foreground rounded-xl px-5 font-bold shadow-md shadow-accent/20">
                <LogIn className="w-4 h-4 mr-1.5" /> Login
              </Button>
            </Link>
          )}
        </nav>

        {/* Mobile login button */}
        <div className="md:hidden">
          {user ? (
            <Link to="/dashboard">
              <Button size="sm" className="bg-accent hover:bg-accent/90 text-accent-foreground rounded-xl px-4 font-bold text-xs">
                Dashboard
              </Button>
            </Link>
          ) : (
            <Link to="/login">
              <Button size="sm" className="bg-accent hover:bg-accent/90 text-accent-foreground rounded-xl px-4 font-bold text-xs">
                Login
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
