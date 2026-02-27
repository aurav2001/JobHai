# JobHai — Full-Stack Job Portal

A production-ready job portal application (JobHai.com clone) built with **Next.js 14**, **Express.js**, and **MongoDB**.

---

## 🚀 Features

| Feature | Status |
|---|---|
| User Roles: Guest, Job Seeker, Employer, Admin | ✅ |
| JWT + Google OAuth Authentication | ✅ |
| Email Verification & Password Reset | ✅ |
| Job Search (keyword, location, type, salary, category) | ✅ |
| Job Filters + Paginated Results | ✅ |
| Apply for Jobs with Resume Upload (Cloudinary) | ✅ |
| Direct Recruiter Contact (phone/email) | ✅ |
| Online Resume Builder | ✅ |
| Employer Dashboard (post/manage/delete jobs) | ✅ |
| Employer Team Management (invite/remove) | ✅ |
| Admin Panel (stats, users, job moderation) | ✅ |
| Email Notifications (Nodemailer + Gmail) | ✅ |
| AI Job Recommendations (cosine similarity) | ✅ |
| Swagger API Docs | ✅ |
| Docker Support | ✅ |

---

## 📁 Project Structure

```
Job Hai Site/
├── server/          # Express.js REST API (port 5000)
│   ├── src/
│   │   ├── models/      # User, Job, Application, Team, Notification
│   │   ├── routes/      # auth, jobs, employer, admin, notifications
│   │   ├── middleware/  # auth, validate, upload, errorHandler
│   │   ├── services/    # email, cloudinary, aiRecommend
│   │   └── utils/       # helpers (JWT, pagination)
│   ├── .env.example
│   └── Dockerfile
│
├── client/          # Next.js 14 App Router (port 3000)
│   ├── app/
│   │   ├── page.tsx           # Home
│   │   ├── search/            # Search results
│   │   ├── jobs/[id]/         # Job details
│   │   ├── sign-in/           # Login
│   │   ├── sign-up/           # Register
│   │   ├── profile/           # Candidate profile
│   │   ├── resume-builder/    # Online resume builder
│   │   ├── employer/          # dashboard, post-job
│   │   └── admin/             # Admin panel
│   ├── components/    # Navbar, Footer, JobCard
│   ├── lib/           # api.js, AuthContext.jsx
│   ├── .env.local.example
│   └── Dockerfile
│
├── docker-compose.yml
└── README.md
```

---

## ⚡ Quick Start (Local Development)

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- Cloudinary account (for file uploads)
- Gmail account (for email — enable App Password)

### 1. Backend Setup

```bash
cd server

# Copy env file and fill in values
cp .env.example .env

# Install dependencies
npm install

# Start development server (port 5000)
npm run dev
```

### 2. Frontend Setup

```bash
cd client

# Copy env file
cp .env.local.example .env.local

# Install dependencies
npm install

# Start Next.js dev server (port 3000)
npm run dev
```

Visit **http://localhost:3000** 🎉

---

## 🔑 Environment Variables

### Server (`server/.env`)

```env
MONGODB_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/jobhai
JWT_SECRET=change_this_long_random_secret
FRONTEND_URL=http://localhost:3000
SERVER_URL=http://localhost:5000
GOOGLE_CLIENT_ID=<from google cloud console>
GOOGLE_CLIENT_SECRET=<from google cloud console>
CLOUDINARY_CLOUD_NAME=<your cloudinary name>
CLOUDINARY_API_KEY=<your cloudinary api key>
CLOUDINARY_API_SECRET=<your cloudinary api secret>
SMTP_EMAIL=your@gmail.com
SMTP_PASSWORD=your_app_password   # Gmail App Password, NOT your regular password
NODE_ENV=development
PORT=5000
```

### Client (`client/.env.local`)

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 🐳 Docker (Local Full Stack)

```bash
# From repo root
docker-compose up --build

# Services:
# - MongoDB:  localhost:27017
# - Server:   localhost:5000
# - Client:   localhost:3000
```

---

## 🌐 Deployment

### Option A: Vercel (Frontend) + Railway (Backend)

