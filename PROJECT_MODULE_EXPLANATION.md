# MockMate Project And Codebase Explanation

## 1. Project Summary

MockMate is a full-stack interview preparation platform built around four major ideas:

- AI-powered interview practice
- volunteer-based mock interview sessions
- a job portal for candidates
- a coin-based reward and spending system

The project uses:

- Frontend: React + Vite + Tailwind CSS
- Backend: Node.js + Express
- Database: MongoDB with Mongoose
- Authentication: Firebase Authentication
- Realtime: Socket.IO for volunteer meeting signaling
- AI layer: NVIDIA OpenAI-compatible API using the `qwen/qwen3.5-122b-a10b` model

The codebase is split into two main parts:

- `src/` for the frontend application
- `server/` for the backend API, database logic, and AI integration

---

## 2. High-Level Architecture

### Frontend responsibilities

The frontend is responsible for:

- rendering pages and UI components
- handling navigation
- managing logged-in user state in the browser
- calling backend APIs
- presenting AI interview, volunteer, jobs, dashboard, and coin store flows

### Backend responsibilities

The backend is responsible for:

- authenticating requests
- reading and writing MongoDB data
- generating or evaluating interview content through the AI service
- managing coins, bookings, volunteers, and admin data
- providing Socket.IO signaling for volunteer meeting rooms

### Core runtime flow

1. User opens the React app.
2. `App.jsx` resolves the current route and renders the correct page module.
3. `AuthContext` manages Firebase login state.
4. `src/services/api.js` sends requests to `/api/*`.
5. Express routes in `server/src/routes/` handle business logic.
6. Mongoose models in `server/src/models/` persist data.
7. AI requests go through `server/src/services/aiService.js`.
8. Volunteer meeting signaling goes through `server/src/realtime/signaling.js`.

---

## 3. Root Folder Explanation

### `src/`

Contains the frontend application.

### `server/`

Contains the backend API, models, middleware, realtime signaling, and AI integration.

### `public/`

Static assets served directly by Vite.

### `scripts/`

Utility scripts used during development. The custom `dev.js` runner is used to start frontend and backend together more reliably on Windows.

### `build/`

Production frontend build output.

### Important top-level files

- [package.json](C:\Users\SAGAR%20KUMAR%20GAUTAM\Downloads\New%20folder\MockMate-main\MockMate-main\package.json): frontend dependencies and root scripts
- [vite.config.js](C:\Users\SAGAR%20KUMAR%20GAUTAM\Downloads\New%20folder\MockMate-main\MockMate-main\vite.config.js): Vite configuration and proxy setup
- [README.md](C:\Users\SAGAR%20KUMAR%20GAUTAM\Downloads\New%20folder\MockMate-main\MockMate-main\README.md): basic setup overview
- [CHANGES_SUMMARY.md](C:\Users\SAGAR%20KUMAR%20GAUTAM\Downloads\New%20folder\MockMate-main\MockMate-main\CHANGES_SUMMARY.md): change tracking
- [CODEBASE_EXPLANATION.md](C:\Users\SAGAR%20KUMAR%20GAUTAM\Downloads\New%20folder\MockMate-main\MockMate-main\CODEBASE_EXPLANATION.md): older explanation document

---

## 4. Frontend Module Explanation

## 4.1 App Shell

### [src/App.jsx](C:\Users\SAGAR%20KUMAR%20GAUTAM\Downloads\New%20folder\MockMate-main\MockMate-main\src\App.jsx)

This is the root frontend controller.

It handles:

- current page selection
- route-to-page mapping
- browser history integration
- protected page gating
- basic global coin state
- backend health detection
- conditional rendering of the footer for meeting pages

Current page keys include:

- `home`
- `ai-interview`
- `jobs`
- `dashboard`
- `volunteer-interview`
- `volunteer-meeting`
- `coin-store`
- `admin`

This file is the central page router for the app.

---

## 4.2 Authentication Module

### [src/contexts/AuthContext.jsx](C:\Users\SAGAR%20KUMAR%20GAUTAM\Downloads\New%20folder\MockMate-main\MockMate-main\src\contexts\AuthContext.jsx)

This file provides the authentication context used across the frontend.

It handles:

- Firebase auth state listening
- Google sign-in
- logout
- injecting the Firebase ID token into API requests through `setTokenGetter`

Why it matters:

- protected routes like AI Interview, Dashboard, Coins, and Admin depend on this module
- backend auth middleware uses the Firebase token sent from the frontend

---

