import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const AdminModelImport = () => {
  const [isImporting, setIsImporting] = useState(false);
  const [isImported, setIsImported] = useState(false);
  const modelFileInputRef = useRef<HTMLInputElement>(null);
  const scalerFileInputRef = useRef<HTMLInputElement>(null);
  const [modelFileName, setModelFileName] = useState<string>("");
  const [scalerFileName, setScalerFileName] = useState<string>("");

  const handleModelFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setModelFileName(file.name);
    }
  };

  const handleScalerFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setScalerFileName(file.name);
    }
  };

  const handleUpload = async () => {
    const modelFile = modelFileInputRef.current?.files?.[0];
    const scalerFile = scalerFileInputRef.current?.files?.[0];

    if (!modelFile || !scalerFile) {
      toast.error("모델 파일과 스케일러 파일을 모두 선택해주세요");
      return;
    }

    // Validate file extensions
    if (!modelFile.name.endsWith('.pkl')) {
      toast.error("모델 파일은 .pkl 형식이어야 합니다");
      return;
    }

    if (!scalerFile.name.endsWith('.pkl')) {
      toast.error("스케일러 파일은 .pkl 형식이어야 합니다");
      return;
    }

    setIsImporting(true);

    try {
      // Upload model file
      const { error: modelError } = await supabase.storage
        .from('ml-models')
        .upload(`model/${modelFile.name}`, modelFile, {
          cacheControl: '3600',
          upsert: true
        });

      if (modelError) throw modelError;

      // Upload scaler file
      const { error: scalerError } = await supabase.storage
        .from('ml-models')
        .upload(`scaler/${scalerFile.name}`, scalerFile, {
          cacheControl: '3600',
          upsert: true
        });

      if (scalerError) throw scalerError;

      toast.success("모델과 스케일러 파일이 성공적으로 업로드되었습니다");
      setIsImported(true);
      setModelFileName("");
      setScalerFileName("");
      
      // Reset file inputs
      if (modelFileInputRef.current) modelFileInputRef.current.value = "";
      if (scalerFileInputRef.current) scalerFileInputRef.current.value = "";
      
    } catch (error) {
      console.error('Error uploading files:', error);
      toast.error("파일 업로드 중 오류가 발생했습니다");
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <Card className="w-full shadow-medium border-border/50 bg-gradient-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <Upload className="h-5 w-5 text-primary" />
          ML 모델 파일 업로드
        </CardTitle>
        <CardDescription>
          머신러닝 모델(.pkl)과 스케일러(.pkl) 파일을 업로드합니다
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">모델 파일 (.pkl)</label>
          <div className="flex gap-2">
            <input
              type="file"
              ref={modelFileInputRef}
              onChange={handleModelFileChange}
              accept=".pkl"
              className="hidden"
            />
            <Button
              onClick={() => modelFileInputRef.current?.click()}
              variant="outline"
              className="flex-1"
            >
              {modelFileName || "모델 파일 선택"}
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">스케일러 파일 (.pkl)</label>
          <div className="flex gap-2">
            <input
              type="file"
              ref={scalerFileInputRef}
              onChange={handleScalerFileChange}
              accept=".pkl"
              className="hidden"
            />
            <Button
              onClick={() => scalerFileInputRef.current?.click()}
              variant="outline"
              className="flex-1"
            >
              {scalerFileName || "스케일러 파일 선택"}
            </Button>
          </div>
        </div>

        <Button
          onClick={handleUpload}
          disabled={isImporting || !modelFileName || !scalerFileName}
          className="w-full"
          size="lg"
        >
          {isImported ? (
            <>
              <CheckCircle className="mr-2 h-5 w-5" />
              업로드 완료
            </>
          ) : (
            <>
              <Upload className="mr-2 h-5 w-5" />
              {isImporting ? "업로드 중..." : "파일 업로드"}
            </>
          )}
        </Button>

        {isImported && (
          <p className="text-sm text-muted-foreground text-center">
            다른 파일을 업로드하려면 파일을 다시 선택하세요
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default AdminModelImport;
