# Shepherd Insight - Architecture Documentation

## Overview

Shepherd Insight is a Next.js 14 application that helps users transform ideas into actionable insights. The platform provides tools for gathering requirements, generating insights, and managing project knowledge.

## Tech Stack

### Frontend
- **Next.js 14** with App Router and TypeScript
- **TailwindCSS** for styling with custom design system
- **Zustand** for client-side state management
- **shadcn/ui** component patterns

### Data Layer
- **Supabase** (Postgres + Auth) - Primary database and authentication
- **In-memory storage** (Zustand) - Temporary until full Supabase integration

### AI/External Services
- **Firecrawl** - Web scraping and competitor data gathering
- **Groq** - AI synthesis and analysis

### Deployment
- **Vercel** - Next.js app hosting and serverless functions
- **Supabase** - Database and authentication hosting

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes (server actions)
│   │   ├── firecrawl/     # Firecrawl integration endpoints
│   │   ├── groq/         # Groq AI integration endpoints
│   │   └── supabase/     # Supabase integration endpoints
│   ├── account/          # Account management page
│   ├── dashboard/        # Main dashboard
│   ├── exports/          # Export functionality
│   ├── intake/           # New insight creation
│   ├── insight/          # Individual insight viewer
│   ├── mindmap/          # Visual mind mapping
│   ├── vault/            # Project library/search
│   ├── globals.css       # Global styles and Tailwind
│   ├── layout.tsx        # Root layout with sidebar
│   └── page.tsx          # Home page
├── components/            # Reusable UI components
│   ├── ui/              # Shared UI primitives
│   │   ├── button.tsx   # Button component with variants
│   │   ├── card.tsx     # Card layout components
│   │   ├── badge.tsx    # Status badge component
│   │   ├── input.tsx    # Form input component
│   │   └── textarea.tsx # Multi-line text input
│   └── sidebar.tsx       # Navigation sidebar
├── lib/                   # Utilities and shared logic
│   ├── constants.ts      # App constants and navigation
│   ├── env.example.ts    # Environment variables template
│   ├── export.ts         # Export utilities
│   ├── store.ts          # Zustand store setup
│   ├── time.ts           # Time formatting utilities
│   └── utils.ts          # General utility functions
└── types/                # TypeScript type definitions
    └── project.ts        # Project and insight data structures
```

## Data Flow

### Current State (In-Memory)
- **Dashboard**: Uses mock data (hardcoded in the component). This will later be loaded from Supabase via a server action in `/app/api/projects`.
- **Intake**: Writes into Zustand store. Later, this will POST to `/app/api/projects` which will persist to Supabase.
- **State Management**: All temporary data stored in Zustand store
- **Persistence**: No persistence between sessions
- **Purpose**: Used for development and initial prototyping

### Future State (Supabase Integration)
1. **Authentication**: Supabase Auth for user management
2. **Projects**: Stored in Supabase PostgreSQL tables
3. **Versions**: Version history and iteration tracking
4. **Insights**: Generated content and analysis results

## API Integration Points

### Firecrawl Integration (`/api/firecrawl`)
- **Purpose**: Scrape competitor data and web content
- **Status**: Placeholder implementation
- **Future**: Full web scraping and content extraction

### Groq Integration (`/api/groq`)
- **Purpose**: AI-powered synthesis and analysis
- **Status**: Placeholder implementation
- **Future**: Generate insights, summarize content, provide recommendations

### Supabase Integration (`/api/supabase`)
- **Purpose**: Database operations and authentication
- **Status**: Placeholder implementation
- **Future**: CRUD operations for projects, versions, and user data

## Deployment Strategy

### Development
- Local development with Next.js dev server
- Environment variables from `.env.local`
- In-memory data storage via Zustand

### Production
- **Frontend**: Deployed to Vercel
- **Database**: Supabase hosted PostgreSQL
- **Environment**: Variables injected at deploy time
- **APIs**: Serverless functions on Vercel, external APIs via API keys

## Environment Variables

Copy `src/lib/env.example.ts` and configure:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# AI Services
GROQ_API_KEY=your_groq_api_key
FIRECRAWL_API_KEY=your_firecrawl_api_key

# App Configuration
NEXT_PUBLIC_APP_URL=your_app_url
NODE_ENV=production
```

## Getting Started

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Set up environment**:
   ```bash
   cp src/lib/env.example.ts src/lib/env.ts
   # Edit src/lib/env.ts with your actual values
   ```

3. **Run development server**:
   ```bash
   npm run dev
   ```

4. **Build for production**:
   ```bash
   npm run build
   ```

## Migration Path

The architecture is designed to support seamless migration from in-memory storage to full Supabase integration:

1. **Phase 1**: Current state with Zustand and placeholders
2. **Phase 2**: Add Supabase client and basic CRUD operations
3. **Phase 3**: Migrate data models and implement full persistence
4. **Phase 4**: Add real-time features and advanced functionality

## Component Architecture

### Layout System
- **Root Layout**: `app/layout.tsx` provides sidebar navigation and global structure
- **Page Layouts**: Individual pages handle their specific layout needs
- **Responsive Design**: Mobile-first approach with TailwindCSS

### State Management
- **Client State**: Zustand for UI state and temporary data
- **Draft Data**: Current intake form data stored in `currentDraftVersionData`
- **Form State**: Local React state for intake form, synced to Zustand on submit
- **Server State**: React Query (future) for server data fetching

## Performance Considerations

- **Code Splitting**: Next.js automatic code splitting by routes
- **Image Optimization**: Next.js Image component (future)
- **Bundle Analysis**: Webpack bundle analyzer for optimization
- **Caching**: Appropriate caching strategies for API calls
