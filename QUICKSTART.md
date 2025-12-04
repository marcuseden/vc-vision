# ⚡ VC Magic - Quick Start (5 Minutes)

Get your VC Magic running in 5 minutes!

## Prerequisites

- ✅ Node.js 18+ installed
- ✅ pnpm installed (`npm install -g pnpm`)

## Step 1: Install Dependencies (1 min)

```bash
cd "VC - Magic"
pnpm install
```

## Step 2: Set Up Supabase (2 min)

### Option A: Create Free Supabase Project

1. Go to [supabase.com/dashboard](https://supabase.com/dashboard)
2. Click "New Project"
3. Set database password
4. Wait ~2 minutes for provisioning

### Option B: Use Existing Supabase Project

Skip to Step 3 if you already have a project.

## Step 3: Configure Environment (1 min)

1. Copy environment template:
```bash
cp .env.example .env
```

2. Get your Supabase credentials:
   - Go to your Supabase project
   - Settings → API
   - Copy: URL, anon key, service_role key
   - Settings → Database → Connection String (URI)

3. Get OpenAI API key:
   - Go to [platform.openai.com/api-keys](https://platform.openai.com/api-keys)
   - Create new key

4. Edit `.env`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
DATABASE_URL=postgresql://postgres:your-password@db.xxxxx.supabase.co:5432/postgres
OPENAI_API_KEY=sk-...
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Step 4: Initialize Database (30 sec)

```bash
# Generate Prisma client
pnpm db:generate

# Create database tables
pnpm db:push

# Add test data (optional but recommended)
pnpm db:seed
```

## Step 5: Create Storage Buckets (30 sec)

1. In Supabase dashboard, go to Storage
2. Create two **public** buckets:
   - `audio`
   - `slides`

## Step 6: Run! (instant)

```bash
pnpm dev
```

Open http://localhost:3000 🎉

## Verify It Works

You should see:
1. Dashboard with 2 test meetings (if you ran seed)
2. Click on "TechFlow AI" meeting
3. See slide analysis, questions, and summary

## What's Next?

### Test the API

```bash
# Test meeting creation
curl -X POST http://localhost:3000/api/meetings \
  -H "Content-Type: application/json" \
  -d '{
    "dealId": "your-deal-id",
    "userId": "your-user-id", 
    "title": "Test Meeting"
  }'
```

### Explore the UI

- **Dashboard** - View all meetings
- **Meeting Detail** - Click on any meeting
- **Tabs** - Explore slides, transcript, questions, research
- **Generate Summary** - Click button to create IC memo

### Read the Docs

- **README.md** - Full feature overview
- **SETUP_GUIDE.md** - Detailed setup instructions
- **API_CONTRACTS.md** - iOS app integration
- **ARCHITECTURE.md** - System design

### Deploy to Production

```bash
# Push to GitHub
git init
git add .
git commit -m "Initial commit"
git push

# Deploy to Vercel (free)
# 1. Go to vercel.com
# 2. Import your GitHub repo
# 3. Add environment variables
# 4. Deploy!
```

## Troubleshooting

### Can't connect to database?
- Check `DATABASE_URL` is correct
- Replace `[YOUR-PASSWORD]` with actual password
- Ensure Supabase project is active

### OpenAI errors?
- Verify API key is correct
- Check you have credits in OpenAI account
- Ensure GPT-4 access (may need to add payment method)

### Module not found?
```bash
rm -rf node_modules
rm pnpm-lock.yaml
pnpm install
```

### Type errors?
```bash
pnpm db:generate
```

## Get Help

- Check **SETUP_GUIDE.md** for detailed instructions
- Review **PROJECT_SUMMARY.md** for overview
- Open **Prisma Studio** to inspect database: `pnpm db:studio`

---

**🎉 Congratulations! Your VC Magic is running!**

Next: Integrate with iOS app using **API_CONTRACTS.md**

