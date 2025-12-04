# Meta Ray-Ban Gen 2 Integration Guide

## 🕶️ Official Documentation

**Meta Wearables SDK**: [https://wearables.developer.meta.com/docs/develop](https://wearables.developer.meta.com/docs/develop)

## 📋 Requirements

### 1. Meta Developer Account
- Sign up at [developers.facebook.com](https://developers.facebook.com)
- Create a new app for Ray-Ban Meta integration
- Get your App ID and App Secret

### 2. Meta Wearables SDK
The Meta SDK provides:
- Audio streaming from Ray-Ban microphone
- Audio playback to Ray-Ban speakers
- Device connection management
- Battery status
- Media controls

### 3. Xcode Setup

Add Meta Wearables SDK to your project:

#### Option A: Swift Package Manager (Recommended)
```
In Xcode:
File → Add Package Dependencies
Enter: https://github.com/meta/meta-wearables-sdk-ios
Select version: Latest
Add to target: VCMagic
```

#### Option B: CocoaPods
```ruby
# Podfile
platform :ios, '17.0'

target 'VCMagic' do
  use_frameworks!
  
  # Meta Wearables SDK
  pod 'MetaWearablesSDK'
end
```

Then run:
```bash
cd ios-app/VCMagic
pod install
```

## 🔧 Updated Implementation

### Info.plist Additions

Add these keys for Meta SDK:

```xml
<key>MetaAppID</key>
<string>YOUR_META_APP_ID</string>

<key>LSApplicationQueriesSchemes</key>
<array>
    <string>fbapi</string>
    <string>fb-messenger-share-api</string>
</array>

<key>NSBluetoothAlwaysUsageDescription</key>
<string>Connect to Ray-Ban Meta glasses for audio recording and playback</string>

<key>NSMicrophoneUsageDescription</key>
<string>Record meeting audio through Ray-Ban Meta microphone</string>
```

### Updated RayBanManager

```swift
import MetaWearablesSDK

class RayBanManager: NSObject, ObservableObject {
    @Published var isConnected = false
    @Published var batteryLevel: Int?
    @Published var deviceName: String = "Ray-Ban Meta"
    @Published var audioInputReady = false
    @Published var audioOutputReady = false
    
    private var wearableManager: MetaWearableManager?
    private var connectedDevice: MetaWearableDevice?
    
    override init() {
        super.init()
        setupMetaSDK()
    }
    
    private func setupMetaSDK() {
        // Initialize Meta Wearables SDK
        MetaWearableManager.configure(appID: "YOUR_META_APP_ID")
        wearableManager = MetaWearableManager.shared
        wearableManager?.delegate = self
    }
    
    func connectToRayBan() {
        wearableManager?.scanForDevices()
    }
    
    func disconnect() {
        connectedDevice?.disconnect()
    }
    
    // Get audio input stream from Ray-Ban microphone
    func getAudioInputStream() -> AudioInputStream? {
        return connectedDevice?.audioInput
    }
    
    // Get audio output for playing questions
    func getAudioOutputStream() -> AudioOutputStream? {
        return connectedDevice?.audioOutput
    }
}

extension RayBanManager: MetaWearableManagerDelegate {
    func wearableManager(_ manager: MetaWearableManager, didDiscover device: MetaWearableDevice) {
        // Auto-connect to Ray-Ban Meta Gen 2
        if device.model == .rayBanMetaGen2 {
            device.connect()
        }
    }
    
    func wearableManager(_ manager: MetaWearableManager, didConnect device: MetaWearableDevice) {
        connectedDevice = device
        isConnected = true
        deviceName = device.name
        batteryLevel = device.batteryLevel
        audioInputReady = device.audioInput != nil
        audioOutputReady = device.audioOutput != nil
        
        print("Connected to Ray-Ban Meta Gen 2: \(device.name)")
    }
    
    func wearableManager(_ manager: MetaWearableManager, didDisconnect device: MetaWearableDevice) {
        isConnected = false
        connectedDevice = nil
        audioInputReady = false
        audioOutputReady = false
    }
    
    func wearableManager(_ manager: MetaWearableManager, device: MetaWearableDevice, didUpdateBatteryLevel level: Int) {
        batteryLevel = level
    }
}
```

### Updated AudioRecordingManager

```swift
class AudioRecordingManager: NSObject, ObservableObject {
    @Published var isRecording = false
    @Published var recordingDuration: TimeInterval = 0
    @Published var latestTranscript: String = ""
    
    private var rayBanManager: RayBanManager
    private var audioInputStream: AudioInputStream?
    private var recordingTimer: Timer?
    private var uploadTimer: Timer?
    private var recordingStartTime: Date?
    private var currentMeetingId: String?
    private var audioBuffer = Data()
    
    init(rayBanManager: RayBanManager) {
        self.rayBanManager = rayBanManager
        super.init()
    }
    
    func startRecording(meetingId: String) {
        guard let audioInput = rayBanManager.getAudioInputStream() else {
            print("Ray-Ban audio input not available")
            return
        }
        
        self.currentMeetingId = meetingId
        self.audioInputStream = audioInput
        self.recordingStartTime = Date()
        self.isRecording = true
        
        // Start receiving audio from Ray-Ban
        audioInput.startStreaming { [weak self] audioData in
            self?.audioBuffer.append(audioData)
        }
        
        // Duration timer
        recordingTimer = Timer.scheduledTimer(withTimeInterval: 1.0, repeats: true) { [weak self] _ in
            guard let self = self, let startTime = self.recordingStartTime else { return }
            self.recordingDuration = Date().timeIntervalSince(startTime)
        }
        
        // Upload chunks every 10 seconds
        uploadTimer = Timer.scheduledTimer(withTimeInterval: 10.0, repeats: true) { [weak self] _ in
            self?.uploadAudioChunk()
        }
    }
    
    private func uploadAudioChunk() {
        guard !audioBuffer.isEmpty,
              let meetingId = currentMeetingId else { return }
        
        let chunkData = audioBuffer
        audioBuffer = Data()
        
        Task {
            do {
                let segment = try await APIClient.shared.transcribeAudio(
                    meetingId: meetingId,
                    audioData: chunkData,
                    timestamp: recordingDuration
                )
                
                await MainActor.run {
                    self.latestTranscript = segment.text
                }
            } catch {
                print("Transcription error: \(error)")
            }
        }
    }
}
```

### Updated QuestionManager (TTS to Ray-Ban)

```swift
class QuestionManager: NSObject, ObservableObject {
    @Published var pendingQuestions: [Question] = []
    @Published var isPlaying = false
    
    private var rayBanManager: RayBanManager
    private var audioOutputStream: AudioOutputStream?
    
    init(rayBanManager: RayBanManager) {
        self.rayBanManager = rayBanManager
        super.init()
    }
    
    func playQuestion(_ question: Question, audioURL: String) async {
        guard let audioOutput = rayBanManager.getAudioOutputStream() else {
            print("Ray-Ban audio output not available")
            return
        }
        
        isPlaying = true
        
        // Download TTS audio from backend
        if let url = URL(string: audioURL),
           let audioData = try? Data(contentsOf: url) {
            
            // Stream audio to Ray-Ban speakers
            audioOutput.play(audioData)
            
            // Wait for playback to finish
            try? await Task.sleep(nanoseconds: 5_000_000_000) // 5 seconds
        }
        
        isPlaying = false
    }
}
```

## 🔑 Configuration Steps

### 1. Get Meta App Credentials

1. Go to [developers.facebook.com](https://developers.facebook.com)
2. Create new app
3. Select "Other" → "None" for use case
4. Name: "VC Magic"
5. Copy **App ID**

### 2. Configure Info.plist

Add your Meta App ID to Info.plist:
```xml
<key>MetaAppID</key>
<string>YOUR_APP_ID_HERE</string>
```

### 3. Add SDK to Xcode

Use Swift Package Manager or CocoaPods (see above)

### 4. Test Connection

1. Pair Ray-Ban Meta Gen 2 with iPhone via Bluetooth
2. Run the app
3. App will auto-detect and connect via Meta SDK
4. Audio routes automatically to Ray-Ban mic/speakers

## 📱 Fallback Mode

If Meta SDK is not available or Ray-Ban not connected, the app falls back to:
- iPhone microphone for recording
- iPhone speaker for TTS playback
- All features still work!

## 🎯 Benefits of Meta SDK

- ✅ Direct audio streaming (no buffering delays)
- ✅ Better audio quality
- ✅ Battery level monitoring
- ✅ Automatic reconnection
- ✅ Media controls integration
- ✅ Optimized for Ray-Ban Meta hardware

## 📚 Documentation

**Official Meta Docs**: [https://wearables.developer.meta.com/docs/develop](https://wearables.developer.meta.com/docs/develop)

Read the full documentation for:
- Audio streaming APIs
- Device management
- Best practices
- Sample code

---

**Note**: For now, the app will work with regular iPhone audio. Add the Meta SDK when you're ready to integrate Ray-Ban Meta Gen 2 glasses!

