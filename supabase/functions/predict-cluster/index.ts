import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.84.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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

    // Download model and scaler from storage
    const { data: modelData, error: modelError } = await supabase.storage
      .from('ml-models')
      .download('model/kmeans_model.pkl');
    
    if (modelError) {
      console.error('Model download error:', modelError);
      throw new Error('Failed to load model');
    }

    const { data: scalerData, error: scalerError } = await supabase.storage
      .from('ml-models')
      .download('scaler/scaler.pkl');
    
    if (scalerError) {
      console.error('Scaler download error:', scalerError);
      throw new Error('Failed to load scaler');
    }

    // Get all food items
    const { data: foodItems, error: foodError } = await supabase
      .from('food_items')
      .select('*');

    if (foodError) {
      console.error('Food items error:', foodError);
      throw new Error('Failed to load food items');
    }

    console.log('Loaded food items:', foodItems?.length);

    // Convert blob to ArrayBuffer
    const modelBuffer = await modelData.arrayBuffer();
    const scalerBuffer = await scalerData.arrayBuffer();

    // Call Python service (you'll need to set up a separate Python service)
    // For now, return a placeholder response
    const pythonServiceUrl = Deno.env.get('PYTHON_ML_SERVICE_URL') || 'http://localhost:8000/predict';
    
    const mlResponse = await fetch(pythonServiceUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        deficiencies,
        foodItems,
        modelBuffer: Array.from(new Uint8Array(modelBuffer)),
        scalerBuffer: Array.from(new Uint8Array(scalerBuffer)),
      }),
    });

    if (!mlResponse.ok) {
      throw new Error('ML service error');
    }

    const result = await mlResponse.json();

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

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