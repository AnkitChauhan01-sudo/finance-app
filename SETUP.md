# Finance Tracker - Setup Guide

## Prerequisites

- Node.js 18+ installed
- A Clerk account (for authentication)
- A Neon database account (for PostgreSQL)

## Environment Variables

Make sure your `.env` file contains:

```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
DATABASE_URL=your_neon_database_url
```

**Note:** The DATABASE_URL should be a PostgreSQL connection string. If it has quotes or a `psql` prefix, the app will automatically clean it.

## Installation

1. Install dependencies:
```bash
npm install
```

## Database Setup

1. Generate migration files (if needed):
```bash
npm run db:generate
```

2. Push schema to database:
```bash
npm run db:push
```

Alternatively, you can run the SQL migration manually:
```sql
-- Run the SQL in drizzle/0000_init.sql on your Neon database
```

## Running the App

1. Start the development server:
```bash
npm run dev
```

2. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Features

- **Landing Page**: Beautiful landing page with authentication
- **Dashboard**: Add, view, and manage income/expense transactions
- **Charts**: Visualize your finances with pie charts (by category) and bar charts (monthly income vs expenses)
- **Budgets**: Set and track budgets for different categories with progress indicators

## Project Structure

- `app/` - Next.js app directory
  - `page.tsx` - Landing page
  - `dashboard/` - Dashboard with transactions
  - `charts/` - Charts visualization
  - `budgets/` - Budget management
  - `api/` - API routes for transactions and budgets
- `lib/` - Utility files
  - `db.ts` - Database connection
  - `schema.ts` - Database schema definitions
- `middleware.ts` - Clerk authentication middleware

## Authentication

The app uses Clerk for authentication. Users must sign in to access:
- Dashboard
- Charts
- Budgets

The landing page is public and allows users to sign in or sign up.

