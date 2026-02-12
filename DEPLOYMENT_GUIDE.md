# Deployment Guide - Client Queue Manager on Hostinger VPS (OpenLiteSpeed + Node.js)

This guide walks you through deploying the Client Queue Manager to your Hostinger VPS step by step.

---

## What You Need Before Starting

- Your Hostinger VPS IP address
- SSH access to your VPS (root password or SSH key)
- A domain name pointed to your VPS (optional but recommended)

---

## STEP 1: Connect to Your VPS

Open a terminal (Command Prompt on Windows, Terminal on Mac) and connect:

```bash
ssh root@YOUR_VPS_IP
```

Enter your password when prompted.

---

## STEP 2: Install PostgreSQL

```bash
sudo apt update
sudo apt install postgresql postgresql-contrib -y
```

Start PostgreSQL and enable it to run on boot:

```bash
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

Create a database and user:

```bash
sudo -u postgres psql
```

Inside the PostgreSQL prompt, run these commands (replace `YOUR_SECURE_PASSWORD` with a strong password):

```sql
CREATE USER cqm_user WITH PASSWORD 'YOUR_SECURE_PASSWORD';
CREATE DATABASE client_queue_manager OWNER cqm_user;
GRANT ALL PRIVILEGES ON DATABASE client_queue_manager TO cqm_user;
\q
```

---

## STEP 3: Create the App Directory

```bash
mkdir -p /var/www/client-queue-manager
cd /var/www/client-queue-manager
```

---

## STEP 4: Transfer Files from Replit to Your VPS

You need to transfer these files/folders from your Replit project to the VPS. The easiest way is to use the Replit "Download as zip" feature, then upload to your VPS.

**Option A: Download from Replit and upload via SCP**

1. In Replit, click the three dots menu > "Download as zip"
2. Unzip on your local computer
3. From your local terminal, upload the needed files:

```bash
scp -r dist/ root@YOUR_VPS_IP:/var/www/client-queue-manager/
scp package.json root@YOUR_VPS_IP:/var/www/client-queue-manager/
scp package-lock.json root@YOUR_VPS_IP:/var/www/client-queue-manager/
scp ecosystem.config.cjs root@YOUR_VPS_IP:/var/www/client-queue-manager/
scp start.mjs root@YOUR_VPS_IP:/var/www/client-queue-manager/
scp database_export.sql root@YOUR_VPS_IP:/var/www/client-queue-manager/
scp drizzle.config.ts root@YOUR_VPS_IP:/var/www/client-queue-manager/
scp -r shared/ root@YOUR_VPS_IP:/var/www/client-queue-manager/
```

**Option B: Use Git (if you have a repo)**

```bash
cd /var/www/client-queue-manager
git clone YOUR_REPO_URL .
npm run build
```

---

## STEP 5: Import Your Database

On your VPS, import the database dump:

```bash
cd /var/www/client-queue-manager
psql -U cqm_user -d client_queue_manager -f database_export.sql
```

If prompted for a password, enter the one you created in Step 2.

If you get a connection error, you may need to edit PostgreSQL's authentication config:

```bash
sudo nano /etc/postgresql/*/main/pg_hba.conf
```

Find the line that says `local all all peer` and change `peer` to `md5`, then restart:

```bash
sudo systemctl restart postgresql
```

---

## STEP 6: Install Node.js Dependencies

```bash
cd /var/www/client-queue-manager
npm install --production
```

Install PM2 globally if not already installed:

```bash
npm install -g pm2
```

---

## STEP 7: Set Up Environment Variables

Create an environment file:

```bash
nano /var/www/client-queue-manager/.env
```

Paste the following (fill in your actual values):

```env
NODE_ENV=production
PORT=3000

# Database - update password to match what you set in Step 2
DATABASE_URL=postgresql://cqm_user:YOUR_SECURE_PASSWORD@localhost:5432/client_queue_manager
PGHOST=localhost
PGPORT=5432
PGUSER=cqm_user
PGPASSWORD=YOUR_SECURE_PASSWORD
PGDATABASE=client_queue_manager

# Session secret - use a long random string
SESSION_SECRET=PASTE_YOUR_SESSION_SECRET_HERE

# Twilio credentials - copy these from your Replit secrets
TWILIO_ACCOUNT_SID=PASTE_YOUR_VALUE
TWILIO_AUTH_TOKEN=PASTE_YOUR_VALUE
TWILIO_PHONE_NUMBER=PASTE_YOUR_VALUE
TWILIO_API_KEY=PASTE_YOUR_VALUE
TWILIO_API_SECRET=PASTE_YOUR_VALUE
TWILIO_TWIML_APP_SID=PASTE_YOUR_VALUE
```

Save and exit (Ctrl+X, then Y, then Enter).

Now make the app load these variables. Edit the PM2 config to include the env file:

```bash
cd /var/www/client-queue-manager
```

The `ecosystem.config.cjs` is already in your project. But we also need to ensure the .env is loaded. Install dotenv:

```bash
npm install dotenv
```

Create a small startup wrapper:

```bash
nano /var/www/client-queue-manager/start.cjs
```

Paste this:

```javascript
require('dotenv').config();
import('./dist/index.js');
```

Actually, since the dist is ESM, create it this way instead:

```bash
nano /var/www/client-queue-manager/start.mjs
```

```javascript
import 'dotenv/config';
import './dist/index.js';
```

Update `ecosystem.config.cjs` to use the wrapper:

```bash
nano /var/www/client-queue-manager/ecosystem.config.cjs
```

Change the `script` line to:

```javascript
script: 'start.mjs',
```

---

## STEP 8: Start the App with PM2

```bash
cd /var/www/client-queue-manager
mkdir -p logs
pm2 start ecosystem.config.cjs
```

Verify it's running:

```bash
pm2 status
pm2 logs client-queue-manager
```

You should see "serving on port 3000" in the logs.

Test locally on the VPS:

```bash
curl http://localhost:3000
```

You should get back HTML content.

Make PM2 start on boot:

```bash
pm2 startup
pm2 save
```

---

## STEP 9: Configure OpenLiteSpeed Reverse Proxy

### 9a. Access the OpenLiteSpeed Admin Panel

Open your browser and go to:

```
https://YOUR_VPS_IP:7080
```

Login credentials:
- Username: `admin`
- Password: Check with `cat /usr/local/lsws/adminpasswd` on your VPS

### 9b. Create an External App

1. Go to **Server Configuration** > **External App**
2. Click **Add** > Type: **Web Server**
3. Fill in:
   - **Name**: `NodeApp`
   - **Address**: `127.0.0.1:3000`
   - **Max Connections**: `100`
   - **Initial Request Timeout**: `60`
   - **Retry Timeout**: `0`
4. Click **Save**

### 9c. Set Up Rewrite Rules

1. Go to **Virtual Hosts** > click your virtual host (usually `Example`)
2. Go to the **Rewrite** tab
3. Set **Enable Rewrite** to `Yes`
4. In **Rewrite Rules**, add:

```apache
RewriteEngine On
RewriteRule ^(.*)$ http://NodeApp/$1 [P,L]
```

5. Click **Save**

### 9d. Set Up WebSocket Proxy (Required for real-time features)

1. Still in your virtual host settings, go to **Web Socket Proxy**
2. Click **Add**
3. Fill in:
   - **URI**: `/`
   - **Address**: `127.0.0.1:3000`
4. Click **Save**

### 9e. Restart OpenLiteSpeed

Click **Actions** > **Graceful Restart** at the top of the admin panel.

Or from the command line:

```bash
/usr/local/lsws/bin/lswsctrl restart
```

---

## STEP 10: Set Up SSL (HTTPS) - Recommended

```bash
sudo apt install certbot -y
sudo certbot certonly --webroot -w /var/www/html -d yourdomain.com -d www.yourdomain.com
```

Then in the OLS Admin Panel:

1. Go to **Virtual Hosts** > your host > **SSL**
2. Set:
   - **Private Key File**: `/etc/letsencrypt/live/yourdomain.com/privkey.pem`
   - **Certificate File**: `/etc/letsencrypt/live/yourdomain.com/fullchain.pem`
   - **Chained Certificate**: `Yes`
3. Make sure you have an HTTPS listener on port 443 mapped to your virtual host
4. **Graceful Restart**

Set up auto-renewal:

```bash
sudo crontab -e
```

Add this line:

```
0 2 * * * certbot renew --quiet && /usr/local/lsws/bin/lswsctrl restart
```

---

## STEP 11: Configure Firewall

```bash
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 7080/tcp    # OLS Admin - consider restricting to your IP only
sudo ufw allow 22/tcp      # SSH
sudo ufw enable
```

---

## STEP 12: Update Twilio Webhook URLs

If you're using Twilio for calls/SMS, update your Twilio console:

1. Go to https://console.twilio.com
2. Update your TwiML App's Voice URL to: `https://yourdomain.com/api/twilio/voice`
3. Update your phone number's SMS webhook to: `https://yourdomain.com/api/twilio/sms`

---

## Troubleshooting

### App won't start
```bash
pm2 logs client-queue-manager --lines 50
```

### 502 Bad Gateway
- Check if the app is running: `pm2 status`
- Check if port 3000 is correct: `curl http://localhost:3000`
- Check OLS error log: `tail -f /usr/local/lsws/logs/error.log`

### Database connection errors
- Verify PostgreSQL is running: `sudo systemctl status postgresql`
- Test connection: `psql -U cqm_user -d client_queue_manager -c "SELECT 1;"`
- Check your DATABASE_URL in `.env`

### WebSocket not connecting
- Make sure the WebSocket Proxy is configured in OLS (Step 9d)
- Check that the URI is set to `/`

### Updating the app later
```bash
cd /var/www/client-queue-manager
# Upload new dist/ folder and other changed files
pm2 restart client-queue-manager
```

---

## Quick Reference

| What | Where |
|------|-------|
| App files | `/var/www/client-queue-manager/` |
| App logs | `pm2 logs client-queue-manager` |
| OLS config | `/usr/local/lsws/conf/` |
| OLS logs | `/usr/local/lsws/logs/` |
| OLS admin | `https://YOUR_VPS_IP:7080` |
| PostgreSQL | `sudo -u postgres psql` |
| Restart app | `pm2 restart client-queue-manager` |
| Restart OLS | `/usr/local/lsws/bin/lswsctrl restart` |
