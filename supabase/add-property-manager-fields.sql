-- Add property_manager and pm_contact fields to residents table
ALTER TABLE residents
ADD COLUMN IF NOT EXISTS property_manager TEXT,
ADD COLUMN IF NOT EXISTS pm_contact TEXT;

-- Add comment to describe the new columns
COMMENT ON COLUMN residents.property_manager IS 'Property manager name for this resident';
COMMENT ON COLUMN residents.pm_contact IS 'Property manager contact number for this resident';
