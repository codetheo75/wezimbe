# Wezimbe - Community Savings Platform

A modern fintech platform that allows communities to pool money, invest together, and manage shared assets transparently.

## Features

- **Community Savings Groups** - Create and manage savings groups with your community
- **Transparent Tracking** - Monitor contributions and group balance in real-time
- **Collective Investment** - Pool resources to invest in shared assets
- **Democratic Governance** - Vote on group decisions with transparent voting
- **Asset Management** - Track ownership percentages of shared assets
- **Analytics** - View portfolio growth and performance metrics

## Tech Stack

- **Frontend**: Next.js 16 + React 19 + TypeScript
- **Styling**: Tailwind CSS + Shadcn/UI
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Charts**: Recharts

## Project Structure

```
├── app/
│   ├── (auth)/              # Authentication pages (sign-in, sign-up)
│   ├── (app)/               # Protected app pages
│   │   ├── dashboard/
│   │   ├── groups/
│   │   ├── assets/
│   │   ├── governance/
│   │   └── analytics/
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── components/              # Reusable components
├── lib/
│   ├── supabase/           # Supabase client configuration
│   ├── types.ts            # TypeScript types
│   └── utils.ts
├── scripts/
│   └── init-db.js          # Database initialization script
├── middleware.ts            # Auth middleware
└── Configuration files (package.json, tsconfig.json, etc.)
```

## Getting Started

### Prerequisites

- Node.js 18+ with npm, pnpm, or yarn
- Supabase project with auth enabled

### Environment Variables

Ensure these are set in your Vercel project:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### Installation & Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Initialize the database:**
   ```bash
   npm run init-db
   ```
   This creates all necessary tables, indexes, and Row Level Security (RLS) policies.

3. **Run the development server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

## Database Schema

### Core Tables

- **users** - User profiles linked to Supabase auth
- **groups** - Savings groups created by users
- **group_members** - Membership records with contribution tracking
- **contributions** - Individual contributions to groups
- **assets** - Shared assets owned by groups
- **asset_ownership** - Ownership percentages for each asset
- **proposals** - Governance proposals for group voting
- **votes** - Vote records on proposals
- **transactions** - Transaction ledger for all monetary movements

All tables have Row Level Security (RLS) enabled to ensure data privacy.

## Authentication

Uses Supabase Auth with email/password. Users are created in the auth system and linked to user profiles in the database.

## Deployment

Deploy to Vercel with environment variables set in project settings.
