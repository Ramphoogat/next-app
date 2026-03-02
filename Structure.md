# Project Structure Guide

Below is the complete outline of all folders and files created or migrated for the Next.js web application.

## 📂 `src/` Directory File Tree

### 1. `app/` (Next.js App Router)

This folder holds all the front-end page routes and server-side API endpoints.

- **`api/`** (Backend API Routes)
  - `activity/route.ts` - System activity logs.
  - `auth/`
    - `login/route.ts`, `logout/route.ts`, `signup/route.ts`
    - `forgot-password/route.ts`, `reset-password/[token]/route.ts`
    - `verify-otp/route.ts`, `resend-otp/route.ts`
    - `github/route.ts`, `github/callback/route.ts`
    - `google/route.ts`, `google/callback/route.ts`
    - `overview/route.ts`, `profile/route.ts`, `users/route.ts`
    - `admin/`
      - `logs/route.ts`, `stats/route.ts`, `users/route.ts`, `users/[id]/route.ts`, `users/[id]/role/route.ts`
    - `role-requests/`
      - `route.ts`, `[id]/approve/route.ts`, `[id]/reject/route.ts`
  - `calendar/`
    - `route.ts`, `events/route.ts`, `sync/route.ts`
  - `settings/`
    - `route.ts`, `mode/route.ts`, `toggle/route.ts`
  - `sheets/`
    - `connect/route.ts`, `status/route.ts`, `sync/push/route.ts`
- **`dashboard/`**
  - `[[...section]]/`
    - `page.tsx` - Handles dynamic routing for different sections in the dashboard.
- **`forgot-password/`** -> `page.tsx`
- **`login/`** -> `page.tsx`
- **`privacy-policy/`** -> `page.tsx`
- **`reset-password/`**
  - `[token]/` -> `page.tsx`
- **`signup/`** -> `page.tsx`
- **`terms-of-service/`** -> `page.tsx`
- **`verify-otp/`** -> `page.tsx`
- `favicon.ico` - App icon
- `globals.css` - Global styling
- `layout.tsx` - Root layout wrapping every page
- `not-found.tsx` - Custom 404 page
- `page.tsx` - **Main Landing Page**

### 2. `components/` (Frontend React Components)

- **Root Components:**
  - `AdminSettings.tsx`, `AuthorSettings.tsx`, `EditorSettings.tsx`, `UsersSettings.tsx`
  - `Chats.tsx`, `CreateUserModal.tsx`, `CsvManagementSection.tsx`, `GoogleSheetsModal.tsx`
  - `DashboardLayout.tsx`, `DashboardSwitcher.tsx`, `SidebarComponent.tsx`, `Navbar.tsx`
  - `Expanded.tsx`, `FormSection.tsx`, `UnifiedDashboard.tsx`
  - `ForgotPassword.tsx`, `ResetPassword.tsx`, `VerifyOtp.tsx`
  - `Kanban.tsx`, `LightRays.tsx`, `Loader.tsx`
  - `NotificationCenter.tsx`, `NotificationToast.tsx`, `Toast.tsx`, `ToastProvider.tsx`
  - `OurTeams.tsx`, `Profile.tsx`, `ProfileEditModal.tsx`
  - `ProtectedRoute.tsx` (Handles session locking)
  - `ThemeComponent.tsx`, `ThemeToggle.tsx`
  - `error_404.tsx`, `requests.tsx`, `url_slug.tsx`
  - `ClientProviders.tsx`
- **`calendar_ui/`** (UI Specific to the complex calendar system)
  - `Calendar.tsx`, `CalendarDayView.tsx`, `CalendarMonthView.tsx`, `CalendarWeekView.tsx`, `CalendarYearView.tsx`
  - `CalendarShared.tsx`, `CalendarViews.tsx`, `TasksPanel.tsx`
  - `button.tsx`, `button-variants.ts`, `calendar-context.tsx`, `calendar-shared-hooks.ts`, `calendar-shared-types.ts`, `calendar-utils.ts`
