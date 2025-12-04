-- VC Copilot Database Schema
-- Run this in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "email" TEXT NOT NULL UNIQUE,
    "name" TEXT,
    "role" TEXT NOT NULL DEFAULT 'analyst',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Deals table
CREATE TABLE "Deal" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "companyName" TEXT NOT NULL,
    "website" TEXT,
    "stage" TEXT,
    "sector" TEXT,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Meetings table
CREATE TABLE "Meeting" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "dealId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "duration" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'in_progress',
    "transcriptUrl" TEXT,
    "audioUrl" TEXT,
    "summary" TEXT,
    "keyTakeaways" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "nextSteps" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Meeting_dealId_fkey" FOREIGN KEY ("dealId") REFERENCES "Deal"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Meeting_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- Slides table
CREATE TABLE "Slide" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "meetingId" TEXT NOT NULL,
    "slideNumber" INTEGER NOT NULL,
    "imageUrl" TEXT,
    "text" TEXT,
    "timestamp" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Slide_meetingId_fkey" FOREIGN KEY ("meetingId") REFERENCES "Meeting"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    UNIQUE("meetingId", "slideNumber")
);

-- TranscriptSegment table
CREATE TABLE "TranscriptSegment" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "meetingId" TEXT NOT NULL,
    "speaker" TEXT NOT NULL DEFAULT 'founder',
    "text" TEXT NOT NULL,
    "timestamp" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "TranscriptSegment_meetingId_fkey" FOREIGN KEY ("meetingId") REFERENCES "Meeting"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Claims table
CREATE TABLE "Claim" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "meetingId" TEXT NOT NULL,
    "slideId" TEXT,
    "segmentId" TEXT,
    "claimText" TEXT NOT NULL,
    "claimType" TEXT NOT NULL,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "verifiedBy" TEXT,
    "confidence" DOUBLE PRECISION,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Claim_meetingId_fkey" FOREIGN KEY ("meetingId") REFERENCES "Meeting"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Claim_slideId_fkey" FOREIGN KEY ("slideId") REFERENCES "Slide"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Claim_segmentId_fkey" FOREIGN KEY ("segmentId") REFERENCES "TranscriptSegment"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Questions table
CREATE TABLE "Question" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "meetingId" TEXT NOT NULL,
    "slideId" TEXT,
    "questionText" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "asked" BOOLEAN NOT NULL DEFAULT false,
    "askedAt" TIMESTAMP(3),
    "answer" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Question_meetingId_fkey" FOREIGN KEY ("meetingId") REFERENCES "Meeting"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Question_slideId_fkey" FOREIGN KEY ("slideId") REFERENCES "Slide"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- ResearchResult table
CREATE TABLE "ResearchResult" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "claimId" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "summary" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ResearchResult_claimId_fkey" FOREIGN KEY ("claimId") REFERENCES "Claim"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Competitors table
CREATE TABLE "Competitor" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "dealId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "website" TEXT,
    "fundingStage" TEXT,
    "totalFunding" DOUBLE PRECISION,
    "lastRound" TEXT,
    "niche" TEXT,
    "revenue" DOUBLE PRECISION,
    "employees" INTEGER,
    "founded" INTEGER,
    "description" TEXT,
    "moat" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Competitor_dealId_fkey" FOREIGN KEY ("dealId") REFERENCES "Deal"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Insights table
CREATE TABLE "Insight" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "dealId" TEXT NOT NULL,
    "slideId" TEXT,
    "insightType" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "severity" TEXT,
    "data" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Insight_dealId_fkey" FOREIGN KEY ("dealId") REFERENCES "Deal"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Insight_slideId_fkey" FOREIGN KEY ("slideId") REFERENCES "Slide"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- FollowUp table
CREATE TABLE "FollowUp" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "meetingId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "dueDate" TIMESTAMP(3),
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "FollowUp_meetingId_fkey" FOREIGN KEY ("meetingId") REFERENCES "Meeting"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Email table
CREATE TABLE "Email" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "meetingId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "to" TEXT[] NOT NULL,
    "cc" TEXT[] NOT NULL,
    "sent" BOOLEAN NOT NULL DEFAULT false,
    "sentAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Email_meetingId_fkey" FOREIGN KEY ("meetingId") REFERENCES "Meeting"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- MeetingShare table
CREATE TABLE "MeetingShare" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "meetingId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "sharedBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "MeetingShare_meetingId_fkey" FOREIGN KEY ("meetingId") REFERENCES "Meeting"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "MeetingShare_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    UNIQUE("meetingId", "userId")
);

-- Comment table
CREATE TABLE "Comment" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "meetingId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "timestamp" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Comment_meetingId_fkey" FOREIGN KEY ("meetingId") REFERENCES "Meeting"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Comment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Create indexes for better performance
CREATE INDEX "Meeting_dealId_idx" ON "Meeting"("dealId");
CREATE INDEX "Meeting_userId_idx" ON "Meeting"("userId");
CREATE INDEX "Meeting_date_idx" ON "Meeting"("date");
CREATE INDEX "Slide_meetingId_idx" ON "Slide"("meetingId");
CREATE INDEX "TranscriptSegment_meetingId_idx" ON "TranscriptSegment"("meetingId");
CREATE INDEX "Claim_meetingId_idx" ON "Claim"("meetingId");
CREATE INDEX "Claim_slideId_idx" ON "Claim"("slideId");
CREATE INDEX "Question_meetingId_idx" ON "Question"("meetingId");
CREATE INDEX "Question_slideId_idx" ON "Question"("slideId");
CREATE INDEX "ResearchResult_claimId_idx" ON "ResearchResult"("claimId");
CREATE INDEX "Competitor_dealId_idx" ON "Competitor"("dealId");
CREATE INDEX "Insight_dealId_idx" ON "Insight"("dealId");
CREATE INDEX "Insight_slideId_idx" ON "Insight"("slideId");
CREATE INDEX "FollowUp_meetingId_idx" ON "FollowUp"("meetingId");
CREATE INDEX "Email_meetingId_idx" ON "Email"("meetingId");
CREATE INDEX "MeetingShare_meetingId_idx" ON "MeetingShare"("meetingId");
CREATE INDEX "MeetingShare_userId_idx" ON "MeetingShare"("userId");
CREATE INDEX "Comment_meetingId_idx" ON "Comment"("meetingId");
CREATE INDEX "Comment_userId_idx" ON "Comment"("userId");

-- Insert sample data (optional)
INSERT INTO "User" ("email", "name", "role") VALUES 
('analyst@vcfund.com', 'Alex Analyst', 'analyst'),
('partner@vcfund.com', 'Patricia Partner', 'partner');

INSERT INTO "Deal" ("companyName", "website", "stage", "sector", "description") VALUES 
('TechFlow AI', 'https://techflow-ai.com', 'seed', 'AI/ML', 'AI-powered workflow automation for enterprise teams'),
('HealthTrack', 'https://healthtrack.io', 'series-a', 'HealthTech', 'Remote patient monitoring and predictive health analytics');

-- Success message
SELECT 'Database schema created successfully!' as message;

