-- Create storage bucket for ML models
INSERT INTO storage.buckets (id, name, public)
VALUES ('ml-models', 'ml-models', false);

-- Create policy for uploading models (public access for now, adjust based on your needs)
CREATE POLICY "Allow public upload of ML models"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'ml-models');

-- Create policy for reading models
CREATE POLICY "Allow public read of ML models"
ON storage.objects
FOR SELECT
USING (bucket_id = 'ml-models');

-- Create policy for updating models
CREATE POLICY "Allow public update of ML models"
ON storage.objects
FOR UPDATE
USING (bucket_id = 'ml-models');

-- Create policy for deleting models
CREATE POLICY "Allow public delete of ML models"
ON storage.objects
FOR DELETE
USING (bucket_id = 'ml-models');