- **`dashboards/`** (Role-specific dashboard rendering)
  - `AdminComponents.tsx`, `AdminDashboard.tsx`, `AuthorDashboard.tsx`, `EditorDashboard.tsx`, `UserDashboard.tsx`

### 3. `context/` (React Context Providers)

- `NotificationContext.tsx`
- `themeContext.tsx`

### 4. `models/` (Mongoose DB Schemas)

- `ActivityLog.ts`, `CalendarData.ts`, `RoleRequest.ts`, `SystemSettings.ts`, `User.ts`

### 5. `api/` (Frontend API hooks/wrappers)

- `axios.ts`, `calendar.ts`

### 6. `lib/` (Server-Side Helpers)

- `auth-helpers.ts`, `auth-utils.ts`, `emailService.ts`, `mongodb.ts`, `role-delegation.ts`, `sheets.ts`, `utils.ts`

### 7. `utils/` (Shared utilities)

- `activityLogger.ts`, `jwtUtils.ts`, `rolePermissions.ts`

### 8. `types/` (TypeScript Interfaces)

- `calendar.ts`, `dashboard.ts`

---

## 🔗 Route and Page Connections

Here is how each part of the app connects:

1. **Authentication Flow:**
   - User arrives at `/login` or `/signup` (from `app/login/page.tsx` and `app/signup/page.tsx`).
   - They communicate with `app/api/auth/login/route.ts` and `app/api/auth/signup/route.ts`.
   - Forgot password routing happens at `/forgot-password` which triggers email with link connecting to `/reset-password/[token]`.

2. **Dashboard Entry:**
   - After login, users are navigated to `/dashboard`.
   - This is handled by `app/dashboard/[[...section]]/page.tsx`.
   - The file uses `<ProtectedRoute>` (which wraps children to verify login status).
   - It renders `<DashboardSwitcher>` which is the brain that looks at the user's role and renders either:
     - `<AdminDashboard />`
     - `<AuthorDashboard />`
     - `<EditorDashboard />`
     - `<UserDashboard />`

3. **Dashboard Navigation (Sidebar & Sections):**
   - Inside the dashboard, `<SidebarComponent>` drives navigation between sections like **Calendar**, **Kanban**, **Roles**, **Settings**.
   - Clicking these buttons changes the URL (e.g., `/dashboard/calendar`), triggering `app/dashboard/[[...section]]/page.tsx` to render different components (`<Calendar />`, `<Kanban />`, `<AdminSettings />`, etc.).

4. **APIs Connections:**
   - Client-side Axios fetches in `src/api/` connect your frontend components (`Calendar.tsx`, `Profile.tsx`) straight to `app/api/` routes (e.g., fetching `app/api/calendar/route.ts`).

---

## ❓ Do we need the `components` folder and its `.tsx` files?

**Yes, Absolutely.**

The `app/` folder should strictly be used for the Next.js routing structure (determining what URL loads what generic page).

The `.tsx` files inside `components/` are completely essential because:

1. **Reusability:** A component like `Navbar.tsx` or `ThemeToggle.tsx` is being imported and reused across multiple App routes. If these were in the routing folders, you would have to duplicate code.
2. **"use client" directives:** In Next.js App Router, pages in `app/` are server components by default (they render on the backend). However, things like click handlers, state (e.g., hooks like `useState`), and interactive UIs (like the `Calendar` and `Kanban` boards) _must_ be Client Components. The best practice is to extract these interactive parts into the `components/` folder and mark them as `"use client"`.
3. **Clean Code:** `app/dashboard/[[...section]]/page.tsx` stays incredibly small and readable. All the messy, complex logic of rendering a 3,000-line calendar remains neatly tucked away separately in `components/calendar_ui/Calendar.tsx`.

So if you deleted the `components` folder, you would either have to embed tens of thousands of lines of React code directly inside `app/page.tsx` and `app/dashboard/page.tsx`, completely breaking modularity and forcing the entire app to be client-side rendered, which ruins performance.
