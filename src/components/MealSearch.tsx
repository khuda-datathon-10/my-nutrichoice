import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, Calendar } from "lucide-react";
import { toast } from "sonner";

interface MealSearchProps {
  onSearch: (schoolCode: string, date: string) => void;
}

const MealSearch = ({ onSearch }: MealSearchProps) => {
  const [schoolCode, setSchoolCode] = useState("");
  const [officeCode, setOfficeCode] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const handleSearch = () => {
    if (!schoolCode || !officeCode) {
      toast.error("학교 코드와 교육청 코드를 모두 입력해주세요");
      return;
    }
    onSearch(schoolCode, date);
    toast.success("급식 정보를 조회합니다");
  };

  return (
    <Card className="w-full shadow-medium border-border/50 bg-gradient-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-2xl">
          <Search className="h-6 w-6 text-primary" />
          급식 정보 조회
        </CardTitle>
        <CardDescription className="text-base">
          학교 코드와 날짜를 입력하여 급식 영양 정보를 확인하세요
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="officeCode" className="text-sm font-medium">
              시도교육청 코드
            </Label>
            <Input
              id="officeCode"
              placeholder="예: B10"
              value={officeCode}
              onChange={(e) => setOfficeCode(e.target.value)}
              className="border-input"
            />
            <p className="text-xs text-muted-foreground">
              서울: B10, 부산: C10, 대구: D10 등
            </p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="schoolCode" className="text-sm font-medium">
              학교 행정표준코드
            </Label>
            <Input
              id="schoolCode"
              placeholder="예: 7091234"
              value={schoolCode}
              onChange={(e) => setSchoolCode(e.target.value)}
              className="border-input"
            />
            <p className="text-xs text-muted-foreground">
              학교알리미에서 확인 가능
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="date" className="text-sm font-medium flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            날짜
          </Label>
          <Input
            id="date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="border-input"
          />
        </div>

        <Button 
          onClick={handleSearch} 
          className="w-full bg-primary text-primary-foreground hover:bg-primary/90 shadow-soft transition-all hover:shadow-medium"
          size="lg"
        >
          <Search className="mr-2 h-5 w-5" />
          조회하기
        </Button>
      </CardContent>
    </Card>
  );
};

export default MealSearch;
