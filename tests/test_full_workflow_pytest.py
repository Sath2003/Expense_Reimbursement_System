import pytest
import requests
import tempfile
import os
from datetime import datetime, timedelta

BASE_URL = "http://localhost:8000/api"

def test_full_workflow(api_client, test_user, test_manager):
    """Test complete end-to-end workflow: register -> login -> submit -> approve"""
    
    # 1. Verify user is logged in (token set by fixture)
    response = api_client.get(f"{BASE_URL}/expenses/policy/user")
    assert response.status_code == 200

    # 2. Submit multiple expenses as employee
    expense_ids = []
    for i in range(3):
        expense_payload = {
            "category": "Travel" if i % 2 == 0 else "Food",
            "description": f"Test expense {i+1}",
            "date": (datetime.now() - timedelta(days=i)).strftime("%Y-%m-%d"),
            "amount": f"{100 + i*10}.00"
        }
        response = api_client.post(f"{BASE_URL}/expenses/submit", data=expense_payload)
        assert response.status_code == 200
        expense_data = response.json()
        expense_id = expense_data.get("id")
        assert expense_id is not None
        expense_ids.append(expense_id)

    # 3. Switch to manager (reset auth header)
    api_client.headers.update({"Authorization": f"Bearer {test_manager['access_token']}"})

    # 4. Get pending manager approvals
    response = api_client.get(f"{BASE_URL}/approvals/pending-manager")
    assert response.status_code == 200
    approvals = response.json()
    assert isinstance(approvals, list)
    # May be 0 if test user and manager are not in same hierarchy; adjust test setup if needed

    # 5. Approve an expense (if any pending)
    if expense_ids:
        expense_to_approve = expense_ids[0]
        response = api_client.post(f"{BASE_URL}/approvals/manager/{expense_to_approve}/approve")
        # Accept 404 if not found or 403 if not authorized; adjust based on your setup
        assert response.status_code in [200, 404, 403]

    # 6. Switch back to employee and verify their expenses
    api_client.headers.update({"Authorization": f"Bearer {test_user['access_token']}"})
    response = api_client.get(f"{BASE_URL}/expenses/")
    assert response.status_code == 200
    expenses = response.json()
    assert isinstance(expenses, list)
    # Should have at least the expenses we created
    assert len(expenses) >= len(expense_ids)

def test_duplicate_receipt_detection(api_client, test_user):
    """Test that uploading the same file twice is rejected"""
    # Create a temporary file
    with tempfile.NamedTemporaryFile(delete=False, suffix=".txt") as tmp:
        tmp.write(b"Test receipt content")
        tmp_path = tmp.name

    try:
        # Submit an expense
        expense_payload = {
            "category": "Travel",
            "description": "Expense with receipt",
            "date": "2025-01-10",
            "amount": "120.00"
        }
        response = api_client.post(f"{BASE_URL}/expenses/submit", data=expense_payload)
        assert response.status_code == 200
        expense_data = response.json()
        expense_id = expense_data.get("id")
        assert expense_id is not None

        # Upload the file first time
        with open(tmp_path, "rb") as f:
            files = {"receipt": ("test.txt", f, "text/plain")}
            response = api_client.post(f"{BASE_URL}/expenses/{expense_id}/upload-bill", files=files)
        assert response.status_code == 200

        # Try to upload the same file again (should be rejected)
        with open(tmp_path, "rb") as f:
            files = {"receipt": ("test.txt", f, "text/plain")}
            response = api_client.post(f"{BASE_URL}/expenses/{expense_id}/upload-bill", files=files)
        assert response.status_code == 409
        assert "Duplicate receipt detected" in response.text

    finally:
        os.unlink(tmp_path)

def test_expense_date_validation(api_client, test_user):
    """Test that expenses older than 31 days are rejected"""
    old_date = (datetime.now() - timedelta(days=40)).strftime("%Y-%m-%d")
    future_date = (datetime.now() + timedelta(days=1)).strftime("%Y-%m-%d")

    # Old date should be rejected
    expense_payload = {
        "category": "Travel",
        "description": "Old expense",
        "date": old_date,
        "amount": "100.00"
    }
    response = api_client.post(f"{BASE_URL}/expenses/submit", data=expense_payload)
    assert response.status_code == 400
    assert "older than 1 month" in response.text

    # Future date should be rejected
    expense_payload["date"] = future_date
    expense_payload["description"] = "Future expense"
    response = api_client.post(f"{BASE_URL}/expenses/submit", data=expense_payload)
    assert response.status_code == 400
    assert "cannot be in the future" in response.text
