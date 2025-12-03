# VC Copilot - System Architecture

## Overview

VC Copilot is a full-stack AI-powered meeting intelligence platform built with Next.js, designed to help venture capital firms make better investment decisions through real-time meeting analysis and automated research.

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     iOS Companion App                        │
│                  (Ray-Ban Meta Gen 2)                        │
│  - Audio Recording (Bluetooth Mic)                           │
│  - Slide Capture (Camera)                                    │
│  - TTS Playback (Bluetooth Speaker)                          │
└────────────────────┬────────────────────────────────────────┘
                     │
                     │ HTTPS/WebSocket
                     │
┌────────────────────▼────────────────────────────────────────┐
│                    Next.js Backend                           │
│  ┌────────────────────────────────────────────────────────┐ │
│  │           API Routes (Serverless)                       │ │
│  │  - /api/transcribe      (Audio → Transcript)           │ │
│  │  - /api/slides          (Upload + Analysis)            │ │
│  │  - /api/slides/intel    (AI Analysis)                  │ │
│  │  - /api/slides/research (Fact Checking)                │ │
│  │  - /api/meetings/*      (CRUD + Summary)               │ │
│  │  - /api/email/*         (Generation + Send)            │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                               │
│  ┌────────────────────────────────────────────────────────┐ │
│  │           LLM Agent System                              │ │
│  │  - Slide Intelligence   (GPT-4 Vision)                 │ │
│  │  - Research Agent       (GPT-4)                        │ │
│  │  - Summary Agent        (GPT-4)                        │ │
│  │  - Email Agent          (GPT-4)                        │ │
│  │  - Follow-up Agent      (GPT-4)                        │ │
│  └────────────────────────────────────────────────────────┘ │
└───────────┬──────────────────────────┬─────────────────────┘
            │                          │
            │                          │
    ┌───────▼────────┐        ┌────────▼──────────┐
    │   Supabase     │        │     OpenAI        │
    │ ─────────────  │        │ ───────────────   │
    │ • Postgres DB  │        │ • GPT-4 Turbo     │
    │ • Auth         │        │ • GPT-4 Vision    │
    │ • Storage      │        │ • Whisper         │
    │   (Audio/      │        │ • TTS             │
    │    Slides)     │        │                   │
    └────────────────┘        └───────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                  Next.js Frontend (React)                    │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ Pages                                                   │ │
│  │  - /dashboard           (Meeting list)                 │ │
│  │  - /meeting/[id]        (Meeting detail)               │ │
│  │  - /deal/[id]           (Deal overview)                │ │
│  └────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ Components                                              │ │
│  │  - MeetingTimeline      - CompetitorList               │ │
│  │  - SlideCard            - MarketPanel                  │ │
│  │  - TranscriptViewer     - SummaryEditor                │ │
│  │  - QuestionsPanel                                       │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘

             ┌──────────────────────────────┐
             │   External Integrations      │
             │  - Slack (notifications)     │
             │  - SendGrid (email)          │
             │  - Google Calendar (follow-up│
             └──────────────────────────────┘
```

## Data Flow

### 1. Meeting Recording Flow

```
iOS App → Capture Audio (Ray-Ban Mic)
    ↓
POST /api/transcribe (audio chunk)
    ↓
OpenAI Whisper API → Transcribe
    ↓
Save TranscriptSegment to DB
    ↓
Return transcript to iOS app
```

### 2. Slide Analysis Flow

```
iOS App → Capture Slide (Camera/Upload)
    ↓
POST /api/slides (image)
    ↓
Upload to Supabase Storage
    ↓
Save Slide record to DB
    ↓
POST /api/slides/intel (slideId)
    ↓
GPT-4 Vision → Extract text + visuals
    ↓
GPT-4 → Identify claims
    ↓
GPT-4 → Generate questions
    ↓
OpenAI TTS → Convert questions to speech
    ↓
Save Claims, Questions to DB
Upload question audio to Storage
    ↓
Return questions + audio URLs to iOS
    ↓
iOS App → Play audio through Ray-Ban speakers
```

### 3. Research Flow

```
User/System → Trigger research
    ↓
POST /api/slides/research (claimId/dealId)
    ↓
Research Agent (GPT-4)
    ↓
  ├─ Verify claims
  ├─ Analyze market size
  ├─ Identify competitors
  └─ Assess moat
    ↓
Save ResearchResults, Competitors, Insights to DB
    ↓
Display in UI (MarketPanel, CompetitorList)
```

### 4. Summary Generation Flow

```
Meeting completed
    ↓
POST /api/meetings/summary (meetingId)
    ↓
Fetch all meeting data:
  - Transcript segments
  - Slides + claims
  - Questions + answers
    ↓
Summary Agent (GPT-4)
  - Generate executive summary
  - Extract key takeaways
  - Identify strengths/concerns
  - Recommend action
    ↓
Save summary to Meeting record
Create Insights
Create FollowUp items
    ↓
Notify team via Slack
    ↓
Display in SummaryEditor component
```

### 5. Email Flow

```
User → Request thank-you email
    ↓
POST /api/email/thankyou (meetingId)
    ↓
Email Agent (GPT-4)
  - Generate personalized email
  - Include follow-up questions
    ↓
Save Email draft to DB
    ↓
User reviews and edits
    ↓
POST /api/email/send (emailId)
    ↓
SendGrid API → Send email
    ↓
Mark Email as sent
```

## Database Schema

### Core Entities

```
User
├─ id (PK)
├─ email
├─ name
├─ role (analyst|partner|admin)
└─ meetings[] (1:N)

Deal
├─ id (PK)
├─ companyName
├─ website
├─ stage (seed|series-a|...)
├─ sector
├─ description
├─ meetings[] (1:N)
├─ competitors[] (1:N)
└─ insights[] (1:N)

Meeting
├─ id (PK)
├─ dealId (FK)
├─ userId (FK)
├─ title
├─ date
├─ status (in_progress|completed|failed)
├─ summary
├─ keyTakeaways[]
├─ nextSteps[]
├─ slides[] (1:N)
├─ transcript[] (1:N)
├─ questions[] (1:N)
├─ claims[] (1:N)
├─ followUps[] (1:N)
└─ emails[] (1:N)

Slide
├─ id (PK)
├─ meetingId (FK)
├─ slideNumber
├─ imageUrl
├─ text
├─ claims[] (1:N)
├─ questions[] (1:N)
└─ insights[] (1:N)

Claim
├─ id (PK)
├─ meetingId (FK)
├─ slideId (FK, optional)
├─ claimText
├─ claimType (metric|market_size|...)
├─ isVerified
├─ confidence
└─ research[] (1:N)

Question
├─ id (PK)
├─ meetingId (FK)
├─ slideId (FK, optional)
├─ questionText
├─ category (verification|expansion|...)
├─ priority
├─ asked
└─ answer
```

## AI Agent System

### Slide Intelligence Agent

**Purpose:** Analyze slides and generate smart questions

**Input:**
- Slide image URL
- Slide number
- Company context

**Process:**
1. GPT-4 Vision extracts text and describes visuals
2. GPT-4 identifies key claims and metrics
3. GPT-4 generates 2-3 smart questions
4. TTS converts questions to audio

**Output:**
- Extracted text
- List of claims with confidence scores
- Prioritized questions with audio URLs

### Research Agent

**Purpose:** Verify claims and analyze market/competition

**Input:**
- Claim text and type
- Company name and description

**Process:**
1. Analyze claim verifiability
2. Provide comparable benchmarks
3. Identify red flags
4. Suggest verification sources
5. (Optional) Query external APIs/databases

**Output:**
- Verification status
- Confidence score
- Benchmarks
- Concerns
- Recommendations

### Summary Agent

**Purpose:** Generate IC-ready meeting summaries

**Input:**
- Full transcript
- Slide content and claims
- Questions asked/answered

**Process:**
1. Extract key takeaways
2. Identify strengths and concerns
3. Articulate investment thesis
4. Recommend next action
5. Calculate confidence score

**Output:**
- Executive summary
- Structured analysis (strengths, concerns, opportunities)
- Recommended action (pass, diligence, term sheet)
- Confidence score

### Email Agent

**Purpose:** Generate follow-up communications

**Input:**
- Meeting summary
- Outstanding questions
- Company/founder details

**Process:**
1. Select appropriate email type and tone
2. Craft personalized message
3. Include relevant questions/requests
4. Suggest optimal send timing

**Output:**
- Email subject
- Email body (HTML)
- Suggested send time

### Follow-up Agent

**Purpose:** Extract and prioritize action items

**Input:**
- Meeting transcript
- Meeting summary

**Process:**
1. Identify commitments and requests
2. Extract due diligence items
3. Detect meeting scheduling needs
4. Prioritize by urgency and importance

**Output:**
- List of follow-up tasks with priorities
- Suggested meeting agenda (if applicable)
- Proposed time options

## Frontend Architecture

### Pages

**Dashboard (`/dashboard`)**
- Lists all meetings
- Filters by status (in progress, completed)
- Shows meeting stats
- Quick access to create new meeting

**Meeting Detail (`/meeting/[id]`)**
- Tabbed interface:
  - Overview (timeline + top questions)
  - Slides (all slides with analysis)
  - Transcript (full transcription)
  - Questions (all generated questions)
  - Research (competitors + market intel)
  - Summary (IC memo)
- Real-time updates as analysis completes
- Actions: generate summary, share, send email

### Components

**MeetingTimeline**
- Chronological view of meeting events
- Slides, transcript segments, questions
- Click to jump to specific moment

**SlideCard**
- Displays slide image
- Shows extracted text and claims
- Lists generated questions
- Verification status badges

**TranscriptViewer**
- Scrollable transcript with speaker labels
- Timestamp navigation
- Search functionality

**QuestionsPanel**
- Lists questions by priority
- Shows category and status (asked/pending)
- Audio playback controls
- Mark as asked

**CompetitorList**
- Competitor cards with key metrics
- Funding stage, revenue, differentiation
- Visual comparison

**MarketPanel**
- TAM/SAM/SOM visualization
- Market trends
- Growth rates
- Key players

**SummaryEditor**
- Editable IC memo
- Structured sections
- Export/share controls
- Email draft generation

## Security & Privacy

### Authentication
- Supabase Auth (email/password, OAuth)
- Row-level security (RLS) policies
- Role-based access (analyst, partner, admin)

### Data Protection
- API keys stored in environment variables
- Sensitive data encrypted at rest (Supabase)
- HTTPS for all communications
- Supabase Storage access policies

### AI Safety
- Input sanitization before LLM calls
- Output validation and filtering
- Rate limiting on API routes
- Error handling to prevent data leaks

## Performance Optimization

### Frontend
- Next.js App Router (React Server Components)
- Streaming for long operations
- Optimistic UI updates
- Image optimization (Next.js Image)

### Backend
- Serverless API routes (auto-scaling)
- Database connection pooling (Prisma)
- Caching strategies:
  - Slide analysis results
  - Research data
  - Transcript segments

### AI Calls
- Batch operations when possible
- Use appropriate models (GPT-3.5 for simple tasks)
- Stream responses for long completions
- Implement retries with exponential backoff

## Deployment

### Production Environment

**Hosting:** Vercel (recommended)
- Automatic deployments from Git
- Edge network (low latency)
- Environment variable management
- Preview deployments for PRs

**Database:** Supabase
- Managed Postgres
- Automatic backups
- Connection pooling
- Row-level security

**Storage:** Supabase Storage
- CDN delivery
- Public/private buckets
- Automatic image optimization

### Monitoring

- **Logging:** Vercel logs + custom logging
- **Errors:** Sentry (optional)
- **Analytics:** Vercel Analytics
- **Uptime:** Uptime Robot (optional)

### Scaling Considerations

- **Database:** Connection pooling, read replicas
- **Storage:** CDN for global delivery
- **API:** Serverless auto-scales
- **AI:** OpenAI rate limits (manage quota)

## Development Workflow

### Local Development
```bash
pnpm dev  # Start Next.js dev server
pnpm db:studio  # Open Prisma Studio
pnpm db:seed  # Seed test data
```

### Code Organization
```
/app        - Next.js pages and API routes
/components - React components
/lib        - Utilities and services
  /agents   - LLM agent logic
/prisma     - Database schema
/types      - TypeScript types
```

### Best Practices
- Use TypeScript for type safety
- Server Components by default
- Client Components only when needed
- Prisma for all DB operations
- Error handling at all layers
- Input validation with Zod

## Future Enhancements

### Near-term
- WebSocket for real-time updates
- Voice activity detection (speaker diarization)
- Multi-language support
- Mobile web interface

### Medium-term
- Knowledge graph across deals
- Pattern recognition (red flags, success factors)
- Automated DD workflows
- Integration with Notion, Airtable

### Long-term
- Predictive investment scoring
- Portfolio company benchmarking
- LP reporting automation
- Market signal detection

---

**Version:** 1.0.0  
**Last Updated:** December 2025  
**Maintained by:** Internal Development Team

