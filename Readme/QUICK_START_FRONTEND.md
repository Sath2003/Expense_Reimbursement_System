# Quick Start Guide - Frontend Features

## 🚀 Get Running in 3 Steps

### Step 1: Start Backend
```bash
cd d:\Projects\Expense_Reimbursement_System
docker-compose up -d
```

### Step 2: Start Frontend
```bash
cd frontend
npm install
npm run dev
```

### Step 3: Access Application
```
Browser: http://localhost:3000
```

---

## 📱 Feature Demonstrations

### Demo 1: Submit Expense with Camera
```
1. Login at http://localhost:3000/login
2. Navigate to Home → Submit Expense
3. Fill form:
   - Category: Travel
   - Amount: $150.00
   - Description: Client meeting transportation
4. Click "Submit Expense"
5. Click "📸 Capture with Camera"
6. Allow camera permission
7. Click "📸 Capture" button
8. Preview and confirm
```

### Demo 2: View Analytics
```
1. Login with Manager account
2. Navigate to Home → Analytics & Reports
3. View Top Spenders table
4. Toggle periods: Week → Month → Quarter → Year
5. Observe:
   - Employee ranking
   - Department breakdown
   - Spending distribution
   - Category percentages
```

### Demo 3: Complete Workflow
```
1. Employee: Submit Expense (with camera photo)
2. Manager: View pending approvals
3. Manager: Click approve/reject
4. System: Updates status automatically
5. HR: View analytics for insights
```

---

## 🎨 New Pages Created

| Page | URL | Role | Features |
|------|-----|------|----------|
| Submit Expense | `/submit-expense` | All | Form + Camera + File Upload |
| Analytics | `/analytics` | HR/Manager/Finance | Charts + Tables + Metrics |
| Home | `/home` | All | Dashboard + Quick Stats |

---

## 📸 Camera Feature

### How It Works:
1. User clicks "📸 Capture with Camera"
2. Modal opens with live video feed
3. User can toggle front/rear camera
4. Click "📸 Capture" to take photo
5. File automatically created as PNG
6. Ready for upload

### Browser Requirements:
- Chrome/Edge 59+
- Firefox 55+
- Safari 11+
- Must use HTTPS (or localhost for testing)

### Error Handling:
- Permission denied → Shows friendly message
- Device not found → Falls back to file upload
- Camera in use → Shows appropriate error

---

## 📊 Analytics Dashboard

### What You Can See:
- **Top 10 Spenders** ranked by total amount
- **Category Breakdown** with percentage distribution
- **Key Metrics:** Total, Average, Submissions, Active Employees
- **Visual Charts:** Bar chart for top spenders, Pie chart for categories

### Time Periods:
- **Week:** Current week (Mon-Sun)
- **Month:** Current calendar month
- **Quarter:** Current 3-month quarter
- **Year:** Current calendar year

### Who Can Access:
- HR Admins ✅
- Managers ✅
- Finance Team ✅
- Regular Employees ❌

---

## 🔐 Authentication Flow

```
1. Register → Email verification (OTP)
2. Login → JWT token received
3. Token stored in localStorage
4. All API calls include token in Authorization header
5. Logout → Token removed
```

### Token Locations:
- LocalStorage key: `token`
- Header: `Authorization: Bearer {token}`

---

## 📂 File Upload Support

### Supported Formats:
- **Images:** JPG, JPEG, PNG, GIF, BMP, WebP
- **Documents:** PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX
- **Data:** TXT, CSV

### Upload Limits:
- Single file: 10MB max
- Multiple files: Upload one at a time
- File types validated on client and server
- SHA-256 integrity check on backend

---

## 🛣️ Navigation Map

```
Login
  ↓
Home (Dashboard)
  ├── Submit Expense
  │   ├── Camera Capture
  │   └── File Upload
  ├── My Expenses
  ├── Analytics & Reports (Manager/HR only)
  │   ├── Top Spenders Table
  │   ├── Category Charts
  │   └── Period Selector
  ├── Manager Approvals (Manager only)
  └── Settings
```

---

## 🔧 API Integration Points

