-- Truncate users table
TRUNCATE TABLE users;

-- Insert Finance user - Sarah Johnson
INSERT INTO users (first_name, last_name, email, phone_number, password, designation, department, employee_id, role_id, is_active, is_verified) 
VALUES ('Sarah', 'Johnson', 'sarah.johnson@expensehub.com', '+91-9876543210', '$2b$12$XtZDL3ezQY85ajBA/c6xyu7G4c0N8B.NebAQiBqe3HfTK1/HzYiTq', 'Finance Manager', 'Finance', 'FIN-001', 3, 1, 1);

-- Insert Manager user - Michael Kumar
INSERT INTO users (first_name, last_name, email, phone_number, password, designation, department, employee_id, role_id, is_active, is_verified) 
VALUES ('Michael', 'Kumar', 'manager@expensehub.com', '+91-9876543211', '$2b$12$sj5Q/4YXsOMWtXemEOJ1vup6wnfqz0f6JvgPEx/5SABqBYawiCJ4O', 'Operations Manager', 'Operations', 'MGR-001', 2, 1, 1);
