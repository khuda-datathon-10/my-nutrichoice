import { useState, useRef } from "react";
import Hero from "@/components/Hero";
import MealSearch from "@/components/MealSearch";
import NutritionDisplay from "@/components/NutritionDisplay";
import NutritionAnalysis from "@/components/NutritionAnalysis";
import FoodRecommendations from "@/components/FoodRecommendations";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface NutritionData {
  dishName: string;
  calories: string;
  nutrition: string;
}

const Index = () => {
  const [mealData, setMealData] = useState<NutritionData[]>([]);
  const [showSearch, setShowSearch] = useState(false);
  const [nutrients, setNutrients] = useState<any[]>([]);
  const searchRef = useRef<HTMLDivElement>(null);

  const mockRecommendations = [
    {
      nutrient: "단백질",
      foods: ["닭가슴살", "두부", "계란", "연어", "그릭요거트"],
      icon: "Beef"
    },
    {
      nutrient: "비타민",
      foods: ["당근", "시금치", "브로콜리", "파프리카", "토마토"],
      icon: "Apple"
    },
    {
      nutrient: "칼슘",
      foods: ["우유", "치즈", "요거트", "뼈째먹는 생선", "아몬드"],
      icon: "Milk"
    }
  ];

  const handleGetStarted = () => {
    setShowSearch(true);
    setTimeout(() => {
      searchRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  };

  // Parse nutrition info and calculate nutrients
  const parseNutritionData = (nutritionInfo: string) => {
    const items = nutritionInfo.split('<br/>').filter(item => item.trim());
    const nutrients = [];

    // Standard recommended daily values (based on Korean dietary reference intakes for adults)
    const recommendedValues: { [key: string]: number } = {
      '탄수화물': 324,
      '단백질': 55,
      '지방': 54,
      '비타민A': 700,
      '티아민': 1.2,
      '리보플라빈': 1.5,
      '비타민C': 100,
      '칼슘': 800,
      '철분': 12,
    };

    items.forEach(item => {
      const match = item.match(/^(.+?)\((.+?)\)\s*:\s*(.+)$/);
      if (match) {
        const [, name, unit, value] = match;
        const numValue = parseFloat(value);
        const recommended = recommendedValues[name] || numValue * 1.5;

        nutrients.push({
          name,
          current: numValue,
          recommended,
          unit,
        });
      }
    });

    return nutrients;
  };

  const handleSearch = async (schoolCode: string, date: string, height: string, weight: string, gender: string) => {
    console.log('User info:', { height, weight, gender });
    try {
      toast.info("급식 데이터 조회 중...");
      
      const { data, error } = await supabase
        .from('meal_info')
        .select('*')
        .eq('school_code', schoolCode)
        .eq('meal_date', date)
        .order('meal_code', { ascending: true });

      if (error) throw error;

      if (!data || data.length === 0) {
        toast.error("해당 날짜의 급식 정보를 찾을 수 없습니다.");
        setMealData([]);
        setNutrients([]);
        return;
      }

      // Transform data to match NutritionData interface
      const transformedData: NutritionData[] = data.map(meal => ({
        dishName: `${meal.meal_name}: ${meal.dish_names || ''}`,
        calories: meal.calorie_info || '',
        nutrition: meal.nutrition_info || ''
      }));

      setMealData(transformedData);

      // Parse nutrition info from all meals for analysis
      const allNutrients = data
        .filter(meal => meal.nutrition_info)
        .flatMap(meal => parseNutritionData(meal.nutrition_info));

      // Aggregate nutrients by name
      const aggregatedNutrients = allNutrients.reduce((acc: any, nutrient: any) => {
        if (!acc[nutrient.name]) {
          acc[nutrient.name] = {
            name: nutrient.name,
            current: 0,
            recommended: nutrient.recommended,
            unit: nutrient.unit,
          };
        }
        acc[nutrient.name].current += nutrient.current;
        return acc;
      }, {});

      setNutrients(Object.values(aggregatedNutrients));

      toast.success(`${data.length}개의 급식 정보를 조회했습니다.`);
    } catch (error) {
      console.error('Error fetching meal data:', error);
      toast.error('급식 데이터 조회 중 오류가 발생했습니다.');
      setMealData([]);
      setNutrients([]);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Hero onGetStarted={handleGetStarted} />
      
      {showSearch && (
        <section ref={searchRef} className="py-16 px-6">
          <div className="container mx-auto max-w-6xl space-y-8">
            <MealSearch onSearch={handleSearch} />
            
            {mealData.length > 0 && (
              <>
                <NutritionDisplay data={mealData} />
                <NutritionAnalysis nutrients={nutrients} />
                <FoodRecommendations recommendations={mockRecommendations} />
              </>
            )}
          </div>
        </section>
      )}
      
      <footer className="bg-muted py-8 px-6 mt-20">
        <div className="container mx-auto max-w-6xl text-center">
          <p className="text-muted-foreground">
            급식 영양 분석 서비스 | 나이스 교육정보 개방 포털 API 활용
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
