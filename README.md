# PDK Tuning

One site: [`site/`](site/README.md). The old frontend in the repo root has been removed.

## Publishing to the VPS

A `v*` tag starts `.github/workflows/deploy.yml`: it builds the new site from `site/`,
checks the home page content, transfers the finished images and activates them
on the existing server. No code is built on the VPS.

The home page and assets are served **directly from the image**, with no proxy
to Cloudflare Pages. `site/server/server.mjs` runs the same logic for the live
catalog, the dealer portal and the forms as `site/public/_worker.js`.
The database stays on the client's server; there is no copy of it here.

## One file for the addresses

[`site/.env.local`](site/.env.local) is the single source for the build and the VPS:

```dotenv
CATALOG_BASE_URL=https://files.pdktuning.com
BASE_URL=https://www.pdktuning.com
```

The file contains only public addresses and goes into the image. To change an
address, edit it here, then publish a new tag. Docker, CI and the runtime keep
no separate copies or default values for these two keys.

DNS and working HTTPS for `files.pdktuning.com` are set up by the client's IT.
The form reads its secrets from the server environment: `RESEND_API_KEY`, `CONTACT_TO` and
`CONTACT_FROM` (the old `MAIL_TO` and `MAIL_FROM` are also accepted). Secrets are not
written to the public `site/.env.local`.

The public `PUBLIC_INDEXABLE`, `PUBLIC_GA_ID` and `PUBLIC_GSC_VERIFY` are read
from the server's `.env`; a key missing there is taken from the repo variables
in GitHub Actions (`gh variable set`).

`/__alive` checks the process; `/api/health` shows `site: new-pdk`, the commit
identifier and whether mail is configured. `X-PDK-Site` and `X-PDK-Release` make it possible
to tell the site that was actually deployed from an old cached response.

## Local work

```sh
npm ci --prefix site
npm run build --prefix site
PORT=8000 node site/server/server.mjs
node --test site/server/*.test.mjs
python3 -m unittest discover -s scripts/deploy -p 'test_*.py' -v
```

Alternative: `docker compose up -d --build`.

Cloudflare Pages remains a possible separate way to host the site through
`npm run deploy:stage1 --prefix site`, but the VPS no longer depends on it.

## Activation

`scripts/deploy/activate.sh` verifies the checksum, the configuration and the new
site, updates only the `web` and `api` services, and writes `.compose.active.yml` and
`.images.env`. The other projects on the server are left unchanged.

The code is delivered with the Docker images, not with `git checkout`. So that nobody reads
an old version after a new design goes out, the deploy finally brings the server's working tree
in line with the released tag and writes `ACTIVE-VERSION` in `/home/pdk_new/website`:

```
cat /home/pdk_new/website/ACTIVE-VERSION   # tag, commit, deploy time
git -C /home/pdk_new/website describe --tags
curl -sI https://new.pdktuning.com/ | grep -i x-pdk-version
```

All three must match. If the tree lags behind (the server has not reached
`origin`), `ACTIVE-VERSION` and the `X-PDK-Version` header are authoritative:
`version` in `/api/health` shows the same, and `release` is the exact commit.
