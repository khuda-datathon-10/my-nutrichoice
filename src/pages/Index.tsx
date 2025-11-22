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
  const [mlRecommendations, setMlRecommendations] = useState<any[]>([]);
  const [isLoadingRecommendations, setIsLoadingRecommendations] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // ML API URL - 사용자가 배포한 Python ML 서비스 URL로 변경 필요
  const ML_API_URL = import.meta.env.VITE_ML_API_URL || 'http://localhost:8000';

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
      
      // Calculate deficiencies and get ML recommendations
      await fetchMLRecommendations(Object.values(aggregatedNutrients), recommendedNutrients);
    } catch (error) {
      console.error('Error fetching meal data:', error);
      toast.error('급식 데이터 조회 중 오류가 발생했습니다.');
      setMealData([]);
      setNutrients([]);
    }
  };

  const handleAddBreakfast = async (foodItems: any[]) => {
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
    
    // Recalculate ML recommendations with breakfast
    await fetchMLRecommendations(updatedNutrients, recommendedNutrients);
  };

  const fetchMLRecommendations = async (currentNutrients: any[], recommended: any) => {
    try {
      setIsLoadingRecommendations(true);
      
      // Calculate deficiencies (recommended - current, minimum 0)
      const nutrientMap: Record<string, number> = {
        '탄수화물': 0,
        '단백질': 0,
        '지방': 0,
        '비타민A': 0,
        '티아민': 0,
        '리보플라빈': 0,
        '비타민C': 0,
        '칼슘': 0,
        '철분': 0,
      };

      // Get current intake
      currentNutrients.forEach(nutrient => {
        if (nutrientMap.hasOwnProperty(nutrient.name)) {
          nutrientMap[nutrient.name] = nutrient.current;
        }
      });

      // Calculate deficiencies
      const deficiencies = {
        carbohydrate: Math.max(0, (recommended.carbohydrate || 0) - nutrientMap['탄수화물']),
        protein: Math.max(0, (recommended.protein || 0) - nutrientMap['단백질']),
        fat: Math.max(0, (recommended.fat || 0) - nutrientMap['지방']),
        vitamin_a: Math.max(0, (recommended.vitaminA || 0) - nutrientMap['비타민A']),
        thiamine: Math.max(0, (recommended.thiamine || 0) - nutrientMap['티아민']),
        riboflavin: Math.max(0, (recommended.riboflavin || 0) - nutrientMap['리보플라빈']),
        vitamin_c: Math.max(0, (recommended.vitaminC || 0) - nutrientMap['비타민C']),
        calcium: Math.max(0, (recommended.calcium || 0) - nutrientMap['칼슘']),
        iron: Math.max(0, (recommended.iron || 0) - nutrientMap['철분']),
      };

      console.log('Calculated deficiencies:', deficiencies);

      // Call ML API
      const response = await fetch(`${ML_API_URL}/recommend`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ deficiencies }),
      });

      if (!response.ok) {
        throw new Error(`ML API error: ${response.status}`);
      }

      const data = await response.json();
      setMlRecommendations(data.recommendations || []);
      
      if (data.recommendations && data.recommendations.length > 0) {
        toast.success('맞춤 음식 추천을 받았습니다!');
      }
    } catch (error) {
      console.error('Error fetching ML recommendations:', error);
      toast.error('음식 추천을 가져오는 중 오류가 발생했습니다. ML API가 실행 중인지 확인해주세요.');
      setMlRecommendations([]);
    } finally {
      setIsLoadingRecommendations(false);
    }
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
                {isLoadingRecommendations ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">맞춤 음식 추천을 생성하는 중...</p>
                  </div>
                ) : mlRecommendations.length > 0 ? (
                  <FoodRecommendations recommendations={mlRecommendations} />
                ) : null}
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
