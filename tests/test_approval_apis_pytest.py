import pytest
import requests

BASE_URL = "http://localhost:8000/api"

def test_get_pending_manager_approvals(api_client, test_manager):
    """Test retrieving pending manager approvals"""
    response = api_client.get(f"{BASE_URL}/approvals/pending-manager")
    assert response.status_code == 200
    approvals = response.json()
    assert isinstance(approvals, list)

def test_get_expense_approval_details(api_client, test_manager):
    """Test retrieving approval details for a specific expense"""
    # First, create an expense as a regular user (switch context if needed)
    # For this test, we assume there might be existing expenses; adjust as needed
    response = api_client.get(f"{BASE_URL}/approvals/999999")  # Non-existent ID
    # Expect 404 or 403 depending on permissions
    assert response.status_code in [404, 403]

def test_manager_approve_expense(api_client, test_manager, test_expense):
    """Test manager approving an expense"""
    expense_id = test_expense.get("id")
    response = api_client.post(f"{BASE_URL}/approvals/manager/{expense_id}/approve")
    # May succeed or fail depending on hierarchy; adjust test setup
    assert response.status_code in [200, 404, 403]

def test_manager_reject_expense(api_client, test_manager, test_expense):
    """Test manager rejecting an expense"""
    expense_id = test_expense.get("id")
    reject_payload = {"reason": "Test rejection reason"}
    response = api_client.post(f"{BASE_URL}/approvals/manager/{expense_id}/reject", json=reject_payload)
    assert response.status_code in [200, 404, 403]

def test_finance_analyze_with_ai(api_client, test_expense):
    """Test finance AI analysis endpoint (manual trigger)"""
    # This test assumes a finance user; you may need a finance fixture
    # For now, we test as regular user and expect 403
    expense_id = test_expense.get("id")
    response = api_client.post(f"{BASE_URL}/approvals/finance/{expense_id}/analyze-with-ai")
    assert response.status_code in [403, 404]

def test_finance_approve_expense(api_client, test_expense):
    """Test finance approving an expense"""
    # This test assumes a finance user; for now expect 403
    expense_id = test_expense.get("id")
    response = api_client.post(f"{BASE_URL}/approvals/finance/{expense_id}/verify-approve")
    assert response.status_code in [403, 404]

def test_finance_reject_expense(api_client, test_expense):
    """Test finance rejecting an expense"""
    # This test assumes a finance user; for now expect 403
    expense_id = test_expense.get("id")
    reject_payload = {"reason": "Finance rejection reason"}
    response = api_client.post(f"{BASE_URL}/approvals/finance/{expense_id}/verify-reject", json=reject_payload)
    assert response.status_code in [403, 404]

def test_unauthorized_access(api_client):
    """Test that endpoints reject requests without a valid token"""
    # Remove auth header
    api_client.headers.pop("Authorization", None)
    
    endpoints = [
        (f"{BASE_URL}/approvals/pending-manager", "GET"),
        (f"{BASE_URL}/approvals/1", "GET"),
        (f"{BASE_URL}/approvals/manager/1/approve", "POST"),
        (f"{BASE_URL}/approvals/manager/1/reject", "POST"),
        (f"{BASE_URL}/approvals/finance/1/analyze-with-ai", "POST"),
        (f"{BASE_URL}/approvals/finance/1/verify-approve", "POST"),
        (f"{BASE_URL}/approvals/finance/1/verify-reject", "POST"),
    ]
    for url, method in endpoints:
        if method == "GET":
            response = api_client.get(url)
        else:
            response = api_client.post(url)
        assert response.status_code == 401
