-- trigram 확장 프로그램 활성화 (한글 검색 개선)
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- 학교 정보 테이블 생성
CREATE TABLE IF NOT EXISTS public.schools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  office_code TEXT NOT NULL,
  office_name TEXT NOT NULL,
  school_code TEXT NOT NULL UNIQUE,
  school_name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 급식 정보 테이블 생성
CREATE TABLE IF NOT EXISTS public.meal_info (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_code TEXT NOT NULL REFERENCES public.schools(school_code),
  meal_code TEXT NOT NULL,
  meal_name TEXT NOT NULL,
  meal_date DATE NOT NULL,
  meal_count DECIMAL,
  dish_names TEXT,
  origin_info TEXT,
  calorie_info TEXT,
  nutrition_info TEXT,
  updated_date DATE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 학교명으로 빠른 검색을 위한 인덱스
CREATE INDEX idx_schools_name ON public.schools USING gin(school_name gin_trgm_ops);
CREATE INDEX idx_schools_office_code ON public.schools(office_code);

-- 급식 정보 조회를 위한 인덱스
CREATE INDEX idx_meal_school_date ON public.meal_info(school_code, meal_date);

-- RLS 정책 활성화
ALTER TABLE public.schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meal_info ENABLE ROW LEVEL SECURITY;

-- 모든 사용자가 학교 정보를 조회할 수 있도록 설정 (공개 데이터)
CREATE POLICY "Schools are viewable by everyone"
  ON public.schools FOR SELECT
  USING (true);

-- 모든 사용자가 급식 정보를 조회할 수 있도록 설정 (공개 데이터)
CREATE POLICY "Meal info is viewable by everyone"
  ON public.meal_info FOR SELECT
  USING (true);