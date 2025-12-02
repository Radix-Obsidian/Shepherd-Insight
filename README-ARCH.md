# ShepLight — Architecture Documentation

> Technical architecture and design decisions for the ShepLight platform.

## Overview

ShepLight is a Next.js 14 application that guides founders through the UX research process using AI. The platform implements the **Shepherd Journey** — a 3-step flow from idea clarity to actionable MVP blueprint.

### Design Philosophy

We follow the **Golden Sheep AI Methodology**:

1. **Customer-Backwards Design** — Start with user transformation, work backwards to technology
2. **Vertical Slice Delivery** — Build complete features end-to-end
3. **Zero-Placeholder Policy** — Real data, real AI responses, no mocks in production
4. **Evidence-Driven Development** — Every decision backed by user research

### Primary Audience

- **Women in tech founders** who need a research-led partner to translate their vision into a roadmap.
- **Non-technical operators** who want confident decision making without hiring a full UX team.

## Tech Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| **Next.js 14** | App Router, RSC, API routes |
| **TypeScript** | Type safety across the stack |
| **Tailwind CSS** | Utility-first styling |
| **Zustand** | Client-side state management |
| **ReactFlow** | Mind map visualization |
| **Lucide** | Icon system |

### Backend
| Technology | Purpose |
|------------|---------|
| **Supabase** | PostgreSQL + Auth + RLS |
| **Groq SDK** | AI inference (Llama 3.3, GPT-OSS) |
| **Firecrawl** | Web research and competitor analysis |
| **Zod** | Runtime validation |

### Infrastructure
| Technology | Purpose |
|------------|---------|
| **Vercel** | Hosting + Serverless functions |
| **Supabase Cloud** | Database hosting |
| **GitHub Actions** | CI/CD (planned) |

## Project Structure

```
src/
├── app/                        # Next.js App Router
│   ├── api/                    # API Routes
│   │   ├── engine/             # Shepherd Engine APIs
│   │   │   ├── clarity/        # Compass API
│   │   │   ├── research/       # Muse API
│   │   │   └── blueprint/      # Blueprint API
│   │   ├── auth/               # Supabase Auth
│   │   └── mindmap/            # Mind map generation
│   ├── compass/                # 🧭 Step 1: Idea Clarity
│   ├── muse/                   # 🎭 Step 2: User Research
│   ├── blueprint/              # 📐 Step 3: MVP Planning
│   ├── mindmap/                # 🗺️ Visual Strategy (auto-generated from journey data)
│   ├── vault/                  # 🔒 Decision Vault
│   ├── dashboard/              # Project Dashboard
│   ├── exports/                # Export Functionality
│   └── account/                # User Account
├── components/                 # React Components
│   ├── ui/                     # Design System
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   └── ...
│   ├── logo.tsx                # ShepLight Logo
│   ├── sidebar.tsx             # Navigation
│   └── journey-progress.tsx    # Journey Tracker
├── lib/                        # Core Libraries
│   ├── engine/                 # 🐑 Shepherd Engine
│   │   ├── groq-client.ts      # AI Client
│   │   ├── insight-reasoner.ts # Compass Logic
│   │   ├── persona-synth.ts    # Muse Logic
│   │   ├── blueprint-composer.ts # Blueprint Logic
│   │   └── types.ts            # Engine Types
│   ├── research/               # Research Tools
│   │   └── firecrawl-client.ts # Web Research
│   ├── store.ts                # Zustand State
│   ├── supabase.ts             # DB Client
│   └── utils.ts                # Utilities
└── types/                      # TypeScript Types
```

## Core Architecture: The Shepherd Engine

The **Shepherd Engine** is ShepLight's unified AI core that powers all three journey steps.

### Engine Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                     SHEPHERD ENGINE                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐        │
│  │   Insight   │───▶│   Persona   │───▶│  Blueprint  │        │
│  │  Reasoner   │    │   Synth     │    │  Composer   │        │
│  └─────────────┘    └─────────────┘    └─────────────┘        │
│        │                  │                  │                 │
│        ▼                  ▼                  ▼                 │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐        │
│  │   Clarity   │    │  Research   │    │  Blueprint  │        │
│  │   Output    │    │   Output    │    │   Output    │        │
│  └─────────────┘    └─────────────┘    └─────────────┘        │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │   Groq Client   │
                    │  (Multi-model)  │
                    └─────────────────┘