## 4.3 API Service Module

### [src/services/api.js](C:\Users\SAGAR%20KUMAR%20GAUTAM\Downloads\New%20folder\MockMate-main\MockMate-main\src\services\api.js)

This file is the frontend API gateway.

It contains:

- a shared Axios instance
- auth token injection
- backend timeout handling
- mock mode support through `VITE_MOCK_MODE`
- namespaced API wrappers

Exported namespaces:

- `statsAPI`
- `userAPI`
- `coinsAPI`
- `interviewAPI`
- `jobsAPI`
- `volunteerAPI`
- `adminAPI`

This module isolates API details from UI components, which keeps the components cleaner.

---

## 4.4 Navigation And Layout

### [src/components/Navbar.jsx](C:\Users\SAGAR%20KUMAR%20GAUTAM\Downloads\New%20folder\MockMate-main\MockMate-main\src\components\Navbar.jsx)

Top navigation bar. It is fixed and controls page switching through the `onNavigate` callback.

### [src/components/Footer.jsx](C:\Users\SAGAR%20KUMAR%20GAUTAM\Downloads\New%20folder\MockMate-main\MockMate-main\src\components\Footer.jsx)

Bottom footer for branding and quick links. Hidden on the dedicated volunteer meeting page to keep the call UI clean.

### [src/components/ErrorBoundary.jsx](C:\Users\SAGAR%20KUMAR%20GAUTAM\Downloads\New%20folder\MockMate-main\MockMate-main\src\components\ErrorBoundary.jsx)

Protects the app from crashing silently when a child component throws.

---

## 4.5 Home Module

### [src/components/Home.jsx](C:\Users\SAGAR%20KUMAR%20GAUTAM\Downloads\New%20folder\MockMate-main\MockMate-main\src\components\Home.jsx)

Landing page module.

It is responsible for:

- project branding
- hero content
- feature previews
- calls to action leading into AI interview, volunteer, jobs, and other product areas

This module acts as the product entry point.

---

## 4.6 AI Interview Module

### [src/components/AIInterview.jsx](C:\Users\SAGAR%20KUMAR%20GAUTAM\Downloads\New%20folder\MockMate-main\MockMate-main\src\components\AIInterview.jsx)

This is one of the core modules in the product.

It handles:

- interview type selection
- difficulty selection
- starting an interview session
- question-by-question answer submission
- feedback display
- final session completion
- coin rewards after completion

It talks mainly to:

- `interviewAPI.start`
- `interviewAPI.submitAnswer`
- `interviewAPI.complete`
- `interviewAPI.getHistory`

Key behavior:

- if AI generation or evaluation is slow, the backend can fall back to local question/evaluation logic
- the UI still preserves the interview flow even when the external AI provider is slow

Supporting components:

- [src/components/VoiceControls.jsx](C:\Users\SAGAR%20KUMAR%20GAUTAM\Downloads\New%20folder\MockMate-main\MockMate-main\src\components\VoiceControls.jsx)
- [src/components/CameraPreview.jsx](C:\Users\SAGAR%20KUMAR%20GAUTAM\Downloads\New%20folder\MockMate-main\MockMate-main\src\components\CameraPreview.jsx)

These support the interview experience depending on how the page is configured.

---

## 4.7 Volunteer Module

### [src/components/VolunteerInterview.jsx](C:\Users\SAGAR%20KUMAR%20GAUTAM\Downloads\New%20folder\MockMate-main\MockMate-main\src\components\VolunteerInterview.jsx)

This is the main volunteer marketplace and entry page.

It handles:

- listing available volunteers
- filtering and searching volunteers
- volunteer registration
- volunteer booking
- starting a volunteer meeting room
- joining an existing room via link or room code

This module has grown into a combination of:

- volunteer discovery page
- volunteer application page
- meeting launch page

Related components:

- [src/components/VolunteerRegistrationForm.jsx](C:\Users\SAGAR%20KUMAR%20GAUTAM\Downloads\New%20folder\MockMate-main\MockMate-main\src\components\VolunteerRegistrationForm.jsx)
- [src/components/VolunteerBookingModal.jsx](C:\Users\SAGAR%20KUMAR%20GAUTAM\Downloads\New%20folder\MockMate-main\MockMate-main\src\components\VolunteerBookingModal.jsx)
- [src/components/RatingModal.jsx](C:\Users\SAGAR%20KUMAR%20GAUTAM\Downloads\New%20folder\MockMate-main\MockMate-main\src\components\RatingModal.jsx)

