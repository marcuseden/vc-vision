# VC Magic - API Contracts for iOS App

This document defines the API contracts between the iOS companion app and the Next.js backend.

## Base URL

```
Development: http://localhost:3000
Production: https://your-domain.com
```

## Authentication

All requests must include authentication headers:

```
Authorization: Bearer <supabase_jwt_token>
```

## Endpoints for iOS App

### 1. Create Meeting

Start a new meeting session.

**Endpoint:** `POST /api/meetings`

**Request Body:**
```json
{
  "dealId": "string (required)",
  "userId": "string (required)",
  "title": "string (required)",
  "date": "ISO 8601 datetime (optional, defaults to now)"
}
```

**Response:**
```json
{
  "success": true,
  "meeting": {
    "id": "string",
    "dealId": "string",
    "userId": "string",
    "title": "string",
    "date": "datetime",
    "status": "in_progress",
    "deal": {
      "companyName": "string",
      "sector": "string"
    }
  }
}
```

### 2. Upload Audio Chunk

Send audio for real-time transcription.

**Endpoint:** `POST /api/transcribe`

**Request:** `multipart/form-data`

**Form Data:**
```
audio: File (required) - audio file (m4a, mp3, wav)
meetingId: string (required)
timestamp: number (required) - seconds from meeting start
```

**Response:**
```json
{
  "success": true,
  "segment": {
    "id": "string",
    "text": "transcribed text",
    "timestamp": 0.0,
    "speaker": "founder"
  },
  "transcriptText": "string"
}
```

### 3. Upload Slide

Send slide image for analysis.

**Endpoint:** `POST /api/slides`

**Request:** `multipart/form-data`

**Form Data:**
```
image: File (required) - slide image (jpg, png)
meetingId: string (required)
slideNumber: number (required)
timestamp: number (optional) - seconds from meeting start
```

**Response:**
```json
{
  "success": true,
  "slide": {
    "id": "string",
    "meetingId": "string",
    "slideNumber": 1,
    "imageUrl": "https://...",
    "timestamp": "datetime"
  }
}
```

### 4. Request Slide Analysis

Trigger AI analysis of a slide.

**Endpoint:** `POST /api/slides/intel`

**Request Body:**
```json
{
  "slideId": "string (required)"
}
```

**Response:**
```json
{
  "success": true,
  "analysis": {
    "text": "extracted text",
    "description": "visual description",
    "keyPoints": ["point 1", "point 2"]
  },
  "claims": [
    {
      "text": "claim text",
      "type": "metric",
      "confidence": 0.85
    }
  ],
  "questions": [
    {
      "id": "string",
      "text": "question text",
      "category": "verification",
      "priority": 8
    }
  ],
  "questionAudio": [
    {
      "questionId": "string",
      "audioUrl": "https://..."
    }
  ]
}
```

### 5. Get Pending Questions

Retrieve unanswered questions for the meeting.

**Endpoint:** `GET /api/meetings?id={meetingId}`

Look for `questions` array in response, filter by `asked: false`.

**Response:**
```json
{
  "meeting": {
    "id": "string",
    "questions": [
      {
        "id": "string",
        "questionText": "What is your CAC?",
        "category": "verification",
        "priority": 8,
        "asked": false
      }
    ]
  }
}
```

### 6. Mark Question as Asked

Update question status after asking.

**Endpoint:** `PATCH /api/meetings`

**Request Body:**
```json
{
  "meetingId": "string (required)",
  "questions": {
    "update": {
      "where": { "id": "question_id" },
      "data": { "asked": true, "askedAt": "datetime" }
    }
  }
}
```

### 7. Complete Meeting

Mark meeting as completed and trigger summary generation.

**Endpoint:** `POST /api/meetings/summary`

**Request Body:**
```json
{
  "meetingId": "string (required)"
}
```

**Response:**
```json
{
  "success": true,
  "summary": {
    "executiveSummary": "string",
    "keyTakeaways": ["string"],
    "strengths": ["string"],
    "concerns": ["string"],
    "opportunities": ["string"],
    "nextSteps": ["string"],
    "recommendedAction": "further_diligence",
    "confidenceScore": 0.75
  },
  "actionItems": ["string"]
}
```

## Error Responses

All endpoints return errors in this format:

```json
{
  "success": false,
  "error": "Error message describing what went wrong"
}
```

**HTTP Status Codes:**
- `200` - Success
- `400` - Bad Request (invalid input)
- `401` - Unauthorized (missing/invalid auth)
- `404` - Not Found
- `500` - Internal Server Error

## Real-time Flow

### Meeting Recording Flow

```
1. iOS App → Create Meeting
   ├─ Start recording with Ray-Ban Mic
   └─ Receive meetingId

2. iOS App → Upload Audio Chunks (every 5-10 seconds)
   └─ Backend → Transcribes and returns text

3. iOS App → Capture slide (button press or deck upload)
   ├─ Upload Slide Image
   └─ Request Slide Analysis
       └─ Receive questions with TTS audio

4. iOS App → Play questions through Ray-Ban speakers
   └─ Mark questions as asked

5. iOS App → Complete Meeting
   └─ Backend → Generates full summary
```

### Audio Format Recommendations

- **Format:** M4A or MP3
- **Sample Rate:** 16kHz (sufficient for speech)
- **Bitrate:** 64kbps (good quality, small size)
- **Chunk Duration:** 5-10 seconds
- **Max File Size:** 25MB per chunk

### Image Format Recommendations

- **Format:** JPEG
- **Resolution:** 1920x1080 (Full HD)
- **Quality:** 85%
- **Max File Size:** 5MB

## Rate Limits

- **Audio Upload:** 1 request per second (max)
- **Slide Analysis:** 1 request per 10 seconds
- **Other endpoints:** 10 requests per second

## WebSocket (Future Enhancement)

For real-time updates, a WebSocket connection can be established:

**Endpoint:** `wss://your-domain.com/api/ws?meetingId={id}`

**Events:**
- `transcript` - New transcript segment
- `question` - New question generated
- `analysis` - Slide analysis complete

## Testing

Use these curl commands to test endpoints:

```bash
# Create Meeting
curl -X POST http://localhost:3000/api/meetings \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"dealId":"...","userId":"...","title":"Test Meeting"}'

# Upload Audio
curl -X POST http://localhost:3000/api/transcribe \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "audio=@recording.m4a" \
  -F "meetingId=..." \
  -F "timestamp=0"

# Upload Slide
curl -X POST http://localhost:3000/api/slides \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "image=@slide1.jpg" \
  -F "meetingId=..." \
  -F "slideNumber=1"
```

## iOS SDK Example (Pseudo-code)

```swift
class VCMagicClient {
    let baseURL = "https://your-domain.com"
    let authToken: String
    
    func createMeeting(dealId: String, title: String) async throws -> Meeting {
        // POST /api/meetings
    }
    
    func uploadAudio(meetingId: String, audio: Data, timestamp: Double) async throws -> TranscriptSegment {
        // POST /api/transcribe
    }
    
    func uploadSlide(meetingId: String, image: UIImage, slideNumber: Int) async throws -> Slide {
        // POST /api/slides
    }
    
    func analyzeSlide(slideId: String) async throws -> SlideAnalysis {
        // POST /api/slides/intel
    }
    
    func getPendingQuestions(meetingId: String) async throws -> [Question] {
        // GET /api/meetings?id=...
    }
    
    func completeMeeting(meetingId: String) async throws -> Summary {
        // POST /api/meetings/summary
    }
}
```

