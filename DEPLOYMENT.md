# 🚀 Deployment Guide

## Prerequisites

- Node.js 18+ installed
- Git installed
- Cloud hosting account (optional) or local server

## 📦 Pre-Deployment Checklist

### ✅ Security
- [x] `.env` files are in `.gitignore`
- [x] Database files (JSON) are in `.gitignore`
- [x] `.cursor/` folder is ignored
- [x] Debug logs are ignored

### ✅ Files to Commit
- [x] All source code files
- [x] `package.json` and `package-lock.json`
- [x] `tsconfig.json`
- [x] `README.md`, `QUICK_START.md`, `DEPLOYMENT.md`
- [x] `.gitignore`

### ❌ Files NOT to Commit
- `node_modules/` (auto-ignored)
- `.env` / `.env.local` files (auto-ignored)
- `frontend/data/` folder (contains user data)
- `.next/` build folder
- `.cursor/debug.log`

## 🖥️ On-Premises Deployment (Recommended)

### Step 1: Clone and Install

```bash
git clone <repository-url>
cd frontend
npm install
```

### Step 2: Build for Production

```bash
npm run build
```

### Step 3: Start Server

```bash
npm start
```

The application will run on port 3001 by default.

### Step 4: Using PM2 (Recommended)

```bash
# Install PM2 globally
npm install -g pm2

# Start application
pm2 start npm --name "task-dashboard" -- start

# Save process list
pm2 save

# Setup auto-start on reboot
pm2 startup
```

### Step 5: Configure Reverse Proxy (Optional)

**Nginx Example:**

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 🔧 Environment Variables (Optional)

Create `.env.local` in `frontend/` directory:

```env
# App URL (for invite links)
NEXT_PUBLIC_APP_URL=https://your-domain.com

# Supabase (optional - if not set, uses local JSON database)
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-key

# Email sending (optional - if not set, shows invite link)
RESEND_API_KEY=re_xxxx
```

**Note:** The system works perfectly without any environment variables using local file storage.

## 🌐 Cloud Deployment Options

### Option 1: Vercel (Easiest)

1. Push code to GitHub
2. Connect repository to Vercel
3. Deploy automatically

**vercel.json** is already configured:
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "framework": "nextjs"
}
```

### Option 2: Railway

1. Connect GitHub repository
2. Create new service
3. Root Directory: `frontend`
4. Build: `npm install && npm run build`
5. Start: `npm start`

### Option 3: Docker (Enterprise)

Create `Dockerfile` in `frontend/`:

```dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
EXPOSE 3001
ENV PORT 3001
CMD ["node", "server.js"]
```

Build and run:
```bash
docker build -t task-dashboard .
docker run -p 3001:3001 task-dashboard
```

## 📁 Data Storage

### Local File Storage (Default)

Data is stored in `frontend/data/`:
- `local-auth.json` - Users and organizations
- `local-db.json` - Tasks, goals, KPIs, etc.
- `invites.json` - Pending invitations
- `notifications.json` - User notifications

**Important:** Back up this folder regularly in production!

### Supabase (Recommended for Production)

1. Create Supabase project
2. Set environment variables:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-key
   ```
3. Create required tables (schema provided in setup)

## 🔐 Security Checklist

- [ ] Use HTTPS in production
- [ ] Set strong passwords for all accounts
- [ ] Configure firewall rules
- [ ] Regular backups of `data/` folder
- [ ] Monitor server logs
- [ ] Keep Node.js and npm updated

## 🧪 Post-Deployment Testing

1. **Test Registration:**
   - Register new organization
   - Create Admin and Employee users
   - Verify invite links work

2. **Test Features:**
   - Create tasks and goals
   - Test notifications
   - Test language switching (AR/EN)

3. **Test Analytics:**
   - Verify analytics dashboard loads
   - Check workload analysis

## 🐛 Troubleshooting

### Server won't start
- Check port 3001 is available
- Verify Node.js version (18+)
- Check `npm run build` completed successfully

### Data not saving
- Check `frontend/data/` folder exists
- Verify write permissions on data folder
- Check disk space

### Invite links not working
- Set `NEXT_PUBLIC_APP_URL` in `.env.local`
- Verify server URL is accessible

### Email not sending
- Set `RESEND_API_KEY` in `.env.local`
- Or use the displayed invite link manually

## 📊 Monitoring

Consider setting up:
- **Uptime Monitoring:** UptimeRobot, Pingdom
- **Logs:** PM2 logs, journalctl
- **Backups:** Automated data folder backups

---

**For quick local development, see [QUICK_START.md](./QUICK_START.md)**
