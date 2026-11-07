# Project Context

This project is an Offline-First Inventory Management Progressive Web App (PWA) designed for an electrical shop. The primary goal is to ensure the app functions seamlessly without an internet connection, providing fast, localized data operations.

# Tech Stack & Libraries

- **Frontend Framework**: React
- **Routing**: TanStack Router (File-based routing)
- **Data Fetching & State**: TanStack Query (React Query)
- **UI & Styling**: Tailwind CSS, Shadcn UI (built on Base UI)
- **Local Database**: IndexedDB (using Dexie.js for offline-first architecture)
- **Global State**: React Context (Primary) / Zustand (Fallback for complex state)
- **Form Handling**: React Hook Form with Zod validation
- **Internationalization (i18n)**: Dependency-free React Context (`LanguageContext`) with bundled dictionaries; supported languages: English (`en`, default) and Burmese (`my`)
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
- `src/lib/i18n/`: Language config (`SUPPORTED_LANGUAGES`) and translation dictionaries (`en.ts` is the source of truth for keys; `my.ts` must implement every key).
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
- **Data Conflict Resolution**: Follow the table in `PROJECT_SPEC.md` §5.7. Use `updatedAt` (server time authoritative) with **"Last Write Wins"** for standard edits such as item metadata and current prices. `price_history`, invoices, invoice items and `stock_movements` are append-only and never conflict. Never overwrite `stockLevel`: it is a local cache, synced only as signed `stock_movements` deltas. For critical conflicts, set `syncStatus = 'conflict'`, store both versions in `conflicts`, and flag it in the UI for manual resolution.
- **IDs & Money**: Use client-generated UUIDv7 IDs, integer minor units for money (never floats), and soft deletes (`deletedAt`) so deletes can sync.
- **Offline Auth**: Cache the session in Dexie (`session` table) with `offlineValidUntil`. Enforce RBAC locally from the cached role while offline. After expiry, lock the app until the user re-authenticates online. Never delete unsynced data on logout or auth failure.
- **Pull Sync**: Use per-entity cursors in `meta` and handle tombstones. Applying a pulled record over a `pending` local record must go through the conflict rules.
- **Activity Log**: Every create/update/delete (soft delete, restore, void) must write an append-only `activity_logs` row in the **same Dexie transaction** as the entity and its `sync_queue` entry, via the single `withAudit()` repository helper in `src/lib/db/`. Never write entities outside it. Reads and logins are not logged. Store field-level diffs (`{field: [old, new]}`) plus `entityLabel`/`userName` snapshots; never log tokens. The log is synced inside the same queue entry as its mutation. The server overrides `userId` from the auth token. Viewing is gated by the `activity_log.view` permission (Admin by default, grantable by Admin); hide buying-price diffs from non-Admins. See `PROJECT_SPEC.md` §5.10.
- **Service Worker**: Precache the app shell only. Never cache API data in the service worker; data lives in Dexie. Don't auto-reload mid-checkout when a new version is available.

### 7. Data Fetching & Mutations (TanStack Query)

- **Native `fetch` + TanStack Query**: Use native `fetch` (wrapped in `src/lib/api/`) combined with TanStack Query (`useQuery`, `useMutation`) for server state management. Do not add Axios.
- **Optimistic Updates**: Utilize `useMutation`'s `onMutate` callback to implement optimistic UI updates for a snappy user experience.
- **Offline Mutation Queueing**: UI mutations never call the network directly. They write the entity and a `sync_queue` entry in a single Dexie transaction (entity `syncStatus = 'pending'`) and resolve optimistically. Only the sync worker talks to the server. Do not rely on `onError` to capture mutations, because that can lose them.
- **Sync Worker Rules** (see `PROJECT_SPEC.md` §5): a single worker guarded by a Web Lock; entries processed in `sequence` order, honoring `dependsOn`; every request sends an `Idempotency-Key` header from the entry's `idempotencyKey`; network/5xx errors retry with exponential backoff and jitter, and fail after the max retries; non-auth 4xx errors mark the entry `failed` (and dependents `blocked`); a 401 pauses the queue and prompts re-login without discarding entries; a 403 marks the entry `failed`. Push always runs before pull.
- **Atomic Mutations**: An invoice and its `invoice_items`, `stock_movements` and activity log are one `CREATE_INVOICE` queue entry. Price changes are one `UPDATE_PRICE` entry (append to `price_history`, update the item, plus its activity log). Push via the batched `POST /sync/push`; pull cursors are server change-sequence ids (`PROJECT_SPEC.md` §5.11).
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

### 10. Multi-Language Support (i18n)

- **Supported Languages**: English (`en`, default) and Burmese (`my`). Adding a language means extending `SUPPORTED_LANGUAGES`, `LANGUAGE_LABELS`, and `dictionaries` in `src/lib/i18n/index.ts`.
- **System-Wide Coverage**: Translation applies to the entire application, not individual features. Every new or modified component, route, layout element (header, sidebar, menus, dialogs), form, empty/loading/error state, toast, `document.title`/page metadata, PWA manifest text, and offline/sync status message must be translated in both `en` and `my` in the same change. Do not merge UI work that leaves hardcoded user-facing strings; when touching an existing file with hardcoded strings, migrate them. Brand/proper names (e.g., app name) and user-entered data are exempt.
- **No Hardcoded UI Strings**: All user-facing text (labels, placeholders, aria-labels, validation messages, toasts) must use `const { t } = useLanguage()` with a typed `TranslationKey`. Add new keys to `en.ts` first, then to `my.ts` (the type system enforces parity). Name keys by area (e.g., `sidebar.*`, `userMenu.*`, `common.*` for shared text).
- **Offline-First**: Dictionaries are bundled in the app; never fetch translations over the network. Language preference persists in `localStorage` and is mirrored on `<html lang>`.
- **Data vs. UI Text**: Store user/inventory data as entered; translate only UI chrome. Never store translated strings in Dexie.js.
- **Burmese Typography**: Use Unicode (never Zawgyi) text. Keep the Myanmar font fallbacks in the `--font-sans` stack and avoid fixed-width/height or `truncate` on text where Burmese glyphs may clip; allow for taller line-height.
- **Zod Messages**: Schema error messages must be translation keys resolved with `t()` at render time.
- **Formatting**: Use `Intl` APIs with the active language for dates, numbers, and currency.
- **Testing**: Components using `t()` render in English without a provider; wrap in `LanguageProvider` to test Burmese.

# AI Behavior & Instructions

- **Database Migrations**: If changes to the Dexie.js schema are necessary, you MUST write proper migration routines to prevent local data loss.
- **Offline Integrity Check**: Before modifying code, explicitly state whether your proposed changes could break offline capabilities or the background sync queue.
- **Strict Permissions**: Do not introduce major architectural changes or alter auto-generated files like `routeTree.gen.ts` without asking for my permission first.
