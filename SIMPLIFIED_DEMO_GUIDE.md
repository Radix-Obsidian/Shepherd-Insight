# Simplified E2E Demo - Quick Reference

## ✅ Implementation Complete

### What's Been Added

1. **Minimal Test Attributes** (3 total):
   - `src/app/intake/page.tsx`: `data-testid="submit-project"` on submit button
   - `src/app/insight/page.tsx`: `data-testid="insight-title"` on main heading
   - `src/app/exports/page.tsx`: `data-testid="export-markdown"` on Markdown export button

2. **Simplified Demo Test**: `tests/e2e/simplified-demo.spec.ts`
   - Single comprehensive test covering core flow
   - Speed timer (target: < 30 seconds)
   - Resilient selectors using `data-testid` and role-based locators
   - Marketing artifacts (screenshots, exports)

3. **New npm Scripts**:
   - `npm run test:e2e:quick` - Fast console output
   - `npm run test:e2e:demo-report` - HTML report for sharing

4. **Playwright Config**: Added `quick-demo` project with optimized timeouts

## 🚀 How to Run

### Quick Demo (Console Output)
```bash
npm run test:e2e:quick
```

### Demo with HTML Report
```bash
npm run test:e2e:demo-report
```

### Manual Steps
```bash
# 1. Ensure auth setup is complete
npm run test:e2e:auth

# 2. Run quick demo
npm run test:e2e:quick

# 3. View results
npm run test:e2e:report
```

## 📊 What the Test Does

1. **Landing Page** → Verifies app loads
2. **Intake Form** → Fills demo data quickly
3. **Project Creation** → Submits and waits for redirect
4. **Insight Page** → Verifies project data loaded
5. **Export Page** → Downloads Markdown file
6. **Speed Measurement** → Logs completion time
7. **Marketing Artifacts** → Saves screenshot and export file

## 🎯 Marketing Value

- ⚡ **Speed**: "From idea to insight brief in under 30 seconds"
- 🎯 **Simplicity**: "Just fill a form and get professional output"
- 📊 **Proof**: "Download Markdown export immediately"
- 🖼️ **Visual**: Screenshots for presentations

## 📁 Output Files

After running the test:
- `playwright-report/demo-complete.png` - Final screenshot
- `playwright-report/demo-export.md` - Exported Markdown brief
- `playwright-report/index.html` - Full HTML report (if using demo-report)

## 🔧 Troubleshooting

### If test fails:
1. **Auth issues**: Run `npm run test:e2e:auth` first
2. **Slow performance**: Check if dev server is running (`npm run dev`)
3. **Timeout errors**: Increase timeouts in `playwright.config.ts`

### If speed is > 30 seconds:
- Check network latency
- Verify dev server performance
- Consider running against production build

## 📈 Success Metrics

- ✅ Test completes in < 30 seconds
- ✅ All 4 pages tested (Landing → Intake → Insight → Export)
- ✅ Export file downloaded successfully
- ✅ Screenshot captured for marketing
- ✅ Clean console output for demos

---

**Ready for YC Demo!** 🚀

The simplified test focuses on the core value proposition: speed and simplicity. Perfect for investor demos and user onboarding.
