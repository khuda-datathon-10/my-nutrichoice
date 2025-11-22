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
  const searchRef = useRef<HTMLDivElement>(null);

  // Mock data for demonstration
  const mockNutrients = [
    { name: "단백질", current: 45, recommended: 60, unit: "g" },
    { name: "비타민 A", current: 350, recommended: 700, unit: "μg" },
    { name: "비타민 C", current: 65, recommended: 100, unit: "mg" },
    { name: "칼슘", current: 520, recommended: 800, unit: "mg" },
    { name: "철분", current: 8, recommended: 14, unit: "mg" },
  ];

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

  const handleSearch = async (schoolCode: string, date: string) => {
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
        return;
      }

      // Transform data to match NutritionData interface
      const transformedData: NutritionData[] = data.map(meal => ({
        dishName: `${meal.meal_name}: ${meal.dish_names || ''}`,
        calories: meal.calorie_info || '',
        nutrition: meal.nutrition_info || ''
      }));

      setMealData(transformedData);
      toast.success(`${data.length}개의 급식 정보를 조회했습니다.`);
    } catch (error) {
      console.error('Error fetching meal data:', error);
      toast.error('급식 데이터 조회 중 오류가 발생했습니다.');
      setMealData([]);
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
                <NutritionAnalysis nutrients={mockNutrients} />
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
