import pytest
import requests
import tempfile
import os
from datetime import datetime

BASE_URL = "http://localhost:8000/api"

@pytest.mark.parametrize("file_name,file_content,mime_type", [
    ("test.pdf", b"%PDF-1.4 fake pdf content", "application/pdf"),
    ("test.png", b"\x89PNG\r\n\x1a\nfake png content", "image/png"),
    ("test.txt", b"Plain text receipt content", "text/plain"),
])
def test_file_upload(api_client, test_user, file_name, file_content, mime_type):
    """Test uploading various file types to an expense"""
    # Create a temporary file
    with tempfile.NamedTemporaryFile(delete=False, suffix=os.path.splitext(file_name)[1]) as tmp:
        tmp.write(file_content)
        tmp_path = tmp.name

    try:
        # Submit an expense
        expense_payload = {
            "category": "Travel",
            "description": f"Expense with {file_name}",
            "date": "2025-01-12",
            "amount": "150.00"
        }
        response = api_client.post(f"{BASE_URL}/expenses/submit", data=expense_payload)
        assert response.status_code == 200
        expense_data = response.json()
        expense_id = expense_data.get("id")
        assert expense_id is not None

        # Upload the file
        with open(tmp_path, "rb") as f:
            files = {"receipt": (file_name, f, mime_type)}
            response = api_client.post(f"{BASE_URL}/expenses/{expense_id}/upload-bill", files=files)
        assert response.status_code == 200
        upload_data = response.json()
        assert upload_data.get("file_name") == file_name
        assert upload_data.get("file_type") == mime_type
        assert upload_data.get("file_hash") is not None

        # Verify attachment appears in expense details
        response = api_client.get(f"{BASE_URL}/expenses/{expense_id}")
        assert response.status_code == 200
        expense_detail = response.json()
        attachments = expense_detail.get("attachments", [])
        assert any(att.get("file_name") == file_name for att in attachments)

    finally:
        os.unlink(tmp_path)

def test_file_size_limit(api_client, test_user):
    """Test that files larger than 10MB are rejected"""
    # Create a large temporary file (>10MB)
    with tempfile.NamedTemporaryFile(delete=False, suffix=".txt") as tmp:
        tmp.write(b"x" * (11 * 1024 * 1024))  # 11MB
        tmp_path = tmp.name

    try:
        # Submit an expense
        expense_payload = {
            "category": "Travel",
            "description": "Expense with large file",
            "date": "2025-01-12",
            "amount": "150.00"
        }
        response = api_client.post(f"{BASE_URL}/expenses/submit", data=expense_payload)
        assert response.status_code == 200
        expense_data = response.json()
        expense_id = expense_data.get("id")
        assert expense_id is not None

        # Attempt to upload large file
        with open(tmp_path, "rb") as f:
            files = {"receipt": ("large.txt", f, "text/plain")}
            response = api_client.post(f"{BASE_URL}/expenses/{expense_id}/upload-bill", files=files)
        assert response.status_code == 413
        assert "File size exceeds 10MB limit" in response.text

    finally:
        os.unlink(tmp_path)

def test_unsupported_file_type(api_client, test_user):
    """Test that unsupported file types are rejected"""
    # Create a temporary file with unsupported extension
    with tempfile.NamedTemporaryFile(delete=False, suffix=".exe") as tmp:
        tmp.write(b"fake executable")
        tmp_path = tmp.name

    try:
        # Submit an expense
        expense_payload = {
            "category": "Travel",
            "description": "Expense with exe file",
            "date": "2025-01-12",
            "amount": "150.00"
        }
        response = api_client.post(f"{BASE_URL}/expenses/submit", data=expense_payload)
        assert response.status_code == 200
        expense_data = response.json()
        expense_id = expense_data.get("id")
        assert expense_id is not None

        # Attempt to upload unsupported file
        with open(tmp_path, "rb") as f:
            files = {"receipt": ("malware.exe", f, "application/octet-stream")}
            response = api_client.post(f"{BASE_URL}/expenses/{expense_id}/upload-bill", files=files)
        assert response.status_code == 400
        assert "File type application/octet-stream is not allowed" in response.text

    finally:
        os.unlink(tmp_path)

def test_multiple_files_same_expense(api_client, test_user):
    """Test uploading multiple files to the same expense"""
    # Submit an expense
    expense_payload = {
        "category": "Travel",
        "description": "Expense with multiple receipts",
        "date": "2025-01-12",
        "amount": "200.00"
    }
    response = api_client.post(f"{BASE_URL}/expenses/submit", data=expense_payload)
    assert response.status_code == 200
    expense_data = response.json()
    expense_id = expense_data.get("id")
    assert expense_id is not None

    # Upload multiple files
    files_uploaded = []
    for i in range(3):
        with tempfile.NamedTemporaryFile(delete=False, suffix=".txt") as tmp:
            tmp.write(f"Receipt content {i}".encode())
            tmp_path = tmp.name

        try:
            with open(tmp_path, "rb") as f:
                files = {"receipt": (f"receipt{i}.txt", f, "text/plain")}
                response = api_client.post(f"{BASE_URL}/expenses/{expense_id}/upload-bill", files=files)
            assert response.status_code == 200
            files_uploaded.append(f"receipt{i}.txt")
        finally:
            os.unlink(tmp_path)

    # Verify all attachments are present
    response = api_client.get(f"{BASE_URL}/expenses/{expense_id}")
    assert response.status_code == 200
    expense_detail = response.json()
    attachments = expense_detail.get("attachments", [])
    assert len(attachments) >= len(files_uploaded)
    for name in files_uploaded:
        assert any(att.get("file_name") == name for att in attachments)
