-- Truncate all expenses and related data to start fresh for testing
-- Run this script to remove all submitted, approved, and rejected expenses

-- Disable foreign key checks to allow truncation
SET FOREIGN_KEY_CHECKS = 0;

-- Delete from approval history
DELETE FROM expense_approvals;

-- Delete from attachments
DELETE FROM expense_attachments;

-- Delete all expenses
DELETE FROM expenses;

-- Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- Reset auto-increment counters
ALTER TABLE expenses AUTO_INCREMENT = 1;
ALTER TABLE expense_attachments AUTO_INCREMENT = 1;
ALTER TABLE expense_approvals AUTO_INCREMENT = 1;

-- Verify data is cleared
SELECT COUNT(*) as total_expenses FROM expenses;
SELECT COUNT(*) as total_attachments FROM expense_attachments;
SELECT COUNT(*) as total_approvals FROM expense_approvals;

-- All expenses have been removed. You can now test the system with fresh data.
