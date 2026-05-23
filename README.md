# 🧘 Mental Wellness Streak Tracker

A premium, beautifully styled, and gamified daily habit-building application designed to help users build healthy routines, track consistency, and improve mental wellness.

This application is built with a decoupled architecture featuring a **Vite + React + TypeScript + Tailwind CSS v4** frontend and a **Node.js + Express + MongoDB** backend.

---

## ✨ Features

- **🎯 Micro-Habit Checklist**: Clear daily view of active habits (e.g., meditation, water intake, reading) with quick-tap completion buttons.
- **🔥 Perfectionist Master Streak Engine**: The global day streak increments **only** when *all* active daily tasks are completed.
- **❄️ Streak Freezes**: Automatically earn 1 Streak Freeze for every 7-day milestone to protect your consistency chains.
- **🏪 Cosmetic Store**: Spend earned XP to purchase HSL active visual themes (e.g., Midnight Oasis, Sakura Breeze, Emerald Forest) and sleek custom avatar frames (Bronze, Silver, Gold).
- **🧘 Guided Breathing Meditation**: Interactive breathing bubble widget with real-time visual prompts and synthesized browser hum frequencies.
- **🧠 AI Sage Coach**: Personalized cognitive advice generator and daily checklist alarm configurations.
- **📝 Sunday Reflection Journal**: Correlation analysis linking daily mood ratings and checklist performance (+30 XP weekly milestone).
- **🎁 Daily Quest Board**: Four fresh gamified daily quests rewarding XP upon completion.
- **🏆 Social Leaderboard & Buddy Accountability**: Dynamic leaderboard rankings showing streaks, levels, and XP.

---

## 🛠️ Technology Stack

### Frontend
- **Framework**: React 18 + Vite
- **Language**: TypeScript
- **State Management**: Zustand (with persistent localStorage caching)
- **Styling**: Tailwind CSS v4 + HSL Active Custom Theme Variables
- **Animations**: Framer Motion
- **Icons**: Lucide React

### Backend
- **Runtime**: Node.js + Express
- **Database**: MongoDB (via Mongoose ODM)
- **Authentication**: JSON Web Tokens (JWT) + OTP Verification (with developmental bypass support)
- **Mailers**: Nodemailer (SMTP)

---

## 📁 Project Structure

```text
├── backend/
│   ├── models/           # Mongoose schemas (User, Profile, Habit, Log)
│   ├── server.js         # Express app configuration and API endpoints
│   ├── start.js          # Server port listening entrypoint
│   └── .env.local        # Backend environment secrets (ignored by Git)
│
├── frontend/
│   ├── src/
│   │   ├── components/   # UI components (Dashboard, Store, Analytics, Meditation)
│   │   ├── services/     # API integration service layer (api.ts)
│   │   ├── store/        # Zustand state store (useStore.ts)
│   │   ├── types/        # TypeScript interfaces & preset constants
│   │   ├── App.tsx       # View router and desktop/mobile layout shells
│   │   └── index.css     # Tailwind CSS core directives and active theme configurations
│   ├── package.json
│   └── vite.config.ts
│
├── .gitignore            # Root-level Git ignores (ignores node_modules, builds, and keys)
└── package.json          # Root orchestration command package
```

---

## 🚀 Setup & Local Installation

### Prerequisites
- **Node.js** (v18 or higher recommended)
- **npm** (v9 or higher)
- **MongoDB** (Local instance running at `mongodb://127.0.0.1:27017` OR a MongoDB Atlas cloud URI)

### 1. Clone the Repository
```bash
git clone https://github.com/abhishek4222/Mental-Wellness-Streak-Tracker-Health-Wellness-.git
cd Mental-Wellness-Streak-Tracker-Health-Wellness-
```

### 2. Configure Environment Variables
Create a file named `.env.local` inside the `backend/` directory:
```bash
touch backend/.env.local
```

Populate `backend/.env.local` with the following variables:
```env
PORT=5001
MONGO_URI=mongodb://127.0.0.1:27017/wellness_streak
JWT_SECRET=your_super_secret_dev_token_key_change_me
JWT_EXPIRES=7d

# (Optional) SMTP Email configuration for sending real Sign-up OTPs:
# SMTP_HOST=smtp.gmail.com
# SMTP_PORT=465
# SMTP_SECURE=true
# SMTP_USER=your_email@gmail.com
# SMTP_PASS=your_email_password
# EMAIL_FROM=wellness@streaktracker.com
```
*Note: If SMTP credentials are not provided, the application prints verification OTPs directly to the terminal console during registration.*

---

### 3. Install Dependencies
Run the installation command in the root directory to set up the workspace dependencies:
```bash
npm run install:all
```
*(This automatically installs packages for the root orchestrator, `backend/`, and `frontend/` folders.)*

---

### 4. Running the Application in Development Mode

You can run both the frontend and backend servers concurrently with a single command from the root directory:
```bash
npm run dev
```

- **Frontend client** will launch at: `http://localhost:5173`
- **Backend API server** will run on port `5001` (with requests seamlessly proxied from `/api/*` on the client).

#### 🔑 Development OTP Bypass Code
During account creation, if you do not have SMTP configured or want to sign up quickly, you can use the built-in development bypass OTP code:
```text
123456
```

---

### 5. Production Build

To build the optimized client bundle for hosting:
```bash
npm run build
```
The compiled, production-ready static assets will be located in `frontend/dist/`.
