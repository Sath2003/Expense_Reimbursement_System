# Documentation

## Overview
Complete documentation for the Expense Reimbursement System project.

## Contents

### API Test Report
See [API_TEST_REPORT.md](API_TEST_REPORT.md) for:
- Complete API endpoint listing
- Test results and validation
- Workflow verification
- Security features
- Database connectivity status

## Quick Links

### For Backend Developers
- [Backend README](../backend/README.md) - FastAPI setup and structure
- Database Setup - See `/data/README.md`
- API Documentation - http://localhost:8000/docs

### For Frontend Developers
- [Frontend README](../frontend/README.md) - Next.js setup
- Component patterns
- API integration examples
- Styling with Tailwind CSS

### For QA & Testing
- [Testing README](../tests/README.md) - Test scripts and procedures
- Manual testing guide
- CI/CD integration examples
- Performance testing

### For Database Admin
- [Data README](../data/README.md) - Database schema and management
- Backup and recovery procedures
- Migration process
- Performance monitoring

## Project Architecture

```
┌─────────────────────────────────────────────────────┐
│                   Frontend (Next.js)                │
│  (Authentication, Expense Forms, Approval UI)       │
└──────────────────┬──────────────────────────────────┘
                   │ HTTP/REST
                   │
┌──────────────────▼──────────────────────────────────┐
│            Backend (FastAPI)                        │
│  (API Routes, Business Logic, Authentication)       │
└──────────────────┬──────────────────────────────────┘
                   │ SQL
                   │
┌──────────────────▼──────────────────────────────────┐
│         Database (MySQL 8.0)                        │
│  (Users, Expenses, Approvals, Audit Logs)           │
└─────────────────────────────────────────────────────┘
```

## Key Components

### Authentication Flow
```
User Input → Register/Login → OTP Verification → 
JWT Token Generation → API Access
```

### Expense Workflow
```
Create Expense → Upload Files → Submit → 
Manager Review → Finance Review → Payment
```

### Approval Levels
```
1. Manager Approval - Direct supervisor reviews
2. Finance Approval - Finance team approves payment
3. Payment - Expense marked as paid
```

## API Endpoints Summary

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | /api/auth/register | User registration |
| POST | /api/auth/verify-otp | Email verification |
| POST | /api/auth/login | User login |
| POST | /api/expenses/submit | Create expense |
| GET | /api/expenses/ | List expenses |
| POST | /api/expenses/{id}/upload-bill | Upload file |
| GET | /api/approvals/pending-manager | Pending approvals |
| POST | /api/approvals/manager/{id}/approve | Approve expense |
| POST | /api/approvals/finance/{id}/approve | Finance approve |

## Getting Started

### 1. Set Up Backend
```bash
cd backend
docker-compose up -d
```

### 2. Set Up Frontend (Optional)
```bash
cd frontend
npm install
npm run dev
```

### 3. Run Tests
```bash
python tests/test_full_workflow.py
```

### 4. Access APIs
- API: http://localhost:8000
- Docs: http://localhost:8000/docs
- Frontend: http://localhost:3000 (if running)

## Configuration

### Backend (.env)
```
DATABASE_URL=mysql+pymysql://...
SECRET_KEY=your-secret-key
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
MAX_FILE_SIZE=10485760
```

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## Features

✅ **User Management**
- Registration with OTP verification
- JWT authentication
- Role-based access control
- Profile management

✅ **Expense Management**
- Create and submit expenses
- Categorize expenses
- Add receipts and documents
- Track expense status

✅ **Approval Workflow**
- Two-level approval process
- Manager and finance reviews
- Approval comments
- Rejection with feedback

✅ **File Management**
- Multiple file formats supported
- File integrity verification
- Automatic organization by month
- Secure file storage

✅ **Audit & Compliance**
- Complete audit logging
- User action tracking
- Change history
- Compliance ready

## Technology Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js, React, TypeScript, Tailwind CSS |
| Backend | FastAPI, Python, SQLAlchemy |
| Database | MySQL 8.0 |
| Authentication | JWT (python-jose) |
| Container | Docker, Docker Compose |

## File Structure

```
Expense_Reimbursement_System/
├── backend/              # FastAPI application
├── frontend/             # Next.js application
├── tests/               # Testing scripts
├── data/                # Database files
├── docs/                # Documentation
├── bills/               # Upload storage
└── README.md            # This file
```

## Security Features

✅ Password Hashing (bcrypt)
✅ JWT Authentication
✅ HTTPS Ready
✅ SQL Injection Prevention (SQLAlchemy ORM)
✅ CORS Configuration
✅ Audit Logging
✅ File Validation
✅ Rate Limiting (Ready)

## Performance Considerations

- Database indexes on frequently queried fields
- API pagination for large datasets
- File upload size limits
- Automatic file cleanup
- Connection pooling
- Query optimization

## Monitoring & Debugging

### Logs
```bash
# Backend logs
docker logs expense_backend

# Database logs
docker logs expense_db
```

### Database Access
```bash
docker exec -it expense_db mysql -u expense_user -pexpense_password \
  expense_reimbursement_db
```

### API Testing
Visit http://localhost:8000/docs for interactive Swagger UI

## Deployment

### Production Checklist
- [ ] Update SECRET_KEY
- [ ] Configure production database
- [ ] Set up HTTPS
- [ ] Configure email service
- [ ] Set DEBUG=False
- [ ] Configure CORS origins
- [ ] Set up backups
- [ ] Configure logging
- [ ] Deploy frontend
- [ ] Set up monitoring

### Docker Deployment
```bash
cd backend
docker build -t expense-api .
docker run -p 8000:8000 expense-api
```

### Cloud Deployment
- AWS: ECS, RDS, S3
- Google Cloud: Cloud Run, Cloud SQL
- Azure: App Service, Azure SQL

## Support & Troubleshooting

### Common Issues

**Connection Refused**
- Check if Docker containers are running
- Verify firewall settings

**OTP Not Working**
- Check email configuration
- Verify SMTP settings

**File Upload Failed**
- Check file size limit
- Verify file format
- Check directory permissions

## Contributing

1. Follow the project structure
2. Create feature branches
3. Write tests for new features
4. Update documentation
5. Submit pull requests

## License

[Your License Here]

## Contact

For questions or support:
- Check documentation
- Review API docs at http://localhost:8000/docs
- Check logs for errors

---

**Last Updated**: January 2026
**Version**: 1.0.0
