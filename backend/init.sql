-- =========================================================
-- Expense Reimbursement Management System
-- Database Schema (MySQL 8.x)
-- =========================================================

SET FOREIGN_KEY_CHECKS = 0;

-- =========================
-- 1. ROLES
-- =========================
CREATE TABLE IF NOT EXISTS roles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    role_name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT
) ENGINE=InnoDB;

-- =========================
-- 2. EMPLOYEE GRADES
-- =========================
CREATE TABLE IF NOT EXISTS employee_grades (
    id INT AUTO_INCREMENT PRIMARY KEY,
    grade_code CHAR(1) NOT NULL UNIQUE,
    grade_name VARCHAR(50),
    description TEXT
) ENGINE=InnoDB;

-- =========================
-- 3. DEPARTMENTS
-- =========================
CREATE TABLE IF NOT EXISTS departments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT
) ENGINE=InnoDB;

-- =========================
-- 4. USERS (AUTHENTICATION)
-- =========================
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    email VARCHAR(255) NOT NULL UNIQUE,
    phone_number VARCHAR(20),
    password VARCHAR(255) NOT NULL,
    designation VARCHAR(100),
    department VARCHAR(100),
    employee_id VARCHAR(50) UNIQUE,
    manager_id INT,
    role_id INT NOT NULL,
    grade_id INT,
    is_active BOOLEAN DEFAULT TRUE,
    is_verified BOOLEAN DEFAULT FALSE,
    otp_code VARCHAR(6),
    otp_expires_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_user_role
        FOREIGN KEY (role_id) REFERENCES roles(id),
    
    CONSTRAINT fk_user_grade
        FOREIGN KEY (grade_id) REFERENCES employee_grades(id)
) ENGINE=InnoDB;

-- =========================
-- 5. EMPLOYEES (BUSINESS IDENTITY)
-- =========================
CREATE TABLE IF NOT EXISTS employees (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL UNIQUE,
    employee_id BIGINT NOT NULL UNIQUE,
    designation VARCHAR(100),
    department_id INT,
    grade_id INT,
    manager_id INT,
    status VARCHAR(20) DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_employee_user
        FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_employee_grade
        FOREIGN KEY (grade_id) REFERENCES employee_grades(id),

    CONSTRAINT fk_employee_manager
        FOREIGN KEY (manager_id) REFERENCES employees(id),

    CONSTRAINT fk_employee_dept
        FOREIGN KEY (department_id) REFERENCES departments(id)
) ENGINE=InnoDB;

-- =========================
-- 6. USER ↔ ROLE MAPPING
-- =========================
CREATE TABLE IF NOT EXISTS user_roles (
    user_id INT NOT NULL,
    role_id INT NOT NULL,

    PRIMARY KEY (user_id, role_id),

    CONSTRAINT fk_ur_user
        FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_ur_role
        FOREIGN KEY (role_id) REFERENCES roles(id)
        ON DELETE CASCADE
) ENGINE=InnoDB;

-- =========================
-- 7. EMAIL OTP VERIFICATION
-- =========================
CREATE TABLE IF NOT EXISTS email_otps (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    otp_hash VARCHAR(255) NOT NULL,
    expires_at DATETIME NOT NULL,
    is_used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- =========================
-- 8. REFRESH TOKENS
-- =========================
CREATE TABLE IF NOT EXISTS refresh_tokens (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    token_hash VARCHAR(255) NOT NULL,
    expires_at DATETIME NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_rt_user
        FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE CASCADE
) ENGINE=InnoDB;

-- =========================
-- 9. EXPENSE CATEGORIES
-- =========================
CREATE TABLE IF NOT EXISTS expense_categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT
) ENGINE=InnoDB;

-- =========================
-- 10. TRANSPORTATION TYPES
-- =========================
CREATE TABLE IF NOT EXISTS transportation_types (
    id INT AUTO_INCREMENT PRIMARY KEY,
    type_name VARCHAR(50) NOT NULL UNIQUE
) ENGINE=InnoDB;

-- =========================
-- 11. GENERAL EXPENSE POLICIES
-- =========================
CREATE TABLE IF NOT EXISTS expense_policies (
    id INT AUTO_INCREMENT PRIMARY KEY,
    grade_id INT NOT NULL,
    category_id INT NOT NULL,
    max_amount DECIMAL(10,2),
    frequency ENUM('DAILY', 'MONTHLY', 'PER_TRIP'),
    requires_approval BOOLEAN DEFAULT TRUE,

    CONSTRAINT fk_ep_grade
        FOREIGN KEY (grade_id) REFERENCES employee_grades(id),

    CONSTRAINT fk_ep_category
        FOREIGN KEY (category_id) REFERENCES expense_categories(id)
) ENGINE=InnoDB;

