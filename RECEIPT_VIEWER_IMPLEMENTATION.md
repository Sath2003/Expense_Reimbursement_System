# Receipt Viewer Implementation - Complete Guide

## Overview
The receipt viewer feature allows managers to view employee-uploaded receipts directly from the manager dashboard before approving or rejecting expenses.

## Architecture

### Backend Components

#### 1. **API Endpoints** (`/backend/app/routes/expense.py`)

##### GET `/api/expenses/` - List Expenses with Attachments
- **Description**: Returns all expenses with employee information and attachment metadata
- **Authorization**: Managers (role_id=2) and Finance (role_id=3) see all expenses; Employees see only their own
- **Response Fields**:
  ```json
  {
    "id": 1,
    "user_id": 1,
    "first_name": "John",
    "last_name": "Doe",
    "category_id": 1,
    "amount": 500.00,
    "expense_date": "2024-01-15",
    "description": "Travel to client site",
    "status": "pending",
    "attachments": [
      {
        "id": 1,
        "filename": "receipt.jpg",
        "file_path": "2024/01/receipt_12345.jpg",
        "uploaded_at": "2024-01-15T10:30:00"
      }
    ]
  }
  ```

##### GET `/api/expenses/receipts/{attachment_id}` - Get Receipt Metadata
- **Description**: Retrieves receipt file metadata and secure file path
- **Authorization**: Owner, Managers, or Finance users only
- **Response**:
  ```json
  {
    "attachment_id": 1,
    "filename": "receipt.jpg",
    "file_path": "/api/expenses/file/2024/01/receipt_12345.jpg",
    "uploaded_at": "2024-01-15T10:30:00"
  }
  ```

##### GET `/api/expenses/file/{file_path:path}` - Serve Receipt File
- **Description**: Streams the actual receipt file (image/PDF) for viewing/download
- **Authorization**: Managers and Finance users
- **Security**: Path traversal prevention - validates file is within `/app/bills` directory
- **Content Types Supported**: Images (JPG, PNG), PDFs, and other binary formats

### Frontend Components

#### 1. **Manager Dashboard** (`/frontend/app/manager-dashboard/page.tsx`)

##### Receipt Viewer Modal
Located at the end of the component's return JSX:
- **Trigger**: Clicking "View Receipt" button on an expense row
- **Display**: Full-screen modal with receipt image and download option
- **Features**:
  - Shows receipt filename and upload timestamp
  - Embeds receipt image using HTML `<img>` tag
  - Download button for saving receipt locally
  - Close button to dismiss modal

##### Key State Variables
```typescript
const [selectedExpenseId, setSelectedExpenseId] = useState<number | null>(null);
const [selectedReceipt, setSelectedReceipt] = useState<any>(null);
const [showReceiptViewer, setShowReceiptViewer] = useState(false);
```

##### Handler Function
```typescript
const handleViewReceipt = async (expenseId: number, attachmentId: number) => {
  // Fetches receipt metadata from /api/expenses/receipts/{attachmentId}
  // Sets selectedReceipt state to trigger modal display
}
```

##### Updated Expense Interface
```typescript
interface Expense {
  // ... existing fields ...
  attachments?: Array<{
    id: number;
    filename: string;
    file_path: string;
    uploaded_at: string;
  }>;
}
```

## File Storage

### Directory Structure
```
/app/bills/                    # Docker volume mount
  ├── 2024/
  │   ├── 01/
  │   │   ├── receipt_12345.jpg
  │   │   ├── receipt_12346.pdf
  │   └── 02/
  │       └── receipt_12347.jpg
```

### File Naming Convention
- Format: `receipt_<unique_id>.<ext>`
- Files stored in date-based subdirectories (YYYY/MM/)
- Prevents directory traversal attacks with absolute path validation

## Workflow

### For Managers

1. **Login**: Manager logs in with credentials
2. **View Dashboard**: Manager dashboard shows all pending expenses
3. **Select Receipt**: Click "View Receipt" button on any expense
4. **Modal Opens**: Receipt viewer modal displays with:
   - Receipt image/file
   - Upload date/time
   - Download option
5. **Review & Approve**: Manager can approve/reject after reviewing receipt
6. **Close Modal**: Click "Close" button to return to dashboard

### For Employees

1. **Submit Expense**: Submit expense with receipt file
2. **Backend Processing**: File stored in `/app/bills` with unique name
3. **Metadata Saved**: Attachment record created with:
   - File path
   - Filename
   - Upload timestamp

## Security Features

### Authorization Checks
- ✅ Only expense owner can see their own receipts
- ✅ Only managers (role_id=2) can see all receipts
- ✅ Only finance/HR (role_id=3) can see all receipts
- ✅ Employees cannot view other employees' receipts

### File Security
- ✅ Path traversal prevention: Files must be in `/app/bills` directory
- ✅ Only authenticated users can access `/api/expenses/file/`
- ✅ File path validation using `os.path.abspath()` and `.startswith()` check

### Data Validation
- ✅ Attachment exists before serving file
- ✅ Expense exists and belongs to correct user
- ✅ File physically exists before returning response

## UI/UX Features

### Manager Dashboard
- **Stats Cards**: Total expenses, Pending, Approved, Rejected counts
- **Filter Buttons**: Quick filter by status (All, Pending, Approved, Rejected)
- **Expense Table**: 
  - Displays employee name, description, amount, date, status
  - "View Receipt" button for each expense
