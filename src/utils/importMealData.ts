// XLS 파일 데이터를 파싱하여 데이터베이스에 임포트하는 유틸리티
export interface MealRecord {
  office_code: string;
  office_name: string;
  school_code: string;
  school_name: string;
  meal_code: string;
  meal_name: string;
  meal_date: string;
  meal_count: string;
  dish_names: string;
  origin_info: string;
  calorie_info: string;
  nutrition_info: string;
  updated_date: string;
}

// 샘플 데이터 (XLS 파일에서 추출한 일부 데이터)
export const sampleMealData: MealRecord[] = [
  {
    office_code: "B10",
    office_name: "서울특별시교육청",
    school_code: "7010057",
    school_name: "가락고등학교",
    meal_code: "2",
    meal_name: "중식",
    meal_date: "20251113",
    meal_count: "120.00",
    dish_names: "[수능감독] 흰쌀밥\n곰탕&소면 (5.6.13.16)\n봄동겉절이 (5.6.13)\n애호박전 (1.6)\n김치전 (1.6.9.17)\n석박지 (9)\n컵과일(수능) (12)\n초코볼&너츠 (2.5.6)",
    origin_info: "쇠고기(종류) : 국내산(육우)\n쇠고기 식육가공품 : 국내산\n돼지고기 : 국내산(1등급)",
    calorie_info: "1217.3 Kcal",
    nutrition_info: "탄수화물(g) : 181.3\n단백질(g) : 49.1\n지방(g) : 30.6\n비타민A(R.E) : 230.1\n티아민(mg) : 0.6\n리보플라빈(mg) : 1.4\n비타민C(mg) : 43.7\n칼슘(mg) : 222.5\n철분(mg) : 6.3",
    updated_date: "20251120"
  },
  // 더 많은 데이터는 실제 XLS 파일에서 임포트
];