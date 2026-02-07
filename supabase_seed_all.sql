-- =================================================================
-- ISO-QMS Supabase Comprehensive Seeding Script
--
-- WARNING: This script will DELETE ALL existing data in the following tables:
-- users, ipo, inspections, ncr, attachments
-- and replace it with 100+ sample records.
--
-- Use this for development or demonstration purposes only.
-- =================================================================

-- To ensure integrity, we will wrap the entire operation in a transaction.
BEGIN;

-- Step 1: Clear existing data in the correct order to respect foreign keys.
-- Children first, then parents.
TRUNCATE "appQAQC".audit_logs RESTART IDENTITY CASCADE;
TRUNCATE "appQAQC".attachments RESTART IDENTITY CASCADE;
TRUNCATE "appQAQC".ncr RESTART IDENTITY CASCADE;
TRUNCATE "appQAQC".inspections RESTART IDENTITY CASCADE;
TRUNCATE "appQAQC".ipo RESTART IDENTITY CASCADE;
TRUNCATE "appQAQC".users RESTART IDENTITY CASCADE;

-- Step 2: Seed the 'users' table with a variety of roles.
-- Passwords for all users are 'password123'.
INSERT INTO "appQAQC".users (full_name, email, role, password_hash, avatar_url) VALUES
('John Doe', 'qc1@example.com', 'QC', crypt('password123', gen_salt('bf')), 'https://api.dicebear.com/8.x/initials/svg?seed=JohnDoe'),
('Jane Smith', 'qc2@example.com', 'QC', crypt('password123', gen_salt('bf')), 'https://api.dicebear.com/8.x/initials/svg?seed=JaneSmith'),
('Peter Jones', 'qc3@example.com', 'QC', crypt('password123', gen_salt('bf')), 'https://api.dicebear.com/8.x/initials/svg?seed=PeterJones'),
('Mary Williams', 'qa1@example.com', 'QA', crypt('password123', gen_salt('bf')), 'https://api.dicebear.com/8.x/initials/svg?seed=MaryWilliams'),
('David Brown', 'qa2@example.com', 'QA', crypt('password123', gen_salt('bf')), 'https://api.dicebear.com/8.x/initials/svg?seed=DavidBrown'),
('Susan Taylor', 'manager1@example.com', 'MANAGER', crypt('password123', gen_salt('bf')), 'https://api.dicebear.com/8.x/initials/svg?seed=SusanTaylor');

-- Step 3: Seed the 'ipo' table with 100 sample records.
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
  (ARRAY['draft', 'submitted', 'approved', 'rejected'])[floor(random() * 4) + 1]::text
FROM generate_series(1, 100) AS s(i);

-- Step 4: Seed the 'inspections' table with 100 sample records.
WITH user_ids AS (
  SELECT array_agg(id) as ids FROM "appQAQC".users
)
INSERT INTO "appQAQC".inspections (
  code, project_reference, status, owner_id, checklist_json, results_json, audit_trail
)
SELECT
  'INSP-2024-' || (1000 + s.i),
  (ARRAY['Vinhomes Grand Park', 'Aqua City', 'Ecopark', 'Sun Grand City', 'Metro Line 1 HCMC'])[floor(random() * 5) + 1],
  (ARRAY['draft', 'submitted', 'approved', 'rejected', 'verified'])[floor(random() * 5) + 1]::text,
  (SELECT ids[floor(random() * array_length(ids, 1)) + 1] FROM user_ids),
  '{ "sections": [{ "title": "Structural Integrity", "items": ["Check rebar spacing", "Verify concrete mix ratio"] }, { "title": "Safety Compliance", "items": ["Ensure safety harnesses are used", "Check for proper scaffolding"] }] }'::jsonb,
  '{ "answers": [{ "item": "Check rebar spacing", "value": "Pass", "comment": "Spacing confirmed at 150mm" }, { "item": "Verify concrete mix ratio", "value": "Fail", "comment": "Slump test failed" }] }'::jsonb,
  '[
    { "id": 1, "who": "John Doe", "what": "Created the initial draft.", "when": 1672531200, "before_state": "NULL", "after_state": "DRAFT" },
    { "id": 2, "who": "John Doe", "what": "Submitted for QA review.", "when": 1672617600, "before_state": "DRAFT", "after_state": "SUBMITTED" }
  ]'::jsonb
FROM generate_series(1, 100) AS s(i);

-- Step 5: Seed the 'ncr' (Non-Conformance Reports) table with 100 records.
WITH inspection_ids AS (
  SELECT array_agg(id) as ids FROM "appQAQC".inspections
)
INSERT INTO "appQAQC".ncr (
  code, project_reference, status, severity, inspection_id, description, root_cause, corrective_action
)
SELECT
  'NCR-2024-' || (100 + s.i),
  (ARRAY['Vinhomes Grand Park', 'Aqua City', 'Ecopark'])[floor(random() * 3) + 1],
  (ARRAY['draft', 'submitted', 'approved'])[floor(random() * 3) + 1]::text,
  (ARRAY['low', 'medium', 'high', 'critical'])[floor(random() * 4) + 1]::text,
  CASE WHEN random() > 0.3 THEN (SELECT ids[floor(random() * array_length(ids, 1)) + 1] FROM inspection_ids) ELSE NULL END,
  '### Description of Non-Conformance
  - **Observed Defect:** Concrete slump test for batch #C-145 failed with a reading of 45mm.
  - **Requirement:** Project specification requires a slump of 75mm ±15mm.
  - **Impact:** Potential compromise of concrete workability and final compressive strength.',
  '### Root Cause Analysis
  1. **Equipment Malfunction:** The water dispenser on the batching plant was found to be improperly calibrated, leading to insufficient water in the mix.
  2. **Human Error:** Pre-batch calibration checks were not performed according to procedure checklist CL-BATCH-002.',
  '### Corrective Action Plan
  - **Immediate Action:** Quarantine batch #C-145. Do not use for any structural pouring.
  - **Long-term Action:** Recalibrate all water dispensers. Mandate a daily pre-start calibration check to be signed off by the plant supervisor.'
FROM generate_series(1, 100) AS s(i);


-- Step 6: Seed the 'attachments' table with 100 records, linked to inspections and ncr.
WITH user_ids AS (
  SELECT array_agg(id) as ids FROM "appQAQC".users
),
inspection_ids AS (
  SELECT array_agg(id) as ids FROM "appQAQC".inspections
),
ncr_ids AS (
  SELECT array_agg(id) as ids FROM "appQAQC".ncr
)
INSERT INTO "appQAQC".attachments (
  entity_type, entity_id, file_url, file_name, mime_type, file_size, uploaded_by_id
)
SELECT
  CASE WHEN s.i <= 70 THEN 'inspection' ELSE 'ncr' END,
  CASE 
    WHEN s.i <= 70 THEN (SELECT ids[floor(random() * array_length(ids, 1)) + 1] FROM inspection_ids)
    ELSE (SELECT ids[floor(random() * array_length(ids, 1)) + 1] FROM ncr_ids)
  END,
  'https://placehold.co/600x400.png',
  CASE WHEN s.i <= 70 THEN 'inspection-evidence-' || s.i || '.png' ELSE 'ncr-report-' || s.i || '.pdf' END,
  CASE WHEN s.i <= 70 THEN 'image/png' ELSE 'application/pdf' END,
  floor(random() * 5000000 + 100000)::bigint,
  (SELECT ids[floor(random() * array_length(ids, 1)) + 1] FROM user_ids)
FROM generate_series(1, 100) AS s(i);


COMMIT;
-- =================================================================
-- END OF SCRIPT
-- =================================================================