# 🔑 Hackathon API Keys

> ⚠️ **These credentials are shared exclusively for IIT-B Techfest Hackathon judging purposes.**
>
> Please do not share, redistribute, or use these keys outside of evaluation.
>
> Keys will be rotated after the hackathon concludes.

---

## 📋 Quick Copy-Paste Setup

### Frontend Environment (`.env.local`)

Copy and paste this entire block into your `.env.local` file in the project root:

```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:8000/api
NEXT_PUBLIC_BACKEND_URL=https://insightx-bkend.onrender.com

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://xvtqbvavwbowyyoevolo.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh2dHFidmF2d2Jvd3l5b2V2b2xvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEwNzE4NzIsImV4cCI6MjA4NjY0Nzg3Mn0.45NW1ZBLH8Q08kfQteIjlF24G0E0-1pblapR40_toug

# BYTEZ API Keys - Multiple keys for load balancing
BYTEZ_API_KEY_1=21fcde49a931a29607160578c375a6ce
BYTEZ_API_KEY_2=1158b7d57824068956d7163a84e112e3
BYTEZ_API_KEY_3=7eb97a0aefd85a36d6c663f0f82d9c9f
BYTEZ_API_KEY_4=dd7aeb8a6ccca7b8a978f646892ce1bf
BYTEZ_API_KEY_5=74c51b3a8ac8b15b6c6d0ecda1859ba1
BYTEZ_API_KEY_6=976436aed804d1dd3578c22df7e090b2
BYTEZ_API_KEY_7=57a2405dd1f29cd34745ce1c418755e8
BYTEZ_API_KEY_8=f37860147855a578b1c6306a43b37114

# Client Side
NEXT_PUBLIC_BYTEZ_API_KEY_1=21fcde49a931a29607160578c375a6ce
NEXT_PUBLIC_BYTEZ_API_KEY_2=1158b7d57824068956d7163a84e112e3
NEXT_PUBLIC_BYTEZ_API_KEY_3=7eb97a0aefd85a36d6c663f0f82d9c9f
NEXT_PUBLIC_BYTEZ_API_KEY_4=dd7aeb8a6ccca7b8a978f646892ce1bf
NEXT_PUBLIC_BYTEZ_API_KEY_5=74c51b3a8ac8b15b6c6d0ecda1859ba1
NEXT_PUBLIC_BYTEZ_API_KEY_6=976436aed804d1dd3578c22df7e090b2
NEXT_PUBLIC_BYTEZ_API_KEY_7=57a2405dd1f29cd34745ce1c418755e8
NEXT_PUBLIC_BYTEZ_API_KEY_8=f37860147855a578b1c6306a43b37114
```

---

### Backend Environment (`backend/.env`)

Copy and paste this entire block into your `backend/.env` file:

```env
# Supabase Configuration
SUPABASE_URL=https://xvtqbvavwbowyyoevolo.supabase.co
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh2dHFidmF2d2Jvd3l5b2V2b2xvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTA3MTg3MiwiZXhwIjoyMDg2NjQ3ODcyfQ.Cj1_-8_3fD8BgcOkdFLf5yRuUdmfC9-OcAyzMOflguA

# API Configuration
NEXT_PUBLIC_API_URL=https://insightx-bkend.onrender.com

# BYTEZ API Keys (Server-side) - Multiple keys for load balancing
BYTEZ_API_KEY_1=21fcde49a931a29607160578c375a6ce
BYTEZ_API_KEY_2=1158b7d57824068956d7163a84e112e3
BYTEZ_API_KEY_3=7eb97a0aefd85a36d6c663f0f82d9c9f
BYTEZ_API_KEY_4=dd7aeb8a6ccca7b8a978f646892ce1bf
BYTEZ_API_KEY_5=74c51b3a8ac8b15b6c6d0ecda1859ba1
BYTEZ_API_KEY_6=976436aed804d1dd3578c22df7e090b2
BYTEZ_API_KEY_7=57a2405dd1f29cd34745ce1c418755e8
BYTEZ_API_KEY_8=f37860147855a578b1c6306a43b37114

# Client-side API keys (numbered for easy management)
NEXT_PUBLIC_BYTEZ_API_KEY_1=21fcde49a931a29607160578c375a6ce
NEXT_PUBLIC_BYTEZ_API_KEY_2=1158b7d57824068956d7163a84e112e3
NEXT_PUBLIC_BYTEZ_API_KEY_3=7eb97a0aefd85a36d6c663f0f82d9c9f
NEXT_PUBLIC_BYTEZ_API_KEY_4=dd7aeb8a6ccca7b8a978f646892ce1bf
NEXT_PUBLIC_BYTEZ_API_KEY_5=74c51b3a8ac8b15b6c6d0ecda1859ba1
NEXT_PUBLIC_BYTEZ_API_KEY_6=976436aed804d1dd3578c22df7e090b2
NEXT_PUBLIC_BYTEZ_API_KEY_7=57a2405dd1f29cd34745ce1c418755e8
NEXT_PUBLIC_BYTEZ_API_KEY_8=f37860147855a578b1c6306a43b37114
```

---

## 🔐 Key Details

### Supabase

- **Project URL**: https://xvtqbvavwbowyyoevolo.supabase.co
- **Anon Key**: Used by frontend for public operations
- **Service Role Key**: Used by backend for admin operations (keep secret!)
- **Dashboard**: https://supabase.com/dashboard/project/xvtqbvavwbowyyoevolo

### Bytez API

- **8 Client-side keys** for frontend load balancing
- **8 Server-side keys** for backend load balancing
- **Purpose**: Claude Sonnet 4.5 LLM API calls
- **Rate Limiting**: Keys rotate automatically if one hits limits

---

## ✅ Verification

After setting up the keys, verify they work:

**Frontend:**
```bash
npm run dev
# Visit http://localhost:3000
# Check browser console for any auth errors
```

**Backend:**
```bash
cd backend
python main.py
# Should show: "Supabase connected ✓"
# Should show: "Bytez API initialized ✓"
```

---

## ⚠️ Important Notes

1. **Do NOT commit these keys** - They're already in `.gitignore`
2. **Do NOT share publicly** - These are for hackathon judges only
3. **Do NOT use in production** - These are temporary evaluation keys
4. **Keys will be rotated** - After hackathon concludes
5. **Rate limits apply** - Multiple keys help distribute load

---

## 🆘 Troubleshooting

**"Invalid API Key" error:**
- Ensure you copied the entire key (no extra spaces)
- Verify the key is in the correct `.env` file
- Restart the server after updating `.env`

**"Supabase connection failed":**
- Check internet connection
- Verify `SUPABASE_URL` is correct
- Check `SUPABASE_SERVICE_KEY` format

**"Bytez API rate limit exceeded":**
- The system automatically rotates through multiple keys
- If all keys are exhausted, wait 1 minute for rate limit reset

---

**Last Updated**: February 28, 2026  
**Hackathon**: IIT-B Techfest 2026
