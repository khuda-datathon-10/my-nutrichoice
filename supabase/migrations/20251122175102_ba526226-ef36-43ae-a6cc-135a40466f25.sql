-- Add unique constraint to food_code column
ALTER TABLE public.food_items 
ADD CONSTRAINT food_items_food_code_unique UNIQUE (food_code);

-- Create index for faster food name searches
CREATE INDEX IF NOT EXISTS idx_food_items_food_name_trgm ON public.food_items USING gin (food_name gin_trgm_ops);