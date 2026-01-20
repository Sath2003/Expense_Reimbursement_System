**\# 💼 Expense Reimbursement System**

**\## 📖 Overview**

**The \*\*Expense Reimbursement System\*\* is a production‑ready, full‑stack web application that streamlines employee expense submissions, policy enforcement, multi‑level approvals, and real‑time notifications. It features AI‑assisted receipt validation, comprehensive audit trails, and role‑based access control.**

**\## ✨ Key Features**

**\- 🔐 \*\*Role‑based access\*\*: Employee, Manager, Finance, Admin**

**\- 📧 \*\*Email + In‑app Notifications\*\*: Real‑time alerts for submissions, approvals, rejections**

**\- 📋 \*\*Policy Enforcement\*\*: Grade‑wise spending limits with violation tracking**

**\- 🧾 \*\*Smart Receipt Upload\*\*: OCR for images/PDFs with amount extraction**

**\- 🤖 \*\*AI Bill Verification\*\*: Optional Llama‑based genuineness analysis**

**\- ✅ \*\*Multi‑level Approval\*\*: Manager → Finance workflow with comments**

**\- 📊 \*\*Analytics Dashboard\*\*: Real‑time spending insights for finance/HR**

**\- 🔄 \*\*Delegation Support\*\*: Managers can delegate approvals during absence**

**\- 💳 \*\*Payment Tracking\*\*: Mark expenses as PAID with reimbursement workflow**

**\- 📱 \*\*Modern UI\*\*: Next.js frontend with Tailwind CSS**

**\- 🐳 \*\*Dockerized\*\*: One‑command setup with backend, database, and AI services**

**\## 🛠 Tech Stack**

**\### Backend**

**\- \*\*FastAPI\*\* (Python) with SQLAlchemy ORM**

**\- \*\*MySQL 8.0\*\* with policy tables**

**\- \*\*JWT Authentication\*\* with refresh tokens**

**\- \*\*OCR\*\*: Tesseract + pdfplumber**

**\- \*\*AI\*\*: Ollama + Llama models (optional)**

**\- \*\*Email\*\*: SMTP for notifications**

**\### Frontend**

**\- \*\*Next.js 13+\*\* with React 18+**

**\- \*\*Tailwind CSS\*\* for responsive design**

**\- \*\*Chart.js\*\* for analytics visualizations**

**\### DevOps**

**\- \*\*Docker & Docker Compose\*\***

**\- \*\*Volume‑based receipt storage\*\* (/app/bills)**

**\---**

**\## 🏗 Project Structure**

**Expense\_Reimbursement\_System/ ├── backend/ │ ├── app/ │ │ ├── routes/ # API endpoints │ │ ├── services/ # Business logic │ │ ├── models/ # Database models │ │ ├── schemas/ # Pydantic schemas │ │ └── utils/ # Utilities │ └── Dockerfile ├── frontend/ │ ├── app/ │ │ ├── login/ │ │ ├── manager-dashboard/ │ │ ├── finance-dashboard/ │ │ ├── analytics/ │ │ └── notifications/ │ └── package.json ├── docker-compose.yml └── README.md**

**\---**

**\## 🔄 Workflow**

**1\. \*\*Employee Submits Expense\*\***

**\- Upload receipt (JPG/PNG/PDF)**

**\- Policy check (grade limits)**