```

### AI Model Strategy

```typescript
// Primary model with automatic fallback
const models: GroqModel[] = [
  'llama-3.3-70b-versatile',  // Primary: Best quality
  'openai/gpt-oss-120b',      // Fallback 1: Alternative
  'llama-3.1-8b-instant',     // Fallback 2: Fast
]
```

### Data Persistence

| Session Type | Table | Relationships |
|--------------|-------|---------------|
| Clarity | `clarity_sessions` | → user_id |
| Research | `research_sessions` | → clarity_id |
| Blueprint | `blueprint_sessions` | → clarity_id, research_id |

All tables use **Row Level Security (RLS)** — users can only access their own data.

## API Integration Points

### Firecrawl Integration (`/api/firecrawl`)
- **Purpose**: Scrape competitor data and web content
- **Status**: Placeholder implementation
- **Future**: Full web scraping and content extraction

### Groq Integration (`/api/groq`)
- **Purpose**: AI-powered synthesis and analysis
- **Status**: Mock implementation for testing
- **Features**: Project analysis, market insights, feature enhancement recommendations
- **Future**: Replace mocks with real Groq API integration

### Firecrawl Integration (`/api/firecrawl`)
- **Purpose**: Web scraping and competitor research
- **Status**: Mock implementation for testing
- **Features**: Competitor analysis, market research, feature benchmarking
- **Future**: Replace mocks with real Firecrawl API integration

### Supabase Integration (`/api/supabase`)
- **Purpose**: Database operations and authentication
- **Status**: Fully implemented with optimistic updates
- **Features**: Project CRUD, version management, authentication, RLS policies
- **Optimistic Updates**: Immediate UI updates with background sync

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

## Current Architecture (Implemented)

The application now uses a **hybrid architecture** combining Supabase and Zustand for optimal performance and user experience:

### Supabase (Remote Database)
- **User Authentication**: Supabase Auth for secure user management
- **Project Data**: Persistent storage of projects and versions
- **Row Level Security**: Database-level access control
- **Real-time Sync**: Future real-time features

### Zustand (Local State Management)
- **Optimistic Updates**: Instant UI updates with background sync
- **UI State**: Loading states, form data, error handling
- **Caching**: Local project cache for performance
- **Session Management**: Authentication state and user context

## Migration Path (Updated)

The hybrid architecture supports seamless evolution:

1. **Phase 1** ✅ **Complete**: Supabase integration with optimistic updates
2. **Phase 2** ✅ **Complete**: Enhanced caching and real-time features
3. **Phase 3** ✅ **Complete**: Advanced AI integration and analytics

## Post-MVP Features

Future features are documented in `docs/future-features/`:
- **Phase 4**: Multi-user collaboration and enterprise features
- **Phase 5**: Analytics dashboard and advanced integrations

## Component Architecture

### Layout System
- **Root Layout**: `app/layout.tsx` provides sidebar navigation and global structure
- **Page Layouts**: Individual pages handle their specific layout needs
- **Responsive Design**: Mobile-first approach with TailwindCSS

### State Management (Hybrid)
- **Authentication State**: Zustand manages user sessions and auth status
- **Optimistic Updates**: Immediate UI updates with background Supabase sync
- **Project Cache**: Zustand caches Supabase data for performance
- **Form State**: Local React state with real-time Supabase persistence
- **Error Handling**: Graceful degradation and user feedback

### Mind Map Page
- **Purpose**: Visualize the Shepherd Journey outcomes without extra prompting.
- **Current State**: Automatically builds nodes/edges from Compass (clarity), Muse (personas/pains), and Blueprint (features) data when a project + version is provided in the URL. Falls back to the legacy AI modal only when journey data is absent.
- **Escapes**: Regenerate button enforces customer data as the source of truth, Reset returns to blank canvas.
- **Next**: Persist manual edits to Supabase for collaboration.

### Vault Page
- **Purpose**: Display "locked decisions" - the final truth for development
- **Current State**: Pulls data from both Supabase versions and draft data
- **Features**:
  - Project/Version selector dropdown
  - Color-coded decision sections (green for must-haves, gray for not-now, yellow for constraints)
  - Export functionality for development briefs
  - Version history and timestamps
- **Future State**: Will persist vault exports to Supabase for team sharing

## Performance Considerations

- **Code Splitting**: Next.js automatic code splitting by routes
- **Image Optimization**: Next.js Image component (future)
- **Bundle Analysis**: Webpack bundle analyzer for optimization
- **Caching**: Appropriate caching strategies for API calls

---

## Multi-Project Versioning Architecture (Phase 7 - Complete)

### Local Versioning Implementation

Shepherd Insight now supports full multi-project versioning via Zustand state management:

**URL Contract**:
```
/insight?projectId=<id>&versionId=<id>
/vault?projectId=<id>&versionId=<id>
/mindmap?projectId=<id>&versionId=<id>
/exports?projectId=<id>&versionId=<id>
```

This URL structure is stable and will remain consistent when backend persistence is fully integrated.

**Store Functions** (`src/lib/store.ts`):
- `createProjectFromIntake(formData)` - Creates project with v1 from intake form
- `cloneVersion(projectId, versionId)` - Duplicates version with incremented version number
- `getProjectVersion(projectId, versionId)` - Retrieves specific version by IDs

**Version Management UI**:
- Version dropdown on Insight page showing all versions
- "Create New Version" button for forking
- Dashboard links to latest version of each project
- All tabs maintain URL params for consistent context

**Production Mapping**:
In production, this will map to:
- `projects` table in Supabase
- `versions` table (or `spec_entries` equivalent)
- URL params will continue to work for deep linking
- Version history will be persisted and synced

---

## Export Functionality (Phase 6 - Complete)

### Markdown & PDF Export

**Implementation** (`src/lib/export.ts`):
- `buildMarkdown(versionData)` - Generates formatted Markdown with all project details
- `downloadFile({ filename, content, mimeType })` - Triggers client-side file download

**Export Content Includes**:
1. Project Name & Version Number
2. Problem Summary
3. Target Persona
4. Our Promise/Positioning
5. Pain Points (synthesized)
6. MVP Features (Must-Haves)
7. Out of Scope (Not Now)
8. Constraints
9. Positioning Line
10. Mind Map Reference
11. Timestamp

**Future Enhancement**:
PDF export will be upgraded to use server-side rendering via `/api/export/pdf` endpoint with proper formatting and styling. Current prototype exports Markdown content as text file with .pdf extension.

---

## Deployment Plan

### Frontend Deployment (Vercel)

**Current Setup**:
```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

