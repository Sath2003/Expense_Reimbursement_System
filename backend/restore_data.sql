-- Insert roles
INSERT INTO roles (id, role_name) VALUES 
(1, 'EMPLOYEE'),
(2, 'MANAGER'),
(3, 'FINANCE');

-- Insert users
INSERT INTO users (email, password, first_name, last_name, employee_id, role_id, is_active, is_verified, created_at) VALUES 
('sarah.johnson@expensehub.com', '$2b$12$ox9dY/hwu7CRECYFNlgY3uDwIfpNJLlDSbmMvnIVwQBqYeQcWwLYu', 'Sarah', 'Johnson', 'FIN-001', 3, 1, 1, NOW()),
('manager@expensehub.com', '$2b$12$ox9dY/hwu7CRECYFNlgY3uDwIfpNJLlDSbmMvnIVwQBqYeQcWwLYu', 'Michael', 'Kumar', 'MGR-001', 2, 1, 1, NOW()),
('sathviknbmath@gmail.com', '$2b$12$ox9dY/hwu7CRECYFNlgY3uDwIfpNJLlDSbmMvnIVwQBqYeQcWwLYu', 'Sathvik NB', 'Math', 'EMP-001', 1, 1, 1, NOW());

-- Insert expense categories
INSERT INTO expense_categories (name, description) VALUES 
('Fuel', 'Fuel and transportation expenses'),
('Accommodation', 'Hotel and accommodation'),
('Meals', 'Food and meal expenses'),
('Travel', 'Travel related expenses'),
('Office Supplies', 'Office supplies and stationery'),
('Equipment', 'Equipment and hardware'),
('Software', 'Software licenses and tools'),
('Training', 'Training and development'),
('Marketing', 'Marketing and promotional'),
('Other', 'Other miscellaneous expenses');

-- Insert transportation types
INSERT INTO transportation_types (type_name) VALUES 
('Car'),
('Taxi'),
('Flight'),
('Train'),
('Bus'),
('Bike');

-- Insert an expense for testing
INSERT INTO expenses (user_id, category_id, amount, expense_date, description, status, created_at, updated_at) VALUES 
(3, 1, 2712.73, '2026-01-10', 'Site Visit', 'SUBMITTED', NOW(), NOW());

-- Insert an attachment for the expense
INSERT INTO expense_attachments (expense_id, file_name, file_path, file_type, file_size, uploaded_at) VALUES 
(1, 'Fuel.jpeg', '2026-01/expense_1_receipt_20260112_031929.jpeg', 'jpeg', 98891, NOW());

-- Update enum definition
ALTER TABLE expenses MODIFY COLUMN status ENUM('SUBMITTED','HR_APPROVED','POLICY_EXCEPTION','MANAGER_APPROVED','MANAGER_APPROVED_FOR_VERIFICATION','MANAGER_REJECTED','PENDING_FINANCE_REVIEW','FINANCE_APPROVED','FINANCE_REJECTED','PAID') DEFAULT 'SUBMITTED';

SELECT 'Data inserted successfully' AS status;
