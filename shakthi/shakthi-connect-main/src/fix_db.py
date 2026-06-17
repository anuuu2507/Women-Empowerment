from backend.app import app, db
import traceback

print("Checking database schema...")
with app.app_context():
    try:
        db.create_all()
        print("Database tables created/verified.")
        
        # Verify Notification table explicitly
        from sqlalchemy import inspect
        inspector = inspect(db.engine)
        tables = inspector.get_table_names()
        print("Tables:", tables)
        
        if 'notification' in tables:
            print("SUCCESS: Notification table exists.")
        else:
            print("ERROR: Notification table MISSING!")
            
    except Exception as e:
        print(f"Error: {e}")
        traceback.print_exc()
