# ClaimFlow — Smart Expense Management

ClaimFlow is a full-stack expense management platform that helps employees submit expense claims, managers review and approve team expenses, and finance teams process payments and monitor budgets.

The application also includes AI-assisted receipt extraction and intelligent duplicate-claim detection to reduce manual work and prevent duplicate payments.

---
Frontend:
https://vsptechverse-claim-flow.vercel.app

Backend API:
https://claimflow-zct0.onrender.com

GitHub Repository:
https://github.com/BEHARAPRADEEPKUMAR/ClaimFlow

🔐 Demo Login Credentials

All demo accounts use the following password:

Password: Demo@123

👨‍💻 Employees
Employee	Email	Password
Rahul Reddy	rahul.reddy@claimflow.demo	Demo@123
Sneha Iyer	sneha.iyer@claimflow.demo	Demo@123
Karthik Rao	karthik.rao@claimflow.demo	Demo@123
Ananya Nair	ananya.nair@claimflow.demo	Demo@123
Meera Kapoor	meera.kapoor@claimflow.demo	Demo@123
Aditya Verma	aditya.verma@claimflow.demo	Demo@123
Neha Patel	neha.patel@claimflow.demo	Demo@123
Sanjay Kumar	sanjay.kumar@claimflow.demo	Demo@123
👨‍💼 Managers
Manager	Email	Password
Arjun Mehta	arjun.mehta@claimflow.demo	Demo@123
Kavya Reddy	kavya.reddy@claimflow.demo	Demo@123
Rohit Sharma	rohit.sharma@claimflow.demo	Demo@123
💰 Finance
Finance User	Email	Password
Priya Sharma	priya.finance@claimflow.demo	Demo@123
Vikram Singh	vikram.finance@claimflow.demo	Demo@123

## 🚀 Features

### Employee

- Secure JWT login
- Create expense claims
- Upload mandatory bills/receipts
- Supported receipt formats:
  - JPG
  - JPEG
  - PNG
  - PDF
- Paste messy receipt text
- AI-assisted receipt information extraction
- Edit extracted information before submission
- Track claim status
- View submitted claims
- Detect possible duplicate receipts

### Manager

- Manager dashboard
- View team expense claims
- Review employee claims
- Preview uploaded bills
- Start claim review
- Approve claims
- Reject claims with comments
- Create and track personal expense claims
- Managers cannot approve their own claims

### Finance

- Finance dashboard
- Review manager claims
- Approve/reject manager claims
- View approved claims ready for payment
- Process payments
- Payment reference generation
- Payment history
- Budget monitoring
- Monthly spending analytics
- Duplicate-payment protection

### Smart Features

- AI receipt extraction
- Fallback receipt parser
- Duplicate receipt detection
- Similarity-based duplicate matching
- Budget utilization tracking
- Payment protection
- Role-based authorization
- Paid claim immutability
- Audit logging

---

## 🏗️ Architecture

