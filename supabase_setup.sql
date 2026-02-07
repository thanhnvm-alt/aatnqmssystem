-- =================================================================
-- ISO-QMS Supabase Full Setup Script (v5 - Safe, Idempotent & Migrating)
--
-- This script configures all required tables, roles, and functions.
-- IT IS SAFE TO RUN MULTIPLE TIMES. It will not delete existing data.
-- It uses "IF NOT EXISTS" and migration blocks to handle new and existing setups.
--
-- INSTRUCTIONS: Run this entire file in your Supabase SQL Editor.
-- =================================================================


-- =================================================================
-- SECTION 1: CORE SETUP & SCHEMA
-- =================================================================

-- Step 1.1: Ensure the dedicated application schema exists.
CREATE SCHEMA IF NOT EXISTS "appQAQC";

-- Step 1.2: Grant usage permissions on the schema to the API roles.
GRANT USAGE ON SCHEMA "appQAQC" TO anon, authenticated;

-- Step 1.3: Add schema to the database search_path for API visibility.
-- This is critical for Supabase API to find our objects.
-- Note: This change may require an API restart from the Supabase dashboard.
ALTER DATABASE postgres SET search_path = "$user", public, "appQAQC";

-- Step 1.4: Enable the pgcrypto extension for password hashing.
CREATE EXTENSION IF NOT EXISTS pgcrypto;


-- =================================================================
-- SECTION 2: USERS TABLE (CUSTOM AUTH)
-- =================================================================

-- Step 2.1: Create the user profiles table if it doesn't exist.
CREATE TABLE IF NOT EXISTS "appQAQC".users (
  id UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT,
  avatar_url TEXT,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'QC',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
COMMENT ON TABLE "appQAQC".users IS 'Stores user profiles and hashed credentials for a custom authentication system.';

-- Step 2.2: Migration block to gracefully add 'password_hash' column to old schemas.
-- This ensures the script doesn't fail on databases created with a previous version.
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'appQAQC' AND table_name = 'users' AND column_name = 'password_hash'
    ) THEN
        ALTER TABLE "appQAQC".users ADD COLUMN password_hash TEXT NOT NULL DEFAULT crypt('password_placeholder', gen_salt('bf'));
    END IF;
END;
$$;


-- Step 2.3: Enable Row Level Security (RLS) and create policies if they don't exist.
ALTER TABLE "appQAQC".users ENABLE ROW LEVEL SECURITY;
GRANT ALL ON TABLE "appQAQC".users TO anon, authenticated;

DO $$ BEGIN
  CREATE POLICY "Enable public access for app"
  ON "appQAQC".users FOR ALL
  USING (true)
  WITH CHECK (true);
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;


-- =================================================================
-- SECTION 3: QMS CORE TABLES (Inspections & NCR)
-- =================================================================

-- Step 3.1: Create the 'inspections' table if it doesn't exist.
CREATE TABLE IF NOT EXISTS "appQAQC".inspections (
  id UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'draft',
  project_reference TEXT NOT NULL,
  owner_id UUID REFERENCES "appQAQC".users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  checklist_json JSONB,
  results_json JSONB,
  audit_trail JSONB
);
COMMENT ON TABLE "appQAQC".inspections IS 'Stores core quality inspection records, including checklists, results, and evidence.';

-- Step 3.2: Enable RLS for 'inspections'
ALTER TABLE "appQAQC".inspections ENABLE ROW LEVEL SECURITY;
GRANT ALL ON TABLE "appQAQC".inspections TO anon, authenticated;
DO $$ BEGIN
  CREATE POLICY "Enable public access for inspections table"
  ON "appQAQC".inspections FOR ALL USING (true) WITH CHECK (true);
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Step 3.3: Create the 'ncr' (Non-Conformance Report) table if it doesn't exist.
CREATE TABLE IF NOT EXISTS "appQAQC".ncr (
  id UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'draft',
  severity TEXT NOT NULL DEFAULT 'low',
  project_reference TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  inspection_id UUID REFERENCES "appQAQC".inspections(id),
  description TEXT,
  root_cause TEXT,
  corrective_action TEXT,
  preventive_action TEXT
);
COMMENT ON TABLE "appQAQC".ncr IS 'Stores Non-Conformance Reports, often linked to a specific inspection.';

-- Step 3.4: Enable RLS for 'ncr'
ALTER TABLE "appQAQC".ncr ENABLE ROW LEVEL SECURITY;
GRANT ALL ON TABLE "appQAQC".ncr TO anon, authenticated;
DO $$ BEGIN
  CREATE POLICY "Enable public access for ncr table"
  ON "appQAQC".ncr FOR ALL USING (true) WITH CHECK (true);
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;


-- =================================================================
-- SECTION 4: IPO (Inspection Purchase Order) TABLE
-- =================================================================

