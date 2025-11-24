import AdminFoodImport from "@/components/AdminFoodImport";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { Loader2 } from "lucide-react";

const AdminFoodData = () => {
  const [isAssigning, setIsAssigning] = useState(false);

  const handleAssignClusters = async () => {
    setIsAssigning(true);
    toast.info('🤖 ML 모델로 cluster_id 자동 할당 시작...');

    try {
      const { data, error } = await supabase.functions.invoke('assign-clusters');

      if (error) throw error;

      if (data.success) {
        toast.success(`✅ ${data.message}`);
        toast.info('백그라운드에서 처리가 진행됩니다. Edge Function 로그에서 진행 상황을 확인할 수 있습니다.');
      } else {
        toast.error('❌ Cluster 할당 실패');
      }
    } catch (error) {
      console.error('Cluster assignment error:', error);
      toast.error('❌ Cluster 할당 중 오류 발생');
    } finally {
      setIsAssigning(false);
    }
  };

  return (
    <div className="min-h-screen bg-background py-16 px-6">
      <div className="container mx-auto max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">음식 데이터베이스 관리</h1>
          <p className="text-muted-foreground">
            조식 추가 기능을 위한 음식 데이터를 관리합니다
          </p>
        </div>

        <Card className="p-6 mb-6">
          <h2 className="text-xl font-semibold mb-2">ML Cluster 자동 할당</h2>
          <p className="text-sm text-muted-foreground mb-4">
            음식 추천 기능을 위해 ML 모델을 사용하여 각 음식에 cluster_id를 자동으로 할당합니다.
            백그라운드에서 처리되며, 완료까지 시간이 걸릴 수 있습니다.
          </p>
          <Button 
            onClick={handleAssignClusters} 
            disabled={isAssigning}
            className="w-full"
          >
            {isAssigning ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Cluster 할당 중...
              </>
            ) : (
              'Cluster ID 자동 할당'
            )}
          </Button>
        </Card>
        
        <AdminFoodImport />
      </div>
    </div>
  );
};

export default AdminFoodData;