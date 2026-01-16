# New Verification Workflow Implementation

## Overview
Implemented a two-tier approval system where Manager verifies receipt compliance and Finance verifies bill genuineness using LLM analysis before final approval.

## Workflow Stages

### 1. Employee Submits Expense
- Status: `SUBMITTED`
- File: Receipt uploaded to `/app/bills`
- Action: Manager Dashboard shows pending expenses

### 2. Manager Review & Verification  
- Status: `MANAGER_APPROVED_FOR_VERIFICATION` or `MANAGER_REJECTED`
- Role: Manager (role_id=2)
- Buttons:
  - **"Approve for Verification"** → Sends to Finance
  - **"Reject"** → Stops process
- Purpose: Verify receipt quality, format, and initial compliance

### 3. Finance Verification with LLM Analysis
- Status: `PENDING_FINANCE_REVIEW`
- Role: Finance/HR (role_id=3)
- Features:
  - View receipt via Receipt Viewer
  - Use LLM Agent to analyze bill genuineness
  - AI checks for:
    - Receipt authenticity
    - Amount consistency
    - Vendor legitimacy
    - Tax compliance
- Buttons:
  - **"Approve"** → Final approval, Status: `FINANCE_APPROVED`
  - **"Reject"** → Rejection, Status: `FINANCE_REJECTED`

### 4. Final Approval/Rejection
- Status: `FINANCE_APPROVED` or `FINANCE_REJECTED`
- If Approved → Can be marked as `PAID`
- If Rejected → Manager and Employee notified with reasons

## Status Values

### New Enum Values
```python
SUBMITTED                          # Initial submission
MANAGER_APPROVED_FOR_VERIFICATION  # Manager approved, awaiting Finance
MANAGER_REJECTED                   # Manager rejected
PENDING_FINANCE_REVIEW            # Awaiting Finance verification
FINANCE_APPROVED                  # Final approval
FINANCE_REJECTED                  # Final rejection
PAID                              # Payment processed
```

### Legacy Statuses (Removed)
- HR_APPROVED → MANAGER_APPROVED_FOR_VERIFICATION
- HR_REJECTED → MANAGER_REJECTED
- MANAGER_APPROVED → MANAGER_APPROVED_FOR_VERIFICATION
- POLICY_EXCEPTION → (can be reused for edge cases)

## Backend Implementation

### Modified Files

#### 1. `app/models/expense.py`
- Updated `ExpenseStatusEnum` with new statuses
- Removed old approval statuses
- Added `MANAGER_APPROVED_FOR_VERIFICATION` for verification flow

#### 2. `app/services/approval_service.py`
- **Updated**: `approve_expense_manager()`
  - Now sets status to `MANAGER_APPROVED_FOR_VERIFICATION`
  - Logs action as "manager_approved_for_verification"
  - Sends expense to Finance for verification
  
- **Unchanged**: `reject_expense_manager()`
  - Manager can still reject expenses
  - Status: `MANAGER_REJECTED`

- **New**: `approve_expense_finance_after_verification()`
  - Finance approves after LLM verification
  - Status: `FINANCE_APPROVED`
  - Accepts: `llm_analysis`, `comments`
  - Stores LLM analysis in `policy_check_result`

- **New**: `reject_expense_finance_after_verification()`
  - Finance rejects after LLM verification
  - Status: `FINANCE_REJECTED`
  - Accepts: `llm_analysis`, `comments`
  - Stores rejection remarks with AI analysis

### API Endpoints (To Be Added)

#### Manager Endpoints
```
POST /api/approvals/manager/{expense_id}/approve
- Body: { "comments": "string" }
- Response: { "message": "Approved for verification" }
- Status Update: MANAGER_APPROVED_FOR_VERIFICATION

POST /api/approvals/manager/{expense_id}/reject
- Body: { "comments": "string" }
- Response: { "message": "Rejected by manager" }
- Status Update: MANAGER_REJECTED
```

