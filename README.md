# NexaConnect — Modern CRM (MERN Stack)

A full-stack Customer Relationship Management platform with JWT auth, role-based
access (Admin/Employee), customer & lead management, a drag-and-drop sales
pipeline, task management, charts/reports with PDF & Excel export, dark/light
mode, and a blue-and-white glassmorphism UI.

## Tech Stack
- **Frontend:** React 18 (Vite), Tailwind CSS, Chart.js, react-icons, @hello-pangea/dnd, jsPDF, SheetJS
- **Backend:** Node.js, Express.js, Mongoose
- **Database:** MongoDB Atlas
- **Auth:** JWT (JSON Web Tokens) + bcrypt
- **Realtime:** Socket.io (notification channel scaffold)

---

## 1. Prerequisites
- Node.js v18+
- A free MongoDB Atlas cluster
- (Optional) an SMTP provider for email notifications (Gmail App Password, SendGrid, Mailtrap, etc.)

## 2. Backend Setup
```bash
cd backend
cp .env.example .env      # then fill in MONGO_URI and JWT_SECRET
npm install
npm run seed               # creates demo admin/employee + sample data
npm run dev                 # starts on http://localhost:5000
```

Demo accounts created by the seed script:
| Role | Email | Password |
|---|---|---|
| Admin | admin@nexaconnect.com | Admin@123 |
| Employee | employee@nexaconnect.com | Employee@123 |

## 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev                 # starts on http://localhost:5173
```
The Vite dev server proxies `/api` calls to `http://localhost:5000` automatically
(see `vite.config.js`). No extra config needed for local development.
`
## 4. Environment Variables

**backend/.env**
```
NODE_ENV=development
PORT=5000
CLIENT_URL=http://localhost:5173
MONGO_URI=<your MongoDB Atlas connection string>
JWT_SECRET=<a long random string>
JWT_EXPIRES_IN=7d
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=<your email>
SMTP_PASS=<app password>
EMAIL_FROM="NexaConnect CRM <no-reply@nexaconnect.com>"
```

**frontend/.env** (only needed for production builds pointing at a deployed API)
```
VITE_API_URL=https://your-backend.onrender.com/api
```

## 5. Project Structure
```
nexaconnect/
├── backend/
│   ├── config/db.js
│   ├── models/            User, Customer, Lead, Task, Activity
│   ├── middleware/        auth (JWT + role guard), errorHandler
│   ├── routes/             auth, users, customers, leads, tasks, activities, dashboard
│   ├── utils/              generateToken, sendEmail, seed
│   └── server.js
└── frontend/
    └── src/
        ├── api/axios.js
        ├── context/         AuthContext, ThemeContext
        ├── components/     Sidebar, Topbar, DashboardLayout, DataTable, Modal,
        │                    ConfirmDialog, StatCard, StatusBadge, Loader, ProtectedRoute
        └── pages/            Login, Register, Dashboard, Customers, Leads,
                                Pipeline, Tasks, Reports, Profile, Settings, NotFound
```

## 6. Core Features Implemented
- JWT auth with bcrypt password hashing; first registered user auto-becomes Admin
- Role-based route/API guards (`admin` vs `employee`)
- Dashboard analytics cards: total customers, active leads, sales revenue, completed tasks
- Customer CRUD with search, status/source filter, and pagination
- Lead CRUD with 6-stage status (`New → Contacted → Qualified → Proposal → Won/Lost`)
- Kanban sales pipeline with drag-and-drop stage changes (`@hello-pangea/dnd`)
- Task management with priority, due date, and completion toggling
- Customer/lead interaction activity feed (audit trail)
- Reports with Bar, Pie, and Line charts (Chart.js) + PDF export (jsPDF) + Excel export (SheetJS)
- Email notifications on registration (Nodemailer, no-op gracefully if SMTP unset)
- Profile management + password change
- Settings: dark/light theme, notification preferences, admin team management
- Fully responsive, glassmorphism UI with smooth animations and toast notifications

## 7. Deployment

### Backend → Render
1. Push this repo to GitHub.
2. Render → New → Web Service → connect repo → root directory `backend`.
3. Build command: `npm install` · Start command: `npm start`.
4. Add the same environment variables as `.env`, with `CLIENT_URL` set to your Vercel URL and `NODE_ENV=production`.

### Frontend → Vercel
1. Vercel → New Project → import repo → root directory `frontend`.
2. Framework preset: **Vite**.
3. Environment variable: `VITE_API_URL=https://<your-render-app>.onrender.com/api`.
4. Deploy, then go back to Render and set `CLIENT_URL` to the resulting Vercel URL (for CORS) and redeploy.

## 8. Notes on Extra Features
- **Real-time notifications:** Socket.io is wired up on the server (`io` is available via `req.app.get('io')`); emit events from any route handler and listen for them on the client to add live toasts.
- **File uploads (avatars):** not wired to cloud storage by default — add Multer + S3/Cloudinary if needed.
- **Export:** PDF/Excel export is implemented on the Reports page and pulls from the same `/api/dashboard/*` data the charts use.
