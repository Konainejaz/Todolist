# Page Design — Encrypted JSON Todo App (Desktop-first)

## Global Styles (All Pages)
- Theme: **Light theme by default** (no dark-theme requirement).
- Design tokens
  - Background: `#F8FAFC` (app), `#FFFFFF` (cards)
  - Text: `#0F172A` primary, `#475569` secondary
  - Border: `#E2E8F0`
  - Accent: `#2563EB` (primary actions), hover `#1D4ED8`
  - Destructive: `#DC2626`
  - Radius: 10–12px for cards/modals
- Typography: 14–16px base, 24–28px page title, 12–13px helper text.
- Buttons: primary/secondary/ghost; clear focus rings; disabled state at 50% opacity.
- Layout system: hybrid **CSS Grid + Flexbox**.
  - Desktop container: max-width 1100–1200px, centered.
  - Spacing scale: 4/8/12/16/24/32.
  - Responsive: collapse multi-column to single column below ~900px.

## Page: Tasks Dashboard (Home)
### Meta Information
- Title: "My Tasks"
- Description: "Your private task list with encrypted secrets"
- Open Graph: title/description match; type "website"

### Page Structure
- Two-column layout on desktop:
  - Left: filters + quick stats
  - Right: task list + editor

### Sections & Components
1. Top App Bar
   - Left: product name
   - Right: user email (text), links: "Account", "Sign out"
2. Left Column (Sidebar Card)
   - Filter group: All / Active / Completed
   - Optional quick summary: counts per status
3. Main Column
   - "Create task" button opens editor panel (or modal)
   - Task list as card stack or table-like list
     - Each row: checkbox, title, due date (optional), tags (chips), actions (Edit/Delete)
     - Completed tasks appear muted with strikethrough title
4. Task Editor (Panel or Modal)
   - Fields: Title (required), Notes, Due date, Tags
   - Secret/Password field:
     - Input type password by default
     - Helper text: "Stored encrypted"
     - Actions: "Reveal" (explicit), "Copy" (only after reveal), "Hide"
   - Save / Cancel buttons
5. Confirm Dialog
   - Used for delete

### Interaction Notes
- Save shows inline success/error toast.
- Reveal secret requires explicit click and re-fetch/decrypt via RPC; never auto-reveal.

## Page: Authentication
### Meta Information
- Title: "Sign in"
- Description: "Access your tasks"

### Page Structure
- Centered auth card (max width ~420px) on a soft background.

### Sections & Components
1. Auth Card Header
   - Title + short helper text
2. Auth Mode Tabs
   - Tabs: Sign in / Sign up / Forgot password
3. Form (per mode)
   - Sign in: email, password, submit
   - Sign up: email, password, confirm password, submit
   - Forgot password: email, submit; success message state
4. Footer Links
   - Link to switch modes

### Reset Password Route (/auth/reset)
- Same centered card layout
- Fields: new password, confirm new password
- Submit leads back to Sign in mode with success state

## Page: Account & Security
### Meta Information
- Title: "Account & Security"
- Description: "Manage password and sessions"

### Page Structure
- Single-column settings layout (centered container, card sections).

### Sections & Components
1. Header
   - Page title, back link to "My Tasks"
2. Account Card
   - Read-only email display
3. Change Password Card
   - Fields: current password (if required by auth provider), new password, confirm
   - Save button + inline validation messages
4. Sign out
   - Secondary action button (also available in top app bar)