-- =========================
-- 12. TRANSPORTATION POLICIES
-- =========================
CREATE TABLE IF NOT EXISTS transportation_policies (
    id INT AUTO_INCREMENT PRIMARY KEY,
    grade_id INT NOT NULL,
    transport_type_id INT NOT NULL,
    allowed_class VARCHAR(50),
    max_amount DECIMAL(10,2),
    requires_ticket BOOLEAN DEFAULT TRUE,

    CONSTRAINT fk_tp_grade
        FOREIGN KEY (grade_id) REFERENCES employee_grades(id),

    CONSTRAINT fk_tp_transport
        FOREIGN KEY (transport_type_id) REFERENCES transportation_types(id)
) ENGINE=InnoDB;

-- =========================
-- 13. EXPENSES (TRANSACTIONS)
-- =========================
CREATE TABLE IF NOT EXISTS expenses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    category_id INT NOT NULL,
    transport_type_id INT,
    amount DECIMAL(10,2) NOT NULL,
    expense_date DATE NOT NULL,
    description TEXT,
    status ENUM(
        'SUBMITTED',
        'POLICY_EXCEPTION',
        'MANAGER_APPROVED',
        'MANAGER_REJECTED',
        'FINANCE_APPROVED',
        'FINANCE_REJECTED',
        'PAID'
    ) DEFAULT 'SUBMITTED',
    rejection_remarks TEXT,
    policy_check_result JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_exp_user
        FOREIGN KEY (user_id) REFERENCES users(id),

    CONSTRAINT fk_exp_category
        FOREIGN KEY (category_id) REFERENCES expense_categories(id),

    CONSTRAINT fk_exp_transport
        FOREIGN KEY (transport_type_id) REFERENCES transportation_types(id)
) ENGINE=InnoDB;

-- =========================
-- 14. EXPENSE ATTACHMENTS (BILLS)
-- =========================
CREATE TABLE IF NOT EXISTS expense_attachments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    expense_id INT NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_path TEXT NOT NULL,
    file_type VARCHAR(50) NOT NULL,
    file_size INT,
    file_hash VARCHAR(255) NOT NULL,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_attach_expense
        FOREIGN KEY (expense_id) REFERENCES expenses(id)
        ON DELETE CASCADE
) ENGINE=InnoDB;

-- =========================
-- 15. EXPENSE APPROVALS
-- =========================
CREATE TABLE IF NOT EXISTS expense_approvals (
    id INT AUTO_INCREMENT PRIMARY KEY,
    expense_id INT NOT NULL,
    approved_by INT NOT NULL,
    role ENUM('MANAGER', 'FINANCE'),
    decision ENUM('APPROVED', 'REJECTED'),
    comments TEXT,
    decided_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_ea_expense
        FOREIGN KEY (expense_id) REFERENCES expenses(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_ea_user
        FOREIGN KEY (approved_by) REFERENCES users(id)
) ENGINE=InnoDB;

-- =========================
-- 16. AUDIT LOGS (IMMUTABLE)
-- =========================
CREATE TABLE IF NOT EXISTS audit_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    entity_type VARCHAR(50),
    entity_id INT,
    action VARCHAR(50),
    performed_by INT,
    old_value JSON,
    new_value JSON,
    performed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ip_address VARCHAR(50),

    CONSTRAINT fk_audit_user
        FOREIGN KEY (performed_by) REFERENCES users(id)
) ENGINE=InnoDB;

-- =========================
-- 17. DESIGNATION ↔ GRADE MAPPING
-- =========================
CREATE TABLE IF NOT EXISTS designation_grade_mapping (
    id INT AUTO_INCREMENT PRIMARY KEY,
    designation VARCHAR(100) NOT NULL UNIQUE,
    grade_id INT NOT NULL,
    FOREIGN KEY (grade_id) REFERENCES employee_grades(id)
) ENGINE=InnoDB;

SET FOREIGN_KEY_CHECKS = 1;

-- =====================================================================
-- INSERT DEFAULT DATA
-- =====================================================================

-- Default roles
INSERT INTO roles (role_name, description) VALUES
('EMPLOYEE', 'Can submit and view own expenses'),
('MANAGER', 'Can approve/reject team expenses'),
('FINANCE', 'Can approve/reject all expenses and process payments'),
('ADMIN', 'Full system access including user management')
ON DUPLICATE KEY UPDATE description=VALUES(description);

-- Default grades
INSERT INTO employee_grades (grade_code, grade_name, description) VALUES
('A', 'Senior Executive', 'Director level and above'),
('B', 'Manager', 'Department managers'),
('C', 'Senior Staff', 'Team leads and senior employees'),
('D', 'Staff', 'Entry and mid-level employees')
ON DUPLICATE KEY UPDATE grade_name=VALUES(grade_name);