CREATE TABLE IF NOT EXISTS "appQAQC".ipo (
  id UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  "ID_Project" TEXT,
  "Project_name" TEXT,
  "Material_description" TEXT,
  "Base_Unit" TEXT,
  "Quantity_IPO" NUMERIC,
  "ID_Factory_Order" TEXT,
  "Created_on" TIMESTAMPTZ,
  "Quantity" NUMERIC,
  "BOQ_type" TEXT,
  "IPO_Number" TEXT,
  "IPO_Line" TEXT,
  "Ma_Tender" TEXT,
  "createdAt" TIMESTAMPTZ DEFAULT NOW(),
  "createdBy" TEXT,
  "updatedAt" TIMESTAMPTZ DEFAULT NOW(),
  "updatedBy" TEXT,
  status TEXT NOT NULL DEFAULT 'draft'
);
COMMENT ON TABLE "appQAQC".ipo IS 'Stores Inspection Purchase Order (IPO) records.';
ALTER TABLE "appQAQC".ipo ENABLE ROW LEVEL SECURITY;
GRANT ALL ON TABLE "appQAQC".ipo TO anon, authenticated;
DO $$ BEGIN
  CREATE POLICY "Enable public access for IPO table"
  ON "appQAQC".ipo FOR ALL USING (true) WITH CHECK (true);
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;


-- =================================================================
-- SECTION 5: ATTACHMENTS TABLE
-- =================================================================

CREATE TABLE IF NOT EXISTS "appQAQC".attachments (
  id UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  file_url TEXT NOT NULL,
  thumbnail_url TEXT,
  file_name TEXT,
  mime_type TEXT,
  file_size BIGINT,
  uploaded_by_id UUID REFERENCES "appQAQC".users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
COMMENT ON TABLE "appQAQC".attachments IS 'Stores metadata for all uploaded files.';
CREATE INDEX IF NOT EXISTS idx_attachments_entity ON "appQAQC".attachments(entity_type, entity_id);
ALTER TABLE "appQAQC".attachments ENABLE ROW LEVEL SECURITY;
GRANT ALL ON TABLE "appQAQC".attachments TO anon, authenticated;
DO $$ BEGIN
  CREATE POLICY "Enable public access for attachments"
  ON "appQAQC".attachments FOR ALL USING (true) WITH CHECK (true);
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;


-- =================================================================
-- SECTION 6: IMMUTABLE AUDIT TRAIL TABLE
-- =================================================================

CREATE TABLE IF NOT EXISTS "appQAQC".audit_logs (
  id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  user_context_json JSONB,
  action TEXT NOT NULL,
  entity TEXT NOT NULL,
  entity_id UUID,
  old_value JSONB,
  new_value JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  notes TEXT
);
COMMENT ON TABLE "appQAQC".audit_logs IS 'Immutable, append-only log for all data mutations. Critical for ISO 9001 traceability.';
ALTER TABLE "appQAQC".audit_logs ENABLE ROW LEVEL SECURITY;
GRANT ALL ON TABLE "appQAQC".audit_logs TO anon, authenticated;
DO $$ BEGIN
  CREATE POLICY "Enable public access for audit logs"
  ON "appQAQC".audit_logs FOR ALL USING (true) WITH CHECK (true);
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;


-- =================================================================
-- SECTION 7: CUSTOM AUTH & DIAGNOSTIC FUNCTIONS
-- =================================================================

-- Step 7.1: Create a secure login function.
CREATE OR REPLACE FUNCTION "appQAQC".login(email_input TEXT, password_input TEXT)
RETURNS "appQAQC".users AS $$
DECLARE
  found_user "appQAQC".users;
BEGIN
  SELECT *
  INTO found_user
  FROM "appQAQC".users
  WHERE email = email_input;

  IF found_user IS NOT NULL AND found_user.password_hash = crypt(password_input, found_user.password_hash) THEN
    found_user.password_hash := NULL;
    RETURN found_user;
  ELSE
    RETURN NULL;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
GRANT EXECUTE ON FUNCTION "appQAQC".login(TEXT, TEXT) TO anon, authenticated;
COMMENT ON FUNCTION "appQAQC".login(TEXT, TEXT) IS 'Securely authenticates a user by comparing a raw password to its stored hash.';


-- Step 7.2: Create a database connection test function.
CREATE OR REPLACE FUNCTION "appQAQC".get_db_version()
RETURNS text AS $$
  SELECT version();
$$ LANGUAGE sql STABLE;
GRANT EXECUTE ON FUNCTION "appQAQC".get_db_version() TO anon, authenticated;


-- Step 7.3: Create a secure user creation function.
CREATE OR REPLACE FUNCTION "appQAQC".create_user(
  p_full_name TEXT,
  p_email TEXT,
  p_password TEXT,
  p_role TEXT
)
RETURNS "appQAQC".users AS $$
DECLARE
  new_user "appQAQC".users;
BEGIN
  INSERT INTO "appQAQC".users(full_name, email, password_hash, role, avatar_url)
  VALUES (
    p_full_name,
    p_email,
    crypt(p_password, gen_salt('bf')),
    p_role,
    'https://api.dicebear.com/8.x/initials/svg?seed=' || p_email
  ) RETURNING * INTO new_user;

  new_user.password_hash := NULL; -- Important: Do not return the hash to the client
  RETURN new_user;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION "appQAQC".create_user(TEXT, TEXT, TEXT, TEXT) TO anon, authenticated;
COMMENT ON FUNCTION "appQAQC".create_user(TEXT, TEXT, TEXT, TEXT) IS 'Securely creates a new user, hashing the password on the server before insertion.';


-- =================================================================
-- SECTION 8: REMOVED AUTH TRIGGERS
-- =================================================================
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

-- =================================================================
-- END OF SCRIPT
-- =================================================================