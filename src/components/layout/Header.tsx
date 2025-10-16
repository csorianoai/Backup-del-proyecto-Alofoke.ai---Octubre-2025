import { Menu, X, ShieldCheck, Search, Globe } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import robotLogo from "@/assets/alofoke-robot-logo.png";
import { Link } from "react-router-dom";
import { DO } from 'country-flag-icons/react/3x2';
import { CO } from 'country-flag-icons/react/3x2';
import { MX } from 'country-flag-icons/react/3x2';
import { AR } from 'country-flag-icons/react/3x2';
import { ES } from 'country-flag-icons/react/3x2';
import { PE } from 'country-flag-icons/react/3x2';
import { PA } from 'country-flag-icons/react/3x2';
import { CL } from 'country-flag-icons/react/3x2';
import { UY } from 'country-flag-icons/react/3x2';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group cursor-pointer">
            <img 
              src={robotLogo} 
              alt="Alofoke.ai Neural Brain" 
              className="h-16 w-16 md:h-20 md:w-20 animate-pulse-glow"
            />
            <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Alofoke.ai
            </h1>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            <Link to="/latam" className="flex items-center gap-2 text-sm font-medium text-foreground hover:text-primary transition-colors">
              <Globe className="w-4 h-4" />
              <span>LATAM</span>
            </Link>
            <Link to="/pais/do" className="flex items-center gap-2 text-sm font-medium text-foreground hover:text-primary transition-colors">
              <DO className="w-5 h-3" />
              <span>RD</span>
            </Link>
            <Link to="/pais/co" className="flex items-center gap-2 text-sm font-medium text-foreground hover:text-primary transition-colors">
              <CO className="w-5 h-3" />
              <span>Colombia</span>
            </Link>
            <Link to="/pais/mx" className="flex items-center gap-2 text-sm font-medium text-foreground hover:text-primary transition-colors">
              <MX className="w-5 h-3" />
              <span>México</span>
            </Link>
            <Link to="/pais/ar" className="flex items-center gap-2 text-sm font-medium text-foreground hover:text-primary transition-colors">
              <AR className="w-5 h-3" />
              <span>Argentina</span>
            </Link>
            <Link to="/pais/es" className="flex items-center gap-2 text-sm font-medium text-foreground hover:text-primary transition-colors">
              <ES className="w-5 h-3" />
              <span>España</span>
            </Link>
            <Link to="/pais/pe" className="flex items-center gap-2 text-sm font-medium text-foreground hover:text-primary transition-colors">
              <PE className="w-5 h-3" />
              <span>Perú</span>
            </Link>
            <Link to="/pais/pa" className="flex items-center gap-2 text-sm font-medium text-foreground hover:text-primary transition-colors">
              <PA className="w-5 h-3" />
              <span>Panamá</span>
            </Link>
            <Link to="/pais/cl" className="flex items-center gap-2 text-sm font-medium text-foreground hover:text-primary transition-colors">
              <CL className="w-5 h-3" />
              <span>Chile</span>
            </Link>
            <Link to="/pais/uy" className="flex items-center gap-2 text-sm font-medium text-foreground hover:text-primary transition-colors">
              <UY className="w-5 h-3" />
              <span>Uruguay</span>
            </Link>
            <Link to="/noticias" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
              Noticias
            </Link>
            <Link to="/casos-uso" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
              Casos de Uso
            </Link>
            <Link to="/buscar" className="flex items-center gap-1 text-sm font-medium text-foreground hover:text-primary transition-colors">
              <Search className="h-4 w-4" />
              Buscar
            </Link>
            <Link to="/admin" className="flex items-center gap-1 text-sm font-medium text-foreground hover:text-primary transition-colors">
              <ShieldCheck className="h-4 w-4" />
              Admin
            </Link>
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
            <Link to="/latam" className="flex items-center gap-2 text-sm font-medium text-foreground hover:text-primary transition-colors">
              <Globe className="w-4 h-4" />
              <span>LATAM</span>
            </Link>
            <Link to="/pais/do" className="flex items-center gap-2 text-sm font-medium text-foreground hover:text-primary transition-colors">
              <DO className="w-5 h-3" />
              <span>República Dominicana</span>
            </Link>
            <Link to="/pais/co" className="flex items-center gap-2 text-sm font-medium text-foreground hover:text-primary transition-colors">
              <CO className="w-5 h-3" />
              <span>Colombia</span>
            </Link>
            <Link to="/pais/mx" className="flex items-center gap-2 text-sm font-medium text-foreground hover:text-primary transition-colors">
              <MX className="w-5 h-3" />
              <span>México</span>
            </Link>
            <Link to="/pais/ar" className="flex items-center gap-2 text-sm font-medium text-foreground hover:text-primary transition-colors">
              <AR className="w-5 h-3" />
              <span>Argentina</span>
            </Link>
            <Link to="/pais/es" className="flex items-center gap-2 text-sm font-medium text-foreground hover:text-primary transition-colors">
              <ES className="w-5 h-3" />
              <span>España</span>
            </Link>
            <Link to="/pais/pe" className="flex items-center gap-2 text-sm font-medium text-foreground hover:text-primary transition-colors">
              <PE className="w-5 h-3" />
              <span>Perú</span>
            </Link>
            <Link to="/pais/pa" className="flex items-center gap-2 text-sm font-medium text-foreground hover:text-primary transition-colors">
              <PA className="w-5 h-3" />
              <span>Panamá</span>
            </Link>
            <Link to="/pais/cl" className="flex items-center gap-2 text-sm font-medium text-foreground hover:text-primary transition-colors">
              <CL className="w-5 h-3" />
              <span>Chile</span>
            </Link>
            <Link to="/pais/uy" className="flex items-center gap-2 text-sm font-medium text-foreground hover:text-primary transition-colors">
              <UY className="w-5 h-3" />
              <span>Uruguay</span>
            </Link>
            <Link to="/noticias" className="block text-sm font-medium text-foreground hover:text-primary transition-colors">
              Noticias
            </Link>
            <Link to="/casos-uso" className="block text-sm font-medium text-foreground hover:text-primary transition-colors">
              Casos de Uso
            </Link>
            <Link to="/buscar" className="flex items-center gap-1 text-sm font-medium text-foreground hover:text-primary transition-colors">
              <Search className="h-4 w-4" />
              Buscar
            </Link>
            <Link to="/admin" className="flex items-center gap-1 text-sm font-medium text-foreground hover:text-primary transition-colors">
              <ShieldCheck className="h-4 w-4" />
              Admin
            </Link>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;
