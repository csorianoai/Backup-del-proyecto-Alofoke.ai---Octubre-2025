import { Link } from "react-router-dom";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock } from "lucide-react";

interface ArticleCardProps {
  title: string;
  excerpt: string;
  category: string;
  date: string;
  readTime: string;
  image: string;
  slug: string;
}

const ArticleCard = ({ title, excerpt, category, date, readTime, image, slug }: ArticleCardProps) => {
  return (
    <Link to={`/articulo/${encodeURIComponent(slug)}`}>
      <Card className="group overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-card border-border/50 cursor-pointer">
      <div className="relative h-48 overflow-hidden">
        <img 
          src={image} 
          alt={title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
        />
        <div className="absolute top-3 left-3">
          <Badge className="bg-primary/90 text-primary-foreground">
            {category}
          </Badge>
        </div>
      </div>
      
      <CardHeader>
        <h3 className="text-lg font-semibold line-clamp-2 group-hover:text-primary transition-colors">
          {title}
        </h3>
      </CardHeader>
      
      <CardContent>
        <p className="text-sm text-muted-foreground line-clamp-3">
          {excerpt}
        </p>
      </CardContent>
      
      <CardFooter className="flex items-center gap-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <Calendar className="h-3 w-3" />
          <span>{date}</span>
        </div>
        <div className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          <span>{readTime}</span>
        </div>
      </CardFooter>
    </Card>
    </Link>
  );
};

export default ArticleCard;
