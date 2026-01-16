# Expense Reimbursement System - Project Structure

```
Expense_Reimbursement_System/
│
├── backend/                    # FastAPI Backend
│   ├── app/                    # Application code
│   │   ├── __init__.py
│   │   ├── main.py            # FastAPI entry point
│   │   ├── config.py          # Configuration settings
│   │   ├── database.py        # Database setup
│   │   ├── models/            # SQLAlchemy models
│   │   ├── schemas/           # Pydantic schemas
│   │   ├── routes/            # API routes
│   │   ├── services/          # Business logic
│   │   ├── utils/             # Utilities
│   │   └── bills/             # Upload directory
│   ├── requirements.txt       # Python dependencies
│   ├── Dockerfile            # Docker image definition
│   ├── docker-compose.yml    # Docker compose configuration
│   └── README.md             # Backend documentation
│
├── frontend/                   # Next.js Frontend
│   ├── home/                  # Home page
│   ├── login/                 # Login page
│   ├── register/              # Registration page
│   ├── verify-otp/            # OTP verification page
│   ├── page.tsx              # Root page
│   └── README.md             # Frontend documentation
│
├── tests/                      # Testing & Validation
│   ├── test_approval_apis.py
│   ├── test_file_upload.py
│   ├── test_full_workflow.py
│   ├── test_approval_apis.ps1
│   ├── verify_apis.py
│   └── README.md             # Testing documentation
│
├── data/                       # Database & Test Data
│   ├── init.sql              # Database initialization
│   ├── fix_expenses_table.sql # Database fixes/migrations
│   ├── generate_hashes.py    # Hash generation utility
│   ├── test_bill.txt         # Sample test data
│   └── README.md             # Data documentation
│
├── docs/                       # Documentation
│   ├── API_TEST_REPORT.md
│   └── README.md             # Main documentation
│
└── README.md                   # Project root documentation
```

## Directory Descriptions

### `/backend`
The FastAPI backend application. This contains all server-side code including:
- REST API routes
- Database models and operations
- Business logic services
- Authentication and authorization
- File upload handling

**Quick Start:**
```bash
cd backend
docker-compose up
```

### `/frontend`
The Next.js React frontend application. Contains:
- User interface pages
- Authentication flows
- Expense submission forms
- Approval management interface

### `/tests`
Testing scripts and validation tools:
- API endpoint testing
- Workflow validation
- File upload testing
- API verification reports

**Run Tests:**
```bash
python tests/test_full_workflow.py
python tests/test_file_upload.py
```

### `/data`
Database and test data files:
- SQL initialization scripts
- Database migrations
- Test data samples
- Data generation utilities

### `/docs`
Project documentation:
- API test reports
- Architecture documentation
- Setup guides

---

## Quick Start

### Backend
```bash
cd backend
docker-compose up -d
```

### Run Tests
```bash
cd tests
python test_full_workflow.py
python test_file_upload.py
```

### Access
- API: http://localhost:8000
- API Docs: http://localhost:8000/docs
- Health Check: http://localhost:8000/health

---

## File Organization Benefits

✅ **Clear Separation of Concerns**
- Backend code isolated in `/backend`
- Frontend code isolated in `/frontend`
- Tests grouped in `/tests`
- Data and migrations in `/data`

✅ **Easier Maintenance**
- Find files quickly
- Better project navigation
- Cleaner dependencies
- Isolated deployment

✅ **Team Collaboration**
- Backend and frontend teams work independently
- Clear ownership of directories
- Easier code reviews
- Better CI/CD integration

✅ **Scalability**
- Easy to add new services
- Simple to manage multiple deployments
- Clear structure for growth
