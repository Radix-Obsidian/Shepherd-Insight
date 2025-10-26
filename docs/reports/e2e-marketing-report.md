# Shepherd Insight — E2E Marketing Report

Date: <!-- fill after run -->  
Environment: Local (Next.js dev) / Preview (Vercel)  
Browsers: Chromium (Playwright)  

## Scenario

From new user to exported Insight Brief with versioning and AI features:

1) Sign up / Sign in  
2) Create project via Intake (v1 auto-created)  
3) View Insight; switch versions; Create New Version (v2)  
4) Generate AI Mind Map (model fallback enabled)  
5) Export Markdown & PDF (stub)  
6) Dashboard shows projects; links to latest version  

## Run Summary

- Start: <!-- timestamp -->  
- End: <!-- timestamp -->  
- Duration: <!-- computed -->  
- Result: <!-- PASS / FAIL -->

## Key Screenshots

> Attach images from `playwright-report/` (home, intake, insight, mindmap, exports, dashboard)

## Outputs

- Exported Markdown brief: `./artifacts/<project>-insight.md`  
- Playwright HTML report: `./playwright-report/index.html`  
- Traces: `./playwright-report/`  

## Notes

- Models: Primary `openai/gpt-oss-120b`, fallback `llama-3.3-70b`, `llama-4-maverick`, `openai/gpt-oss-20b`.  
- Webhook / async flows available; not required for this run.  
- Next steps: enable server-rendered PDF endpoint `/api/export/pdf` for production-grade exports.


