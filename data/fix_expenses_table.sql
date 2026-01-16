-- Fix expenses table schema
ALTER TABLE expenses 
DROP COLUMN IF EXISTS employee_id;

ALTER TABLE expenses 
DROP FOREIGN KEY IF EXISTS expenses_ibfk_2;

-- Ensure columns exist
ALTER TABLE expenses 
ADD COLUMN IF NOT EXISTS user_id INT NOT NULL DEFAULT 8 AFTER id;

ALTER TABLE expenses 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

-- Add foreign key if not exists
ALTER TABLE expenses 
ADD CONSTRAINT expenses_user_fk FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- Verify
DESCRIBE expenses;
