# Approval APIs Test Script
# This script tests all approval endpoints

$BASE_URL = "http://localhost:8000"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Testing Expense Reimbursement APIs" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Test 1: Health Check
Write-Host "TEST 1: Health Check" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$BASE_URL/health" -Method GET -ErrorAction Stop
    Write-Host "✓ Status: $($response.StatusCode)" -ForegroundColor Green
    Write-Host "✓ Response: $($response.Content)" -ForegroundColor Green
} catch {
    Write-Host "✗ Failed: $_" -ForegroundColor Red
}
Write-Host ""

# Test 2: Register a user
Write-Host "TEST 2: Register User" -ForegroundColor Yellow
try {
    $user = @{
        email = "testuser@example.com"
        password = "TestPassword123"
        first_name = "Test"
        last_name = "User"
        phone_number = "1234567890"
        designation = "Manager"
        department = "Finance"
        manager_id = $null
    } | ConvertTo-Json
    
    $response = Invoke-WebRequest -Uri "$BASE_URL/api/auth/register" -Method POST `
        -ContentType "application/json" `
        -Body $user -ErrorAction Stop
    
    Write-Host "✓ Status: $($response.StatusCode)" -ForegroundColor Green
    Write-Host "✓ Response: $($response.Content)" -ForegroundColor Green
    $userId = ($response.Content | ConvertFrom-Json).user_id
    Write-Host "✓ User ID: $userId" -ForegroundColor Green
} catch {
    Write-Host "✗ Failed: $_" -ForegroundColor Red
}
Write-Host ""

# Test 3: Login
Write-Host "TEST 3: Login User" -ForegroundColor Yellow
try {
    $login = @{
        email = "testuser@example.com"
        password = "TestPassword123"
    } | ConvertTo-Json
    
    $response = Invoke-WebRequest -Uri "$BASE_URL/api/auth/login" -Method POST `
        -ContentType "application/json" `
        -Body $login -ErrorAction Stop
    
    Write-Host "✓ Status: $($response.StatusCode)" -ForegroundColor Green
    $token = ($response.Content | ConvertFrom-Json).access_token
    Write-Host "✓ Token obtained" -ForegroundColor Green
    
    # Store token for later use
    $global:token = $token
    $global:headers = @{ Authorization = "Bearer $token" }
} catch {
    Write-Host "✗ Failed: $_" -ForegroundColor Red
}
Write-Host ""

# Test 4: Create an Expense
Write-Host "TEST 4: Create Expense" -ForegroundColor Yellow
try {
    $expense = @{
        category = "Travel"
        amount = "150.00"
        description = "Business trip"
        date = "2026-01-09"
    } | ConvertTo-Json
    
    $response = Invoke-WebRequest -Uri "$BASE_URL/api/expenses" -Method POST `
        -ContentType "application/json" `
        -Body $expense `
        -Headers $global:headers -ErrorAction Stop
    
    Write-Host "✓ Status: $($response.StatusCode)" -ForegroundColor Green
    Write-Host "✓ Response: $($response.Content)" -ForegroundColor Green
    $expenseId = ($response.Content | ConvertFrom-Json).id
    Write-Host "✓ Expense ID: $expenseId" -ForegroundColor Green
    
    # Store for later use
    $global:expenseId = $expenseId
} catch {
    Write-Host "✗ Failed: $_" -ForegroundColor Red
}
Write-Host ""

# Test 5: Submit for Manager Approval
Write-Host "TEST 5: Submit for Manager Approval" -ForegroundColor Yellow
if ($global:expenseId) {
    try {
        $response = Invoke-WebRequest -Uri "$BASE_URL/api/expenses/$($global:expenseId)/submit-manager-approval" `
            -Method POST `
            -ContentType "application/json" `
            -Headers $global:headers -ErrorAction Stop
        
        Write-Host "✓ Status: $($response.StatusCode)" -ForegroundColor Green
        Write-Host "✓ Response: $($response.Content)" -ForegroundColor Green
    } catch {
        Write-Host "✗ Failed: $_" -ForegroundColor Red
    }
}
Write-Host ""

# Test 6: Get Pending Manager Approvals
Write-Host "TEST 6: Get Pending Manager Approvals" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$BASE_URL/api/approvals/pending-manager" -Method GET `
        -Headers $global:headers -ErrorAction Stop
    
    Write-Host "✓ Status: $($response.StatusCode)" -ForegroundColor Green
    Write-Host "✓ Response: $($response.Content)" -ForegroundColor Green
} catch {
    Write-Host "✗ Failed: $_" -ForegroundColor Red
}
Write-Host ""

# Test 7: Manager Approve Expense
Write-Host "TEST 7: Manager Approve Expense" -ForegroundColor Yellow
if ($global:expenseId) {
    try {
        $approval = @{
            comments = "Looks good!"
        } | ConvertTo-Json
        
        $response = Invoke-WebRequest -Uri "$BASE_URL/api/approvals/manager/$($global:expenseId)/approve" `
            -Method POST `
            -ContentType "application/json" `
            -Body $approval `
            -Headers $global:headers -ErrorAction Stop
        
        Write-Host "✓ Status: $($response.StatusCode)" -ForegroundColor Green
        Write-Host "✓ Response: $($response.Content)" -ForegroundColor Green
    } catch {
        Write-Host "✗ Failed: $_" -ForegroundColor Red
    }
}
Write-Host ""

# Test 8: Get Expense Approvals
Write-Host "TEST 8: Get Expense Approvals" -ForegroundColor Yellow
if ($global:expenseId) {
    try {
        $response = Invoke-WebRequest -Uri "$BASE_URL/api/approvals/$($global:expenseId)" -Method GET `
            -Headers $global:headers -ErrorAction Stop
        
        Write-Host "✓ Status: $($response.StatusCode)" -ForegroundColor Green
        Write-Host "✓ Response: $($response.Content)" -ForegroundColor Green
    } catch {
        Write-Host "✗ Failed: $_" -ForegroundColor Red
    }
}
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "API Testing Complete!" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
