import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, Calendar, MapPin, User, Ruler, Weight } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface School {
  schoolName: string;
  schoolCode: string;
  officeCode: string;
  address: string;
  schoolType: string;
}

interface MealSearchProps {
  onSearch: (schoolCode: string, date: string, height: string, weight: string, gender: string) => void;
}

const MealSearch = ({ onSearch }: MealSearchProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [schools, setSchools] = useState<School[]>([]);
  const [selectedSchool, setSelectedSchool] = useState<School | null>(null);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [gender, setGender] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const searchSchools = async () => {
      if (searchQuery.length < 2) {
        setSchools([]);
        return;
      }

      setIsSearching(true);
      try {
        const { data, error } = await supabase.functions.invoke('search-schools', {
          body: { schoolName: searchQuery }
        });

        if (error) throw error;

        setSchools(data.schools || []);
      } catch (error) {
        console.error('Error searching schools:', error);
        toast.error('학교 검색 중 오류가 발생했습니다');
      } finally {
        setIsSearching(false);
      }
    };

    const timeoutId = setTimeout(searchSchools, 300);
    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const handleSearch = () => {
    if (!selectedSchool) {
      toast.error("학교를 선택해주세요");
      return;
    }
    if (!height || !weight || !gender) {
      toast.error("키, 몸무게, 성별을 모두 입력해주세요");
      return;
    }
    onSearch(selectedSchool.schoolCode, date, height, weight, gender);
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
        <div className="space-y-2">
          <Label htmlFor="schoolSearch" className="text-sm font-medium flex items-center gap-2">
            <Search className="h-4 w-4" />
            학교 검색
          </Label>
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={open}
                className="w-full justify-between border-input"
              >
                {selectedSchool ? (
                  <span className="truncate">{selectedSchool.schoolName}</span>
                ) : (
                  <span className="text-muted-foreground">학교명을 입력하세요</span>
                )}
                <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0" align="start">
              <Command>
                <CommandInput
                  placeholder="학교명 검색..."
                  value={searchQuery}
                  onValueChange={setSearchQuery}
                />
                <CommandList>
                  {isSearching ? (
                    <CommandEmpty>검색 중...</CommandEmpty>
                  ) : schools.length === 0 ? (
                    <CommandEmpty>
                      {searchQuery.length < 2
                        ? "2글자 이상 입력해주세요"
                        : "검색 결과가 없습니다"}
                    </CommandEmpty>
                  ) : (
                    <CommandGroup>
                      {schools.map((school) => (
                        <CommandItem
                          key={`${school.schoolCode}-${school.officeCode}`}
                          value={school.schoolName}
                          onSelect={() => {
                            setSelectedSchool(school);
                            setOpen(false);
                          }}
                        >
                          <div className="flex flex-col">
                            <span className="font-medium">{school.schoolName}</span>
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {school.schoolType} · {school.address}
                            </span>
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  )}
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
          {selectedSchool && (
            <p className="text-xs text-muted-foreground">
              선택된 학교: {selectedSchool.schoolName} ({selectedSchool.schoolType})
            </p>
          )}
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="height" className="text-sm font-medium flex items-center gap-2">
              <Ruler className="h-4 w-4" />
              키 (cm)
            </Label>
            <Input
              id="height"
              type="number"
              placeholder="예: 170"
              value={height}
              onChange={(e) => setHeight(e.target.value)}
              className="border-input"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="weight" className="text-sm font-medium flex items-center gap-2">
              <Weight className="h-4 w-4" />
              몸무게 (kg)
            </Label>
            <Input
              id="weight"
              type="number"
              placeholder="예: 65"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              className="border-input"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="gender" className="text-sm font-medium flex items-center gap-2">
              <User className="h-4 w-4" />
              성별
            </Label>
            <Select value={gender} onValueChange={setGender}>
              <SelectTrigger id="gender" className="border-input">
                <SelectValue placeholder="성별 선택" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="male">남성</SelectItem>
                <SelectItem value="female">여성</SelectItem>
              </SelectContent>
            </Select>
          </div>
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
