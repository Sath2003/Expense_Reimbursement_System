# Backend - FastAPI Expense Reimbursement System

## Overview
This is the backend API for the Expense Reimbursement System built with FastAPI, SQLAlchemy, and MySQL.

## Project Structure

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py              # FastAPI application entry point
│   ├── config.py            # Configuration and settings
│   ├── database.py          # Database connection and setup
│   ├── models/              # SQLAlchemy ORM models
│   │   ├── user.py
│   │   ├── expense.py
│   │   ├── approval.py
│   │   ├── audit.py
│   │   └── __init__.py
│   ├── schemas/             # Pydantic request/response schemas
│   │   ├── user.py
│   │   ├── expense.py
│   │   ├── approval.py
│   │   └── __init__.py
│   ├── routes/              # API endpoints
│   │   ├── auth.py          # Authentication endpoints
│   │   ├── expense.py       # Expense management endpoints
│   │   ├── approval.py      # Approval workflow endpoints
│   │   └── __init__.py
│   ├── services/            # Business logic
│   │   ├── user_service.py
│   │   ├── expense_service.py
│   │   ├── approval_service.py
│   │   └── __init__.py
│   ├── utils/               # Utility functions
│   │   ├── security.py      # JWT and security
│   │   ├── dependencies.py  # Dependency injection
│   │   ├── audit_logger.py  # Audit logging
│   │   ├── email.py         # Email utilities
│   │   ├── file_handler.py  # File upload handling
│   │   └── __init__.py
│   ├── bills/               # Upload directory (mounted volume)
│   └── __pycache__/
├── requirements.txt         # Python dependencies
├── Dockerfile              # Docker image definition
├── docker-compose.yml      # Docker compose setup
└── README.md              # This file
```

## Technology Stack

- **Framework**: FastAPI 0.109.0
- **ORM**: SQLAlchemy 2.0.23
- **Database**: MySQL 8.0
- **Authentication**: JWT with python-jose
- **Password**: bcrypt with passlib
- **Validation**: Pydantic 2.5.2
- **Server**: Uvicorn 0.27.0
- **File Handling**: aiofiles 23.2.1

## Installation & Setup

### Prerequisites
- Docker & Docker Compose
- Python 3.10+ (for local development)
- MySQL 8.0+ (if running locally)

### With Docker (Recommended)

```bash
cd backend
docker-compose up -d
```

This will:
- Start MySQL database on port 3307
- Start FastAPI server on port 8000
- Initialize database with init.sql
- Create necessary tables

### Local Development

```bash
# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set environment variables
export DATABASE_URL="mysql+pymysql://user:password@localhost/expense_db"
export SECRET_KEY="your-secret-key"

# Run development server
uvicorn app.main:app --reload
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/verify-otp` - Verify OTP
- `POST /api/auth/login` - Login user
- `POST /api/auth/refresh-token` - Refresh access token

### Expenses
- `GET /api/expenses/` - List all expenses
- `POST /api/expenses/submit` - Create and submit expense
- `GET /api/expenses/{id}` - Get expense details
- `PUT /api/expenses/{id}` - Update expense
- `DELETE /api/expenses/{id}` - Delete expense
- `POST /api/expenses/{id}/upload-bill` - Upload attachment
- `DELETE /api/expenses/{id}/attachment/{aid}` - Delete attachment

### Approvals
- `GET /api/approvals/pending-manager` - Get pending manager approvals
- `GET /api/approvals/{id}` - Get approval details
- `POST /api/approvals/manager/{id}/approve` - Manager approve
- `POST /api/approvals/manager/{id}/reject` - Manager reject
- `POST /api/approvals/finance/{id}/approve` - Finance approve
- `POST /api/approvals/finance/{id}/reject` - Finance reject

## Configuration

Edit `app/config.py` to customize:
- Database connection
- JWT settings
- Email settings
- File upload limits
- Allowed file types
- Application settings

## Features

✅ **Authentication**
- User registration with OTP verification
- JWT-based authentication
- Refresh token support
- Role-based access control

✅ **Expense Management**
- Create, read, update, delete expenses
- Multiple file attachments (PDF, Images, Documents)
- Expense categorization
- Status tracking

✅ **Approval Workflow**
- Manager approval level
- Finance approval level
- Approval comments and history
- Audit logging

✅ **File Handling**
- Multiple file format support
- File integrity verification (SHA-256)
- Automatic file organization by month
- Size validation and limits

✅ **Audit Logging**
- All operations logged
- User tracking
- Change history
- Compliance ready

## Environment Variables

```
DATABASE_URL=mysql+pymysql://user:password@host:port/database
SECRET_KEY=your-secret-key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SMTP_EMAIL=your-email@gmail.com
SMTP_PASSWORD=your-password
MAX_FILE_SIZE=10485760
ALLOWED_FILE_TYPES=jpg,jpeg,png,pdf,doc,docx,xls,xlsx,txt,csv
UPLOAD_DIR=/app/bills
DEBUG=False
```

## Docker Compose Services

### expense_db
- **Image**: mysql:8.0
- **Port**: 3307:3306
- **Volume**: mysql_data
- **Network**: expense_network

### expense_backend
- **Build**: ./Dockerfile
- **Port**: 8000:8000
- **Dependencies**: expense_db
- **Volumes**: app code, bills directory
- **Network**: expense_network

## Testing

Run tests from the project root:

```bash
python tests/test_full_workflow.py
python tests/test_file_upload.py
python tests/verify_apis.py
```

## Database Migrations

Use the SQL scripts in `/data`:
- `init.sql` - Initial database setup
- `fix_expenses_table.sql` - Schema updates

Apply manually:
```sql
mysql -u user -p database < init.sql
```

## Logs

View Docker logs:
```bash
docker logs expense_backend
docker logs expense_db
```

## Production Deployment

1. Update `config.py` with production settings
2. Change `SECRET_KEY` to secure random value
3. Use environment variables for sensitive data
4. Enable HTTPS
5. Set `DEBUG = False`
6. Use managed database service
7. Configure proper SMTP for emails

## Troubleshooting

**Port already in use:**
```bash
docker-compose down
docker-compose up
```

**Database connection error:**
- Check DATABASE_URL in .env
- Verify MySQL is running
- Check network connectivity

**File upload issues:**
- Verify bills directory permissions
- Check MAX_FILE_SIZE setting
- Verify ALLOWED_FILE_TYPES

## Support

For issues or questions:
1. Check API documentation at http://localhost:8000/docs
2. Review logs: `docker logs expense_backend`
3. Check database: `docker exec expense_db mysql -u user -p database`

---

**Last Updated**: January 2026