### [src/components/VolunteerLiveInterview.jsx](C:\Users\SAGAR%20KUMAR%20GAUTAM\Downloads\New%20folder\MockMate-main\MockMate-main\src\components\VolunteerLiveInterview.jsx)

This is the dedicated meeting room module.

It handles:

- room creation and joining
- media acquisition for camera and microphone
- peer connection setup
- Socket.IO signaling
- local and remote video rendering
- viewer/audio fallback mode when camera is unavailable
- meeting diagnostics and session UI

This is one of the most interactive modules in the frontend.

---

## 4.8 Job Portal Module

### [src/components/JobPortal.jsx](C:\Users\SAGAR%20KUMAR%20GAUTAM\Downloads\New%20folder\MockMate-main\MockMate-main\src\components\JobPortal.jsx)

This module is responsible for:

- job listing display
- search and filter UI
- quick apply interactions
- job browsing experience

It talks mainly to:

- `jobsAPI.getJobs`
- `jobsAPI.apply`

This module is candidate-facing and tied to the broader career-preparation story of the product.

---

## 4.9 Dashboard Module

### [src/components/UserDashboard.jsx](C:\Users\SAGAR%20KUMAR%20GAUTAM\Downloads\New%20folder\MockMate-main\MockMate-main\src\components\UserDashboard.jsx)

This module provides the personal progress area for signed-in users.

It is responsible for:

- showing interview history
- showing skill or activity progress
- exposing candidate profile information
- surfacing recent usage and earned progress

It relies on:

- `userAPI.getMe`
- `interviewAPI.getHistory`
- `coinsAPI.getHistory`

---

## 4.10 Coin Store Module

### [src/components/CoinStore.jsx](C:\Users\SAGAR%20KUMAR%20GAUTAM\Downloads\New%20folder\MockMate-main\MockMate-main\src\components\CoinStore.jsx)

This module is the monetization and gamification storefront.

It handles:

- displaying user balance
- showing premium or paid items
- purchases with coins
- purchase-related status handling

It talks mainly to:

- `coinsAPI.getHistory`
- `coinsAPI.purchase`

---

## 4.11 Admin Module

### [src/components/AdminPanel.jsx](C:\Users\SAGAR%20KUMAR%20GAUTAM\Downloads\New%20folder\MockMate-main\MockMate-main\src\components\AdminPanel.jsx)

This module is the platform management area for admin users.

It handles:

- overview metrics
- volunteer moderation
- user list display
- transaction visibility

It talks mainly to:

- `adminAPI.getOverview`
- `adminAPI.getVolunteers`
- `adminAPI.setVolunteerApproval`
- `adminAPI.getUsers`
- `adminAPI.getTransactions`

---

## 4.12 Shared And Utility UI

The project also contains common reusable UI and helper modules.

Examples:

- `src/components/ui/*` for shared shadcn/radix-based UI primitives
- `src/hooks/` for reusable hooks
- `src/styles/` for styling layers
- `src/firebase/` for Firebase configuration

These shared modules reduce duplication across the feature pages.

---

## 5. Backend Module Explanation

## 5.1 Backend Entry Point

### [server/server.js](C:\Users\SAGAR%20KUMAR%20GAUTAM\Downloads\New%20folder\MockMate-main\MockMate-main\server\server.js)

This file starts the backend.

It does three main things:

- loads environment variables
- connects MongoDB
- creates the HTTP server and attaches Socket.IO signaling

After MongoDB connects, the Express app starts on port `5000` by default.

---

## 5.2 Express App Configuration

### [server/src/app.js](C:\Users\SAGAR%20KUMAR%20GAUTAM\Downloads\New%20folder\MockMate-main\MockMate-main\server\src\app.js)

This file wires the backend middleware and routes.

It configures:

- `helmet` for security headers
- CORS for frontend origins
- JSON request parsing
- API rate limiting
- health check endpoint
- route mounting
- 404 handling
- global error handling

Mounted route groups:

- `/api/auth`
- `/api/users`
- `/api/interview`
- `/api/jobs`
- `/api/volunteer`
- `/api/coins`
- `/api/stats`
- `/api/admin`

---

## 5.3 Middleware Module

### `server/src/middleware/`

This folder contains request-level control logic.

Important middleware:

- `auth.js`: validates the Firebase-authenticated user and loads the matching app user
- `requireAdmin.js`: restricts admin-only endpoints
- `errorHandler.js`: centralizes API error responses

