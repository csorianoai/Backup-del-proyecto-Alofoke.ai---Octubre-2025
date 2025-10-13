import { Menu, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import robotLogo from "@/assets/alofoke-robot-logo.png";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-3 group cursor-pointer">
            <img 
              src={robotLogo} 
              alt="Alofoke.ai Robot Mascot" 
              className="h-10 w-10 transition-transform duration-300 group-hover:scale-110 drop-shadow-glow"
            />
            <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Alofoke.ai
            </h1>
          </div>

          <nav className="hidden md:flex items-center gap-6">
            <a href="#" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
              Noticias
            </a>
            <a href="#" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
              Análisis
            </a>
            <a href="#" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
              Casos de Uso
            </a>
            <a href="mailto:info@nadakki.com" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
              Contacto
            </a>
          </nav>

          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>

        {isMenuOpen && (
          <nav className="md:hidden py-4 space-y-3 animate-in slide-in-from-top-2">
            <a href="#" className="block text-sm font-medium text-foreground hover:text-primary transition-colors">
              Noticias
            </a>
            <a href="#" className="block text-sm font-medium text-foreground hover:text-primary transition-colors">
              Análisis
            </a>
            <a href="#" className="block text-sm font-medium text-foreground hover:text-primary transition-colors">
              Casos de Uso
            </a>
            <a href="mailto:info@nadakki.com" className="block text-sm font-medium text-foreground hover:text-primary transition-colors">
              Contacto
            </a>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;
