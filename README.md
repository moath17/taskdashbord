# Task Management & Employee Planning System

نظام إدارة المهام وتخطيط الموظفين - Task Dashboard

A comprehensive task management and planning platform for organizations with focus on tasks, performance tracking, and employee development plans.

## 🚀 Features

### Core Features
- **Task Management** - Kanban board, Table view, Calendar view with drag & drop
- **Goal Management** - Annual Goals and MBO (Management by Objectives) Goals
- **KPI Tracking** - Key Performance Indicators with achievement percentages
- **Employee Plans** - Vacation and training plan management
- **Dashboard** - Comprehensive overview with charts and statistics

### Additional Features
- 📅 **Calendar Widget** - Displays holidays, training, tasks, and vacations
- 📊 **Weekly Updates** - Manager-only view for weekly progress tracking
- 💡 **Proposals/Suggestions** - Team suggestions and recommendations
- 📰 **Customizable News Widget** - News from multiple categories (Tech, Business, etc.)
- ✨ **Daily Quotes** - Motivational quotes in Arabic and English
- 📥 **Excel Export** - Export all data with formatted styling
- 🧠 **Smart Analytics** - AI-powered risk analysis, predictions, and workload insights
- 🌐 **Bilingual Support** - Full Arabic and English support with RTL layout

## 🛠️ Tech Stack

- **Framework**: Next.js 14 with TypeScript
- **Styling**: Tailwind CSS
- **Charts**: ApexCharts
- **Database**: Local file-based (JSON) or Supabase
- **Authentication**: JWT with bcrypt
- **Email**: Resend API (optional)
- **Icons**: Lucide React

## 📁 Project Structure

```
project/
├── frontend/
│   ├── src/
│   │   ├── app/              # Next.js App Router pages & API routes
│   │   │   ├── api/          # API endpoints
│   │   │   ├── (protected)/  # Protected pages
│   │   │   └── ...
│   │   ├── components/       # React components
│   │   ├── context/          # React contexts (Auth, Language)
│   │   ├── lib/              # Database & utilities
│   │   ├── locales/          # Translations (ar.ts, en.ts)
│   │   ├── types/            # TypeScript types
│   │   └── views/            # Page view components
│   ├── data/                 # Local database files (gitignored)
│   └── package.json
├── QUICK_START.md
├── DEPLOYMENT.md
└── README.md
```

## 🔧 Quick Start

```bash
# Install dependencies
cd frontend
npm install

# Run development server
npm run dev

# Access at http://localhost:3001
```

See **[QUICK_START.md](./QUICK_START.md)** for detailed instructions.

### 📚 Documentation
- [docs/STRUCTURE.md](./docs/STRUCTURE.md) - Project structure | هيكل المشروع
- [docs/CODE_GUIDE.md](./docs/CODE_GUIDE.md) - Code explanations | شرح الكود
- [docs/SECURITY.md](./docs/SECURITY.md) - Security checklist | نصائح الأمان

## 👥 User Roles

| Role | Permissions |
|------|-------------|
| **Owner** | Organization management - Create Admins & Employees only |
| **Admin (Manager)** | Full access - Tasks, Goals, KPIs, Plans, Analytics, User Management |
| **Employee** | Limited access - Own tasks, update status, view goals/KPIs |

## 🔐 Authentication Flow

1. **Owner Registration** - First user registers organization
2. **User Invitation** - Owner creates users (email only, no password)
3. **Password Setup** - Users receive invite link to set password
4. **Password Recovery** - Forgot password flow with email link

## 📊 API Endpoints

### Auth
- `POST /api/auth/register` - Register organization (Owner)
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password

### Team Management
- `GET /api/team` - Get team members
- `POST /api/team` - Create team member (sends invite)

### Tasks
- `GET /api/tasks` - Get tasks (filtered by role)
- `POST /api/tasks` - Create task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task

### Goals
- `GET /api/goals/annual` - Get annual goals
- `POST /api/goals/annual` - Create annual goal
- `GET /api/goals/mbo` - Get MBO goals
- `POST /api/goals/mbo` - Create MBO goal

### Analytics
- `GET /api/analytics/status` - Check analytics status
- `GET /api/analytics/dashboard` - Get analytics dashboard
- `GET /api/analytics/workload` - Get workload analysis

## 🚀 Deployment

### On-Premises Deployment

```bash
cd frontend
npm install
npm run build
npm start
```

### Using PM2

```bash
npm install -g pm2
cd frontend
npm run build
pm2 start npm --name "task-dashboard" -- start
```

See **[DEPLOYMENT.md](./DEPLOYMENT.md)** for cloud deployment options.

## 📝 License

This project is private and proprietary.

## 👨‍💻 Developer

Built with ❤️ for efficient task and employee management.
