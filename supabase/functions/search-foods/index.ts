import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { foodName } = await req.json();
    console.log('Searching foods with name:', foodName);

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    // Use similarity search with pg_trgm
    const { data, error } = await supabase
      .from('food_items')
      .select('*')
      .textSearch('food_name', foodName, {
        type: 'websearch',
        config: 'simple'
      })
      .limit(20);

    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }

    console.log(`Found ${data?.length || 0} foods`);

    return new Response(
      JSON.stringify({ foods: data || [] }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in search-foods function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error', foods: [] }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});