This layer separates security and request validation from route business logic.

---

## 5.4 AI Service Module

### [server/src/services/aiService.js](C:\Users\SAGAR%20KUMAR%20GAUTAM\Downloads\New%20folder\MockMate-main\MockMate-main\server\src\services\aiService.js)

This file is the backend AI integration layer.

It currently uses:

- `openai` SDK
- NVIDIA OpenAI-compatible base URL
- model: `qwen/qwen3.5-122b-a10b`

Main responsibilities:

- generate interview questions
- evaluate answers
- normalize API access using `NVIDIA_API_KEY`
- sanitize AI responses
- provide fallback questions when the AI service is unavailable or slow

This file is intentionally isolated so the rest of the app does not depend directly on a specific AI provider implementation.

---

## 5.5 Interview Route Module

### [server/src/routes/interview.js](C:\Users\SAGAR%20KUMAR%20GAUTAM\Downloads\New%20folder\MockMate-main\MockMate-main\server\src\routes\interview.js)

This route module powers the AI interview feature.

Main endpoints:

- `POST /api/interview/start`
- `POST /api/interview/:id/answer`
- `POST /api/interview/:id/complete`
- `GET /api/interview/history`

Responsibilities:

- create interview sessions
- generate AI questions with timeout protection
- evaluate answers with timeout protection
- save Q/A history in MongoDB
- calculate final overall score
- award completion coins
- expose past completed sessions

Important behavior:

- if AI times out, the route falls back to local question/evaluation logic
- this prevents the user flow from breaking when the external provider is unreliable

---

## 5.6 Volunteer Route Module

### [server/src/routes/volunteer.js](C:\Users\SAGAR%20KUMAR%20GAUTAM\Downloads\New%20folder\MockMate-main\MockMate-main\server\src\routes\volunteer.js)

This route module powers the volunteer ecosystem.

Main endpoints:

- `GET /api/volunteer/list`
- `POST /api/volunteer/register`
- `POST /api/volunteer/book`
- `POST /api/volunteer/session/:bookingId/rate`

Responsibilities:

- list approved volunteers
- register or update volunteer profiles
- auto-approve in local or configured environments
- create bookings
- spend candidate coins for bookings
- let candidates rate volunteer sessions
- update volunteer review score and count

This module is the center of the mentor marketplace logic.

---

## 5.7 User Route Module

### [server/src/routes/users.js](C:\Users\SAGAR%20KUMAR%20GAUTAM\Downloads\New%20folder\MockMate-main\MockMate-main\server\src\routes\users.js)

This module handles:

- current user profile retrieval
- current user profile updates

Main endpoints:

- `GET /api/users/me`
- `PATCH /api/users/me`

---

## 5.8 Admin Route Module

### [server/src/routes/admin.js](C:\Users\SAGAR%20KUMAR%20GAUTAM\Downloads\New%20folder\MockMate-main\MockMate-main\server\src\routes\admin.js)

This module provides management and moderation features for admins.

Main endpoints:

- `GET /api/admin/overview`
- `GET /api/admin/volunteers`
- `PATCH /api/admin/volunteers/:id/approval`
- `GET /api/admin/users`
- `GET /api/admin/transactions`

Responsibilities:

- count platform-level metrics
- approve or reject volunteer profiles
- inspect users
- inspect coin transactions

---

## 5.9 Other Backend Route Modules

### `server/src/routes/auth.js`

Auth-related route support.

### `server/src/routes/jobs.js`

Job list and job application logic.

### `server/src/routes/coins.js`

Coin history and purchase flow.

### `server/src/routes/stats.js`

Platform statistics exposed to the frontend.

---

## 5.10 Realtime Module

### `server/src/realtime/signaling.js`

This module powers volunteer live interview signaling.

Responsibilities:

- room joins
- offer/answer exchange
- ICE candidate forwarding
- peer leave signaling

This module does not do the actual media processing. It only helps WebRTC peers discover and connect to each other.

---

## 5.11 Data Model Module

### `server/src/models/`

This folder defines the database schema layer.

Key models:

- `User.js`: platform user profile, role, coins, stats
- `Interview.js`: AI interview session history and feedback
- `Volunteer.js`: volunteer public profile and approval state
- `Booking.js`: volunteer session booking data
- `CoinTransaction.js`: earned/spent coin records

These models are the foundation of persistence in the backend.

---

## 6. Feature Explanation By Product Module

## 6.1 AI Interview

Business purpose:

- help candidates practice interviews with automated feedback

