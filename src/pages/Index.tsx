import { useState, useRef } from "react";
import Hero from "@/components/Hero";
import MealSearch from "@/components/MealSearch";
import BreakfastAdder from "@/components/BreakfastAdder";
import NutritionDisplay from "@/components/NutritionDisplay";
import NutritionAnalysis from "@/components/NutritionAnalysis";
import FoodRecommendations from "@/components/FoodRecommendations";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { calculateRecommendedNutrients } from "@/utils/nutritionCalculator";

interface NutritionData {
  dishName: string;
  calories: string;
  nutrition: string;
}

const Index = () => {
  const [mealData, setMealData] = useState<NutritionData[]>([]);
  const [showSearch, setShowSearch] = useState(false);
  const [nutrients, setNutrients] = useState<any[]>([]);
  const [hasBreakfast, setHasBreakfast] = useState(false);
  const [showBreakfastAdder, setShowBreakfastAdder] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
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
  const parseNutritionData = (nutritionInfo: string, recommendedValues: Record<string, number>) => {
    const items = nutritionInfo.split('<br/>').filter(item => item.trim());
    const nutrients = [];

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

  const handleSearch = async (schoolCode: string, date: string, height: string, weight: string, gender: string, age: string) => {
    try {
      toast.info("급식 데이터 조회 중...");
      
      // Calculate recommended nutrients based on user profile
      const profile = {
        age: parseInt(age),
        height: parseFloat(height),
        weight: parseFloat(weight),
        gender: gender as 'male' | 'female'
      };
      
      setUserProfile(profile);
      
      const recommendedNutrients = calculateRecommendedNutrients(profile);
      console.log('Calculated recommended nutrients:', recommendedNutrients);
      
      // Convert to Record<string, number> for easy lookup
      const recommendedValues: Record<string, number> = { ...recommendedNutrients };
      
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
        setShowBreakfastAdder(false);
        return;
      }

      // Check if breakfast and lunch exist
      const breakfastExists = data.some(meal => meal.meal_name === '조식');
      const lunchExists = data.some(meal => meal.meal_name === '중식');
      setHasBreakfast(breakfastExists);
      
      // Only show breakfast adder if lunch exists but breakfast doesn't
      if (!breakfastExists && lunchExists) {
        setShowBreakfastAdder(true);
      } else {
        setShowBreakfastAdder(false);
      }

      // Transform data to match NutritionData interface (filter out dinner/석식)
      const transformedData: NutritionData[] = data
        .filter(meal => meal.meal_name !== '석식')
        .map(meal => ({
          dishName: `${meal.meal_name}<br/>${meal.dish_names || ''}`,
          calories: meal.calorie_info || '',
          nutrition: meal.nutrition_info || ''
        }));

      setMealData(transformedData);

      // Parse nutrition info from all meals for analysis (excluding dinner/석식)
      const allNutrients = data
        .filter(meal => meal.nutrition_info && meal.meal_name !== '석식')
        .flatMap(meal => parseNutritionData(meal.nutrition_info, recommendedValues));

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

      toast.success(`${transformedData.length}개의 급식 정보를 조회했습니다.`);
    } catch (error) {
      console.error('Error fetching meal data:', error);
      toast.error('급식 데이터 조회 중 오류가 발생했습니다.');
      setMealData([]);
      setNutrients([]);
    }
  };

  const handleAddBreakfast = (foodItems: any[]) => {
    if (!userProfile) {
      toast.error("먼저 급식 정보를 조회해주세요");
      return;
    }

    // Create breakfast meal data from food items
    const breakfastDishes = foodItems.map(food => food.food_name).join(', ');
    const totalCalories = foodItems.reduce((sum, food) => {
      const cal = parseFloat(food.calories) || 0;
      return sum + cal;
    }, 0);

    // Build nutrition info string
    const nutritionParts: string[] = [];
    
    const totalCarbs = foodItems.reduce((sum, food) => sum + (parseFloat(food.carbohydrate) || 0), 0);
    if (totalCarbs > 0) nutritionParts.push(`탄수화물(g) : ${totalCarbs.toFixed(1)}`);
    
    const totalProtein = foodItems.reduce((sum, food) => sum + (parseFloat(food.protein) || 0), 0);
    if (totalProtein > 0) nutritionParts.push(`단백질(g) : ${totalProtein.toFixed(1)}`);
    
    const totalFat = foodItems.reduce((sum, food) => sum + (parseFloat(food.fat) || 0), 0);
    if (totalFat > 0) nutritionParts.push(`지방(g) : ${totalFat.toFixed(1)}`);
    
    const totalVitaminA = foodItems.reduce((sum, food) => sum + (parseFloat(food.vitamin_a) || 0), 0);
    if (totalVitaminA > 0) nutritionParts.push(`비타민A(R.E) : ${totalVitaminA.toFixed(1)}`);
    
    const totalThiamine = foodItems.reduce((sum, food) => sum + (parseFloat(food.thiamine) || 0), 0);
    if (totalThiamine > 0) nutritionParts.push(`티아민(mg) : ${totalThiamine.toFixed(2)}`);
    
    const totalRiboflavin = foodItems.reduce((sum, food) => sum + (parseFloat(food.riboflavin) || 0), 0);
    if (totalRiboflavin > 0) nutritionParts.push(`리보플라빈(mg) : ${totalRiboflavin.toFixed(2)}`);
    
    const totalVitaminC = foodItems.reduce((sum, food) => sum + (parseFloat(food.vitamin_c) || 0), 0);
    if (totalVitaminC > 0) nutritionParts.push(`비타민C(mg) : ${totalVitaminC.toFixed(1)}`);
    
    const totalCalcium = foodItems.reduce((sum, food) => sum + (parseFloat(food.calcium) || 0), 0);
    if (totalCalcium > 0) nutritionParts.push(`칼슘(mg) : ${totalCalcium.toFixed(1)}`);
    
    const totalIron = foodItems.reduce((sum, food) => sum + (parseFloat(food.iron) || 0), 0);
    if (totalIron > 0) nutritionParts.push(`철분(mg) : ${totalIron.toFixed(1)}`);

    const breakfastData: NutritionData = {
      dishName: `조식<br/>${breakfastDishes}`,
      calories: `${totalCalories.toFixed(1)} Kcal`,
      nutrition: nutritionParts.join('<br/>')
    };

    // Add breakfast to meal data
    const updatedMealData = [breakfastData, ...mealData];
    setMealData(updatedMealData);

    // Recalculate nutrients with breakfast
    const recommendedNutrients = calculateRecommendedNutrients(userProfile);
    const recommendedValues: Record<string, number> = { ...recommendedNutrients };
    
    const breakfastNutrients = parseNutritionData(breakfastData.nutrition, recommendedValues);
    
    const updatedNutrients = [...nutrients];
    breakfastNutrients.forEach(nutrient => {
      const existing = updatedNutrients.find(n => n.name === nutrient.name);
      if (existing) {
        existing.current += nutrient.current;
      } else {
        updatedNutrients.push(nutrient);
      }
    });

    setNutrients(updatedNutrients);
    setShowBreakfastAdder(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <Hero onGetStarted={handleGetStarted} />
      
      {showSearch && (
        <section ref={searchRef} className="py-16 px-6">
          <div className="container mx-auto max-w-6xl space-y-8">
            <MealSearch onSearch={handleSearch} />
            
            {showBreakfastAdder && !hasBreakfast && (
              <BreakfastAdder onAddBreakfast={handleAddBreakfast} />
            )}
            
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
