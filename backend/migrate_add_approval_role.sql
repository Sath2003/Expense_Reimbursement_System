-- Add approval_role column to expense_approvals table if it doesn't exist
ALTER TABLE expense_approvals 
ADD COLUMN approval_role VARCHAR(50) DEFAULT 'MANAGER' AFTER approved_by;

-- Update any existing rows to have MANAGER as default
UPDATE expense_approvals SET approval_role = 'MANAGER' WHERE approval_role IS NULL;

-- Make the column NOT NULL
ALTER TABLE expense_approvals 
MODIFY COLUMN approval_role VARCHAR(50) NOT NULL;
