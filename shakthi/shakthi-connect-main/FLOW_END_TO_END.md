# Shakthi Connect — Complete User Flow (End-to-End)

## 📍 Phase 1: Onboarding & Authentication

### Step 1: User Lands on Platform
- **URL**: `http://localhost:8081/`
- **Page**: `LanguageSelect` component
- **Action**: User selects language (Hindi/English/Tamil/Kannada)
- **Next**: Routes to `/login`

### Step 2: Login/OTP Flow
- **URL**: `http://localhost:8081/login`
- **Page**: `Login.tsx`
- **User Options**:
  - **Option A**: Email + Password login
  - **Option B**: Phone + OTP (recommended for India)

#### Phone + OTP Flow (Primary):
1. User enters phone number (e.g., `9876543210`)
2. Clicks **"Send OTP"** button
   - Frontend: calls POST `/api/send-otp` with `{ "phone": "9876543210" }`
   - Backend: prints `"Sending OTP to 9876543210: 123456"` (mock SMS)
   - UI feedback: Toast message "OTP sent! (Use 123456)"
3. OTP input field appears
4. User enters OTP: `123456`
5. Clicks **"Login"** button
   - Frontend: Verifies OTP (hardcoded as `123456`)
   - Backend: POST `/api/login` with `{ "phone": "9876543210" }`
   - **Backend Response**:
     ```json
     {
       "success": true,
       "user": {
         "id": "uuid-user-123",
         "name": "Priya Sharma",
         "email": "priya@example.com",
         "phone": "9876543210",
         "address": "Hyderabad",
         "skills": ["Stitching", "Tailoring"],
         "credits": 2500,
         "rating": 4.8,
         "reviewCount": 47,
         "isVerified": true,
         "availability": "Flexible"
       }
     }
     ```
6. Frontend stores in `localStorage['feminine-shakthi-user']`
7. **AuthContext** updates: `isAuthenticated = true`, `user = {...}`
8. Auto-redirect to `/dashboard`

---

## 👤 Phase 2: Dashboard & Profile Setup

### Step 3: Landing on Dashboard
- **URL**: `http://localhost:8081/dashboard`
- **Page**: `Dashboard.tsx` (Protected Route)
- **Display**:
  - User greeting: "Welcome, Priya!"
  - Profile card with:
    - Avatar & name
    - Rating (⭐ 4.8 / 47 reviews)
    - Credits balance: ₹2,500
    - Availability badge: "Flexible"
  - Quick action buttons:
    - 🛠 "Browse Jobs" → `/take-work`
    - 💼 "Post Job" → `/give-work`
    - 💬 "Messages" → `/chat`
    - ⚙️ "Settings" → `/settings`

### Step 4: Complete Profile (Optional but Recommended)
- **URL**: `http://localhost:8081/profile`
- **Page**: `Profile.tsx` (Protected)
- **Actions**:
  - Edit name, phone, address
  - Add/update profile picture
  - Add Aadhaar last 4 digits for verification
  - Select gender (women empowerment focus)
  - Set availability (Full-time, Part-time, Flexible)
- **API Call**: Implicit (frontend state update, backend persists on demand)

### Step 5: Add Skills
- **URL**: `http://localhost:8081/skills`
- **Page**: `Skills.tsx` (Protected)
- **Actions**:
  - Browse skill categories (Tailoring, Cooking, Childcare, Beauty, Admin, etc.)
  - Select/add skills (e.g., "Stitching", "Embroidery", "Home Cooking")
  - Rate proficiency (Beginner/Intermediate/Expert)
  - Save skills
- **Backend**: Skills stored in `User.skills_str` (JSON array)

---

## 💰 Phase 3A: Job Seeker Path (Take Work / Worker)

### Step 6A: Browse Available Jobs
- **URL**: `http://localhost:8081/take-work`
- **Page**: `TakeWork.tsx` (Protected)
- **Frontend Action**:
  - GET `/api/jobs` (on mount)
  - **Backend Response**:
    ```json
    [
      {
        "id": "job-uuid-1",
        "title": "Blouse Stitching",
        "description": "Traditional blouse with embroidery",
        "category": "Tailoring",
        "amount": {"min": 300, "max": 500},
        "location": "Hyderabad",
        "deliveryType": "pickup",
        "urgency": "high",
        "customerName": "Lakshmi",
        "customerRating": 4.9,
        "postedAt": "2025-12-09 02:30 PM",
        "status": "open",
        "creator_id": "customer-uuid"
      },
      ...
    ]
    ```
