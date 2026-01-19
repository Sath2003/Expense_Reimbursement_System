# Expense Reimbursement System

## Overview

The **Expense Reimbursement System** is a full‑stack web application designed to streamline employee expense submissions and approvals with a secure, auditable, and AI‑assisted workflow. The system supports receipt uploads (images and PDFs), multi‑level approvals (Manager → Finance), and optional AI‑based bill verification using Llama via Ollama.

This README consolidates all implementation and testing documentation into a single, practical guide.

## Key Features

*   Role‑based access: **Employee, Manager, Finance, Admin**
*   Secure authentication using JWT
*   Expense submission with receipt upload (JPG, PNG, PDF)
*   Receipt viewer with image/PDF preview
*   Two‑tier approval workflow (Manager verification → Finance verification)
*   AI‑powered bill genuineness analysis (optional)
*   Bill expiration date validation (no DB changes required)
*   Dockerized backend, database, and AI services
*   Modern Next.js frontend

## Tech Stack

### Backend

*   FastAPI (Python)
*   SQLAlchemy ORM
*   MySQL 8.0
*   JWT Authentication
*   OCR: Tesseract
*   PDF Text Extraction: pdfplumber
*   AI : Ollama + Llama models

### Frontend

*   Next.js 13+
*   React 18+
*   Tailwind CSS

### DevOps

*   Docker & Docker Compose
*   Volume‑based receipt storage (/app/bills)

## Project Structure (High Level)

Expense\_Reimbursement\_System/  
├── backend/  
│ ├── app/  
│ │ ├── routes/  
│ │ ├── services/  
│ │ ├── models/  
│ │ ├── schemas/  
│ │ └── utils/  
│ └── Dockerfile  
├── frontend/  
│ ├── app/  
│ │ ├── login/  
│ │ ├── manager-dashboard/  
│ │ ├── finance-dashboard/  
│ │ └── employee-dashboard/  
│ └── package.json  
├── docker-compose.yml  
└── README.md

## Approval & Verification Workflow

1.  **Employee Submits Expense**
    *   Uploads receipt
    *   Status: SUBMITTED
2.  **Manager Review**
    *   Views receipt in modal (image or PDF)
    *   Approves for verification or rejects
    *   Status: MANAGER\_APPROVED\_FOR\_VERIFICATION or MANAGER\_REJECTED
3.  **Finance Review**
    *   Views receipt again
    *   Runs AI bill analysis (optional)
    *   Final decision
    *   Status: FINANCE\_APPROVED or FINANCE\_REJECTED
4.  **Payment (Optional)**
    *   Approved expenses can be marked as PAID

## Receipt Viewer

*   Works for **Managers and Finance users**
*   Supports:
    *   Images (JPG, PNG, GIF)
    *   PDFs (iframe preview)
*   Secure file serving with path validation
*   Download option available

Receipts are stored inside the backend container at:

/app/bills/YYYY/MM/

## AI Bill Verification (Optional)

When enabled, Finance users can analyze receipts using Llama AI.

### AI Capabilities

*   Genuineness score (0–100%)
*   Risk level (LOW / MEDIUM / HIGH)
*   Flaw detection
*   Rejection reasons
*   Recommendation (Approve / Review / Reject)

### Requirements

*   Ollama installed and running
*   Llama model pulled (e.g. llama3.1)

Environment variables:

OLLAMA\_ENABLED=True  
OLLAMA\_URL=http://host.docker.internal:11434  
OLLAMA\_MODEL=llama3.1

## Bill Expiration Validation

*   Implemented fully in backend logic (no DB changes)
*   Rules:
    *   Current or previous month bills → valid until end of next month
    *   Bills older than 2 months → automatically blocked
*   Validation is integrated into AI evaluation flow

## How to Run the Project

### Prerequisites

*   Docker Desktop (Windows / Mac / Linux)
*   Node.js 18+
*   npm 9+

### Step 1: Clone Repository

git clone https://github.com/Sath2003/Expense_Reimbursement_System.git  
cd Expense\_Reimbursement\_System

### Step 2: Start Backend & Database (Docker)

\# Build and start all backend services  
docker-compose up -d --build

Verify containers:

docker ps

Expected containers: - expense\_backend - expense\_db

### Step 3: (Optional) Start Ollama for AI Verification

ollama serve  
ollama pull llama3.1

### Step 4: Run Frontend

cd frontend  
npm install  
npm run dev

Frontend will run at:

http://localhost:3000

## Default Test Credentials

| Role | Email | Password |
| --- | --- | --- |
| Manager | manager@expensehub.com | Manager@123 |
| Finance | finance@expensehub.com | Finance@123 |

