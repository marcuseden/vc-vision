//
//  AudioRecordingManager.swift
//  VCCopilot
//
//  Manages audio recording and chunked upload
//

import Foundation
import AVFoundation

class AudioRecordingManager: NSObject, ObservableObject {
    @Published var isRecording = false
    @Published var recordingDuration: TimeInterval = 0
    @Published var latestTranscript: String = ""
    
    private var audioRecorder: AVAudioRecorder?
    private var recordingTimer: Timer?
    private var chunkTimer: Timer?
    private var recordingStartTime: Date?
    private var currentMeetingId: String?
    
    private let chunkInterval: TimeInterval = 10.0 // Send chunk every 10 seconds
    
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
        
        let audioFilename = getDocumentsDirectory().appendingPathComponent("recording.m4a")
        
        let settings = [
            AVFormatIDKey: Int(kAudioFormatMPEG4AAC),
            AVSampleRateKey: 16000,
            AVNumberOfChannelsKey: 1,
            AVEncoderAudioQualityKey: AVAudioQuality.high.rawValue
        ]
        
        do {
            audioRecorder = try AVAudioRecorder(url: audioFilename, settings: settings)
            audioRecorder?.record()
            
            isRecording = true
            recordingStartTime = Date()
            
            // Start duration timer
            recordingTimer = Timer.scheduledTimer(withTimeInterval: 1.0, repeats: true) { [weak self] _ in
                guard let self = self, let startTime = self.recordingStartTime else { return }
                self.recordingDuration = Date().timeIntervalSince(startTime)
            }
            
            // Start chunk upload timer
            chunkTimer = Timer.scheduledTimer(withTimeInterval: chunkInterval, repeats: true) { [weak self] _ in
                self?.sendAudioChunk()
            }
            
        } catch {
            print("Failed to start recording: \(error)")
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

