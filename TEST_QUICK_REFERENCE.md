# Testing Quick Reference - Cloud-Only

## 🎯 Testing Philosophy

**Test in the cloud because that's where users live.**

Local testing? ❌ Deprecated  
Cloud testing? ✅ Required

## 🚀 Quick Commands

```bash
# Test production (real users' environment)
npm run test:e2e:production

# Test preview deployment
CYPRESS_BASE_URL=https://preview.vercel.app npm run test:e2e:preview

# Test any Vercel URL
CYPRESS_BASE_URL=https://any-url.vercel.app npm run test:e2e:cloud
```

## 📍 Where Tests Run

### Production
**URL:** https://shepherd-insight.vercel.app  
**Trigger:** Every deployment to main  
**When:** Automatically via GitHub Actions  

### Preview
**URL:** https://shepherd-insight-git-[branch].vercel.app  
**Trigger:** Every PR  
**When:** Automatically via GitHub Actions  

## 📊 Current Coverage

- ✅ Navigation tests
- ✅ Intake → Insight flow
- ✅ Form validation
- 🔜 API endpoint tests
- 🔜 Auth flow tests

## 🐛 Debugging

### View Test Results
1. GitHub → Actions tab
2. Latest workflow run
3. View artifacts (screenshots/videos)

### Local Debugging (if needed)
```bash
# Only for debugging, not for validation
npm run test:e2e
```

## ✅ Success Checklist

- [x] Production URL responds
- [x] All navigation works
- [x] Form submission works
- [x] AI analysis completes
- [x] Mind map generates
- [ ] (Add your new tests here)

## 🎯 Next Test to Write

Add new tests to `cypress/e2e/`:

```typescript
describe('Your New Feature', () => {
  it('works in production', () => {
    cy.visit('/your-page')
    // Test the real feature
  })
})
```

## 📞 Need Help?

1. Check `CLOUD_TESTING_STRATEGY.md` for details
2. Check `VERCEL_DEPLOY_CHECKLIST.md` for deployment
3. View GitHub Actions logs for failures

