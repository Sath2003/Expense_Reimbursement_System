from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from app.database import get_db, SessionLocal
from app.models import Base, User, Role, EmployeeGrade, ExpenseCategory, TransportationType, Notification
from app.routes import auth, expense, approval, analytics, finance, notification
from app.config import settings
from app.utils.security import hash_password
import logging
import os

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create tables at startup
try:
    Base.metadata.create_all(bind=engine)
except Exception as e:
    # Silently fail if database isn't ready yet
    pass

# Initialize roles and demo users
def init_db():
    """Initialize database with roles and demo users"""
    db = SessionLocal()
    try:
        logger.info("Starting database initialization...")
        
        # Check if roles exist
        roles_exist = db.query(Role).first()
        if not roles_exist:
            logger.info("Creating roles...")
            # Insert roles
            roles_data = [
                Role(id=1, role_name='EMPLOYEE', description='Regular employee who can submit expenses'),
                Role(id=2, role_name='MANAGER', description='Manager who can approve expenses'),
                Role(id=3, role_name='FINANCE', description='Finance team member with full access'),
                Role(id=4, role_name='ADMIN', description='Administrator with full system access'),
            ]
            db.add_all(roles_data)
            db.commit()
            logger.info("✅ Roles created")
        else:
            logger.info("✅ Roles already exist")
        
        # Check if demo users exist
        manager_user = db.query(User).filter(User.email == 'rajesh.kumar@expensemgmt.com').first()
        finance_user = db.query(User).filter(User.email == 'priya.sharma@expensemgmt.com').first()
        if not manager_user or not finance_user:
            logger.info("Creating permanent users...")
            demo_users = []
            if not manager_user:
                demo_users.append(
                    User(
                        first_name='Rajesh',
                        last_name='Kumar',
                        email='rajesh.kumar@expensemgmt.com',
                        phone_number='+91 0000000000',
                        password=hash_password('Manager@2024!Secure'),
                        designation='Manager',
                        department='Operations',
                        employee_id='MGR-001',
                        role_id=2,
                        is_active=True,
                        is_verified=True
                    )
                )
            if not finance_user:
                demo_users.append(
                    User(
                        first_name='Priya',
                        last_name='Sharma',
                        email='priya.sharma@expensemgmt.com',
                        phone_number='+91 0000000001',
                        password=hash_password('Finance@2024!Secure'),
                        designation='Finance',
                        department='Finance',
                        employee_id='FIN-001',
                        role_id=3,
                        is_active=True,
                        is_verified=True
                    )
                )

            if demo_users:
                db.add_all(demo_users)
                db.commit()
                logger.info("✅ Permanent users created")
        
        # Check if expense categories exist
        categories_exist = db.query(ExpenseCategory).first()
        if not categories_exist:
            logger.info("Creating expense categories...")
            categories_data = [
                ExpenseCategory(name='Travel', description='Business travel expenses'),
                ExpenseCategory(name='Food', description='Meals and refreshments'),
                ExpenseCategory(name='Accommodation', description='Hotel and lodging'),
                ExpenseCategory(name='Office Supplies', description='Stationery and office items'),
                ExpenseCategory(name='Communication', description='Phone and internet'),
                ExpenseCategory(name='Miscellaneous', description='Other business expenses'),
                ExpenseCategory(name='Equipment', description='Equipment and machinery'),
                ExpenseCategory(name='Meals', description='Meals and drinks'),
                ExpenseCategory(name='Other', description='Other expenses'),
                ExpenseCategory(name='Fuel', description='Fuel and petrol expenses')
            ]
            db.add_all(categories_data)
            db.commit()
            logger.info("✅ Expense categories created")
        else:
            logger.info("✅ Expense categories already exist")
        
        # Check if transportation types exist
        transport_exist = db.query(TransportationType).first()
        if not transport_exist:
            logger.info("Creating transportation types...")
            transport_data = [
                TransportationType(type_name='Flight'),
                TransportationType(type_name='Train'),
                TransportationType(type_name='Bus'),
                TransportationType(type_name='Taxi'),
                TransportationType(type_name='Personal Vehicle')
            ]
            db.add_all(transport_data)
            db.commit()
            logger.info("✅ Transportation types created")
        else:
            logger.info("✅ Transportation types already exist")
        
        # Check if expense policies exist
        policies_exist = db.execute(text("SELECT COUNT(*) FROM expense_policies")).scalar()
        if policies_exist == 0:
            logger.info("Creating expense policies...")
            # Sample policies for grade A (senior)
            db.execute(text("""
                INSERT INTO expense_policies (grade_id, category_id, max_amount, frequency, requires_approval) VALUES
                (1, 1, 50000.00, 'PER_TRIP', TRUE),  -- Travel: Grade A, ₹50,000 per trip
                (1, 2, 2000.00, 'DAILY', TRUE),     -- Food: Grade A, ₹2,000 daily
                (1, 3, 10000.00, 'PER_TRIP', TRUE),  -- Accommodation: Grade A, ₹10,000 per trip
                (1, 4, 5000.00, 'MONTHLY', FALSE),   -- Office Supplies: Grade A, ₹5,000 monthly
                (1, 7, 25000.00, 'MONTHLY', TRUE),   -- Equipment: Grade A, ₹25,000 monthly
                (1, 10, 5000.00, 'MONTHLY', FALSE)   -- Fuel: Grade A, ₹5,000 monthly
            """))
            # Sample policies for grade B (mid)
            db.execute(text("""
                INSERT INTO expense_policies (grade_id, category_id, max_amount, frequency, requires_approval) VALUES
                (2, 1, 30000.00, 'PER_TRIP', TRUE),  -- Travel: Grade B, ₹30,000 per trip
                (2, 2, 1500.00, 'DAILY', TRUE),     -- Food: Grade B, ₹1,500 daily
                (2, 3, 7500.00, 'PER_TRIP', TRUE),   -- Accommodation: Grade B, ₹7,500 per trip
                (2, 4, 3000.00, 'MONTHLY', FALSE),   -- Office Supplies: Grade B, ₹3,000 monthly
                (2, 7, 15000.00, 'MONTHLY', TRUE),   -- Equipment: Grade B, ₹15,000 monthly
                (2, 10, 3000.00, 'MONTHLY', FALSE)   -- Fuel: Grade B, ₹3,000 monthly
            """))
            db.commit()
            logger.info("✅ Expense policies created")
        else:
            logger.info("✅ Expense policies already exist")
        
    except Exception as e:
        db.rollback()
        logger.error(f"❌ Error initializing database: {str(e)}", exc_info=True)
    finally:
        db.close()

# Call init on startup (moved to startup event)

app = FastAPI(
    title=settings.APP_NAME,
    description="Expense Reimbursement Management System",
    version="1.0.0"
)

@app.on_event("startup")
async def startup_event():
    """Initialize database on startup"""
    init_db()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router)
app.include_router(expense.router)
app.include_router(approval.router)
app.include_router(analytics.router)
app.include_router(finance.router)
app.include_router(notification.router)

@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "Expense Reimbursement System API",
        "version": "1.0.0",
        "docs": "/docs"
    }

@app.get("/health")
async def health():
    """Health check endpoint"""
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
