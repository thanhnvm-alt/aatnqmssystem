-- ISO-QMS Supabase Seeding Script for IPO Table
-- This script populates the 'ipo' table within the 'appQAQC' schema with 100 sample records.

-- Step 1: Clear any existing data in the table to prevent duplicates.
-- WARNING: This will delete all current IPO records in the appQAQC schema.
DELETE FROM "appQAQC".ipo;

-- Step 2: Insert 100 mock records into the table.
INSERT INTO "appQAQC".ipo (
  "ID_Project", "Project_name", "Material_description", "Base_Unit", "Quantity_IPO", "ID_Factory_Order", "Created_on", "Quantity", "BOQ_type", "IPO_Number", "IPO_Line", "Ma_Tender", "createdBy", "updatedBy", status
)
SELECT
  'PROJ-' || (1000 + s.i),
  (ARRAY['Vinhomes Grand Park', 'Aqua City', 'Ecopark', 'Sun Grand City', 'Metro Line 1 HCMC'])[floor(random() * 5) + 1],
  (ARRAY['Steel Rebar D16', 'Concrete Grade C30', 'Electrical Conduit PVC D20', 'Waterproofing Membrane Sika-1F', 'Gypsum Board 9mm', 'LED Downlight 12W', 'Ceramic Tiles 600x600', 'HVAC Ducting'])[floor(random() * 8) + 1],
  (ARRAY['TON', 'M3', 'M', 'M2', 'EA', 'PC'])[floor(random() * 6) + 1],
  round((random() * 1000 + 50)::numeric, 2),
  'FO-' || (5000 + s.i),
  NOW() - (s.i || ' days')::interval,
  round((random() * 1100 + 60)::numeric, 2),
  (ARRAY['CIVIL', 'MEP', 'FINISHING', 'STRUCTURE'])[floor(random() * 4) + 1],
  'IPO-2024-' || (10000 + s.i),
  (floor(random() * 10) + 1)::text,
  (ARRAY['TDR-2024-CIV-01', 'TDR-2024-MEP-05', 'TDR-2024-FIN-02'])[floor(random() * 3) + 1],
  'seed_script',
  'seed_script',
  (ARRAY['draft', 'submitted', 'approved', 'rejected'])[floor(random() * 4) + 1]
FROM generate_series(1, 100) AS s(i);

-- Instructions:
-- To seed your database, copy and paste the entire content of this file into the
-- SQL Editor in your Supabase project dashboard and click "Run".
-- This will provide a rich dataset for testing the IPO Tracking features.