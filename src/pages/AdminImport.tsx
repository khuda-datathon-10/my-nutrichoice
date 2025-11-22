import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, CheckCircle, Database } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const AdminImport = () => {
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState<{ schoolsImported?: number } | null>(null);

  const handleImport = async () => {
    setIsImporting(true);
    try {
      const { data, error } = await supabase.functions.invoke('parse-and-import');

      if (error) throw error;

      toast.success(`${data.schoolsImported}개 학교 임포트 완료!`);
      setImportResult(data);
    } catch (error) {
      console.error('Error importing data:', error);
      toast.error("데이터 임포트 중 오류가 발생했습니다");
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold">데이터 관리</h1>
          <p className="text-muted-foreground">급식 및 학교 데이터를 관리합니다</p>
        </div>

        <Card className="shadow-medium border-border/50 bg-gradient-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Database className="h-6 w-6 text-primary" />
              학교 데이터베이스 임포트
            </CardTitle>
            <CardDescription className="text-base">
              XLS 파일의 모든 학교 정보를 데이터베이스에 저장합니다
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              onClick={handleImport}
              disabled={isImporting}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 shadow-soft transition-all hover:shadow-medium"
              size="lg"
            >
              {importResult ? (
                <>
                  <CheckCircle className="mr-2 h-5 w-5" />
                  임포트 완료 ({importResult.schoolsImported}개 학교)
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-5 w-5" />
                  {isImporting ? "임포트 중..." : "학교 데이터 임포트"}
                </>
              )}
            </Button>

            {importResult && (
              <div className="mt-4 p-4 bg-success/10 border border-success/20 rounded-lg">
                <p className="text-success text-sm">
                  ✓ {importResult.schoolsImported}개의 학교 정보가 성공적으로 저장되었습니다
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminImport;