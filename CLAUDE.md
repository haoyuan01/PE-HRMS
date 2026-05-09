# HRMS Frontend — Claude Code Project Context

> This file is automatically read by Claude Code at the start of every session.
> It defines project conventions, architecture, and guidelines.

---

## 📌 Project Overview

**Project:** Human Resource Management System (HRMS)  
**Type:** Frontend-focused web application  
**Architecture:** Frontend SPA calling external REST APIs (no backend code in this repo)

---

## 🛠️ Tech Stack

| Layer                  | Technology                         |
| ---------------------- | ---------------------------------- |
| Framework              | Next.js (App Router)               |
| Styling                | Tailwind CSS                       |
| State Management       | Zustand                            |
| Language               | TypeScript                         |
| Package Manager        | npm (or pnpm)                      |
| API Communication      | Axios / Fetch (external REST APIs) |
| Form Handling          | React Hook Form + Zod (validation) |
| UI Components          | shadcn/ui (built on Radix UI)      |
| Icons                  | Lucide React                       |
| Date Handling          | date-fns                           |
| Table / Data Grid      | TanStack Table (React Table v8)    |
| Charts                 | Recharts                           |
| Notifications / Toasts | Sonner                             |
| Testing                | Vitest + React Testing Library     |

---

## 📁 Folder Structure

```
hrms/
├── app/                        # Next.js App Router pages
│   ├── (auth)/                 # Auth group (login, forgot password)
│   ├── (dashboard)/            # Protected dashboard layout
│   │   ├── employees/          # Employee management
│   │   ├── attendance/         # Attendance tracking
│   │   ├── payroll/            # Payroll management
│   │   ├── leave/              # Leave management
│   │   ├── recruitment/        # Recruitment & onboarding
│   │   ├── performance/        # Performance reviews
│   │   └── settings/           # System settings
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── ui/                     # shadcn/ui base components (DO NOT manually edit)
│   ├── common/                 # Shared reusable components
│   └── modules/                # Feature-specific components (e.g. EmployeeCard)
├── stores/                     # Zustand stores (one file per domain)
│   ├── useAuthStore.ts
│   ├── useEmployeeStore.ts
│   ├── useAttendanceStore.ts
│   ├── useLeaveStore.ts
│   └── useUIStore.ts           # Global UI state (sidebar, modals, loading)
├── hooks/                      # Custom React hooks
├── lib/
│   ├── api/                    # API service layer (Axios instances, endpoints)
│   ├── utils.ts                # Utility functions (cn(), formatDate, etc.)
│   └── constants.ts            # App-wide constants
├── types/                      # TypeScript interfaces & types
├── public/                     # Static assets
└── middleware.ts               # Auth route protection
```

## 🏪 Zustand State Management Rules

- **One store per domain** — do not merge unrelated state into one store.
- Store files live in `/stores/`, named `use[Domain]Store.ts`.
- Use `immer` middleware for complex nested state updates.
- Use `persist` middleware (with `localStorage`) only for auth token and user preferences.
- Keep API calls **outside** the store — put them in `/lib/api/` and call them from hooks or components, then update the store.
- Never put server state (data fetched from API) permanently in Zustand — use local component state or a server state layer for that; Zustand is for UI/client state.

**Example store pattern:**

```ts
// stores/useEmployeeStore.ts
import { create } from "zustand";

interface EmployeeStore {
  selectedEmployeeId: string | null;
  setSelectedEmployeeId: (id: string | null) => void;
  filterDepartment: string;
  setFilterDepartment: (dept: string) => void;
}

export const useEmployeeStore = create<EmployeeStore>((set) => ({
  selectedEmployeeId: null,
  setSelectedEmployeeId: (id) => set({ selectedEmployeeId: id }),
  filterDepartment: "all",
  setFilterDepartment: (dept) => set({ filterDepartment: dept }),
}));
```

---

## 🌐 API Layer

- All API calls go through `/lib/api/` — **never call fetch/axios directly in components**.
- Use a base Axios instance with interceptors for auth token injection and error handling.
- API functions are grouped by module (e.g., `employeeApi.ts`, `leaveApi.ts`).
- Handle loading and error states in the component or custom hook that calls the API.
- The backend is external — base URLs come from environment variables.

**Environment variables (`.env.local`):**

```
NEXT_PUBLIC_API_BASE_URL=https://api.your-hrms-backend.com
NEXT_PUBLIC_APP_ENV=development
```

---

## 🎨 Styling Guidelines

- Use **Tailwind CSS utility classes** — avoid writing custom CSS unless absolutely necessary.
- Use the `cn()` helper from `lib/utils.ts` (clsx + tailwind-merge) to merge class names.
- Follow a **mobile-first** approach — design for small screens first, scale up with `sm:`, `md:`, `lg:` prefixes.
- Color system: use Tailwind's `slate` for neutral tones, `blue` for primary actions, `red` for destructive, `green` for success.
- Dark mode: use Tailwind's `dark:` variant — the app supports light/dark toggle.
- Do not use inline `style={{}}` except for truly dynamic values (e.g. progress bar width).

---

## 🧩 Component Guidelines

- Prefer **small, single-responsibility components**.
- Use `shadcn/ui` primitives (Button, Dialog, Table, Select, etc.) as the base — extend, don't replace.
- All forms must use **React Hook Form** with **Zod** schema validation.
- Use **TanStack Table** for any data table with sorting, filtering, or pagination.
- Wrap page-level data fetching in loading/error boundary components.

---

## 🔐 Authentication & Routing

- Auth is JWT-based — token stored in `localStorage` via the `useAuthStore` (persisted).
- `middleware.ts` protects all `/dashboard/*` routes — redirect to `/login` if no token.
- Role-based access control (RBAC) — check user roles before rendering sensitive UI.
- Roles: `super_admin`, `hr_admin`, `manager`, `employee`.

---

## ✅ Code Conventions

- **TypeScript strict mode** is on — always type props, API responses, and store state.
- Use `interface` for object shapes and `type` for unions/intersections.
- File naming: `kebab-case` for files, `PascalCase` for components, `camelCase` for functions/variables.
- Always handle loading, error, and empty states in data-driven UI.
- Use `async/await` — no raw `.then()` chains.
- No `any` types — use `unknown` and narrow, or define proper interfaces.
- Export components as named exports (not default exports) except for Next.js page files.

---

## 🧪 Testing

- Unit tests: `Vitest` + `React Testing Library`.
- Test files live next to their source file: `ComponentName.test.tsx`.
- Focus tests on behaviour, not implementation details.
- Run tests: `npm run test`

---

## 📜 Common Commands

```bash
# Development
npm run dev           # Start dev server (localhost:3000)

# Build
npm run build         # Production build
npm run start         # Start production server

# Code Quality
npm run lint          # ESLint
npm run type-check    # TypeScript check

# Testing
npm run test          # Run all tests
npm run test:ui       # Vitest UI

# shadcn/ui
npx shadcn@latest add [component]   # Add a new shadcn component
```

---

## ⚠️ Important Notes for Claude

- **Do not modify** files inside `components/ui/` — these are auto-generated by shadcn/ui.
- **Do not commit** `.env.local` or any secrets.
- When adding a new HRMS module, follow the existing folder pattern: create the page in `app/(dashboard)/[module]/`, add a store in `stores/`, and an API file in `lib/api/`.
- When generating forms, always use React Hook Form + Zod, never raw controlled inputs.
- When generating tables, always use TanStack Table.
- Prefer composition over prop-drilling — use Zustand store for shared state between deeply nested components.
- Always generate TypeScript types for API response shapes in `/types/`.
