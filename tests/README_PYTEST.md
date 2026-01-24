# Pytest Test Suite

## Overview
This directory now contains pytest-based integration tests for the Expense Reimbursement System.

## Files
- `conftest.py` — Shared fixtures (test user, manager, expense, backend health check)
- `test_health.py` — Basic health endpoint test
- `test_full_workflow_pytest.py` — End-to-end workflow (submit, approve, duplicate detection, date validation)
- `test_file_upload_pytest.py` — File upload tests (types, size limits, multiple files, unsupported types)
- `test_approval_apis_pytest.py` — Approval API tests (manager/finance actions, unauthorized access)
- `pytest.ini` — Pytest configuration
- `requirements.txt` — Test dependencies

## Running Tests

### Install dependencies
```bash
pip install -r tests/requirements.txt
```

### Run all tests
```bash
pytest tests/
```

### Run with verbose output
```bash
pytest -v tests/
```

### Run specific test file
```bash
pytest tests/test_full_workflow_pytest.py
```

### Run with markers (if added)
```bash
pytest -m "not slow" tests/
```

### Generate HTML report
```bash
pip install pytest-html
pytest --html=report.html tests/
```

## Key Features
- **Fixtures**: Automatic user creation, login, and cleanup
- **Parametrization**: Test multiple file types in one function
- **Assertions**: Clear `assert` statements with meaningful failures
- **Session-scoped**: Reuse auth tokens across tests for speed
- **Skip**: Automatically skip if backend is not running

## Expected Output
- `.` for passed tests
- `F` for failures with detailed traceback
- `s` for skipped tests (e.g., backend down)

Example:
```
============================= test session starts ==============================
collected 12 items

test_health.py .                                                        [ 8%]
test_full_workflow_pytest.py ...                                        [33%]
test_file_upload_pytest.py .......                                       [91%]
test_approval_apis_pytest.py .                                           [100%]

============================== 12 passed in 3.45s ==============================
```

## Notes
- Tests clean up temporary files but leave users/expenses in DB for audit
- Adjust OTP handling in `conftest.py` if your test setup differs
- Some tests expect 403/404 due to hierarchy; adapt if your setup uses different permissions
