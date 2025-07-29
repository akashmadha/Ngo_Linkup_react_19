-- Create admin user for testing
-- This user will have admin privileges

INSERT INTO users (
  organization_type,
  organization_name,
  pan_no,
  email,
  mobile_no,
  spoc_name,
  password_hash,
  created_at
) VALUES (
  'Admin',
  'System Administrator',
  'ADMIN1234A',
  'admin@ngolinkup.com',
  '9999999999',
  'System Admin',
  '$2b$10$example_admin_hash', -- In real app, use proper bcrypt hash
  NOW()
);

-- Update existing users to have different organization types for testing
UPDATE users 
SET organization_type = 'NGO' 
WHERE organization_type NOT IN ('Admin', 'Super Admin', 'System Admin') 
AND id > 1;

-- Make one user inactive for testing
UPDATE users 
SET created_at = DATE_SUB(NOW(), INTERVAL 60 DAY) 
WHERE id = 2;

-- Verify the setup
SELECT 
  id,
  organization_type,
  organization_name,
  email,
  CASE 
    WHEN created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY) THEN 'Active'
    ELSE 'Inactive'
  END as status
FROM users 
ORDER BY id; 