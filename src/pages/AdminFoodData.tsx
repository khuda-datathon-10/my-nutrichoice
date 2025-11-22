import AdminFoodImport from "@/components/AdminFoodImport";

const AdminFoodData = () => {
  return (
    <div className="min-h-screen bg-background py-16 px-6">
      <div className="container mx-auto max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">음식 데이터베이스 관리</h1>
          <p className="text-muted-foreground">
            조식 추가 기능을 위한 음식 데이터를 관리합니다
          </p>
        </div>
        
        <AdminFoodImport />
      </div>
    </div>
  );
};

export default AdminFoodData;