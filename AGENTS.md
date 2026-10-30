# Project Context

This project is an Offline-First Inventory Management Progressive Web App (PWA) designed for an electrical shop. The primary goal is to ensure the app functions seamlessly without an internet connection, providing fast, localized data operations.

# Tech Stack & Libraries

- **Frontend Framework**: React
- **Routing**: TanStack Router (File-based routing)
- **Data Fetching & State**: TanStack Query (React Query)
- **UI & Styling**: Tailwind CSS, Shadcn UI (built on Radix UI)
- **Local Database**: IndexedDB (using Dexie.js for offline-first architecture)
- **Global State**: React Context (Primary) / Zustand (Fallback for complex state)
- **Form Handling**: React Hook Form with Zod validation
- **Testing**: Vitest, React Testing Library (RTL)
- **PWA Features**: Service Workers, Web App Manifest
- **Tooling**: ESLint, Husky (Pre-commit hooks)

# Architecture & Coding Guidelines

### 1. Folder Structure Rules

Adhere to the following directory structure to maintain a clean architecture:

- `src/types/`: **Global shared types** and interfaces used across multiple features or domain entities.
- `src/routes/`: Strictly for TanStack Router file-based route definitions (`.tsx` and `.route.tsx`). **Feature or page-specific types** should be colocated directly within the specific route/page folder where they are used.
- `src/components/ui/`: Auto-generated Shadcn UI base components. Do not modify unless strictly necessary.
- `src/components/shared/`: Reusable, composite custom UI components.
- `src/lib/db/`: Dexie.js database configuration, schemas, migrations, and repository functions.
- `src/lib/api/`: Native `fetch` wrappers, API repository functions, and TanStack Query key factories/custom hooks.
- `src/lib/schemas/`: Zod validation schemas.
- `src/context/` or `src/store/`: React Context providers and Zustand stores.
- `src/hooks/`: Custom React hooks, especially `useLiveQuery` wrappers and synchronization logic.
- `src/utils/`: Helper functions (e.g., `cn()` class merger) and constants.

### 2. State Management (React Context vs. Zustand)

- **Separation of Concerns**: Use **Dexie.js** as the single source of truth for all persistent application data (inventory, offline queues).
- **React Context First**: Always default to React Context for standard global UI state (e.g., theme, auth state, layout toggles).
- **Zustand Fallback**: Only introduce Zustand if React Context does not make sense for the specific use case (e.g., high-frequency state updates causing performance bottlenecks, or overly complex global slices).

### 3. Form Handling & Validation (Zod)

- **Schema-First Forms**: All forms must use **React Hook Form** coupled with **Zod** schema validation via `@hookform/resolvers/zod`.
- **Type Inference**: Always infer TypeScript types directly from Zod schemas using `z.infer<typeof mySchema>`.

### 4. Routing (TanStack Router)

- **File-Based Conventions**: Strictly follow TanStack Router's file-based routing conventions.
- **Router & Query Integration**: Integrate the TanStack `QueryClient` directly into the route `loader` functions (e.g., using `queryClient.ensureQueryData`) to fetch and cache data before the route renders.

### 5. UI, Styling & Shadcn UI Rules

- **Strict Mobile-First Design**: Always design the UI for small screens first. Exclusively use responsive modifiers (`sm:`, `md:`, `lg:`) to scale the layout up.
- **Class Merging**: Always use the `cn()` utility function (combining `clsx` and `tailwind-merge`) when conditionally applying Tailwind classes.

### 6. Offline-First Data Flow & Dexie.js

- **Local First**: All inventory read/write operations must execute directly against the local IndexedDB via Dexie.js.
- **Background Sync**: Push local offline mutations to the server when network connectivity is restored.
- **Data Conflict Resolution**: Use a timestamp-based approach (`updatedAt`) with a **"Last Write Wins"** strategy for standard edits. For critical conflicts, explicitly flag the conflict in the UI for manual user resolution.

### 7. Data Fetching & Mutations (TanStack Query)

- **TanStack Query over Axios**: Use native `fetch` combined with TanStack Query (`useQuery`, `useMutation`) for server state management. Do not use Axios.
- **Optimistic Updates**: Utilize `useMutation`'s `onMutate` callback to implement optimistic UI updates for a snappy user experience.
- **Offline Mutation Queueing**: When a user performs an action offline, capture the intended mutation payload in the `onError` or network failure block and persist it into the Dexie.js offline sync queue. Resolve the local state optimistically so the UI remains unblocked.
- **Global Error Handling**: Handle standard HTTP errors (like 401 Unauthorized or 403 Forbidden) via a global `QueryCache` or `MutationCache` configuration in the `QueryClient` setup.

### 8. Testing (Vitest & React Testing Library)

- **Colocation**: Place test files directly next to the files they test using the `.test.tsx` or `.test.ts` extension (e.g., `Button.tsx` and `Button.test.tsx`).
- **Accessibility-First Queries**: In React Testing Library, always prioritize querying elements by accessibility roles (`getByRole`, `getByLabelText`) over `data-testid` to ensure the UI is accessible.
- **User Interactions**: Use `@testing-library/user-event` instead of `fireEvent` to accurately simulate real user interactions in the DOM.
- **Mocking**:
  - Mock API requests at the network level (e.g., using Mock Service Worker - MSW) rather than mocking `fetch` directly.
  - For Dexie.js database tests, utilize `fake-indexeddb` to run an in-memory database within the Vitest environment.

### 9. Code Formatting & Git Workflow

- **ESLint Guidelines**: Strictly adhere to the project's default ESLint rules. Do not suppress linting warnings using `// eslint-disable` unless absolutely necessary, and always provide a justification if doing so.
- **Husky Pre-commit**: A Husky pre-commit hook is actively enforcing linting and TypeScript type checking (`tsc --noEmit`). Ensure all generated code is entirely type-safe and lint-free to prevent commit failures.
- **Conventional Commits**: Use the Conventional Commits specification for all Git commit messages (e.g., `feat: add offline sync queue`, `fix: resolve dexie promise rejection`).

# AI Behavior & Instructions

- **Database Migrations**: If changes to the Dexie.js schema are necessary, you MUST write proper migration routines to prevent local data loss.
- **Offline Integrity Check**: Before modifying code, explicitly state whether your proposed changes could break offline capabilities or the background sync queue.
- **Strict Permissions**: Do not introduce major architectural changes or alter auto-generated files like `routeTree.gen.ts` without asking for my permission first.
