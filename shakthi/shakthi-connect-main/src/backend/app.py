from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
import uuid
import os
import json
from datetime import datetime

app = Flask(__name__)
CORS(app)

# Configure Database (SQLite)
# Database file will be created in an 'instance' folder in the current directory
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///shakthi_v6.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

# Models
class User(db.Model):
    id = db.Column(db.String(36), primary_key=True)
    name = db.Column(db.String(100))
    email = db.Column(db.String(100), unique=True)
    phone = db.Column(db.String(20))
    address = db.Column(db.String(200))
    aadhaarLast4 = db.Column(db.String(4))
    gender = db.Column(db.String(10))
    credits = db.Column(db.Integer, default=0)
    rating = db.Column(db.Float, default=0.0)
    reviewCount = db.Column(db.Integer, default=0)
    isVerified = db.Column(db.Boolean, default=True)
    availability = db.Column(db.String(100))
    skills_str = db.Column(db.String(500), default="[]")
    last_seen = db.Column(db.DateTime, nullable=True)

    def to_dict(self):
        skills = []
        try:
            if self.skills_str:
                s = self.skills_str.replace("'", '"')
                if "[" in s:
                    skills = json.loads(s)
        except:
             skills = []

        # Check if online (active in last 2 minutes)
        is_online = False
        if self.last_seen:
            time_diff = (datetime.now() - self.last_seen).total_seconds()
            is_online = time_diff < 120  # 2 minutes

        return {
            'id': self.id,
            'name': self.name,
            'email': self.email,
            'phone': self.phone,
            'address': self.address,
            'aadhaarLast4': self.aadhaarLast4,
            'gender': self.gender,
            'credits': self.credits,
            'rating': self.rating,
            'reviewCount': self.reviewCount,
            'isVerified': self.isVerified,
            'availability': self.availability,
            'skills': skills,
            'workHistory': [],
            'radius': 5,
            'isOnline': is_online,
            'lastSeen': self.last_seen.isoformat() if self.last_seen else None
        }

class Job(db.Model):
    id = db.Column(db.String(36), primary_key=True)
    title = db.Column(db.String(100))
    description = db.Column(db.String(500))
    category = db.Column(db.String(50))
    min_amount = db.Column(db.Integer)
    max_amount = db.Column(db.Integer)
    location = db.Column(db.String(100))
    deliveryType = db.Column(db.String(20))
    urgency = db.Column(db.String(20))
    customerName = db.Column(db.String(100))
    customerRating = db.Column(db.Float)
    postedAt = db.Column(db.String(50))
    status = db.Column(db.String(20), default='open') 
    paymentMode = db.Column(db.String(50), default='online') # online (escrow) or cod
    worker_id = db.Column(db.String(36), db.ForeignKey('user.id'), nullable=True)
    # Store the creator's ID (mocking it mostly to '1' for demo if not provided)
    creator_id = db.Column(db.String(36), nullable=True) 

    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'category': self.category,
            'amount': {'min': self.min_amount, 'max': self.max_amount},
            'location': self.location,
            'deliveryType': self.deliveryType,
            'urgency': self.urgency,
            'paymentMode': self.paymentMode,
            'customerName': self.customerName,
            'customerRating': self.customerRating,
            'postedAt': self.postedAt,
            'status': self.status,
            'creator_id': self.creator_id,
            'worker_id': self.worker_id
        }

class JobApplication(db.Model):
    id = db.Column(db.String(36), primary_key=True)
    job_id = db.Column(db.String(36), db.ForeignKey('job.id'), nullable=False)
    worker_id = db.Column(db.String(36), db.ForeignKey('user.id'), nullable=False)
    status = db.Column(db.String(20), default='pending') # pending, accepted, rejected
    timestamp = db.Column(db.String(50))

    worker = db.relationship('User', backref='applications')
    job = db.relationship('Job', backref='applications')

    def to_dict(self):
        return {
            'id': self.id,
            'jobId': self.job_id,
            'workerId': self.worker_id,
            'status': self.status,
            'timestamp': self.timestamp,
            'workerName': self.worker.name,
            'workerRating': self.worker.rating,
            'jobTitle': self.job.title
        }


