Expense Reimbursement System
Overview
The Expense Reimbursement System is a full‑stack web application designed to streamline employee expense submissions and approvals with a secure, auditable, and AI‑assisted workflow. The system supports receipt uploads (images and PDFs), multi‑level approvals (Manager → Finance), and optional AI‑based bill verification using Llama via Ollama.
This README consolidates all implementation and testing documentation into a single, practical guide.
________________________________________
Key Features
•	Role‑based access: Employee, Manager, Finance, Admin
•	Secure authentication using JWT
•	Expense submission with receipt upload (JPG, PNG, PDF)
•	Receipt viewer with image/PDF preview
•	Two‑tier approval workflow (Manager verification → Finance verification)
•	AI‑powered bill genuineness analysis (optional)
•	Bill expiration date validation (no DB changes required)
•	Dockerized backend, database, and AI services
•	Modern Next.js frontend
________________________________________
Tech Stack
Backend
•	FastAPI (Python)
•	SQLAlchemy ORM
•	MySQL 8.0
•	JWT Authentication
•	OCR: Tesseract
•	PDF Text Extraction: pdfplumber
•	AI (Optional): Ollama + Llama models
Frontend
•	Next.js 13+
•	React 18+
•	Tailwind CSS
DevOps
•	Docker & Docker Compose
•	Volume‑based receipt storage (/app/bills)
________________________________________
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
________________________________________
Approval & Verification Workflow
1.	Employee Submits Expense
o	Uploads receipt
o	Status: SUBMITTED
2.	Manager Review
o	Views receipt in modal (image or PDF)
o	Approves for verification or rejects
o	Status: MANAGER_APPROVED_FOR_VERIFICATION or MANAGER_REJECTED
3.	Finance Review
o	Views receipt again
o	Runs AI bill analysis (optional)
o	Final decision
o	Status: FINANCE_APPROVED or FINANCE_REJECTED
4.	Payment (Optional)
o	Approved expenses can be marked as PAID
________________________________________
Receipt Viewer
•	Works for Managers and Finance users
•	Supports:
o	Images (JPG, PNG, GIF)
o	PDFs (iframe preview)
•	Secure file serving with path validation
•	Download option available
Receipts are stored inside the backend container at:
/app/bills/YYYY/MM/
________________________________________
AI Bill Verification (Optional)
When enabled, Finance users can analyze receipts using Llama AI.
AI Capabilities
•	Genuineness score (0–100%)
•	Risk level (LOW / MEDIUM / HIGH)
•	Flaw detection
•	Rejection reasons
•	Recommendation (Approve / Review / Reject)
Requirements
•	Ollama installed and running
•	Llama model pulled (e.g. llama3.1)
Environment variables:
OLLAMA_ENABLED=True
OLLAMA_URL=http://host.docker.internal:11434
OLLAMA_MODEL=llama3.1
________________________________________
Bill Expiration Validation
•	Implemented fully in backend logic (no DB changes)
•	Rules:
o	Current or previous month bills → valid until end of next month
o	Bills older than 2 months → automatically blocked
•	Validation is integrated into AI evaluation flow
________________________________________
How to Run the Project
Prerequisites
•	Docker Desktop (Windows / Mac / Linux)
•	Node.js 18+
•	npm 9+
________________________________________
Step 1: Clone Repository
git clone https://github.com/Sath2003/Expense_Reimbursement_System.git
cd Expense_Reimbursement_System
________________________________________
Step 2: Start Backend & Database (Docker)
# Build and start all backend services
docker-compose up -d --build
Verify containers:
docker ps
Expected containers: - expense_backend - expense_db
________________________________________
Step 3: (Optional) Start Ollama for AI Verification
ollama serve
ollama pull llama3.1
________________________________________
Step 4: Run Frontend
cd frontend
npm install
npm run dev
Frontend will run at:
http://localhost:3000
________________________________________
Default Test Credentials
Role	Email	Password
Employee	employee@expensehub.com	Employee@123
Manager	manager@expensehub.com	Manager@123
Finance	finance@expensehub.com	Finance@123
________________________________________
Useful Docker Commands
# View logs
docker logs expense_backend -f

# Stop all services
docker-compose down

# Stop and remove volumes
docker-compose down -v
________________________________________
Troubleshooting
•	Receipt not loading: Check /app/bills volume and file permissions
•	PDF not rendering: Verify file validity and CORS headers
•	AI analysis failing: Ensure Ollama is running and reachable
•	Port 3306 error: MySQL already running locally – stop local service
________________________________________
Documentation Consolidated
This README consolidates the following internal documents: - Receipt Viewer (Implementation & Quick Start) - Bill Preview & AI Verification - Bill Expiration Validation - Verification Workflow
________________________________________
Status
✅ Backend: Complete & tested
✅ Frontend: Core dashboards implemented
✅ Receipt Viewer: Complete
✅ AI Verification: Integrated & optional
________________________________________
Final Notes
This project is production‑ready from a backend perspective and suitable for further UI/UX refinement, notification integration, and enterprise policy customization.
For any future enhancements, refer to service‑level documentation inside the backend services/ directory.
