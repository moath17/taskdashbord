# Task Management Backend API

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the backend directory:
```
PORT=3100
JWT_SECRET=***REMOVED***
NODE_ENV=development
```

3. Run the development server:
```bash
npm run dev
```

The API will be available at `http://localhost:3100`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user

### Tasks
- `GET /api/tasks` - Get all tasks (with filters: assignedTo, status, priority, search)
- `GET /api/tasks/:id` - Get single task
- `POST /api/tasks` - Create task (requires supervisor/team_lead/admin/manager role)
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task (requires supervisor/team_lead/admin/manager role)
- `POST /api/tasks/:id/comments` - Add comment to task

### Plans
- `GET /api/plans/vacations` - Get all vacation plans
- `GET /api/plans/vacations/:id` - Get single vacation plan
- `POST /api/plans/vacations` - Create vacation plan
- `PUT /api/plans/vacations/:id/status` - Update vacation plan status (admin/manager only)
- `POST /api/plans/vacations/:id/comments` - Add comment to vacation plan
- `GET /api/plans/trainings` - Get all training plans
- `GET /api/plans/trainings/:id` - Get single training plan
- `POST /api/plans/trainings` - Create training plan
- `PUT /api/plans/trainings/:id/status` - Update training plan status (admin/manager only)
- `POST /api/plans/trainings/:id/comments` - Add comment to training plan

### Dashboard
- `GET /api/dashboard` - Get dashboard statistics

### Users
- `GET /api/users` - Get all users (requires admin/manager/supervisor/team_lead role)
- `GET /api/users/:id` - Get single user

