# VC Copilot iOS App - Development Guide

## 🎯 Overview

Build a native iOS app that:
- Connects to Ray-Ban Meta Gen 2 glasses (Bluetooth audio)
- Records meeting audio and sends to backend
- Captures slides (camera or upload)
- Receives AI-generated questions
- Plays questions through Ray-Ban speakers (TTS)
- Manages meeting lifecycle

## 🏗️ Architecture

```
┌─────────────────────────────────────┐
│        Ray-Ban Meta Gen 2           │
│     (Bluetooth Mic + Speaker)       │
└────────────┬────────────────────────┘
             │ Bluetooth
┌────────────▼────────────────────────┐
│         iOS App (Swift)              │
│                                      │
│  - Audio Recording Manager           │
│  - Bluetooth Manager (Ray-Ban)       │
│  - Camera/Photo Manager              │
│  - API Client                        │
│  - TTS Playback Manager              │
│                                      │
└────────────┬────────────────────────┘
             │ HTTPS
┌────────────▼────────────────────────┐
│   Backend API (Vercel)               │
│   https://vc-vision.vercel.app       │
└──────────────────────────────────────┘
```

## 📋 Tech Stack

- **Language**: Swift 5.9+
- **UI Framework**: SwiftUI
- **Minimum iOS**: 17.0
- **Bluetooth**: CoreBluetooth
- **Audio**: AVFoundation
- **Camera**: AVFoundation/PhotosUI
- **Networking**: URLSession / Alamofire
- **Audio Playback**: AVAudioPlayer

## 🎯 Core Features

### 1. Ray-Ban Meta Gen 2 Integration

The Ray-Ban Meta Gen 2 connects via Bluetooth and provides:
- **Microphone input** - Record meeting audio
- **Speaker output** - Play TTS questions
- **Standard Bluetooth Audio Profile**

```swift
// Bluetooth Manager for Ray-Ban
class RayBanManager: NSObject, ObservableObject {
    private var centralManager: CBCentralManager!
    @Published var isConnected = false
    @Published var audioDevice: AVAudioSessionPortDescription?
    
    // Connect to Ray-Ban glasses
    func connectToRayBan() {
        // Scan for Bluetooth devices
        // Connect to Ray-Ban Meta Gen 2
        // Set as audio input/output
    }
}
```

### 2. Audio Recording

Record audio chunks and stream to backend:

```swift
class AudioRecordingManager: ObservableObject {
    private var audioEngine: AVAudioEngine!
    private var audioFile: AVAudioFile?
    
    @Published var isRecording = false
    @Published var recordingDuration: TimeInterval = 0
    
    func startRecording(meetingId: String) {
        // Configure audio session for Ray-Ban input
        // Start recording in chunks (5-10 seconds)
        // Send each chunk to backend API
    }
    
    func sendAudioChunk(data: Data, timestamp: Double) async {
        // POST /api/transcribe
        // Receive transcript back
    }
}
```

### 3. Slide Capture

Capture slides via camera or photo library:

```swift
class SlideCaptureManager: ObservableObject {
    @Published var capturedSlides: [UIImage] = []
    @Published var currentSlideNumber = 1
    
    func captureSlide() async -> UIImage? {
        // Open camera
        // Capture slide image
        // Upload to backend
        // Return image
    }
    
    func uploadSlide(image: UIImage, slideNumber: Int) async {
        // Convert to JPEG
        // POST /api/slides
        // Trigger analysis
    }
}
```

### 4. Question Playback

Receive and play AI-generated questions:

```swift
class QuestionPlayer: ObservableObject {
    @Published var pendingQuestions: [Question] = []
    private var audioPlayer: AVAudioPlayer?
    
    func fetchQuestions(meetingId: String) async {
        // GET /api/meetings?id={meetingId}
        // Filter for asked: false
        // Download TTS audio URLs
    }
    
    func playQuestion(question: Question) {
        // Play audio through Ray-Ban speakers
        // Mark as asked after playing
    }
}
```

## 📱 App Screens

### 1. Home Screen
- Start new meeting
- View recent meetings
- Settings

### 2. Meeting Setup
- Select deal
- Enter meeting title
- Connect to Ray-Ban glasses

### 3. Active Meeting Screen
- Recording indicator
- Transcript (real-time)
- Slide counter
- Capture slide button
- Next question button
- End meeting button

### 4. Question Queue
- List of pending questions
- Play button for each
- Mark as asked
- View answer field

### 5. Meeting Summary
- View full transcript
- All slides
- All questions
- Generate final summary

