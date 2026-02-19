# SKYNITY — VPS Deployment Guide

## Prerequisites
- VPS with Ubuntu 22.04+ (minimum 1 vCPU, 1 GB RAM)
- Docker & Docker Compose installed
- Domain name pointed to your VPS IP (optional but recommended for SSL)

---

## Quick Start

### 1. Clone the repository
```bash
git clone <your-repo-url> /opt/skynity
cd /opt/skynity
```

### 2. Configure environment variables
```bash
cp .env.example .env
nano .env
```

Set at minimum:
- `POSTGRES_PASSWORD` — a strong random password
- `NEXTAUTH_SECRET` — run `openssl rand -base64 32` and paste the result
- `NEXTAUTH_URL` — your domain, e.g. `https://skynity.example.com`

### 3. Build and start
```bash
docker compose up -d --build
```

### 4. Run database migrations (first run only)
```bash
docker compose exec app npx prisma migrate deploy
docker compose exec app npx prisma db seed
```

The app is now running at **http://your-server-ip**

---

## SSL / HTTPS with Let's Encrypt

```bash
# Install Certbot
apt install certbot

# Get certificate (stop nginx temporarily)
docker compose stop nginx
certbot certonly --standalone -d your-domain.com
docker compose start nginx

# Copy certificates
mkdir -p ssl
cp /etc/letsencrypt/live/your-domain.com/fullchain.pem ssl/cert.pem
cp /etc/letsencrypt/live/your-domain.com/privkey.pem ssl/key.pem
```

Then in `nginx.conf`:
1. Uncomment the HTTPS server block
2. Update `server_name your-domain.com`
3. Uncomment the HTTP-to-HTTPS redirect
4. Restart: `docker compose restart nginx`

---

## Useful Commands

| Task | Command |
|------|---------|
| View app logs | `docker compose logs -f app` |
| Restart app | `docker compose restart app` |
| Stop everything | `docker compose down` |
| Rebuild after code change | `docker compose up -d --build app` |
| Open DB shell | `docker compose exec db psql -U skynity skynity` |

## Updating the App

```bash
git pull
docker compose up -d --build app
docker compose exec app npx prisma migrate deploy
```

## Backup the Database

```bash
# Backup
docker compose exec db pg_dump -U skynity skynity > backup_$(date +%Y%m%d_%H%M).sql

# Restore
cat backup_20260218_1200.sql | docker compose exec -T db psql -U skynity skynity
```

---

## Default Login

- **Email:** `admin@skynity.org`
- **Password:** `admin123`

> **Important:** Change the admin password immediately after first login!
