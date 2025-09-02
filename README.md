# 📅 EventCalendar - Complete Event Booking System

## 📋 Overview

**EventCalendar** is a full-stack event booking and management system built with **Next.js**, featuring a modern calendar interface, secure authentication, and robust admin tools.

- 🔎 Users can browse events, book tickets, and manage bookings.
- 🛠️ Admins can create, edit, and manage events as well as oversee users.
- 📱 Fully responsive for both mobile and desktop.

---

## 🚀 Live Demo

[🔗 https://event-calendar-app-azure.vercel.app]

---

## 🛠️ Tech Stack

### Frontend

- **Next.js 14 (App Router)** – React framework with SSR 
- **TypeScript** – Strong typing 
- **Tailwind CSS** – Utility-first responsive styling
- **React Query (TanStack Query)** – Server state & caching
- **React Hook Form** – Form handling with validation
- **@hello-pangea/dnd** – Drag & drop support
- **date-fns** – Date manipulation utilities
- **Lucide React** – Icon library

### Backend

- **Next.js API Routes** – Serverless APIs
- **Neon PostgreSQL** – Serverless, scalable database
- **Drizzle ORM** – Type-safe ORM
- **JWT** – Authentication
- **bcryptjs** – Password hashing

### Deployment

- **Vercel** – Frontend & serverless deployment
- **Neon** – Database hosting
- **.env.local** – Secure environment config

---

## 🏗️ Key Architecture Decisions

1. **Full-Stack Next.js** – Unified frontend & backend with built-in API routes, SSR, and TypeScript support.
2. **Database** – Neon PostgreSQL + Drizzle ORM for scalability, safety, and relational structure.
3. **State Management** – React Query for server state + native React hooks for UI state.
4. **Authentication** – JWT stored in **HTTP-only cookies** for security.
5. **UI/UX** – Tailwind CSS, responsive design

---

## ⚡ Setup Instructions

### Prerequisites

- Node.js 18+
- PostgreSQL (Neon recommended)
- Git

### 1. Clone Repository

```bash
git clone https://github.com/wayneleon1/event-calendar-app.git
cd event-calendar-app
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment

Create `.env.local` in root:

```env
# Database
DATABASE_URL='postgresql://neondb_owner:npg_b1rifvYMno6E@ep-sweet-hall-adddtul3-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require'

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Authentication
JWT_SECRET=your-secret-key
```

### 4. Database Setup

```bash
npm run db:generate
npm run db:migrate
npm run seed:admin
```

### 5. Start Development Server

```bash
npm run dev
```

➡️ App runs on: **http://localhost:3000**

### 6. Build for Production

```bash
npm run build
npm start
```

---

## 🔧 Configuration

- **Database** → Update `DATABASE_URL`
- **Authentication** → Change `JWT_SECRET` in production
- **Deployment** → Add env vars in Vercel dashboard

---

## 👤 Default Admin Account

After seeding:

- **Email:** `admin@example.com`
- **Password:** `admin123`

---

## 📱 Features

### User

- ✅ Register & login
- ✅ Browse & filter events
- ✅ Book events & manage bookings
- ✅ User dashboard
- ✅ Responsive UI

### Admin

- ✅ Full CRUD for events
- ✅ User management (roles)
- ✅ Drag-and-drop rescheduling
- ✅ Analytics & statistics

### Technical

- ✅ TypeScript-first codebase
- ✅ Optimistic UI updates
- ✅ Protected API routes
- ✅ Comprehensive error handling
- ✅ Loading states & skeletons

---

## 🚀 Deployment

**Frontend (Vercel)**

1. Push repo to GitHub
2. Connect to Vercel
3. Add env variables
4. Deploy

**Database (Neon)**

1. Create Neon DB
2. Copy connection string → `.env.local`
3. Run migrations

---

## 🤝 Contributing

1. Fork the repo
2. Create a branch: `git checkout -b feature/awesome`
3. Commit: `git commit -m 'Add awesome feature'`
4. Push: `git push origin feature/awesome`
5. Open a Pull Request
