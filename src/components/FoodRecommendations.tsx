import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Apple, Utensils } from "lucide-react";

interface FoodItem {
  food_name: string;
  food_code?: string;
  calories?: string;
  protein?: string;
  fat?: string;
  carbohydrate?: string;
  vitamin_a?: string;
  thiamine?: string;
  riboflavin?: string;
  vitamin_c?: string;
  calcium?: string;
  iron?: string;
  serving_size?: string;
}

interface FoodRecommendationsProps {
  recommendations: FoodItem[];
}

const FoodRecommendations = ({ recommendations }: FoodRecommendationsProps) => {
  if (recommendations.length === 0) {
    return null;
  }

  const parseValue = (value: string | undefined): number => {
    if (!value) return 0;
    return parseFloat(value) || 0;
  };

  return (
    <Card className="w-full shadow-medium border-border/50 bg-gradient-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-2xl">
          <Apple className="h-6 w-6 text-secondary" />
          저녁 식사 추천
        </CardTitle>
        <CardDescription className="text-base">
          부족한 영양소를 채울 수 있는 음식 {recommendations.length}개를 추천해드립니다
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {recommendations.map((food, index) => (
          <div 
            key={`${food.food_code}-${index}`}
            className="rounded-lg border border-border bg-card p-4 shadow-soft transition-all hover:shadow-medium hover:scale-[1.02]"
          >
            <div className="mb-3 flex items-center gap-2">
              <div className="rounded-full bg-accent p-2">
                <Utensils className="h-5 w-5 text-accent-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-card-foreground line-clamp-1">
                {food.food_name}
              </h3>
            </div>
            
            {food.serving_size && (
              <p className="text-sm text-muted-foreground mb-3">
                기준량: {food.serving_size}
              </p>
            )}
            
            <div className="space-y-2">
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">열량</span>
                <Badge variant="outline" className="font-mono">
                  {parseValue(food.calories).toFixed(1)} kcal
                </Badge>
              </div>
              
              {parseValue(food.protein) > 0 && (
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">단백질</span>
                  <Badge variant="outline" className="font-mono">
                    {parseValue(food.protein).toFixed(1)} g
                  </Badge>
                </div>
              )}
              
              {parseValue(food.carbohydrate) > 0 && (
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">탄수화물</span>
                  <Badge variant="outline" className="font-mono">
                    {parseValue(food.carbohydrate).toFixed(1)} g
                  </Badge>
                </div>
              )}
              
              {parseValue(food.fat) > 0 && (
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">지방</span>
                  <Badge variant="outline" className="font-mono">
                    {parseValue(food.fat).toFixed(1)} g
                  </Badge>
                </div>
              )}
              
              {parseValue(food.calcium) > 0 && (
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">칼슘</span>
                  <Badge variant="outline" className="font-mono">
                    {parseValue(food.calcium).toFixed(1)} mg
                  </Badge>
                </div>
              )}
              
              {parseValue(food.iron) > 0 && (
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">철분</span>
                  <Badge variant="outline" className="font-mono">
                    {parseValue(food.iron).toFixed(1)} mg
                  </Badge>
                </div>
              )}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default FoodRecommendations;
