# Portfolio site frontend

Vite + React frontend for the portfolio site. Content is loaded from a
separate Strapi project through `VITE_BASE_API_URL`.

## Local development

1. Copy `.env.example` to `.env.local`.
2. Set `VITE_BASE_API_URL` to the local Strapi server, for example
   `http://localhost:1337` or a LAN address such as `http://192.168.0.100:1337`.
3. Start Strapi first, then run the frontend dev server.

The frontend checks `/api/test` before it opens the interactive scene. If Strapi
is unavailable, the loading page shows a clear content-server error instead of
waiting forever.

## Tencent Cloud deployment shape

Recommended server layout for a Tencent Cloud Hong Kong or Korea CVM/Lighthouse
instance:

- Nginx serves the built frontend from `/var/www/portfolio-frontend/current`.
- A future Strapi service runs on the same server, preferably through Docker
  Compose.
- Nginx proxies `https://api.example.com` to Strapi, while
  `https://example.com` serves this frontend.

Build the frontend with the production API URL:

```powershell
$env:VITE_BASE_API_URL = "https://api.example.com"
node node_modules\vite\bin\vite.js build
```

Example Nginx server block for the frontend:

```nginx
server {
    listen 80;
    server_name example.com www.example.com;

    root /var/www/portfolio-frontend/current;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location ~* \.(js|css|png|jpg|jpeg|gif|svg|webp|woff2?|ttf|glb)$ {
        expires 30d;
        add_header Cache-Control "public, immutable";
        try_files $uri =404;
    }
}
```

Temporary database/content testing stays on local Strapi until the backend
project is migrated. Do not point production builds to a missing backend; deploy
the static frontend only after the production API host is available or accept
that the page will show the content-server error state.
