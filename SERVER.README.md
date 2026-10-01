# TUTORON INDIA — Production Backend (Django 5 + Django REST Framework)

**TutorOn India** is an EdTech student-teacher marketplace and online coaching platform backend designed for India. It connects students with verified teachers while strictly protecting user privacy through admin-controlled contact unlocking.

---

## 🌟 Core Business Rules & Architectural Highlights

1. **NO Live Class Hosting**:
   - The platform does not host live video conferencing internally (No WebRTC/Zoom native SDK).
   - Supported class formats:
     - `RECORDED_VIDEO`: Validated video file uploads (size, extension, MIME).
     - `YOUTUBE`: External YouTube URL (domain and HTTPS whitelisted).
     - `ZOOM`: External Zoom meeting URL (domain and HTTPS whitelisted).
     - `GOOGLE_MEET`: External Google Meet URL (domain and HTTPS whitelisted).
2. **Contact Privacy By Design**:
   - Phone numbers and emails are strictly **HIDDEN** across all public teacher/student profiles, searches, batches, and messaging.
   - Contact details are unlocked ONLY via a formal connection workflow (`ConnectionRequest` + `ContactAccess`) approved by Admin and accessed via a dedicated secure endpoint: `GET /api/v1/connections/{id}/contact/`.
3. **Consolidated App Structure**:
   - All models consolidated in [study/models.py](file:///c:/Users/Dell%20Pc/Desktop/Learning/my_learning_project/study/models.py).
   - All serializers consolidated in [study/serializers.py](file:///c:/Users/Dell%20Pc/Desktop/Learning/my_learning_project/study/serializers.py).
   - All views and business logic consolidated in [study/views.py](file:///c:/Users/Dell%20Pc/Desktop/Learning/my_learning_project/study/views.py).
4. **Standardized API Response**:
   - Every response follows a unified JSON envelope:
     ```json
     {
       "success": true,
       "message": "...",
       "data": { ... }
     }
     ```

---

## 🔑 Demo Credentials (from `seed_demo_data`)

| Role | Email | Password | Notes |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@tutoron.in` | `Admin@12345` | Full admin privileges |
| **Teacher** | `rajesh.sharma@tutoron.in` | `Teacher@12345` | Physics / Maths, **VERIFIED** |
| **Teacher** | `ananya.verma@tutoron.in` | `Teacher@12345` | Chemistry / Biology, **VERIFIED** |
| **Teacher** | `amit.patel@tutoron.in` | `Teacher@12345` | English, **PENDING_VERIFICATION** |
| **Student** | `aarav.kumar@student.in` | `Student@12345` | Enrolled in JEE Batch |
| **Student** | `priya.singh@student.in` | `Student@12345` | Enrolled in JEE Batch |
| **Student** | `rohit.sharma@student.in` | `Student@12345` | Enrolled in NEET Batch |

---

## 🚀 Getting Started

### 1. Migrations & Seeding
```bash
python manage.py makemigrations study
python manage.py migrate
python manage.py seed_demo_data
```

### 2. Running Automated Tests
```bash
python manage.py test study
```

### 3. Running the Server
```bash
python manage.py runserver
```

### 4. Interactive API Documentation
- **Swagger UI**: [http://127.0.0.1:8000/api/docs/](http://127.0.0.1:8000/api/docs/)
- **ReDoc**: [http://127.0.0.1:8000/api/redoc/](http://127.0.0.1:8000/api/redoc/)
- **OpenAPI Schema**: [http://127.0.0.1:8000/api/schema/](http://127.0.0.1:8000/api/schema/)
- **Django Admin**: [http://127.0.0.1:8000/admin/](http://127.0.0.1:8000/admin/)

---

## 📚 API Endpoints, Payloads & Responses

### 1. Authentication (`/api/v1/auth/`)

#### 🔹 Student Registration
- **URL**: `POST /api/v1/auth/register/student/`
- **Request Payload**:
  ```json
  {
    "email": "student.new@example.com",
    "password": "Password@123",
    "first_name": "Rohan",
    "last_name": "Mehta",
    "phone": "+919876543210",
    "grade_target": "Class 12 CBSE"
  }
  ```
- **Response Payload (`201 Created`)**:
  ```json
  {
    "success": true,
    "message": "Student registered successfully.",
    "data": {
      "user_id": "c1f3a2b4-7e89-4d12-9c34-89abcdef0123",
      "email": "student.new@example.com",
      "role": "STUDENT",
      "tokens": {
        "access": "eyJhbGciOiJIUzI1NiIsIn...",
        "refresh": "eyJhbGciOiJIUzI1NiIsIn..."
      }
    }
  }
  ```

#### 🔹 Teacher Registration
- **URL**: `POST /api/v1/auth/register/teacher/`
- **Request Payload**:
  ```json
  {
    "email": "teacher.new@example.com",
    "password": "Teacher@12345",
    "first_name": "Vikram",
    "last_name": "Malhotra",
    "phone": "+919811122233",
    "headline": "Senior Mathematics Faculty | 10+ Years Exp",
    "bio": "Specialized in IIT JEE Advanced calculus and algebra.",
    "subjects": ["Mathematics", "Statistics"],
    "qualifications": "M.Sc Mathematics (IIT Bombay)",
    "experience_years": 10,
    "hourly_rate": 1500.00
  }
  ```
- **Response Payload (`201 Created`)**:
  ```json
  {
    "success": true,
    "message": "Teacher registered successfully. Account is pending verification.",
    "data": {
      "user_id": "d5e6f7a8-1234-4567-89ab-cdef01234567",
      "email": "teacher.new@example.com",
      "role": "TEACHER",
      "verification_status": "PENDING_VERIFICATION",
      "tokens": {
        "access": "eyJhbGciOiJIUzI1NiIsIn...",
        "refresh": "eyJhbGciOiJIUzI1NiIsIn..."
      }
    }
  }
  ```

#### 🔹 User Login (JWT)
- **URL**: `POST /api/v1/auth/login/`
- **Request Payload**:
  ```json
  {
    "email": "admin@tutoron.in",
    "password": "Admin@12345"
  }
  ```
- **Response Payload (`200 OK`)**:
  ```json
  {
    "success": true,
    "message": "Login successful.",
    "data": {
      "access": "eyJhbGciOiJIUzI1NiIsIn...",
      "refresh": "eyJhbGciOiJIUzI1NiIsIn...",
      "user": {
        "id": "e2a1b3c4-5d6e-7f8a-9b0c-1d2e3f4a5b6c",
        "email": "admin@tutoron.in",
        "first_name": "Super",
        "last_name": "Admin",
        "role": "ADMIN",
        "is_verified": true
      }
    }
  }
  ```

#### 🔹 Refresh Token
- **URL**: `POST /api/v1/auth/token/refresh/`
- **Request Payload**:
  ```json
  {
    "refresh": "eyJhbGciOiJIUzI1NiIsIn..."
  }
  ```
- **Response Payload (`200 OK`)**:
  ```json
  {
    "access": "eyJhbGciOiJIUzI1NiIsIn..."
  }
  ```

#### 🔹 Forgot Password & Reset Password
- **Forgot Password**: `POST /api/v1/auth/forgot-password/`
  ```json
  {
    "email": "student.new@example.com"
  }
  ```
- **Reset Password**: `POST /api/v1/auth/reset-password/`
  ```json
  {
    "token": "d8e3b4a2-reset-token...",
    "new_password": "NewStrongPassword@123"
  }
  ```

---

### 2. Teachers Directory (`/api/v1/teachers/`)

#### 🔹 Public Teachers Search & Filter
- **URL**: `GET /api/v1/teachers/?subject=Physics&target_exam=IIT%20JEE&search=Sharma`
- **Headers**: *(Public, No token required)*
- **Response Payload (`200 OK`)**:
  ```json
  {
    "success": true,
    "message": "Teachers retrieved successfully.",
    "data": {
      "count": 1,
      "next": null,
      "previous": null,
      "results": [
        {
          "id": "8a7b6c5d-4e3f-2a1b-0c9d-8e7f6a5b4c3d",
          "teacher_code": "TCH-10248",
          "first_name": "Dr. Rajesh",
          "last_name": "Sharma",
          "headline": "IIT Delhi Physics Alum | 12+ Yrs Coaching",
          "bio": "Mentored 50+ Top 100 AIR rankers in IIT-JEE Advanced.",
          "subjects": ["Physics"],
          "qualifications": "Ph.D IIT Delhi, B.Tech IIT Roorkee",
          "experience_years": 12,
          "hourly_rate": "1500.00",
          "rating": "4.90",
          "total_reviews": 48,
          "total_students": 250,
          "verification_status": "VERIFIED",
          "profile_image": "/media/profiles/rajesh_sharma.jpg"
        }
      ]
    }
  }
  ```
  *(Note: Phone numbers and emails are strictly omitted for privacy).*

#### 🔹 Teacher Verification Submission
- **URL**: `POST /api/v1/teacher/verification/`
- **Headers**: `Authorization: Bearer <Teacher_JWT>`
- **Content-Type**: `multipart/form-data`
- **Request Form Data**:
  - `document_type`: `"AADHAAR"` *(options: `AADHAAR`, `PAN`, `DEGREE`, `EXPERIENCE_CERTIFICATE`)*
  - `document_file`: `[File Attachment - PDF / JPG]`
  - `notes`: `"Submitting IIT Delhi Ph.D degree and Aadhaar card."`
- **Response Payload (`201 Created`)**:
  ```json
  {
    "success": true,
    "message": "Verification documents uploaded successfully. Admin will review within 24-48 hours.",
    "data": {
      "id": "f1e2d3c4-b5a6-7890-1234-56789abcdef0",
      "document_type": "AADHAAR",
      "status": "PENDING",
      "submitted_at": "2026-09-29T10:15:00Z"
    }
  }
  ```

---

### 3. Batches (`/api/v1/batches/` & `/api/v1/teacher/batches/`)

#### 🔹 Teacher Create Batch
- **URL**: `POST /api/v1/teacher/batches/`
- **Headers**: `Authorization: Bearer <Teacher_JWT>`
- **Request Payload**:
  ```json
  {
    "title": "Master Class in Physics for JEE Advanced 2027",
    "subject": "Physics",
    "target_exam": "IIT JEE Advanced",
    "start_date": "2026-10-01",
    "end_date": "2027-04-30",
    "max_students": 30,
    "price": "14999.00",
    "is_published": true,
    "schedule_description": "Mon, Wed, Fri: 6:00 PM - 7:30 PM IST"
  }
  ```
- **Response Payload (`201 Created`)**:
  ```json
  {
    "success": true,
    "message": "Batch created successfully.",
    "data": {
      "id": "3c2b1a0f-9e8d-7c6b-5a4f-3e2d1c0b9a8f",
      "title": "Master Class in Physics for JEE Advanced 2027",
      "subject": "Physics",
      "target_exam": "IIT JEE Advanced",
      "enrolled_count": 0,
      "max_students": 30,
      "price": "14999.00",
      "is_published": true
    }
  }
  ```

#### 🔹 Student Request Enrollment in Batch
- **URL**: `POST /api/v1/batches/{batch_id}/enroll/`
- **Headers**: `Authorization: Bearer <Student_JWT>`
- **Request Payload**:
  ```json
  {
    "notes": "Interested in enrolling for JEE Advanced preparation."
  }
  ```
- **Response Payload (`201 Created`)**:
  ```json
  {
    "success": true,
    "message": "Enrollment request submitted successfully.",
    "data": {
      "enrollment_id": "a9b8c7d6-e5f4-3210-fedc-ba9876543210",
      "status": "REQUESTED",
      "payment_status": "PENDING"
    }
  }
  ```

---

### 4. Classes & Attendance (`/api/v1/`)

#### 🔹 Teacher Create Class (Zoom / Google Meet / YouTube / Recorded)
- **URL**: `POST /api/v1/teacher/batches/{batch_id}/classes/`
- **Headers**: `Authorization: Bearer <Teacher_JWT>`
- **Request Payload (Example 1: Google Meet / Zoom)**:
  ```json
  {
    "title": "Session 01: Rotational Mechanics Fundamentals",
    "description": "Covering Moment of Inertia and Parallel Axis Theorem.",
    "content_type": "GOOGLE_MEET",
    "meeting_url": "https://meet.google.com/abc-defg-hij",
    "scheduled_at": "2026-10-05T18:00:00+05:30",
    "duration_minutes": 90
  }
  ```
- **Request Payload (Example 2: Recorded Video Upload - `multipart/form-data`)**:
  - `title`: `"Recorded Lecture: Optics Part 1"`
  - `content_type`: `"RECORDED_VIDEO"`
  - `video_file`: `[MP4 File Upload]`
  - `duration_minutes`: `60`
- **Response Payload (`201 Created`)**:
  ```json
  {
    "success": true,
    "message": "Class scheduled successfully.",
    "data": {
      "id": "e4d3c2b1-a0f9-8e7d-6c5b-4a3f2e1d0c9b",
      "title": "Session 01: Rotational Mechanics Fundamentals",
      "content_type": "GOOGLE_MEET",
      "meeting_url": "https://meet.google.com/abc-defg-hij",
      "scheduled_at": "2026-10-05T18:00:00+05:30",
      "duration_minutes": 90
    }
  }
  ```

#### 🔹 Mark Attendance
- **URL**: `POST /api/v1/classes/{class_id}/attendance/`
- **Headers**: `Authorization: Bearer <Teacher_JWT>`
- **Request Payload**:
  ```json
  {
    "student_id": "c1f3a2b4-7e89-4d12-9c34-89abcdef0123",
    "status": "PRESENT"
  }
  ```
- **Response Payload (`200 OK`)**:
  ```json
  {
    "success": true,
    "message": "Attendance marked as PRESENT.",
    "data": {
      "student_id": "c1f3a2b4-7e89-4d12-9c34-89abcdef0123",
      "status": "PRESENT",
      "marked_at": "2026-10-05T18:15:20Z"
    }
  }
  ```

---

### 5. Study Materials & Bookmarks (`/api/v1/`)

#### 🔹 Teacher Upload Study Material
- **URL**: `POST /api/v1/teacher/batches/{batch_id}/materials/`
- **Headers**: `Authorization: Bearer <Teacher_JWT>`
- **Content-Type**: `multipart/form-data`
- **Form Data**:
  - `title`: `"Formula Sheet: Electrostatics & Magnetism"`
  - `material_type`: `"DOCUMENT"` *(options: `DOCUMENT`, `ASSIGNMENT`, `NOTES`)*
  - `file`: `[PDF File]`
  - `is_downloadable`: `true`
- **Response Payload (`201 Created`)**:
  ```json
  {
    "success": true,
    "message": "Material uploaded successfully.",
    "data": {
      "id": "b2c3d4e5-f6a7-8901-2345-6789abcdef01",
      "title": "Formula Sheet: Electrostatics & Magnetism",
      "is_downloadable": true,
      "uploaded_at": "2026-09-30T10:00:00Z"
    }
  }
  ```

#### 🔹 Bookmark Material
- **URL**: `POST /api/v1/materials/{material_id}/bookmark/`
- **Headers**: `Authorization: Bearer <Student_JWT>`
- **Response Payload (`200 OK`)**:
  ```json
  {
    "success": true,
    "message": "Material bookmarked successfully."
  }
  ```

---

### 6. Connections & Privacy Contact Unlocking (`/api/v1/connections/`)

#### 🔹 Request Connection (Student to Teacher)
- **URL**: `POST /api/v1/connections/`
- **Headers**: `Authorization: Bearer <Student_JWT>`
- **Request Payload**:
  ```json
  {
    "teacher_id": "8a7b6c5d-4e3f-2a1b-0c9d-8e7f6a5b4c3d",
    "message": "Hello Sir, I want to discuss 1-on-1 coaching for JEE Advanced 2027."
  }
  ```
- **Response Payload (`201 Created`)**:
  ```json
  {
    "success": true,
    "message": "Connection request sent. Awaiting review.",
    "data": {
      "id": "9f8e7d6c-5b4a-3210-fedc-ba9876543210",
      "status": "PENDING",
      "created_at": "2026-09-30T10:30:00Z"
    }
  }
  ```

#### 🔹 Dedicated Secure Contact Unlock
- **URL**: `GET /api/v1/connections/{connection_id}/contact/`
- **Headers**: `Authorization: Bearer <Student_or_Teacher_JWT>`
- **Security Check**: Enforces that connection is approved and neither party has blocked the other.
- **Response Payload (`200 OK`)**:
  ```json
  {
    "success": true,
    "message": "Contact details unlocked securely.",
    "data": {
      "connection_id": "9f8e7d6c-5b4a-3210-fedc-ba9876543210",
      "teacher_name": "Dr. Rajesh Sharma",
      "phone": "+919876543210",
      "email": "rajesh.sharma@tutoron.in",
      "unlocked_at": "2026-09-30T11:00:00Z"
    }
  }
  ```

---

### 7. In-App Messaging (`/api/v1/conversations/`)

#### 🔹 Send Message
- **URL**: `POST /api/v1/conversations/{conversation_id}/messages/`
- **Headers**: `Authorization: Bearer <JWT>`
- **Request Payload**:
  ```json
  {
    "content": "Sir, when is the next doubt-clearing session scheduled?"
  }
  ```
- **Response Payload (`201 Created`)**:
  ```json
  {
    "success": true,
    "message": "Message sent.",
    "data": {
      "id": "11223344-5566-7788-99aa-bbccddeeff00",
      "sender_id": "c1f3a2b4-7e89-4d12-9c34-89abcdef0123",
      "content": "Sir, when is the next doubt-clearing session scheduled?",
      "sent_at": "2026-09-30T11:05:00Z"
    }
  }
  ```

---

### 8. Reviews, Reports & User Blocks

#### 🔹 Submit Batch Review (Enrolled Students Only)
- **URL**: `POST /api/v1/batches/{batch_id}/reviews/`
- **Headers**: `Authorization: Bearer <Student_JWT>`
- **Request Payload**:
  ```json
  {
    "rating": 5,
    "comment": "Outstanding conceptual clarity! Best physics faculty for JEE preparation."
  }
  ```
- **Response Payload (`201 Created`)**:
  ```json
  {
    "success": true,
    "message": "Review submitted successfully.",
    "data": {
      "id": "aa11bb22-cc33-dd44-ee55-ff6677889900",
      "rating": 5,
      "comment": "Outstanding conceptual clarity! Best physics faculty for JEE preparation.",
      "created_at": "2026-09-30T11:10:00Z"
    }
  }
  ```

#### 🔹 Block Abusive User
- **URL**: `POST /api/v1/blocks/`
- **Headers**: `Authorization: Bearer <JWT>`
- **Request Payload**:
  ```json
  {
    "blocked_user_id": "c1f3a2b4-7e89-4d12-9c34-89abcdef0123",
    "reason": "Repeated inappropriate spam in private chat."
  }
  ```
- **Response Payload (`201 Created`)**:
  ```json
  {
    "success": true,
    "message": "User has been blocked. Messages and contact access are now disabled."
  }
  ```

---

### 9. Admin Control Panel (`/api/v1/admin/`)

All admin endpoints require an authenticated user with `role="ADMIN"` or `is_staff=True` passed in the `Authorization: Bearer <Admin_JWT>` header.

---

#### 9.1 Admin Dashboard & Global Analytics

##### 🔹 1. Dashboard Comprehensive KPI Stats
- **URL**: `GET /api/v1/admin/dashboard/`
- **Headers**: `Authorization: Bearer <Admin_JWT>`
- **Response Payload (`200 OK`)**:
  ```json
  {
    "success": true,
    "message": "Admin metrics loaded.",
    "data": {
      "operator": {
        "id": "e2a1b3c4-5d6e-7f8a-9b0c-1d2e3f4a5b6c",
        "name": "Super Admin",
        "email": "admin@tutoron.in",
        "role": "SUPER_ADMIN"
      },
      "kpi_metrics": {
        "total_students": { "value": 1420, "growth_percentage": 8.4, "label": "vs last month" },
        "total_teachers": { "value": 85, "growth_percentage": 5.2, "label": "vs last month" },
        "pending_verifications": { "value": 6, "badge": "Needs Review" },
        "pending_connections": { "value": 14, "badge": "Action Required" },
        "pending_enrollments": { "value": 28, "badge": "Unpaid / Requested" },
        "total_revenue": { "value": 485000.00, "currency": "INR", "monthly": 125000.00 }
      },
      "secondary_metrics": {
        "active_students": 1280,
        "student_engagement_rate": "90.1%",
        "verified_teachers": 72,
        "teacher_verification_rate": "84.7%",
        "active_batches": 34,
        "unlocked_connections": 115
      }
    }
  }
  ```

##### 🔹 2. Dashboard Live Activity Feed
- **URL**: `GET /api/v1/admin/dashboard/activity/`
- **Headers**: `Authorization: Bearer <Admin_JWT>`
- **Response Payload (`200 OK`)**:
  ```json
  {
    "success": true,
    "message": "Recent activity feed retrieved.",
    "data": [
      {
        "id": "act-1",
        "event_type": "TEACHER_VERIFIED",
        "description": "Dr. Rajesh Sharma was verified by Super Admin",
        "timestamp": "2026-09-30T10:14:32Z",
        "severity": "SUCCESS"
      },
      {
        "id": "act-2",
        "event_type": "ENROLLMENT_CONFIRMED",
        "description": "Student Aarav Kumar enrolled in Target JEE Advanced 2027",
        "timestamp": "2026-09-30T09:45:10Z",
        "severity": "INFO"
      }
    ]
  }
  ```

##### 🔹 3. Dashboard Global Search
- **URL**: `GET /api/v1/admin/dashboard/search/?q=rajesh`
- **Headers**: `Authorization: Bearer <Admin_JWT>`
- **Response Payload (`200 OK`)**:
  ```json
  {
    "success": true,
    "message": "Search results for 'rajesh'",
    "data": {
      "teachers": [
        { "id": "8a7b6c5d-4e3f-2a1b-0c9d-8e7f6a5b4c3d", "name": "Dr. Rajesh Sharma", "subject": "Physics", "status": "VERIFIED" }
      ],
      "students": [],
      "batches": [
        { "id": "3c2b1a0f-9e8d-7c6b-5a4f-3e2d1c0b9a8f", "title": "Target JEE Advanced 2027 (Physics)", "teacher": "Dr. Rajesh Sharma" }
      ]
    }
  }
  ```

---

#### 9.2 User & Profile Management

##### 🔹 4. Admin Users Directory
- **URL**: `GET /api/v1/admin/users/?role=TEACHER&is_active=true&search=rajesh`
- **Headers**: `Authorization: Bearer <Admin_JWT>`
- **Response Payload (`200 OK`)**:
  ```json
  {
    "success": true,
    "message": "User directory fetched.",
    "data": {
      "count": 1,
      "results": [
        {
          "id": "8a7b6c5d-4e3f-2a1b-0c9d-8e7f6a5b4c3d",
          "email": "rajesh.sharma@tutoron.in",
          "first_name": "Dr. Rajesh",
          "last_name": "Sharma",
          "phone": "+919876543210",
          "role": "TEACHER",
          "is_active": true,
          "is_verified": true,
          "date_joined": "2026-09-20T12:00:00Z"
        }
      ]
    }
  }
  ```

##### 🔹 5. Admin Teachers Directory & CRUD
- **URL**: `GET /api/v1/admin/teachers/?verification_status=VERIFIED&page=1`
- **Headers**: `Authorization: Bearer <Admin_JWT>`
- **Response Payload (`200 OK`)**:
  ```json
  {
    "success": true,
    "message": "Data fetched successfully",
    "total_count": 85,
    "verified_count": 72,
    "pending_count": 6,
    "data": [
      {
        "id": "8a7b6c5d-4e3f-2a1b-0c9d-8e7f6a5b4c3d",
        "user_id": "7f8e9d0c-1a2b-3c4d-5e6f-7a8b9c0d1e2f",
        "display_name": "Dr. Rajesh Sharma",
        "email": "rajesh.sharma@tutoron.in",
        "phone": "+919876543210",
        "headline": "IIT Delhi Physics Alum | 12+ Yrs Coaching",
        "subjects": ["Physics"],
        "verification_status": "VERIFIED",
        "hourly_rate": "1500.00",
        "rating": "4.90"
      }
    ],
    "pagination": { "page": 1, "page_size": 20, "total": 85, "total_pages": 5 }
  }
  ```
- **Create Teacher**: `POST /api/v1/admin/teachers/`
- **Update Teacher**: `PATCH /api/v1/admin/teachers/{id}/`
- **Delete Teacher**: `DELETE /api/v1/admin/teachers/{id}/`

##### 🔹 6. Admin Students Directory & CRUD
- **URL**: `GET /api/v1/admin/students/?page=1&search=aarav`
- **Headers**: `Authorization: Bearer <Admin_JWT>`
- **Response Payload (`200 OK`)**:
  ```json
  {
    "success": true,
    "message": "Students fetched successfully",
    "data": [
      {
        "id": "c1f3a2b4-7e89-4d12-9c34-89abcdef0123",
        "user": {
          "id": "11223344-5566-7788-99aa-bbccddeeff00",
          "email": "aarav.kumar@student.in",
          "first_name": "Aarav",
          "last_name": "Kumar",
          "phone": "+919812345678"
        },
        "grade_target": "Class 12 - IIT JEE 2027",
        "enrolled_batches_count": 2,
        "is_active": true
      }
    ]
  }
  ```
- **Delete Student**: `DELETE /api/v1/admin/students/{id}/`

---

#### 9.3 Teacher Verification Workflow

##### 🔹 7. View Verification Requests Queue
- **URL**: `GET /api/v1/admin/teacher-verifications/?status=PENDING`
- **Headers**: `Authorization: Bearer <Admin_JWT>`
- **Response Payload (`200 OK`)**:
  ```json
  {
    "success": true,
    "message": "Teacher verifications retrieved.",
    "data": [
      {
        "id": "v-1001",
        "teacher": {
          "id": "8a7b6c5d-4e3f-2a1b-0c9d-8e7f6a5b4c3d",
          "name": "Dr. Rajesh Sharma",
          "email": "rajesh.sharma@tutoron.in"
        },
        "document_type": "DEGREE",
        "document_file": "/media/verifications/phd_iit_delhi.pdf",
        "notes": "Ph.D Degree from IIT Delhi & Aadhaar Card",
        "status": "PENDING",
        "submitted_at": "2026-09-23T09:30:00Z"
      }
    ]
  }
  ```

##### 🔹 8. Approve Teacher Verification
- **URL**: `POST /api/v1/admin/teacher-verifications/{id}/approve/`
- **Headers**: `Authorization: Bearer <Admin_JWT>`
- **Request Payload**:
  ```json
  {
    "admin_notes": "Verified Ph.D credentials from IIT Delhi, Aadhaar identity authenticated."
  }
  ```
- **Response Payload (`200 OK`)**:
  ```json
  {
    "success": true,
    "message": "Teacher verification approved. Teacher is now verified and can publish batches.",
    "data": {
      "teacher_id": "8a7b6c5d-4e3f-2a1b-0c9d-8e7f6a5b4c3d",
      "verification_status": "VERIFIED",
      "approved_at": "2026-09-30T10:14:32Z"
    }
  }
  ```

##### 🔹 9. Reject Teacher Verification
- **URL**: `POST /api/v1/admin/teacher-verifications/{id}/reject/`
- **Headers**: `Authorization: Bearer <Admin_JWT>`
- **Request Payload**:
  ```json
  {
    "rejection_reason": "Degree certificate blurred and unreadable. Please re-upload high resolution scan.",
    "admin_note": "Aadhaar verified, but IIT degree certificate illegible."
  }
  ```
- **Response Payload (`200 OK`)**:
  ```json
  {
    "success": true,
    "message": "Teacher verification rejected.",
    "data": {
      "teacher_id": "8a7b6c5d-4e3f-2a1b-0c9d-8e7f6a5b4c3d",
      "verification_status": "REJECTED",
      "rejection_reason": "Degree certificate blurred and unreadable. Please re-upload high resolution scan."
    }
  }
  ```

---

#### 9.4 Connections & Privacy Contact Sharing

##### 🔹 10. View Connection Requests Queue
- **URL**: `GET /api/v1/admin/connections/?status=PENDING`
- **Headers**: `Authorization: Bearer <Admin_JWT>`
- **Response Payload (`200 OK`)**:
  ```json
  {
    "success": true,
    "message": "Connection requests retrieved.",
    "data": [
      {
        "id": "c-901",
        "student": { "id": "c1f3a2b4-7e89-4d12-9c34-89abcdef0123", "name": "Aarav Kumar" },
        "teacher": { "id": "8a7b6c5d-4e3f-2a1b-0c9d-8e7f6a5b4c3d", "name": "Dr. Rajesh Sharma" },
        "message": "Looking for 1-on-1 guidance in Mechanics.",
        "student_approved": true,
        "admin_approved": false,
        "status": "PENDING"
      }
    ]
  }
  ```

##### 🔹 11. Admin Approve Connection & Unlock Direct Contact
- **URL**: `POST /api/v1/admin/connections/{id}/approve/`
- **Headers**: `Authorization: Bearer <Admin_JWT>`
- **Request Payload**:
  ```json
  {
    "admin_note": "Approved genuine 1-on-1 coaching inquiry. Contact shared."
  }
  ```
- **Response Payload (`200 OK`)**:
  ```json
  {
    "success": true,
    "message": "Connection approved by Admin. Contact details are now accessible to both parties.",
    "data": {
      "connection_id": "c-901",
      "status": "APPROVED",
      "contact_unlocked": true
    }
  }
  ```

##### 🔹 12. Admin Reject Connection
- **URL**: `POST /api/v1/admin/connections/{id}/reject/`
- **Headers**: `Authorization: Bearer <Admin_JWT>`
- **Request Payload**:
  ```json
  {
    "rejection_reason": "Commercial solicitation not permitted."
  }
  ```
- **Response Payload (`200 OK`)**:
  ```json
  {
    "success": true,
    "message": "Connection request rejected.",
    "data": {
      "connection_id": "c-901",
      "status": "REJECTED"
    }
  }
  ```

---

#### 9.5 Batches, Enrollments & Operations

##### 🔹 13. Admin Batches Directory
- **URL**: `GET /api/v1/admin/batches/?status=PUBLISHED`
- **Headers**: `Authorization: Bearer <Admin_JWT>`
- **Response Payload (`200 OK`)**:
  ```json
  {
    "success": true,
    "message": "Batches fetched successfully",
    "batch_count": 34,
    "status_counts": {
      "total": 42,
      "published": 34,
      "ongoing": 5,
      "completed": 2,
      "draft": 1
    },
    "data": [
      {
        "id": "3c2b1a0f-9e8d-7c6b-5a4f-3e2d1c0b9a8f",
        "title": "Target JEE Advanced 2027: Master Class in Physics",
        "teacher": "Dr. Rajesh Sharma",
        "subject": "Physics",
        "price": "14999.00",
        "enrolled_count": 28,
        "max_students": 30,
        "status": "PUBLISHED"
      }
    ]
  }
  ```

##### 🔹 14. Admin Enrollments Directory
- **URL**: `GET /api/v1/admin/enrollments/?status=PAYMENT_PENDING`
- **Headers**: `Authorization: Bearer <Admin_JWT>`
- **Response Payload (`200 OK`)**:
  ```json
  {
    "success": true,
    "message": "Enrollments retrieved successfully",
    "data": [
      {
        "id": "enr-7701",
        "student": { "name": "Nakul Kumar", "email": "nakul@example.com" },
        "batch": { "title": "Target JEE Advanced 2027", "price": "14999.00" },
        "status": "REQUESTED",
        "payment_status": "UNPAID",
        "requested_at": "2026-09-29T10:00:00Z"
      }
    ]
  }
  ```

##### 🔹 15. Admin Announcements & Promotional Updates
- **URL**: `GET /api/v1/admin/announcements/`
- **Create**: `POST /api/v1/admin/announcements/`
- **Request Payload**:
  ```json
  {
    "title": "Diwali Scholarship Test 2026",
    "content": "Participate in the nationwide scholarship test on October 20th. Up to 100% fee waivers for Top 100 students.",
    "target_audience": "ALL",
    "is_pinned": true
  }
  ```
- **Response Payload (`201 Created`)**:
  ```json
  {
    "success": true,
    "message": "Announcement created successfully.",
    "data": {
      "id": "ann-101",
      "title": "Diwali Scholarship Test 2026",
      "target_audience": "ALL",
      "is_pinned": true,
      "created_at": "2026-09-30T11:00:00Z"
    }
  }
  ```

##### 🔹 16. Admin Promotional Banners
- **URL**: `GET /api/v1/admin/banners/`
- **Create**: `POST /api/v1/admin/banners/` (`multipart/form-data`)
  - `title`: `"IIT JEE Crash Course Banner"`
  - `image`: `[Image File - 1920x600 JPG/PNG]`
  - `target_url`: `"/batches/3c2b1a0f-9e8d-7c6b-5a4f-3e2d1c0b9a8f"`
  - `is_active`: `true`

---

#### 9.6 Content Moderation, Reviews & Incident Reports

##### 🔹 17. Admin Study Materials Moderation
- **URL**: `GET /api/v1/admin/materials/?status=REPORTED`
- **Headers**: `Authorization: Bearer <Admin_JWT>`
- **Response Payload (`200 OK`)**:
  ```json
  {
    "success": true,
    "message": "Study materials retrieved successfully",
    "counts": { "all": 140, "published": 136, "reported": 2, "drafts": 2 },
    "data": [
      {
        "id": "mat-501",
        "title": "Copyrighted Test Series PDF",
        "batch_title": "NEET 2026 Organic Chemistry",
        "teacher": "Dr. Ananya Verma",
        "status": "REPORTED"
      }
    ]
  }
  ```
- **Takedown Material**: `PATCH /api/v1/admin/materials/{id}/` with `{"status": "HIDDEN"}`

##### 🔹 18. Admin Reviews Moderation
- **URL**: `GET /api/v1/admin/reviews/?status=FLAGGED`
- **Headers**: `Authorization: Bearer <Admin_JWT>`
- **Response Payload (`200 OK`)**:
  ```json
  {
    "success": true,
    "message": "Reviews retrieved successfully",
    "counts": { "all": 320, "published": 315, "flagged": 3, "removed": 2 },
    "data": [
      {
        "id": "rev-301",
        "student_name": "Anonymous Student",
        "teacher_name": "Dr. Rajesh Sharma",
        "rating": 1,
        "comment": "Abusive spam review containing offensive language.",
        "status": "FLAGGED",
        "created_at": "2026-09-29T14:20:00Z"
      }
    ]
  }
  ```
- **Remove Review**: `DELETE /api/v1/admin/reviews/{id}/` or `PATCH` with `{"status": "REMOVED"}`

##### 🔹 19. Admin Incident Reports & Resolution
- **URL**: `GET /api/v1/admin/reports/?status=OPEN`
- **Resolve Report**: `POST /api/v1/admin/reports/{id}/resolve/`
- **Request Payload**:
  ```json
  {
    "resolution_action": "CONTENT_REMOVED",
    "admin_notes": "Offensive review deleted and warning issued to student."
  }
  ```
- **Response Payload (`200 OK`)**:
  ```json
  {
    "success": true,
    "message": "Report resolved successfully.",
    "data": {
      "report_id": "rep-401",
      "status": "RESOLVED",
      "resolved_by": "Super Admin",
      "resolution_action": "CONTENT_REMOVED"
    }
  }
  ```

---

#### 9.7 Financial Transactions & Auditing

##### 🔹 20. Admin Financial Transactions / Payments
- **URL**: `GET /api/v1/admin/payments/?status=SUCCESS`
- **Headers**: `Authorization: Bearer <Admin_JWT>`
- **Response Payload (`200 OK`)**:
  ```json
  {
    "success": true,
    "message": "Payments list retrieved",
    "data": [
      {
        "id": "pay-8801",
        "transaction_id": "TXN_TUTORON_992144810",
        "student": "Aarav Kumar (aarav@student.in)",
        "batch": "Target JEE Advanced 2027",
        "amount": "14999.00",
        "currency": "INR",
        "status": "SUCCESS",
        "payment_method": "UPI",
        "paid_at": "2026-09-23T12:00:00Z"
      }
    ]
  }
  ```

##### 🔹 21. Admin Audit Logs List (Category Filtered)
- **URL**: `GET /api/v1/admin/audit-logs/?category=Verification&search=AUD-10081`
- **Headers**: `Authorization: Bearer <Admin_JWT>`
- **Response Payload (`200 OK`)**:
  ```json
  {
    "success": true,
    "message": "Audit logs retrieved.",
    "data": {
      "count": 1,
      "results": [
        {
          "id": "e7c2a1b0-8f9d-4e3c-2b1a-0f9e8d7c6b5a",
          "audit_code": "AUD-10081",
          "category": "Verification",
          "action": "Teacher Verification Approved",
          "operator": "Super Admin (sudhanshu@tutoron.in)",
          "target_entity": "Faculty Profile: Dr. Rajesh Sharma (TCH-10248)",
          "timestamp": "2026-09-23 10:14:32 IST"
        }
      ]
    }
  }
  ```

##### 🔹 22. Admin Audit Inspection Details (Before vs After State Transition)
- **URL**: `GET /api/v1/admin/audit-logs/AUD-10081/` (or by UUID)
- **Headers**: `Authorization: Bearer <Admin_JWT>`
- **Response Payload (`200 OK`)**:
  ```json
  {
    "success": true,
    "message": "Audit log detail retrieved.",
    "data": {
      "audit_code": "AUD-10081",
      "category": "Verification",
      "action": "Teacher Verification Approved",
      "operator": "Super Admin (sudhanshu@tutoron.in)",
      "target_user_id": "TCH-10248",
      "related_entity": "Faculty Profile: Dr. Rajesh Sharma",
      "originating_ip": "103.21.144.18 (New Delhi, India)",
      "timestamp": "2026-09-23 10:14:32 IST",
      "justification": "Verified Ph.D credentials from IIT Delhi, Aadhaar identity authenticated, and 12-year coaching track record confirmed.",
      "state_transition": {
        "previous_state": {
          "verificationStatus": "Pending Verification",
          "badge": "Unverified",
          "allowedToPublishBatches": false
        },
        "new_state": {
          "verificationStatus": "Verified",
          "badge": "Verified Educator",
          "allowedToPublishBatches": true
        }
      },
      "integrity_signature": "SHA256:7f83b1657ff1fc53b92dc18148a1d6650fc2e4b1fa3c677284adcd208126d9069"
    }
  }
  ```

##### 🔹 23. Trigger Scheduled Class Reminders (Celery Dispatch)
- **URL**: `POST /api/v1/admin/classes/send-reminders/`
- **Headers**: `Authorization: Bearer <Admin_JWT>`
- **Request Payload**:
  ```json
  {
    "window_minutes": 60
  }
  ```
- **Response Payload (`200 OK`)**:
  ```json
  {
    "success": true,
    "message": "Class reminders queued successfully via Celery.",
    "data": {
      "dispatched_at": "2026-09-30T14:30:00Z",
      "window_minutes": 60,
      "notifications_queued": 18
    }
  }
  ```


---

## 🐳 Docker & Celery Architecture

### Running with Docker Compose
```bash
docker compose up --build
```
This boots up:
1. `web`: Django backend API on `http://localhost:8000`
2. `db`: PostgreSQL 16 database
3. `redis`: Redis cache & message broker
4. `celery`: Background asynchronous worker (email delivery, notifications)
5. `celery-beat`: Scheduler for recurring jobs (e.g., class reminders dispatched every 15 mins)

### Running Celery Locally (Manual)
```bash
# Terminal 1: Celery Worker
celery -A my_learning_project worker --loglevel=info

# Terminal 2: Celery Beat (Periodic reminders)
celery -A my_learning_project beat --loglevel=info
```