class Message(db.Model):
    id = db.Column(db.String(36), primary_key=True)
    job_id = db.Column(db.String(36), db.ForeignKey('job.id'), nullable=False)
    sender_id = db.Column(db.String(36), db.ForeignKey('user.id'), nullable=False)
    content = db.Column(db.String(1000), nullable=True)
    timestamp = db.Column(db.String(50))
    read = db.Column(db.Boolean, default=False)

    def to_dict(self):
        return {
            'id': self.id,
            'jobId': self.job_id,
            'senderId': self.sender_id,
            'content': self.content,
            'timestamp': self.timestamp,
            'read': self.read
        }

@app.before_request
def update_last_seen():
    """Update user's last_seen timestamp on every request"""
    try:
        user_id = None
        if request.is_json and request.json:
            user_id = request.json.get('senderId') or request.json.get('userId') or request.json.get('workerId')
        
        if not user_id and request.args.get('userId'):
            user_id = request.args.get('userId')

        if user_id:
            user = User.query.get(user_id)
            if user:
                user.last_seen = datetime.now()
                db.session.commit()
    except:
        pass  # Don't block requests

@app.route('/api/messages/<job_id>', methods=['GET'])
def get_messages(job_id):
    messages = Message.query.filter_by(job_id=job_id).order_by(Message.timestamp.asc()).all()
    return jsonify([msg.to_dict() for msg in messages])

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'ok'})

@app.route('/api/messages', methods=['POST'])
def send_message():
    data = request.json
    print(f"Message attempt: {data}")
    try:
        sender_id = data.get('senderId')
        job_id = data.get('jobId')
        
        # Auto-heal sender if missing
        if sender_id:
             sender = User.query.get(sender_id)
             if not sender:
                 sender = User(id=sender_id, name='Recovered Sender', email=f'sender_{sender_id[:6]}@example.com', credits=0, rating=0.0, reviewCount=0, isVerified=True, skills_str="[]")
                 db.session.add(sender)
                 db.session.commit()

        new_msg = Message(
            id=str(uuid.uuid4()),
            job_id=job_id,
            sender_id=sender_id,
            content=data.get('content'),
            timestamp=datetime.now().strftime("%I:%M %p"),
            read=False
        )
        db.session.add(new_msg)
        db.session.commit()
        
        # Create notification for recipient
        # Determine recipient: if sender is job creator, notify worker; else notify creator
        job = Job.query.get(job_id)
        if job:
            recipient_id = None
            if sender_id == job.creator_id:
                # Sender is job creator, notify worker
                recipient_id = job.worker_id
            else:
                # Sender is worker/applicant, notify job creator
                recipient_id = job.creator_id
            
            if recipient_id:
                sender_name = sender.name if sender else 'Someone'
                notification = Notification(
                    id=str(uuid.uuid4()),
                    user_id=recipient_id,
                    type='message',
                    message=f'New message from {sender_name}',
                    timestamp=datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                    related_id=job_id,
                    read=False
                )
                db.session.add(notification)
                db.session.commit()
        
        return jsonify({'success': True, 'message': new_msg.to_dict()})
    except Exception as e:
        print(f"Error sending message: {e}")
        return jsonify({'success': False, 'message': str(e)}), 500

@app.route('/api/messages/<job_id>/mark-read', methods=['POST'])
def mark_messages_read(job_id):
    """Mark all messages in a job as read for the current user"""
    try:
        data = request.json
        user_id = data.get('userId')
        
        # Mark all messages in this job that were sent TO this user as read
        messages = Message.query.filter_by(job_id=job_id).filter(Message.sender_id != user_id).all()
        for msg in messages:
            msg.read = True
        db.session.commit()
        
        return jsonify({'success': True})
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@app.route('/api/users/<user_id>/status', methods=['GET'])
def get_user_status(user_id):
    """Get user's online status"""
    user = User.query.get(user_id)
    if not user:
        return jsonify({'success': False}), 404
    return jsonify({'success': True, 'user': user.to_dict()})

