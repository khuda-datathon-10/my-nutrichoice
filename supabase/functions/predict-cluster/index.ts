import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.84.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Mapping between Korean nutrient names and database columns
const nutrientMapping: Record<string, string> = {
  '에너지': 'calories',
  '탄수화물': 'carbohydrate',
  '단백질': 'protein',
  '지방': 'fat',
  '비타민A': 'vitamin_a',
  '티아민': 'thiamine',
  '리보플라빈': 'riboflavin',
  '비타민C': 'vitamin_c',
  '칼슘': 'calcium',
  '철분': 'iron',
};

interface FoodItem {
  id: string;
  food_name: string;
  serving_size?: string;
  calories?: string;
  carbohydrate?: string;
  protein?: string;
  fat?: string;
  vitamin_a?: string;
  thiamine?: string;
  riboflavin?: string;
  vitamin_c?: string;
  calcium?: string;
  iron?: string;
}

// Calculate similarity score between deficiencies and food nutritional profile
function calculateSimilarityScore(deficiencies: Record<string, number>, food: FoodItem): number {
  let score = 0;
  let totalDeficiency = 0;

  // For each deficiency, check how much the food can help
  for (const [nutrientKorean, deficiency] of Object.entries(deficiencies)) {
    if (deficiency <= 0) continue; // Skip if not deficient
    
    const dbColumn = nutrientMapping[nutrientKorean];
    if (!dbColumn) continue;

    const foodValue = parseFloat(food[dbColumn as keyof FoodItem] as string || '0');
    
    // Weight the contribution by how deficient we are
    // Higher deficiency = more weight for foods that provide this nutrient
    if (foodValue > 0) {
      score += (foodValue / Math.max(deficiency, 1)) * deficiency;
    }
    
    totalDeficiency += deficiency;
  }

  // Normalize by total deficiency to get a comparable score
  return totalDeficiency > 0 ? score / totalDeficiency : 0;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { deficiencies } = await req.json();
    
    console.log('Received deficiencies:', deficiencies);

    // Get all food items
    const { data: foodItems, error: foodError } = await supabase
      .from('food_items')
      .select('*');

    if (foodError) {
      console.error('Food items error:', foodError);
      throw new Error('Failed to load food items');
    }

    if (!foodItems || foodItems.length === 0) {
      console.error('No food items found');
      return new Response(
        JSON.stringify({ recommendations: [] }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Loaded food items:', foodItems.length);

    // Calculate similarity score for each food item
    const scoredFoods = foodItems.map((food: FoodItem) => ({
      food,
      score: calculateSimilarityScore(deficiencies, food),
    }));

    // Sort by score (highest first) and take top 5
    const topFoods = scoredFoods
      .filter(item => item.score > 0) // Only include foods that help with deficiencies
      .sort((a, b) => b.score - a.score)
      .slice(0, 5)
      .map(item => item.food);

    console.log('Top 5 recommended foods:', topFoods.map(f => ({ name: f.food_name, score: calculateSimilarityScore(deficiencies, f) })));

    return new Response(
      JSON.stringify({ recommendations: topFoods }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in predict-cluster:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        recommendations: [] 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});