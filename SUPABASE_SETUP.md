# Supabase Setup Guide

## Prerequisites

1. **Supabase Account**: Create a free account at [supabase.com](https://supabase.com)
2. **Supabase CLI**: Install globally (may require admin permissions)
   ```bash
   npm install -g supabase
   ```

## Project Setup

### 1. Create Supabase Project

1. Go to [supabase.com/dashboard](https://supabase.com/dashboard)
2. Click "New Project"
3. Fill in project details:
   - Name: `shepherd-insight`
   - Database Password: Choose a secure password
   - Region: Select closest to your location

### 2. Get Project Credentials

1. Go to Project Settings → API
2. Copy the following values:
   - **Project URL**
   - **anon/public key**

### 3. Configure Environment Variables

Create a `.env.local` file in your project root with:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# AI Services (optional for now)
GROQ_API_KEY=your_groq_api_key_here
FIRECRAWL_API_KEY=your_firecrawl_api_key_here

# App Configuration
NEXT_PUBLIC_APP_URL=    http://localhost:3000
```

### 4. Link Local Project to Supabase

```bash
# Login to Supabase CLI
supabase login

# Link your local project to the remote Supabase project
supabase link --project-ref your-project-id

# Push the database schema
supabase db push
```

### 5. Verify Setup

```bash
# Check if everything is connected
supabase status

# Start development server
npm run dev
```

## Database Schema

The migration file `supabase/migrations/20241024120000_initial_schema.sql` creates:

- **projects** table: User projects
- **versions** table: Project versions with intake data
- **insights** table: AI-generated insights (future)
- **Row Level Security (RLS)** policies for data protection
- **Indexes** for performance
- **Triggers** for automatic timestamp updates

## API Endpoints

### Authentication (`/api/auth`)
- `POST /api/auth` with `action: 'signup'` - User registration
- `POST /api/auth` with `action: 'signin'` - User login
- `POST /api/auth` with `action: 'signout'` - User logout
- `GET /api/auth?action=session` - Get current session

### Projects & Versions (`/api/supabase`)
- `GET /api/supabase?action=projects` - List user projects
- `GET /api/supabase?action=project&projectId=xxx` - Get project details
- `POST /api/supabase` with `action: 'create-project'` - Create new project
- `POST /api/supabase` with `action: 'create-version'` - Save intake data as version
- `POST /api/supabase` with `action: 'update-version'` - Update version data
- `DELETE /api/supabase?action=project&id=xxx` - Delete project
- `DELETE /api/supabase?action=version&id=xxx` - Delete version

## Next Steps

1. **Set up authentication UI** in your account page
2. **Update dashboard** to load real projects from Supabase
3. **Modify intake form** to save data to Supabase instead of Zustand
4. **Add loading states** and error handling
5. **Implement AI integrations** (Groq, Firecrawl)

## Troubleshooting

### "No such file or directory" errors
Make sure you've run `supabase link` and `supabase db push`

### Authentication issues
- Check that your environment variables are correct
- Verify that RLS policies are set up correctly
- Check Supabase dashboard for any configuration issues

### Database connection issues
- Ensure your Supabase project is active
- Check network connectivity
- Verify the project URL and anon key

## Security Notes

- Never commit `.env.local` files
- Use Row Level Security (RLS) policies for data protection
- The anon key is safe to use in client-side code
- Keep your service role key (if used) secure and server-side only
