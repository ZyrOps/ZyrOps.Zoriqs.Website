# Thoth Sparkz Website

Official static website for Thoth Sparkz, built as a lightweight HTML, CSS, and JavaScript site with GSAP-powered scroll animations.

## Project Status

- Production repo: `https://github.com/ZyrOps/ZyrOps.Thothsparkz.Website.git`
- Main branch: `main`
- Local project folder: `C:\Users\abhij\Zyrops\ThothSparkz`
- Local development URL: `http://127.0.0.1:4173`

## Tech Stack

- HTML pages
- CSS in `styles.css`
- Vanilla JavaScript in `main.js`
- GSAP and ScrollTrigger for animation
- Lenis for smooth desktop scrolling
- Custom Node static server in `server.mjs`
- No build step required
- No package install required

## Main Pages

- `index.html` - Homepage and main service experience
- `work.html` - Product / portfolio page
- `about.html` - About page
- `contact.html` - Contact and booking page

Removed pages:

- `pricing.html`
- `work/alpa.html`
- `work/alpin-capital.html`
- `work/winter.html`

## Important Files

- `styles.css` - Layout, responsive design, nav, footer, contact form, service cards, cursor styling
- `animations.js` - GSAP page animations, scroll-driven word reveal, services horizontal scroll, logo handoff
- `main.js` - Dynamic nav, mobile menu, filters, cursor behavior, copy email behavior
- `server.mjs` - Local static server with security and cache headers
- `robots.txt` - Basic search crawler rules
- `site.webmanifest` - PWA/browser manifest metadata
- `DEPLOYMENT.md` - VPS and domain deployment notes
- `scripts/seo-check.mjs` - Local SEO and asset sanity checker

## Assets

Logo and brand assets:

- `assets/img/thoth-sparkz-logo-pdf.png`
- `assets/img/thoth-sparkz-wordmark-gold.png`
- `assets/img/logo-end.png`

Service media:

- `assets/img/service-web-development.webm`
- `assets/img/service-mobile-app-development.webm`
- `assets/img/service-digital-marketing.webm`

Product media:

- `assets/img/product-techvision-creative.webp`
- `assets/img/product-fittrack-creative.webp`
- `assets/img/product-luxe-creative.webp`
- `assets/img/product-electroshop-creative.webp`
- `assets/img/product-quickbite-creative.webp`
- `assets/img/product-nextech-creative.webp`

Icons:

- `favicon-16.png`
- `favicon-32.png`
- `apple-touch-icon.png`

## Run Locally

From the project folder:

```powershell
cd C:\Users\abhij\Zyrops\ThothSparkz
node server.mjs 4173
```

Open:

```text
http://127.0.0.1:4173
```

If port `4173` is already busy, use another port:

```powershell
node server.mjs 4174
```

Then open:

```text
http://127.0.0.1:4174
```

## Validation Commands

Check JavaScript syntax:

```powershell
node --check animations.js
node --check main.js
```

Run SEO and asset checks:

```powershell
node scripts\seo-check.mjs
```

Expected current warning:

```text
WARN: large media assets over 512KB:
  assets\video\card-alpa.mp4 (653KB)
```

This warning does not break the website. It only means that video is slightly heavier than the recommended local threshold. Compress or replace it later if performance scores need improvement.

## Deployment Notes

This site can be deployed as static files. There is no build output folder. Deploy the repository contents directly.

Recommended production setup:

- Nginx static hosting
- HTTPS enabled
- Gzip or Brotli compression
- Long cache for static files
- Short revalidation cache for HTML
- Security headers from `DEPLOYMENT.md`

Read `DEPLOYMENT.md` before deploying to a VPS.

## SEO Notes

Already included:

- Page titles
- Meta descriptions
- Open Graph metadata
- Twitter card metadata
- Manifest file
- Favicons
- `robots.txt`
- Image alt checks
- One H1 per page

Still needed after the final domain is chosen:

- Canonical URLs
- Absolute `og:url`
- Absolute `og:image`
- Absolute `twitter:image`
- Production `sitemap.xml`
- SSL certificate commands for the chosen domain

## Known Implementation Details

- Desktop services section uses GSAP pinned horizontal scrolling.
- Mobile and tablet services section also pins briefly and maps vertical scroll to horizontal card movement.
- The statement section word reveal is not pinned, to avoid reverse-scroll overlap bugs.
- The dynamic island nav changes during the services section on desktop.
- Mobile nav uses a three-column layout: logo left, CTA centered, menu right.
- Pricing and detailed product pages were intentionally removed.

## Git Workflow

Check status:

```powershell
git status --short --branch
```

Commit changes:

```powershell
git add -A
git commit -m "Update Thoth Sparkz website"
```

Push to GitHub:

```powershell
git push origin main
```

## Current GitHub Remote

```text
origin https://github.com/ZyrOps/ZyrOps.Thothsparkz.Website.git
```

## Notes For Future Edits

- Keep cache query strings updated when changing CSS or JS, for example `styles.css?v=...`.
- Test desktop, tablet, and mobile after changing scroll animations.
- Do not re-add the pricing page unless the nav and footer are updated too.
- Keep media assets compressed for mobile performance.
