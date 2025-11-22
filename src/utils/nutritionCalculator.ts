// 사용자 프로필 기반 권장 영양소 섭취량 계산

interface UserProfile {
  age: number;
  height: number; // cm
  weight: number; // kg
  gender: 'male' | 'female';
}

interface RecommendedNutrients {
  에너지: number;
  탄수화물: number;
  단백질: number;
  지방: number;
  비타민A: number;
  티아민: number;
  리보플라빈: number;
  비타민C: number;
  칼슘: number;
  철분: number;
}

// 총에너지소비량(TEE) 계산
function calculateTEE(profile: UserProfile): number {
  const { age, height, weight, gender } = profile;
  const heightInMeters = height / 100;

  if (gender === 'male') {
    // 8~19세 남성 = 88.5 - 61.9 + 연령 + 1.13 * (26.7 * 체중 + 903 * 신장(m)) + 25
    return 88.5 - 61.9 + age + 1.13 * (26.7 * weight + 903 * heightInMeters) + 25;
  } else {
    // 8~19세 여성 = 135.3 - 30.8 * 연령 + 1.13 * (10.0 * 체중 + 934 * 신장(m)) + 25
    return 135.3 - 30.8 * age + 1.13 * (10.0 * weight + 934 * heightInMeters) + 25;
  }
}

// 티아민 권장량 계산
function calculateThiamin(age: number, gender: 'male' | 'female'): number {
  if (gender === 'male') {
    if (age <= 8) return 0.7;
    if (age <= 11) return 0.9;
    if (age <= 14) return 1.1;
    return 1.3; // 15-18세
  } else {
    if (age <= 8) return 0.7;
    if (age <= 11) return 0.9;
    if (age <= 14) return 1.1;
    return 1.1; // 15-18세
  }
}

// 리보플라빈 권장량 계산
function calculateRiboflavin(age: number, gender: 'male' | 'female'): number {
  if (gender === 'male') {
    if (age <= 8) return 0.9;
    if (age <= 11) return 1.1;
    if (age <= 14) return 1.5;
    return 1.7; // 15-18세
  } else {
    if (age <= 8) return 0.8;
    if (age <= 11) return 1.0;
    if (age <= 14) return 1.2;
    return 1.2; // 15-18세
  }
}

// 비타민C 권장량 계산
function calculateVitaminC(age: number): number {
  if (age <= 8) return 50;
  if (age <= 11) return 70;
  if (age <= 14) return 90;
  return 100; // 15-18세
}

// 칼슘 권장량 계산
function calculateCalcium(age: number): number {
  if (age <= 8) return 700;
  if (age <= 11) return 800;
  if (age <= 14) return 1000;
  return 900; // 15-18세
}

// 철분 권장량 계산
function calculateIron(age: number, gender: 'male' | 'female'): number {
  if (gender === 'male') {
    if (age <= 8) return 9;
    if (age <= 11) return 11;
    return 14; // 12-18세
  } else {
    if (age <= 8) return 9;
    if (age <= 11) return 10;
    if (age <= 14) return 16;
    return 14; // 15-18세
  }
}

// 모든 권장 영양소 계산
export function calculateRecommendedNutrients(profile: UserProfile): RecommendedNutrients {
  const tee = calculateTEE(profile);

  return {
    에너지: Math.round(tee),
    탄수화물: Math.round(tee / 4), // TEE / 4 (g)
    단백질: Math.round(profile.weight * 0.9), // 체중 * 0.9 (g)
    지방: Math.round((tee * 0.225) / 9), // TEE * 0.225 / 9 (g) - 중간값 사용
    비타민A: profile.gender === 'male' ? 1400 : 1200, // R.E
    티아민: calculateThiamin(profile.age, profile.gender), // mg
    리보플라빈: calculateRiboflavin(profile.age, profile.gender), // mg
    비타민C: calculateVitaminC(profile.age), // mg
    칼슘: calculateCalcium(profile.age), // mg
    철분: calculateIron(profile.age, profile.gender), // mg
  };
}