- **Display**: Job cards in grid/list with filters:
  - Category filter (Tailoring, Cooking, etc.)
  - Location filter
  - Amount range slider
  - Urgency badge (Low/Medium/High/Urgent)
- **User Action**: Clicks on a job → **"Apply Now"** button

### Step 7A: Apply for a Job
- **Current Page**: TakeWork or Job Details Modal
- **User Input**: None (instant apply)
- **Frontend Action**:
  - POST `/api/jobs/{job_id}/apply` with:
    ```json
    { "workerId": "user-uuid-123" }
    ```
- **Backend Workflow**:
  1. Validate: Job status == "open"? ✅
  2. Validate: Worker not already applied? ✅
  3. Create `JobApplication`:
     ```
     id: uuid, job_id, worker_id, status="pending", timestamp=now
     ```
  4. Create system `Message`:
     ```
     "EXT_SYSTEM: Priya has requested to work on 'Blouse Stitching'"
     ```
  5. Create `Notification` for job creator (Lakshmi):
     ```
     type="request", message="Priya requested to work on 'Blouse Stitching'"
     ```
  6. Update Job: `status = "on_hold"` (user requirement: first apply → hold)
- **Frontend Response** (success):
  ```json
  {
    "success": true,
    "message": "Application sent. Job is now On Hold.",
    "job": { ...job, "status": "on_hold" },
    "application": { "id": "app-uuid", "status": "pending", ... }
  }
  ```
- **UI Feedback**: Toast: "Application sent! ✅ Waiting for customer approval..."
- **Button Change**: "Apply Now" → "Pending (Waiting for approval)"

### Step 8A: View My Applications
- **URL**: `http://localhost:8081/my-tasks`
- **Page**: `MyTasks.tsx` (Protected)
- **Frontend Action**:
  - POST `/api/my-applications` with `{ "userId": "user-uuid-123" }`
- **Backend Response**:
  ```json
  [
    {
      "id": "job-uuid-1",
      "title": "Blouse Stitching",
      "description": "...",
      "status": "on_hold",
      "myApplicationStatus": "pending",
      "myApplicationId": "app-uuid-1"
    },
    ...
  ]
  ```
- **Display**: Cards showing:
  - Job title & customer name
  - Application status badge: "⏳ Pending" / "✅ Accepted" / "❌ Rejected"
  - Expected payment
  - Action buttons:
    - If pending: "Cancel Application"
    - If accepted: "Chat with Customer" / "Mark as Completed"

### Step 9A: Accepted Application → Chat & Negotiation
- **Trigger**: Customer accepts application (see Phase 3B Step 7B)
- **Status Change**: Application status → "accepted", Job status → "locked"
- **New Notification**: "✅ Your application has been accepted for 'Blouse Stitching'!"
- **URL**: `http://localhost:8081/chat/{job_id}`
- **Page**: `Chat.tsx` (Protected)
- **Frontend Action**:
  - GET `/api/messages/{job_id}` (on mount + polling)
  - **Backend Response**:
    ```json
    [
      {
        "id": "msg-uuid-1",
        "jobId": "job-uuid-1",
        "senderId": "customer-uuid",
        "content": "Hi Priya! Can you start by Monday?",
        "timestamp": "02:35 PM"
      },
      {
        "id": "msg-uuid-2",
        "jobId": "job-uuid-1",
        "senderId": "user-uuid-123",
        "content": "Yes, absolutely! I can start Monday morning.",
        "timestamp": "02:36 PM"
      },
      ...
    ]
    ```
- **User Action**: Types message & clicks "Send"
- **Frontend Action**:
  - POST `/api/messages` with:
    ```json
    { "jobId": "job-uuid-1", "senderId": "user-uuid-123", "content": "..." }
    ```
- **Real-time**: Chat updates (GET every 5 seconds or via WebSocket in production)

### Step 10A: Complete Job & Get Rating
- **Trigger**: Worker marks job complete OR Customer marks job complete
- **Frontend Action**:
  - POST `/api/jobs/{job_id}/complete` with:
    ```json
    { "rating": 5, "review": "Excellent work! Professional quality." }
    ```
