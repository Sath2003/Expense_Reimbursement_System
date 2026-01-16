# Setup script for Manager Approval System (Windows/PowerShell)

Write-Host "================================" -ForegroundColor Cyan
Write-Host "Manager Approval System Setup" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Check if we're in the backend directory
if (-Not (Test-Path "create_manager_user.py")) {
    Write-Host "Error: Please run this script from the backend directory:" -ForegroundColor Red
    Write-Host "cd backend" -ForegroundColor Yellow
    exit 1
}

Write-Host "Creating permanent manager user..." -ForegroundColor Yellow
python create_manager_user.py

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✓ Setup complete!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Manager User Credentials:" -ForegroundColor Cyan
    Write-Host "  Email: manager@expensehub.com" -ForegroundColor White
    Write-Host "  Password: Manager@123" -ForegroundColor White
    Write-Host ""
    Write-Host "Manager can now:" -ForegroundColor Cyan
    Write-Host "  - View all expenses from all employees" -ForegroundColor White
    Write-Host "  - Approve/reject expenses based on bill genuinity" -ForegroundColor White
    Write-Host "  - Filter expenses by status" -ForegroundColor White
    Write-Host "  - See real-time statistics" -ForegroundColor White
    Write-Host ""
} else {
    Write-Host "✗ Setup failed. Please check the error messages above." -ForegroundColor Red
    exit 1
}
