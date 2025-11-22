-- Add INSERT policy for food_items to allow anyone to insert
CREATE POLICY "Anyone can insert food items" 
ON public.food_items 
FOR INSERT 
WITH CHECK (true);

-- Add UPDATE policy for food_items to allow anyone to update
CREATE POLICY "Anyone can update food items" 
ON public.food_items 
FOR UPDATE 
USING (true);

-- Add DELETE policy for food_items to allow anyone to delete
CREATE POLICY "Anyone can delete food items" 
ON public.food_items 
FOR DELETE 
USING (true);