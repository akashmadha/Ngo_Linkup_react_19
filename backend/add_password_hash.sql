-- Add password_hash column to trust_members table
-- This script fixes the missing password_hash column that's needed for login

-- Check if password_hash column exists
SELECT COUNT(*) as column_exists 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 'ngo_linkup' 
AND TABLE_NAME = 'trust_members' 
AND COLUMN_NAME = 'password_hash';

-- Add password_hash column if it doesn't exist
ALTER TABLE trust_members 
ADD COLUMN password_hash VARCHAR(255) AFTER registration_date;

-- Verify the column was added
DESCRIBE trust_members;

-- Show the updated table structure
SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_DEFAULT
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 'ngo_linkup' 
AND TABLE_NAME = 'trust_members'
ORDER BY ORDINAL_POSITION; 