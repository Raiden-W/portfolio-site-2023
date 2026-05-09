# CODEX_CONTEXT

## Workspace

- Parent workspace: `E:\2023\portfolio_site`
- Frontend original repo: `E:\2023\portfolio_site\portfolio_site_frontend`
- Frontend Codex worktree: `E:\2023\portfolio_site\portfolio_site_frontend_codex`
- Backend Codex worktree: `E:\2023\portfolio_site\portfolio_site_backend_codex`
- Frontend branch: `codex/tencent-cloud-migration`
- Base commit when worktree was created: `6dc45ed fixed safari os video probs`
- Original frontend repo had unrelated uncommitted changes before this work:
  `.eslintrc.cjs`, `src/components/Opening.jsx`, `src/components/Work.jsx`.
- The worktree has an ignored `node_modules` junction pointing to the original
  frontend repo's installed dependencies.

## Frontend Shape

- Vite 4, React 18, Sass.
- Three.js / React Three Fiber / Drei / postprocessing for the main scene.
- XState coordinates global interaction state.
- GSAP handles animation.
- Strapi REST API is the CMS backend.
- Important files:
  - `src/utils/serviceHooks.js`: API and media URL helpers.
  - `src/App.jsx`: app shell and lazy-loaded canvas.
  - `src/experiences/ExperienceCanvas.jsx`: lazy R3F canvas entry.
  - `src/components/LoadingPage.jsx`: visible content-server error state.
  - `vite.config.js`: chunk splitting.

## Implemented Frontend Changes

- Added `.env.example`.
- API base URL is driven by `VITE_BASE_API_URL`.
- Local frontend env should use:
  `VITE_BASE_API_URL=http://localhost:1337`
- Production frontend build now uses:
  `VITE_BASE_API_URL=https://api.rydeenwang.com`
- `getMediaUrl(url)` supports:
  - Strapi relative media paths such as `/uploads/...`
  - absolute COS URLs
  - protocol-relative URLs
  - protocol-less external COS-style URLs during migration
- API hooks now use centralized URL construction, `res.ok` checks,
  `AbortController`, and defensive handling for temporarily empty media
  relations.
- Loading screen now shows an explicit backend/content-server error instead of
  waiting forever.
- R3F canvas moved to `src/experiences/ExperienceCanvas.jsx` and lazy-loaded
  from `src/App.jsx`.
- Vite manual chunks split:
  `react-vendor`, `three-vendor`, `ui-vendor`, plus app chunks.
- Link security lint fixes added `rel="noreferrer"` for external blank links.
- `.eslintrc.cjs` was relaxed for this existing React/R3F codebase.
- `package.json` dev server now uses port `3000` because this Windows machine
  reserves the Vite default `5173` range.

## Production Deployment

- Public site:
  `https://rydeenwang.com`
- `www` alias:
  `https://www.rydeenwang.com`
- API/Admin:
  `https://api.rydeenwang.com`
- DNS/CDN:
  Cloudflare free plan, orange-cloud proxy enabled for `@`, `www`, and `api`.
- Cloudflare SSL/TLS:
  `Full (strict)`.
- Cloudflare settings enabled by user:
  Always Use HTTPS, HTTP/2, HTTP/3.
- Frontend static files are served by Nginx from:
  `/var/www/portfolio-frontend/current`
- Backend deploy script builds frontend in a temporary Docker `node:20` container
  and syncs only `dist/` to the Nginx root.
- Deployment helper script:
  `E:\2023\portfolio_site\deploy-tencent-visible.ps1`

## Verification Notes

- Production Vite build passed during server deployment.
- Non-blocking Vite warnings remain:
  third-party `eval` warnings and a large `three-vendor` chunk.
- Strapi Admin initially loaded slowly over the raw server IP because the admin
  JS bundle was large and the direct cross-border route was poor.
- Nginx gzip was enabled to improve JS transfer size.
- `src/admin/app.js` in the backend was simplified to remove custom locales,
  reducing Strapi Admin bundle weight.

## Current Follow-Up

- Backend content was transferred successfully from local Strapi to production
  via SSH tunnel with `strapi transfer --exclude files`.
- Next frontend task is to verify production API responses and then test
  `https://rydeenwang.com` end to end.
