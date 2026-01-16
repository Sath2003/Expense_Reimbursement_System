# Quick Test Guide - Bill Preview & AI Verification

## Prerequisites
- ✅ System running with Docker containers
- ✅ Frontend: `npm run dev` on port 3000
- ✅ Backend: Running on port 8000
- ✅ Ollama: Running with Llama model (optional but recommended for AI features)

## Step 1: Login as Employee & Submit Expense with Receipt

```
1. Go to http://localhost:3000/login
2. Login: employee@expensehub.com / Employee@123
3. Click "Submit Expense"
4. Fill in:
   - Description: "Client Meeting"
   - Amount: 1500
   - Category: Meals & Drinks
   - Date: Today
5. Upload Receipt:
   - Option A: JPG/PNG image of a receipt
   - Option B: PDF file (if available)
6. Click "Submit Expense"
```

## Step 2: Login as Manager & Approve for Verification

```
1. Logout and go to http://localhost:3000/login
2. Login: manager@expensehub.com / Manager@123
3. Go to Manager Dashboard
4. Find the submitted expense
5. Click "Review" button:
   - Should see the receipt/bill preview
   - For images: Shows the image
   - For PDFs: Shows PDF in iframe viewer
6. Click "Approve for Verification" or "Approvals" link
7. Approve the expense
```

## Step 3: Login as Financier & Preview Bill + Run AI Analysis

```
1. Logout and go to http://localhost:3000/login
2. Login: finance@expensehub.com / Finance@123
3. Go to Finance Dashboard (should be default after login)
4. Look for "Pending Finance Review" expenses
5. Click "Review" button:
   - Verify receipt/bill displays correctly
   - Check file type handling (image vs PDF)
6. Click "🤖 Analyze Receipt with AI" button:
   - Wait for analysis (may take 10-30 seconds)
   - Should show AI report with:
     * Genuineness Score (%)
     * Risk Level (LOW/MEDIUM/HIGH)
     * Flaws Detected (if any)
     * Rejection Reasons (if any)
     * Recommendation (APPROVE/REVIEW/REJECT)
7. Based on analysis, click:
   - "✅ Approve Based on Analysis" to proceed with approval
   - "❌ Reject with Reason" if suspicious
```

## Expected Results

### Receipt Preview (Step 2 & 3)
**For Image Files (JPG/PNG)**:
- Receipt displays as image in modal
- Clear, centered display with proper scaling
- Error message if image fails to load

**For PDF Files**:
- PDF displays in iframe viewer
- Can scroll through pages
- Proper PDF rendering

### AI Analysis Report (Step 3)
**If Ollama is RUNNING**:
```
📋 AI BILL GENUINENESS ANALYSIS REPORT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ANALYSIS STATUS
✅ AI Analysis Performed
Model: Llama
Genuineness Score: 95.0%

RISK ASSESSMENT
🎯 Risk Level: LOW
Suspicious Indicators: NO - Appears Genuine

FLAWS DETECTED (0)
✅ No flaws detected

REJECTION REASONS (0)
✅ No rejection reasons found

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

RECOMMENDATION
✅ SAFE TO APPROVE
```

**If Ollama is NOT RUNNING**:
```
⚠️ AI Analysis Unavailable
Model: Llama
Genuineness Score: N/A
Risk Level: UNKNOWN
```

## Test Cases

### Test Case 1: Image Receipt
**Files**: Upload any JPG/PNG receipt image
- ✅ Preview shows in modal
- ✅ AI can extract text via OCR
- ✅ Analysis completes (if Ollama running)

### Test Case 2: PDF Receipt
**Files**: Upload any PDF document
- ✅ Preview shows in iframe
- ✅ AI can extract text from PDF
- ✅ Analysis completes (if Ollama running)

### Test Case 3: Multiple Approvals
**Scenario**: Manager approves, then Finance approves
- ✅ Receipt visible at both stages
- ✅ AI analysis available only for Finance
- ✅ Approval workflow completes

### Test Case 4: AI Analysis with Invalid Bill
**Scenario**: Upload bill with issues (wrong amount, old date)
**Expected**:
- ✅ Genuineness score lower (< 80%)
- ✅ Risk level: MEDIUM or HIGH
- ✅ Flaws detected listed
- ✅ Recommendation suggests review/rejection

