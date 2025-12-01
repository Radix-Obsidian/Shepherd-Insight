<div align="center">
  <img src="./docs/assets/sheplight-logo.svg" alt="ShepLight Logo" width="120" />
  
  # ShepLight
  
  **Light the way from idea to launch.**
  
  The open-core AI-powered UX research platform that transforms messy startup ideas into validated product blueprints.

  [![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
  [![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)](https://nextjs.org/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue?logo=typescript)](https://www.typescriptlang.org/)
  [![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?logo=supabase)](https://supabase.com/)
  [![Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?logo=vercel)](https://vercel.com/)
  
  [Demo](https://sheplight.vercel.app) · [Documentation](./docs/) · [Discussions](https://github.com/Radix-Obsidian/Shepherd-Insight/discussions) · [Roadmap](#-roadmap)

</div>

---

## 🐑 What is ShepLight?

**ShepLight** helps non-technical founders go from *"I have an idea"* to *"I know exactly what to build first"* in minutes, not months.

We believe every great product starts with understanding your user deeply. ShepLight combines AI-powered research, UX methodology, and actionable frameworks to guide founders through the critical early stages of product development.

### The Problem We Solve

> "I have a great idea, but I don't know where to start."

Most founders waste weeks on the wrong features because they skip user research. Hiring a UX researcher costs $50k+. Reading about UX methodology takes months. ShepLight gives you senior UX researcher thinking in minutes.

---

## ✨ Core Features

### 🧭 Compass — Find Your Clarity
Transform a messy idea into a crystal-clear problem statement, target user, and value hypotheses. Powered by AI that thinks like a senior product strategist.

### 🎭 Muse — Understand Your Users  
Generate realistic user personas, pain point maps, and emotional journey insights. Built on research synthesis, not generic templates.

### 📐 Blueprint — Know What to Build
Get an actionable MVP scope, prioritized feature list, and 4-week roadmap. Every recommendation traces back to user pain points.

### 🗺️ Mind Map — Visualize Your Strategy
Interactive mind map builder to explore and expand your product thinking. AI-assisted node generation.

### 🔒 Decision Vault — Lock Your Choices
Save and version your product decisions. Never lose track of what you committed to build.

### 📤 Exports — Share Your Vision
Export professional Markdown briefs to share with co-founders, investors, or developers.

---

## 🚀 Quick Start

### Prerequisites

- **Node.js 18+**
- **Supabase account** ([free tier](https://supabase.com/))
- **Groq API key** ([free tier](https://console.groq.com/))
- **Firecrawl API key** ([optional, for research](https://firecrawl.dev/))

### Installation

```bash
# Clone the repository
git clone https://github.com/Radix-Obsidian/Shepherd-Insight.git
cd Shepherd-Insight

# Install dependencies
npm install

# Copy environment template
cp .env.example .env.local

# Add your API keys to .env.local
# See docs/SETUP.md for detailed instructions

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and start your journey.

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| **Framework** | Next.js 14 (App Router) |
| **Language** | TypeScript |
| **Styling** | Tailwind CSS |
| **Database** | Supabase (PostgreSQL + RLS) |
| **Auth** | Supabase Auth |
| **AI Engine** | Groq (Llama 3.3, GPT-OSS) |
| **Research** | Firecrawl |
| **State** | Zustand |
| **Testing** | Cypress, Jest |
| **Deployment** | Vercel |

---

## 📖 The Shepherd Journey

ShepLight guides users through a structured 3-step journey:

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│   🧭 COMPASS          🎭 MUSE            📐 BLUEPRINT          │
│   ──────────────────────────────────────────────────────────   │
│                                                                 │
│   "What problem       "Who are my        "What should I       │
│    am I solving?"      users really?"     build first?"        │
│                                                                 │
│   → Problem Statement  → User Personas   → MVP Scope           │
│   → Target User        → Pain Points     → Feature Priority    │
│   → Value Hypotheses   → Insights        → 4-Week Roadmap      │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

Each step builds on the previous, ensuring every feature recommendation is grounded in user research.

---

## 🗺️ Roadmap

### ✅ v1.0.0 — Foundation (Current)
- [x] Compass: Idea clarity engine
- [x] Muse: Persona synthesis
- [x] Blueprint: MVP planning
- [x] Mind Map: Visual strategy builder
- [x] Decision Vault: Version control for decisions
- [x] Exports: Markdown briefs

### 🔄 v1.1.0 — Research Depth (Q1 2025)
- [ ] Firecrawl deep research integration
- [ ] Competitor analysis dashboard
- [ ] Interview question generator
- [ ] Pain point validation scoring

### 🚀 v1.2.0 — Collaboration (Q2 2025)
- [ ] Team workspaces
- [ ] Commenting and feedback
- [ ] Shareable public links
- [ ] Notion/Linear integrations

### 💎 v2.0.0 — Enterprise (Future)
- [ ] Custom AI model training
- [ ] White-label deployments
- [ ] SSO/SAML authentication
- [ ] Advanced analytics

---

## 🤝 Contributing

ShepLight is an **open-core** project. The core platform is open source, with premium features planned for sustainability.

We welcome contributions! Here's how to get involved:

### Ways to Contribute

- **🐛 Report Bugs** — [Open an issue](https://github.com/Radix-Obsidian/Shepherd-Insight/issues)
- **💡 Suggest Features** — [Start a discussion](https://github.com/Radix-Obsidian/Shepherd-Insight/discussions)
- **📝 Improve Docs** — PRs for documentation always welcome
- **🔧 Submit PRs** — See [CONTRIBUTING.md](CONTRIBUTING.md)

### Development Setup

```bash
# Fork and clone the repo
git clone https://github.com/YOUR_USERNAME/Shepherd-Insight.git

# Create a branch
git checkout -b feature/amazing-feature

# Make your changes and test
npm run type-check
npm run lint
npm test

# Submit a PR
```

See [CONTRIBUTING.md](CONTRIBUTING.md) for detailed guidelines.

---

## 📚 Documentation

| Document | Description |
|----------|-------------|
| [Architecture](README-ARCH.md) | Technical architecture and design decisions |
| [Setup Guide](docs/SETUP.md) | Detailed installation instructions |
| [API Reference](docs/API.md) | API endpoints and usage |
| [Deployment](docs/DEPLOYMENT_GUIDE.md) | Production deployment guide |
| [Contributing](CONTRIBUTING.md) | Contribution guidelines |

---

## 💬 Community

- **[GitHub Discussions](https://github.com/Radix-Obsidian/Shepherd-Insight/discussions)** — Ask questions, share ideas
- **[Issues](https://github.com/Radix-Obsidian/Shepherd-Insight/issues)** — Report bugs, request features

---

## 📄 License

ShepLight is open source under the **MIT License**. See [LICENSE](LICENSE) for details.

---

## 🙏 Acknowledgments

Built with love by [Golden Sheep AI](https://goldensheep.ai) and powered by:

- [Next.js](https://nextjs.org/) — React framework
- [Supabase](https://supabase.com/) — Backend infrastructure
- [Groq](https://groq.com/) — AI inference
- [Firecrawl](https://firecrawl.dev/) — Web research
- [Vercel](https://vercel.com/) — Deployment
- [Tailwind CSS](https://tailwindcss.com/) — Styling

---

<div align="center">
  
  **Made with 🐑 by [Golden Sheep AI](https://goldensheep.ai)**
  
  *"Start with the customer experience. Work backwards to technology."* — Steve Jobs
  
</div>