#### Deploy Backend to Railway
1. Go to [railway.app](https://railway.app) → New Project → Deploy from GitHub
2. Select the `Job Hai Site/server` subdirectory
3. Set all environment variables from `server/.env.example`
4. Railway will auto-build and deploy. Copy the deployed URL.

#### Deploy Frontend to Vercel
1. Go to [vercel.com](https://vercel.com) → New Project → Import from GitHub
2. Set **Root Directory** to `client`
3. Add environment variable: `NEXT_PUBLIC_API_URL=https://<your-railway-url>/api`
4. Deploy 🚀

### Option B: Docker on a VPS

```bash
# On your VPS (Ubuntu):
git clone <your-repo>
cd JobHai

# Set environment variables
cp server/.env.example server/.env
# Edit server/.env with real values

docker-compose -f docker-compose.yml up -d --build
```

Configure Nginx as reverse proxy:
- `localhost:3000` → your domain
- `localhost:5000` → your API subdomain (e.g., `api.yoursite.com`)

---

## 📡 API Documentation

Interactive Swagger UI is available at:
```
http://localhost:5000/api-docs
```

### Key Endpoints

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/signup` | — | Register |
| POST | `/api/auth/login` | — | Login (returns JWT) |
| GET | `/api/auth/verify-email` | — | Verify email token |
| GET | `/api/auth/google` | — | Google OAuth |
| GET | `/api/auth/me` | JWT | Get current user |
| PUT | `/api/auth/profile` | JWT | Update profile |
| GET | `/api/jobs/search` | — | Search & filter jobs |
| GET | `/api/jobs/:id` | — | Job details |
| POST | `/api/jobs/apply` | Jobseeker | Apply with resume |
| GET | `/api/jobs/recommended` | Jobseeker | AI recommendations |
| POST | `/api/employer/jobs` | Employer | Create job |
| PUT | `/api/employer/jobs/:id` | Employer | Update job |
| GET | `/api/employer/jobs` | Employer | List own jobs |
| GET | `/api/employer/applications/:jobId` | Employer | View applicants |
| PUT | `/api/employer/applications/:id/status` | Employer | Update status |
| POST | `/api/employer/team/invite` | Employer | Invite team member |
| GET | `/api/admin/stats` | Admin | Platform analytics |
| GET | `/api/admin/users` | Admin | Manage users |
| GET | `/api/admin/jobs` | Admin | Moderate jobs |
| GET | `/api/notifications` | JWT | List notifications |

### Authentication
All protected endpoints require:
```
Authorization: Bearer <JWT_TOKEN>
```

---

## 👤 Creating an Admin User

After starting the server, run this in MongoDB shell or Mongo Compass:

```js
db.users.updateOne(
  { email: "admin@example.com" },
  { $set: { role: "admin", isVerified: true } }
)
```

---

## 🤖 AI Job Recommendation

The recommendation engine uses **cosine similarity** between:
- Candidate's `skills[]` array (from their profile)
- Job's `skills[]` array (from the job posting)

No external API needed. Implemented in `server/src/services/aiRecommend.js`.

---

## 🔒 Security Features

- JWT token authentication
- Role-based access control (RBAC)
- Express-validator input validation
- Rate limiting (100 req/15min; stricter on auth endpoints)
- Helmet HTTP security headers
- CORS configuration
- File upload type/size validation
- Password hashing with bcrypt (cost factor 12)

---

## 📧 Gmail SMTP Setup

1. Enable 2-Factor Authentication on your Google account
2. Go to **Google Account → Security → App Passwords**
3. Generate an App Password for "Mail"
4. Use it as `SMTP_PASSWORD` in `.env`

---

## 🗄️ MongoDB Atlas Free Cluster

1. Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free M0 cluster
3. Get your connection string: `mongodb+srv://...`
4. Set it as `MONGODB_URI` in `.env`

---

## 📝 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14, Tailwind CSS, React Hook Form |
| Backend | Node.js, Express.js, Mongoose |
| Database | MongoDB (Atlas) |
| Auth | JWT, Passport.js (Google OAuth 2.0) |
| File Upload | Multer + Cloudinary |
| Email | Nodemailer (Gmail SMTP) |
| AI | Cosine similarity (pure JS) |
| API Docs | Swagger UI + swagger-jsdoc |
| Deployment | Vercel + Railway / Docker |

---

## 🛠️ Troubleshooting

### MongoDB Connection Failed (`ECONNREFUSED`)
If you see `❌ MongoDB connection failed: querySrv ECONNREFUSED`, it usually means:
1.  **IP Whitelist**: Your current IP is not allowed to connect to Atlas. Go to **Network Access** in MongoDB Atlas and click **Add Current IP Address**.
2.  **DNS Issues**: Some networks block SRV records. Try using the standard connection string format if SRV continues to fail.
3.  **Local Fallback**: If you have MongoDB installed locally, you can use `mongodb://localhost:27017/jobhai` in your `.env`.

### Google OAuth Warning
The server will start with a warning if `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are missing. This is **optional** and only hides the "Login with Google" button functionality.
