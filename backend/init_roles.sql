-- Insert default roles
INSERT IGNORE INTO roles (id, role_name, description) VALUES
(1, 'EMPLOYEE', 'Regular employee who can submit expenses'),
(2, 'MANAGER', 'Manager who can approve expenses'),
(3, 'FINANCE', 'Finance team member with full access'),
(4, 'ADMIN', 'Administrator with full system access');

-- Insert default employee grades
INSERT IGNORE INTO employee_grades (id, grade_code, grade_name, description) VALUES
(1, 'A', 'Grade A', 'Senior Level'),
(2, 'B', 'Grade B', 'Mid Level'),
(3, 'C', 'Grade C', 'Junior Level'),
(4, 'D', 'Grade D', 'Entry Level');

-- =========================================================
-- INSERT PERMANENT MANAGER USER
-- =========================================================
-- NOTE: Password hash for "Manager@123"
INSERT IGNORE INTO users (
    first_name, 
    last_name, 
    email, 
    phone_number, 
    password, 
    designation, 
    department, 
    employee_id, 
    role_id, 
    is_active, 
    is_verified
) VALUES (
    'System',
    'Manager',
    'manager@expensehub.com',
    '+91-1234567890',
    '$2b$12$2Ojb9UAprmvRItzmfB0jh./IZJsHgi1C0wVxnXfI4o0KIo9Q1HT6q',  -- Password: Manager@123
    'Expense Manager',
    'Finance',
    'MGR-001',
    2,  -- Manager role (2)
    1,  -- is_active
    1   -- is_verified
);

-- =========================================================
-- INSERT PERMANENT HR USER (Sarah Johnson)
-- =========================================================
-- NOTE: Password hash for "HR@123" 
-- Hash generated using bcrypt with cost factor 12
INSERT IGNORE INTO users (
    first_name, 
    last_name, 
    email, 
    phone_number, 
    password, 
    designation, 
    department, 
    employee_id, 
    role_id, 
    is_active, 
    is_verified
) VALUES (
    'Sarah',
    'Johnson',
    'sarah.johnson@expensehub.com',
    '+91-9876543210',
    '$2b$12$DTmRi19m5bcSbDTW916HEOLMMGAlylmUd3DASVFjDBEbUiuf8Y1dy',  -- Password: HR@123
    'HR Manager',
    'Human Resources',
    'HR-001',
    3,  -- HR/Finance role (3)
    1,  -- is_active
    1   -- is_verified
);
