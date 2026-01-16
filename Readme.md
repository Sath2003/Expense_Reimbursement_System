Expense Reimbursement System
Overview

The Expense Reimbursement System is a full-stack web application designed to streamline employee expense submissions and approvals with a secure, auditable, and AI-assisted workflow.

The system supports:

Receipt uploads (images and PDFs)

Multi-level approvals (Manager → Finance)

Optional AI-based bill verification using Llama via Ollama

This README consolidates all implementation and testing documentation into a single, practical guide.

Key Features

Role-based access control

Employee

Manager

Finance

Admin

Secure authentication using JWT

Expense submission with receipt upload (JPG, PNG, PDF)

Receipt viewer with image & PDF preview

Two-tier approval workflow

Manager verification

Finance verification

AI-powered bill genuineness analysis (optional)

Bill expiration date validation (no database changes required)

Fully Dockerized

Backend

Database

AI services

Modern frontend built with Next.js

Tech Stack
Backend

FastAPI (Python)

SQLAlchemy ORM

MySQL 8.0

JWT Authentication

OCR: Tesseract

PDF Text Extraction: pdfplumber

AI (Optional): Ollama + Llama models

Frontend

Next.js 13+

React 18+

Tailwind CSS

DevOps

Docker & Docker Compose

Volume-based receipt storage

/app/bills

Project Structure (High Level)
Expense_Reimbursement_System/
├── backend/
│   ├── app/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── models/
│   │   ├── schemas/
│   │   └── utils/
│   └── Dockerfile
├── frontend/
│   ├── app/
│   │   ├── login/
│   │   ├── manager-dashboard/
│   │   ├── finance-dashboard/
│   │   └── employee-dashboard/
│   └── package.json
├── docker-compose.yml
└── README.md

Approval & Verification Workflow
1. Employee Submits Expense

Uploads receipt

Status: SUBMITTED

2. Manager Review

Views receipt in modal (image or PDF)

Approves for verification or rejects

Status:

MANAGER_APPROVED_FOR_VERIFICATION

MANAGER_REJECTED

3. Finance Review

Views receipt again

Runs AI bill analysis (optional)

Final decision

Status:

FINANCE_APPROVED

FINANCE_REJECTED

4. Payment (Optional)

Approved expenses can be marked as PAID

Receipt Viewer

Available for Manager and Finance roles

Supports:

Images: JPG, PNG, GIF

PDFs: iframe preview

Secure file serving with path validation

Download option available

Receipt storage location:

/app/bills/YYYY/MM/

AI Bill Verification (Optional)

When enabled, Finance users can analyze receipts using Llama AI.

AI Capabilities

Genuineness score (0–100%)

Risk level: LOW / MEDIUM / HIGH

Flaw detection

Rejection reasons

Recommendation:

Approve

Review

Reject

Requirements

Ollama installed and running

Llama model pulled (e.g. llama3.1)

Environment Variables
OLLAMA_ENABLED=True
OLLAMA_URL=http://host.docker.internal:11434
OLLAMA_MODEL=llama3.1

Bill Expiration Validation

Fully implemented in backend logic

No database schema changes

Rules:

Current or previous month bills → valid until end of next month

Bills older than 2 months → automatically blocked

Integrated into the AI evaluation flow

How to Run the Project
Prerequisites

Docker Desktop (Windows / Mac / Linux)

Node.js 18+

npm 9+

Step 1: Clone the Repository
git clone https://github.com/Sath2003/Expense_Reimbursement_System.git
cd Expense_Reimbursement_System

Step 2: Start Backend & Database (Docker)
docker-compose up -d --build


Verify running containers:

docker ps


Expected containers:

expense_backend

expense_db

Step 3: (Optional) Start Ollama for AI Verification
ollama serve
ollama pull llama3.1

Step 4: Run Frontend
cd frontend
npm install
npm run dev


Frontend URL:

http://localhost:3000

Default Test Credentials
Role	Email	Password
Employee	employee@expensehub.com
	Employee@123
Manager	manager@expensehub.com
	Manager@123
Finance	finance@expensehub.com
	Finance@123
Useful Docker Commands
# View backend logs
docker logs expense_backend -f

# Stop all services
docker-compose down

# Stop services and remove volumes
docker-compose down -v

Troubleshooting

Receipt not loading

Check /app/bills volume and file permissions

PDF not rendering

Verify file validity and CORS headers

AI analysis failing

Ensure Ollama is running and reachable

Port 3306 error

MySQL already running locally → stop local MySQL service

Documentation Consolidated

This README consolidates:

Receipt Viewer (Implementation & Quick Start)

Bill Preview & AI Verification

Bill Expiration Validation

Verification Workflow

Status

✅ Backend: Complete & tested

✅ Frontend: Core dashboards implemented

✅ Receipt Viewer: Complete

✅ AI Verification: Integrated & optional

Final Notes

This project is production-ready from a backend perspective and suitable for:

UI/UX refinement

Notification integration

Enterprise-level policy customization

For future enhancements, refer to service-level documentation inside the backend services/ directory.
