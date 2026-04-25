# FinQueue — Bank Digital Queue Management System

<div align="center">

![FinQueue Banner](https://img.shields.io/badge/FinQueue-Bank%20Queue%20System-1e3a5f?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIj48cmVjdCB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHg9IjIiIHk9IjIiIHJ4PSIyIi8+PHBhdGggZD0iTTYgMTJoMTJNNiA4aDEyTTYgMTZoOCIvPjwvc3ZnPg==)

**A modern MERN stack digital queue management system for banking.**  
Skip the physical line — get a token, track your position live, and walk in only when it's your turn.

[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?logo=node.js&logoColor=white)](https://nodejs.org)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)](https://reactjs.org)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas%20%2F%20Local-47A248?logo=mongodb&logoColor=white)](https://mongodb.com)
[![Socket.io](https://img.shields.io/badge/Socket.io-Real--time-010101?logo=socket.io)](https://socket.io)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)

</div>

---

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [User Roles](#-user-roles)
- [API Endpoints](#-api-endpoints)

---

## ✨ Features

- 🎫 **Digital Token Generation** — Tokens in `Q-001` format, generated instantly
- ⏱️ **Real-time Queue Tracking** — Live updates via Socket.io (no refresh needed)
- 📧 **Email Notifications** — Customers are notified by email when their token is called
- 🏦 **6 Banking Service Types** — Account Services, Loan Services, Foreign Exchange, General Inquiry, Card Services, Fixed Deposits
- ❌ **Token Cancellation** — Customers can cancel a waiting token
- 👤 **Multi-role System** — Separate dashboards for Customer, Bank Teller (Agent), and Admin
- 📊 **Admin Analytics** — Service type breakdown, performance metrics, and full token history
- 🖥️ **Counter Management** — Create, assign tellers, toggle active/inactive, delete counters
- 🔐 **JWT Authentication** — Secure role-based access control

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, Vite, TailwindCSS, Lucide Icons |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB (Mongoose ODM) |
| **Real-time** | Socket.io |
| **Auth** | JWT (JSON Web Tokens) + bcrypt |
| **Email** | Nodemailer (Mailtrap sandbox / Gmail SMTP) |

---

## 📁 Project Structure

```
Project/
├── backend/
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── queueController.js
│   │   └── counterController.js
│   ├── middleware/
│   │   └── authMiddleware.js
│   ├── models/
│   │   ├── User.js
│   │   ├── QueueToken.js
│   │   └── ServiceCounter.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── queueRoutes.js
│   │   └── counterRoutes.js
│   ├── utils/
│   │   └── sendEmail.js
│   ├── .env               ← NOT committed (see .gitignore)
│   ├── server.js
│   ├── seed_admin.js
│   └── clear_db.js
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   └── Navbar.jsx
    │   ├── context/
    │   │   ├── AuthContext.jsx
    │   │   └── SocketContext.jsx
    │   ├── pages/
    │   │   ├── Home.jsx
    │   │   ├── Auth/
    │   │   │   ├── Login.jsx
    │   │   │   └── Register.jsx
    │   │   └── Dashboard/
    │   │       ├── CustomerDashboard.jsx
    │   │       ├── AgentDashboard.jsx
    │   │       └── AdminDashboard.jsx
    │   ├── index.css
    │   └── App.jsx
    ├── tailwind.config.js
    └── vite.config.js
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- MongoDB running locally (`mongodb://127.0.0.1:27017`) or a MongoDB Atlas URI
- Git

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/finqueue.git
cd finqueue
```

### 2. Setup Backend

```bash
cd backend
npm install
```

Create a `.env` file in `/backend` (see [Environment Variables](#-environment-variables)):

```bash
cp .env.example .env
# Edit .env with your values
```

Seed the admin account:

```bash
node seed_admin.js
```

Start the backend server:

```bash
npm start
```

Backend runs at **http://localhost:5000**

### 3. Setup Frontend

```bash
cd ../frontend
npm install
npm run dev
```

Frontend runs at **http://localhost:5173**

---

## 🔧 Environment Variables

Create a `.env` file inside the `/backend` folder with these values:

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/queue_management
JWT_SECRET=your_super_secret_jwt_key

# Email (Mailtrap sandbox for testing)
EMAIL_HOST=sandbox.smtp.mailtrap.io
EMAIL_PORT=587
EMAIL_USER=your_mailtrap_user
EMAIL_PASS=your_mailtrap_password
```

> ⚠️ **Never commit your `.env` file.** It is already excluded via `.gitignore`.

For **real email delivery** (Gmail):
```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your@gmail.com
EMAIL_PASS=your_16_char_app_password
```

---

## 👥 User Roles

| Role | Access | Default Credentials |
|---|---|---|
| **Admin** | Full dashboard, counter management, analytics | `admin` / `12345678` |
| **Bank Teller** | Call next token, mark service complete | Register as "Bank Teller" |
| **Customer** | Join queue, track token, cancel token | Register as "Customer" |

> **Admin credentials** are seeded via `node seed_admin.js`

---

## 📡 API Endpoints

### Auth
| Method | Route | Access | Description |
|---|---|---|---|
| POST | `/api/auth/register` | Public | Register new user |
| POST | `/api/auth/login` | Public | Login |
| GET | `/api/auth/me` | Private | Get current user |
| GET | `/api/auth/agents` | Admin | Get all agents |

### Queue
| Method | Route | Access | Description |
|---|---|---|---|
| POST | `/api/queue` | Customer | Generate token |
| GET | `/api/queue/my-tokens` | Customer | Get own active tokens |
| GET | `/api/queue` | Agent/Admin | Get all waiting tokens |
| GET | `/api/queue/all` | Admin | Get full token history |
| GET | `/api/queue/stats` | Admin | Get queue statistics |
| PUT | `/api/queue/call-next` | Agent | Call next customer |
| PUT | `/api/queue/:id/complete` | Agent/Admin | Complete service |
| DELETE | `/api/queue/:id` | Customer | Cancel waiting token |

### Counters
| Method | Route | Access | Description |
|---|---|---|---|
| GET | `/api/counters` | Private | Get all counters |
| POST | `/api/counters` | Admin | Create counter |
| PUT | `/api/counters/:id/assign` | Admin | Assign teller |
| PUT | `/api/counters/:id/toggle` | Admin | Toggle active/inactive |
| DELETE | `/api/counters/:id` | Admin | Delete counter |

---

## 🎓 Academic Context

This project was developed as part of the **Full Stack Development** course — **SRM University AP , SEM 4**.

It demonstrates:
- MERN stack architecture (MongoDB, Express, React, Node.js)
- Real-time communication using WebSockets (Socket.io)
- Role-based authentication with JWT
- RESTful API design
- Modern React patterns (Context API, hooks)
- Responsive UI with TailwindCSS

---

## 📄 License

This project is for academic purposes. Feel free to use it as a reference.

---

<div align="center">
Made with ❤️ by Mihir
</div>
