import sys
sys.path.insert(0, '/app')
try:
    from app.database import SessionLocal, engine
    from sqlalchemy import inspect, text
    
    # Check tables
    inspector = inspect(engine)
    tables = inspector.get_table_names()
    print(f"Tables in database: {tables}\n")
    
    # Check if roles table has data
    db = SessionLocal()
    result = db.execute(text("SELECT COUNT(*) FROM roles"))
    role_count = result.scalar()
    print(f"Roles count: {role_count}")
    
    result = db.execute(text("SELECT COUNT(*) FROM users"))
    user_count = result.scalar()
    print(f"Users count: {user_count}")
    
    db.close()
except Exception as e:
    print(f"Error: {e}")
    import traceback
    traceback.print_exc()
