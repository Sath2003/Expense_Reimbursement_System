# 🎨 Project Structure Visual Guide

## Directory Organization

```
Expense_Reimbursement_System/
│
├─┬─ 🏗️  BACKEND (FastAPI Application)
│ ├── app/                      ← Application source code
│ │   ├── models/              ← Database models
│ │   ├── routes/              ← API endpoints
│ │   ├── services/            ← Business logic
│ │   ├── utils/               ← Utilities & helpers
│ │   ├── schemas/             ← Request/Response schemas
│ │   ├── main.py             ← App entry point
│ │   ├── config.py           ← Configuration
│ │   └── database.py         ← Database setup
│ ├── requirements.txt          ← Python dependencies
│ ├── Dockerfile               ← Docker image definition
│ ├── docker-compose.yml       ← Docker services setup
│ ├── .env                      ← Environment variables
│ └── README.md                ← Backend documentation
│
├─┬─ 💻 FRONTEND (Next.js Application)
│ ├── home/                     ← Home page components
│ │   └── page.tsx
│ ├── login/                    ← Login page
│ │   └── page.tsx
│ ├── register/                 ← Registration page
│ │   └── page.tsx
│ ├── verify-otp/               ← OTP verification page
│ │   └── page.tsx
│ ├── page.tsx                  ← Root/Dashboard page
│ └── README.md                ← Frontend documentation
│
├─┬─ 🧪 TESTS (Testing & Validation)
│ ├── test_full_workflow.py     ← Complete E2E test
│ ├── test_file_upload.py       ← File upload validation
│ ├── test_approval_apis.py     ← API endpoint tests
│ ├── test_approval_apis.ps1    ← PowerShell tests
│ ├── verify_apis.py            ← Quick API verification
│ └── README.md                ← Testing documentation
│
├─┬─ 📊 DATA (Database & Migrations)
│ ├── init.sql                  ← Initial schema
│ ├── fix_expenses_table.sql    ← Schema migrations
│ ├── generate_hashes.py        ← Hash generation utility
│ ├── test_bill.txt             ← Sample test data
│ └── README.md                ← Database documentation
│
├─┬─ 📚 DOCS (Documentation)
│ ├── API_TEST_REPORT.md        ← API test results
│ └── README.md                ← Documentation index
│
├─┬─ 📁 BILLS (File Storage)
│ └── [Year-Month]/            ← Uploaded files organized by month
│
├── README.md                   ← Project overview
├── QUICK_START.md              ← Getting started guide
└── PROJECT_INDEX.md            ← Complete documentation index
```

---

## Separation of Concerns

```
┌────────────────────────────────────────────────────────────┐
│                   FRONTEND (Next.js)                       │
│  ├─ User Interface                                         │
│  ├─ Form Handling                                          │
│  ├─ Authentication Flow                                    │
│  └─ API Integration                                        │
└─────────────────────┬────────────────────────────────────┘
                      │ HTTP REST API
                      │ (JSON over HTTP)
                      ▼
┌────────────────────────────────────────────────────────────┐
│                  BACKEND (FastAPI)                         │
│  ├─ API Routes (/api/auth, /api/expenses, /api/approvals) │
│  ├─ Business Logic (Services)                             │
│  ├─ Database Operations (Models)                          │
│  ├─ Authentication & Authorization                        │
│  └─ File Handling                                         │
└─────────────────────┬────────────────────────────────────┘
                      │ SQL Queries
                      │ (via SQLAlchemy ORM)
                      ▼
┌────────────────────────────────────────────────────────────┐
│              DATABASE (MySQL 8.0)                          │
│  ├─ Users Table                                           │
│  ├─ Expenses Table                                        │
│  ├─ Approvals Table                                       │
│  ├─ Attachments Table                                     │
│  └─ Audit Logs Table                                      │
└────────────────────────────────────────────────────────────┘
```

---

## File Flow

### User Registration Flow
```
frontend/register/page.tsx
    ↓ (Form submission)
Backend POST /api/auth/register
    ↓ (Pydantic validation)
app/routes/auth.py
    ↓ (Business logic)
app/services/user_service.py
    ↓ (Database operation)
app/models/user.py
    ↓ (SQL execution)
MySQL: users table
    ↓ (Response)
return: User ID, OTP message
```

### Expense Submission Flow
```
frontend/page.tsx (or custom form)
    ↓ (Form + Files)
Backend POST /api/expenses/submit
    ↓ (Validation)
app/routes/expense.py
    ↓ (Business logic + File handling)
app/services/expense_service.py
app/utils/file_handler.py
    ↓ (Database + File storage)
app/models/expense.py
MySQL tables + bills/ directory
    ↓ (Response)
return: Expense ID, Attachment IDs
```

### Approval Workflow Flow
```
Backend GET /api/approvals/pending-manager
    ↓
app/routes/approval.py
    ↓
app/services/approval_service.py
    ↓
Query: expense_approvals table
    ↓
Return: List of pending approvals

User selects approval
    ↓
POST /api/approvals/manager/{id}/approve
    ↓
app/routes/approval.py
    ↓
app/services/approval_service.py
    ↓ (Database update + Audit logging)
    ↓
MySQL: Update approval + Log action
    ↓
Return: Success message
```

---

## Documentation Structure