### Frontend → Backend Communication:

```typescript
// Example: Submit Expense
POST /api/expenses/submit
Headers: Authorization: Bearer {token}
Body: {
  category_id: 1,
  amount: 150.00,
  description: "...",
  expense_date: "2024-01-31"
}

// Example: Upload File
POST /api/expenses/{id}/upload-bill
Headers: Authorization: Bearer {token}
Body: FormData with file

// Example: Get Analytics
GET /api/analytics/spending?period=month
Headers: Authorization: Bearer {token}
```

---

## 📈 Unique Features Highlights

### 1️⃣ Camera Integration
- Direct device camera access
- No separate app required
- Instant photo capture
- Perfect for mobile users

### 2️⃣ Analytics Dashboard
- See top spenders instantly
- Visual spending distribution
- Period-based comparisons
- Role-based access control

### 3️⃣ Professional UI
- Modern card-based layout
- Responsive design
- Gradient backgrounds
- Smooth animations

---

## 🐛 Troubleshooting

### Issue: Camera Not Working
**Solution:**
1. Check if localhost (OK for testing)
2. Check if HTTPS in production
3. Allow browser permission
4. Try different browser
5. Check browser version is recent

### Issue: Analytics Shows No Data
**Solution:**
1. Verify user role (HR/Manager/Finance)
2. Ensure expenses are approved
3. Check date range matches submissions
4. Reload page
5. Check browser console for errors

### Issue: File Upload Fails
**Solution:**
1. Check file size < 10MB
2. Check file type is supported
3. Ensure expense submitted first
4. Check authentication token
5. Verify network connection

### Issue: Cannot Access Analytics
**Solution:**
1. Verify you're Manager, HR, or Finance
2. Check you're logged in
3. Try refreshing page
4. Clear browser cache
5. Check backend is running

---

## 📋 Testing Checklist

- [ ] Can register new account
- [ ] Can verify OTP via email
- [ ] Can login successfully
- [ ] Can submit expense with camera
- [ ] Can submit expense with file upload
- [ ] Can view analytics (if Manager/HR)
- [ ] Can toggle time periods
- [ ] Can see top spenders table
- [ ] Can see category charts
- [ ] Can approve/reject expenses (if Manager)
- [ ] Can logout successfully

---

## 💡 Tips & Tricks

### For Better Camera Experience:
- Use good lighting
- Hold phone steady for 2 seconds
- Aim for center of receipt
- Capture one side at a time
- Don't use Flash

### For Analytics:
- Start with "Month" view for overview
- Drill down to "Week" for details
- Use "Quarter" for trend analysis
- Compare "Year" for annual planning

### For Approvals:
- Manager approves first
- Finance approves after
- Can add comments in rejection
- Rejected expenses return to employee

---

## 🎓 Learning Resources

### Frontend Code:
- See `FRONTEND_FEATURES_COMPLETE.md` for full documentation
- Components in `frontend/components/`
- Pages in `frontend/*/page.tsx`

### Backend Code:
- See `backend/README.md` for API details
- Endpoints in `backend/app/routes/`
- Database in `backend/app/models/`

### Database:
- See `data/README.md` for schema
- Tables defined in `app/models/`

---

## 📞 Support

### Common Questions:

**Q: Why can't I use camera in production?**
A: Browser requires HTTPS. Use a valid SSL certificate.

**Q: How do I see other employees' expenses?**
A: Only HR/Managers can see analytics. Regular employees see only their own.

**Q: Can I export the analytics data?**
A: Not yet - this is in roadmap. Currently view only.

**Q: How long is the JWT token valid?**
A: 30 days (configurable in backend/app/config.py)

**Q: Can I upload multiple files at once?**
A: Not in bulk - upload one file at a time currently.

---

## 🎉 Congratulations!

You now have a **fully-functional professional expense management system** with:
- ✅ User authentication & verification
- ✅ Expense submission with camera
- ✅ Multi-level approval workflow
- ✅ Analytics dashboard
- ✅ File upload with validation
- ✅ Role-based access control

**Happy expensing! 💰**
