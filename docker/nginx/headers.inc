# Заглавките за сигурност (план, стр. 33). Включват се във всеки location, който има add_header —
# nginx иначе ги губи (add_header в location замества наследените).
# Една година, над препоръчания минимум от 30 дни (2592000).
#
# ВНИМАНИЕ: живият отговор може да е `max-age=0`, без това да е грешка ТУК.
# Cloudflare пренаписва заглавката според настройката на зоната
# (SSL/TLS → Edge Certificates → HSTS). Мерено 16.09.2026: и `www`, и `new`
# връщат `max-age=0`, а те са РАЗЛИЧНИ сървъри — значи стойността идва от
# ръба, не от произхода. Оправя се в таблото на Cloudflare, от този, който
# държи зоната; конфигът тук е верен и без това.
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
add_header X-Frame-Options SAMEORIGIN always;
add_header X-Content-Type-Options nosniff always;
add_header Referrer-Policy strict-origin-when-cross-origin always;
add_header Permissions-Policy "camera=(), microphone=(), geolocation=()" always;
# new.pdktuning.com only - see map $host $robots_tag in nginx.conf.
add_header X-Robots-Tag $robots_tag always;
# CSP-то се ГЕНЕРИРА след билда (scripts/csp-hashes.mjs), защото `script-src`
# носи хешовете на inline скриптовете вместо `'unsafe-inline'`. Вписан скрипт
# от чужда ръка не минава, а нашите минават, защото са обявени знак по знак.
include /etc/nginx/csp.inc;
