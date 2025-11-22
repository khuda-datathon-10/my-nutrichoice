import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Apple, Beef, Fish, Milk, Carrot } from "lucide-react";

interface Recommendation {
  food_name: string;
  serving_size?: string;
  calories?: string;
  protein?: string;
  carbohydrate?: string;
  fat?: string;
}

interface FoodRecommendationsProps {
  recommendations: Recommendation[];
}

const FoodRecommendations = ({ recommendations }: FoodRecommendationsProps) => {
  if (recommendations.length === 0) {
    return null;
  }

  const iconMap: { [key: string]: any } = {
    "비타민": Apple,
    "단백질": Beef,
    "칼슘": Milk,
    "철분": Carrot,
    "오메가3": Fish,
  };

  return (
    <Card className="w-full shadow-medium border-border/50 bg-gradient-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-2xl">
          <Apple className="h-6 w-6 text-secondary" />
          AI 기반 음식 추천
        </CardTitle>
        <CardDescription className="text-base">
          영양소 부족량을 분석하여 머신러닝 모델이 추천한 음식입니다
        </CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {recommendations.map((rec, index) => (
          <div 
            key={index}
            className="rounded-lg border border-border bg-card p-4 shadow-soft transition-all hover:shadow-medium hover:scale-[1.02]"
          >
            <div className="flex items-start gap-3">
              <div className="rounded-full bg-accent p-2 shrink-0">
                <Apple className="h-4 w-4 text-accent-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-card-foreground mb-1 truncate">
                  {rec.food_name}
                </h3>
                <div className="space-y-0.5 text-xs text-muted-foreground">
                  {rec.serving_size && (
                    <p>1회 제공량: {rec.serving_size}</p>
                  )}
                  {rec.calories && (
                    <p>칼로리: {parseFloat(rec.calories).toFixed(1)} kcal</p>
                  )}
                  <div className="flex gap-2 flex-wrap mt-1">
                    {rec.protein && (
                      <Badge variant="outline" className="text-xs">
                        단백질 {parseFloat(rec.protein).toFixed(1)}g
                      </Badge>
                    )}
                    {rec.carbohydrate && (
                      <Badge variant="outline" className="text-xs">
                        탄수화물 {parseFloat(rec.carbohydrate).toFixed(1)}g
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default FoodRecommendations;
