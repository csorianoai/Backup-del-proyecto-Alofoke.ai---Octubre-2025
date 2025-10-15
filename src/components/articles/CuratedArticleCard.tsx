import { Link } from "react-router-dom";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "lucide-react";

interface CuratedArticleCardProps {
  title: string;
  subtitle: string;
  country: string;
  date: string;
  type: string;
  tier: string;
  url: string;
  tags: string[];
  human_verified?: boolean;
  low_confidence?: boolean;
}

const TIER_COLORS = {
  gold: "bg-yellow-500 text-white",
  silver: "bg-gray-400 text-white",
  bronze: "bg-amber-700 text-white",
};

const TIER_ICONS = {
  gold: "🥇",
  silver: "🥈",
  bronze: "🥉",
};

const TYPE_LABELS = {
  news_brief: "News Brief",
  explainer: "Explainer",
  trend_radar: "Trend Radar",
};

const COUNTRY_FLAGS = {
  do: "🇩🇴",
  co: "🇨🇴",
  latam: "🌎",
};

const CuratedArticleCard = ({
  title,
  subtitle,
  country,
  date,
  type,
  tier,
  url,
  tags,
  human_verified,
  low_confidence,
}: CuratedArticleCardProps) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <Link to={url}>
      <Card className="group overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-card border-border/50 cursor-pointer">
        <CardHeader>
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="text-xs">
                {TYPE_LABELS[type as keyof typeof TYPE_LABELS] || type}
              </Badge>
              <Badge className={`text-xs ${TIER_COLORS[tier as keyof typeof TIER_COLORS]}`}>
                {TIER_ICONS[tier as keyof typeof TIER_ICONS]} {tier.toUpperCase()}
              </Badge>
            </div>
            <span className="text-xl">{COUNTRY_FLAGS[country as keyof typeof COUNTRY_FLAGS]}</span>
          </div>
          
          <h3 className="text-lg font-semibold line-clamp-2 group-hover:text-primary transition-colors">
            {title}
          </h3>
        </CardHeader>

        <CardContent>
          <p className="text-sm text-muted-foreground line-clamp-2">
            {subtitle}
          </p>
          
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-3">
              {tags.slice(0, 3).map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>

        <CardFooter className="flex flex-col items-start gap-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            <span>{formatDate(date)}</span>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {human_verified && (
              <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-300">
                ✓ Verificado
              </Badge>
            )}
            {low_confidence && (
              <Badge variant="outline" className="text-xs bg-amber-50 text-amber-700 border-amber-300">
                ⚠️ En revisión
              </Badge>
            )}
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
};

export default CuratedArticleCard;