```text
                    ┌─────────────────────┐
                    │      React/Vite     │
                    │      Frontend       │
                    └──────────┬──────────┘
                               │
                         REST API / JWT
                               │
                    ┌──────────▼──────────┐
                    │    Django + DRF     │
                    │       Backend       │
                    └──────────┬──────────┘
                               │
          ┌────────────────────┼────────────────────┐
          │                    │                    │
          ▼                    ▼                    ▼
    ┌───────────┐       ┌─────────────┐      ┌────────────┐
    │ Accounts  │       │   Claims    │      │ Approvals  │
    └───────────┘       └─────────────┘      └────────────┘
                               │
                     ┌─────────┴─────────┐
                     ▼                   ▼
              Duplicate Detection   AI Extraction
                     │                   │
                     └─────────┬─────────┘
                               ▼
                       ┌──────────────┐
                       │ PostgreSQL   │
                       └──────────────┘




🛠️ Tech Stack
Frontend
React.js
Vite
Tailwind CSS
React Router
Axios
Lucide React
Recharts
Framer Motion
Sonner
Backend
Python
Django
Django REST Framework
Simple JWT
PostgreSQL
Pillow
Requests
python-decouple
django-cors-headers
AI
OpenAI API
Fallback rule-based receipt extraction
Development Tools
Git
GitHub
VS Code
Postman
👥 User Roles
Employee

Employees can:

Create claims
Upload bills
Extract receipt information
Edit extracted information
Submit claims
Track claim status

Workflow:

Draft
  ↓
Submitted
  ↓
Manager Review
  ↓
Approved / Rejected
  ↓
Finance Payment
  ↓
Paid
Manager

Managers can:

View their team's claims
Review employee claims
Approve employee claims
Reject employee claims
Submit their own claims

Manager claims follow a different approval workflow:

Manager Claim
     ↓
Submitted
     ↓
Finance Review
     ↓
Approved / Rejected
     ↓
Payment
     ↓
Paid
Finance

Finance users can:

Review manager claims
Approve/reject manager claims
View ready-to-pay claims
Process payments
Monitor budgets
View analytics
Review payment history
🧠 AI Receipt Extraction

Users can paste unstructured receipt text such as:

uber trip
hyderabad
date 12/08/2026
fare ₹485
paid by card
office travel

ClaimFlow extracts:

Merchant: Uber
Amount: ₹485
Date: 12/08/2026
Category: Taxi
Description: Office travel

The extracted values remain editable so the employee can verify the information before submission.

AI strategy

The application first attempts to use the OpenAI API.

If an API key is unavailable or the AI request fails, ClaimFlow uses a local fallback parser based on:

Regular expressions
Known merchant matching
Category keyword detection
Amount detection
Date detection

This makes the demo usable even without an external AI API.

🔍 Duplicate Receipt Detection

ClaimFlow does not rely only on exact receipt text matching.

A claim is compared against previous non-rejected claims from the same employee using:

Amount similarity
Merchant similarity
Receipt-text similarity
Description similarity
Expense date

The date is intentionally not required to match because the same receipt can potentially be submitted again weeks later.

Example:

Claim 1

Merchant: Uber
Amount: ₹485
Receipt:
Uber trip Hyderabad
12 Aug 2026
Fare Rs. 485

Another claim:

Claim 2

Merchant: Uber Technologies
Amount: ₹485
Receipt:
Uber ride - Hyderabad
24 Aug 2026
Total INR 485

Even though the wording and dates differ, the system can identify the second claim as a possible duplicate.

💳 Payment Protection

Finance can only pay claims that are:

APPROVED

The system prevents:

Paying rejected claims
Paying submitted claims
Paying under-review claims
Paying duplicate claims
Paying the same claim twice

Once a claim becomes:

PAID

its important business fields cannot be modified.

This protects the financial audit trail.

💰 Budget Management

Each employee can have a monthly spending limit.

ClaimFlow calculates:

Total Spent
Remaining Budget
Budget Utilization %

Example:

Monthly Limit: ₹30,000
Spent:         ₹28,750
Remaining:     ₹1,250
Utilization:   95.8%

The dashboard highlights employees approaching or exceeding their monthly limits.

🗄️ Database Models

Main models include:

User
ExpenseClaim
Approval
Payment
MonthlyBudget
AuditLog
ExpenseClaim

Stores:

Employee
Category
Merchant
Amount
Expense date
Description
Receipt text
Receipt file
Status
AI extraction information
Duplicate information
Submission timestamp
Approval timestamp
Payment timestamp
Approval

Stores:

Claim
Reviewer
Action
Comment
Timestamp
Payment

Stores:

Claim
Payment reference
Amount
Payment date
Payment status
Finance user
🔐 Security and Business Rules

ClaimFlow implements role-based access control.

Employee

Can access:

Own claims only
Manager

Can access:

Team claims
Own claims
Finance

Can access:

Finance workflows
Manager claims
Payments
Analytics
Budgets

Additional rules:

Employees cannot approve claims
Managers cannot approve their own claims
Managers can approve only claims belonging to their team
Manager claims require Finance approval
Only Finance can process payments
Bills are mandatory
Unsupported file formats are rejected
Bills larger than 5 MB are rejected
Paid claims cannot be modified
Duplicate claims are blocked from payment
📁 Project Structure
ClaimFlow/
│
├── backend/
│   ├── config/
│   ├── accounts/
│   ├── claims/
│   ├── approvals/
│   ├── payments/
│   ├── analytics/
│   ├── media/
│   ├── manage.py
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── context/
│   │   ├── services/
│   │   ├── hooks/
│   │   └── utils/
│   ├── package.json
│   └── vite.config.js
│
├── README.md
└── .gitignore
🔌 Important API Endpoints
Authentication
POST /api/auth/login/
GET  /api/auth/me/
Claims
GET  /api/claims/
POST /api/claims/
GET  /api/claims/<id>/
POST /api/claims/<id>/submit/
POST /api/claims/extract-receipt/
Approvals
GET  /api/approvals/
POST /api/approvals/<id>/review/
POST /api/approvals/<id>/approve/
POST /api/approvals/<id>/reject/
Finance
GET  /api/finance/dashboard/
GET  /api/finance/ready-to-pay/
GET  /api/finance/
POST /api/finance/<id>/pay/
Analytics
GET /api/analytics/
⚙️ Local Setup
1. Clone repository
git clone <YOUR_GITHUB_REPOSITORY_URL>
cd ClaimFlow
2. Backend setup
cd backend
python -m venv .venv
Windows
.venv\Scripts\activate

Install dependencies:

pip install -r requirements.txt

Create .env:

DEBUG=True
SECRET_KEY=your-secret-key
ALLOWED_HOSTS=127.0.0.1,localhost

CORS_ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173

DATABASE_URL=
OPENAI_API_KEY=

Run migrations:

python manage.py makemigrations
python manage.py migrate

Create demo data:

python manage.py seed_data

Run server:

python manage.py runserver

Backend:

http://127.0.0.1:8000/
3. Frontend Setup

Open another terminal:

cd frontend
npm install

Create .env:

VITE_API_BASE_URL=http://127.0.0.1:8000/api

Run:

npm run dev

Frontend:

http://localhost:5173
👤 Demo Accounts

All seeded demo users use:

Password: Demo@123

Example employee:

Email: rahul.reddy@claimflow.demo
Password: Demo@123

Example manager:

Email: arjun.mehta@claimflow.demo
Password: Demo@123

Example finance user:

Email: priya.sharma@claimflow.demo
Password: Demo@123
🧪 Demo Data

The project includes realistic seeded data covering:

Employee claims
Manager claims
Paid claims
Approved claims
Rejected claims
Claims under review
Duplicate claims
Different receipt wording
Different receipt dates
Budget-limit scenarios
Payment records
Audit logs

The seed command creates a complete demonstration environment.

🎨 UI / UX

ClaimFlow follows a modern fintech SaaS design approach.

Design principles:

Clean white interface
Soft slate backgrounds
Rounded cards
Subtle shadows
Clear status badges
Responsive layouts
Role-based navigation
Desktop sidebar
Mobile navigation drawer
Responsive tables
Receipt previews
Minimal animations

The interface is designed to make financial workflows easy to understand without unnecessary complexity.

🤖 AI Tools Used During Development

AI-assisted development was used for:

Architecture planning
Debugging
Code review
API design
UI component development
Receipt extraction design
Duplicate detection logic
README documentation

All application logic was reviewed and integrated into the project workflow.

🧩 Key Design Decisions
1. Django REST Framework

Chosen because it provides:

Strong Python ecosystem
Clear REST API architecture
Authentication support
ORM
Admin interface
Fast development
2. React + Vite

Chosen for:

Fast development
Component-based UI
Easy API integration
Responsive dashboard development
3. PostgreSQL

Chosen as the production relational database because the application contains strongly related entities such as:

Users
Claims
Approvals
Payments
Budgets
Audit Logs
4. Service Layer

Business rules such as approval and payment logic are separated into services instead of putting everything inside API views.

This improves:

Maintainability
Testability
Readability
Business-rule enforcement
🚀 Deployment

Recommended deployment architecture:

                Users
                  │
                  ▼
          ┌──────────────┐
          │    Vercel    │
          │ React/Vite   │
          └──────┬───────┘
                 │
                 │ HTTPS REST API
                 ▼
          ┌──────────────┐
          │ Render /     │
          │ Railway      │
          │ Django API   │
          └──────┬───────┘
                 │
                 ▼
          ┌──────────────┐
          │ PostgreSQL   │
          └──────────────┘

Production environment variables should be configured through the hosting provider rather than committed to Git.

🔮 Future Improvements

Possible production improvements include:

OCR for image/PDF receipts
Vision-based receipt extraction
Cloud object storage for receipts
Email notifications
Real payment gateway integration
Advanced fraud detection
More sophisticated semantic duplicate detection
Automated monthly finance reports
Export reports to Excel/PDF
Fine-grained permissions
Automated tests and CI/CD
Kubernetes/container deployment
Advanced audit and compliance reporting
