# 🚀 Step-by-Step Production Deployment

## Step 1: MongoDB Atlas ახალი Database (3 წუთი)

რადგან MongoDB Atlas უკვე გაქვს, მარტივად შექმნი ახალ database-ს:

### 1.1 ახალი Database შექმნა

1. MongoDB Atlas Dashboard → **Browse Collections**
2. **Create Database** ღილაკზე დაჭერა
3. **Database name**: `korter_production`
4. **Collection name**: `properties`
5. **Create**

### 1.2 Connection String კოპირება

1. **Database** → **Connect** → **Drivers**
2. კოპირება connection string-ი
3. შეინახე ეს - მოგვიანებით დაგვჭირდება

---

## Step 2: Cloudinary Account (2 წუთი)

### 2.1 რეგისტრაცია

1. გადადი: https://cloudinary.com/
2. **Sign Up Free**
3. რეგისტრაცია Google-ით ან Email-ით

### 2.2 Dashboard მონაცემები

რეგისტრაციის შემდეგ Dashboard-ზე ნახავ:

- **Cloud Name**: `dxxxxxx` (კოპირება)
- **API Key**: `123456789012345` (კოპირება)
- **API Secret**: `xxxxx-xxxxxx_xxxxx` (Show-ზე დაჭერით → კოპირება)

შეინახე ეს სამივე - მოგვიანებით დაგვჭირდება!

---

## Step 3: Google Maps API (3 წუთი)

### 3.1 Google Cloud Console

1. გადადი: https://console.cloud.google.com/
2. თუ არ არის project: **New Project** → სახელი: `Korter-Maps`
3. თუ არის project: არსებული project-ის გამოყენება

### 3.2 APIs ჩართვა

1. **APIs & Services** → **Library**
2. ძებნა და ჩართვა (Enable):
   - **Maps JavaScript API**
   - **Places API**
   - **Geocoding API**

### 3.3 API Key

1. **APIs & Services** → **Credentials**
2. **Create Credentials** → **API Key**
3. **Copy** API Key (შეინახე!)

---

## Step 4: Vercel Account (1 წუთი)

### 4.1 რეგისტრაცია

1. გადადი: https://vercel.com/
2. **Sign Up** → **Continue with GitHub**
3. GitHub authorization → **Authorize Vercel**

---

## Step 5: Backend Deployment (Vercel)

### 5.1 Repository Import

1. Vercel Dashboard → **Add New** → **Project**
2. **Import Git Repository** → შენი `korter-clone`
3. **Import** ღილაკზე დაჭერა

### 5.2 Backend Configuration

1. **Root Directory**: `server` → **Continue**
2. **Framework Preset**: **Other**
3. **Build Command**: დატოვე ცარიელი
4. **Output Directory**: დატოვე ცარიელი
5. **Install Command**: `npm install`

### 5.3 Environment Variables

**Environment Variables** → **Add** და შეყვანა:

**Name**: `NODE_ENV` **Value**: `production`
**Name**: `JWT_SECRET` **Value**: `super_secure_random_string_64_characters_long_12345678901234567890`
**Name**: `MONGODB_URI` **Value**: `[შენი MongoDB connection string]`
**Name**: `CORS_ORIGIN` **Value**: `*` (ჯერჯერობით)
**Name**: `CLOUDINARY_CLOUD_NAME` **Value**: `[შენი cloud name]`
**Name**: `CLOUDINARY_API_KEY` **Value**: `[შენი api key]`
**Name**: `CLOUDINARY_API_SECRET` **Value**: `[შენი api secret]`

### 5.4 Deploy

1. **Deploy** ღილაკზე დაჭერა
2. დალოდება... (1-2 წუთი)
3. **Success!** → URL კოპირება (მაგ: `https://korter-backend-xxx.vercel.app`)

---

## Step 6: Backend კოდის მოდიფიკაცია Vercel-ისთვის

### 6.1 Vercel Config ფაილი

პროექტში შექმენი: **server/vercel.json**

```json
{
  "version": 2,
  "builds": [
    {
      "src": "./index.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/"
    }
  ]
}
```

### 6.2 Cloudinary Packages

Terminal-ში:

```bash
cd server
npm install cloudinary multer-storage-cloudinary
```

### 6.3 Push Changes

```bash
git add .
git commit -m "Added Vercel config"
git push origin main
```

Vercel ავტომატურად redeploy-ს გააკეთებს!

---

## Step 7: Frontend Deployment

### 7.1 ახალი Project

1. Vercel Dashboard → **Add New** → **Project**
2. იგივე repository → **Import**

### 7.2 Frontend Configuration

1. **Root Directory**: `client` → **Continue**
2. **Framework Preset**: **Create React App**
3. **Build Command**: `npm run build`
4. **Output Directory**: `build`

### 7.3 Environment Variables

**Name**: `REACT_APP_API_URL` **Value**: `[შენი backend URL]`
**Name**: `REACT_APP_GOOGLE_MAPS_API_KEY` **Value**: `[შენი Google Maps API key]`

### 7.4 Deploy

**Deploy** → დალოდება → **Success!**

---

## Step 8: Testing

### 8.1 URLs შემოწმება

- **Frontend**: https://korter-frontend-xxx.vercel.app
- **Backend API**: https://korter-backend-xxx.vercel.app/api/properties

### 8.2 Functionality ტესტი

1. საიტზე შესვლა
2. რეგისტრაცია
3. Property შექმნა
4. სურათის ატვირთვა

---

## ❗ Common Issues & Quick Fixes

**CORS Error**: Backend Environment Variables → `CORS_ORIGIN` = Frontend URL

**MongoDB Error**: Connection string წყალობა შემოწმება

**Images არ ტვირთება**: Cloudinary credentials შემოწმება

---

## ✅ ყველაფერი მზადაა!

**შემდეგი ნაბიჯები:**

1. საკუთარი დომენის მიმაგრება
2. Production testing
3. SEO ოპტიმიზაცია

**ხარჯები თვეში**: $0 (Free tiers საკმარისია startup-ისთვის)