- **Backend Workflow**:
  1. Update Job: `status = "completed"`, store rating & review
  2. Update Worker (Priya):
     ```
     rating = (4.8 * 47 + 5) / 48 = 4.808
     reviewCount = 48
     credits += 500 (reward)
     ```
  3. Create Notification for Priya:
     ```
     "✅ Job 'Blouse Stitching' completed! You received ⭐ 5 stars. +500 credits added."
     ```
- **Frontend Response**:
  ```json
  { "success": true }
  ```
- **UI Update**: MyTasks card → "✅ Completed" badge, rating shown

### Step 11A: View Work History
- **URL**: `http://localhost:8081/history`
- **Page**: `WorkHistory.tsx` (Protected)
- **Display**: All completed jobs with:
  - Job title, customer name, amount earned
  - Completion date, customer rating & review
  - Summary: Total jobs, avg rating, total credits earned

---

## 🏢 Phase 3B: Job Poster Path (Give Work / Customer)

### Step 6B: Post a New Job
- **URL**: `http://localhost:8081/give-work`
- **Page**: `GiveWork.tsx` (Protected)
- **Form Fields**:
  - Job title (e.g., "Blouse Stitching")
  - Description (e.g., "Traditional blouse with embroidery work")
  - Category dropdown (Tailoring, Cooking, Childcare, etc.)
  - Budget: Min amount & Max amount (e.g., 300–500)
  - Location (e.g., "Hyderabad" or "Online")
  - Delivery type: Pickup / Delivery / Online
  - Urgency: Low / Medium / High / Urgent
  - Customer name (auto-filled with user name)
- **Submit Action**: Clicks "Post Job" button
  - Frontend: POST `/api/jobs` with:
    ```json
    {
      "title": "Blouse Stitching",
      "description": "...",
      "category": "Tailoring",
      "amount": {"min": 300, "max": 500},
      "location": "Hyderabad",
      "deliveryType": "pickup",
      "urgency": "high",
      "customerName": "Lakshmi",
      "creatorId": "customer-uuid"
    }
    ```
- **Backend Response**:
  ```json
  {
    "success": true,
    "job": {
      "id": "job-uuid-1",
      "status": "open",
      "postedAt": "2025-12-09 02:30 PM",
      ...
    }
  }
  ```
- **UI Feedback**: Toast: "Job posted! ✅ Workers will see your job now."
- **Redirect**: Auto-navigate to `/my-postings`

### Step 7B: View Job Applications & Accept/Reject
- **URL**: `http://localhost:8081/my-postings`
- **Page**: `MyPostings.tsx` (Protected)
- **Frontend Action**:
  - POST `/api/my-postings` with `{ "userId": "customer-uuid" }`
- **Backend Response**:
  ```json
  [
    {
      "id": "job-uuid-1",
      "title": "Blouse Stitching",
      "status": "on_hold",
      "applications": [
        {
          "id": "app-uuid-1",
          "workerId": "worker-uuid-1",
          "workerName": "Priya",
          "workerRating": 4.8,
          "status": "pending",
          "timestamp": "02:32 PM"
        },
        {
          "id": "app-uuid-2",
          "workerId": "worker-uuid-2",
          "workerName": "Divya",
          "workerRating": 4.6,
          "status": "pending",
          "timestamp": "02:40 PM"
        }
      ]
    }
  ]
  ```
- **Display**: Job cards showing:
  - Job title, status badge, posting date
  - Applications section with worker cards:
    - Worker name, rating, skills
    - Action buttons: "Accept" / "Reject" / "View Profile"

### Step 8B: Accept an Application
- **Trigger**: Customer clicks "Accept" on Priya's application
- **Frontend Action**:
  - POST `/api/applications/{app_id}/accept`
- **Backend Workflow**:
  1. Update JobApplication: `status = "accepted"`
  2. Update Job: `status = "locked"`, `worker_id = "worker-uuid-1"` (Priya assigned)
  3. Reject all other applications:
     - Divya's app: `status = "rejected"`
     - Create Notification for Divya: "❌ Your application was rejected for 'Blouse Stitching'"
  4. Create Notification for Priya: "✅ Your application has been accepted for 'Blouse Stitching'!"
- **Frontend Response**:
  ```json
  { "success": true }
  ```
- **UI Update**: 
  - Priya's application badge → "✅ Accepted"
  - Other applications grayed out → "❌ Rejected"
  - Job status → "🔒 Locked"