-- Default departments
INSERT INTO departments (name, description) VALUES
('Engineering', 'Engineering and development'),
('Finance', 'Finance and accounting'),
('Human Resources', 'HR and recruitment'),
('Sales', 'Sales and business development'),
('Operations', 'Operations and administration')
ON DUPLICATE KEY UPDATE description=VALUES(description);

-- Default expense categories
INSERT INTO expense_categories (name, description) VALUES
('Travel', 'Business travel expenses'),
('Food', 'Meals and refreshments'),
('Accommodation', 'Hotel and lodging'),
('Office Supplies', 'Stationery and office items'),
('Communication', 'Phone and internet'),
('Miscellaneous', 'Other business expenses'),
('Equipment', 'Equipment and machinery'),
('Meals', 'Meals and drinks'),
('Other', 'Other expenses'),
('Fuel', 'Fuel and petrol expenses')
ON DUPLICATE KEY UPDATE description=VALUES(description);

-- Default transportation types
INSERT INTO transportation_types (type_name) VALUES
('Flight'),
('Train'),
('Bus'),
('Taxi'),
('Personal Vehicle')
ON DUPLICATE KEY UPDATE type_name=VALUES(type_name);

-- Designation to grade mappings
INSERT INTO designation_grade_mapping (designation, grade_id) VALUES
('Director', 1),
('Senior Manager', 2),
('Manager', 2),
('Team Lead', 3),
('Senior Developer', 3),
('Developer', 4),
('Junior Developer', 4),
('Finance Manager', 2),
('HR Specialist', 4),
('Sales Executive', 4),
('Marketing Executive', 4),
('Product Manager', 2),
('Business Analyst', 4),
('Support Staff', 4)
ON DUPLICATE KEY UPDATE grade_id=VALUES(grade_id);

-- Default expense policies (max amounts by grade and category)
INSERT INTO expense_policies (grade_id, category_id, max_amount, frequency, requires_approval) VALUES
(1, 1, 50000.00, 'PER_TRIP', 1),    -- Director - Travel
(1, 2, 2000.00, 'DAILY', 0),         -- Director - Food
(1, 3, 10000.00, 'PER_TRIP', 1),    -- Director - Accommodation
(2, 1, 30000.00, 'PER_TRIP', 1),    -- Manager - Travel
(2, 2, 1500.00, 'DAILY', 0),         -- Manager - Food
(2, 3, 5000.00, 'PER_TRIP', 1),     -- Manager - Accommodation
(3, 1, 15000.00, 'PER_TRIP', 1),    -- Senior Staff - Travel
(3, 2, 1000.00, 'DAILY', 1),         -- Senior Staff - Food
(3, 3, 3000.00, 'PER_TRIP', 1),     -- Senior Staff - Accommodation
(4, 1, 10000.00, 'PER_TRIP', 1),    -- Staff - Travel
(4, 2, 500.00, 'DAILY', 1),          -- Staff - Food
(4, 3, 2000.00, 'PER_TRIP', 1)      -- Staff - Accommodation
ON DUPLICATE KEY UPDATE max_amount=VALUES(max_amount);

-- Default transportation policies
INSERT INTO transportation_policies (grade_id, transport_type_id, allowed_class, max_amount, requires_ticket) VALUES
(1, 1, 'First', 20000.00, 1),        -- Director - Flight First Class
(2, 1, 'Business', 15000.00, 1),     -- Manager - Flight Business Class
(3, 1, 'Economy', 8000.00, 1),       -- Senior Staff - Flight Economy
(4, 1, 'Economy', 5000.00, 1),       -- Staff - Flight Economy
(1, 2, 'First', 5000.00, 1),         -- Director - Train First
(2, 2, 'First', 3000.00, 1),         -- Manager - Train First
(3, 2, 'Second', 2000.00, 1),        -- Senior Staff - Train Second
(4, 2, 'Second', 1000.00, 1)         -- Staff - Train Second
ON DUPLICATE KEY UPDATE max_amount=VALUES(max_amount);

-- =====================================================================
-- INSERT SAMPLE USERS
-- =====================================================================

-- Admin User (password: senior@123)
INSERT INTO users (first_name, last_name, email, phone_number, password, designation, department, employee_id, role_id, grade_id, is_active, is_verified) 
VALUES ('Admin', 'User', 'admin@expensemgmt.com', '9876543210', '$2b$12$v0FixhBFJUD75jyxXVQ.leUkHg5pd9dXLQoRzvwv1B7tChlNbYnKu', 'System Administrator', 'Administration', 'EMP001', 4, 1, 1, 1)
ON DUPLICATE KEY UPDATE is_verified=VALUES(is_verified);