## File Locations

### Uploaded Receipts
```
Windows: C:\Users\<username>\AppData\Local\Docker\wsl\data\bills\2024\01\
Linux/Mac: /app/bills/2024/01/
```

### Backend Logs
```bash
# View all logs
docker logs expense_backend

# Follow logs in real-time
docker logs -f expense_backend

# Last 20 lines
docker logs --tail 20 expense_backend
```

### Frontend Errors
- Browser Console: F12 → Console tab
- Network Errors: F12 → Network tab → filter by XHR

## Troubleshooting

### Receipt Image Not Loading
**Problem**: See "Receipt image failed to load" message
**Solution**:
1. Check file was uploaded successfully
2. Verify file path in database
3. Check `/app/bills` directory exists and has permissions
4. Try different image format (JPG, PNG)

### PDF Not Displaying
**Problem**: PDF iframe shows blank
**Solution**:
1. Ensure PDF file is valid (not corrupted)
2. Check CORS headers in FastAPI
3. Test PDF download directly
4. Try smaller PDF file

### AI Analysis Takes Too Long
**Problem**: "Analyzing with AI..." spins for > 1 minute
**Solution**:
1. Check Ollama is running: `ollama serve`
2. Check model is loaded: `ollama list`
3. Verify Ollama API is accessible
4. Check backend logs for errors

### AI Analysis Returns Error
**Problem**: "Failed to analyze bill with AI"
**Solution**:
1. Ensure Ollama is running and configured
2. Check environment variables:
   ```
   OLLAMA_ENABLED=True
   OLLAMA_URL=http://host.docker.internal:11434
   OLLAMA_MODEL=llama3.1
   ```
3. Restart backend container
4. Check `/docker logs expense_backend` for details

## Performance Notes

- **Receipt Preview**: Instant (< 1 second)
- **PDF Rendering**: 1-2 seconds
- **AI Analysis**: 10-30 seconds (depends on PDF size and Ollama)
- **Image OCR**: 5-15 seconds for processing

## Browser Compatibility

| Browser | Status | Notes |
|---------|--------|-------|
| Chrome | ✅ Tested | Best support for PDF iframe |
| Firefox | ✅ Tested | Works well |
| Safari | ⚠️ Limited | May need PDF.js library |
| Edge | ✅ Tested | Chromium-based, works great |

## Sample Test Receipts

If you don't have real receipts, you can create test files:

**Test 1: Valid Receipt Image**
- JPG image with clear receipt details
- Amount clearly visible
- Recent date

**Test 2: PDF Receipt**
- Any PDF document (invoice, receipt, etc.)
- Preferred: Text-based PDF (not scanned image)
- File size < 10MB

**Test 3: Suspicious Receipt**
- Very old date (> 2 months)
- Extremely high amount
- Missing vendor details
- Expected result: Lower genuineness score

## What to Verify

| Item | Expected | Verification |
|------|----------|---------------|
| Receipt Display | Shows image or PDF | ✓ Can see bill preview |
| File Type Detection | Correct rendering | ✓ JPG/PNG as image, PDF in iframe |
| AI Button | Clickable and works | ✓ Analysis completes |
| Analysis Report | Shows scores & reasons | ✓ Report displays correctly |
| Approval Flow | Completes successfully | ✓ Status updated in DB |
| Error Handling | Graceful failures | ✓ Error messages helpful |

## Success Criteria

✅ **Implementation is COMPLETE when**:
1. Financier can see bill preview (images and PDFs)
2. AI analysis button works and returns real Llama analysis
3. Genuineness score displays (0-100%)
4. Risk level shows (LOW/MEDIUM/HIGH)
5. Flaws and rejection reasons listed if found
6. Approval/rejection completes successfully
7. Employees get notified of decision

## Next Steps After Testing

1. **Verify Database**: Check expense_approvals table for records
2. **Check Notifications**: Verify employee gets approval email
3. **Review Logs**: Check backend logs for any errors
4. **Performance**: Monitor response times for 5+ analysis requests
5. **Security**: Verify unauthorized users can't access bills

---

**Ready to test?** Start with Step 1 above!