@app.route('/api/notifications', methods=['GET'])
def get_notifications():
    """Get notifications for a user - supports query param userId"""
    user_id = request.args.get('userId')
    if not user_id:
        return jsonify({'success': False, 'message': 'userId required'}), 400
    
    # Get ALL notifications (both read and unread), sorted by newest first (by created_at)
    notifications = Notification.query.filter_by(user_id=user_id).order_by(Notification.created_at.desc()).all()
    print(f"Fetching notifications for user {user_id}: Found {len(notifications)} notifications")
    for n in notifications:
        print(f"  - {n.type}: {n.message} (read: {n.read}, created_at: {n.created_at})")
    return jsonify([n.to_dict() for n in notifications])

@app.route('/api/notifications/count', methods=['GET'])
def get_notification_count():
    """Get count of unread notifications"""
    user_id = request.args.get('userId')
    if not user_id:
        return jsonify({'success': False, 'message': 'userId required'}), 400
    count = Notification.query.filter_by(user_id=user_id, read=False).count()
    return jsonify({'count': count})

class Notification(db.Model):
    id = db.Column(db.String(36), primary_key=True)
    user_id = db.Column(db.String(36), db.ForeignKey('user.id'), nullable=False)
    type = db.Column(db.String(50)) # request, accept, reject, message, info
    message = db.Column(db.String(500))
    timestamp = db.Column(db.String(50))
    created_at = db.Column(db.DateTime, default=datetime.now, nullable=False)
    related_id = db.Column(db.String(36), nullable=True) # e.g. job_id
    read = db.Column(db.Boolean, default=False)

    def to_dict(self):
        return {
            'id': self.id,
            'userId': self.user_id,
            'type': self.type,
            'message': self.message,
            'timestamp': self.timestamp or (self.created_at.strftime("%Y-%m-%d %I:%M %p") if self.created_at else ""),
            'relatedId': self.related_id,
            'read': self.read
        }

# Initialize Database
def init_db():
    with app.app_context():
        db.create_all()
        # Dummy data removed as per user request

@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    # Support both Email/Pass and Phone/OTP
    email = data.get('email')
    phone = data.get('phone')
    
    user = None
    if email:
        email = email.lower().strip()
        user = User.query.filter_by(email=email).first()
    elif phone:
        # Simple phone normalization could happen here if needed
        user = User.query.filter_by(phone=phone).first()

    if user:
        return jsonify({'success': True, 'user': user.to_dict()})
    
    return jsonify({'success': False, 'message': 'User not found. Please register first.'})

@app.route('/api/send-otp', methods=['POST'])
def send_otp():
    data = request.json
    phone = data.get('phone')
    # In real app, send SMS via Twilio/Fast2SMS
    print(f"Sending OTP to {phone}: 123456") 
    return jsonify({'success': True, 'message': 'OTP Sent'})

@app.route('/api/verify-otp', methods=['POST'])
def verify_otp():
    data = request.json
    otp = data.get('otp')
    if otp == '123456': # Mock OTP
        return jsonify({'success': True})
    return jsonify({'success': False, 'message': 'Invalid OTP'}), 400 

