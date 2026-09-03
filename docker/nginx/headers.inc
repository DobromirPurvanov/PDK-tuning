# Заглавките за сигурност (план, стр. 33). Включват се във всеки location, който има add_header —
# nginx иначе ги губи (add_header в location замества наследените).
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
add_header X-Frame-Options SAMEORIGIN always;
add_header X-Content-Type-Options nosniff always;
add_header Referrer-Policy strict-origin-when-cross-origin always;
add_header Permissions-Policy "camera=(), microphone=(), geolocation=()" always;
add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://challenges.cloudflare.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https://www.googletagmanager.com https://*.google-analytics.com; font-src 'self'; connect-src 'self' https://*.google-analytics.com https://www.googletagmanager.com; frame-src https://www.google.com https://challenges.cloudflare.com; frame-ancestors 'self'; base-uri 'self'; form-action 'self'" always;
