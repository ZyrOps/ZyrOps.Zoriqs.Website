# Thoth Sparkz Deployment Notes

These notes cover the domain-independent deployment items. Add the final domain before creating canonical tags, the production sitemap, SSL certificate commands, and absolute social preview URLs.

## 1GB VPS Target

- Ubuntu 22.04 LTS minimal
- Nginx for static serving
- 1GB swap file enabled
- Brotli and gzip compression
- Long immutable cache for static assets
- Short revalidation cache for HTML
- No Docker, Redis, Elasticsearch, or other heavy services

## Nginx Headers To Use In Production

```nginx
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
add_header Permissions-Policy "camera=(), microphone=(), geolocation=()" always;

location ~* \.(css|js|woff2|woff|otf)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
    access_log off;
}

location ~* \.(webp|avif|png|jpg|jpeg|gif|svg|ico|mp4|webm)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
    access_log off;
}

location ~* \.html$ {
    expires 1h;
    add_header Cache-Control "public, must-revalidate";
}
```

## Domain Items To Add Later

- `<link rel="canonical" href="https://your-domain/">`
- `og:url` and absolute `og:image`
- `twitter:image` absolute URL
- `sitemap.xml` with absolute URLs
- Certbot command for the selected domain