## 🔌 API Integration

### Base URL
```swift
let baseURL = "https://vc-vision.vercel.app"
```

### API Client

```swift
class VCCopilotAPI {
    static let shared = VCCopilotAPI()
    private let baseURL = "https://vc-vision.vercel.app"
    
    // Create meeting
    func createMeeting(dealId: String, userId: String, title: String) async throws -> Meeting {
        let url = URL(string: "\(baseURL)/api/meetings")!
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        
        let body = [
            "dealId": dealId,
            "userId": userId,
            "title": title
        ]
        request.httpBody = try JSONEncoder().encode(body)
        
        let (data, _) = try await URLSession.shared.data(for: request)
        let response = try JSONDecoder().decode(MeetingResponse.self, from: data)
        return response.meeting
    }
    
    // Upload audio chunk
    func transcribeAudio(meetingId: String, audio: Data, timestamp: Double) async throws -> TranscriptSegment {
        let url = URL(string: "\(baseURL)/api/transcribe")!
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        
        // Multipart form data
        let boundary = UUID().uuidString
        request.setValue("multipart/form-data; boundary=\(boundary)", forHTTPHeaderField: "Content-Type")
        
        var body = Data()
        // Add audio file
        body.append("--\(boundary)\r\n".data(using: .utf8)!)
        body.append("Content-Disposition: form-data; name=\"audio\"; filename=\"audio.m4a\"\r\n".data(using: .utf8)!)
        body.append("Content-Type: audio/m4a\r\n\r\n".data(using: .utf8)!)
        body.append(audio)
        body.append("\r\n".data(using: .utf8)!)
        
        // Add meetingId
        body.append("--\(boundary)\r\n".data(using: .utf8)!)
        body.append("Content-Disposition: form-data; name=\"meetingId\"\r\n\r\n".data(using: .utf8)!)
        body.append("\(meetingId)\r\n".data(using: .utf8)!)
        
        // Add timestamp
        body.append("--\(boundary)\r\n".data(using: .utf8)!)
        body.append("Content-Disposition: form-data; name=\"timestamp\"\r\n\r\n".data(using: .utf8)!)
        body.append("\(timestamp)\r\n".data(using: .utf8)!)
        body.append("--\(boundary)--\r\n".data(using: .utf8)!)
        
        request.httpBody = body
        
        let (data, _) = try await URLSession.shared.data(for: request)
        let response = try JSONDecoder().decode(TranscribeResponse.self, from: data)
        return response.segment
    }
    
    // Upload slide
    func uploadSlide(meetingId: String, image: UIImage, slideNumber: Int, timestamp: Double?) async throws -> Slide {
        let url = URL(string: "\(baseURL)/api/slides")!
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        
        guard let imageData = image.jpegData(compressionQuality: 0.85) else {
            throw APIError.invalidImage
        }
        
        let boundary = UUID().uuidString
        request.setValue("multipart/form-data; boundary=\(boundary)", forHTTPHeaderField: "Content-Type")
        
        var body = Data()
        // Add image
        body.append("--\(boundary)\r\n".data(using: .utf8)!)
        body.append("Content-Disposition: form-data; name=\"image\"; filename=\"slide.jpg\"\r\n".data(using: .utf8)!)
        body.append("Content-Type: image/jpeg\r\n\r\n".data(using: .utf8)!)
        body.append(imageData)
        body.append("\r\n".data(using: .utf8)!)
        
        // Add meetingId and slideNumber
        body.append("--\(boundary)\r\n".data(using: .utf8)!)
        body.append("Content-Disposition: form-data; name=\"meetingId\"\r\n\r\n".data(using: .utf8)!)
        body.append("\(meetingId)\r\n".data(using: .utf8)!)
        
        body.append("--\(boundary)\r\n".data(using: .utf8)!)
        body.append("Content-Disposition: form-data; name=\"slideNumber\"\r\n\r\n".data(using: .utf8)!)
        body.append("\(slideNumber)\r\n".data(using: .utf8)!)
        
        if let timestamp = timestamp {
            body.append("--\(boundary)\r\n".data(using: .utf8)!)
            body.append("Content-Disposition: form-data; name=\"timestamp\"\r\n\r\n".data(using: .utf8)!)
            body.append("\(timestamp)\r\n".data(using: .utf8)!)
        }
        
        body.append("--\(boundary)--\r\n".data(using: .utf8)!)
        request.httpBody = body
        
        let (data, _) = try await URLSession.shared.data(for: request)
        let response = try JSONDecoder().decode(SlideResponse.self, from: data)
        return response.slide
    }
    
    // Analyze slide
    func analyzeSlide(slideId: String) async throws -> SlideAnalysis {
        let url = URL(string: "\(baseURL)/api/slides/intel")!
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        
        let body = ["slideId": slideId]
        request.httpBody = try JSONEncoder().encode(body)
        
        let (data, _) = try await URLSession.shared.data(for: request)
        return try JSONDecoder().decode(SlideAnalysis.self, from: data)
    }
    
    // Get pending questions
    func getPendingQuestions(meetingId: String) async throws -> [Question] {
        let url = URL(string: "\(baseURL)/api/meetings?id=\(meetingId)")!
        let (data, _) = try await URLSession.shared.data(from: url)
        let response = try JSONDecoder().decode(MeetingDetailResponse.self, from: data)
        return response.meeting.questions.filter { !$0.asked }
    }
    
    // Mark question as asked
    func markQuestionAsked(meetingId: String, questionId: String) async throws {
        // Update question status
    }
    
    // Complete meeting
    func completeMeeting(meetingId: String) async throws -> MeetingSummary {
        let url = URL(string: "\(baseURL)/api/meetings/summary")!
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        
        let body = ["meetingId": meetingId]
        request.httpBody = try JSONEncoder().encode(body)
        
        let (data, _) = try await URLSession.shared.data(for: request)
        return try JSONDecoder().decode(MeetingSummary.self, from: data)
    }
}
```

