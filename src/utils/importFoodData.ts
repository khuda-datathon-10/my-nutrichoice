import * as XLSX from 'xlsx';
import { supabase } from '@/integrations/supabase/client';

export const importFoodDataFromFile = async (file: File) => {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });
    
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet);

    console.log(`Processing ${data.length} food items...`);

    const foodItems = data.map((row: any) => ({
      food_name: row['식품명'] || row['음식명'] || '',
      food_code: row['식품코드'] || '',
      calories: String(row['에너지(kcal)'] || row['칼로리'] || ''),
      carbohydrate: String(row['탄수화물(g)'] || ''),
      protein: String(row['단백질(g)'] || ''),
      fat: String(row['지방(g)'] || ''),
      vitamin_a: String(row['비타민A(μg RAE)'] || row['비타민A'] || ''),
      thiamine: String(row['티아민(mg)'] || row['비타민B1'] || ''),
      riboflavin: String(row['리보플라빈(mg)'] || row['비타민B2'] || ''),
      vitamin_c: String(row['비타민C(mg)'] || row['비타민C'] || ''),
      calcium: String(row['칼슘(mg)'] || ''),
      iron: String(row['철(mg)'] || ''),
      serving_size: String(row['1회제공량'] || row['제공량'] || '')
    })).filter((item: any) => item.food_name);

    // Insert in batches
    const batchSize = 100;
    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < foodItems.length; i += batchSize) {
      const batch = foodItems.slice(i, i + batchSize);
      const { error } = await supabase
        .from('food_items')
        .upsert(batch, { onConflict: 'food_code', ignoreDuplicates: false });
      
      if (error) {
        console.error(`Error inserting batch ${i / batchSize + 1}:`, error);
        errorCount += batch.length;
      } else {
        console.log(`Inserted batch ${i / batchSize + 1}`);
        successCount += batch.length;
      }
    }

    return {
      success: true,
      total: foodItems.length,
      successCount,
      errorCount
    };
  } catch (error) {
    console.error('Error importing food data:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};