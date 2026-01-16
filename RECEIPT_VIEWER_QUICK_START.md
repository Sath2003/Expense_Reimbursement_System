# Receipt Viewer - Quick Start Guide

## System Overview
The receipt viewer allows managers to review employee receipts before approving expenses. The system now supports:
- ✅ Automatic receipt storage in `/app/bills` directory
- ✅ Receipt metadata tracking in database
- ✅ Modal viewer for previewing receipts
- ✅ Download functionality
- ✅ Security checks for authorization

## What Changed

### Backend Updates
1. **Updated `/api/expenses/` endpoint**:
   - Now includes `employee.first_name` and `employee.last_name`
   - Includes complete `attachments` array with file paths
   - Uses eager loading to optimize database queries

2. **Receipt endpoints** (already existing):
   - `GET /api/expenses/receipts/{attachment_id}` - Get receipt metadata
   - `GET /api/expenses/file/{file_path:path}` - Serve receipt file

3. **Schema updates**:
   - `ExpenseResponse` now includes `attachments` array
   - `AttachmentResponse` includes `file_path` field

### Frontend Updates
1. **Manager Dashboard** (`manager-dashboard/page.tsx`):
   - Updated "Review" button to "View Receipt"
   - Added click handler to open receipt viewer modal
   - Added receipt viewer modal at end of component
   - Shows receipt image with filename and timestamp
   - Download button for saving receipts

## How to Test

### 1. Start the Application
```powershell
cd d:\Projects\Expense_Reimbursement_System

# Start Docker containers
docker-compose up -d

# Verify containers are running
docker ps
```

### 2. Login as Manager
- URL: `http://localhost:3000/login`
- Role: **Manager**
- Email: `manager@expensehub.com`
- Password: `Manager@123`
- Expected: Redirect to `/manager-dashboard`

### 3. View Expenses with Receipts
- Manager dashboard shows all employee expenses
- Each expense row has a "View Receipt" button
- Check that each expense shows:
  - Employee name (first_name last_name)
  - Description
  - Amount
  - Status
  - View Receipt button

### 4. Click "View Receipt"
- Click the "View Receipt" button on any expense
- Expected: Modal opens showing:
  - Receipt filename
  - Upload date/time
  - Receipt image/file preview
  - Download button
  - Close button

### 5. Download Receipt
- Click "Download Receipt" button
- Expected: Receipt file downloads to computer
- Filename matches original receipt name

### 6. Close Modal
- Click "Close" button or backdrop
- Expected: Modal closes, returns to dashboard

## Verification Checklist

### Backend
- [ ] No Python syntax errors in `app/routes/expense.py`
- [ ] No Python syntax errors in `app/schemas/expense.py`
- [ ] FastAPI starts without errors
- [ ] `/api/expenses/` endpoint returns expenses with attachments
- [ ] Expenses include `first_name` and `last_name`
- [ ] Attachments array is populated correctly

### Frontend
- [ ] No TypeScript compilation errors
- [ ] Manager dashboard loads successfully
- [ ] "View Receipt" button visible on all expenses
- [ ] Clicking button opens modal
- [ ] Modal displays receipt image correctly
- [ ] Download button works
- [ ] Close button works
- [ ] Modal closes when clicking backdrop

### User Experience
- [ ] Smooth modal opening animation
- [ ] Receipt image scales responsively
- [ ] Filename and timestamp display correctly
- [ ] Download preserves original filename
- [ ] Button styling consistent with app theme
- [ ] Dark theme matches dashboard

## Testing Expenses with Receipts

### Option 1: Use Existing Test Expenses
If you have test expenses from previous testing sessions:
1. Go to manager dashboard
2. Click "View Receipt" on any expense with attachments
3. Verify modal opens and displays receipt

### Option 2: Submit New Expense with Receipt
1. Login as Employee: `employee@expensehub.com` / `Employee@123`
2. Click "Submit Expense"
3. Fill in form:
   - Category: Travel
   - Description: "Test receipt for viewing"
   - Date: Today's date
   - Amount: 500
   - Receipt: Upload an image file (JPG, PNG)
4. Submit expense
5. Logout and login as Manager
6. Navigate to manager dashboard
7. Click "View Receipt" to verify

## Common Issues & Solutions

### Issue: "No receipts available for this expense"
**Cause**: Expense was submitted without a receipt file
**Solution**: Submit a new expense with a receipt attachment

### Issue: Modal doesn't open
**Cause**: JavaScript console error or network issue
**Solution**: 
- Open browser DevTools (F12)
- Check console for errors
- Check network tab for failed API calls
- Verify backend is running

### Issue: Receipt image shows broken
**Cause**: File path incorrect or file missing from `/app/bills`
**Solution**:
- Verify file exists in Docker volume
- Check file permissions
- Restart backend container

### Issue: Download button doesn't work
**Cause**: CORS or file path issue
**Solution**:
- Check browser console for errors
- Verify file can be served from backend
- Check file size limits

## File Locations

### Where Receipts Are Stored
```
In Docker Container:
  /app/bills/2024/01/receipt_12345.jpg
  
On Host Machine (if mounted):
  May vary based on Docker configuration
```

### Where Code Is Located
```
Backend Routes:
  /backend/app/routes/expense.py (lines 345-400)

Frontend Component:
  /frontend/app/manager-dashboard/page.tsx

Database Models:
  /backend/app/models/expense.py
  /backend/app/models/expense_attachment.py

API Schemas:
  /backend/app/schemas/expense.py
```

## API Calls Made

### Get All Expenses (from Manager Dashboard)
```
GET /api/expenses/
Authorization: Bearer <token>
Response: Array of expenses with attachments
```

### Get Receipt Metadata
```
GET /api/expenses/receipts/{attachment_id}
Authorization: Bearer <token>
Response: {
  "attachment_id": 1,
  "filename": "receipt.jpg",
  "file_path": "/api/expenses/file/2024/01/receipt.jpg",
  "uploaded_at": "2024-01-15T10:30:00"
}
```

### Get Receipt File
```
GET /api/expenses/file/2024/01/receipt.jpg
Authorization: Bearer <token>
Response: Binary image/file data
```

## Performance Notes

- **First Load**: May take 1-2 seconds as receipts are fetched
- **Subsequent Loads**: Browser caches images (faster)
- **Large Files**: Very large images may take longer to display
- **Multiple Receipts**: Currently shows first attachment only

## Next Steps (Future Enhancement)

1. Add support for multiple receipts per expense
2. Add OCR to extract text from receipts
3. Add approval/rejection directly from receipt viewer
4. Add receipt annotation tool
5. Add PDF viewer support

## Support

For issues or questions:
1. Check browser console (F12) for errors
2. Check Docker logs: `docker logs <container_name>`
3. Verify all services are running: `docker ps`
4. Check file permissions in `/app/bills`

---

**Quick Test Time**: ~2 minutes
**Full Test Time**: ~5-10 minutes
**Status**: ✅ Ready for Testing