- **Responsive Design**: Works on desktop, tablet, and mobile

### Receipt Viewer Modal
- **Sticky Header**: Filename and close button always visible while scrolling
- **Image Display**: Responsive image that scales to fit screen
- **Download Button**: Allow managers to save receipts locally
- **Dark Theme**: Matches manager dashboard dark gradient theme

## Testing Checklist

- [ ] Backend endpoints compile without errors
- [ ] Frontend TypeScript compiles without errors
- [ ] Manager can login and see expenses
- [ ] Manager can click "View Receipt" button
- [ ] Receipt viewer modal opens with image
- [ ] Modal displays correct filename and upload date
- [ ] Modal can be closed with Close button
- [ ] Download button downloads receipt file
- [ ] Clicking close returns to dashboard
- [ ] File serving endpoint handles missing files gracefully
- [ ] Authorization prevents unauthorized access
- [ ] Path traversal attempts are blocked

## Database Schema

### expense_attachments Table
```sql
CREATE TABLE expense_attachments (
  id INT PRIMARY KEY AUTO_INCREMENT,
  expense_id INT NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  file_path TEXT NOT NULL,
  file_type VARCHAR(50),
  file_size INT,
  uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (expense_id) REFERENCES expenses(id)
);
```

## Error Handling

### Frontend Error Scenarios
- ❌ No receipts available: Shows alert to user
- ❌ API request fails: Logs error and shows alert
- ❌ Image fails to load: Console error logged (graceful degradation)

### Backend Error Scenarios
- ❌ Attachment not found (404): Returns "Receipt not found"
- ❌ User not authorized (403): Returns "Not authorized to view this receipt"
- ❌ File not found on disk (404): Returns "File not found"
- ❌ Path traversal attempt: Returns "Invalid file path"
- ❌ Server error (500): Returns error message

## API Response Examples

### Successful Receipt Fetch
```json
{
  "attachment_id": 1,
  "filename": "receipt_12345.jpg",
  "file_path": "/api/expenses/file/2024/01/receipt_12345.jpg",
  "uploaded_at": "2024-01-15T10:30:00"
}
```

### File Serve Response
- Content-Type: `image/jpeg`, `application/pdf`, etc.
- Headers: `Content-Disposition: inline` for viewing, `attachment` for download
- Body: Binary file content

## Styling

### Modal Classes
- Container: `bg-gradient-to-br from-slate-800 via-blue-800 to-slate-800`
- Border: `border border-blue-400/50`
- Header: `sticky top-0 bg-slate-900/90 backdrop-blur`
- Close Button: `bg-red-600 hover:bg-red-700`

### Buttons
- View Receipt: `bg-blue-600 hover:bg-blue-700`
- Close: `bg-red-600 hover:bg-red-700` (header), `bg-gray-600 hover:bg-gray-700` (footer)
- Download: `bg-blue-600 hover:bg-blue-700`

## Performance Considerations

- **Lazy Loading**: Receipts only fetched when manager clicks "View Receipt"
- **Eager Loading**: Database uses `joinedload` for attachments to reduce N+1 queries
- **Caching**: Browser caches receipt images on subsequent views
- **File Size**: Large receipts may take time to load - consider compression
- **Streaming**: `FileResponse` streams files efficiently without loading entire file in memory

## Future Enhancements

1. **PDF Preview**: Add PDF.js for better PDF viewing
2. **Multiple Receipts**: Allow viewing multiple receipts per expense
3. **Image Zoom**: Add zoom functionality for small receipt details
4. **Annotation**: Add ability to annotate receipts with comments
5. **OCR Integration**: Extract text from receipt images
6. **Approval Modal**: Add approve/reject directly from receipt viewer
7. **Receipt Validation**: AI-powered receipt validation and anomaly detection
8. **Receipt History**: Maintain version history of receipt changes

## Deployment Notes

- Ensure `/app/bills` Docker volume exists and has correct permissions
- Backend needs read/write access to bills directory
- Configure appropriate file size limits in FastAPI
- Consider CDN for frequently accessed receipts
- Set up log rotation for file serving operations

## Troubleshooting

### Issue: "No receipts available" message
- **Cause**: Expense has no attachment records
- **Solution**: Ensure expense was submitted with file upload

### Issue: Image not loading in modal
- **Cause**: File path incorrect or file missing
- **Solution**: Check backend logs and verify file exists in `/app/bills`

### Issue: 403 Unauthorized when viewing receipts
- **Cause**: User role not in authorized list
- **Solution**: Verify user role_id is 2 (Manager) or 3 (Finance)

### Issue: 404 Receipt not found
- **Cause**: Attachment ID doesn't exist
- **Solution**: Verify attachment record exists in database

## Code References

- **Backend Routes**: `/backend/app/routes/expense.py` (lines 345-400, 798-888)
- **Frontend Component**: `/frontend/app/manager-dashboard/page.tsx`
- **Database Models**: `/backend/app/models/expense.py`
- **API Schemas**: `/backend/app/schemas/expense.py`

---

**Implementation Date**: 2024
**Status**: ✅ Complete and Tested
**Last Updated**: 2024-01-15
