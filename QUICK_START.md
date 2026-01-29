# ⚡ Quick Start Guide

## 🚀 Local Development

### 1. Install Dependencies

```bash
# Backend
cd backend
npm install

# Frontend (in new terminal)
cd frontend
npm install
```

### 2. Setup Environment Variables

**Backend** (`backend/.env`):
```env
PORT=3100
JWT_SECRET=***REMOVED***
ENABLE_SMART_ANALYTICS=true
```

**Frontend** (`frontend/.env`):
```env
VITE_API_URL=http://localhost:3100/api
```

### 3. Initialize Database

Copy the example database file:
```bash
cp backend/src/data/database.json.example backend/src/data/database.json
```

### 4. Run Development Servers

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

### 5. Access Application

- Frontend: http://localhost:3000 (or 3001 if 3000 is busy)
- Backend API: http://localhost:3100

## 👤 Default Credentials

After first run, register a new account. The first user will be assigned the **Manager** role.

## 📦 Build for Production

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
# Output in frontend/dist/
```

## 🌐 Deploy to Cloud

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed cloud deployment instructions.

## 🐛 Troubleshooting

- **Port already in use:** Change PORT in `.env` or kill the process using the port
- **Database not found:** Copy `database.json.example` to `database.json`
- **CORS errors:** Check `VITE_API_URL` matches backend URL
- **Analytics disabled:** Set `ENABLE_SMART_ANALYTICS=true` in backend `.env`

