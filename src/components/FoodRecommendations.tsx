import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Apple, Beef, Fish, Milk, Carrot } from "lucide-react";

interface Recommendation {
  nutrient: string;
  foods: string[];
  icon: any;
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
          부족한 영양소 보충 추천
        </CardTitle>
        <CardDescription className="text-base">
          오늘 부족한 영양소를 채울 수 있는 음식들을 추천해드립니다
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {recommendations.map((rec, index) => {
          const Icon = iconMap[rec.nutrient] || Apple;
          
          return (
            <div 
              key={index}
              className="rounded-lg border border-border bg-card p-5 shadow-soft transition-all hover:shadow-medium hover:scale-[1.02]"
            >
              <div className="mb-3 flex items-center gap-2">
                <div className="rounded-full bg-accent p-2">
                  <Icon className="h-5 w-5 text-accent-foreground" />
                </div>
                <h3 className="text-lg font-semibold text-card-foreground">
                  {rec.nutrient} 보충
                </h3>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {rec.foods.map((food, idx) => (
                  <Badge 
                    key={idx}
                    variant="secondary"
                    className="px-3 py-1 text-sm font-medium transition-all hover:scale-105"
                  >
                    {food}
                  </Badge>
                ))}
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};

export default FoodRecommendations;