-- Finance Manager (password: senior@123)
INSERT INTO users (first_name, last_name, email, phone_number, password, designation, department, employee_id, role_id, grade_id, is_active, is_verified) 
VALUES ('Priya', 'Sharma', 'priya.sharma@expensemgmt.com', '9123456789', '$2b$12$v0FixhBFJUD75jyxXVQ.leUkHg5pd9dXLQoRzvwv1B7tChlNbYnKu', 'Finance Manager', 'Finance', 'EMP002', 3, 2, 1, 1)
ON DUPLICATE KEY UPDATE is_verified=VALUES(is_verified);

-- Department Manager (password: senior@123)
INSERT INTO users (first_name, last_name, email, phone_number, password, designation, department, employee_id, role_id, grade_id, is_active, is_verified) 
VALUES ('Rajesh', 'Kumar', 'rajesh.kumar@expensemgmt.com', '9234567890', '$2b$12$v0FixhBFJUD75jyxXVQ.leUkHg5pd9dXLQoRzvwv1B7tChlNbYnKu', 'Engineering Manager', 'Engineering', 'EMP003', 2, 2, 1, 1)
ON DUPLICATE KEY UPDATE is_verified=VALUES(is_verified);

-- Senior Developer (password: senior@123) - Reports to Rajesh Kumar (ID: 3)
INSERT INTO users (first_name, last_name, email, phone_number, password, designation, department, employee_id, role_id, grade_id, is_active, is_verified) 
VALUES ('Amit', 'Patel', 'amit.patel@expensemgmt.com', '9345678901', '$2b$12$v0FixhBFJUD75jyxXVQ.leUkHg5pd9dXLQoRzvwv1B7tChlNbYnKu', 'Senior Developer', 'Engineering', 'EMP004', 1, 3, 1, 1)
ON DUPLICATE KEY UPDATE is_verified=VALUES(is_verified);
UPDATE users SET manager_id = 3 WHERE id = 4;

-- Junior Developer (password: senior@123) - Reports to Amit Patel (ID: 4)
INSERT INTO users (first_name, last_name, email, phone_number, password, designation, department, employee_id, role_id, grade_id, is_active, is_verified) 
VALUES ('Neha', 'Singh', 'neha.singh@expensemgmt.com', '9456789012', '$2b$12$v0FixhBFJUD75jyxXVQ.leUkHg5pd9dXLQoRzvwv1B7tChlNbYnKu', 'Junior Developer', 'Engineering', 'EMP005', 1, 4, 1, 1)
ON DUPLICATE KEY UPDATE is_verified=VALUES(is_verified);
UPDATE users SET manager_id = 4 WHERE id = 5;

-- Sales Executive (password: senior@123) - Reports to Rajesh Kumar (ID: 3)
INSERT INTO users (first_name, last_name, email, phone_number, password, designation, department, employee_id, role_id, grade_id, is_active, is_verified) 
VALUES ('Vikram', 'Desai', 'vikram.desai@expensemgmt.com', '9567890123', '$2b$12$v0FixhBFJUD75jyxXVQ.leUkHg5pd9dXLQoRzvwv1B7tChlNbYnKu', 'Sales Executive', 'Sales', 'EMP006', 1, 4, 1, 1)
ON DUPLICATE KEY UPDATE is_verified=VALUES(is_verified);
UPDATE users SET manager_id = 3 WHERE id = 6;

-- HR Specialist (password: senior@123) - Reports to Rajesh Kumar (ID: 3)
INSERT INTO users (first_name, last_name, email, phone_number, password, designation, department, employee_id, role_id, grade_id, is_active, is_verified) 
VALUES ('Anjali', 'Gupta', 'anjali.gupta@expensemgmt.com', '9678901234', '$2b$12$v0FixhBFJUD75jyxXVQ.leUkHg5pd9dXLQoRzvwv1B7tChlNbYnKu', 'HR Specialist', 'Human Resources', 'EMP007', 1, 4, 1, 1)
ON DUPLICATE KEY UPDATE is_verified=VALUES(is_verified);
UPDATE users SET manager_id = 3 WHERE id = 7;

-- =====================================================================
-- CREATE INDEXES FOR PERFORMANCE
-- =====================================================================
CREATE INDEX idx_expenses_user ON expenses(user_id);
CREATE INDEX idx_expenses_status ON expenses(status);
CREATE INDEX idx_expenses_date ON expenses(expense_date);
CREATE INDEX idx_audit_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_otp_email ON email_otps(email, is_used);
CREATE INDEX idx_refresh_token_user ON refresh_tokens(user_id);
CREATE INDEX idx_attachments_expense ON expense_attachments(expense_id);