@app.route('/api/register', methods=['POST'])
def register():
    try:
        data = request.json
        
        if User.query.filter_by(email=data.get('email')).first():
            return jsonify({'success': False, 'message': 'Email already registered'})

        if User.query.filter_by(phone=data.get('phone')).first():
            return jsonify({'success': False, 'message': 'Phone number already registered'})

        new_user = User(
            id=str(uuid.uuid4()),
            name=data.get('name'),
            email=data.get('email').lower().strip() if data.get('email') else None,
            phone=data.get('phone'),
            address=data.get('address'),
            aadhaarLast4=data.get('aadhaarLast4'),
            gender=data.get('gender'),
            credits=0,
            rating=0.0,
            reviewCount=0,
            isVerified=True,
            availability='Flexible',
            skills_str="[]" 
        )
        db.session.add(new_user)
        db.session.commit()
        
        return jsonify({'success': True, 'user': new_user.to_dict()})
    except Exception as e:
        print(f"Registration Error: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'success': False, 'message': f"Server Error: {str(e)}"}), 500

@app.route('/api/jobs', methods=['GET'])
def get_jobs():
    # Fetch both open and on_hold jobs so users can see the status
    jobs = Job.query.filter(Job.status.in_(['open', 'on_hold'])).all()
    # Also check if current user has applied? (Frontend handles this by fetching applications)
    return jsonify([job.to_dict() for job in jobs])

# AI Matching Algorithm
def calculate_skill_match(user_skills, job_category):
    """
    Calculate skill match score between user skills and job category
    Returns a score from 0-100
    """
    if not user_skills or not job_category:
        return 0
    
    # Skill to category mapping
    skill_category_map = {
        'Stitching & Tailoring': ['Tailoring', 'Handicrafts'],
        'Handicrafts': ['Handicrafts', 'Creative Work'],
        'Tutoring & Education': ['Education', 'Office Work'],
        'Beauty Services': ['Beauty & Wellness'],
        'Elderly Care': ['Caregiving'],
        'Data Entry': ['Office Work', 'Digital Services'],
        'Content Writing': ['Creative Work', 'Digital Services', 'Office Work'],
        'Graphic Design': ['Creative Work', 'Digital Services'],
        'Social Media Management': ['Digital Services', 'Creative Work']
    }
    
    max_score = 0
    for skill in user_skills:
        if skill in skill_category_map:
            matching_categories = skill_category_map[skill]
            if job_category in matching_categories:
                max_score = max(max_score, 100)  # Perfect match
            elif any(cat.lower() in job_category.lower() or job_category.lower() in cat.lower() for cat in matching_categories):
                max_score = max(max_score, 70)  # Partial match
    
    return max_score

def calculate_location_match(user_location, job_location):
    """
    Simple location matching based on city names
    Returns True if locations match or are nearby
    """
    if not user_location or not job_location:
        return True  # If no location specified, don't filter
    
    user_loc = user_location.lower().strip()
    job_loc = job_location.lower().strip()
    
    # Exact match
    if user_loc == job_loc:
        return True
    
    # Check if one contains the other (e.g., "Hyderabad" in "Hyderabad, Telangana")
    if user_loc in job_loc or job_loc in user_loc:
        return True
    
    return False

@app.route('/api/jobs/recommended', methods=['GET'])
def get_recommended_jobs():
    """
    Get AI-recommended jobs based on user skills and location
    """
    user_id = request.args.get('userId')
    
    if not user_id:
        return jsonify({'success': False, 'message': 'User ID required'}), 400
    
    user = User.query.get(user_id)
    if not user:
        return jsonify({'success': False, 'message': 'User not found'}), 404
    
    # Get user skills
    user_skills = []
    try:
        if user.skills_str:
            s = user.skills_str.replace("'", '"')
            if "[" in s:
                user_skills = json.loads(s)
    except:
        user_skills = []
    
    # Get all open jobs
    all_jobs = Job.query.filter(Job.status.in_(['open', 'on_hold'])).all()
    
    # Filter and score jobs
    recommended_jobs = []
    for job in all_jobs:
        # Skip jobs created by the user
        if job.creator_id == user_id:
            continue
        
        # Calculate skill match
        skill_score = calculate_skill_match(user_skills, job.category)
        
        # Calculate location match
        location_match = calculate_location_match(user.address, job.location)
        
        # Only include jobs with skill match > 30% or if user has no skills set
        if skill_score >= 30 or len(user_skills) == 0:
            if location_match:
                job_dict = job.to_dict()
                job_dict['matchScore'] = skill_score
                recommended_jobs.append(job_dict)
    
    # Sort by match score (highest first)
    recommended_jobs.sort(key=lambda x: x['matchScore'], reverse=True)
    
    return jsonify(recommended_jobs)

@app.route('/api/jobs/<job_id>/apply', methods=['POST'])
def apply_job(job_id):
    data = request.json
    print(f"\n=== APPLY JOB REQUEST ===")
    print(f"Job ID: {job_id}")
    print(f"Request Data: {data}")
    worker_id = data.get('workerId')
    
    if not worker_id:
        print(f"ERROR: Worker ID missing")
        return jsonify({'success': False, 'message': 'Worker ID required'}), 400
    
    try:
        job = Job.query.get(job_id)
        print(f"Job found: {job is not None}")
        if not job:
            print(f"ERROR: Job not found with ID {job_id}")
            return jsonify({'success': False, 'message': 'Job not found'}), 404
        
        print(f"Job status: {job.status}, Creator ID: {job.creator_id}")
            
        if job.status != 'open':
            print(f"ERROR: Job status not open: {job.status}")
            return jsonify({'success': False, 'message': 'Job no longer open'}), 400

        # Check existence
        existing = JobApplication.query.filter_by(job_id=job_id, worker_id=worker_id).first()
        if existing:
            print(f"ERROR: Already applied")
            return jsonify({'success': False, 'message': 'Already applied'}), 400

        # Ensure worker exists to prevent FK violation (Auto-heal ghost sessions)
        worker = User.query.get(worker_id)
        if not worker:
            print(f"Creating new user for worker_id: {worker_id}")
            worker = User(
                id=worker_id,
                name='Recovered User',
                email=f'recovered_{worker_id[:8]}@example.com',
                phone='',
                credits=0,
                rating=5.0,
                reviewCount=0,
                isVerified=True,
                skills_str="[]"
            )
            db.session.add(worker)
            db.session.commit()
            print(f"Worker created")

        job_application = JobApplication(
            id=str(uuid.uuid4()),
            job_id=job_id,
            worker_id=worker_id,
            status='pending',
            timestamp=datetime.now().strftime("%Y-%m-%d %H:%M")
        )
        db.session.add(job_application)
        db.session.flush()
        print(f"Job application created: {job_application.id}")
        
        # Notify Customer via Chat
        worker = User.query.get(worker_id)
        worker_name = worker.name if worker else "A Worker"
        msg = Message(
            id=str(uuid.uuid4()),
            job_id=job_id,
            sender_id=worker_id,
            content=f"EXT_SYSTEM: {worker_name} has requested to work on the task: {job.title}",
            timestamp=datetime.now().strftime("%I:%M %p"),
            read=False
        )
        db.session.add(msg)
        print(f"Message created")
        
        # Send Notification to Creator
        if job.creator_id:
            print(f"Creating notification for creator: {job.creator_id}")
            notif = Notification(
                id=str(uuid.uuid4()),
                user_id=job.creator_id,
                type='request',
                message=f"{worker_name} requested to work on '{job.title}'",
                timestamp=datetime.now().strftime("%Y-%m-%d %I:%M %p"),
                related_id=job_id,
                read=False
            )
            db.session.add(notif)
            print(f"Notification created for user {job.creator_id}")
        else:
            print(f"WARNING: No creator_id on job {job_id}")
        
        # User Request: "if one worker request... make it hold"
        job.status = 'on_hold'
        db.session.commit()
        print(f"Job status updated to on_hold and committed")
        
        return jsonify({
            'success': True, 
            'message': 'Application sent. Job is now On Hold.',
            'job': job.to_dict(),
            'application': job_application.to_dict()
        }), 201
        
    except Exception as e:
        print(f"ERROR in apply_job: {e}")
        import traceback
        traceback.print_exc()
        db.session.rollback()
        return jsonify({'success': False, 'message': str(e)}), 500
    job.status = 'on_hold'
    db.session.commit()
    
    return jsonify({
        'success': True, 
        'message': 'Application sent. Job is now On Hold.',
        'job': job.to_dict(),
        'application': job_application.to_dict()
    })

@app.route('/api/jobs/<job_id>', methods=['GET'])
def get_job(job_id):
    job = Job.query.get(job_id)
    if not job:
        return jsonify({'success': False, 'message': 'Job not found'}), 404
    return jsonify({'success': True, 'job': job.to_dict()})

@app.route('/api/my-postings', methods=['POST'])
def get_my_postings():
    # In a real app we get user from token, here we accept userId in body for MVP simplicity
    user_id = request.json.get('userId')
    # For demo, match all jobs or filter by creator_id if we implemented it fully. 
    # Let's assume the Demo User (id=2) created the sample jobs for the sake of the workflow.
    # Update sample jobs to have creator_id='2' if not set.
    
    jobs = Job.query.filter((Job.creator_id == user_id) | (Job.creator_id == None)).all()
    
    result = []
    for job in jobs:
        j_dict = job.to_dict()
        # Get applications
        apps = JobApplication.query.filter_by(job_id=job.id).all()
        j_dict['applications'] = [a.to_dict() for a in apps]
        result.append(j_dict)
        
    return jsonify(result)

@app.route('/api/my-applications', methods=['POST'])
def get_my_applications():
    user_id = request.json.get('userId')
    apps = JobApplication.query.filter_by(worker_id=user_id).all()
    
    results = []
    for app in apps:
        job = Job.query.get(app.job_id)
        if job:
            job_data = job.to_dict()
            job_data['myApplicationStatus'] = app.status  # pending, accepted, rejected
            job_data['myApplicationId'] = app.id
            results.append(job_data)
            
    return jsonify(results)

@app.route('/api/applications/<app_id>/accept', methods=['POST'])
def accept_application(app_id):
    application = JobApplication.query.get(app_id)
    if not application:
        return 404
        
    # 2a. If Customer ACCEPTS: Set job_status = "LOCKED" (alias 'locked' or 'accepted')
    application.status = 'accepted'
    
    job = Job.query.get(application.job_id)
    job.status = 'locked' 
    job.worker_id = application.worker_id # Set approved_worker
    
    # Reject other applications (cleanup)
    others = JobApplication.query.filter(JobApplication.job_id == job.id, JobApplication.id != app_id).all()
    for o in others:
        o.status = 'rejected'

    # Notify Worker: "Your request has been approved."
    notif = Notification(
        id=str(uuid.uuid4()),
        user_id=application.worker_id,
        type='accept',
        message=f"Your request has been approved.",
        timestamp=datetime.now().strftime("%Y-%m-%d %I:%M %p"),
        related_id=job.id
    )
    db.session.add(notif)
        
    db.session.commit()
    return jsonify({'success': True})

@app.route('/api/applications/<app_id>/reject', methods=['POST'])
def reject_application(app_id):
    application = JobApplication.query.get(app_id)
    if not application:
        return 404
        
    application.status = 'rejected'
    
    # 2b. If Customer REJECTS: Set job_status = "OPEN"
    job = Job.query.get(application.job_id)
    # Reset to OPEN only if it was holding
    if job.status == 'on_hold' or job.status == 'hold':
        job.status = 'open'
        job.worker_id = None # Clear approved worker if any

    # Notify Worker: "Your request has been rejected."
    notif = Notification(
        id=str(uuid.uuid4()),
        user_id=application.worker_id,
        type='reject',
        message=f"Your request has been rejected.",
        timestamp=datetime.now().strftime("%Y-%m-%d %I:%M %p"),
        related_id=job.id
    )
    db.session.add(notif)

    db.session.commit()
    return jsonify({'success': True})

@app.route('/api/jobs', methods=['POST'])
def create_job():
    data = request.json
    print(f"Creating job with data: {data}")
    try:
        # Validate required fields
        if not data.get('title') or not data.get('category') or not data.get('description'):
            return jsonify({'success': False, 'message': 'Title, category, and description are required'}), 400
        
        amount = data.get('amount', {})
        
        try:
            min_amount = int(float(amount.get('min', 0) or 0))
            max_amount = int(float(amount.get('max', 0) or 0))
        except (ValueError, TypeError):
            return jsonify({'success': False, 'message': 'Invalid budget amount'}), 400
        
        if min_amount <= 0 or max_amount <= 0:
            return jsonify({'success': False, 'message': 'Budget amounts must be greater than 0'}), 400
        
        if min_amount > max_amount:
            return jsonify({'success': False, 'message': 'Minimum budget cannot exceed maximum budget'}), 400
        
        new_job = Job(
            id=str(uuid.uuid4()),
            title=data.get('title'),
            description=data.get('description'),
            category=data.get('category'),
            min_amount=min_amount,
            max_amount=max_amount,
            location=data.get('location', 'Online'),
            deliveryType=data.get('deliveryType', 'pickup'),
            urgency=data.get('urgency', 'flexible'),
            customerName=data.get('customerName'),
            customerRating=0.0,
            postedAt=datetime.now().strftime("%Y-%m-%d %I:%M %p"),
            status='open',
            paymentMode=data.get('paymentMode', 'online'),
            creator_id=data.get('creatorId') # Store creator
        )
        db.session.add(new_job)
        db.session.commit()
        
        return jsonify({'success': True, 'job': new_job.to_dict()}), 201
    except Exception as e:
        print(f"Error creating job: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'success': False, 'message': str(e)}), 500




@app.route('/api/jobs/<job_id>/complete', methods=['POST'])
def complete_job(job_id):
    data = request.json
    rating = data.get('rating')
    review = data.get('review')
    
    job = Job.query.get(job_id)
    if job:
        job.status = 'completed'
        job.rating = rating
        job.review = review
        
        # Update worker rating
        worker = User.query.get(job.worker_id)
        if worker:
            worker.rating = (worker.rating * worker.reviewCount + rating) / (worker.reviewCount + 1)
            worker.reviewCount += 1
            worker.credits += 500 # Reward
            
            # Notify Worker
            notif = Notification(
                id=str(uuid.uuid4()),
                user_id=worker.id,
                type='info',
                message=f"Job '{job.title}' completed! You received {rating} stars.",
                timestamp=datetime.now().strftime("%Y-%m-%d %I:%M %p"),
                related_id=job_id
            )
            db.session.add(notif)
            
        db.session.commit()
        return jsonify({'success': True})
    return jsonify({'success': False}), 404

@app.route('/api/notifications/<n_id>/read', methods=['POST'])
def mark_notification_read(n_id):
    notif = Notification.query.get(n_id)
    if notif:
        notif.read = True
        db.session.commit()
        return jsonify({'success': True})
    return jsonify({'success': False, 'message': 'Notification not found'}), 404

@app.route('/api/notifications/mark-all-read', methods=['POST'])
def mark_all_notifications_read():
    """Mark all notifications as read for a user"""
    data = request.json
    user_id = data.get('userId')
    if not user_id:
        return jsonify({'success': False, 'message': 'userId required'}), 400
    
    Notification.query.filter_by(user_id=user_id, read=False).update({'read': True})
    db.session.commit()
    return jsonify({'success': True})


@app.route('/api/applications/<app_id>/cancel', methods=['POST'])
def cancel_application(app_id):
    application = JobApplication.query.get(app_id)
    if not application:
        return jsonify({'success': False, 'message': 'Application not found'}), 404
        
    job = Job.query.get(application.job_id)
    
    # Allow cancel if pending
    if application.status == 'pending':
        # Remove the application
        db.session.delete(application)
        
        # If this was the only application keeping the job "on_hold", check if we should open it?
        # Actually user logic was "if one worker request... make it hold".
        # So if we cancel, we should check if there are any *other* pending requests.
        other_apps = JobApplication.query.filter(JobApplication.job_id == job.id, JobApplication.id != app_id, JobApplication.status == 'pending').count()
        
        if other_apps == 0:
            job.status = 'open' # Re-open the job
            
        db.session.commit()
        return jsonify({'success': True})
        
    return jsonify({'success': False, 'message': 'Cannot cancel processed application'}), 400

@app.route('/api/jobs/<job_id>', methods=['DELETE'])
def delete_job(job_id):
    job = Job.query.get(job_id)
    if not job:
        return jsonify({'success': False}), 404
        
    # Cascade delete applications? or keep them?
    # For now simple delete
    JobApplication.query.filter_by(job_id=job_id).delete()
    db.session.delete(job)
    db.session.commit()
    return jsonify({'success': True})




@app.route('/api/users/<user_id>', methods=['GET'])
def get_user(user_id):
    user = User.query.get(user_id)
    if not user:
        return jsonify({'success': False, 'message': 'User not found'}), 404
    return jsonify({'success': True, 'user': user.to_dict()})

@app.route('/api/users/<user_id>', methods=['PUT'])
def update_user(user_id):
    user = User.query.get(user_id)
    if not user:
        return jsonify({'success': False, 'message': 'User not found'}), 404
    
    data = request.json
    
    # Update fields if provided
    if 'name' in data: user.name = data['name']
    if 'email' in data: user.email = data['email']
    if 'phone' in data: user.phone = data['phone']
    if 'address' in data: user.address = data['address']
    if 'availability' in data: user.availability = data['availability']
    if 'skills' in data: user.skills_str = json.dumps(data['skills'])
    if 'rating' in data: user.rating = data['rating']
    if 'reviewCount' in data: user.reviewCount = data['reviewCount']
    if 'credits' in data: user.credits = data['credits']
    
    db.session.commit()
    return jsonify({'success': True, 'user': user.to_dict()})

if __name__ == '__main__':
    if not os.path.exists('instance'):
        os.makedirs('instance')
    init_db()
    app.run(debug=True, port=5000)