## 🔥 Key API Endpoints

## Root Endpoints (from main.py)

*   **GET /** - Returns API information including version and docs URL
*   **GET /health** - Health check endpoint that returns system status

## Authentication Endpoints (/api/auth)

*   **POST /api/auth/register** - Registers a new user and sends OTP for email verification
*   **POST /api/auth/verify-otp** - Verifies OTP code to activate user account
*   **POST /api/auth/login** - Authenticates user with email/password and returns access/refresh tokens
*   **POST /api/auth/refresh-token** - Refreshes access token using refresh token
*   **GET /api/auth/me** - Returns current authenticated user's profile information

## Expense Management Endpoints (/api/expenses)

*   **POST /api/expenses/submit** - Submits a new expense with optional receipt upload and AI validation
*   **GET /api/expenses/{expense\_id}** - Retrieves detailed information for a specific expense
*   **GET /api/expenses/** - Lists expenses (employees see their own, managers/finance see all with optional status filter)
*   **POST /api/expenses/{expense\_id}/extract-amount** - Extracts amount from attached receipt using OCR
*   **PUT /api/expenses/{expense\_id}** - Updates expense details (only if in SUBMITTED status)
*   **DELETE /api/expenses/{expense\_id}** - Deletes an expense
*   **POST /api/expenses/{expense\_id}/upload-bill** - Uploads additional bill/receipt for an expense
*   **DELETE /api/expenses/{expense\_id}/attachment/{attachment\_id}** - Deletes a specific attachment from an expense
*   **GET /api/expenses/{expense\_id}/validate-receipt** - Validates receipt genuineness with detailed risk analysis
*   **GET /api/expenses/receipts/{attachment\_id}** - Returns receipt file information for viewing
*   **GET /api/expenses/file/{file\_path}** - Serves the actual receipt file for download/viewing

## Approval Workflow Endpoints (/api/approvals)

*   **POST /api/approvals/manager/{expense\_id}/approve** - Manager approves an expense with optional comments
*   **POST /api/approvals/manager/{expense\_id}/reject** - Manager rejects an expense with comments
*   **POST /api/approvals/finance/{expense\_id}/approve** - Finance approves and marks expense as paid
*   **POST /api/approvals/finance/{expense\_id}/reject** - Finance rejects an expense
*   **GET /api/approvals/pending-manager** - Lists expenses pending manager approval
*   **GET /api/approvals/{expense\_id}** - Retrieves all approval records for a specific expense
*   **GET /api/approvals/finance/pending** - Lists expenses pending finance verification
*   **POST /api/approvals/finance/{expense\_id}/verify-approve** - Finance approves expense after LLM verification
*   **POST /api/approvals/finance/{expense\_id}/verify-reject** - Finance rejects expense after LLM verification
*   **POST /api/approvals/finance/{expense\_id}/analyze-with-ai** - Analyzes expense bill genuineness using AI

## Analytics Endpoints (/api/analytics)

*   **GET /api/analytics/spending-by-category** - Returns spending breakdown by expense categories
*   **GET /api/analytics/monthly-spending** - Returns monthly spending trends
*   **GET /api/analytics/employee-spending** - Returns spending summary for each employee
*   **GET /api/analytics/expense-status-distribution** - Returns distribution of expenses by status
*   **GET /api/analytics/recent-expenses** - Returns list of most recent expenses

## Finance Dashboard Endpoints (/api/finance)

*   **GET /api/finance/employee-spending** - Returns detailed spending analytics for all employees (Finance role only)


## Useful Docker Commands

\# View logs  
docker logs expense\_backend -f  
  
\# Stop all services  
docker-compose down  
  
\# Stop and remove volumes  
docker-compose down -v

## Troubleshooting

*   **Receipt not loading**: Check /app/bills volume and file permissions
*   **PDF not rendering**: Verify file validity and CORS headers
*   **AI analysis failing**: Ensure Ollama is running and reachable
*   **Port 3306 error**: MySQL already running locally – stop local service

## Documentation Consolidated

This README consolidates the following internal documents: - Receipt Viewer (Implementation & Quick Start) - Bill Preview & AI Verification - Bill Expiration Validation - Verification Workflow

## Status

✅ Backend: Complete & tested  
✅ Frontend: Core dashboards implemented  
✅ Receipt Viewer: Complete  
✅ AI Verification: Integrated & optional

## Final Notes

This project is production‑ready from a backend perspective and suitable for further UI/UX refinement, notification integration, and enterprise policy customization.

For any future enhancements, refer to service‑level documentation inside the backend services/ directory.
