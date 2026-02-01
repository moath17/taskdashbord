# Task Management & Employee Planning System

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
- 📰 **Tech News Widget** - Latest AI and Data Science updates
- ✨ **Daily Quotes** - Motivational quotes in Arabic and English
- 📥 **Excel Export** - Export all data with formatted styling
- 🧠 **Smart Analytics** - AI-powered risk analysis, predictions, and workload insights (Read-only decision support)

## 🛠️ Tech Stack

### Backend
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: JSON file-based (ready for migration to MySQL/PostgreSQL)
- **Authentication**: JWT with bcrypt
- **Validation**: express-validator

### Frontend
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Charts**: ApexCharts
- **HTTP Client**: Axios
- **Date Handling**: date-fns
- **Notifications**: react-hot-toast

## 📁 Project Structure

```
taskdashbord/
├── backend/
│   ├── src/
│   │   ├── index.ts           # Server entry point
│   │   ├── middleware/        # Auth middleware
│   │   ├── models/            # Database management
│   │   ├── routes/            # API routes
│   │   │   ├── auth.ts
│   │   │   ├── calendar.ts
│   │   │   ├── dashboard.ts
│   │   │   ├── goals.ts
│   │   │   ├── kpis.ts
│   │   │   ├── plans.ts
│   │   │   ├── proposals.ts
│   │   │   ├── tasks.ts
│   │   │   ├── users.ts
│   │   │   └── weekly-updates.ts
│   │   ├── analytics/         # Smart Analytics module
│   │   │   ├── analytics.routes.ts
│   │   │   ├── analytics.service.ts
│   │   │   └── analytics.types.ts
│   │   ├── types/             # TypeScript types
│   │   └── utils/             # Utilities
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── api/               # API clients
│   │   ├── components/        # React components
│   │   │   ├── CalendarWidget.tsx
│   │   │   ├── DailyQuote.tsx
│   │   │   ├── Layout.tsx
│   │   │   ├── ProposalsWidget.tsx
│   │   │   ├── TechNewsWidget.tsx
│   │   │   ├── plans/
│   │   │   └── tasks/
│   │   ├── context/           # Auth context
│   │   ├── pages/             # Page components
│   │   │   ├── Dashboard.tsx
│   │   │   ├── Goals.tsx
│   │   │   ├── KPIs.tsx
│   │   │   ├── Plans.tsx
│   │   │   ├── Tasks.tsx
│   │   │   ├── UserManagement.tsx
│   │   │   ├── WeeklyUpdates.tsx
│   │   │   └── Analytics.tsx
│   │   ├── types/             # TypeScript types
│   │   └── utils/             # Utilities
│   └── package.json
│
└── README.md
```

## 🔧 Installation & Setup

### Prerequisites
- Node.js 18+ installed
- npm or yarn package manager

### Backend Setup

```bash
cd backend
npm install
npm run dev
```

The backend runs on `http://localhost:3100`

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The frontend runs on `http://localhost:3001`

## 👥 User Roles

| Role | Permissions |
|------|-------------|
| **Manager** | Full access - Dashboard, Tasks, Goals, KPIs, Plans, Calendar, Weekly Updates, User Management, Proposals |
| **Employee** | Limited access - View own tasks, Submit plans, View suggestions |

**Note**: Only one Manager account can be registered in the system.

## 🔐 Authentication

1. Register a new account (first user as Manager)
2. Login with email and password
3. JWT token stored in localStorage

## 📊 API Endpoints

### Auth
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user

### Tasks
- `GET /api/tasks` - Get all tasks
- `POST /api/tasks` - Create task (Manager)
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task (Manager)

### Goals
- `GET /api/goals/annual` - Get annual goals
- `POST /api/goals/annual` - Create annual goal
- `GET /api/goals/mbo` - Get MBO goals
- `POST /api/goals/mbo` - Create MBO goal

### KPIs
- `GET /api/kpis` - Get all KPIs
- `POST /api/kpis` - Create KPI
- `PUT /api/kpis/:id` - Update KPI

### Dashboard
- `GET /api/dashboard` - Get dashboard statistics

### Analytics (Smart Analytics Module)
- `GET /api/analytics/status` - Check analytics module status
- `GET /api/analytics/dashboard` - Get comprehensive analytics dashboard
- `GET /api/analytics/goals-risk` - Get risk analysis for all goals
- `GET /api/analytics/goals-risk/:id` - Get risk analysis for specific goal
- `GET /api/analytics/workload` - Get workload analysis (Managers only)
- `GET /api/analytics/high-risk` - Get high-risk goals
- `GET /api/analytics/predictions` - Get completion predictions

## 🚀 Deployment

### Production Build

**Backend:**
```bash
cd backend
npm run build
npm start
```

**Frontend:**
```bash
cd frontend
npm run build
```

The build output will be in `frontend/dist/`

### Environment Variables

Create `.env` file in backend:
```env
PORT=3100
JWT_SECRET=your-secret-key
ENABLE_SMART_ANALYTICS=true
```

Create `.env` file in frontend:
```env
VITE_API_URL=http://localhost:3100/api
```

## 📝 License

This project is private and proprietary.

## 👨‍💻 Developer

Built with ❤️ for efficient task and employee management.
