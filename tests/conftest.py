import pytest
import requests
import random
import string
from datetime import datetime

BASE_URL = "http://localhost:8000/api"
HEALTH_URL = "http://localhost:8000/health"

def generate_random_email():
    timestamp = int(datetime.now().timestamp())
    return f"test{timestamp}{random.randint(1000, 9999)}@example.com"

def generate_random_string(length=8):
    return ''.join(random.choices(string.ascii_lowercase + string.digits, k=length))

@pytest.fixture(scope="session")
def api_client():
    """Session-wide API client"""
    session = requests.Session()
    yield session
    session.close()

@pytest.fixture(scope="session")
def ensure_backend_running():
    """Skip tests if backend is not running"""
    try:
        response = requests.get(HEALTH_URL, timeout=5)
        assert response.status_code == 200, "Backend is not running or unhealthy"
    except requests.RequestException as e:
        pytest.skip(f"Backend not available: {e}")

@pytest.fixture
def test_user(api_client, ensure_backend_running):
    """Create and verify a test user, return user data and token"""
    email = generate_random_email()
    password = generate_random_string()
    employee_id = f"EMP{random.randint(10000, 99999)}"
    
    # Register
    register_payload = {
        "email": email,
        "password": password,
        "first_name": "Test",
        "last_name": "User",
        "employee_id": employee_id,
        "role_id": 1  # Employee
    }
    response = api_client.post(f"{BASE_URL}/auth/register", json=register_payload)
    assert response.status_code == 200
    user_data = response.json()
    user_id = user_data.get("id")
    assert user_id is not None

    # Retrieve OTP from database (simplified for testing)
    # In real tests, you might have a test DB endpoint or use a known OTP
    otp = "123456"  # Assuming test OTP bypass or known value
    
    # Verify OTP
    verify_payload = {"email": email, "otp": otp}
    response = api_client.post(f"{BASE_URL}/auth/verify-otp", json=verify_payload)
    # Allow 400 if OTP already verified; adjust as needed for your test setup

    # Login
    login_payload = {"email": email, "password": password}
    response = api_client.post(f"{BASE_URL}/auth/login", json=login_payload)
    assert response.status_code == 200
    token_data = response.json()
    access_token = token_data.get("access_token")
    assert access_token is not None

    # Set auth header for subsequent requests
    api_client.headers.update({"Authorization": f"Bearer {access_token}"})

    yield {
        "email": email,
        "password": password,
        "employee_id": employee_id,
        "user_id": user_id,
        "access_token": access_token
    }

    # Cleanup: optionally delete user or mark as test
    # For now, we leave users in DB for audit

@pytest.fixture
def test_manager(api_client, ensure_backend_running):
    """Create and verify a test manager, return manager data and token"""
    email = generate_random_email()
    password = generate_random_string()
    employee_id = f"MGR{random.randint(10000, 99999)}"
    
    # Register manager
    register_payload = {
        "email": email,
        "password": password,
        "first_name": "Test",
        "last_name": "Manager",
        "employee_id": employee_id,
        "role_id": 2  # Manager
    }
    response = api_client.post(f"{BASE_URL}/auth/register", json=register_payload)
    assert response.status_code == 200
    user_data = response.json()
    user_id = user_data.get("id")
    assert user_id is not None

    # Verify OTP (test OTP)
    otp = "123456"
    verify_payload = {"email": email, "otp": otp}
    response = api_client.post(f"{BASE_URL}/auth/verify-otp", json=verify_payload)

    # Login
    login_payload = {"email": email, "password": password}
    response = api_client.post(f"{BASE_URL}/auth/login", json=login_payload)
    assert response.status_code == 200
    token_data = response.json()
    access_token = token_data.get("access_token")
    assert access_token is not None

    # Set auth header
    api_client.headers.update({"Authorization": f"Bearer {access_token}"})

    yield {
        "email": email,
        "password": password,
        "employee_id": employee_id,
        "user_id": user_id,
        "access_token": access_token
    }

@pytest.fixture
def test_expense(test_user, api_client):
    """Create a test expense and return its data"""
    expense_payload = {
        "category": "Travel",
        "description": "Test expense for pytest",
        "date": "2025-01-15",
        "amount": "150.00"
    }
    response = api_client.post(f"{BASE_URL}/expenses/submit", data=expense_payload)
    assert response.status_code == 200
    expense_data = response.json()
    expense_id = expense_data.get("id")
    assert expense_id is not None

    yield expense_data

    # Cleanup: optionally delete expense
    # For now, we leave expenses in DB for audit
