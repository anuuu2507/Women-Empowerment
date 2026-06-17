from backend.app import app, db, Job, JobApplication, Message, Notification

def clear_data():
    with app.app_context():
        try:
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

            db.session.commit()
            print("Successfully cleared all job-related data.")
        except Exception as e:
            db.session.rollback()
            print(f"Error clearing data: {e}")

if __name__ == "__main__":
    clear_data()
