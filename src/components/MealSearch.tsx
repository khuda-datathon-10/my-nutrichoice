import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, Calendar, MapPin, User, Ruler, Weight, Cake } from "lucide-react";
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
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

interface School {
  schoolName: string;
  schoolCode: string;
  officeCode: string;
  address: string;
  schoolType: string;
}

interface MealSearchProps {
  onSearch: (schoolCode: string, date: string, height: string, weight: string, gender: string, age: string) => void;
}

const formSchema = z.object({
  age: z.string().min(1, "나이를 입력해주세요")
    .refine((val) => {
      const num = parseInt(val);
      return !isNaN(num) && num >= 8 && num <= 19;
    }, "나이는 8~19 사이여야 합니다"),
  height: z.string().min(1, "키를 입력해주세요")
    .refine((val) => {
      const num = parseFloat(val);
      return !isNaN(num) && num >= 100 && num <= 300;
    }, "키는 100~300cm 사이여야 합니다"),
  weight: z.string().min(1, "몸무게를 입력해주세요")
    .refine((val) => {
      const num = parseFloat(val);
      return !isNaN(num) && num >= 10 && num <= 300;
    }, "몸무게는 10~300kg 사이여야 합니다"),
  gender: z.string().min(1, "성별을 선택해주세요"),
  date: z.string().min(1, "날짜를 선택해주세요"),
});

const MealSearch = ({ onSearch }: MealSearchProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [schools, setSchools] = useState<School[]>([]);
  const [selectedSchool, setSelectedSchool] = useState<School | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [open, setOpen] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      age: "",
      height: "",
      weight: "",
      gender: "",
      date: new Date().toISOString().split('T')[0],
    },
  });

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

  const handleSearch = (values: z.infer<typeof formSchema>) => {
    if (!selectedSchool) {
      toast.error("학교를 선택해주세요");
      return;
    }
    onSearch(selectedSchool.schoolCode, values.date, values.height, values.weight, values.gender, values.age);
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

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSearch)} className="space-y-4">
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    날짜
                  </FormLabel>
                  <FormControl>
                    <Input type="date" {...field} className="border-input" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <FormField
                control={form.control}
                name="age"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Cake className="h-4 w-4" />
                      나이
                    </FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="예: 15" {...field} className="border-input" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="height"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Ruler className="h-4 w-4" />
                      키 (cm)
                    </FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="예: 170" {...field} className="border-input" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="weight"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Weight className="h-4 w-4" />
                      몸무게 (kg)
                    </FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="예: 65" {...field} className="border-input" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="gender"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      성별
                    </FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="border-input">
                          <SelectValue placeholder="성별 선택" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="male">남성</SelectItem>
                        <SelectItem value="female">여성</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Button 
              type="submit"
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 shadow-soft transition-all hover:shadow-medium"
              size="lg"
            >
              <Search className="mr-2 h-5 w-5" />
              조회하기
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default MealSearch;
