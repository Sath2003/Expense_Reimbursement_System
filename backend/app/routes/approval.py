from fastapi import APIRouter, Depends, HTTPException, status, Body
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.approval import ApprovalDecisionRequest, ApprovalListResponse
from app.services.approval_service import ApprovalService
from app.services.expense_service import ExpenseService
from app.utils.dependencies import get_current_user
from app.models.user import User, RoleEnum
from app.models.expense import ExpenseStatusEnum, Expense
from app.models.approval import ExpenseApproval, ApprovalRole
from typing import List, Optional, Dict, Any

router = APIRouter(prefix="/api/approvals", tags=["approvals"])

@router.post("/manager/{expense_id}/approve")
async def manager_approve(
    expense_id: int,
    request: ApprovalDecisionRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Manager approves expense"""
    # Check if current user is Manager
    if current_user.role.role_name != RoleEnum.MANAGER:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only Manager users can approve expenses"
        )
    expense = ExpenseService.get_expense(db, expense_id)
    
    if not expense:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Expense not found"
        )
    
    success, error = ApprovalService.approve_expense_manager(
        db=db,
        expense_id=expense_id,
        approved_by=current_user.id,
        comments=request.comments
    )
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=error
        )
    
    return {"message": "Expense approved successfully"}

@router.post("/manager/{expense_id}/reject")
async def manager_reject(
    expense_id: int,
    request: ApprovalDecisionRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Manager rejects expense"""
    # Check if current user is Manager
    if current_user.role.role_name != RoleEnum.MANAGER:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only Manager users can reject expenses"
        )
    expense = ExpenseService.get_expense(db, expense_id)
    
    if not expense:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Expense not found"
        )
    
    success, error = ApprovalService.reject_expense_manager(
        db=db,
        expense_id=expense_id,
        rejected_by=current_user.id,
        comments=request.comments
    )
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=error
        )
    
    return {"message": "Expense rejected successfully"}

@router.post("/finance/{expense_id}/approve")
async def finance_approve(
    expense_id: int,
    request: ApprovalDecisionRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Finance approves and marks as paid"""
    # Check if current user is Finance
    if current_user.role.role_name != RoleEnum.FINANCE:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only Finance users can approve expenses"
        )
    expense = ExpenseService.get_expense(db, expense_id)
    
    if not expense:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Expense not found"
        )
    
    success, error = ApprovalService.approve_expense_finance(
        db=db,
        expense_id=expense_id,
        approved_by=current_user.id,
        comments=request.comments
    )
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=error
        )
    
    return {"message": "Expense approved and marked as paid"}

@router.post("/finance/{expense_id}/reject")
async def finance_reject(
    expense_id: int,
    request: ApprovalDecisionRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Finance rejects expense"""
    # Check if current user is Finance
    if current_user.role.role_name != RoleEnum.FINANCE:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only Finance users can reject expenses"
        )
    expense = ExpenseService.get_expense(db, expense_id)
    
    if not expense:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Expense not found"
        )
    
    success, error = ApprovalService.reject_expense_finance(
        db=db,
        expense_id=expense_id,
        rejected_by=current_user.id,
        comments=request.comments
    )
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=error
        )
    
    return {"message": "Expense rejected"}

@router.get("/pending-manager")
async def get_pending_manager_approvals(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get pending manager approvals"""
    expenses = ExpenseService.get_pending_expenses(db, current_user.id)
    return expenses

@router.get("/{expense_id}")
async def get_expense_approvals(
    expense_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all approvals for an expense"""
    from app.models.approval import ExpenseApproval
    
    expense = ExpenseService.get_expense(db, expense_id)
    if not expense:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Expense not found"
        )
    
    approvals = db.query(ExpenseApproval).filter(
        ExpenseApproval.expense_id == expense_id
    ).all()
    
    return approvals

