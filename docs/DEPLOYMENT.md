# Deployment Guide

## Prerequisites

- Server with Ubuntu 20.04+ or similar Linux distribution
- Docker and Docker Compose installed
- Domain name configured (optional but recommended)
- SSL certificate (Let's Encrypt recommended)
- At least 2GB RAM and 20GB disk space

## Production Environment Setup

### 1. Server Preparation

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo apt install docker-compose -y

# Add user to docker group
sudo usermod -aG docker $USER
```

### 2. Clone Repository

```bash
git clone https://github.com/cashpilotthrive-hue/.github.git
cd .github
```

### 3. Environment Configuration

Create production environment files:

**Backend (.env)**
```bash
cp backend/.env.example backend/.env
nano backend/.env
```

Update with production values:
```env
NODE_ENV=production
PORT=5000

# Database
DB_HOST=postgres
DB_PORT=5432
DB_NAME=crypto_mining_platform
DB_USER=postgres
DB_PASSWORD=STRONG_PASSWORD_HERE

# JWT Secrets (generate strong secrets)
JWT_SECRET=your_production_jwt_secret_min_32_chars
JWT_REFRESH_SECRET=your_production_refresh_secret_min_32_chars

# Redis
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=REDIS_PASSWORD_HERE

# Email (use production SMTP)
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASSWORD=YOUR_SENDGRID_API_KEY
EMAIL_FROM=noreply@yourdomain.com

# Stripe
STRIPE_SECRET_KEY=sk_live_your_stripe_key
STRIPE_PUBLISHABLE_KEY=pk_live_your_stripe_key

# Web3
WEB3_PROVIDER_URL=https://mainnet.infura.io/v3/YOUR_PROJECT_ID
```

**Frontend (.env)**
```bash
cp frontend/.env.example frontend/.env
nano frontend/.env
```

```env
VITE_API_URL=https://api.yourdomain.com/api/v1
VITE_WS_URL=wss://api.yourdomain.com
```

### 4. SSL Certificate Setup (with Let's Encrypt)

```bash
# Install certbot
sudo apt install certbot -y

# Generate certificate
sudo certbot certonly --standalone -d yourdomain.com -d api.yourdomain.com
```

### 5. Nginx Configuration

Create production nginx config:

```nginx
# /etc/nginx/sites-available/crypto-mining
upstream backend {
    server localhost:5000;
}

upstream frontend {
    server localhost:3000;
}

server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    location / {
        proxy_pass http://frontend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

server {
    listen 443 ssl http2;
    server_name api.yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    location / {
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header Host $host;
    }
}
```

Enable the site:
```bash
sudo ln -s /etc/nginx/sites-available/crypto-mining /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 6. Deploy with Docker Compose

Update docker-compose.yml for production:

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:16-alpine
    restart: always
    environment:
      POSTGRES_DB: crypto_mining_platform
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./backups:/backups
    networks:
      - crypto-mining-network

  redis:
    image: redis:7-alpine
    restart: always
    command: redis-server --requirepass ${REDIS_PASSWORD}
    volumes:
      - redis_data:/data
    networks:
      - crypto-mining-network

  backend:
    build:
      context: ./backend
      dockerfile: ../Dockerfile.backend
    restart: always
    env_file:
      - backend/.env
    depends_on:
      - postgres
      - redis
    volumes:
      - ./backend/logs:/app/logs
      - ./backend/uploads:/app/uploads
    networks:
      - crypto-mining-network
    ports:
      - "5000:5000"

  frontend:
    build:
      context: ./frontend
      dockerfile: ../Dockerfile.frontend
    restart: always
    ports:
      - "3000:80"
    networks:
      - crypto-mining-network

volumes:
  postgres_data:
  redis_data:

networks:
  crypto-mining-network:
    driver: bridge
```

Start services:
```bash
docker-compose up -d --build
```

### 7. Database Migration

```bash
# Run migrations
docker-compose exec backend npm run migrate

# Seed initial data (optional)
docker-compose exec backend npm run seed
```

### 8. Monitoring and Logs

```bash
# View logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f backend
docker-compose logs -f frontend

# Check service status
docker-compose ps
```

## Backup Strategy

### Database Backup

Create a backup script:

```bash
#!/bin/bash
# backup.sh

BACKUP_DIR="/path/to/backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/db_backup_$TIMESTAMP.sql"

docker-compose exec -T postgres pg_dump -U postgres crypto_mining_platform > "$BACKUP_FILE"
gzip "$BACKUP_FILE"

# Keep only last 7 days of backups
find "$BACKUP_DIR" -name "db_backup_*.sql.gz" -mtime +7 -delete
```

Add to crontab:
```bash
# Run daily at 2 AM
0 2 * * * /path/to/backup.sh
```

## Updates and Maintenance

### Update Application

```bash
# Pull latest changes
git pull origin main

# Rebuild and restart services
docker-compose down
docker-compose up -d --build

# Run migrations if needed
docker-compose exec backend npm run migrate
```

### Scale Services

```bash
# Scale backend instances
docker-compose up -d --scale backend=3
```

## Security Checklist

- [ ] Change all default passwords
- [ ] Enable firewall (UFW recommended)
- [ ] Configure fail2ban
- [ ] Set up automated backups
- [ ] Enable HTTPS/SSL
- [ ] Configure CORS properly
- [ ] Set secure JWT secrets
- [ ] Enable audit logging
- [ ] Configure rate limiting
- [ ] Keep dependencies updated
- [ ] Monitor logs regularly
- [ ] Set up intrusion detection

## Troubleshooting

### Service won't start
```bash
# Check logs
docker-compose logs backend

# Check container status
docker ps -a
```

### Database connection issues
```bash
# Check postgres logs
docker-compose logs postgres

# Test connection
docker-compose exec backend nc -zv postgres 5432
```

### Performance issues
```bash
# Monitor resource usage
docker stats

# Check database performance
docker-compose exec postgres psql -U postgres -c "SELECT * FROM pg_stat_activity;"
```

## Support

For production support, contact: support@cryptomining.com
