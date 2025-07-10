# 🚨 PRODUCTION 500 ERROR - TROUBLESHOOTING GUIDE

## Current Situation

✅ **API URL Duplication FIXED**: Frontend now correctly calls `/api/...` (no more `/api/api/`)  
✅ **Backend Server Running**: `https://www.homeinfo.ge/api/health` returns 200 OK  
❌ **Database Endpoints Failing**: All endpoints that need database return 500 error

## 🔍 Error Analysis

### What's Working

```
✅ https://www.homeinfo.ge/api/health → 200 OK
```

### What's Failing

```
❌ https://www.homeinfo.ge/api/properties → 500 {"message":"სერვერის შეცდომა"}
❌ https://www.homeinfo.ge/api/auth/login → 500
❌ https://www.homeinfo.ge/api/auth/register → 500
```

### Root Cause

**MongoDB Connection Issue** - The backend server can't connect to the database.

## 🛠️ STEP-BY-STEP FIX

### Step 1: Check Debug Endpoints (Added)

Test these URLs to see what's wrong:

```bash
# Check database connection status
curl https://www.homeinfo.ge/api/debug/db

# Check environment variables
curl https://www.homeinfo.ge/api/debug/env
```

### Step 2: MongoDB Atlas Setup (If Missing)

1. **Create Account**: Go to mongodb.com/atlas
2. **Create Cluster**:
   - Choose free tier (M0)
   - Select region closest to your server
3. **Create Database User**:
   - Username: `korter_user`
   - Password: Generate strong password
   - Permissions: `Read and write to any database`
4. **Network Access**:
   - Add IP: `0.0.0.0/0` (allow from anywhere)
   - Or add your production server's IP
5. **Get Connection String**:
   - Connect → Connect your application
   - Copy the MongoDB URI (looks like: `mongodb+srv://korter_user:password@cluster0.xxxxx.mongodb.net/`)

### Step 3: Update Production Environment Variables

Set these in your hosting platform (Vercel/cPanel/etc.):

```env
MONGODB_URI=mongodb+srv://korter_user:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/korter_production
JWT_SECRET=super_secure_random_64_character_string_here_12345678901234567890123
NODE_ENV=production
CORS_ORIGIN=https://www.homeinfo.ge
PORT=5000
```

### Step 4: Redeploy Backend

After setting environment variables, redeploy your backend so it picks up the new settings.

### Step 5: Test Again

```bash
# Should show database connected
curl https://www.homeinfo.ge/api/debug/db

# Should return properties list (empty array if no data)
curl https://www.homeinfo.ge/api/properties
```

## 🔄 Alternative: Use Local MongoDB for Testing

If you want to test without MongoDB Atlas:

1. **Install MongoDB locally**
2. **Start local MongoDB**: `mongod`
3. **Use local connection**:
   ```env
   MONGODB_URI=mongodb://localhost:27017/korter_production
   ```

## 🎯 Expected Results After Fix

```bash
# This should work:
curl https://www.homeinfo.ge/api/properties
# Expected: {"properties": [], "total": 0, "page": 1, "totalPages": 0}

# User registration should work:
curl -X POST https://www.homeinfo.ge/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"firstName":"Test","lastName":"User","email":"test@example.com","password":"password123","role":"user"}'
```

## 📝 Summary

**The main issue is NOT the frontend code** (that's fixed). It's that your production backend can't connect to MongoDB.

**Quick fix**: Set up MongoDB Atlas + update environment variables + redeploy backend.

---

_Last updated: $(Get-Date -Format "yyyy-MM-dd HH:mm")_
