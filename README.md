# Team Task Manager Web Application

Welcome to the **Team Task Manager**! This is a full-stack, collaborative web application designed to help teams organize projects, assign tasks, and track their progress in real-time. It serves as a simplified, highly-efficient alternative to tools like Trello or Asana, built with modern web technologies.

---

## 🎯 Problem Statement & Goal
The goal of this project is to build a real-world collaborative application where multiple users can manage tasks efficiently. It features a role-based access system (Admin and Member) to ensure tasks are manageable within teams, along with a dynamic dashboard to track productivity.

---

## ✨ Features & Functional Requirements

### 1. User Authentication
- **Signup/Login**: Users can register with Name, Email, and Password.
- **Security**: Passwords are encrypted using `bcryptjs`, and sessions are securely managed using JSON Web Tokens (JWT).

### 2. Role-Based Access Control
- **Admin**: The creator of a project automatically becomes an Admin. Admins can create tasks, manage project details, and add/remove members.
- **Member**: Assigned members can view their projects and only update the status of tasks assigned to them.

### 3. Project Management
- Users can create new projects (they become the Admin/Owner automatically).
- Admin can add other registered users as members.
- All projects a user owns or is a member of appear in their Projects view.

### 4. Kanban Task Management
- Create tasks with a Title, Description, Due Date, and Priority (Low, Medium, High).
- Assign tasks to specific project members from a dropdown.
- Visual Kanban board to move tasks across: **To Do → In Progress → Done**.

### 5. Dynamic Dashboard
- High-level overview of productivity.
- Metrics include: Total tasks, Tasks assigned to current user, and Overdue tasks.

### 6. Premium UI/UX
- Built with Vanilla CSS: Dark mode, glassmorphism panels, smooth gradients, hover micro-animations.
- Google Fonts (Inter) for modern typography.

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| Frontend | React.js, Vite, Vanilla CSS, React Router DOM, Axios |
| Backend | Node.js, Express.js |
| Database | SQLite (via Prisma ORM) |
| Authentication | JWT (JSON Web Tokens) + bcryptjs |
| Deployment | Railway (Backend + DB) |

> **Why SQLite?** SQLite requires zero external installation. The database runs as a simple file inside the project folder, making it instant to set up locally. For production on Railway, simply swap `DATABASE_URL` to a PostgreSQL connection string — Prisma handles the rest automatically.

---

## 📂 Folder Structure

```text
team-task-manager/
├── .gitignore
├── README.md
│
├── backend/                    # Node.js & Express API
│   ├── middleware/
│   │   └── auth.js             # JWT verification & role checks
│   ├── prisma/
│   │   └── schema.prisma       # Database schema (User, Project, Task)
│   ├── routes/
│   │   ├── auth.js             # POST /api/auth/register, /login, /me
│   │   ├── projects.js         # GET/POST /api/projects
│   │   ├── tasks.js            # GET/POST/PUT /api/tasks
│   │   └── dashboard.js        # GET /api/dashboard
│   ├── .env                    # Environment Variables (not committed)
│   ├── package.json
│   └── server.js               # Express entry point
│
└── frontend/                   # React & Vite UI
    ├── public/
    │   └── favicon.png         # Custom app icon
    ├── src/
    │   ├── context/
    │   │   └── AuthContext.jsx # Global auth state (JWT, user info)
    │   ├── pages/
    │   │   ├── Login.jsx       # Login & Signup form
    │   │   ├── Dashboard.jsx   # Metrics overview
    │   │   ├── Projects.jsx    # Projects list
    │   │   └── ProjectDetails.jsx # Kanban board
    │   ├── App.jsx             # App routing (React Router)
    │   ├── main.jsx            # React entry point
    │   └── index.css           # Premium UI styles
    └── package.json
```

---

## 🗄️ Database Schema (Prisma)

```prisma
model User {
  id        String   @id @default(uuid())
  name      String
  email     String   @unique
  password  String
  role      String   @default("Member") // "Admin" or "Member"
}

model Project {
  id          String  @id @default(uuid())
  name        String
  description String?
  ownerId     String
  owner       User    @relation("ProjectOwner", ...)
  members     User[]  @relation("ProjectMembers")
  tasks       Task[]
}

model Task {
  id          String    @id @default(uuid())
  title       String
  description String?
  dueDate     DateTime?
  priority    String    @default("Medium") // Low, Medium, High
  status      String    @default("To Do")  // To Do, In Progress, Done
  projectId   String
  assigneeId  String?
}
```

---

## 🚀 Setup & Local Installation

### Prerequisites
- [Node.js](https://nodejs.org/) v20 or higher
- No database installation needed — SQLite runs as a file automatically!

### 1. Clone the repository
```bash
git clone https://github.com/srijanampelli/team-task-manager.git
cd team-task-manager
```

### 2. Backend Setup
```bash
cd backend
npm install
```
Create a `.env` file inside the `backend` folder:
```env
PORT=5000
DATABASE_URL="file:./dev.db"
JWT_SECRET=your_super_secret_jwt_key
```
Initialize the SQLite database:
```bash
npx prisma db push
```
Start the backend server:
```bash
node server.js
```
*(Backend runs on `http://localhost:5000`)*

### 3. Frontend Setup
Open a **new terminal window**:
```bash
cd frontend
npm install
npm run dev
```
*(Frontend runs on `http://localhost:5173`)*

---

## 🌍 Deployment Guide (Railway)

1. **Push to GitHub**: Commit all code and push to your GitHub repository.
2. **Create Railway Account**: Sign up at [Railway.app](https://railway.app/) using your GitHub account.
3. **New Project → Deploy from GitHub Repo**: Select this repository.
4. **Add PostgreSQL** (free tier): In the Railway project, click **New → Database → Add PostgreSQL**. Copy the `DATABASE_URL`.
5. **Set Environment Variables** in Railway service settings:
   - `DATABASE_URL` = *(PostgreSQL connection URL from step 4)*
   - `JWT_SECRET` = *(any random secure string)*
   - `PORT` = `5000`
6. **Add start command** in Railway settings: `node server.js`
7. Click **Generate Domain** in Settings to get your public live URL.

---

## 📖 How to Use the App

1. **Register**: Create a new account on the Signup page (choose Admin or Member role).
2. **Dashboard**: View your productivity metrics after logging in.
3. **Create a Project**: Go to "Projects" → "+ New Project". You become the Admin.
4. **Manage Tasks**: Open the project Kanban board → "+ Add Task" → fill in details and assign to a user.
5. **Move Tasks**: Use `←` `→` arrow buttons on task cards to move between columns.
6. **Track Metrics**: The Dashboard updates automatically to reflect your task progress.
