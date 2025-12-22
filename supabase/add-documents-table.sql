-- Create document_type enum
CREATE TYPE document_type AS ENUM ('rent_agreement', 'id_proof', 'other');

-- Create documents table
CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resident_id UUID REFERENCES residents(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  document_type document_type DEFAULT 'other',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on resident_id for faster queries
CREATE INDEX IF NOT EXISTS idx_documents_resident_id ON documents(resident_id);

-- Add RLS (Row Level Security) policies
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- Policy: Allow authenticated users to read all documents
CREATE POLICY "Allow authenticated users to read documents"
  ON documents FOR SELECT
  TO authenticated
  USING (true);

-- Policy: Allow authenticated users to insert documents
CREATE POLICY "Allow authenticated users to insert documents"
  ON documents FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Policy: Allow authenticated users to delete their own documents
CREATE POLICY "Allow authenticated users to delete documents"
  ON documents FOR DELETE
  TO authenticated
  USING (true);

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_documents_updated_at
  BEFORE UPDATE ON documents
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