**\- Status: \`SUBMITTED\`**

**\- ✉️ Manager notified**

**2\. \*\*Manager Review\*\***

**\- View receipt preview**

**\- Approve or reject with comments**

**\- Status: \`MANAGER\_APPROVED\` / \`MANAGER\_REJECTED\`**

**\- ✉️ Employee notified**

**3\. \*\*Finance Review\*\***

**\- Verify and approve payment**

**\- Optional AI analysis**

**\- Status: \`FINANCE\_APPROVED\` / \`FINANCE\_REJECTED\`**

**\- ✉️ Employee notified**

**4\. \*\*Payment Processing\*\***

**\- Mark as \`PAID\`**

**\- ✉️ Payment confirmation sent**

**\---**

**\## 🚀 Quick Start**

**\### Prerequisites**

**\- Docker Desktop**

**\- Node.js 18+**

**\- npm 9+**

**\### 1. Clone & Start Backend**

**\`\`\`bash**

**git clone \[https://github.com/Sath2003/Expense\_Reimbursement\_System.git\](https://github.com/Sath2003/Expense\_Reimbursement\_System.git)**

**cd Expense\_Reimbursement\_System**

**docker-compose up -d --build**

**2\. (Optional) Start AI**

**bash**

**ollama serve**

**ollama pull llama3.1**

**3\. Run Frontend**

**bash**

**cd frontend**

**npm install**

**npm run dev**

**Frontend: http://localhost:3000**

**Backend API: http://localhost:8000**

**API Docs: http://localhost:8000/docs**

**👥 Default Users**

**Role Email Password Employee ID**

**👨‍💼 Manager rajesh.kumar@expensemgmt.com Manager@2024 MGR-001**

**💰 Finance priya.sharma@expensemgmt.com Finance@2024 FIN-001**

**🔗 API Endpoints**

**🔓 Authentication (/api/auth)**

**POST /register – Register user + OTP**

**POST /verify-otp – Verify email**

**POST /login – Login (JWT)**

**POST /refresh-token – Refresh access token**

**GET /me – Current user profile**

**POST /password-reset/request – Request reset OTP**

**POST /password-reset/confirm – Confirm reset**

**💸 Expenses (/api/expenses)**

**POST /submit – Submit expense + receipt**

**GET /{id} – Get expense details**

**GET / – List expenses (role filtered)**

**PUT /{id} – Update expense**

**DELETE /{id} – Delete expense**

**POST /{id}/upload-bill – Add receipt**

**DELETE /{id}/attachment/{aid} – Remove receipt**

**GET /receipts/{aid} – Receipt metadata**

**GET /file/{path} – Download receipt file**

**📋 Policy (/api/expenses/policy)**

**GET /check?category\_id=&amount=&date= – Check policy compliance**

**GET /user – Get user’s applicable policies**

**✅ Approvals (/api/approvals)**

**POST /manager/{id}/approve – Manager approve**

**POST /manager/{id}/reject – Manager reject**

**POST /finance/{id}/approve – Finance approve**

**POST /finance/{id}/reject – Finance reject**

**GET /pending-manager – Pending for manager**

**GET /finance/pending – Pending for finance**

**GET /{id} – Approval history**

**🔔 Notifications (/api/notifications)**

**GET / – List notifications**

**GET /unread-count – Unread count**

**POST /mark-read – Mark as read**

**POST /mark-all-read – Mark all read**

**📊 Analytics (/api/analytics)**

**GET /spending – Org spending trends**

**GET /spending-by-category – Category breakdown**

**GET /monthly-spending – Monthly trends**

**GET /employee-spending – Per‑employee summary**

**GET /expense-status-distribution – Status distribution**

**GET /recent-expenses – Latest expenses**

**💰 Finance (/api/finance)**

**GET /employee-spending – Detailed analytics (Finance only)**

**GET /stats – Finance dashboard stats**

**🏠 System**

**GET / – API info**

**GET /health – Health check**

**📧 Notification Events**

**Event Trigger Recipient Channel**

**Expense Submitted Employee submits Manager Email + In‑app**

**Expense Approved Manager approves Employee Email + In‑app**

**Expense Rejected Manager/Finance rejects Employee Email + In‑app**

**Payment Processed Finance marks PAID Employee Email + In‑app**

**📋 Policy Enforcement**

**Grade‑wise limits (e.g., Grade A: ₹50,000 travel, ₹2,000 daily food)**

**Frequency checks (daily/monthly/per trip)**

**Violations stored but submission allowed (configurable)**

**Frontend warnings before submission**

**🤖 AI Verification (Optional)**

**Enable in docker-compose.yml:**

**yaml**

**OLLAMA\_ENABLED=True**

**OLLAMA\_URL=http://ollama:11434**

**OLLAMA\_MODEL=llama3.1**

**OLLAMA\_STRICT=False**

**Features:**

**Genuineness score (0–100%)**

**Risk level (LOW/MEDIUM/HIGH)**

**Flaw detection**

**Approval recommendation**

**🔧 Useful Docker Commands**

**bash**

**\# View logs**

**docker logs expense\_backend -f**

**\# Stop services**

**docker-compose down**

**\# Stop + remove volumes**

**docker-compose down -v**

**\# Rebuild backend**

**docker-compose up -d --build expense\_backend**

**🐛 Troubleshooting**

**Issue Fix**

**Receipt not loading Check /app/bills volume and permissions**

**PDF not rendering Verify file validity and CORS**

**AI analysis failing Ensure Ollama is running and reachable**

**Port 3306 error Stop local MySQL service**

**Notifications not sending Check SMTP settings in .env**

**📈 What’s New**

**✅ Recently Added**

**📋 Policy Enforcement with grade‑wise limits**

**🔔 Notification System (email + in‑app)**

**📊 Enhanced Analytics with real‑time charts**

**🔄 Approval Delegation (coming next)**

**💳 Payment Workflow (coming next)**

**📄 License**

**MIT License – see LICENSE file for details.**

**🤝 Contributing**

**Fork the repo**

**Create feature branch (git checkout -b feature/amazing)**

**Commit (git commit -m 'Add amazing feature')**

**Push (git push origin feature/amazing)**

**Open a Pull Request**

**📞 Support**

**For issues or questions:**

**📧 Create an Issue on GitHub**

**💬 Start a Discussion**

**Happy expensing! 🎉**

**Feedback submitted**

**I need everything as a whole code with numberings and partition**

**markdown**

**\# 💼 Expense Reimbursement System**

**\## 1️⃣ 📖 Overview**

**The \*\*Expense Reimbursement System\*\* is a production‑ready, full‑stack web application that streamlines employee expense submissions, policy enforcement, multi‑level approvals, and real‑time notifications. It features AI‑assisted receipt validation, comprehensive audit trails, and role‑based access control.**

**\## 2️⃣ ✨ Key Features**

**\- 🔐 \*\*Role‑based access\*\*: Employee, Manager, Finance, Admin**

**\- 📧 \*\*Email + In‑app Notifications\*\*: Real‑time alerts for submissions, approvals, rejections**

**\- 📋 \*\*Policy Enforcement\*\*: Grade‑wise spending limits with violation tracking**

**\- 🧾 \*\*Smart Receipt Upload\*\*: OCR for images/PDFs with amount extraction**

**\- 🤖 \*\*AI Bill Verification\*\*: Optional Llama‑based genuineness analysis**

**\- ✅ \*\*Multi‑level Approval\*\*: Manager → Finance workflow with comments**

**\- 📊 \*\*Analytics Dashboard\*\*: Real‑time spending insights for finance/HR**

**\- 🔄 \*\*Delegation Support\*\*: Managers can delegate approvals during absence**

**\- 💳 \*\*Payment Tracking\*\*: Mark expenses as PAID with reimbursement workflow**

**\- 📱 \*\*Modern UI\*\*: Next.js frontend with Tailwind CSS**

**\- 🐳 \*\*Dockerized\*\*: One‑command setup with backend, database, and AI services**

**\## 3️⃣ 🛠 Tech Stack**

**\### Backend**

**\- \*\*FastAPI\*\* (Python) with SQLAlchemy ORM**

**\- \*\*MySQL 8.0\*\* with policy tables**

**\- \*\*JWT Authentication\*\* with refresh tokens**

**\- \*\*OCR\*\*: Tesseract + pdfplumber**

**\- \*\*AI\*\*: Ollama + Llama models (optional)**

**\- \*\*Email\*\*: SMTP for notifications**

**\### Frontend**

**\- \*\*Next.js 13+\*\* with React 18+**

**\- \*\*Tailwind CSS\*\* for responsive design**

**\- \*\*Chart.js\*\* for analytics visualizations**

**\### DevOps**

**\- \*\*Docker & Docker Compose\*\***

**\- \*\*Volume‑based receipt storage\*\* (/app/bills)**

**\---**

**\## 4️⃣ 🏗 Project Structure**

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


**\## 5️⃣ 🔄 Workflow**

**1\. \*\*Employee Submits Expense\*\***

**\- Upload receipt (JPG/PNG/PDF)**

**\- Policy check (grade limits)**

**\- Status: \`SUBMITTED\`**

**\- ✉️ Manager notified**

**2\. \*\*Manager Review\*\***

**\- View receipt preview**

**\- Approve or reject with comments**

**\- Status: \`MANAGER\_APPROVED\` / \`MANAGER\_REJECTED\`**

**\- ✉️ Employee notified**

**3\. \*\*Finance Review\*\***

**\- Verify and approve payment**

**\- Optional AI analysis**

**\- Status: \`FINANCE\_APPROVED\` / \`FINANCE\_REJECTED\`**

**\- ✉️ Employee notified**

**4\. \*\*Payment Processing\*\***

**\- Mark as \`PAID\`**

**\- ✉️ Payment confirmation sent**

**\---**

**\## 6️⃣ 🚀 Quick Start**

**\### Prerequisites**

**\- Docker Desktop**

**\- Node.js 18+**

**\- npm 9+**

**\### 6.1️⃣ Clone & Start Backend**

**\`\`\`bash**

**git clone \[https://github.com/Sath2003/Expense\_Reimbursement\_System.git\](https://github.com/Sath2003/Expense\_Reimbursement\_System.git)**

**cd Expense\_Reimbursement\_System**

**docker-compose up -d --build**

**6.2️⃣ (Optional) Start AI**

**bash**

**ollama serve**

**ollama pull llama3.1**

**6.3️⃣ Run Frontend**

**bash**

**cd frontend**

**npm install**

**npm run dev**

**Frontend: http://localhost:3000**

**Backend API: http://localhost:8000**

**API Docs: http://localhost:8000/docs**

**7️⃣ 👥 Default Users**

**Role Email Password Employee ID**

**👨‍💼 Manager rajesh.kumar@expensemgmt.com Manager@2024 MGR-001**

**💰 Finance priya.sharma@expensemgmt.com Finance@2024 FIN-001**

**8️⃣ 🔗 API Endpoints**

**8.1️⃣ 🔓 Authentication (/api/auth)**

**POST /register – Register user + OTP**

**POST /verify-otp – Verify email**

**POST /login – Login (JWT)**

**POST /refresh-token – Refresh access token**

**GET /me – Current user profile**

**POST /password-reset/request – Request reset OTP**

**POST /password-reset/confirm – Confirm reset**

**8.2️⃣ 💸 Expenses (/api/expenses)**

**POST /submit – Submit expense + receipt**

**GET /{id} – Get expense details**

**GET / – List expenses (role filtered)**

**PUT /{id} – Update expense**

**DELETE /{id} – Delete expense**

**POST /{id}/upload-bill – Add receipt**

**DELETE /{id}/attachment/{aid} – Remove receipt**

**GET /receipts/{aid} – Receipt metadata**

**GET /file/{path} – Download receipt file**

**8.3️⃣ 📋 Policy (/api/expenses/policy)**

**GET /check?category\_id=&amount=&date= – Check policy compliance**

**GET /user – Get user’s applicable policies**

**8.4️⃣ ✅ Approvals (/api/approvals)**

**POST /manager/{id}/approve – Manager approve**

**POST /manager/{id}/reject – Manager reject**

**POST /finance/{id}/approve – Finance approve**

**POST /finance/{id}/reject – Finance reject**

**GET /pending-manager – Pending for manager**

**GET /finance/pending – Pending for finance**

**GET /{id} – Approval history**

**8.5️⃣ 🔔 Notifications (/api/notifications)**

**GET / – List notifications**

**GET /unread-count – Unread count**

**POST /mark-read – Mark as read**

**POST /mark-all-read – Mark all read**

**8.6️⃣ 📊 Analytics (/api/analytics)**

**GET /spending – Org spending trends**

**GET /spending-by-category – Category breakdown**

**GET /monthly-spending – Monthly trends**

**GET /employee-spending – Per‑employee summary**

**GET /expense-status-distribution – Status distribution**

**GET /recent-expenses – Latest expenses**

**8.7️⃣ 💰 Finance (/api/finance)**

**GET /employee-spending – Detailed analytics (Finance only)**

**GET /stats – Finance dashboard stats**

**8.8️⃣ 🏠 System**

**GET / – API info**

**GET /health – Health check**

**9️⃣ 📧 Notification Events**

**Event Trigger Recipient Channel**

**Expense Submitted Employee submits Manager Email + In‑app**

**Expense Approved Manager approves Employee Email + In‑app**

**Expense Rejected Manager/Finance rejects Employee Email + In‑app**

**Payment Processed Finance marks PAID Employee Email + In‑app**

**🔟 📋 Policy Enforcement**

**Grade‑wise limits (e.g., Grade A: ₹50,000 travel, ₹2,000 daily food)**

**Frequency checks (daily/monthly/per trip)**

**Violations stored but submission allowed (configurable)**

**Frontend warnings before submission**

**1️⃣1️⃣ 🤖 AI Verification (Optional)**

**Enable in docker-compose.yml:**

**yaml**

**OLLAMA\_ENABLED=True**

**OLLAMA\_URL=http://ollama:11434**

**OLLAMA\_MODEL=llama3.1**

**OLLAMA\_STRICT=False**

**Features:**

**Genuineness score (0–100%)**

**Risk level (LOW/MEDIUM/HIGH)**

**Flaw detection**

**Approval recommendation**

**1️⃣2️⃣ 🔧 Useful Docker Commands**

**bash**

**\# View logs**

**docker logs expense\_backend -f**

**\# Stop services**

**docker-compose down**

**\# Stop + remove volumes**

**docker-compose down -v**

**\# Rebuild backend**

**docker-compose up -d --build expense\_backend**

**1️⃣3️⃣ 🐛 Troubleshooting**

**Issue Fix**

**Receipt not loading Check /app/bills volume and permissions**

**PDF not rendering Verify file validity and CORS**

**AI analysis failing Ensure Ollama is running and reachable**

**Port 3306 error Stop local MySQL service**

**Notifications not sending Check SMTP settings in .env**

**1️⃣4️⃣ 📈 What’s New**

**✅ Recently Added**

**📋 Policy Enforcement with grade‑wise limits**

**🔔 Notification System (email + in‑app)**

**📊 Enhanced Analytics with real‑time charts**

**🔄 Approval Delegation (coming next)**

**💳 Payment Workflow (coming next)**

**1️⃣5️⃣ 📄 License**

**MIT License – see LICENSE file for details.**

**1️⃣6️⃣ 🤝 Contributing**

**Fork the repo**

**Create feature branch (git checkout -b feature/amazing)**

**Commit (git commit -m 'Add amazing feature')**

**Push (git push origin feature/amazing)**

**Open a Pull Request**

**1️⃣7️⃣ 📞 Support**

**For issues or questions:**

**📧 Create an Issue on GitHub**

**💬 Start a Discussion**
