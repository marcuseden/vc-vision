//
//  AudioRecordingManager.swift
//  VCMagic
//
//  Manages audio recording and chunked upload
//

import Foundation
import AVFoundation

class AudioRecordingManager: NSObject, ObservableObject {
    @Published var isRecording = false
    @Published var recordingDuration: TimeInterval = 0
    @Published var latestTranscript: String = ""
    @Published var recordingSource: String = "iPhone"
    
    private var audioRecorder: AVAudioRecorder?
    private var recordingTimer: Timer?
    private var chunkTimer: Timer?
    private var recordingStartTime: Date?
    private var currentMeetingId: String?
    private weak var rayBanManager: RayBanManager?
    
    private let chunkInterval: TimeInterval = 10.0 // Send chunk every 10 seconds
    
    init(rayBanManager: RayBanManager) {
        self.rayBanManager = rayBanManager
        super.init()
        setupAudioSession()
    }
    
    override init() {
        super.init()
        setupAudioSession()
    }
    
    private func setupAudioSession() {
        do {
            let session = AVAudioSession.sharedInstance()
            try session.setCategory(.record, mode: .measurement, options: [])
            try session.setActive(true)
        } catch {
            print("Failed to set up audio session: \(error)")
        }
    }
    
    func startRecording(meetingId: String) {
        self.currentMeetingId = meetingId
        
        // Check if Ray-Ban is connected and use it
        if let rayBan = rayBanManager {
            rayBan.forceRayBanRoute()
            recordingSource = rayBan.isConnected ? rayBan.deviceName : "iPhone"
        }
        
        let audioFilename = getDocumentsDirectory().appendingPathComponent("recording-\(Date().timeIntervalSince1970).m4a")
        
        let settings = [
            AVFormatIDKey: Int(kAudioFormatMPEG4AAC),
            AVSampleRateKey: 16000,  // 16kHz is optimal for speech
            AVNumberOfChannelsKey: 1,
            AVEncoderAudioQualityKey: AVAudioQuality.high.rawValue,
            AVEncoderBitRateKey: 64000  // 64kbps for good quality, small size
        ]
        
        do {
            // Configure audio session for Ray-Ban or iPhone
            let session = AVAudioSession.sharedInstance()
            try session.setCategory(.playAndRecord, mode: .videoChat, options: [.allowBluetooth, .allowBluetoothA2DP])
            try session.setActive(true)
            
            audioRecorder = try AVAudioRecorder(url: audioFilename, settings: settings)
            audioRecorder?.record()
            
            isRecording = true
            recordingStartTime = Date()
            
            print("🎙️ Recording started using: \(recordingSource)")
            
            // Start duration timer
            recordingTimer = Timer.scheduledTimer(withTimeInterval: 1.0, repeats: true) { [weak self] _ in
                guard let self = self, let startTime = self.recordingStartTime else { return }
                self.recordingDuration = Date().timeIntervalSince(startTime)
            }
            
            // Start chunk upload timer (every 10 seconds)
            chunkTimer = Timer.scheduledTimer(withTimeInterval: chunkInterval, repeats: true) { [weak self] _ in
                self?.sendAudioChunk()
            }
            
        } catch {
            print("❌ Failed to start recording: \(error)")
        }
    }
    
    func stopRecording() {
        audioRecorder?.stop()
        isRecording = false
        
        recordingTimer?.invalidate()
        chunkTimer?.invalidate()
        
        // Send final chunk
        sendAudioChunk()
    }
    
    private func sendAudioChunk() {
        guard let meetingId = currentMeetingId,
              let audioURL = audioRecorder?.url else { return }
        
        Task {
            do {
                let audioData = try Data(contentsOf: audioURL)
                let timestamp = recordingDuration
                
                let segment = try await APIClient.shared.transcribeAudio(
                    meetingId: meetingId,
                    audioData: audioData,
                    timestamp: timestamp
                )
                
                await MainActor.run {
                    self.latestTranscript = segment.text
                }
                
                print("Transcribed: \(segment.text)")
                
            } catch {
                print("Failed to transcribe audio chunk: \(error)")
            }
        }
    }
    
    private func getDocumentsDirectory() -> URL {
        FileManager.default.urls(for: .documentDirectory, in: .userDomainMask)[0]
    }
}

