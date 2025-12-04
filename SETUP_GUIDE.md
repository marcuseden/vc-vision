# VC Magic - Complete Setup Guide

This guide will walk you through setting up the VC Magic system from scratch.

## Step 1: Prerequisites

Ensure you have the following accounts and tools:

- ✅ Node.js 18+ installed
- ✅ pnpm installed (`npm install -g pnpm`)
- ✅ Git installed
- ✅ [Supabase](https://supabase.com) account (free tier works)
- ✅ [OpenAI](https://platform.openai.com) API key with GPT-4 access

## Step 2: Supabase Setup

### 2.1 Create New Project

1. Go to [supabase.com/dashboard](https://supabase.com/dashboard)
2. Click "New Project"
3. Choose organization and region
4. Set a strong database password (save it!)
5. Wait for project to initialize (~2 minutes)

### 2.2 Get API Keys

1. Go to Project Settings → API
2. Copy these values:
   - `URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` → `SUPABASE_SERVICE_ROLE_KEY` (keep secret!)

### 2.3 Get Database URL

1. Go to Project Settings → Database
2. Scroll to "Connection string" → "URI"
3. Copy the connection string (replace `[YOUR-PASSWORD]` with your actual password)
4. This is your `DATABASE_URL`

### 2.4 Create Storage Buckets

1. Go to Storage in sidebar
2. Click "Create bucket"
3. Create bucket named: `audio`
   - Set to **Public** bucket
4. Create bucket named: `slides`
   - Set to **Public** bucket

### 2.5 Enable Authentication (Optional)

1. Go to Authentication → Providers
2. Enable Email provider
3. (Optional) Enable Google OAuth:
   - Add OAuth credentials from Google Cloud Console
   - Configure authorized redirect URIs

## Step 3: OpenAI Setup

### 3.1 Get API Key

1. Go to [platform.openai.com/api-keys](https://platform.openai.com/api-keys)
2. Click "Create new secret key"
3. Name it "VC Magic"
4. Copy the key (starts with `sk-`)
5. **Important:** Save it immediately, you won't see it again!

### 3.2 Check Model Access

Ensure you have access to:
- ✅ GPT-4 Turbo
- ✅ GPT-4 Vision
- ✅ Whisper
- ✅ TTS (Text-to-Speech)

If not, you may need to:
- Add payment method
- Request GPT-4 access (usually granted immediately for paid accounts)

## Step 4: Project Setup

### 4.1 Install Dependencies

```bash
cd "VC - Magic"
pnpm install
```

### 4.2 Configure Environment

1. Copy the example env file:
```bash
cp .env.example .env
```

2. Edit `.env` and fill in your values:

```env
# Supabase (from Step 2.2 and 2.3)
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.xxxxx.supabase.co:5432/postgres

# OpenAI (from Step 3.1)
OPENAI_API_KEY=sk-...

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Optional - leave blank for now
SENDGRID_API_KEY=
EMAIL_FROM=
SLACK_WEBHOOK_URL=
SLACK_BOT_TOKEN=
GOOGLE_CALENDAR_API_KEY=
GOOGLE_CALENDAR_CLIENT_ID=
GOOGLE_CALENDAR_CLIENT_SECRET=
```

### 4.3 Initialize Database

```bash
# Generate Prisma client
pnpm db:generate

# Push schema to Supabase
pnpm db:push
```

You should see output like:
```
✔ Generated Prisma Client
Your database is now in sync with your Prisma schema.
```

### 4.4 Verify Setup

```bash
# Open Prisma Studio to verify database
pnpm db:studio
```

This opens a browser showing your database tables. You should see:
- User
- Deal
- Meeting
- Slide
- Claim
- Question
- etc.

## Step 5: Test Run

### 5.1 Start Development Server

```bash
pnpm dev
```

You should see:
```
▲ Next.js 14.0.4
- Local:        http://localhost:3000
- Ready in 2.1s
```

### 5.2 Open in Browser

1. Go to [http://localhost:3000](http://localhost:3000)
2. You should be redirected to `/dashboard`
3. You'll see the dashboard (empty initially)

### 5.3 Create Test Data

Open Prisma Studio (if not already open):
```bash
pnpm db:studio
```

1. Create a User:
   - Go to `User` table
   - Click "Add record"
   - Fill in: email, name, role (e.g., "analyst")

2. Create a Deal:
   - Go to `Deal` table
   - Click "Add record"
   - Fill in: companyName, sector, description

3. Create a Meeting:
   - Go to `Meeting` table
   - Click "Add record"
   - Fill in: 
     - dealId (copy from Deal you just created)
     - userId (copy from User you just created)
     - title: "Initial Pitch"
     - date: current date
     - status: "in_progress"

4. Refresh your dashboard - you should see the meeting!

## Step 6: Test API Endpoints

### 6.1 Test Transcription

```bash
# Create a test audio file (or use any audio file)
curl -X POST http://localhost:3000/api/transcribe \
  -F "audio=@test-audio.m4a" \
  -F "meetingId=YOUR_MEETING_ID" \
  -F "timestamp=0"
```

### 6.2 Test Slide Upload

```bash
curl -X POST http://localhost:3000/api/slides \
  -F "image=@test-slide.jpg" \
  -F "meetingId=YOUR_MEETING_ID" \
  -F "slideNumber=1"
```

### 6.3 Test Slide Analysis

```bash
curl -X POST http://localhost:3000/api/slides/intel \
  -H "Content-Type: application/json" \
  -d '{"slideId":"YOUR_SLIDE_ID"}'
```

## Step 7: Optional Integrations

### 7.1 SendGrid (Email)

1. Create account at [sendgrid.com](https://sendgrid.com)
2. Go to Settings → API Keys
3. Create API key with "Mail Send" permissions
4. Add to `.env`:
   ```env
   SENDGRID_API_KEY=SG.xxx
   EMAIL_FROM=noreply@yourfund.com
   ```

### 7.2 Slack (Notifications)

1. Go to [api.slack.com/apps](https://api.slack.com/apps)
2. Create New App → From scratch
3. Enable Incoming Webhooks
4. Add New Webhook to Workspace
5. Copy Webhook URL
6. Add to `.env`:
   ```env
   SLACK_WEBHOOK_URL=https://hooks.slack.com/services/xxx
   ```

### 7.3 Google Calendar (Scheduling)

1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Create new project
3. Enable Google Calendar API
4. Create OAuth 2.0 credentials
5. Add to `.env`:
   ```env
   GOOGLE_CALENDAR_CLIENT_ID=xxx
   GOOGLE_CALENDAR_CLIENT_SECRET=xxx
   ```

## Step 8: Deploy to Production

### 8.1 Deploy to Vercel

1. Push your code to GitHub (create private repo)
2. Go to [vercel.com](https://vercel.com)
3. Click "Import Project"
4. Select your GitHub repo
5. Add environment variables (copy from `.env`)
6. Click "Deploy"

### 8.2 Update Supabase Redirect URLs

1. Go to Supabase → Authentication → URL Configuration
2. Add your Vercel URL to:
   - Site URL
   - Redirect URLs

### 8.3 Update Environment

Update `.env` in Vercel:
```env
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

## Troubleshooting

### Database Connection Issues

**Error:** `Can't reach database server`

**Solution:**
- Check your `DATABASE_URL` is correct
- Ensure you replaced `[YOUR-PASSWORD]` with actual password
- Check Supabase project is not paused (free tier pauses after 1 week of inactivity)

### OpenAI API Errors

**Error:** `Insufficient quota`

**Solution:**
- Add payment method to OpenAI account
- Check billing limits

**Error:** `Model not found`

**Solution:**
- Request GPT-4 access in OpenAI settings
- Use `gpt-3.5-turbo` temporarily (edit `lib/openai.ts`)

### Build Errors

**Error:** `Module not found`

**Solution:**
```bash
rm -rf node_modules
rm pnpm-lock.yaml
pnpm install
```

### Type Errors

**Error:** `Type 'X' is not assignable to type 'Y'`

**Solution:**
```bash
pnpm db:generate  # Regenerate Prisma types
```

## Next Steps

1. ✅ **Create seed data** - Add test deals and meetings
2. ✅ **Test full workflow** - Upload slide → Analyze → Generate summary
3. ✅ **Customize prompts** - Edit agent prompts in `/lib/agents`
4. ✅ **Brand customization** - Update colors in `app/globals.css`
5. ✅ **Set up monitoring** - Add error tracking (e.g., Sentry)
6. ✅ **iOS app integration** - Follow `API_CONTRACTS.md`

## Support

If you encounter issues:

1. Check the console logs
2. Check Prisma Studio for database state
3. Check Supabase dashboard for storage/auth issues
4. Review `README.md` for additional context
5. Contact development team

---

🎉 **Congratulations!** Your VC Magic is ready to use.

