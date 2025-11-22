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
            <div className="mb-3 flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-base font-semibold text-card-foreground mb-2">
                  메뉴
                </h3>
                <ul className="space-y-1.5">
                  {meal.dishName.split('\n').map((dish, idx) => (
                    <li key={idx} className="text-sm text-card-foreground flex items-start">
                      <span className="text-primary mr-2">•</span>
                      <span>{dish.trim()}</span>
                    </li>
                  ))}
                </ul>
              </div>
              {meal.calories && (
                <Badge variant="secondary" className="flex items-center gap-1 shrink-0">
                  <Flame className="h-3 w-3" />
                  {meal.calories}
                </Badge>
              )}
            </div>
            
            {meal.nutrition && (
              <div className="space-y-2 pt-3 border-t border-border/50">
                <p className="text-sm font-semibold text-card-foreground flex items-center gap-2">
                  <TrendingDown className="h-4 w-4 text-primary" />
                  영양 정보
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {meal.nutrition.split('\n').map((nutrient, idx) => (
                    <div 
                      key={idx} 
                      className="text-xs text-muted-foreground bg-muted/30 px-3 py-2 rounded-md"
                    >
                      {nutrient.trim()}
                    </div>
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
