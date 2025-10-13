import { Mail, Brain } from "lucide-react";

const Footer = () => {
  return (
    <footer className="border-t border-border/40 bg-muted/30 mt-16">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Brain className="h-6 w-6 text-primary" />
              <span className="text-lg font-bold">Alofoke.ai</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Portal de noticias sobre inteligencia artificial en español para Latinoamérica.
            </p>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4">Secciones</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-primary transition-colors">Noticias</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Análisis</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Casos de Uso</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4">Contacto</h3>
            <a 
              href="mailto:info@nadakki.com"
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              <Mail className="h-4 w-4" />
              info@nadakki.com
            </a>
          </div>
        </div>
        
        <div className="mt-8 pt-8 border-t border-border/40 text-center text-sm text-muted-foreground">
          © 2025 Alofoke.ai. Todos los derechos reservados.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
