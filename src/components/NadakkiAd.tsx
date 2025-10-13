import { ExternalLink, Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const NadakkiAd = () => {
  return (
    <Card className="relative border-none overflow-hidden group">
      <div className="absolute inset-0 bg-gradient-to-r from-primary via-secondary to-accent opacity-20 animate-pulse" />
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-secondary/10" />
      <div className="absolute -inset-1 bg-gradient-to-r from-primary via-secondary to-accent blur-xl opacity-30 group-hover:opacity-50 transition-opacity duration-500 animate-pulse" />
      
      <CardContent className="relative p-8">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <Sparkles className="w-6 h-6 text-accent animate-pulse" />
              <h3 className="text-2xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent animate-in slide-in-from-left">
                nadakki.com
              </h3>
              <ExternalLink className="w-5 h-5 text-primary/70 group-hover:text-primary transition-colors" />
            </div>
            <p className="text-base text-foreground/80 leading-relaxed mb-4 animate-in fade-in slide-in-from-left delay-100">
              Plataforma dedicada a la automatización de procesos, desarrollo de agentes de AI y soluciones de inteligencia artificial.
            </p>
            <a 
              href="https://nadakki.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-gradient-to-r from-primary to-secondary text-white font-medium hover:shadow-lg hover:scale-105 transition-all duration-300 animate-in fade-in slide-in-from-left delay-200"
            >
              <span>Conocer más</span>
              <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
            </a>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default NadakkiAd;
