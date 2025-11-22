import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle, TrendingUp } from "lucide-react";

interface NutrientData {
  name: string;
  current: number;
  recommended: number;
  unit: string;
}

interface NutritionAnalysisProps {
  nutrients: NutrientData[];
}

const NutritionAnalysis = ({ nutrients }: NutritionAnalysisProps) => {
  if (nutrients.length === 0) {
    return null;
  }

  const getStatus = (current: number, recommended: number) => {
    const percentage = (current / recommended) * 100;
    if (percentage > 100) return { status: "초과", color: "info", icon: TrendingUp };
    if (percentage >= 90) return { status: "충족", color: "success", icon: CheckCircle };
    if (percentage >= 70) return { status: "양호", color: "warning", icon: TrendingUp };
    return { status: "부족", color: "destructive", icon: AlertCircle };
  };

  return (
    <Card className="w-full shadow-medium border-border/50 bg-gradient-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-2xl">
          <TrendingUp className="h-6 w-6 text-primary" />
          영양소 분석
        </CardTitle>
        <CardDescription className="text-base">
          오늘 섭취한 영양소와 권장량을 비교합니다
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {nutrients.map((nutrient, index) => {
          const percentage = (nutrient.current / nutrient.recommended) * 100;
          const statusInfo = getStatus(nutrient.current, nutrient.recommended);
          const StatusIcon = statusInfo.icon;

          return (
            <div key={index} className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h4 className="font-semibold text-card-foreground">
                    {nutrient.name}
                  </h4>
                  <Badge 
                    variant="outline"
                    className={
                      statusInfo.color === "success" 
                        ? "border-success text-success" 
                        : statusInfo.color === "warning"
                        ? "border-warning text-warning"
                        : statusInfo.color === "info"
                        ? "border-blue-500 text-blue-500"
                        : "border-destructive text-destructive"
                    }
                  >
                    <StatusIcon className="mr-1 h-3 w-3" />
                    {statusInfo.status}
                  </Badge>
                </div>
                <span className="text-sm text-muted-foreground">
                  {nutrient.current}{nutrient.unit} / {nutrient.recommended}{nutrient.unit}
                </span>
              </div>
              
              <Progress 
                value={Math.min(percentage, 100)} 
                className={`h-2 ${percentage > 100 ? '[&>div]:bg-destructive' : ''}`}
              />
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};

export default NutritionAnalysis;