## 📦 Data Models

```swift
struct Meeting: Codable, Identifiable {
    let id: String
    let dealId: String
    let userId: String
    let title: String
    let date: Date
    let status: String
    var duration: Int?
    var summary: String?
    var keyTakeaways: [String]?
}

struct Slide: Codable, Identifiable {
    let id: String
    let meetingId: String
    let slideNumber: Int
    let imageUrl: String?
    var text: String?
}

struct Question: Codable, Identifiable {
    let id: String
    let meetingId: String
    let slideId: String?
    let questionText: String
    let category: String
    let priority: Int
    var asked: Bool
    var answer: String?
}

struct TranscriptSegment: Codable, Identifiable {
    let id: String
    let meetingId: String
    let speaker: String
    let text: String
    let timestamp: Double
}
```

## 🎬 User Flow

### Starting a Meeting

1. User opens app
2. Taps "New Meeting"
3. Selects deal from list
4. Enters meeting title
5. App checks Ray-Ban connection
6. Taps "Start Recording"
7. API creates meeting → Returns meetingId
8. Audio recording begins
9. Transcript appears in real-time

### During Meeting

1. Audio chunks sent every 5-10 seconds
2. Transcript updates automatically
3. User taps "Capture Slide"
4. Slide uploaded → Analysis begins
5. Questions generated within 10 seconds
6. App plays top question through Ray-Ban
7. User listens, marks as asked
8. Repeat for each slide

### Ending Meeting

1. User taps "End Meeting"
2. App stops recording
3. Calls `/api/meetings/summary`
4. Shows summary screen
5. User can share or export

## 🔧 Development Steps

### Phase 1: Basic Structure (Week 1)
- [ ] Create Xcode project
- [ ] Set up SwiftUI views
- [ ] Implement API client
- [ ] Test basic API calls

### Phase 2: Audio (Week 2)
- [ ] Implement audio recording
- [ ] Test chunked upload
- [ ] Verify transcription works
- [ ] Add Ray-Ban Bluetooth support

### Phase 3: Slides & Questions (Week 3)
- [ ] Camera integration
- [ ] Slide upload
- [ ] Question fetching
- [ ] TTS playback through Ray-Ban

### Phase 4: Polish (Week 4)
- [ ] UI refinements
- [ ] Error handling
- [ ] Offline support
- [ ] Testing

## 📝 Next Steps

1. **Create Xcode Project**
   - iOS App
   - SwiftUI
   - Minimum iOS 17.0

2. **Set up Dependencies**
   - No external dependencies needed (use native APIs)

3. **Start with API Client**
   - Test connection to `https://vc-vision.vercel.app`
   - Implement meeting creation

4. **Build Audio Recording**
   - Use AVFoundation
   - Test chunked upload

5. **Add Ray-Ban Integration**
   - Bluetooth scanning
   - Audio routing

## 🚀 Ready to Build?

Your backend is live and ready at:
**https://vc-vision.vercel.app**

All API endpoints are documented in **API_CONTRACTS.md**

Let me know when you're ready to start coding the iOS app!

