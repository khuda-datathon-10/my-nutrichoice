import { useState, useRef } from "react";
import Hero from "@/components/Hero";
import MealSearch from "@/components/MealSearch";
import NutritionDisplay from "@/components/NutritionDisplay";
import NutritionAnalysis from "@/components/NutritionAnalysis";
import FoodRecommendations from "@/components/FoodRecommendations";
import { toast } from "sonner";

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
    // In a real app, this would call the NEIS API
    // For demonstration, using mock data
    toast.info("실제 구현 시 NEIS API를 호출합니다");
    
    // Mock response
    const mockData: NutritionData[] = [
      {
        dishName: "차조밥",
        calories: "320kcal",
        nutrition: "탄수화물 68g | 단백질 6g | 지방 1g"
      },
      {
        dishName: "된장찌개",
        calories: "85kcal",
        nutrition: "단백질 8g | 나트륨 850mg | 지방 3g"
      },
      {
        dishName: "제육볶음",
        calories: "245kcal",
        nutrition: "단백질 22g | 지방 12g | 탄수화물 10g"
      },
      {
        dishName: "깍두기",
        calories: "15kcal",
        nutrition: "비타민C 12mg | 식이섬유 2g"
      },
      {
        dishName: "우유",
        calories: "130kcal",
        nutrition: "칼슘 240mg | 단백질 8g | 지방 7g"
      }
    ];

    setMealData(mockData);
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
