# Installation Guide - دليل التثبيت

## Quick Install (سريع)

```bash
# 1. Navigate to frontend folder
cd frontend

# 2. Install dependencies
npm install

# 3. Create environment file
cp .env.example .env.local

# 4. Generate secure JWT secret
node -e "console.log('JWT_SECRET=' + require('crypto').randomBytes(64).toString('hex'))"
# Copy the output and paste it in .env.local

# 5. Start the application
npm run dev          # Development mode
# OR
npm run build && npm start  # Production mode
```

## Detailed Steps

### Step 1: Prerequisites
- Node.js 18+ installed
- npm or yarn package manager

### Step 2: Install Dependencies
```bash
cd frontend
npm install
```

### Step 3: Configure Environment
```bash
cp .env.example .env.local
```

Edit `.env.local`:
```env
# Required - Generate a secure key:
JWT_SECRET=<your-secure-random-key>

# Set your domain for production:
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Generate JWT secret:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### Step 4: Run Application

**Development:**
```bash
npm run dev
```

**Production:**
```bash
npm run build
npm start
```

**With PM2 (Recommended for servers):**
```bash
npm install -g pm2
npm run build
pm2 start npm --name "task-dashboard" -- start
pm2 save
pm2 startup
```

### Step 5: Access Application
- Open: http://localhost:3000 (or your configured port)
- Register your organization (first user becomes Owner)

---

## System Requirements

| Component | Minimum | Recommended |
|-----------|---------|-------------|
| Node.js | 18.x | 20.x LTS |
| RAM | 512 MB | 1 GB |
| Disk | 500 MB | 1 GB |
| OS | Windows/Linux/macOS | Ubuntu 22.04 LTS |

## Port Configuration

Default port is 3000. To change:
```bash
# Windows
set PORT=8080 && npm start

# Linux/macOS
PORT=8080 npm start
```

## Troubleshooting

### Port already in use
```bash
# Find process using port 3000
netstat -ano | findstr :3000

# Kill process (Windows)
taskkill /PID <pid> /F
```

### Permission denied on data folder
```bash
# Create data folder with proper permissions
mkdir -p frontend/data
chmod 755 frontend/data
```

### Build fails
```bash
# Clear cache and reinstall
rm -rf node_modules .next
npm install
npm run build
```

---

## Support

For issues, check:
1. DEPLOYMENT.md - Cloud deployment options
2. QUICK_START.md - Feature overview
3. ROLES_AND_PERMISSIONS.md - User roles
