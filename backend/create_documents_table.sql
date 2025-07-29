-- Create documents table
CREATE TABLE IF NOT EXISTS documents (
  id INT AUTO_INCREMENT PRIMARY KEY,
  document_name VARCHAR(255) NOT NULL,
  file_path VARCHAR(500) NOT NULL,
  file_type VARCHAR(100) NOT NULL,
  file_size INT NOT NULL,
  member_id INT NOT NULL,
  uploaded_by_admin TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (member_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_member_id (member_id),
  INDEX idx_created_at (created_at)
);

-- Add some sample data (optional)
-- INSERT INTO documents (document_name, file_path, file_type, file_size, member_id, uploaded_by_admin) 
-- VALUES 
-- ('Registration Certificate', '/uploads/doc-1234567890.pdf', 'application/pdf', 1024000, 1, 1),
-- ('PAN Card', '/uploads/doc-1234567891.jpg', 'image/jpeg', 512000, 1, 1); 