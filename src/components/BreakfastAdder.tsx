import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, Plus, X } from "lucide-react";
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

interface FoodItem {
  id: string;
  food_name: string;
  food_code: string;
  calories: string;
  carbohydrate: string;
  protein: string;
  fat: string;
  vitamin_a: string;
  thiamine: string;
  riboflavin: string;
  vitamin_c: string;
  calcium: string;
  iron: string;
  serving_size: string;
}

interface BreakfastAdderProps {
  onAddBreakfast: (foodItems: FoodItem[]) => void;
}

const BreakfastAdder = ({ onAddBreakfast }: BreakfastAdderProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [foods, setFoods] = useState<FoodItem[]>([]);
  const [selectedFoods, setSelectedFoods] = useState<FoodItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const searchFoods = async () => {
      if (searchQuery.length < 2) {
        setFoods([]);
        return;
      }

      setIsSearching(true);
      try {
        const { data, error } = await supabase.functions.invoke('search-foods', {
          body: { foodName: searchQuery }
        });

        if (error) throw error;

        setFoods(data.foods || []);
      } catch (error) {
        console.error('Error searching foods:', error);
        toast.error('음식 검색 중 오류가 발생했습니다');
      } finally {
        setIsSearching(false);
      }
    };

    const timeoutId = setTimeout(searchFoods, 300);
    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const handleAddFood = (food: FoodItem) => {
    if (!selectedFoods.find(f => f.id === food.id)) {
      setSelectedFoods([...selectedFoods, food]);
      toast.success(`${food.food_name} 추가됨`);
    }
    setOpen(false);
  };

  const handleRemoveFood = (foodId: string) => {
    setSelectedFoods(selectedFoods.filter(f => f.id !== foodId));
  };

  const handleSubmit = () => {
    if (selectedFoods.length === 0) {
      toast.error("최소 1개의 음식을 선택해주세요");
      return;
    }
    onAddBreakfast(selectedFoods);
    setSelectedFoods([]);
    toast.success("조식이 추가되었습니다");
  };

  return (
    <Card className="w-full shadow-medium border-border/50 bg-gradient-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <Plus className="h-5 w-5 text-primary" />
          조식 추가하기
        </CardTitle>
        <CardDescription>
          조식이 제공되지 않는 학교의 경우, 먹은 음식을 검색하여 추가하세요
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="foodSearch" className="text-sm font-medium flex items-center gap-2">
            <Search className="h-4 w-4" />
            음식 검색
          </Label>
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={open}
                className="w-full justify-between border-input"
              >
                <span className="text-muted-foreground">음식명을 입력하세요</span>
                <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0" align="start">
              <Command>
                <CommandInput
                  placeholder="음식명 검색..."
                  value={searchQuery}
                  onValueChange={setSearchQuery}
                />
                <CommandList>
                  {isSearching ? (
                    <CommandEmpty>검색 중...</CommandEmpty>
                  ) : foods.length === 0 ? (
                    <CommandEmpty>
                      {searchQuery.length < 2
                        ? "2글자 이상 입력해주세요"
                        : "검색 결과가 없습니다"}
                    </CommandEmpty>
                  ) : (
                    <CommandGroup>
                      {foods.map((food) => (
                        <CommandItem
                          key={food.id}
                          value={food.food_name}
                          onSelect={() => handleAddFood(food)}
                        >
                          <div className="flex flex-col">
                            <span className="font-medium">{food.food_name}</span>
                            {food.serving_size && (
                              <span className="text-xs text-muted-foreground">
                                제공량: {food.serving_size}
                              </span>
                            )}
                            {food.calories && (
                              <span className="text-xs text-muted-foreground">
                                {food.calories} kcal
                              </span>
                            )}
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  )}
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>

        {selectedFoods.length > 0 && (
          <div className="space-y-2">
            <Label className="text-sm font-medium">선택된 음식</Label>
            <div className="space-y-2">
              {selectedFoods.map((food) => (
                <div
                  key={food.id}
                  className="flex items-center justify-between p-2 bg-muted rounded-md"
                >
                  <span className="text-sm">{food.food_name}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveFood(food.id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        <Button
          onClick={handleSubmit}
          disabled={selectedFoods.length === 0}
          className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
        >
          <Plus className="mr-2 h-4 w-4" />
          조식 추가
        </Button>
      </CardContent>
    </Card>
  );
};

export default BreakfastAdder;