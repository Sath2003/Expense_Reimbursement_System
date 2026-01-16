# 💼 Expense Reimbursement System

---

## 1️⃣ 📖 Overview

The **Expense Reimbursement System** is a production-ready, full-stack web application that streamlines employee expense submissions, policy enforcement, multi-level approvals, and real-time notifications. It features AI-assisted receipt validation, comprehensive audit trails, and role-based access control.

---

## 2️⃣ ✨ Key Features

- 🔐 **Role-based access**: Employee, Manager, Finance, Admin
- 📧 **Email + In-app Notifications**: Real-time alerts for submissions, approvals, rejections
- 📋 **Policy Enforcement**: Grade-wise spending limits with violation tracking
- 🧾 **Smart Receipt Upload**: OCR for images/PDFs with amount extraction
- 🤖 **AI Bill Verification**: Optional Llama-based genuineness analysis
- ✅ **Multi-level Approval**: Manager → Finance workflow with comments
- 📊 **Analytics Dashboard**: Real-time spending insights for finance/HR
- 📄 **Delegation Support**: Managers can delegate approvals during absence
- 💳 **Payment Tracking**: Mark expenses as PAID with reimbursement workflow
- 📱 **Modern UI**: Next.js frontend with Tailwind CSS
- 🐳 **Dockerized**: One-command setup with backend, database, and AI services

---

## 3️⃣ 🛠 Tech Stack

### Backend

- **FastAPI** (Python) with SQLAlchemy ORM
- **MySQL 8.0** with policy tables
- **JWT Authentication** with refresh tokens
- **OCR**: Tesseract + pdfplumber
- **AI**: Ollama + Llama models (optional)
- **Email**: SMTP for notifications

### Frontend

- **Next.js 13+** with React 18+
- **Tailwind CSS** for responsive design
- **Chart.js** for analytics visualizations

### DevOps

- **Docker & Docker Compose**
- **Volume-based receipt storage** (/app/bills)

---

## 4️⃣ 🏗 Project Structure

```
Expense_Reimbursement_System/
├── backend/
│   ├── app/
│   │   ├── routes/          # API endpoints
│   │   ├── services/        # Business logic
│   │   ├── models/          # Database models
│   │   ├── schemas/         # Pydantic schemas
│   │   └── utils/           # Utilities
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
```

---

## 5️⃣ 📄 Workflow

### 1. **Employee Submits Expense**
   - Upload receipt (JPG/PNG/PDF)
   - Policy check (grade limits)
   - Status: `SUBMITTED`
   - ✉️ Manager notified

### 2. **Manager Review**
   - View receipt preview
   - Approve or reject with comments
   - Status: `MANAGER_APPROVED` / `MANAGER_REJECTED`
   - ✉️ Employee notified

### 3. **Finance Review**
   - Verify and approve payment
   - Optional AI analysis
   - Status: `FINANCE_APPROVED` / `FINANCE_REJECTED`
   - ✉️ Employee notified

### 4. **Payment Processing**
   - Mark as `PAID`
   - ✉️ Payment confirmation sent

---

## 6️⃣ 🚀 Quick Start

### Prerequisites

- Docker Desktop
- Node.js 18+
- npm 9+

### 6.1️⃣ Clone & Start Backend

```bash
git clone https://github.com/Sath2003/Expense_Reimbursement_System.git
cd Expense_Reimbursement_System
docker-compose up -d --build
```

### 6.2️⃣ (Optional) Start AI

```bash
ollama serve
ollama pull llama3.1
```

### 6.3️⃣ Run Frontend

```bash
cd frontend
npm install
npm run dev
```

**Access URLs:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

---

## 7️⃣ 👥 Default Users

| Role           | Email                             | Password       | Employee ID |
|----------------|-----------------------------------|----------------|-------------|
| 👨‍💼 Manager     | rajesh.kumar@expensemgmt.com      | Manager@2024   | MGR-001     |
| 💰 Finance     | priya.sharma@expensemgmt.com      | Finance@2024   | FIN-001     |

---

## 8️⃣ 🔗 API Endpoints