Frontend modules:

- `AIInterview.jsx`
- `api.js`

Backend modules:

- `routes/interview.js`
- `services/aiService.js`
- `models/Interview.js`
- `models/User.js`
- `models/CoinTransaction.js`

Flow:

1. User chooses type, difficulty, and target role.
2. Frontend calls `/api/interview/start`.
3. Backend generates or falls back to interview questions.
4. Each submitted answer goes to `/api/interview/:id/answer`.
5. Backend stores feedback and score.
6. Completion goes to `/api/interview/:id/complete`.
7. Coins and stats are updated.

---

## 6.2 Volunteer Interviews

Business purpose:

- let candidates connect with real people for mock interviews

Frontend modules:

- `VolunteerInterview.jsx`
- `VolunteerRegistrationForm.jsx`
- `VolunteerBookingModal.jsx`
- `VolunteerLiveInterview.jsx`
- `RatingModal.jsx`

Backend modules:

- `routes/volunteer.js`
- `realtime/signaling.js`
- `models/Volunteer.js`
- `models/Booking.js`
- `models/User.js`
- `models/CoinTransaction.js`

Flow:

1. Volunteers register or update their profiles.
2. Candidates browse approved volunteers.
3. Candidate books a session or starts a live room.
4. Coins are deducted on booking.
5. Meeting room uses WebRTC + Socket.IO signaling.
6. Candidate can rate the volunteer after the session.

---

## 6.3 Job Portal

Business purpose:

- connect interview-ready candidates with available jobs

Frontend modules:

- `JobPortal.jsx`

Backend modules:

- `routes/jobs.js`

Flow:

1. User searches and filters jobs.
2. Frontend requests job list.
3. User opens details and may apply through the app flow.

---

## 6.4 Dashboard

Business purpose:

- show candidate progress, session history, and account state

Frontend modules:

- `UserDashboard.jsx`

Backend modules:

- `routes/users.js`
- `routes/interview.js`
- `routes/coins.js`

Flow:

1. Dashboard loads current user.
2. It loads completed interview sessions and coin history.
3. UI summarizes overall progress.

---

## 6.5 Coin Store

Business purpose:

- support gamification and premium feature purchasing

Frontend modules:

- `CoinStore.jsx`

Backend modules:

- `routes/coins.js`
- `models/CoinTransaction.js`
- `models/User.js`

Flow:

1. User sees coin balance and available items.
2. Purchase request is sent to backend.
3. Balance and transaction history are updated.

---

## 6.6 Admin

Business purpose:

- give platform owners a moderation and reporting interface

Frontend modules:

- `AdminPanel.jsx`

Backend modules:

- `routes/admin.js`
- `middleware/requireAdmin.js`

Flow:

1. Admin page checks authenticated role.
2. Frontend requests overview and management datasets.
3. Admin reviews volunteers, users, and transactions.

---

## 7. State Management Explanation

The project uses lightweight React state instead of Redux or Zustand.

Main state patterns:

- app-level page and coin state in `App.jsx`
- auth state in `AuthContext`
- feature-local state inside each page component
- backend as source of truth for persisted data

This keeps the app simple enough for the current scope while still supporting multiple modules.

---

## 8. Routing Explanation

The project does not use React Router.

Instead, `App.jsx` maps:

- page keys -> URL paths
- URL paths -> page keys

Browser navigation is handled through:

- `window.history.pushState`
- `popstate` listener

This is a custom lightweight routing approach.

---

## 9. Authentication And Authorization Explanation

Authentication flow:

1. User signs in with Google using Firebase Auth.
2. Frontend gets the Firebase ID token.
3. Token is attached to API requests by `api.js`.
4. Backend middleware validates the token and resolves the app user.

Authorization flow:

- signed-in checks protect AI Interview, Dashboard, Coins
- role-based checks protect Admin
- volunteer registration and booking use authenticated user identity

---

## 10. AI Integration Explanation

Current provider:

- NVIDIA OpenAI-compatible API

Model:

- `qwen/qwen3.5-122b-a10b`

Why the AI layer matters:

- generates questions
- evaluates answers
- keeps the interview experience dynamic

Resilience design:

- timeout guards
- fallback question generation
- fallback answer scoring

This is important because external AI providers can fail, rate limit, or timeout.

---

## 11. Realtime And Meeting Explanation

Volunteer meetings rely on:

- browser WebRTC APIs for audio/video
- Socket.IO signaling for room coordination

Why signaling exists:

