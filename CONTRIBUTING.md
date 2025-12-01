# Contributing to ShepLight

Thank you for your interest in contributing to ShepLight! We're building an open-core UX research platform and welcome contributions from the community.

## 🌟 Ways to Contribute

### 🐛 Report Bugs
Found a bug? [Open an issue](https://github.com/Radix-Obsidian/Shepherd-Insight/issues/new?template=bug_report.md) with:
- Clear description of the problem
- Steps to reproduce
- Expected vs actual behavior
- Screenshots if applicable

### 💡 Suggest Features
Have an idea? [Start a discussion](https://github.com/Radix-Obsidian/Shepherd-Insight/discussions/new?category=ideas) to share your thoughts before opening a PR.

### 📝 Improve Documentation
Documentation PRs are always welcome! No issue needed — just submit a PR.

### 🔧 Submit Code
Ready to code? Follow the workflow below.

---

## 🛠️ Development Workflow

### 1. Fork & Clone

```bash
# Fork via GitHub UI, then:
git clone https://github.com/YOUR_USERNAME/Shepherd-Insight.git
cd Shepherd-Insight
```

### 2. Setup Environment

```bash
# Install dependencies
npm install

# Copy environment template
cp .env.example .env.local

# Add your API keys (see docs/SETUP.md)
```

### 3. Create a Branch

```bash
# Use descriptive branch names
git checkout -b feature/amazing-feature
git checkout -b fix/bug-description
git checkout -b docs/update-readme
```

### 4. Make Changes

Follow our coding standards:

- **TypeScript** — Use types, avoid `any`
- **Components** — Functional components with hooks
- **Styling** — Tailwind CSS, follow existing patterns
- **Naming** — Descriptive, consistent with codebase

### 5. Test Your Changes

```bash
# Type checking
npm run type-check

# Linting
npm run lint

# Unit tests
npm test

# Build check
npm run build
```

### 6. Commit

We use conventional commits:

```bash
# Format: type(scope): description
git commit -m "feat(compass): add idea templates"
git commit -m "fix(muse): resolve persona generation error"
git commit -m "docs(readme): update installation steps"
```

**Types:**
- `feat` — New feature
- `fix` — Bug fix
- `docs` — Documentation
- `style` — Formatting (no code change)
- `refactor` — Code restructure
- `test` — Adding tests
- `chore` — Maintenance

### 7. Submit PR

```bash
git push origin feature/amazing-feature
```

Then open a PR on GitHub with:
- Clear title and description
- Link to related issue (if any)
- Screenshots for UI changes

---

## 📋 Pull Request Guidelines

### Before Submitting

- [ ] Code follows existing style
- [ ] All tests pass (`npm test`)
- [ ] No TypeScript errors (`npm run type-check`)
- [ ] No lint errors (`npm run lint`)
- [ ] Build succeeds (`npm run build`)

### PR Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Documentation update
- [ ] Refactor

## Related Issue
Fixes #123

## Screenshots
(if applicable)

## Checklist
- [ ] Tests pass
- [ ] Types check
- [ ] Lint passes
```

---

## 🏗️ Project Structure

```
src/
├── app/          # Next.js pages and API routes
├── components/   # React components
├── lib/          # Core logic and utilities
│   ├── engine/   # Shepherd Engine (AI core)
│   └── research/ # Research tools
└── types/        # TypeScript definitions
```

### Key Directories

| Directory | What Goes Here |
|-----------|----------------|
| `src/app/compass/` | Compass (clarity) page |
| `src/app/muse/` | Muse (research) page |
| `src/app/blueprint/` | Blueprint (planning) page |
| `src/lib/engine/` | AI engine modules |
| `src/components/ui/` | Reusable UI primitives |

---

## 🎨 Code Style

### TypeScript

```typescript
// ✅ Good: Explicit types
interface UserProps {
  name: string
  email: string
}

function User({ name, email }: UserProps) {
  return <div>{name}</div>
}

// ❌ Avoid: any types
function User(props: any) { ... }
```

### Components

```typescript
// ✅ Good: Functional with explicit return
export function Button({ children, onClick }: ButtonProps) {
  return (
    <button onClick={onClick}>
      {children}
    </button>
  )
}

// ❌ Avoid: Class components
class Button extends React.Component { ... }
```

### Tailwind

```tsx
// ✅ Good: Utility classes
<div className="flex items-center gap-4 p-4 bg-white rounded-lg shadow">

// ❌ Avoid: Inline styles
<div style={{ display: 'flex', alignItems: 'center' }}>
```

---

## 🔒 Security

- Never commit API keys or secrets
- Use environment variables for all credentials
- Report security issues privately to security@goldensheep.ai

---

## 📜 License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

## 🙏 Thank You!

Every contribution matters. Whether it's a typo fix or a major feature, we appreciate your help in making ShepLight better for founders everywhere.

**Questions?** [Start a discussion](https://github.com/Radix-Obsidian/Shepherd-Insight/discussions) or reach out to the maintainers.

---

*"Start with the customer experience. Work backwards to technology."* — Steve Jobs
