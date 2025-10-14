import { useEffect } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, Briefcase, GraduationCap, Heart, ShoppingCart, Landmark } from "lucide-react";

const CasosUso = () => {
  useEffect(() => {
    // Update meta tags for SEO
    document.title = 'Casos de Uso de IA en República Dominicana - Alofoke.ai';
    
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Descubre cómo empresas dominicanas están implementando inteligencia artificial. Casos de uso reales de IA en República Dominicana.');
    }

    // Add JSON-LD structured data
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.text = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      "name": "Casos de Uso de IA en República Dominicana",
      "description": "Casos de uso de inteligencia artificial implementados por empresas dominicanas",
      "url": "https://alofoke.ai/casos-uso",
      "about": {
        "@type": "Thing",
        "name": "Inteligencia Artificial",
        "description": "Aplicaciones de IA en República Dominicana"
      },
      "inLanguage": "es-DO"
    });
    document.head.appendChild(script);

    return () => {
      const scripts = document.head.querySelectorAll('script[type="application/ld+json"]');
      scripts.forEach(s => s.remove());
    };
  }, []);

  const casosDeUso = [
    {
      icon: Building2,
      sector: "Banca y Finanzas",
      title: "Detección de Fraude con IA",
      description: "Bancos dominicanos implementan sistemas de machine learning para detectar transacciones fraudulentas en tiempo real, reduciendo pérdidas en un 60%.",
      empresas: ["Banco Popular", "Banreservas"],
      badge: "Implementado"
    },
    {
      icon: ShoppingCart,
      sector: "E-commerce y Retail",
      title: "Recomendaciones Personalizadas",
      description: "Plataformas de comercio electrónico utilizan IA para ofrecer recomendaciones personalizadas de productos, aumentando las ventas en 35%.",
      empresas: ["Supermercados Nacional", "Sirena"],
      badge: "En Desarrollo"
    },
    {
      icon: Heart,
      sector: "Salud",
      title: "Diagnóstico Médico Asistido",
      description: "Hospitales dominicanos adoptan IA para análisis de imágenes médicas, mejorando la precisión diagnóstica de rayos X y resonancias magnéticas.",
      empresas: ["Centro Médico Dominico-Cubano", "Hospital Plaza de la Salud"],
      badge: "Piloto"
    },
    {
      icon: GraduationCap,
      sector: "Educación",
      title: "Tutores Virtuales con ChatGPT",
      description: "Universidades dominicanas integran chatbots educativos para resolver dudas de estudiantes 24/7 y personalizar planes de estudio.",
      empresas: ["PUCMM", "UNPHU", "UTESA"],
      badge: "Implementado"
    },
    {
      icon: Briefcase,
      sector: "Recursos Humanos",
      title: "Selección de Talento con IA",
      description: "Empresas dominicanas utilizan IA para filtrar CVs, realizar entrevistas iniciales automatizadas y predecir el ajuste cultural de candidatos.",
      empresas: ["Grupo Ramos", "Cervecería Nacional Dominicana"],
      badge: "En Desarrollo"
    },
    {
      icon: Landmark,
      sector: "Gobierno y Servicios Públicos",
      title: "Chatbots de Atención Ciudadana",
      description: "Instituciones públicas implementan asistentes virtuales para responder consultas ciudadanas y agilizar trámites gubernamentales.",
      empresas: ["DGII", "JCE"],
      badge: "Piloto"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-primary bg-clip-text text-transparent">
            Casos de Uso de IA en República Dominicana
          </h1>
          <p className="text-lg text-muted-foreground">
            Descubre cómo empresas e instituciones dominicanas están transformando sus operaciones con inteligencia artificial
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {casosDeUso.map((caso, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between mb-4">
                  <caso.icon className="h-12 w-12 text-primary" />
                  <Badge variant={
                    caso.badge === "Implementado" ? "default" : 
                    caso.badge === "En Desarrollo" ? "secondary" : 
                    "outline"
                  }>
                    {caso.badge}
                  </Badge>
                </div>
                <div className="text-sm text-muted-foreground mb-2">{caso.sector}</div>
                <CardTitle className="text-xl">{caso.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base mb-4">
                  {caso.description}
                </CardDescription>
                <div className="flex flex-wrap gap-2">
                  {caso.empresas.map((empresa, i) => (
                    <Badge key={i} variant="outline" className="text-xs">
                      {empresa}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="bg-primary/5 border-primary/20">
          <CardHeader>
            <CardTitle>¿Tu empresa usa IA en República Dominicana?</CardTitle>
            <CardDescription className="text-base">
              Comparte tu caso de uso con la comunidad tech dominicana. 
              Envíanos tu historia a <a href="mailto:info@alofoke.ai" className="text-primary hover:underline">info@alofoke.ai</a>
            </CardDescription>
          </CardHeader>
        </Card>
      </main>

      <Footer />
    </div>
  );
};

export default CasosUso;
