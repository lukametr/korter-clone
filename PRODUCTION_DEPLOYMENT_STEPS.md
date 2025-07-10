# Real Estate Project Production Deployment Guide (ქართულად)

## 1. სერვერის მომზადება (VPS/Linux)

### A. Ubuntu 20.04+ სერვერზე:

```bash
# Node.js 18+ დაყენება
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# PM2 დაყენება
sudo npm install -g pm2

# MongoDB (თუ ლოკალურად გინდა)
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org

# Nginx დაყენება
sudo apt install nginx
```

## 2. MongoDB Atlas კონფიგურაცია (რეკომენდებული)

### A. MongoDB Atlas-ზე:

1. mongodb.com/atlas-ზე რეგისტრაცია
2. ახალი Cluster შექმნა (Free Tier M0)
3. Database User შექმნა
4. Network Access-ში IP Whitelist (0.0.0.0/0 development-ისთვის)
5. Connection String კოპირება

### B. Connection String მაგალითი:

```
mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/korter_production?retryWrites=true&w=majority
```

## 3. Cloudinary კონფიგურაცია (სურათებისთვის)

### A. Cloudinary.com-ზე:

1. რეგისტრაცია
2. Dashboard-იდან ღებულობ:
   - Cloud Name
   - API Key
   - API Secret

### B. Backend-ში cloudinary ინტეგრაცია:

```bash
cd server
npm install cloudinary multer-storage-cloudinary
```

## 4. Google Maps API

### A. Google Cloud Console:

1. console.cloud.google.com-ზე პროექტი შექმნა
2. APIs & Services > Library
3. ჩართე: Maps JavaScript API, Places API, Geocoding API
4. Credentials > API Key შექმნა
5. API Key-ს შეზღუდვები (domain restrictions)

## 5. Environment Variables

### A. Backend (.env):

```bash
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/korter_production
JWT_SECRET=super_secure_random_64_character_string_here_12345678901234567890
CORS_ORIGIN=https://korter.ge,https://www.korter.ge
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

### B. Frontend (.env):

```bash
REACT_APP_API_URL=https://api.korter.ge
REACT_APP_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

## 6. Backend Deploy

### A. სერვერზე კოდის ატვირთვა:

```bash
# Git clone ან FTP/SCP
git clone https://github.com/yourusername/korter-clone.git
cd korter-clone/server

# Dependencies დაყენება
npm install --production

# .env ფაილი შექმნა production მნიშვნელობებით
nano .env

# PM2-ით გაშვება
pm2 start index.js --name "korter-api"
pm2 startup
pm2 save
```

### B. PM2 ecosystem.config.js:

```javascript
module.exports = {
  apps: [
    {
      name: "korter-api",
      script: "index.js",
      instances: 2,
      exec_mode: "cluster",
      env_production: {
        NODE_ENV: "production",
        PORT: 5000,
      },
    },
  ],
};
```

## 7. Nginx კონფიგურაცია

### A. /etc/nginx/sites-available/korter-api:

```nginx
server {
    listen 80;
    server_name api.korter.ge;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl;
    server_name api.korter.ge;

    ssl_certificate /etc/letsencrypt/live/api.korter.ge/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.korter.ge/privkey.pem;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### B. SSL Let's Encrypt:

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d api.korter.ge
```

## 8. Frontend Deploy (2 ვარიანტი)

### A. Netlify (მარტივი):

1. Build პროექტი ლოკალურად: `npm run build`
2. build ფოლდერი Netlify-ზე გადაიტანე
3. Environment Variables დაამატე Netlify Settings-ში

### B. VPS-ზე Nginx-ით:

```bash
cd korter-clone/client
npm install
npm run build

# Build ფოლდერი Nginx directory-ში
sudo cp -r build/* /var/www/korter.ge/
```

### Frontend Nginx config (/etc/nginx/sites-available/korter-frontend):

```nginx
server {
    listen 80;
    server_name korter.ge www.korter.ge;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl;
    server_name korter.ge www.korter.ge;

    ssl_certificate /etc/letsencrypt/live/korter.ge/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/korter.ge/privkey.pem;

    root /var/www/korter.ge;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /static/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

## 9. კოდის განახლება Cloudinary-სთვის

### A. server/routes/upload.js-ში cloudinary:

```javascript
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "korter-properties",
    allowed_formats: ["jpg", "jpeg", "png"],
  },
});
```

### B. Frontend-ში Google Maps ინტეგრაცია:

```bash
cd client
npm install @react-google-maps/api
```

## 10. Final Checklist

### ✅ სერვერი:

- [ ] Node.js 18+ დაყენებული
- [ ] MongoDB Atlas კონფიგურირებული
- [ ] Cloudinary კონფიგურირებული
- [ ] Google Maps API აღებული
- [ ] Backend PM2-ით გაშვებული
- [ ] Nginx კონფიგურირებული
- [ ] SSL სერტიფიკატი გაკეთებული

### ✅ დომენები:

- [ ] korter.ge - frontend
- [ ] api.korter.ge - backend

### ✅ Environment Variables:

- [ ] Backend .env კონფიგურირებული
- [ ] Frontend .env კონფიგურირებული (build-მდე)

### ✅ ტესტირება:

- [ ] API endpoints მუშაობს (api.korter.ge/api/properties)
- [ ] Frontend ტვირთავს (korter.ge)
- [ ] სურათების upload მუშაობს
- [ ] Google Maps ჩანს
- [ ] მომხმარებლის რეგისტრაცია/შესვლა მუშაობს

## 11. აქტივაციის შემდეგ

### A. Monitoring:

```bash
pm2 monit  # PM2 processes monitor
pm2 logs   # ლოგების ნახვა
```

### B. Backup:

- MongoDB Atlas automatic backup
- კოდის რეპოზიტორია GitHub-ზე

### C. Updates:

```bash
# კოდის განახლება
git pull origin main
npm install
pm2 restart korter-api
```

## 12. ხარჯები (მაგალითი თვეში)

- **VPS (2GB RAM)**: $5-10/თვე
- **დომენი**: $10-15/წელი
- **MongoDB Atlas (Free Tier)**: $0 (512MB მდე)
- **Cloudinary (Free Tier)**: $0 (10GB მდე)
- **Google Maps API**: $0 (თვეში 28,000 requests მდე)

**სულ დაახლოებით**: $10-15/თვე initial stage-ზე

---

**შენიშვნა**: ეს არის ზოგადი გაიდი. კონკრეტული სერვერის/პროვაიდერის მიხედვით შეიძლება ცოტა განსხვავება იყოს.
