\# Tandem



A full-stack collaborative project management tool — think a lightweight Trello/Jira — built to demonstrate real-world \*\*role-based access control (RBAC)\*\* alongside a working real-time collaboration stack.



Teams create projects, add tasks, and drag them across a To Do / In Progress / Done board. Every change syncs live across everyone viewing that board. What makes this more than a CRUD tutorial clone is the access control layer underneath: three distinct roles (Admin, Manager, Employee) with permissions enforced entirely server-side, proven with live tests, not just hidden UI buttons.



\## Why this project exists



Most portfolio task-tracker clones stop at "logged-in users can do CRUD." This one goes further to demonstrate the security thinking that separates a toy project from something closer to production-grade: \*\*authorization\*\*, not just authentication. A user being logged in tells you \*who\* they are; it says nothing about \*what they're allowed to do\*. That distinction is the whole point of this build.



\## Tech stack



| Layer | Technology |

|---|---|

| Frontend | React (Vite), `@dnd-kit` for drag-and-drop, `socket.io-client` |

| Backend | Node.js, Express |

| Database | PostgreSQL |

| Real-time | Socket.io (WebSockets) |

| Auth | JWT (JSON Web Tokens), bcrypt for password hashing |



\## Features



\- \*\*JWT authentication\*\* — signup/login, passwords hashed with bcrypt, never stored in plaintext

\- \*\*Role-based access control\*\* — Admin / Manager / Employee, scoped per-team (a user's role is a property of their \*team membership\*, not a global flag — so the same person can be an Admin on one team and an Employee on another)

\- \*\*Real-time collaborative board\*\* — drag-and-drop tasks between columns; changes broadcast instantly to every connected client via WebSockets, no polling or refresh required

\- \*\*Task assignment\*\* — tasks can be assigned to specific team members, with an avatar/initials indicator on each card

\- \*\*Manager-only analytics dashboard\*\* — task counts by status, per-member completion rates — inaccessible to Employees, enforced at the API level

\- \*\*Centralized permission matrix\*\* — a single source of truth for "who can do what," rather than permission checks scattered ad-hoc through route handlers



\## RBAC design — the core of this project



Rather than sprinkling `if (user.role === 'ADMIN')` checks through every route, permissions are defined once, in one place:



```js

const PERMISSIONS = {

&#x20; 'team:invite\_member': \['ADMIN', 'MANAGER'],

&#x20; 'project:create':     \['ADMIN', 'MANAGER'],

&#x20; 'project:delete':     \['ADMIN', 'MANAGER'],

&#x20; 'project:view':       \['ADMIN', 'MANAGER', 'EMPLOYEE'],

&#x20; 'analytics:view':     \['ADMIN', 'MANAGER'],

&#x20; 'task:create':        \['ADMIN', 'MANAGER'],

&#x20; 'task:delete':        \['ADMIN', 'MANAGER'],

&#x20; 'task:view':          \['ADMIN', 'MANAGER', 'EMPLOYEE'],

&#x20; 'task:update\_status': \['ADMIN', 'MANAGER', 'EMPLOYEE'],

};

```



A single `requirePermission(action)` middleware looks up the caller's role for the relevant team (resolved server-side from the database, never trusted from the client) and checks it against this table. Any action not explicitly listed is \*\*denied by default\*\* — a new route added later is automatically locked down until someone deliberately opens it up.



\### Three layers of enforcement, each proven with a live test



1\. \*\*Role-based blocking\*\* — an Employee calling `POST /teams/:teamId/invite` gets a `403`, even with a valid token, because their role isn't in that action's allowed list.

2\. \*\*Ownership-based blocking\*\* — task status updates layer an additional check on top of the role check: an Employee may only drag/update tasks \*assigned to them\*. A Manager or Admin can move any task; an Employee attempting to move a colleague's task gets rejected server-side, with the UI rolling back the optimistic drag.

3\. \*\*Data-hiding, not just UI-hiding\*\* — the Analytics link is hidden from Employees in the UI, but that's cosmetic. The real enforcement is that `GET /teams/:teamId/analytics` returns a `403` for an Employee token regardless of how the request is made — manually typing the URL, calling the API directly with a tool like Postman, anything. Hiding a button is not security; a server-side check is.



\## Architecture

