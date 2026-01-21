## 1. Product Overview
A modern, light-themed Todo app where you sign in and manage your own tasks.
Each task is stored as JSON and may include an encrypted “password” field for sensitive task-related secrets.

## 2. Core Features

### 2.1 User Roles
| Role | Registration Method | Core Permissions |
|------|---------------------|------------------|
| Guest | None | Can access sign up / sign in / password recovery screens only |
| Signed-in User | Email + password sign up (email verification optional) | Can create/read/update/delete only their own tasks; can change their account password |

### 2.2 Feature Module
Our requirements consist of the following main pages:
1. **Tasks Dashboard (Home)**: task list, create/edit task, task detail (incl. secret/password field), sign out.
2. **Authentication**: sign up, sign in, forgot password, reset password (from email link).
3. **Account & Security**: change password, session visibility (current email), sign out.

### 2.3 Page Details
| Page Name | Module Name | Feature description |
|-----------|-------------|---------------------|
| Tasks Dashboard (Home) | App header | Show app name, current user email, navigation to Account & Security, sign out |
| Tasks Dashboard (Home) | Task list | List only your tasks; show completion state; allow sort/filter by status (all/active/completed) |
| Tasks Dashboard (Home) | Create / Edit task | Create/edit task JSON fields (title, notes, due date, tags) and optional secret/password; save to your account |
| Tasks Dashboard (Home) | Secret/password handling | Encrypt secret/password before storage; display masked by default; allow “reveal” after explicit action |
| Tasks Dashboard (Home) | Delete / complete task | Mark complete/incomplete; delete task with confirmation |
| Authentication | Sign up | Create account with email + password; validate inputs; show success and next steps |
| Authentication | Sign in | Authenticate with email + password; handle errors; redirect to Tasks Dashboard |
| Authentication | Forgot password | Request reset email; show success message without leaking account existence |
| Authentication | Reset password | Set a new password from a reset link; validate and confirm success |
| Account & Security | Change password | Change password for a signed-in user; confirm success and optionally re-auth if required |

## 3. Core Process
**Guest → Sign up / Sign in**: You open the app, go to Authentication, then sign up or sign in. After success, you land on the Tasks Dashboard.

**Forgot / Reset password**: From Authentication, you request a reset email. You open the email link, set a new password on the Reset password screen, then sign in.

**Task management (signed-in)**: On the Tasks Dashboard, you create tasks and optionally add a sensitive secret/password. The app encrypts that value before storing it. You can edit, complete, delete, and (on explicit action) reveal a secret.

**Account security**: From the header you open Account & Security to change your password, then return to the Tasks Dashboard.

```mermaid
graph TD
  A["Authentication"] --> B["Tasks Dashboard (Home)"]
  A --> C["Reset Password"]
  C --> A
  B