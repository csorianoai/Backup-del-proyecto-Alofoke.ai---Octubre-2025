import { ExternalLink } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const NadakkiAd = () => {
  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-secondary/5 hover:shadow-lg transition-all duration-300">
      <CardContent className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-lg font-semibold text-primary">nadakki-ai-suite</h3>
              <ExternalLink className="w-4 h-4 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Plataforma dedicada a la automatización de procesos, desarrollo de agentes de AI y soluciones de inteligencia artificial.
            </p>
            <a 
              href="https://nadakki.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-block mt-3 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
            >
              Conocer más →
            </a>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default NadakkiAd;
