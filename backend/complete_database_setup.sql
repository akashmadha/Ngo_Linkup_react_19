-- Complete Database Setup for NGO Management Platform
-- This script creates separate tables for admins and organization members

-- Drop existing tables if they exist (for fresh start)
DROP TABLE IF EXISTS documents;
DROP TABLE IF EXISTS organization_members;
DROP TABLE IF EXISTS admins;

-- Create admins table
CREATE TABLE admins (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role ENUM('super_admin', 'admin', 'moderator') DEFAULT 'admin',
    is_active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_username (username),
    INDEX idx_role (role),
    INDEX idx_is_active (is_active)
);

-- Create organization_members table (matching frontend fields)
CREATE TABLE organization_members (
    id INT AUTO_INCREMENT PRIMARY KEY,
    organization_type ENUM('NGO', 'Trust', 'Society', 'Foundation', 'Association') NOT NULL,
    organization_name VARCHAR(255) NOT NULL,
    pan_no VARCHAR(20) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    mobile_no VARCHAR(15) NOT NULL,
    spoc_name VARCHAR(255) NOT NULL,
    spoc_designation VARCHAR(100),
    reg_address TEXT,
    reg_city VARCHAR(100),
    reg_state VARCHAR(100),
    reg_pincode VARCHAR(10),
    reg_website VARCHAR(255),
    reg_date DATE,
    password_hash VARCHAR(255),
    is_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    status ENUM('pending', 'active', 'suspended', 'inactive') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_mobile (mobile_no),
    INDEX idx_organization_type (organization_type),
    INDEX idx_status (status),
    INDEX idx_is_active (is_active),
    INDEX idx_created_at (created_at)
);

-- Create documents table
CREATE TABLE documents (
    id INT AUTO_INCREMENT PRIMARY KEY,
    document_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_type VARCHAR(100) NOT NULL,
    file_size BIGINT NOT NULL,
    member_id INT NOT NULL,
    uploaded_by_admin BOOLEAN DEFAULT FALSE,
    admin_id INT NULL,
    document_category ENUM('registration', 'financial', 'project', 'compliance', 'other') DEFAULT 'other',
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (member_id) REFERENCES organization_members(id) ON DELETE CASCADE,
    FOREIGN KEY (admin_id) REFERENCES admins(id) ON DELETE SET NULL,
    INDEX idx_member_id (member_id),
    INDEX idx_admin_id (admin_id),
    INDEX idx_document_category (document_category),
    INDEX idx_uploaded_by_admin (uploaded_by_admin),
    INDEX idx_created_at (created_at)
);

-- Insert admin users
-- Password: admin123 (hashed with bcrypt)
INSERT INTO admins (
    username,
    email,
    password_hash,
    full_name,
    role
) VALUES 
(
    'superadmin',
    'superadmin@ngolinkup.com',
    '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    'Super Administrator',
    'super_admin'
),
(
    'admin',
    'admin@ngolinkup.com',
    '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    'System Administrator',
    'admin'
),
(
    'moderator',
    'moderator@ngolinkup.com',
    '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    'Content Moderator',
    'moderator'
);

