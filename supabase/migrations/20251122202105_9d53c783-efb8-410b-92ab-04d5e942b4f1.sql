-- Add cluster_id column to food_items table for K-means clustering
ALTER TABLE public.food_items 
ADD COLUMN cluster_id integer;

-- Add index for faster cluster-based queries
CREATE INDEX idx_food_items_cluster_id ON public.food_items(cluster_id);