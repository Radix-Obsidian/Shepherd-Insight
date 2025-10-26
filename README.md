# Shepherd Insight

**From idea to clarity in minutes.**

Turn product ideas into comprehensive insight briefs with AI-powered analysis, mind mapping, and versioning.

---

## ✨ Features

- **🚀 AI-Powered Insights** - Generate professional product briefs in minutes
- **🧠 Mind Map Visualization** - Visual representation of your product strategy
- **📦 Multi-Version Support** - Track evolution of your ideas over time
- **📄 Export Functionality** - Download Markdown or PDF briefs
- **🔒 Secure Authentication** - Supabase-powered auth with RLS
- **🤖 Multi-Model AI** - Automatic fallback across multiple AI models

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Supabase account
- API keys for Groq and Firecrawl

### Installation

```bash
# Clone the repository
git clone <your-repo>
cd Shepherd-Insight

# Install dependencies
npm install

# Generate INTERNAL_API_KEY
openssl rand -hex 32

# Create .env.local (see COMMANDS_TO_RUN.md)
cp .env.example .env.local
# Edit with your actual values

# Start development server
npm run dev
```

Visit http://localhost:3000

---

## 📚 Documentation

| Document | Purpose |
|----------|---------|
| **[COMMANDS_TO_RUN.md](COMMANDS_TO_RUN.md)** | Copy-paste commands for deployment |
| **[QUICK_START.md](QUICK_START.md)** | Get started in 5 minutes |
| **[DEPLOYMENT_GUIDE.md](docs/DEPLOYMENT_GUIDE.md)** | Complete production deployment guide |
| **[IMPLEMENTATION_COMPLETE.md](IMPLEMENTATION_COMPLETE.md)** | Implementation summary and status |
| **[README-ARCH.md](README-ARCH.md)** | Technical architecture details |
| **[SUPABASE_SETUP.md](SUPABASE_SETUP.md)** | Supabase configuration guide |

---

## 🎯 User Flow

1. **Sign Up / Sign In** - Secure authentication via Supabase
2. **Create Project** - Fill intake form with product details
3. **View Insight** - AI-generated brief with personas, pain points, features
4. **Generate Mind Map** - Visual representation of your product strategy
5. **Create Versions** - Clone and iterate on your ideas
6. **Export** - Download Markdown or PDF briefs

---

## 🛠️ Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Database:** Supabase (PostgreSQL)
- **Auth:** Supabase Auth
- **AI:** Groq (Multi-model: GPT-OSS, Llama 4, Llama 3.3)
- **Web Scraping:** Firecrawl
- **State Management:** Zustand
- **Testing:** Jest, Playwright
- **Deployment:** Vercel

---

## 📊 Project Structure

```
Shepherd-Insight/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── account/           # User account management
│   │   ├── api/               # API routes
│   │   ├── dashboard/         # Project dashboard
│   │   ├── insight/           # Insight report view
│   │   ├── intake/            # Project creation form
│   │   ├── mindmap/           # Mind map builder
│   │   ├── vault/             # Decision vault
│   │   └── exports/           # Export functionality
│   ├── components/            # React components
│   │   ├── mindmap/           # Mind map components
│   │   ├── research/          # Research panel
│   │   ├── onboarding/        # Onboarding flow
│   │   └── ui/                # Reusable UI components
│   ├── lib/                   # Utilities and helpers
│   │   ├── research/          # AI research workflow
│   │   ├── mindmap/           # Mind map logic
│   │   ├── store.ts           # Zustand state management
│   │   ├── supabase.ts        # Supabase client
│   │   └── export.ts          # Export utilities
│   └── types/                 # TypeScript type definitions
├── supabase/
│   ├── functions/             # Edge Functions
│   │   └── env-config/        # Environment variable manager
│   └── migrations/            # Database migrations
├── tests/
│   ├── e2e/                   # Playwright E2E tests
│   └── integration/           # Jest integration tests
├── scripts/                   # Build and setup scripts
└── docs/                      # Documentation
```

---

## 🧪 Testing

### Unit & Integration Tests

```bash
npm test                        # Run all Jest tests
npm run test:watch              # Watch mode
npm run test:coverage           # Coverage report
```

### E2E Tests

