import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, CheckCircle2, FileUp } from "lucide-react";
import { toast } from "sonner";
import { importFoodDataFromFile } from "@/utils/importFoodData";

const AdminFoodImport = () => {
  const [isImporting, setIsImporting] = useState(false);
  const [isImported, setIsImported] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      toast.error('엑셀 파일(.xlsx, .xls)만 업로드 가능합니다');
      return;
    }

    setIsImporting(true);
    
    try {
      toast.info('음식 데이터를 가져오는 중...');
      const result = await importFoodDataFromFile(file);
      
      if (result.success) {
        toast.success(`${result.successCount}개의 음식 데이터를 가져왔습니다`);
        if (result.errorCount > 0) {
          toast.warning(`${result.errorCount}개의 항목에서 오류가 발생했습니다`);
        }
        setIsImported(true);
      } else {
        toast.error(`데이터 가져오기 실패: ${result.error}`);
      }
    } catch (error) {
      console.error('Import error:', error);
      toast.error('음식 데이터 가져오기 중 오류가 발생했습니다');
    } finally {
      setIsImporting(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-6 w-6" />
          음식 데이터베이스 가져오기
        </CardTitle>
        <CardDescription>
          엑셀 파일(.xlsx, .xls)을 업로드하여 음식 데이터베이스를 구축하세요
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
                "가져오는 중..."
              ) : (
                <>
                  <FileUp className="mr-2 h-5 w-5" />
                  엑셀 파일 선택 및 업로드
                </>
              )}
            </span>
          </Button>
        </label>
        {isImported && (
          <div className="flex items-center justify-center text-green-600 gap-2">
            <CheckCircle2 className="h-5 w-5" />
            <span>가져오기 완료</span>
          </div>
        )}
        <p className="text-xs text-muted-foreground">
          * 파일 형식: 식품명, 식품코드, 에너지(kcal), 탄수화물(g), 단백질(g), 지방(g), 
          비타민A(μg RAE), 티아민(mg), 리보플라빈(mg), 비타민C(mg), 칼슘(mg), 철(mg), 1회제공량
        </p>
      </CardContent>
    </Card>
  );
};

export default AdminFoodImport;