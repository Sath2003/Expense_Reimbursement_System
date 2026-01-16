#!/bin/bash
# Setup script for Manager Approval System

echo "================================"
echo "Manager Approval System Setup"
echo "================================"
echo ""

# Check if we're in the backend directory
if [ ! -f "create_manager_user.py" ]; then
    echo "Please run this script from the backend directory:"
    echo "cd backend"
    exit 1
fi

echo "Creating permanent manager user..."
python create_manager_user.py

if [ $? -eq 0 ]; then
    echo ""
    echo "✓ Setup complete!"
    echo ""
    echo "Manager User Credentials:"
    echo "  Email: manager@expensehub.com"
    echo "  Password: Manager@123"
    echo ""
    echo "Manager can now:"
    echo "  - View all expenses from all employees"
    echo "  - Approve/reject expenses based on bill genuinity"
    echo "  - Filter expenses by status"
    echo "  - See real-time statistics"
    echo ""
else
    echo "✗ Setup failed. Please check the error messages above."
    exit 1
fi
