# Testing & Validation

## Overview
This directory contains testing scripts and validation tools for the Expense Reimbursement System.

## Test Files

### 1. `test_full_workflow.py`
**Purpose**: Complete end-to-end workflow testing

**Tests**:
- User registration
- Email verification (OTP)
- User login
- Access token generation
- Expense creation (multiple)
- Manager approval workflow
- Finance approval workflow
- Approval status verification

**Run**:
```bash
python test_full_workflow.py
```

**Expected Output**: ✅ All stages complete with detailed progress

---

### 2. `test_file_upload.py`
**Purpose**: File upload capability validation

**Tests**:
- PDF upload
- Image upload (PNG)
- Text file upload
- Multiple file attachments
- File integrity verification
- Attachment listing

**Supported Formats**:
- Images: JPG, JPEG, PNG, GIF, BMP, WEBP
- Documents: PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX
- Other: TXT, CSV

**Run**:
```bash
python test_file_upload.py
```

**Expected Output**: ✅ 3/3 files uploaded successfully

---

### 3. `test_approval_apis.py`
**Purpose**: Individual approval API endpoint testing

**Tests**:
- Health check
- User registration
- OTP verification
- Login
- Expense creation
- Manager approval endpoints
- Finance approval endpoints

**Run**:
```bash
python test_approval_apis.py
```

---

### 4. `verify_apis.py`
**Purpose**: Quick API availability verification

**Tests**:
- Health endpoint
- Pending approvals endpoint
- Approval details endpoint
- Manager approve endpoint
- Manager reject endpoint
- Finance approve endpoint
- Finance reject endpoint

**Run**:
```bash
python verify_apis.py
```

**Expected Output**: API response codes and availability status

---

### 5. `test_approval_apis.ps1`
**Purpose**: PowerShell script for API testing on Windows

**Tests**: Same as test_approval_apis.py but in PowerShell

**Run**:
```powershell
.\test_approval_apis.ps1
```

---

## Running All Tests

### Sequential Testing
```bash
# Test API availability
python verify_apis.py

# Test file uploads
python test_file_upload.py

# Test complete workflow
python test_full_workflow.py
```

### Required Environment
- Python 3.7+
- `requests` library: `pip install requests`
- Backend running: `http://localhost:8000`
- Database running: `localhost:3307`
- Docker containers up

## Test Results

Each test produces:
- ✅ Success indicators for passed tests
- ✗ Error messages for failed tests
- Detailed API responses
- Execution timing
- Summary reports

## Continuous Integration

### GitHub Actions Example
```yaml
name: API Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-python@v2
      - run: pip install requests
      - run: docker-compose up -d
      - run: python tests/test_approval_apis.py
      - run: python tests/test_file_upload.py
```

## Test Data

Tests use temporary data:
- Random emails for user creation
- Unique expense amounts
- Sample files (PDF, PNG, TXT)
- Test comments and descriptions

**Data Cleanup**: Tests clean up created files but keep database records for auditing.

## Debugging Tests

### Enable Verbose Output
```bash
python -v test_full_workflow.py
```

### Check Backend Logs
```bash
docker logs expense_backend
```

### Check Database
```bash
docker exec expense_db mysql -u expense_user -pexpense_password \
  expense_reimbursement_db -e "SELECT * FROM users ORDER BY id DESC LIMIT 5;"
```

### Manual API Testing

Using curl:
```bash
# Health check
curl http://localhost:8000/health

# List approvals (requires token)
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:8000/api/approvals/pending-manager
```

Using Python:
```python
import requests

response = requests.get('http://localhost:8000/health')
print(response.json())
```

## Test Scenarios

### Happy Path (Successful Workflow)
```
Register → Verify OTP → Login → Create Expense → 
Manager Approve → Finance Approve → Payment
```

### Rejection Path
```
Register → Login → Create Expense → 
Manager Reject → Revise Expense → 
Resubmit → Approve
```

### File Upload Path
```
Create Expense → Upload PDF → Upload Image → 
Upload Document → Verify Attachments
```

## Performance Testing

Add to test suite:
```python
import time

start = time.time()
# API call
end = time.time()
print(f"Response time: {(end-start)*1000:.2f}ms")
```

## Load Testing

Using Apache Bench:
```bash
ab -n 100 -c 10 http://localhost:8000/health
```

Using wrk:
```bash
wrk -t4 -c100 -d30s http://localhost:8000/health
```

## Reporting

Tests generate:
- Console output with results
- API_TEST_REPORT.md with detailed findings
- Execution logs
- Error messages

## Troubleshooting Tests

**Connection Refused**
```bash
# Check if backend is running
curl http://localhost:8000/health

# Restart containers
docker-compose down
docker-compose up -d
```

**Authentication Errors**
- Verify OTP is correct
- Check token expiration
- Ensure user is verified

**File Upload Failures**
- Check file size (max 10MB)
- Verify file format is supported
- Check bills directory permissions

**Database Errors**
- Check MySQL is running
- Verify database credentials
- Check network connectivity

## Best Practices

1. **Run tests in order**: Health → Upload → Workflow
2. **Check logs**: Monitor backend and database logs
3. **Use fresh data**: Each test creates new users
4. **Document failures**: Save error output for debugging
5. **Verify manually**: Double-check via API docs

## Next Steps

- Add unit tests for services
- Add integration tests
- Add UI/E2E tests with Selenium
- Set up CI/CD pipeline
- Add performance benchmarks
- Add load testing suite

---

**Last Updated**: January 2026
