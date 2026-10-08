#!/usr/bin/env bash
set -euo pipefail
cd /home/pdk_new/website
release=${1:?release directory required}
[[ "$release" =~ ^releases/[0-9]+-[0-9]+$ ]] || exit 1
exec 9>.deploy.lock
flock -n 9 || { echo 'Another deployment is active'; exit 1; }
env_args=()
for file in .env .env.local; do
  if [[ -f "$file" ]]; then env_args+=(--env-file "$file"); fi
done
((${#env_args[@]})) || { echo 'Missing .env or .env.local'; exit 1; }
# Preserve the existing project directory and COMPOSE_PROJECT_NAME from .env.
compose=(docker compose --project-directory "$PWD" "${env_args[@]}" --env-file "$release/images.env" -f "$release/docker-compose.yml")
"${compose[@]}" config --quiet
(cd "$release" && sha256sum -c images.tar.sha256)
docker load --input "$release/images.tar"
# Both images must exist locally; never pull or build on this server.
"${compose[@]}" up -d --no-build --pull never api
"${compose[@]}" run --rm --no-deps --pull never web node server/server.mjs --check
"${compose[@]}" up -d --no-build --pull never web api
"${compose[@]}" ps
for i in $(seq 1 30); do
  if curl --connect-timeout 3 --max-time 5 -fsS -o /dev/null http://127.0.0.1:8000/__alive && curl --connect-timeout 3 --max-time 5 -fsS -o /dev/null http://127.0.0.1:8000/api/health; then
    node_check=$("${compose[@]}" exec -T web node -e "fetch('http://127.0.0.1/api/health').then(r=>r.json()).then(j=>{if(j.site!=='new-pdk')process.exit(1);console.log(j.release)})")
    echo "Active new site release: $node_check"
    # Written to .compose.active.yml, NOT over the tracked docker-compose.yml.
    # The tracked one is for local work (`build:`), the production one uses `image:` -
    # copied over it, it kept `git status` on the server permanently "modified" and
    # made every login there look as if someone had edited the repository by hand.
    cp "$release/docker-compose.yml" .compose.active.yml
    cp "$release/images.env" .images.env
    rm "$release/images.tar"
    echo 'Deployment healthy; only this project’s web/api services were updated.'
    exit 0
  fi
  sleep 2
done
"${compose[@]}" logs --tail=50 web api
exit 1
