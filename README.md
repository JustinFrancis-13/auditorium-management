# 🏛️ Anurag University - Smart Auditorium Management System (SAMS)

A full-stack web application for managing auditorium bookings, events, and resources at Anurag University.

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, React Router v6, Recharts, Lucide Icons |
| Backend | Node.js, Express.js |
| Database | MongoDB + Mongoose |
| Auth | JWT (JSON Web Tokens) |
| Styling | Custom CSS with CSS Variables |

## 📁 Project Structure

```
auditorium-management/
├── backend/
│   ├── models/          # MongoDB schemas (User, Booking, Auditorium, Event)
│   ├── routes/          # API endpoints
│   ├── middleware/       # Auth middleware
│   ├── server.js        # Entry point
│   └── .env             # Environment variables
└── frontend/
    ├── src/
    │   ├── components/  # Layout component
    │   ├── context/     # Auth context
    │   ├── pages/       # All pages
    │   └── services/    # Axios API service
    └── public/
```

## 🚀 Setup & Run Instructions

### Prerequisites
- Node.js v16+ installed
- MongoDB installed and running on port 27017
- Git (optional)

---

### Step 1: Start MongoDB
```bash
# On Windows
net start MongoDB

# On Mac/Linux
sudo service mongod start
# or
mongod --dbpath /data/db
```

---

### Step 2: Setup Backend
```bash
cd backend
npm install
npm start
```
Backend runs on: http://localhost:5000

---

### Step 3: Setup Frontend
```bash
cd frontend
npm install
npm start
```
Frontend runs on: http://localhost:3000

---

### Step 4: Initialize Data
Open browser and go to: http://localhost:3000

1. Click **"🚀 Quick Demo (Admin Login)"** on the login page
   - This auto-creates admin account and logs you in

2. Go to **Auditoriums** page
   - Click **"Seed Data"** to add 3 demo auditoriums

---

## 🔐 Default Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@anurag.edu.in | admin123 |

---

## ✨ Features

### For Students & Faculty
- 📅 Book auditoriums with date/time selection
- 📋 Track booking status (pending/approved/rejected)
- 🔔 View upcoming campus events
- ⭐ Submit post-event feedback
- 👤 Manage profile & password

### For Admin & Staff
- ✅ Approve/Reject booking requests
- 📊 Dashboard with analytics & charts
- 🏛️ Manage auditoriums (add/edit/deactivate)
- 👥 User management with role assignment
- 📈 Booking trends & statistics

### System Features
- 🔒 Role-based access control (Admin, Staff, Faculty, Student)
- ⚡ Real-time conflict detection for overlapping bookings
- 📱 Responsive design
- 🎯 Equipment & requirement tracking

## 🌐 API Endpoints

### Auth
- POST /api/auth/register - Register
- POST /api/auth/login - Login
- GET /api/auth/me - Get current user

### Auditoriums
- GET /api/auditoriums - List all
- POST /api/auditoriums - Create (admin)
- GET /api/auditoriums/:id/availability - Check availability

### Bookings
- GET /api/bookings - List bookings
- POST /api/bookings - Create booking
- PUT /api/bookings/:id/status - Approve/Reject (admin)
- PUT /api/bookings/:id/cancel - Cancel

### Events
- GET /api/events - List events
- POST /api/events - Create event
- POST /api/events/:id/register - Register for event

### Dashboard
- GET /api/dashboard/stats - Statistics & analytics

---

## 🛠️ Environment Variables (backend/.env)

```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/anurag_auditorium
JWT_SECRET=anurag_university_auditorium_secret_key_2024
JWT_EXPIRE=7d
```
