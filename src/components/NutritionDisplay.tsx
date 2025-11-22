import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Utensils, Flame, TrendingDown } from "lucide-react";

interface NutritionData {
  dishName: string;
  calories: string;
  nutrition: string;
}

interface NutritionDisplayProps {
  data: NutritionData[];
}

const NutritionDisplay = ({ data }: NutritionDisplayProps) => {
  if (data.length === 0) {
    return null;
  }

  return (
    <Card className="w-full shadow-medium border-border/50 bg-gradient-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-2xl">
          <Utensils className="h-6 w-6 text-primary" />
          오늘의 급식 메뉴
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {data.map((meal, index) => (
          <div 
            key={index} 
            className="rounded-lg border border-border bg-card p-4 shadow-soft transition-all hover:shadow-medium"
          >
            <div className="mb-3 flex items-start justify-between gap-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-card-foreground mb-2">
                  {meal.dishName.split('<br/>')[0]}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {meal.dishName
                    .split('<br/>')
                    .slice(1)
                    .filter(item => item.trim())
                    .join(', ')}
                </p>
              </div>
              {meal.calories && (
                <Badge variant="secondary" className="flex items-center gap-1 shrink-0">
                  <Flame className="h-3 w-3" />
                  {meal.calories}
                </Badge>
              )}
            </div>
            
            {meal.nutrition && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <TrendingDown className="h-4 w-4" />
                  영양 정보
                </p>
                <div className="flex flex-wrap gap-2">
                  {meal.nutrition.split('|').map((nutrient, idx) => (
                    <Badge 
                      key={idx} 
                      variant="outline"
                      className="text-xs"
                    >
                      {nutrient.trim()}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default NutritionDisplay;
