# Local Development Setup

## The Issue

Your frontend was trying to connect to the deployed backend at `https://insightx-bkend.onrender.com/api`, but you're running the backend locally at `http://localhost:8000/api`.

## The Fix

The frontend now uses an environment variable to determine which backend to connect to.

## Configuration

### `.env.local` File

```env
# Backend API URL
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

### For Local Development (Current Setup)
```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

### For Production/Deployed Backend
```env
NEXT_PUBLIC_API_URL=https://insightx-bkend.onrender.com/api
```

## How to Use

### 1. Start Backend Locally

```bash
cd backend
uvicorn main:app --reload
```

Backend runs at: `http://localhost:8000`

### 2. Start Frontend

```bash
cd insightx-app
npm run dev
```

Frontend runs at: `http://localhost:3000`

### 3. Test Upload

1. Go to `http://localhost:3000/connect`
2. Upload a CSV file
3. It should now connect to your local backend

## Troubleshooting

### Issue: "Failed to upload file"

**Check:**
1. Is backend running? Visit `http://localhost:8000/health`
2. Check `.env.local` has `NEXT_PUBLIC_API_URL=http://localhost:8000/api`
3. Restart frontend after changing `.env.local`

### Issue: CORS Error

If you see CORS errors in the browser console, the backend's CORS settings need to allow `http://localhost:3000`.

Check `backend/main.py`:
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # This allows all origins
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### Issue: Connection Refused

**Check:**
1. Backend is running: `http://localhost:8000/health` should return JSON
2. Port 8000 is not blocked by firewall
3. No other service is using port 8000

## Switching Between Local and Deployed

### Use Local Backend
```bash
# Edit .env.local
NEXT_PUBLIC_API_URL=http://localhost:8000/api

# Restart frontend
npm run dev
```

### Use Deployed Backend
```bash
# Edit .env.local
NEXT_PUBLIC_API_URL=https://insightx-bkend.onrender.com/api

# Restart frontend
npm run dev
```

## Verification

### Check Current API URL

Open browser console and run:
```javascript
console.log(process.env.NEXT_PUBLIC_API_URL)
```

Or check the Network tab in DevTools - you should see requests going to `http://localhost:8000/api/upload`

### Test Backend Health

```bash
# Local
curl http://localhost:8000/health

# Deployed
curl https://insightx-bkend.onrender.com/health
```

Both should return:
```json
{
  "status": "healthy",
  "database": "connected",
  "storage": "connected"
}
```

## Complete Local Development Flow

```bash
# Terminal 1 - Backend
cd backend
uvicorn main:app --reload

# Terminal 2 - Frontend
cd insightx-app
npm run dev

# Browser
# Open http://localhost:3000/connect
# Upload CSV
# Watch Network tab - should see http://localhost:8000/api/upload
```

## Environment Variables Summary

| Variable | Purpose | Local Value | Production Value |
|----------|---------|-------------|------------------|
| `NEXT_PUBLIC_API_URL` | Backend API endpoint | `http://localhost:8000/api` | `https://insightx-bkend.onrender.com/api` |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | Same for both | Same for both |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key | Same for both | Same for both |

## Important Notes

1. **Restart Required**: After changing `.env.local`, you MUST restart the Next.js dev server
2. **NEXT_PUBLIC_ Prefix**: Required for environment variables to be available in the browser
3. **Default Fallback**: If `NEXT_PUBLIC_API_URL` is not set, it defaults to `http://localhost:8000/api`

---

**Current Setup**: Frontend configured for local backend at `http://localhost:8000/api`
**Next**: Start both backend and frontend, then test upload
