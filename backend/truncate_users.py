#!/usr/bin/env python
from app.database import engine
from sqlalchemy import text

# Truncate the users table
with engine.connect() as conn:
    conn.execute(text('TRUNCATE TABLE users CASCADE'))
    conn.commit()
    print("✓ Users table truncated successfully")
