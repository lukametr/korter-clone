# 📷 Cloudinary Image Upload Setup

## 🎯 რა მოვაგვარე

**პრობლემა**: სურათების ატვირთვა იყო კონფიგურირებული local file system-ისთვის, რაც Vercel-ზე არ მუშაობს (serverless environment).

**გამოსავალი**: Cloudinary (cloud-based image storage) კონფიგურაცია.

## 🔧 რა შევცვალე

### 1. Upload Route გადაკეთება (`server/routes/upload.js`)

**BEFORE** (Local Storage):

```javascript
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir); // Local uploads folder
  },
  // ...
});
```

**AFTER** (Cloudinary):

```javascript
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "korter-properties",
    format: async (req, file) => "jpg", // Auto format
    public_id: (req, file) => `property-${Date.now()}-${Math.random()}`,
  },
});
```

### 2. Environment Variables დამატება

დამატებული `.env.example`-ში:

```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

## 🚀 Setup ინსტრუქციები

### Step 1: Cloudinary Account

1. შედით **cloudinary.com**-ზე
2. Sign Up / Log In თქვენი account-ით
3. Dashboard-ზე ნახეთ:
   - **Cloud Name**
   - **API Key**
   - **API Secret**

### Step 2: Environment Variables

**Local Development** (`server/.env`):

```env
CLOUDINARY_CLOUD_NAME=your_actual_cloud_name
CLOUDINARY_API_KEY=your_actual_api_key
CLOUDINARY_API_SECRET=your_actual_api_secret
```

**Production** (Vercel Environment Variables):

```env
CLOUDINARY_CLOUD_NAME=your_actual_cloud_name
CLOUDINARY_API_KEY=your_actual_api_key
CLOUDINARY_API_SECRET=your_actual_api_secret
```

### Step 3: Test Locally

1. **Create `.env` file** in `server/` folder with your Cloudinary credentials
2. **Restart server**: `npm start` in server folder
3. **Test upload**: Try uploading image from Profile page

### Step 4: Deploy to Production

1. **Set Environment Variables** in Vercel dashboard
2. **Redeploy backend**
3. **Test on production site**

## 📋 შედეგი

✅ **სურათები ინახება Cloudinary-ზე** (cloud storage)  
✅ **Vercel-compatible** (serverless ready)  
✅ **უფასო 25GB** თვეში Cloudinary free plan-ით  
✅ **ავტომატური optimization** და format conversion  
✅ **CDN delivery** მსოფლიო მასშტაბით

## 🧪 Testing

Upload-ის შემდეგ სურათის URL ასე გამოიყურება:

```
https://res.cloudinary.com/your_cloud_name/image/upload/v1234567890/korter-properties/property-1234567890-987654321.jpg
```

---

_Setup: $(Get-Date -Format "yyyy-MM-dd HH:mm")_
