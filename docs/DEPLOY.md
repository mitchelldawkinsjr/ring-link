# Deploy RingLink

The production split is:

| Tier | Where | How |
| --- | --- | --- |
| Frontend (Next.js) | Vercel | Auto-deploy on push to `main`, root dir `frontend/` |
| API (Laravel) | mitch-cloud VPS, Docker Compose | GitHub Action `Deploy backend to mitch-cloud` (rsync + SSH) |
| Media storage | Cloudflare R2 | Wrestler videos / images |

## VPS conventions

mitch-cloud hosts many Docker apps (nba-stat-spot, wnba-stat-spot, 360ws,
scriptura, etc.). RingLink follows the same convention:

- **App code lives at** `/opt/360ws/clients/docker-app/<app-name>/` — synced by
  GitHub Actions on every deploy.
- **Persistent data lives at** `/data/<app-name>/` — bind-mounted into the
  containers so it survives image rebuilds and `docker compose down`.
- **All containers join the external network `360ws-network`** so Nginx Proxy
  Manager (NPM) can reach them by container name.
- **NPM owns ports 80 / 81 / 443** — no other app binds those. Apps expose an
  internal host port (RingLink uses **`8011 → 80`** on the nginx sidecar) and
  NPM proxies the public hostname to it.
- **Containers get labels** `com.360ws.app`, `.type`, `.service`.
- **A shared GitHub Action SSH key** (`VPS_SSH_KEY` secret) is reused per repo.

## CI/CD pipeline

`.github/workflows/deploy-backend.yml` (mirrors `wnba-stat-spot/deploy-vps.yml`):

1. Push to `main` (or manual dispatch) triggers it.
2. Uses `webfactory/ssh-agent@v0.9.0` + `ssh-keyscan` to authenticate.
3. `rsync -avz --delete` pushes the repo to
   `/opt/360ws/clients/docker-app/ringlink/` — excluding `.git`, `vendor`,
   `node_modules`, log/cache dirs, and **`.env`** (the VPS keeps its own copy).
4. SSH session on the VPS runs: build → up → migrate → cache config/routes →
   health-check `http://localhost:8011/up`.
5. Slack notification on success/failure (optional, only if `SLACK_WEBHOOK`
   secret is set).

## One-time VPS bootstrap (already done for RingLink)

The GitHub Action creates the data dirs, the shared network, and seeds
`/data/ringlink/storage` with the Laravel subdirectories owned by uid 82
(the Alpine PHP image's `www-data`) on every run.

The only manual step the first time is the env file:

```bash
ssh root@<vps-host>
cd /opt/360ws/clients/docker-app/ringlink
cp .env.example .env
nano .env                                # fill in DB pw, R2 keys, mail, etc.

# Generate APP_KEY once and paste into .env:
docker compose -f docker-compose.prod.yml run --rm app php artisan key:generate --show
```

## Required GitHub repo secrets

In `mitchelldawkinsjr/ring-link → Settings → Secrets and variables → Actions`:

| Secret | Value | Notes |
| --- | --- | --- |
| `VPS_HOST` | mitch-cloud public IP / DNS | Same as nba / wnba repos |
| `VPS_USER` | `root` | Same as nba / wnba repos |
| `VPS_SSH_KEY` | Private key whose public half is in `/root/.ssh/authorized_keys` | Reused across all VPS-deployed repos |
| `SLACK_WEBHOOK` | (optional) Slack incoming-webhook URL | Same channel as nba |

## NPM (reverse proxy + TLS)

In Nginx Proxy Manager, add a **Proxy Host**:

- **Domain Names**: `api.ringlink.app`
- **Scheme**: `http`
- **Forward Hostname / IP**: `ringlink-nginx` (container name on `360ws-network`)
- **Forward Port**: `80`
- **Block Common Exploits** ✓, **Websockets Support** ✓
- **SSL** → request new Let's Encrypt cert, force SSL, HTTP/2, HSTS

DNS: `A` record `api.ringlink.app → <VPS public IP>`.

## Frontend on Vercel

1. **New Project** → import the GitHub repo.
2. **Root Directory** → `frontend`.
3. **Build & Output** → defaults (`next build`).
4. **Environment Variables**:
   ```
   NEXT_PUBLIC_API_URL=https://api.ringlink.app/api/v1
   ```
5. Vercel auto-redeploys on every push to `main`.

## Cloudflare R2

1. Cloudflare → R2 → **Create bucket** `ringlink-media`.
2. **R2 API Tokens** → token scoped to that bucket with Object Read & Write.
3. Fill `R2_*` values in `backend/.env.production` on the VPS.
4. (Optional) Attach a custom hostname `media.ringlink.app` to the bucket.

## Day-2 operations

```bash
ssh root@<vps-host>
cd /opt/360ws/clients/docker-app/ringlink

# Tail logs
docker compose -f docker-compose.prod.yml logs -f app

# Re-run migrations
docker compose -f docker-compose.prod.yml exec -T app php artisan migrate --force

# Artisan tinker shell
docker compose -f docker-compose.prod.yml exec app php artisan tinker

# Manual SQL backup (Duplicati handles /data automatically)
docker compose -f docker-compose.prod.yml exec mysql \
  sh -c 'mysqldump -u root -p"$MYSQL_ROOT_PASSWORD" ringlink' \
  > /data/ringlink/backups/$(date +%F).sql

# Force a rebuild + redeploy (matches what the Action does)
git pull
docker compose -f docker-compose.prod.yml up -d --build
docker compose -f docker-compose.prod.yml exec -T app php artisan migrate --force
```

## CI

`.github/workflows/ci.yml` runs on every push and PR: backend Pest tests
against MySQL, Pint, MVP integrity script, plus frontend lint/typecheck/vitest.
The deploy workflow runs **after** push to `main`, so a green CI gates whether
deploy fires next.