#### Finance Endpoints (New)
```
POST /api/approvals/finance/{expense_id}/verify-approve
- Body: { "llm_analysis": "string", "comments": "string" }
- Response: { "message": "Approved after verification" }
- Status Update: FINANCE_APPROVED

POST /api/approvals/finance/{expense_id}/verify-reject
- Body: { "llm_analysis": "string", "comments": "string" }
- Response: { "message": "Rejected after verification" }
- Status Update: FINANCE_REJECTED
```

## Frontend Updates Needed

### Manager Dashboard
- Buttons: "Approve for Verification" instead of "Approve"
- Show only expenses with status `SUBMITTED`
- No longer sees `MANAGER_APPROVED` expenses

### Finance Dashboard (New)
- New dashboard component: `finance-dashboard.tsx`
- Show expenses with status: `MANAGER_APPROVED_FOR_VERIFICATION`
- Receipt Viewer modal (same as manager)
- LLM Analysis integration:
  - Button: "Analyze with AI"
  - Show AI response in modal
  - Buttons: "Approve" or "Reject" based on analysis
- Display AI insights:
  - Authenticity score
  - Risk factors
  - Recommendations

## Database Schema Changes

No schema changes needed - uses existing columns:
- `status` column: Enum updated
- `rejection_remarks` column: Stores Finance rejection reasons
- `policy_check_result` column: Stores LLM analysis

## Data Flow

```
Employee
    ↓ Submits with receipt
Manager Dashboard
    ↓ Views expense + receipt
Manager Decision
    ├─→ Approve for Verification → Status: MANAGER_APPROVED_FOR_VERIFICATION
    └─→ Reject → Status: MANAGER_REJECTED
        ↓
Finance Dashboard
    ↓ Views expense + receipt
LLM Agent Analysis
    ├─→ Analyzes receipt genuineness
    ├─→ Checks for fraud indicators
    └─→ Generates recommendations
        ↓
Finance Decision
    ├─→ Approve → Status: FINANCE_APPROVED → Can be marked PAID
    └─→ Reject → Status: FINANCE_REJECTED → Rejection remarks stored

Employee Notification
    ├─→ If approved → Ready for payment
    └─→ If rejected → See Finance feedback
```

## Implementation Steps Completed

✅ 1. Updated `ExpenseStatusEnum` with new statuses
✅ 2. Added `approve_expense_finance_after_verification()` method
✅ 3. Added `reject_expense_finance_after_verification()` method
✅ 4. Updated manager approval to use verification status
✅ 5. Updated approval logging for new workflow
✅ 6. Verified backend syntax

## Next Steps (Frontend & API)

⏳ 1. Update manager-dashboard to show "Approve for Verification" button
⏳ 2. Create finance-dashboard component
⏳ 3. Integrate receipt viewer in finance dashboard
⏳ 4. Add LLM analysis UI component
⏳ 5. Create new API endpoint routes in `approval.py`
⏳ 6. Update expense filtering to show correct statuses
⏳ 7. Add employee notification system for rejections
⏳ 8. Create rejection history view

## Key Benefits

1. **Manager Oversight**: Managers verify receipt quality and compliance
2. **Finance Authority**: Finance has final decision power
3. **AI-Powered**: LLM Agent helps detect fraudulent or questionable bills
4. **Audit Trail**: Complete logging of all approval stages
5. **Transparency**: Clear workflow with status indicators
6. **Security**: Two-tier verification prevents fraud
7. **Efficiency**: Parallel verification process

## Testing Checklist

- [ ] Manager can see "Approve for Verification" button
- [ ] Clicking button sets status to `MANAGER_APPROVED_FOR_VERIFICATION`
- [ ] Expense appears in Finance Dashboard after manager approval
- [ ] Finance can view receipt via Receipt Viewer
- [ ] Finance can use LLM analysis
- [ ] Finance can approve expense
- [ ] Finance can reject expense with reasons
- [ ] Rejection remarks appear for employee
- [ ] Status flow matches documentation
- [ ] Audit logs record all actions

---

**Implementation Date**: 2026-01-11
**Status**: Backend Ready, Frontend Pending
