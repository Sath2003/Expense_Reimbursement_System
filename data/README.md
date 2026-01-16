# Database & Data Files

## Overview
This directory contains database initialization scripts, migrations, and test data.

## Files

### `init.sql`
**Purpose**: Initial database schema and setup

**Contains**:
- Database creation
- Table definitions
- Indexes
- Constraints
- Initial data

**Usage**:
```bash
# Applied automatically by docker-compose
docker exec expense_db mysql -u expense_user -pexpense_password \
  expense_reimbursement_db < init.sql
```

**Tables**:
- `users` - User accounts and profiles
- `expenses` - Expense records
- `expense_attachments` - File attachments
- `expense_approvals` - Approval workflow
- `expense_categories` - Expense types
- `audit_logs` - Activity tracking

---

### `fix_expenses_table.sql`
**Purpose**: Schema updates and fixes

**Contains**:
- Table alterations
- Column modifications
- Index additions
- Data migrations

**Usage**:
```bash
# Apply specific migration
docker exec expense_db mysql -u expense_user -pexpense_password \
  expense_reimbursement_db < fix_expenses_table.sql
```

---

### `generate_hashes.py`
**Purpose**: Generate password hashes and test data

**Functions**:
- Hash password generation
- Test user data creation
- Bulk data generation

**Usage**:
```bash
python generate_hashes.py
```

**Output**:
- Hash values for test passwords
- SQL INSERT statements
- Test user credentials

---

### `test_bill.txt`
**Purpose**: Sample test data for file uploads

**Contains**:
- Sample invoice format
- Test data structure
- Example document

**Usage**:
- Upload testing
- Integration testing

---

## Database Schema

