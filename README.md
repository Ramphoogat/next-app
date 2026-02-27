# Full Stack Authentication & Role-Based Dashboard

This repository contains a rigorous, production-ready Full Stack Authentication System with a specialized Role-Based Access Control (RBAC) Dashboard. It has been built using the **Next.js 16 App Router**, merging both frontend UI and backend API boundaries into a single, cohesive codebase.

This project demonstrates a complete user lifecycle, from secure registration to role-specific dashboard access, all wrapped in a premium, modern UI.

---

## 1. Project Architecture & Features

Built with **Next.js 16 (Turbopack)**, **React 19**, and **Tailwind CSS v4**, focusing on performance, Server-Side Rendering (SSR), and a high-end user experience.

### Core Stack

- **Framework:** Next.js (App Router)
- **Styling:** Tailwind CSS v4 + native CSS variables
- **Database:** MongoDB & Mongoose (Globally cached connections)
- **Language:** TypeScript (Strict Mode)

### Key Features

- **Authentication Hub (API Routes):**
  - **Login & Signup:** secure, localized endpoints with bcrypt hashing.
  - **Forgot Password:** initiates password reset via email (`nodemailer` / `resend`).
  - **OTP Verification:** secure 6-digit code entry for account verification.
  - **JWT Sessions:** stateless, secure token-based session handling protected via Next.js Middleware.

- **Role-Based Dashboards:**
  - **Unified Dashboard Switcher:** A single entry point (`/dashboard`) that dynamically routes to the appropriate Server/Client component based on user role (Admin, Author, Editor, User).
  - **Role-Specific Panes:**
    - **Admin Dashboard:** system analytics, user management, and global settings.
    - **Author Dashboard:** content creation tools and Kanban boards.
    - **Editor Dashboard:** review queues, content calendars, and editorial tools.
    - **User Dashboard:** basic profile viewing and activity tracking.

- **Advanced UI/UX:**
  - **Liquid Chrome Background:** a WebGL-powered, interactive background using OGL (`<LightRays />` component).
  - **Theme System:** toggle between Light, Dark, Brutalist, macOS, and Terminal modes.
  - **Notification Center:** a robust toast and notification system for non-intrusive alerts.
  - **Profile Management:** modal-based profile editing for streamlined user updates.

---

## 2. Project File Structure

Below is the file structure for the unified Next.js application.

```text
/next-app
├── src/
│   ├── app/                        # Next.js App Router (Pages & API)
│   │   ├── api/                    # Serverless API Endpoints
│   │   │   ├── auth/               # Login, Signup, OTP, Admin, Role-routing
│   │   │   ├── calendar/           # Google Calendar syncing routes
│   │   │   ├── settings/           # Global application settings
│   │   │   └── sheets/             # Google Sheets integration routes
│   │   │
│   │   ├── dashboard/              # Protected Dashboard Route
│   │   │   └── [[...section]]/     # Catch-all for sub-tabs (overview, management)
│   │   ├── login/                  # Login Page
│   │   ├── signup/                 # Registration Page
│   │   ├── verify-otp/             # OTP Verification Page
│   │   ├── globals.css             # Tailwind v4 configuration & root styles
│   │   └── layout.tsx              # Root HTML Layout & Providers
│   │
│   ├── components/                 # Reusable UI Components
│   │   ├── dashboards/             # Specialized UI for Admin/Editor/Author/User
│   │   ├── calendar_ui/            # Calendar layout tools
│   │   ├── LightRays.tsx           # WebGL Background effect
│   │   ├── ThemeComponent.tsx      # Dark/Light mode switch
│   │   ├── UnifiedDashboard.tsx    # Safe client-hydrated role switcher
│   │   └── url_slug.tsx            # Custom hook for safe URL param routing
│   │
│   ├── lib/                        # Backend Utilities
│   │   ├── mongodb.ts              # Cached Mongoose connection handler
│   │   ├── emailService.ts         # Resend / Nodemailer configurations
│   │   └── auth-helpers.ts         # Server-side JWT helpers
│   │
│   └── models/                     # Mongoose Database Schemas
│       ├── User.ts
│       ├── SystemSettings.ts
│       └── RoleRequest.ts
│
├── next.config.ts                  # Next.js / Turbopack settings
└── package.json
```

---

## 3. Getting Started

### Prerequisites

- Node.js (v18+)
- MongoDB (Local or Atlas)
- npm or pnpm

### Running the Application

1.  Navigate to the `next-app` directory:

    ```bash
    cd next-app
    ```

2.  Install dependencies:

    ```bash
    npm install
    ```

3.  Configure your Environment Variables:
    Copy `.env.example` to `.env` (or create a `.env` file) and include the necessary keys:
    - `MONGO_URI=`
    - `JWT_SECRET=`
    - `RESEND_API_KEY=` (optional, for emails)
4.  Start the Next.js Turbopack development server:

    ```bash
    npm run dev
    ```

    _The app will be available at `http://localhost:3000`._

---

## 4. API Documentation Summary

Because this is a Next.js App Router application, API endpoints live securely under `/api`.

### Auth Endpoints (`/api/auth/...`)

- `POST /signup`: Register a new user.
- `POST /login`: Authenticate via Bcrypt and receive a JWT.
- `POST /verify-otp`: Verify account email.
- `POST /forgot-password`: Request a password reset link.
- `GET /profile`: Retrieve the logged-in user's data (Protected).

### Admin & Role Settings

- `GET /api/auth/admin/users`: Retrieve system-wide user directory (Protected/Admin).
- `PUT /api/auth/admin/users/[id]/role`: Change user access levels dynamically.
- `GET /api/settings`: Retrieve global system governance configurations.

---
