import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const DataImport = () => {
  const [isImporting, setIsImporting] = useState(false);
  const [isImported, setIsImported] = useState(false);

  const handleImport = async () => {
    setIsImporting(true);
    try {
      // XLS 파일에서 추출한 데이터를 임포트
      // 실제 구현에서는 XLS 파일을 파싱하여 데이터를 추출해야 함
      const sampleData = [
        {
          office_code: "B10",
          office_name: "서울특별시교육청",
          school_code: "7010057",
          school_name: "가락고등학교",
          meal_code: "2",
          meal_name: "중식",
          meal_date: "2025-11-13",
          meal_count: "120.00",
          dish_names: "[수능감독] 흰쌀밥\n곰탕&소면\n봄동겉절이",
          origin_info: "쇠고기(종류) : 국내산(육우)",
          calorie_info: "1217.3 Kcal",
          nutrition_info: "탄수화물(g) : 181.3\n단백질(g) : 49.1",
          updated_date: "2025-11-20"
        }
      ];

      const { error } = await supabase.functions.invoke('import-meal-data', {
        body: { mealData: sampleData }
      });

      if (error) throw error;

      toast.success("데이터 임포트 완료!");
      setIsImported(true);
    } catch (error) {
      console.error('Error importing data:', error);
      toast.error("데이터 임포트 중 오류가 발생했습니다");
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <Card className="w-full shadow-medium border-border/50 bg-gradient-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <Upload className="h-5 w-5 text-primary" />
          급식 데이터 임포트
        </CardTitle>
        <CardDescription>
          XLS 파일의 학교 및 급식 정보를 데이터베이스에 저장합니다
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button
          onClick={handleImport}
          disabled={isImporting || isImported}
          className="w-full"
          size="lg"
        >
          {isImported ? (
            <>
              <CheckCircle className="mr-2 h-5 w-5" />
              임포트 완료
            </>
          ) : (
            <>
              <Upload className="mr-2 h-5 w-5" />
              {isImporting ? "임포트 중..." : "데이터 임포트"}
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default DataImport;