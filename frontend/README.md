# Task Dashboard - Frontend

Next.js 14 application for Task Management & Employee Planning System.

See main [README.md](../README.md) for complete documentation.

## Quick Commands

```bash
# Development
npm run dev        # Start dev server at http://localhost:3001

# Production
npm run build      # Build for production
npm start          # Start production server
```

## Environment Setup

Copy `.env.example` to `.env.local` and configure:

```bash
cp .env.example .env.local
```

Required for production:
- `JWT_SECRET` - Secure random key for authentication
- `NEXT_PUBLIC_APP_URL` - Application URL

Optional:
- `RESEND_API_KEY` - Email service for invitations
- `NEXT_PUBLIC_SUPABASE_URL` - Cloud database
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase key