### Step 9B: Chat with Accepted Worker
- **Trigger**: Job locked with accepted worker
- **URL**: `http://localhost:8081/chat/{job_id}`
- **Same as Step 9A**: Both customer and worker can chat

### Step 10B: Mark Job Complete & Rate Worker
- **Trigger**: Work delivered, customer satisfied
- **Frontend Action**:
  - POST `/api/jobs/{job_id}/complete` with:
    ```json
    { "rating": 5, "review": "Excellent work! Professional quality." }
    ```
- **Backend**: Same as Step 10A (worker's rating & credits updated)

### Step 11B: View Posted Jobs History
- **URL**: `http://localhost:8081/my-postings`
- **Display**: All posted jobs with:
  - Job title, status (open/on_hold/locked/completed)
  - Assigned worker name (if any)
  - Total applications received
  - Completion status & rating given (if completed)

---

## 🔔 Phase 4: Notifications & Settings

### Step 12: Notifications Hub
- **URL**: `http://localhost:8081/dashboard` (notifications icon/badge)
- **Frontend Action**:
  - GET `/api/notifications?userId=user-uuid-123` (polling every 10 sec)
- **Backend Response**:
  ```json
  [
    {
      "id": "notif-uuid-1",
      "message": "Priya requested to work on 'Blouse Stitching'",
      "type": "request",
      "read": false,
      "timestamp": "2025-12-09 02:32 PM",
      "relatedId": "job-uuid-1"
    },
    {
      "id": "notif-uuid-2",
      "message": "Your application has been accepted for 'Blouse Stitching'!",
      "type": "accept",
      "read": false,
      "timestamp": "2025-12-09 02:45 PM",
      "relatedId": "job-uuid-1"
    },
    ...
  ]
  ```
- **User Action**: Clicks notification
  - If type="request" → navigate to `/my-postings` (job detail)
  - If type="accept" → navigate to `/chat/{job_id}`
  - If type="reject" → navigate to `/my-tasks`
  - Auto-mark as read: POST `/api/notifications/{notif_id}/read`

### Step 13: Settings & Profile Updates
- **URL**: `http://localhost:8081/settings`
- **Page**: `Settings.tsx` (Protected)
- **Options**:
  - Change language
  - Update notification preferences
  - Privacy settings
  - Account security (change password, 2FA)
  - Delete account (if needed)

### Step 14: View Nearby Workers/Jobs (Geolocation-based)
- **URL**: `http://localhost:8081/near-me`
- **Page**: `NearMe.tsx` (Protected)
- **Future Feature**: Filter jobs/workers within X km radius (currently mock data)

---

## 🌐 Phase 5: End State & Loop

### Final State (After Completion Cycle)
- **Worker (Priya)**:
  - Credits: 2,500 → 3,000 (+500 for completed job)
  - Rating: 4.8 → 4.81 (cumulative with review)
  - Review count: 47 → 48
  - Work history: +1 job added
  - Can now apply for new jobs

- **Customer (Lakshmi)**:
  - Job: "Blouse Stitching" marked "✅ Completed"
  - Worker: Priya rated ⭐ 5 stars
  - Job history: +1 completed transaction

### Loop & Repeat
- **Worker**: Continues to browse & apply for new jobs (Step 6A onward)
- **Customer**: Posts new jobs or reviews existing work
- **Cycle**: Steps 6A → 11A (or 6B → 11B) repeat

---

## 🛣️ Complete User Journey Map (Visual)

```
┌─────────────────────────────────────────────────────────────────────┐
│                    SHAKTHI CONNECT USER FLOW                        │
└─────────────────────────────────────────────────────────────────────┘

          [ONBOARDING]
             │
             ├─ Step 1: Language Select (/)
             │
             ├─ Step 2: Phone + OTP Login (/login)
             │   └─ Send OTP → Verify OTP → Login
             │
             ├─ Step 3: Dashboard (/dashboard)
             │
    ┌────────┴────────────────────────────────────────┐
    │         PROFILE SETUP (Optional)                │
    │                                                 │
    ├─ Step 4: Complete Profile (/profile)           │
    │                                                 │
    ├─ Step 5: Add Skills (/skills)                  │
    │                                                 │
    └─────────────────────┬──────────────────────────┘
                          │
        ┌─────────────────┴─────────────────┐
        │                                   │
    [WORKER PATH]                      [CUSTOMER PATH]
    (Take Work)                        (Give Work)
        │                                   │
        ├─ Step 6A: Browse Jobs            ├─ Step 6B: Post Job
        │   (/take-work)                   │   (/give-work)
        │                                   │
        ├─ Step 7A: Apply for Job          ├─ Step 7B: View Applications
        │   [POST /api/jobs/:id/apply]     │   (/my-postings)
        │                                   │
        ├─ Step 8A: View My Applications   ├─ Step 8B: Accept/Reject App
        │   (/my-tasks)                    │   [POST /api/applications/.../accept|reject]
        │   [Status: pending]              │
        │                                   │
        └────────────────┬──────────────────┘
                         │
        ┌────────────────┴──────────────────┐
        │    [MATCHED - Job Locked]         │
        │    (Both sides visible)           │
        │                                   │
        ├─ Step 9: Chat (/chat/:job_id)    │
        │   [GET/POST /api/messages]       │
        │                                   │
        ├─ Step 10: Complete & Rate        │
        │   [POST /api/jobs/:id/complete]  │
        │                                   │
        ├─ Step 11: View History           │
        │   (/history or /my-postings)     │
        │                                   │
        └────────────────┬──────────────────┘
                         │
        ┌────────────────┴──────────────────┐
        │   [COMPLETION & REWARDS]         │
        │   - Credits added/deducted       │
        │   - Rating updated               │
        │   - Notifications sent           │
        │   - History recorded             │
        │                                   │
        └────────────────┬──────────────────┘
                         │
    ┌────────────────────┴─────────────────────────┐
    │         [CONTINUOUS LOOP]                   │
    │                                             │
    ├─ Step 12: View Notifications (/dashboard)  │
    │                                             │
    ├─ Step 13: Update Settings (/settings)      │
    │                                             │
    ├─ Step 14: Explore Nearby (/near-me)        │
    │                                             │
    └───────────────┬──────────────────────────────┘
                    │
              [RETURN TO STEP 6A or 6B]
              (Start New Job Cycle)
```

---

## 📊 Data Flow Summary

| Step | Frontend Action | API Call | Backend Response | State Update |
|------|---|---|---|---|
| 2 | Enter phone + OTP | POST `/api/send-otp`, `POST /api/login` | User object | `authContext.user = {...}`, `isAuthenticated = true` |
| 6A | Click job card | GET `/api/jobs` | Job array | Display jobs |
| 7A | Click "Apply" | POST `/api/jobs/:id/apply` | Application + Job | Job status: `open` → `on_hold` |
| 8A | View my apps | POST `/api/my-applications` | Jobs with `myApplicationStatus` | Display pending/accepted apps |
| 6B | Fill form + post | POST `/api/jobs` | New job object | Redirect to `/my-postings` |
| 7B | View posted jobs | POST `/api/my-postings` | Jobs + applications | Display with action buttons |
| 8B | Click "Accept" | POST `/api/applications/:id/accept` | Success | Job status: `on_hold` → `locked` |
| 9 | Type + send message | POST `/api/messages` | Message object | Chat updates |
| 10 | Rate + mark done | POST `/api/jobs/:id/complete` | Success | Job status: `locked` → `completed` |
| 12 | Check notifications | GET `/api/notifications?userId=...` | Notification array | Display unread count |

---

## 🔐 Key Business Logic

1. **Job Status Lifecycle**: `open` → `on_hold` (first apply) → `locked` (accepted) → `completed`
2. **Rejection Auto-Reopen**: If all applications rejected, job returns to `open`
3. **Rating System**: Weighted average of worker ratings across all completed jobs
4. **Credits**: Workers earn 500 credits per completed job; can be used for future features
5. **Notifications**: Automatic triggers for apply, accept, reject, completion events
6. **Verification**: Workers marked as "isVerified" for trust (Aadhaar, ID verification in production)

---

## 🚀 Production Enhancements (Future)

- **Real OTP**: Integrate Twilio/Fast2SMS for actual SMS delivery
- **Payments**: Stripe/PayU integration for secure transactions
- **GPS Location**: Real geolocation instead of mock near-me data
- **Real-time Chat**: WebSocket (Socket.io) instead of polling
- **Image Upload**: S3/CloudFront for profile pictures & job proofs
- **Search**: Full-text search for jobs by title/description
- **Reviews**: Star ratings + written reviews on worker profiles
- **Escrow**: Payment held by platform until job completion
- **Admin Dashboard**: Moderation, dispute resolution, analytics