### Users Table
```sql
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  is_verified BOOLEAN DEFAULT FALSE,
  otp_code VARCHAR(6),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Expenses Table
```sql
CREATE TABLE expenses (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  category_id INT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  description TEXT,
  status VARCHAR(50),
  expense_date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Approvals Table
```sql
CREATE TABLE expense_approvals (
  id INT PRIMARY KEY AUTO_INCREMENT,
  expense_id INT NOT NULL,
  approval_role VARCHAR(50) NOT NULL,
  decision VARCHAR(50),
  approved_by INT,
  comments TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Attachments Table
```sql
CREATE TABLE expense_attachments (
  id INT PRIMARY KEY AUTO_INCREMENT,
  expense_id INT NOT NULL,
  file_name VARCHAR(255),
  file_path VARCHAR(255),
  file_type VARCHAR(10),
  file_size INT,
  file_hash VARCHAR(64),
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## Database Operations

### Connect to Database
```bash
# Via docker
docker exec -it expense_db mysql -u expense_user -pexpense_password \
  expense_reimbursement_db

# Via local MySQL
mysql -h localhost -P 3307 -u expense_user -pexpense_password \
  expense_reimbursement_db
```

### Common Queries

#### View Users
```sql
SELECT id, email, first_name, last_name, is_verified 
FROM users 
ORDER BY created_at DESC;
```

#### View Expenses
```sql
SELECT e.id, e.user_id, e.amount, e.status, e.created_at
FROM expenses e
ORDER BY e.created_at DESC;
```

#### View Approvals
```sql
SELECT a.id, a.expense_id, a.approval_role, a.decision, a.approved_by
FROM expense_approvals a
ORDER BY a.created_at DESC;
```

#### View Audit Logs
```sql
SELECT id, entity_type, action, performed_by, created_at
FROM audit_logs
ORDER BY created_at DESC LIMIT 50;
```

### Backup Database
```bash
# Backup
docker exec expense_db mysqldump -u expense_user -pexpense_password \
  expense_reimbursement_db > backup.sql

# Restore
docker exec -i expense_db mysql -u expense_user -pexpense_password \
  expense_reimbursement_db < backup.sql
```

### Reset Database
```bash
# Delete all data
docker exec expense_db mysql -u expense_user -pexpense_password \
  expense_reimbursement_db -e "TRUNCATE TABLE users; TRUNCATE TABLE expenses;"

# Recreate schema
docker exec -i expense_db mysql -u expense_user -pexpense_password \
  expense_reimbursement_db < init.sql
```

---

## Test Data Generation

### Create Test User
```python
from generate_hashes import hash_password, create_user_sql

password_hash = hash_password("TestPassword123")
sql = create_user_sql(
    email="test@example.com",
    password_hash=password_hash,
    first_name="Test",
    last_name="User"
)
print(sql)
```

### Generate Test Expenses
```bash
python generate_hashes.py --mode expenses --count 10
```

### Sample Password Hashes
```python
# Plain: TestPassword123
# Hash: $2b$12$...

# Plain: Manager123
# Hash: $2b$12$...
```

---

## Migrations

### New Migration Process

1. Create SQL file: `migrate_YYYYMMDD_description.sql`
2. Add migration to `init.sql` or new migration file
3. Apply to running database:
```bash
docker exec -i expense_db mysql -u expense_user -pexpense_password \
  expense_reimbursement_db < migrate_20260109_description.sql
```
4. Test thoroughly
5. Update backend code if needed

### Version Control
Keep migrations in order:
```
data/
├── init.sql
├── fix_expenses_table.sql
├── migrate_20260110_add_columns.sql
├── migrate_20260111_update_indexes.sql
```

---

## Data Integrity

### Foreign Keys
All tables use proper foreign keys:
```sql
ALTER TABLE expenses ADD FOREIGN KEY (user_id) REFERENCES users(id);
ALTER TABLE expenses ADD FOREIGN KEY (category_id) REFERENCES categories(id);
```

### Constraints
- Email is UNIQUE
- Amount must be > 0
- Status in (SUBMITTED, MANAGER_APPROVED, etc.)
- Decision in (PENDING, APPROVED, REJECTED)

### Validation
- No NULL in required fields
- Date format: YYYY-MM-DD
- Amount format: DECIMAL(10,2)

---

## Performance

### Indexes
```sql
-- User lookups
CREATE INDEX idx_users_email ON users(email);

-- Expense lookups
CREATE INDEX idx_expenses_user ON expenses(user_id);
CREATE INDEX idx_expenses_status ON expenses(status);

-- Approval lookups
CREATE INDEX idx_approvals_expense ON expense_approvals(expense_id);
CREATE INDEX idx_approvals_role ON expense_approvals(approval_role);
```

### Query Optimization
```sql
-- Good - uses index
SELECT * FROM expenses WHERE user_id = 5;

-- Bad - full table scan
SELECT * FROM expenses WHERE amount > 100;

-- Good - uses indexes
SELECT e.* FROM expenses e 
WHERE e.user_id = 5 AND e.status = 'SUBMITTED';
```

---

## Monitoring

### Table Size
```sql
SELECT TABLE_NAME, 
  ROUND(((data_length + index_length) / 1024 / 1024), 2) AS size_mb
FROM information_schema.TABLES
WHERE TABLE_SCHEMA = 'expense_reimbursement_db';
```

### Row Counts
```sql
SELECT TABLE_NAME, TABLE_ROWS
FROM information_schema.TABLES
WHERE TABLE_SCHEMA = 'expense_reimbursement_db';
```

### Slow Queries
```sql
SET GLOBAL slow_query_log = 'ON';
SET GLOBAL long_query_time = 1;
```

---

## Disaster Recovery

### Weekly Backup
```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
docker exec expense_db mysqldump -u expense_user -pexpense_password \
  expense_reimbursement_db > backup_$DATE.sql
```

### Point-in-Time Recovery
1. Stop all operations
2. Restore from backup
3. Apply binary logs
4. Verify data integrity
5. Resume operations

---

## Documentation

For schema details and ERD, see the main `/docs` directory.

---

**Last Updated**: January 2026