- browsers need a signaling path to exchange offers, answers, and ICE candidates before the media channel is created

Current behavior:

- meeting room can create or join by room ID
- second browser can still join in audio/viewer mode if camera access is unavailable
- meeting UI is rendered on a dedicated `/volunteer/meeting` page

---

## 12. Current Strengths Of The Codebase

- clear split between frontend and backend
- modular page-based frontend structure
- isolated API wrapper layer
- isolated AI service layer
- Mongo-backed persistence
- real-time volunteer meeting support
- admin surface for moderation
- fallback logic for unstable AI responses

---

## 13. Current Complexity And Risk Areas

These are the modules that are the most complex or sensitive:

- `VolunteerLiveInterview.jsx`: WebRTC, device permissions, signaling, layout
- `AIInterview.jsx` + `routes/interview.js`: async state, timeouts, fallback behavior
- `AuthContext.jsx` + backend auth middleware: token-driven access control
- `VolunteerInterview.jsx`: multiple concerns in one page

These are good candidates for future cleanup if the codebase continues to grow.

---

## 14. Suggested Future Refactor Directions

If the project is expanded further, the best refactor directions would be:

- move from custom routing to React Router
- split `VolunteerInterview.jsx` into smaller submodules
- create a dedicated design token system for consistent UI
- add formal validation schemas on frontend and backend
- add automated tests for AI interview flow and volunteer booking flow
- move more shared types or response contracts into a common layer

---

## 15. Quick File Map For New Developers

If someone is onboarding quickly, these are the most important files to read first:

### Frontend

1. [src/App.jsx](C:\Users\SAGAR%20KUMAR%20GAUTAM\Downloads\New%20folder\MockMate-main\MockMate-main\src\App.jsx)
2. [src/contexts/AuthContext.jsx](C:\Users\SAGAR%20KUMAR%20GAUTAM\Downloads\New%20folder\MockMate-main\MockMate-main\src\contexts\AuthContext.jsx)
3. [src/services/api.js](C:\Users\SAGAR%20KUMAR%20GAUTAM\Downloads\New%20folder\MockMate-main\MockMate-main\src\services\api.js)
4. [src/components/AIInterview.jsx](C:\Users\SAGAR%20KUMAR%20GAUTAM\Downloads\New%20folder\MockMate-main\MockMate-main\src\components\AIInterview.jsx)
5. [src/components/VolunteerInterview.jsx](C:\Users\SAGAR%20KUMAR%20GAUTAM\Downloads\New%20folder\MockMate-main\MockMate-main\src\components\VolunteerInterview.jsx)
6. [src/components/VolunteerLiveInterview.jsx](C:\Users\SAGAR%20KUMAR%20GAUTAM\Downloads\New%20folder\MockMate-main\MockMate-main\src\components\VolunteerLiveInterview.jsx)

### Backend

1. [server/server.js](C:\Users\SAGAR%20KUMAR%20GAUTAM\Downloads\New%20folder\MockMate-main\MockMate-main\server\server.js)
2. [server/src/app.js](C:\Users\SAGAR%20KUMAR%20GAUTAM\Downloads\New%20folder\MockMate-main\MockMate-main\server\src\app.js)
3. [server/src/routes/interview.js](C:\Users\SAGAR%20KUMAR%20GAUTAM\Downloads\New%20folder\MockMate-main\MockMate-main\server\src\routes\interview.js)
4. [server/src/routes/volunteer.js](C:\Users\SAGAR%20KUMAR%20GAUTAM\Downloads\New%20folder\MockMate-main\MockMate-main\server\src\routes\volunteer.js)
5. [server/src/services/aiService.js](C:\Users\SAGAR%20KUMAR%20GAUTAM\Downloads\New%20folder\MockMate-main\MockMate-main\server\src\services\aiService.js)
6. [server/src/realtime/signaling.js](C:\Users\SAGAR%20KUMAR%20GAUTAM\Downloads\New%20folder\MockMate-main\MockMate-main\server\src\realtime\signaling.js)

---

## 16. Final Project Explanation In One Paragraph

MockMate is a modular full-stack mock interview platform where the React frontend handles navigation, UI, auth-aware access, and user workflows, while the Express backend handles persistence, business rules, AI-powered interview generation/evaluation, volunteer bookings, coins, admin moderation, and WebRTC meeting signaling. The project is organized around product modules rather than generic pages, which makes it easy to understand in terms of actual user journeys: practice with AI, connect with volunteers, browse jobs, track progress, and manage the platform.
