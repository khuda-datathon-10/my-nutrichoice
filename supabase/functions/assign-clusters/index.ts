import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const ML_BACKEND_URL = "https://unsubordinative-martha-trigonometrically.ngrok-free.dev";

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('🚀 Starting cluster assignment process...');

    // Get all foods without cluster_id
    const { data: foods, error: fetchError } = await supabase
      .from('food_items')
      .select('*')
      .is('cluster_id', null)
      .limit(1000); // Process in batches

    if (fetchError) {
      console.error('❌ Error fetching foods:', fetchError);
      throw fetchError;
    }

    if (!foods || foods.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: '모든 음식에 이미 cluster_id가 할당되어 있습니다.',
          processed: 0
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`📊 Processing ${foods.length} foods...`);

    let successCount = 0;
    let errorCount = 0;

    // Process each food
    for (const food of foods) {
      try {
        // Extract nutrient features (9 features)
        const features = [
          parseFloat(food.carbohydrate) || 0,
          parseFloat(food.protein) || 0,
          parseFloat(food.fat) || 0,
          parseFloat(food.vitamin_a) || 0,
          parseFloat(food.thiamine) || 0,
          parseFloat(food.riboflavin) || 0,
          parseFloat(food.vitamin_c) || 0,
          parseFloat(food.calcium) || 0,
          parseFloat(food.iron) || 0,
        ];

        // Call ML backend to predict cluster
        const mlResponse = await fetch(`${ML_BACKEND_URL}/predict-cluster`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ features }),
        });

        if (!mlResponse.ok) {
          console.error(`❌ ML prediction failed for ${food.food_name}:`, mlResponse.status);
          errorCount++;
          continue;
        }

        const { cluster_id } = await mlResponse.json();

        // Update food with cluster_id
        const { error: updateError } = await supabase
          .from('food_items')
          .update({ cluster_id })
          .eq('id', food.id);

        if (updateError) {
          console.error(`❌ Update failed for ${food.food_name}:`, updateError);
          errorCount++;
          continue;
        }

        successCount++;
        
        if (successCount % 100 === 0) {
          console.log(`✅ Progress: ${successCount} foods assigned`);
        }
      } catch (error) {
        console.error(`❌ Error processing ${food.food_name}:`, error);
        errorCount++;
      }
    }

    console.log(`🎉 Cluster assignment complete! Success: ${successCount}, Errors: ${errorCount}`);

    return new Response(
      JSON.stringify({
        success: true,
        processed: foods.length,
        successCount,
        errorCount,
        message: `${successCount}개 음식에 cluster_id 할당 완료`
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ Cluster assignment error:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : '알 수 없는 오류',
        success: false 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
