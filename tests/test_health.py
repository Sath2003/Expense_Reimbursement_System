import pytest
import requests

HEALTH_URL = "http://localhost:8000/health"

def test_health_check():
    """Test that the backend health endpoint returns 200"""
    response = requests.get(HEALTH_URL, timeout=5)
    assert response.status_code == 200
    data = response.json()
    assert "status" in data or "message" in data  # Adjust based on your health endpoint response
