# Test User Setup Guide

## Step 1: Create Test User in Supabase

1. **Go to Supabase Dashboard**
   - Navigate to: https://supabase.com/dashboard/project/jiecqmnygnqrfntqoqsg
   - Click on **Authentication** in the left sidebar
   - Click on **Users** tab

2. **Add Test User**
   - Click **"Invite user"** button
   - Enter email: `test@shepherd-insight.com`
   - Enter password: `TestPassword123!`
   - **Uncheck** "Send invite email" (we don't want to send real emails)
   - Click **"Send invite"**

3. **Confirm User**
   - The user should appear in the users list
   - Make sure the user status shows as "Confirmed" (not "Pending")
   - If it shows "Pending", click on the user and manually confirm them

## Step 2: Update Environment Variables

Add these test user credentials to your `.env.local` file:

```env
# Test User Credentials for E2E Tests
TEST_USER_EMAIL=test@shepherd-insight.com
TEST_USER_PASSWORD=TestPassword123!
```

## Step 3: Verify Setup

1. **Test the app locally**
   ```bash
   npm run dev
   ```
   Visit http://localhost:3000 and try logging in with the test credentials

2. **Run auth setup test**
   ```bash
   npx playwright test tests/e2e/auth.setup.ts
   ```

3. **Run full E2E demo**
   ```bash
   npm run test:e2e:demo
   ```

## Troubleshooting

### If test user login fails:
- Check that the user is confirmed in Supabase Dashboard
- Verify the email and password are exactly as set
- Check Supabase Auth settings for any restrictions

### If auth setup test fails:
- Ensure the dev server is running (`npm run dev`)
- Check that the test user can log in manually in the browser
- Verify environment variables are loaded correctly

### If E2E tests still fail:
- Check that the auth setup test ran successfully first
- Verify the `.auth/user.json` file was created
- Check Playwright configuration for proper project dependencies

## Alternative: Manual Test User Creation

If you prefer to create the test user manually through the app:

1. Start the dev server: `npm run dev`
2. Go to http://localhost:3000/account
3. Click "Sign Up" 
4. Use email: `test@shepherd-insight.com`
5. Use password: `TestPassword123!`
6. Complete the signup process
7. Verify you can log in and access the dashboard

Then run the auth setup test to save the session state.

