# VC Copilot - Internal Deal Intelligence Platform

An AI-powered meeting intelligence system for venture capital firms. Records meetings, analyzes pitch decks, generates smart questions, and produces IC-ready summaries.

## 🌟 Features

- **Real-time Meeting Transcription** - Whisper API integration for accurate transcription
- **Slide Intelligence** - OCR + GPT-4 Vision for slide analysis
- **Smart Question Generation** - AI-generated questions with TTS for Ray-Ban Meta glasses
- **Claim Verification** - Automated fact-checking and research
- **Competitive Analysis** - Automatic competitor identification and analysis
- **Market Research** - TAM/SAM/SOM validation and trends
- **Meeting Summaries** - IC-ready summaries with investment thesis
- **Email Automation** - Thank you emails and follow-up drafts
- **Team Collaboration** - Slack integration and internal sharing

## 🛠️ Tech Stack

- **Frontend**: Next.js 14 (App Router), React, TailwindCSS, shadcn/ui
- **Backend**: Next.js API Routes
- **Database**: Supabase (Postgres + Auth + Storage)
- **ORM**: Prisma
- **AI**: OpenAI (GPT-4, Whisper, TTS, Vision)
- **Integrations**: Slack, Email (SendGrid), Google Calendar

## 📋 Prerequisites

- Node.js 18+ 
- pnpm (recommended) or npm
- Supabase account
- OpenAI API key

## 🚀 Getting Started

### 1. Clone and Install

```bash
cd "VC - Magic"
pnpm install
```

### 2. Environment Setup

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Fill in your environment variables:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Database
DATABASE_URL=postgresql://user:password@host:port/database

# OpenAI
OPENAI_API_KEY=sk-...

# Optional Integrations
SENDGRID_API_KEY=...
SLACK_WEBHOOK_URL=...
```

### 3. Database Setup

```bash
# Generate Prisma client
pnpm db:generate

# Push schema to database
pnpm db:push

# (Optional) Open Prisma Studio
pnpm db:studio
```

### 4. Supabase Storage Buckets

Create these storage buckets in your Supabase dashboard:
- `audio` - for meeting recordings
- `slides` - for slide images

Set both to **public** access for easy retrieval.

### 5. Run Development Server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
/app
  /api                  # API routes
    /transcribe         # Audio transcription
    /slides             # Slide upload & analysis
    /meetings           # Meeting CRUD
    /email              # Email generation
  /dashboard            # Main dashboard
  /meeting/[id]         # Meeting detail page

/components             # React components
  MeetingTimeline.tsx   # Timeline visualization
  SlideCard.tsx         # Slide analysis display
  TranscriptViewer.tsx  # Transcript viewer
  QuestionsPanel.tsx    # Smart questions
  CompetitorList.tsx    # Competitor analysis
  MarketPanel.tsx       # Market research
  SummaryEditor.tsx     # IC summary editor
  /ui                   # shadcn/ui components

/lib                    # Utilities & services
  /agents               # LLM agent systems
    slideIntelAgent.ts  # Slide analysis
    researchAgent.ts    # Research & verification
    summaryAgent.ts     # Meeting summaries
    emailAgent.ts       # Email generation
    followupAgent.ts    # Follow-up detection
  db.ts                 # Prisma client
  supabase.ts           # Supabase client
  openai.ts             # OpenAI helpers
  email.ts              # Email service
  slack.ts              # Slack integration
  calendar.ts           # Calendar integration

/prisma
  schema.prisma         # Database schema
```

## 🎯 Key Workflows

### Recording a Meeting

1. iOS app sends audio chunks to `/api/transcribe`
2. Whisper transcribes in real-time
3. Segments saved to database

### Analyzing Slides

1. Upload slide image to `/api/slides`
2. POST to `/api/slides/intel` for analysis
3. GPT-4 Vision extracts text and claims
4. Questions generated and converted to speech
5. TTS audio streamed to Ray-Ban glasses

### Generating Summary

1. POST to `/api/meetings/summary`
2. Agent analyzes transcript + slides + claims
3. Generates IC-ready summary
4. Extracts action items
5. Notifies team via Slack

