from backend.app import app, db, User, Job, JobApplication, Message, Notification

def clear_all_data():
    with app.app_context():
        try:
            print("Deleting all data from database...")
            
            print("Deleting Job Applications...")
            num_apps = db.session.query(JobApplication).delete()
            print(f"Deleted {num_apps} applications.")

            print("Deleting Messages...")
            num_msgs = db.session.query(Message).delete()
            print(f"Deleted {num_msgs} messages.")

            print("Deleting Notifications...")
            num_notifs = db.session.query(Notification).delete()
            print(f"Deleted {num_notifs} notifications.")

            print("Deleting Jobs...")
            num_jobs = db.session.query(Job).delete()
            print(f"Deleted {num_jobs} jobs.")

            print("Deleting Users...")
            num_users = db.session.query(User).delete()
            print(f"Deleted {num_users} users.")

            db.session.commit()
            print("\n✅ Successfully cleared all data from database!")
            print("You can now start fresh with new registrations.")
        except Exception as e:
            db.session.rollback()
            print(f"❌ Error clearing data: {e}")

if __name__ == "__main__":
    clear_all_data()
