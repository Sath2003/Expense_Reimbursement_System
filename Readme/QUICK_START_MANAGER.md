# Quick Start Guide - Manager Approval System

## For Live/Production Deployment

### Just run Docker - That's it!
```bash
cd backend
docker-compose up
```

The permanent manager user is **automatically created** when the database initializes.

**No additional scripts or manual setup required!**

---

## Login Credentials

### Manager Account (Auto-Created)
- **Email**: manager@expensehub.com
- **Password**: Manager@123

### Employee Test Account (Create via Register)
- Go to `/register`
- Fill in your details
- You'll be assigned Employee role by default
- Use this to submit expenses

---

## System Flow

```
┌─────────────────────────────────────────────────────┐
│            Docker Compose Starts                    │
│  ├─ MySQL Database initializes                     │
│  ├─ init.sql creates tables                        │
│  ├─ init_roles.sql creates roles & manager user ✓  │
│  └─ Backend API starts on :8000                    │
└─────────────────────────────────────────────────────┘
                       ↓
┌─────────────────────────────────────────────────────┐
│            Frontend Starts                          │
│  npm run dev (starts on :3000)                      │
└─────────────────────────────────────────────────────┘
                       ↓
┌─────────────────────────────────────────────────────┐
│        User Login with Credentials                  │
│  ├─ Manager: manager@expensehub.com / Manager@123  │
│  ├─ Employee: (registered via signup)              │
│  └─ Routes based on role                           │
└─────────────────────────────────────────────────────┘
```

---

## What Manager Can Do

1. **View Dashboard**: See all employee expenses at `/manager-dashboard`
2. **Filter**: Filter expenses by status (Pending, Approved, Rejected)
3. **Review**: Click any expense to review details
4. **Approve**: Approve expenses based on bill genuinity
5. **Reject**: Reject with comments if needed
6. **Track**: See real-time stats (Total, Pending, Approved, Rejected)

---

## What Employee Can Do

1. **Submit**: Submit new expenses with receipts
2. **View**: See their own submitted expenses
3. **Track**: Monitor approval status
4. **Generate**: Create expense reports
5. **Update**: Edit pending expenses before manager reviews

---

## Database Info

**Manager User SQL** (automatically inserted):
```sql
INSERT IGNORE INTO users (
    first_name, last_name, email, phone_number, password,
    designation, department, employee_id, role_id, 
    is_active, is_verified
) VALUES (
    'System', 'Manager', 'manager@expensehub.com', '+91-1234567890',
    '$2b$12$OixZApnyQDcDxp3PrZiLa.I/aI.mJjlLxIrQaYhCCEBfkJvpGsmVm',
    'Expense Manager', 'Finance', 'MGR-001', 2, 1, 1
);
```

The `INSERT IGNORE` statement ensures:
- User is created only once
- Safe to run multiple times (idempotent)
- Won't cause errors if already exists

---

## Changing Manager Password

**After first login as manager**:
1. Go to settings/profile
2. Change password from "Manager@123" to secure password
3. Password will be hashed and stored in database

---

## Troubleshooting

**Manager can't see expenses?**
- Verify Docker is running and database is initialized
- Check that manager role (role_id=2) is assigned
- Check API endpoint returns all expenses

**Database not initializing?**
- Check Docker logs: `docker-compose logs db`
- Ensure MySQL is healthy: `docker-compose ps`
- Drop and recreate: `docker-compose down -v` then `docker-compose up`

**Need to reset manager password?**
- Connect to database directly
- Update password hash in users table
- Or restart with fresh database

---

## Production Checklist

- [x] Manager user created automatically
- [x] No manual scripts needed
- [x] Database initialization handled
- [x] Role-based access control
- [x] Secure password hashing
- [ ] Change default manager password
- [ ] Set up SSL/HTTPS
- [ ] Configure backup strategy
- [ ] Set up monitoring
- [ ] Create admin reset procedure
