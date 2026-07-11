# CODEX_CONTEXT

This file is the current working context for Codex. Treat the sections below as
the source of truth for the active frontend repository. Historical migration
details are kept brief and should not be treated as current workspace state.

## Current Workspace

- Frontend repository: `E:\2023\portfolio_site\portfolio_site_frontend`
- Active branch: `codex/landing-page-integration`
- Registered worktrees: only the active repository above
- Removed legacy worktrees: the old frontend/backend Codex worktrees used for
  `codex/tencent-cloud-migration` no longer exist
- `temp/` is ignored prototype material. The production landing implementation
  now lives under `src/components/landing/`.

The working tree may contain user changes. Preserve unrelated modifications and
inspect overlapping files before editing them.

## Frontend Architecture

- Vite 4, React 18, Sass.
- Three.js, React Three Fiber, Drei, postprocessing, and Cannon drive the 3D
  experience.
- XState in `src/utils/appStateManager.js` coordinates the global interaction
  state and the 2D-to-3D transition.
- GSAP handles scene and UI animation.
- Strapi REST API supplies portfolio content and media.

Important entry points:

- `src/App.jsx`: app shell, font/API readiness gates, lazy canvas loading.
- `src/components/Opening.jsx`: landing-page host and handoff into the existing
  html2canvas/XState/cloth transition.
- `src/components/landing/LandingPage.jsx`: production motion-grid landing page
  and its responsive layout generation.
- `src/components/landing/LandingPage.scss`: landing-only visual system and
  motion styles.
- `src/utils/appStateManager.js`: global state machine and transition actions.
- `src/experiences/ExperienceCanvas.jsx`: lazy React Three Fiber canvas entry.
- `src/experiences/Cloth.jsx`: converts the landing DOM screenshot into a
  `THREE.CanvasTexture`, simulates the cloth grab/fall, and hands off to the
  square/jet scene states.
- `src/components/LoadingPage.jsx`: visible API/content-server error state.
- `src/utils/serviceHooks.js`: API requests and media URL normalization.
- `vite.config.js`: Vite plugins and manual chunk splitting.

## Current Landing Integration

- The old scrolling `Opening` page has been replaced by the motion-grid landing
  page migrated from the ignored `temp/` prototype.
- The production page keeps the responsive grid, fixed generated layout,
  scrolling banner, geometric motion blocks, countdown, world-time block,
  typewriter block, cursor arrow, and `3x3 / handRipple` block.
- The debug/hash-route prototype page was not migrated.
- `Countdown` reaching `0` and clicking/activating `handRipple` both call the
  single `enter3D()` handoff in `Opening.jsx`.
- `enter3D()` is idempotent, computes the cloth grab point, clones the landing
  DOM, captures it with `html2canvas`, and sends the existing state-machine
  events: `mouse down opening`, `mouse up opening`, and `clone finished`.
- The existing `Cloth` flow remains responsible for applying the canvas texture,
  falling, returning to the square, and continuing into the jet scene.
- `Opening` renders only after both the font and the API test are ready. This
  prevents the landing countdown from triggering while the 3D canvas is absent
  behind the loading/error page.
- The state-machine cleanup action removes the landing host defensively so a
  repeated or partially completed transition does not throw on a missing DOM
  node.

## API and Environment

- API base URL is controlled by `VITE_BASE_API_URL`.
- Local development normally uses:

  `VITE_BASE_API_URL=http://localhost:1337`

- Production builds use:

  `VITE_BASE_API_URL=https://api.rydeenwang.com`

- `getMediaUrl(url)` supports Strapi relative paths, absolute COS URLs,
  protocol-relative URLs, and protocol-less external COS-style URLs.
- API hooks use centralized URL construction, response checks, abort handling,
  and defensive handling for temporarily empty media relations.
- The loading page reports a backend/content-server error instead of waiting
  indefinitely.

## Build and Deployment

- Dev server scripts use port `3000`; this machine reserves the Vite default
  `5173` range.
- Vite manual chunks include `react-vendor`, `three-vendor`, `ui-vendor`, and
  application chunks.
- Public site: `https://rydeenwang.com`
- `www` alias: `https://www.rydeenwang.com`
- API/Admin: `https://api.rydeenwang.com`
- Cloudflare proxies the frontend and API hostnames; SSL/TLS mode is
  `Full (strict)` with HTTPS, HTTP/2, and HTTP/3 enabled.
- Nginx serves the built frontend from:
  `/var/www/portfolio-frontend/current`
- The deployment helper is:
  `E:\2023\portfolio_site\deploy-tencent-visible.ps1`
- The deployment path builds in a temporary Docker `node:20` container and
  syncs only `dist/` to the Nginx root.

## Historical Migration Notes

- The Tencent Cloud migration established the current production API host,
  Cloudflare/Nginx deployment shape, centralized media URL handling, loading
  error state, lazy canvas loading, and Vite chunk splitting.
- The original migration branch/worktrees and their base-commit details are
  intentionally omitted here because those worktrees were deleted and are no
  longer actionable workspace information.
- The old `Opening.jsx` implementation and its `Openning.scss` styling are
  historical references only; new landing work should start from
  `src/components/landing/` and the current XState handoff.

## Verification and Follow-up

- Production Vite builds previously passed; known non-blocking warnings include
  third-party `eval` warnings and a large `three-vendor` chunk.
- The landing integration has passed the local source build/lint checks used
  during implementation.
- Backend content was transferred from local Strapi to production with
  `strapi transfer --exclude files`.
- Remaining useful follow-up is an end-to-end production check of API responses,
  landing entry, the screenshot-to-cloth transition, and the final deployed
  site at `https://rydeenwang.com`.