```bash
# Install Playwright browsers (first time)
npx playwright install

# Run full test suite
npm run test:e2e

# Run demo flow
npm run test:e2e:demo

# View HTML report
npm run test:e2e:report

# Interactive UI mode
npm run test:e2e:ui
```

---

## 🚢 Deployment

### Deploy to Vercel

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod
```

### Supabase Setup

```bash
# Login and link
export SUPABASE_ACCESS_TOKEN=<your-token>
supabase login --token "$SUPABASE_ACCESS_TOKEN"
supabase link --project-ref jiecqmnygnqrfntqoqsg

# Deploy Edge Functions
npm run deploy:functions

# Push database schema
npm run deploy:db
```

**Full deployment guide:** [DEPLOYMENT_GUIDE.md](docs/DEPLOYMENT_GUIDE.md)

---

## 🔑 Environment Variables

Required environment variables:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# AI Services
GROQ_API_KEY=
FIRECRAWL_API_KEY=
FIRECRAWL_WEBHOOK_SECRET=

# App Configuration
NEXT_PUBLIC_APP_URL=
NEXT_PUBLIC_SITE_URL=
INTERNAL_API_KEY=
NODE_ENV=
```

**See:** [COMMANDS_TO_RUN.md](COMMANDS_TO_RUN.md) for setup instructions

---

## 📈 Features in Detail

### Multi-Version Support

- Create projects with automatic v1
- Clone any version to create iterations
- Switch between versions with dropdown
- URL parameters maintain context
- Dashboard links to latest version

### AI-Powered Analysis

- **Multi-model support:** 6+ Groq models
- **Automatic fallback:** If one model fails, tries next
- **Structured output:** Validated with Zod schemas
- **Research workflow:** Competitor analysis, personas, market sizing

### Export Functionality

- **Markdown:** Full-featured export with all sections
- **PDF:** Text-based stub (future: server-rendered PDF)
- **Client-side downloads:** No server processing required
- **Version tracking:** Includes version number and timestamp

### Security

- **Dual authentication:** User sessions + server-to-server
- **RLS policies:** Row-level security on all tables
- **API key management:** Secure Edge Function for env vars
- **Environment isolation:** Separate configs for dev/preview/prod

---

## 🎨 Screenshots

*Coming soon after E2E test run - see `playwright-report/` directory*

---

## 🐛 Troubleshooting

### Common Issues

**Build fails:**
```bash
npm run type-check
npm run lint
rm -rf .next && npm run build
```

**Playwright tests fail:**
```bash
npm run dev  # Ensure server is running
npx playwright test auth.setup
npm run test:e2e:demo
```

**"Unauthorized" errors:**
- Check environment variables match across .env.local, Vercel, and Supabase
- Verify INTERNAL_API_KEY is consistent

**Full troubleshooting guide:** [DEPLOYMENT_GUIDE.md](docs/DEPLOYMENT_GUIDE.md)

---

## 📝 Scripts Reference

```bash
# Development
npm run dev                     # Start dev server
npm run build                   # Production build
npm run start                   # Start production server
npm run type-check              # TypeScript validation
npm run lint                    # ESLint check

# Testing
npm test                        # Unit tests
npm run test:e2e                # E2E tests
npm run test:e2e:demo           # Demo flow
npm run test:e2e:report         # View report

# Deployment
npm run setup:supabase          # Supabase setup
npm run deploy:functions        # Deploy Edge Functions
npm run deploy:db               # Push schema
```

---

## 🤝 Contributing

This is a private project. For questions or issues, contact the development team.

---

## 📄 License

ISC

---

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - React framework
- [Supabase](https://supabase.com/) - Backend infrastructure
- [Groq](https://groq.com/) - AI inference
- [Firecrawl](https://firecrawl.dev/) - Web scraping
- [Playwright](https://playwright.dev/) - E2E testing
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [Zustand](https://zustand-demo.pmnd.rs/) - State management

---

## 📞 Support

- **Documentation:** See `docs/` directory
- **Quick Start:** [QUICK_START.md](QUICK_START.md)
- **Commands:** [COMMANDS_TO_RUN.md](COMMANDS_TO_RUN.md)
- **Architecture:** [README-ARCH.md](README-ARCH.md)

---

**Built with ❤️ for product teams who need clarity fast.**

**Status:** ✅ Production Ready  
**Version:** 1.0.0  
**Last Updated:** 2025-01-26