```
📖 README.md
   │
   ├─ Project Overview
   ├─ Directory Descriptions
   └─ Technology Stack

📖 QUICK_START.md
   │
   ├─ Getting Started (3 Steps)
   ├─ What's Where
   ├─ Configuration
   └─ Common Tasks

📖 PROJECT_INDEX.md
   │
   ├─ Start Here (This file)
   ├─ Documentation by Role
   │   ├─ Backend Developers
   │   ├─ Frontend Developers
   │   ├─ QA & Testing
   │   └─ Database & DevOps
   └─ Quick Reference

📖 backend/README.md
   │
   ├─ Backend Setup
   ├─ API Endpoints
   ├─ Features
   ├─ Configuration
   ├─ Testing
   └─ Deployment

📖 frontend/README.md
   │
   ├─ Frontend Setup
   ├─ Component Patterns
   ├─ API Integration
   ├─ Styling
   ├─ File Upload
   └─ Deployment

📖 tests/README.md
   │
   ├─ Test Files Overview
   ├─ Running Tests
   ├─ Test Scenarios
   ├─ Troubleshooting
   └─ CI/CD Integration

📖 data/README.md
   │
   ├─ Database Schema
   ├─ Database Operations
   ├─ Backup & Recovery
   ├─ Migrations
   └─ Monitoring

📖 docs/README.md
   │
   ├─ Project Architecture
   ├─ API Summary
   ├─ Getting Started
   ├─ Security Features
   └─ Deployment
```

---

## Team Collaboration Matrix

```
┌──────────────────┬─────────────┬──────────────────┬────────────┐
│ Role             │ Main Dir    │ Key Files        │ Quick Docs │
├──────────────────┼─────────────┼──────────────────┼────────────┤
│ Backend Dev      │ /backend    │ app/*.py         │ README.md  │
│ Frontend Dev     │ /frontend   │ **/*.tsx         │ README.md  │
│ QA/Tester        │ /tests      │ test_*.py        │ README.md  │
│ DevOps/DBA       │ /data       │ *.sql            │ README.md  │
│ Project Manager  │ /docs       │ API_TEST_*.md    │ README.md  │
│ All              │ /           │ QUICK_START.md   │ THIS FILE  │
└──────────────────┴─────────────┴──────────────────┴────────────┘
```

---

## Workflow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    USER ACTIONS                             │
│  Register → Verify OTP → Login → Create Expense             │
│                                       ↓                      │
│              Upload Files ← Manage Expense                  │
│                      ↓                                       │
└──────────────────────┼──────────────────────────────────────┘
                       │
        ┌──────────────┴──────────────┐
        │                             │
        ▼                             ▼
   ┌─────────────┐           ┌─────────────────┐
   │  FRONTEND   │           │     BACKEND     │
   │ (Next.js)   │───────→   │    (FastAPI)    │
   │             │←───────   │                 │
   └─────────────┘           └────────┬────────┘
                                      │
                                      ▼
                             ┌──────────────────┐
                             │   DATABASE       │
                             │   (MySQL 8.0)    │
                             │                  │
                             │  Tables:         │
                             │  • users         │
                             │  • expenses      │
                             │  • approvals     │
                             │  • attachments   │
                             │  • audit_logs    │
                             └──────────────────┘
        ┌──────────────┐
        │   STORAGE    │
        │   (bills/)   │
        │              │
        │  PDFs        │
        │  Images      │
        │  Documents   │
        └──────────────┘
```

---

## Development Workflow

```
1️⃣  START BACKEND
   cd backend
   docker-compose up -d
   ✓ API: http://localhost:8000
   ✓ Docs: http://localhost:8000/docs

2️⃣  START FRONTEND (Optional)
   cd frontend
   npm install
   npm run dev
   ✓ UI: http://localhost:3000

3️⃣  RUN TESTS
   cd tests
   python test_full_workflow.py
   ✓ Verify APIs working

4️⃣  DEVELOP
   Edit files in:
   - backend/app/ (API logic)
   - frontend/ (UI)
   
   Changes auto-reload (with --reload)

5️⃣  COMMIT & PUSH
   Changes organized by directory:
   - backend/ changes
   - frontend/ changes
   - tests/ changes
   - data/ changes
```

---

## File Ownership by Team

```
Frontend Team Owns:
└── frontend/
    ├── home/page.tsx
    ├── login/page.tsx
    ├── register/page.tsx
    ├── verify-otp/page.tsx
    ├── page.tsx
    └── README.md

Backend Team Owns:
└── backend/
    ├── app/models/
    ├── app/routes/
    ├── app/services/
    ├── app/utils/
    ├── requirements.txt
    ├── Dockerfile
    ├── docker-compose.yml
    └── README.md

QA Team Owns:
└── tests/
    ├── test_*.py
    ├── verify_apis.py
    └── README.md

DevOps Team Owns:
├── backend/docker-compose.yml
├── data/
└── data/README.md

All Teams:
├── README.md (read-only)
├── QUICK_START.md (read-only)
├── PROJECT_INDEX.md (read-only)
└── docs/
```

---

## Summary: Why This Structure

| Benefit | How Achieved |
|---------|-------------|
| **Clear Ownership** | Each team has dedicated directory |
| **Easy Onboarding** | README files in each directory |
| **Quick Navigation** | Related files grouped together |
| **CI/CD Ready** | Each module independently testable |
| **Scalability** | Easy to add new services |
| **Maintenance** | Changes isolated to specific areas |
| **Code Review** | Reviewers focus on relevant directory |
| **Documentation** | Each area self-documented |

---

**Your project is now professionally organized! 🎉**

Start with [QUICK_START.md](QUICK_START.md) →

