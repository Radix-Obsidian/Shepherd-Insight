# Cloud Testing Strategy - Test Like Real Users

**Philosophy:** Web apps live in the cloud, so tests should run there too.

## 🎯 Why Cloud-Only Testing?

✅ **Real environment:** Tests run where users actually interact  
✅ **Production parity:** Same hosting, same network, same latency  
✅ **CI/CD integration:** Automated tests on every deployment  
✅ **Cost effective:** No need to maintain local infrastructure  
✅ **Accurate results:** What works in cloud is what works for users  

## 🏗️ Current Setup

### Automated Testing

**GitHub Actions Workflows:**
- `.github/workflows/test-production.yml` - Tests run automatically on Vercel deployments

### Test Scripts

```bash
# Test against production
npm run test:e2e:production

# Test against preview (uses env var)
CYPRESS_BASE_URL=https://preview-url.vercel.app npm run test:e2e:preview

# Test against any Vercel deployment
CYPRESS_BASE_URL=https://your-deployment.vercel.app npm run test:e2e:cloud

# Legacy local testing (deprecated)
npm run test:e2e  # Only for local development debugging
```

## 🚀 Deployment & Testing Flow

### On Every Push to Main:

1. **Vercel deploys** to production
2. **GitHub Actions** waits for deployment
3. **Cypress runs** tests against live URL
4. **Results** are uploaded as artifacts

### On Every Pull Request:

1. **Vercel creates** preview deployment  
2. **GitHub Actions** tests the preview
3. **Merge blocked** if tests fail
4. **Screenshots/videos** uploaded on failure

## 📋 Test Coverage

### Current Test Suite

**File:** `cypress/e2e/navigation.cy.ts`
- Tests page navigation
- Verifies routing works
- Validates UI components load

**File:** `cypress/e2e/intake-to-insight.cy.ts`
- Tests full user flow from intake to insight
- Validates form submission
- Checks error handling

### Adding New Tests

Create tests in `cypress/e2e/`:

```typescript
describe('Your Feature', () => {
  it('should work like a real user', () => {
    cy.visit('/your-page')
    // Test against production/preview URL
    cy.contains('Expected Content').should('be.visible')
  })
})
```

## 🎬 Running Tests Manually

### Test Production

```bash
npm run test:e2e:production
```

**What it tests:**
- https://shepherd-insight.vercel.app
- All E2E flows
- Real user scenarios

### Test Preview

```bash
# Get preview URL from Vercel dashboard or GitHub PR
export CYPRESS_BASE_URL=https://shepherd-insight-git-branch.vercel.app
npm run test:e2e:preview
```

### Test Custom URL

```bash
# Test any Vercel deployment
CYPRESS_BASE_URL=https://custom-deployment.vercel.app npm run test:e2e:cloud
```

## 📊 Monitoring Test Results

### GitHub Actions

1. Go to repository → **Actions** tab
2. Find your workflow run
3. View test results and artifacts

### Vercel Preview URLs

- Every PR gets unique preview URL
- Copy URL from Vercel dashboard
- Share with team for manual testing

## 🐛 Debugging Failed Tests

### View Test Artifacts

GitHub Actions uploads:
- **Screenshots:** `cypress/screenshots/` (on failure)
- **Videos:** `cypress/videos/` (always)
- Download from Actions artifacts

### Common Issues

**Issue:** Tests timeout
**Fix:** Increase timeout in `cypress.config.ts`

**Issue:** Tests fail on production
**Fix:** Check Vercel function logs → Settings → Functions → Logs

**Issue:** Auth not working
**Fix:** Ensure `NEXT_PUBLIC_DISABLE_AUTH=false` in Vercel env vars

## 🔄 Continuous Integration

### What Runs Automatically

```yaml
On deployment_status → test-production.yml:
  ✓ Type check passes
  ✓ Cypress tests run against live URL
  ✓ Screenshots/videos uploaded on failure
```

### Manual Triggers

```bash
# From GitHub Actions tab
- Click "Run workflow"
- Select branch
- Click "Run workflow"
```

## 🎨 Best Practices

### 1. Test Real User Flows

```typescript
// ❌ Don't test implementation details
cy.get('.internal-class-name')

// ✅ Test what users see
cy.contains('Sign Up').click()
```

### 2. Use Data Attributes

```tsx
// In your components
<button data-testid="submit-project">Submit</button>

// In tests
cy.get('[data-testid="submit-project"]').click()
```

### 3. Wait for Elements

```typescript
// Cypress auto-waits, but be explicit for clarity
cy.contains('Expected Text').should('be.visible')
cy.url().should('include', '/expected-path')
```

### 4. Test Error States

```typescript
it('shows error on network failure', () => {
  cy.intercept('POST', '/api/*', { statusCode: 500 })
  cy.visit('/page')
  cy.contains('Something went wrong').should('be.visible')
})
```

## 📈 Metrics to Track

### From Vercel

- Deployment success rate
- Function execution time
- Error rates per endpoint

### From Cypress

- Test pass rate
- Test execution time
- Number of flaky tests

### From GitHub Actions

- Workflow success rate
- Total test execution time
- Artifacts uploaded

## 🚨 Emergency Rollback

If tests fail in production:

```bash
# 1. Check GitHub Actions log for error
# 2. If critical, rollback via Vercel
vercel rollback

# 3. Revert commit
git revert <commit-hash>

# 4. Push to trigger new deployment
git push
```

## 🎯 Success Criteria

### Every Release Must Have:
- ✅ All tests passing on production
- ✅ Type check passing
- ✅ No console errors in browser
- ✅ API routes responding correctly
- ✅ Database migrations applied

### Health Checks

```bash
# Quick smoke test
curl https://shepherd-insight.vercel.app/api/supabase/health

# Full test suite
npm run test:e2e:production
```

## 📝 Adding New Tests

### For New Features

1. **Write test first** (TDD approach)
2. **Test in preview** before merging
3. **Verify on production** after deploy

### Test File Naming

```
cypress/e2e/
  ├── navigation.cy.ts          # Navigation tests
  ├── intake-to-insight.cy.ts   # User flow tests
  ├── api-endpoints.cy.ts       # API tests
  └── auth.cy.ts                # Auth tests
```

## 🎉 Summary

**Old approach:** Local testing → Hope it works in cloud  
**New approach:** Cloud testing → Know it works in production

**Benefits:**
- Tests mirror real user experience
- Catch production issues before users do
- Faster feedback loop
- More reliable releases

**Next steps:**
1. Deploy to Vercel
2. Tests run automatically
3. Share with 5 users confidently
4. Iterate based on feedback

