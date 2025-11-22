import AdminModelImport from "@/components/AdminModelImport";

const AdminModelData = () => {
  return (
    <div className="min-h-screen bg-background py-16 px-6">
      <div className="container mx-auto max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">ML 모델 관리</h1>
          <p className="text-muted-foreground">
            영양 분석에 사용할 머신러닝 모델과 스케일러 파일을 관리합니다
          </p>
        </div>
        
        <AdminModelImport />
      </div>
    </div>
  );
};

export default AdminModelData;
