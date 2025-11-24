import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

declare const EdgeRuntime: any;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const ML_BACKEND_URL = "https://unsubordinative-martha-trigonometrically.ngrok-free.dev";

async function assignClustersInBackground(supabaseUrl: string, supabaseKey: string) {
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  console.log('🚀 Starting background cluster assignment...');
  
  let totalProcessed = 0;
  let totalSuccess = 0;
  let totalErrors = 0;
  
  while (true) {
    // Get batch of foods without cluster_id
    const { data: foods, error: fetchError } = await supabase
      .from('food_items')
      .select('*')
      .is('cluster_id', null)
      .limit(100); // Smaller batches

    if (fetchError) {
      console.error('❌ Error fetching foods:', fetchError);
      break;
    }

    if (!foods || foods.length === 0) {
      console.log('✅ All foods have been assigned cluster_id');
      break;
    }

    console.log(`📊 Processing batch of ${foods.length} foods...`);

    // Process each food in batch
    for (const food of foods) {
      try {
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

        const mlResponse = await fetch(`${ML_BACKEND_URL}/predict-cluster`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ features }),
        });

        if (!mlResponse.ok) {
          console.error(`❌ ML prediction failed for ${food.food_name}`);
          totalErrors++;
          continue;
        }

        const { cluster_id } = await mlResponse.json();

        const { error: updateError } = await supabase
          .from('food_items')
          .update({ cluster_id })
          .eq('id', food.id);

        if (updateError) {
          console.error(`❌ Update failed for ${food.food_name}`);
          totalErrors++;
          continue;
        }

        totalSuccess++;
        totalProcessed++;
      } catch (error) {
        console.error(`❌ Error processing food:`, error);
        totalErrors++;
      }
    }
    
    console.log(`✅ Batch complete. Total: ${totalProcessed} (Success: ${totalSuccess}, Errors: ${totalErrors})`);
  }
  
  console.log(`🎉 All batches complete! Total Success: ${totalSuccess}, Total Errors: ${totalErrors}`);
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Check how many foods need cluster assignment
    const { count, error: countError } = await supabase
      .from('food_items')
      .select('*', { count: 'exact', head: true })
      .is('cluster_id', null);

    if (countError) {
      console.error('❌ Error counting foods:', countError);
      throw countError;
    }

    if (count === 0) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: '모든 음식에 이미 cluster_id가 할당되어 있습니다.',
          remaining: 0
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Start background task
    EdgeRuntime.waitUntil(
      assignClustersInBackground(supabaseUrl, supabaseKey)
    );

    // Return immediate response
    return new Response(
      JSON.stringify({
        success: true,
        message: `백그라운드에서 ${count}개 음식에 cluster_id 할당 시작`,
        remaining: count,
        status: 'processing'
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
