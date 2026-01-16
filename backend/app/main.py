from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base, SessionLocal
from app.routes import expense, approval, auth, analytics, finance
from app.config import settings
from app.models.user import Role, User
from app.models.expense import ExpenseCategory, TransportationType
from app.utils.security import hash_password
import logging

# Setup logging
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
        demo_user = db.query(User).filter(User.email == 'manager@expensehub.com').first()
        if not demo_user:
            logger.info("Creating permanent users...")
            # Insert permanent users (Manager and Finance only)
            demo_users = [
                User(
                    first_name='System',
                    last_name='Manager',
                    email='manager@expensehub.com',
                    phone_number='+91-1234567890',
                    password=hash_password('password123'),
                    designation='Expense Manager',
                    department='Finance',
                    employee_id='MGR-001',
                    role_id=2,
                    is_active=True,
                    is_verified=True
                ),
                User(
                    first_name='Sarah',
                    last_name='Johnson',
                    email='sarah.johnson@expensehub.com',
                    phone_number='+91-1234567891',
                    password=hash_password('password123'),
                    designation='Finance Officer',
                    department='Finance',
                    employee_id='FIN-001',
                    role_id=3,
                    is_active=True,
                    is_verified=True
                )
            ]
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
