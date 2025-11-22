import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload } from "lucide-react";
import { toast } from "sonner";
import { importFoodDataFromFile } from "@/utils/importFoodData";

const AdminFoodImport = () => {
  const [isImporting, setIsImporting] = useState(false);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      toast.error('엑셀 파일(.xlsx, .xls)만 업로드 가능합니다');
      return;
    }

    setIsImporting(true);
    toast.info('음식 데이터를 가져오는 중...');

    try {
      const result = await importFoodDataFromFile(file);
      
      if (result.success) {
        toast.success(`${result.successCount}개의 음식 데이터를 가져왔습니다`);
        if (result.errorCount > 0) {
          toast.warning(`${result.errorCount}개의 항목에서 오류가 발생했습니다`);
        }
      } else {
        toast.error(`데이터 가져오기 실패: ${result.error}`);
      }
    } catch (error) {
      console.error('Import error:', error);
      toast.error('음식 데이터 가져오기 중 오류가 발생했습니다');
    } finally {
      setIsImporting(false);
      // Reset file input
      event.target.value = '';
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>음식 데이터베이스 가져오기</CardTitle>
        <CardDescription>
          엑셀 파일(.xlsx)을 업로드하여 음식 데이터베이스를 구축하세요
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4">
          <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
            <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-sm text-muted-foreground mb-4">
              음식 데이터 엑셀 파일을 선택하세요
            </p>
            <label htmlFor="file-upload">
              <Button disabled={isImporting} asChild>
                <span>
                  {isImporting ? '가져오는 중...' : '파일 선택'}
                </span>
              </Button>
            </label>
            <input
              id="file-upload"
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileUpload}
              disabled={isImporting}
              className="hidden"
            />
          </div>
          <p className="text-xs text-muted-foreground">
            * 파일 형식: 식품명, 식품코드, 에너지(kcal), 탄수화물(g), 단백질(g), 지방(g), 
            비타민A(μg RAE), 티아민(mg), 리보플라빈(mg), 비타민C(mg), 칼슘(mg), 철(mg), 1회제공량
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminFoodImport;