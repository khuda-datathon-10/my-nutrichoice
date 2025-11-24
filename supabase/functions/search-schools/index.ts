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
    const { schoolName } = await req.json();
    
    if (!schoolName || schoolName.length < 2) {
      return new Response(
        JSON.stringify({ error: '학교명을 2글자 이상 입력해주세요' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    console.log('Searching schools with name:', schoolName);

    // Supabase 클라이언트 생성
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    // 데이터베이스에서 학교 검색 (ILIKE를 사용한 부분 매칭)
    const { data: schools, error } = await supabaseClient
      .from('schools')
      .select('*')
      .ilike('school_name', `%${schoolName}%`)
      .limit(100);

    if (error) {
      console.error('Database error:', error);
      throw error;
    }

    console.log(`Found ${schools?.length || 0} schools`);

    // 응답 형식 변환
    const formattedSchools = (schools || []).map(school => ({
      schoolName: school.school_name,
      schoolCode: school.school_code,
      officeCode: school.office_code,
      address: school.office_name,
      schoolType: school.office_name.includes('초') ? '초등학교' : 
                  school.office_name.includes('중') ? '중학교' : 
                  school.office_name.includes('고') ? '고등학교' : '학교',
    }));

    return new Response(
      JSON.stringify({ schools: formattedSchools }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error searching schools:', error);
    return new Response(
      JSON.stringify({ error: '학교 검색 중 오류가 발생했습니다' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});