import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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

    // NEIS 학교정보 조회 API 호출
    const apiUrl = `https://open.neis.go.kr/hub/schoolInfo`;
    const params = new URLSearchParams({
      KEY: '7a46c2f976404aba855e7d46a0c2c4d0',
      Type: 'json',
      pIndex: '1',
      pSize: '100',
      SCHUL_NM: schoolName,
    });

    const response = await fetch(`${apiUrl}?${params.toString()}`);
    const data = await response.json();

    console.log('NEIS API response:', JSON.stringify(data));

    // API 응답 파싱
    if (data.schoolInfo && data.schoolInfo[1] && data.schoolInfo[1].row) {
      const schools = data.schoolInfo[1].row.map((school: any) => ({
        schoolName: school.SCHUL_NM,
        schoolCode: school.SD_SCHUL_CODE,
        officeCode: school.ATPT_OFCDC_SC_CODE,
        address: school.ORG_RDNMA,
        schoolType: school.SCHUL_KND_SC_NM,
      }));

      return new Response(
        JSON.stringify({ schools }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } else {
      return new Response(
        JSON.stringify({ schools: [] }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  } catch (error) {
    console.error('Error searching schools:', error);
    return new Response(
      JSON.stringify({ error: '학교 검색 중 오류가 발생했습니다' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});