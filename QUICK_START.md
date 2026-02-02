# ⚡ Quick Start Guide

## 🚀 Local Development (On-Premises Deployment)

### 1. Install Dependencies

```bash
cd frontend
npm install
```

### 2. Setup Environment Variables (Optional)

**Frontend** (`frontend/.env.local`) - Only needed for Supabase:
```env
# Optional - If not set, local file-based database will be used
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-key

# Optional - For sending emails
RESEND_API_KEY=your-resend-api-key

# Optional - App URL for invite links
NEXT_PUBLIC_APP_URL=http://localhost:3001
```

**Note:** The system works without any environment variables using local file-based storage.

### 3. Run Development Server

```bash
cd frontend
npm run dev
```

### 4. Access Application

- Application: http://localhost:3001
- First user registration creates an **Owner** account

## 👤 User Roles

| Role | Description |
|------|-------------|
| **Owner** | Organization owner - creates Admins and Employees only |
| **Manager (Admin)** | Full access to all features - tasks, goals, KPIs, reports |
| **Employee** | View assigned tasks, update status, view goals |

## 📦 Build for Production

```bash
cd frontend
npm run build
npm start
```

## 🌐 On-Premises Deployment

### Prerequisites
- Node.js 18+
- npm or yarn

### Steps

1. **Clone repository**
   ```bash
   git clone <repository-url>
   cd taskdashbord-1/frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Build for production**
   ```bash
   npm run build
   ```

4. **Start server**
   ```bash
   npm start
   ```

5. **Access application**
   - Default: http://localhost:3001

### Using PM2 (Recommended for production)

```bash
npm install -g pm2
pm2 start npm --name "task-dashboard" -- start
pm2 save
pm2 startup
```

## 🔐 First-Time Setup

1. Go to http://localhost:3001/register
2. Register your organization (you become the Owner)
3. Create Admin and Employee accounts from Owner dashboard
4. Users receive invite links to set their passwords

## 🐛 Troubleshooting

- **Port already in use:** Edit `package.json` to change port in dev script
- **Data not saving:** Check `frontend/data/` folder permissions
- **Invite links not working:** Set `NEXT_PUBLIC_APP_URL` in `.env.local`
- **Email not sending:** Set `RESEND_API_KEY` or use the shown invite link

## 📁 Data Storage

By default, data is stored in `frontend/data/` folder:
- `local-auth.json` - Organizations and users
- `local-db.json` - Tasks, goals, KPIs, etc.
- `invites.json` - Pending invitations
- `notifications.json` - User notifications

**Note:** These files are excluded from git for security.
