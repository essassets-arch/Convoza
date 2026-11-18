#!/usr/bin/env bash
set -euo pipefail

DOMAIN="convoza.emperorsmartsolutions.com"
APP_DIR="/home/ubuntu/convoza"
REPO_URL="https://github.com/essassets-arch/Convoza.git"

echo "=========================================================="
echo " CONVOZA Production Deployment -> https://${DOMAIN}"
echo " Target Directory: ${APP_DIR}"
echo "=========================================================="

mkdir -p /home/ubuntu

if [ ! -d "${APP_DIR}/.git" ]; then
  echo "[1/5] Cloning Convoza repository into ${APP_DIR}..."
  git clone "${REPO_URL}" "${APP_DIR}"
else
  echo "[1/5] Pulling latest Convoza main branch in ${APP_DIR}..."
  cd "${APP_DIR}"
  git fetch origin main
  git reset --hard origin/main
fi

cd "${APP_DIR}"

if [ ! -f ".env.production" ]; then
  echo "[2/5] Generating secure .env.production secrets..."
  DB_PASS=$(openssl rand -hex 16)
  JWT_SEC=$(openssl rand -hex 32)
  REFRESH_SEC=$(openssl rand -hex 32)
  ENC_KEY=$(openssl rand -hex 16) # 32 hex chars

  cat > .env.production <<EOF
NODE_ENV=production
PORT=4000
CONVOZA_HOST_BIND=127.0.0.1:8090

DB_USER=convoza_user
DB_PASSWORD=${DB_PASS}
DB_NAME=convoza_db

JWT_SECRET=${JWT_SEC}
REFRESH_TOKEN_SECRET=${REFRESH_SEC}
CREDENTIALS_ENCRYPTION_KEY=${ENC_KEY}

META_GRAPH_API_VERSION=v20.0
META_APP_ID=4558736907726599
META_APP_SECRET=replace_with_meta_app_secret
META_CONFIG_ID=
META_HOSTED_ES_URL=
META_WEBHOOK_VERIFY_TOKEN=convoza_meta_verify_token_secure_2026
DASHBOARD_URL=https://${DOMAIN}
EOF
  chmod 600 .env.production
else
  echo "[2/5] Existing .env.production preserved."
fi

echo "[3/5] Building & launching Convoza Docker Compose stack (project: convoza)..."
docker compose -p convoza -f docker-compose.production.yml --env-file .env.production up -d --build

echo "[4/5] Waiting for Convoza Edge & API healthcheck on 127.0.0.1:8090..."
for i in {1..45}; do
  if curl -fsS http://127.0.0.1:8090/api/v1/health >/dev/null 2>&1; then
    echo " -> Convoza API is UP and HEALTHY!"
    break
  fi
  sleep 2
done

echo "[5/5] Configuring Host Nginx & Let's Encrypt SSL for ${DOMAIN}..."
if [ -d /etc/nginx/sites-available ]; then
  cp "${APP_DIR}/infrastructure/nginx/host-convoza.nginx.conf" "/etc/nginx/sites-available/${DOMAIN}"
  ln -sf "/etc/nginx/sites-available/${DOMAIN}" "/etc/nginx/sites-enabled/${DOMAIN}"
  nginx -t
  systemctl reload nginx

  if command -v certbot >/dev/null 2>&1; then
    certbot --nginx -d "${DOMAIN}" --non-interactive --agree-tos --register-unsafely-without-email --redirect || \
      echo "Certbot notice: run 'certbot --nginx -d ${DOMAIN}' manually if email prompt is required."
  fi
fi

echo "=========================================================="
echo " CONVOZA IS LIVE: https://${DOMAIN}"
echo " Dashboard Login: https://${DOMAIN}/dashboard/login"
echo " Super Admin:     https://${DOMAIN}/admin"
echo " Privacy Policy:  https://${DOMAIN}/privacy"
echo " Data Deletion:   https://${DOMAIN}/privacy#data-deletion"
echo " Meta Webhook:    https://${DOMAIN}/api/v1/webhooks/meta/whatsapp"
echo "=========================================================="
