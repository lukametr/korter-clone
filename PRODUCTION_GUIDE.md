# Production Environment Setup

## Environment Variables (Backend)

```
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/korter-production
JWT_SECRET=super_secure_random_string_in_production
CORS_ORIGIN=https://yoursite.ge
GOOGLE_MAPS_API_KEY=your_google_maps_key
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

## Environment Variables (Frontend)

```
REACT_APP_API_URL=https://api.yoursite.ge
REACT_APP_GOOGLE_MAPS_API_KEY=your_google_maps_key
```

## Google Maps Integration Example

```typescript
// src/components/GoogleMap.tsx
import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";

const PropertyMap = ({ lat, lng, onLocationSelect }) => {
  return (
    <LoadScript googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY}>
      <GoogleMap
        mapContainerStyle={{ width: "100%", height: "400px" }}
        center={{ lat, lng }}
        zoom={13}
        onClick={(e) => onLocationSelect(e.latLng.lat(), e.latLng.lng())}
      >
        <Marker position={{ lat, lng }} />
      </GoogleMap>
    </LoadScript>
  );
};
```

## Production PM2 Config

```javascript
// ecosystem.config.js
module.exports = {
  apps: [
    {
      name: "korter-api",
      script: "index.js",
      instances: 2,
      exec_mode: "cluster",
      env: {
        NODE_ENV: "development",
      },
      env_production: {
        NODE_ENV: "production",
        PORT: 5000,
      },
    },
  ],
};
```

## Nginx Configuration

```nginx
server {
    listen 80;
    server_name api.yoursite.ge;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl;
    server_name api.yoursite.ge;

    ssl_certificate /path/to/certificate.crt;
    ssl_certificate_key /path/to/private.key;

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