### 1️⃣ 🔐 Authentication (`/api/auth`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/register` | Register user + OTP |
| POST | `/verify-otp` | Verify email (OTP) |
| POST | `/login` | Login (JWT) |
| POST | `/password-reset/request` | Request reset OTP |
| POST | `/password-reset/confirm` | Confirm reset |

---

### 2️⃣ 💸 Expenses (`/api/expenses`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/submit` | Submit expense + receipt |
| GET | `/` | List expenses (role filtered) |
| PUT | `/{id}` | Update expense |
| GET | `/receipts/{aid}` | Receipt metadata |
| GET | `/file/{path}` | Download receipt file |

---

### 3️⃣ ✅ Approvals (`/api/approvals`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/pending-manager` | Pending for manager |
| POST | `/manager/{id}/approve` | Manager approve |
| POST | `/manager/{id}/reject` | Manager reject |
| GET | `/finance/pending` | Pending for finance |
| POST | `/finance/{id}/approve` | Finance approve |
| POST | `/finance/{id}/reject` | Finance reject |
| POST | `/finance/{id}/analyze-with-ai` | Analyze bill with AI (Finance) |
| POST | `/finance/{id}/verify-approve` | Finance approve after verification |
| POST | `/finance/{id}/verify-reject` | Finance reject after verification |

---

### 4️⃣ 📊 Analytics (`/api/analytics`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/spending?period=...` | Org spending trends |

---

### 5️⃣ 🏠 System

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| GET | `/api/` | API info (debug page only) |

---

## 🔟 📋 Policy Enforcement

- Grade-wise limits (e.g., Grade A: ₹50,000 travel, ₹2,000 daily food)
- Frequency checks (daily/monthly/per trip)
- Violations stored but submission allowed (configurable)
- Frontend warnings before submission

---

## 1️⃣1️⃣ 🤖 AI Verification (Optional)

### Enable in `docker-compose.yml`:

```yaml
OLLAMA_ENABLED=True
OLLAMA_URL=http://ollama:11434
OLLAMA_MODEL=llama3.1
OLLAMA_STRICT=False
```

### Features:

- Genuineness score (0–100%)
- Risk level (LOW/MEDIUM/HIGH)
- Flaw detection
- Approval recommendation

---

## 1️⃣2️⃣ 📧 Useful Docker Commands

```bash
# View logs
docker logs expense_backend -f

# Stop services
docker-compose down

# Stop + remove volumes
docker-compose down -v

# Rebuild backend
docker-compose up -d --build expense_backend
```

---

## 1️⃣3️⃣ 🛠 Troubleshooting

| Issue                        | Fix                                      |
|------------------------------|------------------------------------------|
| Receipt not loading          | Check /app/bills volume and permissions  |
| PDF not rendering            | Verify file validity and CORS            |
| AI analysis failing          | Ensure Ollama is running and reachable   |
| Port 3306 error              | Stop local MySQL service                 |
| Notifications not sending    | Check SMTP settings in .env              |

---

## 1️⃣4️⃣ 📈 What's New

### ✅ Recently Added

- 📋 Policy Enforcement with grade-wise limits
- 🔔 Notification System (email + in-app)
- 📊 Enhanced Analytics with real-time charts

### 🔜 Coming Next

- 📄 Approval Delegation
- 💳 Payment Workflow

---

## 1️⃣5️⃣ 📄 License

MIT License — see LICENSE file for details.

---

## 1️⃣6️⃣ 🤝 Contributing

1. Fork the repo
2. Create feature branch (`git checkout -b feature/amazing`)
3. Commit (`git commit -m 'Add amazing feature'`)
4. Push (`git push origin feature/amazing`)
5. Open a Pull Request

---

## 1️⃣7️⃣ 📞 Support

For issues or questions:

- 📧 Create an Issue on GitHub
- 💬 Start a Discussion

---

**Happy expensing! 🎉**
=======
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
*   AI (Optional): Ollama + Llama models

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

git clone https://github.com/Sath2003/Expense\_Reimbursement\_System.git  
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
| Employee | employee@expensehub.com | Employee@123 |
| Manager | manager@expensehub.com | Manager@123 |
| Finance | finance@expensehub.com | Finance@123 |

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
>>>>>>> 33c4325 (Changes to readme file)
