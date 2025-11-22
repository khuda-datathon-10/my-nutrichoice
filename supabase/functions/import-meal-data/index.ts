import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { mealData } = await req.json();

    if (!mealData || !Array.isArray(mealData)) {
      return new Response(
        JSON.stringify({ error: 'Invalid meal data format' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    console.log(`Importing ${mealData.length} meal records`);

    // 학교 정보 추출 및 저장
    const schools = new Map();
    for (const meal of mealData) {
      const schoolKey = meal.school_code;
      if (!schools.has(schoolKey)) {
        schools.set(schoolKey, {
          office_code: meal.office_code,
          office_name: meal.office_name,
          school_code: meal.school_code,
          school_name: meal.school_name,
        });
      }
    }

    // 학교 정보 삽입 (upsert)
    const schoolsArray = Array.from(schools.values());
    console.log(`Upserting ${schoolsArray.length} schools`);
    
    const { error: schoolsError } = await supabaseClient
      .from('schools')
      .upsert(schoolsArray, { onConflict: 'school_code' });

    if (schoolsError) {
      console.error('Error inserting schools:', schoolsError);
      throw schoolsError;
    }

    // 급식 정보 삽입
    const mealRecords = mealData.map(meal => {
      // Convert date format from YYYYMMDD to YYYY-MM-DD
      const formatDate = (dateStr: string) => {
        if (!dateStr) return null;
        const str = String(dateStr);
        if (str.length === 8) {
          return `${str.slice(0, 4)}-${str.slice(4, 6)}-${str.slice(6, 8)}`;
        }
        return dateStr;
      };

      return {
        school_code: meal.school_code,
        meal_code: meal.meal_code,
        meal_name: meal.meal_name,
        meal_date: formatDate(meal.meal_date),
        meal_count: meal.meal_count ? parseFloat(meal.meal_count) : null,
        dish_names: meal.dish_names,
        origin_info: meal.origin_info,
        calorie_info: meal.calorie_info,
        nutrition_info: meal.nutrition_info,
        updated_date: formatDate(meal.updated_date),
      };
    });

    console.log(`Inserting ${mealRecords.length} meal records`);

    const { error: mealsError } = await supabaseClient
      .from('meal_info')
      .insert(mealRecords);

    if (mealsError) {
      console.error('Error inserting meals:', mealsError);
      throw mealsError;
    }

    return new Response(
      JSON.stringify({
        success: true,
        schoolsImported: schoolsArray.length,
        mealsImported: mealRecords.length,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error importing data:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});