-- Migration: Add rejection_remarks column to expenses table
-- Purpose: Store AI analysis and manager rejection reasons

ALTER TABLE expenses ADD COLUMN rejection_remarks TEXT NULL DEFAULT NULL AFTER status;

-- Verify the column was added
DESCRIBE expenses;
