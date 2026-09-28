# Zoriqs Deployment Notes

## Vercel (current hosting)

The site is plain static HTML, CSS, and JavaScript. Vercel serves the repository root as static files, and every push to `main` triggers an automatic deployment.

- `vercel.json` sets `"framework": null` with no build or install command, so Vercel treats the project as a static site.
- Security headers (`X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`) and cache headers are defined in `vercel.json`.
- `.vercelignore` keeps `scripts/` and docs out of the deployment.

### Do not put a Node server file in the project root

Vercel auto-detects files such as `server.mjs`, `server.js`, `index.js`, or `app.js` in the root as a Node server entrypoint. It then runs that file as a function without the static files, so every asset (CSS, JS, images, favicons, `robots.txt`) returns 404 and the logs show `Legacy server listening...`. The local preview server therefore lives at `scripts/dev-server.mjs`.

### Vercel project settings

In Project Settings > Build and Deployment:

- Framework Preset: `Other`
- Build Command, Output Directory, Install Command: leave empty or overridden off (`vercel.json` takes precedence)
- Root Directory: repository root

### Cache busting

`styles.css`, `main.js`, and `animations.js` are referenced with a `?v=` query string. Bump the value in every HTML page when those files change.

## Domain Items To Add

- `<link rel="canonical" href="https://your-domain/">`
- `og:url` and absolute `og:image`
- `twitter:image` absolute URL
- `sitemap.xml` with absolute URLs
- Add the custom domain in Vercel > Project > Domains