**Environment Variables Required**:
```
NEXT_PUBLIC_SUPABASE_URL=<your-supabase-url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
GROQ_API_KEY=<your-groq-key>
FIRECRAWL_API_KEY=<your-firecrawl-key>
FIRECRAWL_WEBHOOK_SECRET=<your-webhook-secret>
NEXT_PUBLIC_APP_URL=<your-production-url>
```

**Vercel Configuration**:
1. Connect GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Configure build settings:
   - Build Command: `npm run build`
   - Output Directory: `.next`
   - Install Command: `npm install`
4. Enable automatic deployments on push to `main`

### Database Deployment (Supabase)

**Supabase Setup**:
1. Create new project at supabase.com
2. Run migrations: `supabase db push`
3. Enable Row Level Security (RLS) policies
4. Configure authentication providers
5. Set up Edge Functions for secure API key management

**Database Schema**:
- `projects` - Project metadata
- `versions` - Version history and data
- `insights` - AI-generated insights
- `insight_jobs` - Background job tracking

**RLS Policies**:
- Users can only access their own projects
- Users can create/update their own data
- Webhook endpoints use service role key

### API Routes Configuration

**Server-Side Routes** (`/app/api/`):
- `/api/auth` - Supabase authentication
- `/api/supabase` - Database operations
- `/api/research/run` - AI research workflow
- `/api/mindmap/generate` - AI mind map generation
- `/api/webhooks/firecrawl` - Firecrawl webhook handler

**Future Routes**:
- `/api/export/pdf` - Server-rendered PDF generation
- `/api/analytics` - Usage analytics (Phase 5)
- `/api/collaboration` - Multi-user features (Phase 4)

### Production Checklist

- [x] Environment variables configured
- [x] Next.js build optimized
- [x] ESLint and Prettier configured
- [x] React Strict Mode enabled
- [x] Error boundaries implemented
- [x] Loading states for async operations
- [x] Responsive design (mobile + desktop)
- [x] Accessibility (labels, semantic HTML)
- [x] Multi-project versioning
- [x] Export functionality (Markdown + PDF stub)
- [ ] SSL certificate (handled by Vercel)
- [ ] Custom domain configuration
- [ ] Analytics integration (future)
- [ ] Error monitoring (Sentry - future)

---

## Development Workflow

### Local Development
```bash
# Start dev server
npm run dev

# Run type checking
npm run type-check

# Run tests
npm test
npm run test:watch

# Run E2E tests
npm run test:e2e
npm run test:e2e:ui

# API connectivity tests
npm run test:apis
```

### Code Quality
```bash
# Lint code
npm run lint

# Format code (when Prettier is installed)
npm run format
```

### Git Workflow
1. Create feature branch from `main`
2. Make changes and commit
3. Push and create PR
4. Review and merge to `main`
5. Vercel auto-deploys on merge

---

## Post-MVP Features

Future features are documented in `docs/future-features/`:
- **Phase 4**: Multi-user collaboration and enterprise features
- **Phase 5**: Analytics dashboard and advanced integrations

These phases are designed for post-launch expansion and are not required for MVP deployment.
