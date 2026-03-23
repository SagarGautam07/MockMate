# MockMate Backend

Express.js + MongoDB backend for the MockMate AI interview platform.

## Quick Start

### 1. Install dependencies
cd server && npm install

### 2. Set up environment variables
cp .env.example .env
# Edit .env with your actual values (see comments in .env.example)

### 3. Required external services (all free tier)
- MongoDB Atlas: https://cloud.mongodb.com (free 512MB cluster)
- Firebase Console: https://console.firebase.google.com (already set up for frontend)
- NVIDIA API: https://build.nvidia.com (OpenAI-compatible endpoint for Qwen models)
- Adzuna Jobs API: https://developer.adzuna.com (250 free req/day — OPTIONAL)

### 4. Firebase Admin SDK setup
1. Go to Firebase Console > Project Settings > Service Accounts
2. Click "Generate new private key" — downloads a JSON file
3. Copy projectId, privateKey, and clientEmail into your .env

### 5. Run the backend
npm run dev    # Development with nodemon (auto-restart)
npm start      # Production

### 6. Test the API
curl ${API_URL}/api/health
# Should return: {"status":"ok","timestamp":"..."}

## API Routes

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | /api/auth/verify | ✅ | Verify Firebase token, get/create user |
| GET | /api/users/me | ✅ | Get current user profile + stats |
| PATCH | /api/users/me | ✅ | Update profile |
| POST | /api/interview/start | ✅ | Start AI interview session |
| POST | /api/interview/:id/answer | ✅ | Submit + evaluate answer |
| POST | /api/interview/:id/complete | ✅ | Finalize session + earn coins |
| GET | /api/interview/history | ✅ | Get past sessions |
| GET | /api/jobs | ❌ | Get job listings |
| GET | /api/volunteer/list | ❌ | Get approved volunteers |
| POST | /api/volunteer/register | ✅ | Submit volunteer application |
| POST | /api/volunteer/book | ✅ | Book a session |
| POST | /api/volunteer/session/:id/rate | ✅ | Rate after session |
| GET | /api/stats/platform | ❌ | Platform-wide statistics |
| GET | /api/coins/history | ✅ | Coin transaction history |

✅ = Requires Firebase ID token in Authorization: Bearer <token> header
❌ = Public (no auth required)