@router.get("/finance/pending")
async def get_pending_finance_expenses(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all expenses pending Finance verification"""
    # Check if current user is Finance
    if current_user.role.role_name != RoleEnum.FINANCE:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only Finance users can view pending expenses"
        )
    
    from sqlalchemy.orm import joinedload
    
    # Get all expenses pending finance review with attachments
    expenses = db.query(Expense).options(
        joinedload(Expense.employee),
        joinedload(Expense.attachments)
    ).filter(
        Expense.status == ExpenseStatusEnum.MANAGER_APPROVED_FOR_VERIFICATION
    ).order_by(Expense.created_at.desc()).all()
    
    # Format response
    result = []
    for expense in expenses:
        # Get primary attachment for receipt display
        primary_attachment = None
        if expense.attachments:
            primary_attachment = expense.attachments[0]
        
        # Extract validation score (genuineness percentage)
        validation_score = float(expense.validation_score) if expense.validation_score else 0.0
        
        expense_dict = {
            "id": expense.id,
            "category_id": expense.category_id,
            "amount": float(expense.amount),
            "expense_date": expense.expense_date,
            "description": expense.description,
            "status": expense.status,
            "created_at": expense.created_at,
            "user_id": expense.user_id,
            "first_name": expense.employee.first_name if expense.employee else "",
            "last_name": expense.employee.last_name if expense.employee else "",
            "validation_score": validation_score,  # AI genuineness percentage (0-100)
            "bill_image_url": f"/api/expenses/receipts/{primary_attachment.id}" if primary_attachment else None,
            "bill_filename": primary_attachment.file_name if primary_attachment else None,
            "attachments": [
                {
                    "id": att.id,
                    "filename": att.file_name,
                    "file_path": att.file_path,
                    "uploaded_at": att.uploaded_at
                }
                for att in expense.attachments
            ] if expense.attachments else []
        }
        result.append(expense_dict)
    
    return result

@router.post("/finance/{expense_id}/verify-approve")
async def finance_verify_approve(
    expense_id: int,
    body: Dict[str, Any] = Body(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Finance approves expense after LLM verification"""
    import logging
    logger = logging.getLogger(__name__)
    
    try:
        logger.info(f"[VERIFY-APPROVE] Received request for expense {expense_id}")
        logger.info(f"[VERIFY-APPROVE] Request body: {body}")
        
        # Extract comments from body
        comments = body.get('comments') if body else None
        logger.info(f"[VERIFY-APPROVE] Request comments: {comments}")
        
        # Check if current user is Finance
        if current_user.role.role_name != RoleEnum.FINANCE:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only Finance users can approve expenses"
            )
        
        expense = ExpenseService.get_expense(db, expense_id)
        if not expense:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Expense not found"
            )
        
        logger.info(f"Processing finance approval for expense {expense_id}, status: {expense.status}")
        
        success, error = ApprovalService.approve_expense_finance_after_verification(
            db=db,
            expense_id=expense_id,
            approved_by=current_user.id,
            llm_analysis=comments,  # LLM analysis passed as comments
            comments=comments
        )
        
        if not success:
            logger.error(f"Approval failed for expense {expense_id}: {error}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=error
            )
        
        logger.info(f"Approval successful for expense {expense_id}")
        
        # Refresh expense from database after the approval to get updated state
        try:
            expense_refreshed = ExpenseService.get_expense(db, expense_id)
            if expense_refreshed and expense_refreshed.employee:
                from app.services.email_service import EmailService
                employee = expense_refreshed.employee
                EmailService.send_approval_email(
                    to_email=employee.email,
                    employee_name=f"{employee.first_name} {employee.last_name}",
                    expense_amount=float(expense_refreshed.amount),
                    expense_description=expense_refreshed.description
                )
        except Exception:
            # Don't fail the approval if email fails
            pass
        
        return {"message": "Expense approved successfully. Employee notified."}
    except Exception as e:
        logger.error(f"Unexpected error in finance_verify_approve: {str(e)}", exc_info=True)
        raise

@router.post("/finance/{expense_id}/verify-reject")
async def finance_verify_reject(
    expense_id: int,
    request: ApprovalDecisionRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Finance rejects expense after LLM verification"""
    # Check if current user is Finance
    if current_user.role.role_name != RoleEnum.FINANCE:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only Finance users can reject expenses"
        )
    
    expense = ExpenseService.get_expense(db, expense_id)
    if not expense:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Expense not found"
        )
    
    success, error = ApprovalService.reject_expense_finance_after_verification(
        db=db,
        expense_id=expense_id,
        rejected_by=current_user.id,
        llm_analysis=request.comments,
        comments=request.comments
    )
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=error
        )
    
    # Refresh expense from database after the rejection to get updated state
    try:
        expense_refreshed = ExpenseService.get_expense(db, expense_id)
        if expense_refreshed and expense_refreshed.employee:
            from app.services.email_service import EmailService
            employee = expense_refreshed.employee
            rejection_reason = expense_refreshed.rejection_remarks if expense_refreshed.rejection_remarks else request.comments
            EmailService.send_rejection_email(
                to_email=employee.email,
                employee_name=f"{employee.first_name} {employee.last_name}",
                expense_amount=float(expense_refreshed.amount),
                expense_description=expense_refreshed.description,
                rejection_reason=rejection_reason,
                finance_contact="finance@expensehub.com"
            )
    except Exception:
        # Don't fail the rejection if email fails
        pass
    
    return {"message": "Expense rejected. Employee notified with reason."}


@router.post("/finance/{expense_id}/analyze-with-ai")
async def analyze_bill_with_ai(
    expense_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Analyze expense bill for genuineness using Llama AI"""
    import logging
    from app.services.bill_analysis_service import BillAnalysisService
    from app.utils.file_handler import FileHandler
    
    logger = logging.getLogger(__name__)
    
    try:
        logger.info(f"[AI-ANALYZE] Analyzing expense {expense_id}")
        
        # Check if current user is Finance
        if current_user.role.role_name != RoleEnum.FINANCE:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only Finance users can request AI analysis"
            )
        
        # Get the expense
        expense = db.query(Expense).filter(Expense.id == expense_id).first()
        if not expense:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Expense not found"
            )
        
        # Extract text from receipt if available
        extracted_text = ""
        if expense.attachments:
            attachment = expense.attachments[0]
            file_path = attachment.file_path
            
            # Try to extract text from PDF or image
            try:
                extracted_text = FileHandler.extract_text_from_file(file_path)
                logger.info(f"[AI-ANALYZE] Extracted {len(extracted_text)} characters from receipt")
            except Exception as e:
                logger.warning(f"[AI-ANALYZE] Could not extract text: {str(e)}")
                extracted_text = ""
        
        # Call AI analysis service
        analysis = await BillAnalysisService.analyze_bill_for_rejection(
            expense_description=expense.description,
            amount=float(expense.amount),
            category=expense.category.category_name if expense.category else "Other",
            extracted_text=extracted_text,
        )
        
        logger.info(f"[AI-ANALYZE] Analysis complete: {analysis}")
        
        return {
            "expense_id": expense_id,
            "analysis": analysis,
            "amount": float(expense.amount),
            "description": expense.description,
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"[AI-ANALYZE] Error analyzing bill: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error analyzing bill: {str(e)}"
        )