-- Insert sample organization members for testing
INSERT INTO organization_members (
    organization_type,
    organization_name,
    pan_no,
    email,
    mobile_no,
    spoc_name,
    spoc_designation,
    reg_address,
    reg_city,
    reg_state,
    reg_pincode,
    reg_website,
    reg_date,
    password_hash,
    is_verified,
    status,
    created_at
) VALUES 
-- Active verified members
(
    'NGO',
    'Green Earth Foundation',
    'GEF123456',
    'contact@greenearth.org',
    '9876543211',
    'John Doe',
    'Director',
    '123 Green Street, Eco City',
    'Mumbai',
    'Maharashtra',
    '400001',
    'https://greenearth.org',
    '2020-01-15',
    '',
    TRUE,
    'active',
    NOW()
),
(
    'Trust',
    'Education for All Trust',
    'EAT123456',
    'info@educationforall.org',
    '9876543212',
    'Jane Smith',
    'Trustee',
    '456 Education Avenue, Learning Town',
    'Delhi',
    'Delhi',
    '110001',
    'https://educationforall.org',
    '2019-03-20',
    '',
    TRUE,
    'active',
    NOW()
),
(
    'Society',
    'Women Empowerment Society',
    'WES123456',
    'hello@womenempower.org',
    '9876543213',
    'Sarah Johnson',
    'President',
    '789 Women Street, Empowerment City',
    'Bangalore',
    'Karnataka',
    '560001',
    'https://womenempower.org',
    '2021-06-10',
    '',
    TRUE,
    'active',
    NOW()
),
-- Pending verification
(
    'Foundation',
    'Health Care Foundation',
    'HCF123456',
    'health@carefoundation.org',
    '9876543214',
    'Dr. Michael Brown',
    'Medical Director',
    '321 Health Street, Medical City',
    'Chennai',
    'Tamil Nadu',
    '600001',
    'https://carefoundation.org',
    '2023-09-05',
    '',
    FALSE,
    'pending',
    NOW()
),
-- Suspended member
(
    'NGO',
    'Suspended Organization',
    'SO123456',
    'suspended@org.org',
    '9876543215',
    'Suspended User',
    'Director',
    '999 Suspended Street, Problem City',
    'Kolkata',
    'West Bengal',
    '700001',
    'https://suspended.org',
    '2022-04-12',
    '',
    TRUE,
    'suspended',
    DATE_SUB(NOW(), INTERVAL 30 DAY)
),
-- Inactive member
(
    'Trust',
    'Inactive Trust',
    'IT123456',
    'inactive@trust.org',
    '9876543216',
    'Inactive User',
    'Trustee',
    '888 Inactive Street, Old City',
    'Hyderabad',
    'Telangana',
    '500001',
    'https://inactive.org',
    '2021-12-01',
    '',
    TRUE,
    'inactive',
    DATE_SUB(NOW(), INTERVAL 60 DAY)
);

-- Insert sample documents for testing
INSERT INTO documents (
    document_name,
    file_path,
    file_type,
    file_size,
    member_id,
    uploaded_by_admin,
    admin_id,
    document_category,
    is_verified,
    created_at
) VALUES 
(
    'Registration Certificate',
    '/uploads/reg-cert-001.pdf',
    'application/pdf',
    1024000,
    1, -- Green Earth Foundation
    1,
    1,
    'registration',
    TRUE,
    NOW()
),
(
    'Annual Report 2023',
    '/uploads/annual-report-001.pdf',
    'application/pdf',
    2048000,
    1, -- Green Earth Foundation
    1,
    1,
    'financial',
    TRUE,
    NOW()
),
(
    'Project Proposal - Education Initiative',
    '/uploads/project-proposal-001.pdf',
    'application/pdf',
    1536000,
    2, -- Education for All Trust
    1,
    1,
    'project',
    TRUE,
    NOW()
),
(
    'Financial Statement 2023',
    '/uploads/financial-statement-001.pdf',
    'application/pdf',
    1792000,
    3, -- Women Empowerment Society
    1,
    1,
    'financial',
    FALSE,
    NOW()
),
(
    'Compliance Certificate',
    '/uploads/compliance-cert-001.pdf',
    'application/pdf',
    896000,
    2, -- Education for All Trust
    1,
    2,
    'compliance',
    TRUE,
    NOW()
);

-- Show table structure
DESCRIBE admins;
DESCRIBE organization_members;
DESCRIBE documents;

-- Show sample data
SELECT 'Admins Table:' as table_name;
SELECT id, username, email, full_name, role, is_active, created_at
FROM admins
ORDER BY id;

SELECT 'Organization Members Table:' as table_name;
SELECT id, organization_type, organization_name, email, spoc_name, 
       status, is_verified, is_active, created_at
FROM organization_members
ORDER BY id;

SELECT 'Documents Table:' as table_name;
SELECT id, document_name, document_category, file_type, file_size, 
       member_id, uploaded_by_admin, admin_id, is_verified, created_at
FROM documents
ORDER BY id;

-- Show member status summary
SELECT 
    'Organization Member Status Summary:' as summary,
    COUNT(*) as total_members,
    SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active_members,
    SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_members,
    SUM(CASE WHEN status = 'suspended' THEN 1 ELSE 0 END) as suspended_members,
    SUM(CASE WHEN status = 'inactive' THEN 1 ELSE 0 END) as inactive_members,
    SUM(CASE WHEN is_verified = TRUE THEN 1 ELSE 0 END) as verified_members
FROM organization_members;

-- Show document summary
SELECT 
    'Document Summary:' as summary,
    COUNT(*) as total_documents,
    SUM(CASE WHEN uploaded_by_admin = TRUE THEN 1 ELSE 0 END) as admin_uploaded,
    SUM(CASE WHEN is_verified = TRUE THEN 1 ELSE 0 END) as verified_documents,
    COUNT(DISTINCT member_id) as members_with_documents
FROM documents; 