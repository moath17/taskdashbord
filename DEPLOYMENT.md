# 🚀 Cloud Deployment Guide

## Prerequisites

- Node.js 18+ installed
- Git installed
- Cloud hosting account (Vercel, Netlify, Railway, Heroku, etc.)

## 📦 Pre-Deployment Checklist

### ✅ Security
- [x] `.env` files are in `.gitignore`
- [x] `database.json` is in `.gitignore` (contains sensitive data)
- [x] `.cursor/` folder is ignored
- [x] Debug logs are ignored

### ✅ Files to Commit
- [x] All source code files
- [x] `package.json` and `package-lock.json`
- [x] `tsconfig.json`
- [x] `README.md`
- [x] `.gitignore` (root and subdirectories)
- [x] `database.json.example` (template file)

### ❌ Files NOT to Commit
- `node_modules/` (auto-ignored)
- `.env` files (auto-ignored)
- `database.json` (contains passwords - auto-ignored)
- `dist/` or `build/` folders
- `.cursor/debug.log`

## 🔧 Environment Variables Setup

### Backend Environment Variables

Create `.env` file in `backend/` directory:

```env
PORT=3100
JWT_SECRET=your-strong-secret-key-change-this-in-production
ENABLE_SMART_ANALYTICS=true
NODE_ENV=production
```

**Important:** 
- Use a strong, random JWT_SECRET in production
- Never commit `.env` files to Git

### Frontend Environment Variables

Create `.env` file in `frontend/` directory:

```env
VITE_API_URL=https://your-backend-api-url.com/api
```

## 🌐 Deployment Options

### Option 1: Vercel (Recommended for Frontend)

**Frontend:**
1. Install Vercel CLI: `npm i -g vercel`
2. Navigate to `frontend/` directory
3. Run: `vercel`
4. Set environment variable: `VITE_API_URL=https://your-backend-url.com/api`

**Backend:**
- Use Railway, Render, or Heroku (see below)

### Option 2: Railway (Recommended for Full Stack)

1. Connect your GitHub repository
2. Create two services:
   - **Backend Service:**
     - Root Directory: `backend`
     - Build Command: `npm install && npm run build`
     - Start Command: `npm start`
     - Environment Variables: Add all backend env vars
   
   - **Frontend Service:**
     - Root Directory: `frontend`
     - Build Command: `npm install && npm run build`
     - Start Command: `npm run preview` (or use static hosting)
     - Environment Variables: `VITE_API_URL=https://your-backend-url.railway.app/api`

### Option 3: Render

**Backend:**
1. Create new Web Service
2. Connect GitHub repository
3. Root Directory: `backend`
4. Build: `npm install && npm run build`
5. Start: `npm start`
6. Add environment variables

**Frontend:**
1. Create new Static Site
2. Root Directory: `frontend`
3. Build: `npm install && npm run build`
4. Publish Directory: `dist`
5. Add environment variable: `VITE_API_URL`

### Option 4: Heroku

**Backend:**
```bash
cd backend
heroku create your-app-name
heroku config:set JWT_SECRET=your-secret
heroku config:set ENABLE_SMART_ANALYTICS=true
git subtree push --prefix backend heroku main
```

**Frontend:**
- Deploy to Vercel or Netlify (better for static sites)

## 📝 Database Setup

### For Production (Recommended)

The current setup uses a JSON file database, which is **NOT suitable for production**. 

**Migration Options:**

1. **MongoDB Atlas** (Recommended)
   - Free tier available
   - Easy migration path
   - Update `backend/src/models/database.ts` to use MongoDB

2. **PostgreSQL** (via Supabase or Railway)
   - Robust and scalable
   - Requires schema migration

3. **MySQL** (via PlanetScale or Railway)
   - Traditional SQL database
   - Requires schema migration

### Current JSON Database (Development Only)

If you must use JSON database temporarily:
1. Copy `backend/src/data/database.json.example` to `backend/src/data/database.json`
2. Initialize with empty data
3. **Warning:** JSON database is not suitable for production - data loss risk

## 🔐 Security Checklist

- [ ] Change default JWT_SECRET to a strong random string
- [ ] Enable HTTPS in production
- [ ] Set CORS to only allow your frontend domain
- [ ] Use environment variables for all secrets
- [ ] Enable rate limiting on API endpoints
- [ ] Migrate from JSON database to proper database
- [ ] Set up proper error logging (avoid exposing stack traces)

## 🧪 Post-Deployment Testing

1. **Test Authentication:**
   - Register a new user
   - Login
   - Verify JWT token is stored

2. **Test API Endpoints:**
   - Create a task
   - Create a goal
   - Test Analytics module (if enabled)

3. **Test Frontend:**
   - Verify all pages load
   - Test language switching (AR/EN)
   - Test RTL layout

## 📊 Monitoring

Consider setting up:
- **Error Tracking:** Sentry, LogRocket
- **Analytics:** Google Analytics, Plausible
- **Uptime Monitoring:** UptimeRobot, Pingdom

## 🐛 Troubleshooting

### Backend won't start
- Check environment variables are set
- Verify PORT is not in use
- Check database file exists (if using JSON)

### Frontend can't connect to API
- Verify `VITE_API_URL` is correct
- Check CORS settings in backend
- Verify backend is running

### Analytics module disabled
- Set `ENABLE_SMART_ANALYTICS=true` in backend `.env`

## 📚 Additional Resources

- [Vercel Deployment Docs](https://vercel.com/docs)
- [Railway Docs](https://docs.railway.app)
- [Render Docs](https://render.com/docs)

---

**Note:** This project uses a JSON file database for development. **Migrate to a proper database (MongoDB, PostgreSQL) before production deployment.**

