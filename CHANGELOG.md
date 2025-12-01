# Changelog

All notable changes to ShepLight will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2024-11-30

### 🎉 Initial Release — "Light the Way"

ShepLight v1.0.0 is the first public release of our open-core UX research platform. This release establishes the core Shepherd Journey: Compass → Muse → Blueprint.

### Added

#### 🧭 Compass — Idea Clarity
- AI-powered idea analysis using Groq (Llama 3.3)
- Problem statement generation
- Target user identification
- Jobs-to-be-done synthesis
- Value hypothesis formulation
- Actionable next steps

#### 🎭 Muse — User Research
- Persona synthesis from research data
- Pain point mapping with intensity scoring
- Emotional journey visualization
- Competitor gap analysis
- Key insights generation
- Quick mode for faster results

#### 📐 Blueprint — MVP Planning
- Product vision statement
- MVP scope definition
- Feature prioritization (must-have vs nice-to-have)
- 4-week roadmap generation
- User story creation
- Success metrics
- Risk identification
- Launch checklist

#### 🗺️ Mind Map
- Interactive visual strategy builder
- AI-assisted node generation
- Drag-and-drop node editing
- Export to image

#### 🔒 Decision Vault
- Lock and version product decisions
- Journey session linking
- Historical decision tracking

#### 📤 Exports
- Markdown brief generation
- Professional formatting
- All sections included

#### 🎨 ShepLight Brand
- New brand identity: "Light the way from idea to launch"
- Custom logo (shepherd's crook with light motif)
- Brand colors: Amber primary, Indigo secondary, Emerald accent
- Modern, playful UI design

#### 🛡️ Infrastructure
- Supabase PostgreSQL with Row Level Security
- Supabase Auth integration
- Multi-model AI with automatic fallback
- Vercel deployment ready

### Technical Details

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript 5.6
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **AI**: Groq SDK (Llama 3.3, GPT-OSS)
- **Research**: Firecrawl integration
- **State**: Zustand
- **Testing**: Cypress, Jest

---

## [Unreleased]

### Planned for v1.1.0
- Deep Firecrawl research integration
- Competitor analysis dashboard
- Interview question generator
- Pain point validation scoring

### Planned for v1.2.0
- Team workspaces
- Commenting and feedback
- Shareable public links
- Notion/Linear integrations

---

*For more details, see the [Roadmap](README.md#-roadmap).*
