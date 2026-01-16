from app.database import SessionLocal
from app.models.user import User
from app.utils.security import hash_password

db = SessionLocal()

try:
    # Update Finance user
    finance = db.query(User).filter(User.email == 'sarah.johnson@expensehub.com').first()
    if finance:
        finance.password = hash_password('Finance@123')
        db.commit()
        print("✓ Finance user password updated")
    
    # Update Manager user  
    manager = db.query(User).filter(User.email == 'manager@expensehub.com').first()
    if manager:
        manager.password = hash_password('Manager@123')
        db.commit()
        print("✓ Manager user password updated")
    
    print("\n✓ All passwords updated successfully!")
finally:
    db.close()
