import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, CheckCircle2, FileUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import * as XLSX from 'xlsx';

const AdminImport = () => {
  const [isImporting, setIsImporting] = useState(false);
  const [isImported, setIsImported] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const parseXLSFile = (file: File): Promise<any[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const data = e.target?.result;
          const workbook = XLSX.read(data, { type: 'binary' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
          
          // Skip header row and convert to meal data format
          const mealData = jsonData.slice(1).map((row: any) => ({
            office_code: row[0],
            office_name: row[1],
            school_code: row[2],
            school_name: row[3],
            meal_code: row[4],
            meal_name: row[5],
            meal_date: row[6],
            meal_count: row[7],
            dish_names: row[8],
            origin_info: row[9],
            calorie_info: row[10],
            nutrition_info: row[11],
            updated_date: row[12]
          })).filter(item => item.school_code); // Filter out empty rows
          
          resolve(mealData);
        } catch (error) {
          reject(error);
        }
      };
      
      reader.onerror = reject;
      reader.readAsBinaryString(file);
    });
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    
    try {
      toast.info('파일 파싱 중...');
      const mealData = await parseXLSFile(file);
      
      toast.info(`${mealData.length}개의 급식 데이터를 업로드 중...`);
      
      const { data, error } = await supabase.functions.invoke('import-meal-data', {
        body: { mealData }
      });

      if (error) throw error;

      toast.success(`급식 데이터 임포트 완료!\n학교: ${data.schoolsImported}개, 급식: ${data.mealsImported}개`);
      setIsImported(true);
    } catch (error) {
      console.error('Error importing data:', error);
      toast.error('데이터 임포트 중 오류가 발생했습니다.');
    } finally {
      setIsImporting(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="container mx-auto max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-6 w-6" />
              급식 데이터 임포트
            </CardTitle>
            <CardDescription>
              XLS 파일을 업로드하여 급식 데이터를 데이터베이스로 임포트합니다
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <input
              ref={fileInputRef}
              type="file"
              accept=".xls,.xlsx"
              onChange={handleFileUpload}
              className="hidden"
              id="file-upload"
            />
            <label htmlFor="file-upload">
              <Button
                onClick={() => fileInputRef.current?.click()}
                disabled={isImporting}
                className="w-full"
                size="lg"
                asChild
              >
                <span>
                  {isImporting ? (
                    "임포트 중..."
                  ) : (
                    <>
                      <FileUp className="mr-2 h-5 w-5" />
                      XLS 파일 선택 및 업로드
                    </>
                  )}
                </span>
              </Button>
            </label>
            {isImported && (
              <div className="flex items-center justify-center text-green-600 gap-2">
                <CheckCircle2 className="h-5 w-5" />
                <span>임포트 완료</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminImport;