### Research & Verification

1. POST to `/api/slides/research` with claim ID
2. Research agent verifies claims
3. Competitor analysis
4. Market sizing validation
5. Moat analysis

## 🔌 API Endpoints

### Meetings
- `POST /api/meetings` - Create meeting
- `GET /api/meetings?id={id}` - Get meeting details
- `GET /api/meetings?dealId={id}` - List meetings for deal
- `PATCH /api/meetings` - Update meeting

### Transcription
- `POST /api/transcribe` - Upload audio chunk
- `GET /api/transcribe?meetingId={id}` - Get transcript

### Slides
- `POST /api/slides` - Upload slide image
- `GET /api/slides?meetingId={id}` - List slides
- `POST /api/slides/intel` - Analyze slide
- `POST /api/slides/research` - Research claims

### Summaries & Follow-ups
- `POST /api/meetings/summary` - Generate summary
- `POST /api/meetings/followup` - Extract follow-ups

### Email
- `POST /api/email/thankyou` - Generate thank-you email
- `POST /api/email/send` - Send email

## 🧠 LLM Agents

### Slide Intelligence Agent
- Extracts text via GPT-4 Vision
- Identifies key claims (metrics, market size, traction)
- Generates smart questions
- Converts questions to speech (TTS)

### Research Agent
- Verifies claims
- Analyzes market size (TAM/SAM/SOM)
- Identifies competitors
- Assesses competitive moat
- Benchmarks traction

### Summary Agent
- Generates executive summary
- Extracts key takeaways
- Identifies strengths & concerns
- Suggests next steps
- Recommends action (pass/diligence/term sheet)

### Email Agent
- Drafts thank-you emails
- Generates follow-up emails
- Creates IC distribution emails
- Detects follow-up intent from transcript

### Follow-up Agent
- Extracts action items
- Prioritizes tasks
- Suggests meeting agendas
- Proposes time options

## 📱 iOS App Integration

The iOS companion app should:

1. **Connect to Ray-Ban Meta Gen 2**
   - Use Bluetooth to access microphone
   - Stream audio to glasses speaker

2. **Send Audio to Backend**
   ```typescript
   POST /api/transcribe
   Content-Type: multipart/form-data
   
   {
     audio: File,
     meetingId: string,
     timestamp: number
   }
   ```

3. **Capture Slides**
   - Take photos or upload deck
   - Send to `/api/slides`

4. **Receive Questions**
   - Poll for new questions
   - Play TTS audio through glasses
   - Mark questions as asked

## 🔒 Authentication

Authentication is handled by Supabase Auth. Configure providers in your Supabase dashboard:
- Email/Password
- Google OAuth
- Magic Links

## 🎨 Customization

### Branding
Edit `app/globals.css` to customize colors:

```css
:root {
  --primary: 221.2 83.2% 53.3%;
  --primary-foreground: 210 40% 98%;
  /* ... */
}
```

### AI Prompts
Modify prompts in `/lib/agents/*` to customize:
- Question types and priorities
- Summary format
- Research depth
- Email tone

## 📊 Database Schema

Key models:
- **User** - Fund team members
- **Deal** - Companies being evaluated
- **Meeting** - Pitch meetings
- **Slide** - Deck slides with analysis
- **Claim** - Extracted assertions
- **Question** - AI-generated questions
- **Competitor** - Competitive intel
- **Insight** - Research findings
- **Email** - Email drafts

## 🚢 Deployment

### Vercel (Recommended)

```bash
vercel
```

Set environment variables in Vercel dashboard.

### Docker

```bash
docker build -t vc-copilot .
docker run -p 3000:3000 vc-copilot
```

## 🤝 Contributing

This is an internal tool. For questions or improvements, reach out to the development team.

## 📄 License

Proprietary - Internal Use Only

## 🆘 Support

For issues or questions:
1. Check the logs in Vercel/deployment platform
2. Review Prisma Studio for database state
3. Check Supabase dashboard for auth/storage issues
4. Contact the development team

---

Built with ❤️ for smarter venture capital

