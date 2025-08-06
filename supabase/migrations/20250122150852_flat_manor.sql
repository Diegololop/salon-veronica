/*
  # Add unique constraint to RUT field

  1. Changes
    - Add UNIQUE constraint to RUT field in profiles table
    - Add validation trigger to ensure RUT format is correct

  2. Security
    - No changes to RLS policies
*/

-- Add UNIQUE constraint to RUT field
ALTER TABLE profiles
ADD CONSTRAINT unique_rut UNIQUE (rut);

-- Add trigger to validate RUT format before insert or update
CREATE OR REPLACE FUNCTION validate_rut_trigger()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.rut IS NOT NULL AND NOT validate_rut(NEW.rut) THEN
        RAISE EXCEPTION 'Invalid RUT format or verification digit';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER validate_rut_before_save
    BEFORE INSERT OR UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION validate_rut_trigger();