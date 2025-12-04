//
//  QuestionManager.swift
//  VCMagic
//
//  Manages AI-generated questions and TTS playback through Ray-Ban Meta Gen 2
//

import Foundation
import AVFoundation

class QuestionManager: NSObject, ObservableObject, AVSpeechSynthesizerDelegate {
    @Published var pendingQuestions: [Question] = []
    @Published var askedQuestions: [Question] = []
    @Published var isPlaying = false
    @Published var currentQuestion: Question?
    @Published var playbackDevice: String = "iPhone"
    
    private var audioPlayer: AVAudioPlayer?
    private var audioCache: [String: Data] = [:]
    private var speechSynthesizer: AVSpeechSynthesizer?
    private weak var rayBanManager: RayBanManager?
    
    init(rayBanManager: RayBanManager) {
        self.rayBanManager = rayBanManager
        super.init()
        self.speechSynthesizer = AVSpeechSynthesizer()
        self.speechSynthesizer?.delegate = self
    }
    
    override init() {
        super.init()
        self.speechSynthesizer = AVSpeechSynthesizer()
        self.speechSynthesizer?.delegate = self
    }
    
    func fetchQuestions(meetingId: String) async {
        do {
            let meeting = try await APIClient.shared.getMeeting(id: meetingId)
            
            await MainActor.run {
                let unasked = meeting.questions?.filter { !$0.asked } ?? []
                self.pendingQuestions = unasked.sorted { $0.priority > $1.priority }
            }
            
            // Preload TTS audio for top questions
            await preloadQuestionAudio()
            
        } catch {
            print("Failed to fetch questions: \(error)")
        }
    }
    
    private func preloadQuestionAudio() async {
        // In production, download TTS audio from questionAudio URLs
        // For now, this is a placeholder
    }
    
    func playQuestion(_ question: Question, audioURL: String? = nil) async {
        await MainActor.run {
            self.currentQuestion = question
            self.isPlaying = true
            self.playbackDevice = rayBanManager?.isConnected == true ? rayBanManager?.deviceName ?? "Ray-Ban" : "iPhone"
        }
        
        // Configure audio session for playback through Ray-Ban
        do {
            let session = AVAudioSession.sharedInstance()
            try session.setCategory(.playAndRecord, mode: .voiceChat, options: [.allowBluetooth, .allowBluetoothA2DP])
            try session.setActive(true)
            
            // If backend provides TTS audio URL, download and play
            if let audioURL = audioURL,
               let url = URL(string: audioURL),
               let audioData = try? Data(contentsOf: url) {
                
                let tempURL = FileManager.default.temporaryDirectory.appendingPathComponent("question.mp3")
                try audioData.write(to: tempURL)
                
                audioPlayer = try AVAudioPlayer(contentsOf: tempURL)
                audioPlayer?.play()
                
                // Wait for playback
                let duration = audioPlayer?.duration ?? 5.0
                try? await Task.sleep(nanoseconds: UInt64(duration * 1_000_000_000))
                
            } else {
                // Fallback to iOS TTS (plays through Ray-Ban if connected)
                let utterance = AVSpeechUtterance(string: question.questionText)
                utterance.voice = AVSpeechSynthesisVoice(language: "en-US")
                utterance.rate = 0.48  // Natural speaking pace
                utterance.pitchMultiplier = 1.0
                utterance.volume = 1.0
                
                speechSynthesizer?.speak(utterance)
                
                // Estimate duration
                let estimatedDuration = Double(question.questionText.count) * 0.05  // ~50ms per character
                try? await Task.sleep(nanoseconds: UInt64(estimatedDuration * 1_000_000_000))
            }
            
            print("🔊 Played question through: \(playbackDevice)")
            
        } catch {
            print("❌ Failed to play question: \(error)")
        }
        
        await MainActor.run {
            self.isPlaying = false
        }
    }
    
    // AVSpeechSynthesizerDelegate
    func speechSynthesizer(_ synthesizer: AVSpeechSynthesizer, didFinish utterance: AVSpeechUtterance) {
        Task { @MainActor in
            self.isPlaying = false
        }
    }
    
    func markAsAsked(_ question: Question) {
        if let index = pendingQuestions.firstIndex(where: { $0.id == question.id }) {
            var updatedQuestion = question
            updatedQuestion.asked = true
            updatedQuestion.askedAt = Date()
            
            pendingQuestions.remove(at: index)
            askedQuestions.append(updatedQuestion)
            
            // TODO: Update backend
        }
    }
    
    func reset() {
        pendingQuestions.removeAll()
        askedQuestions.removeAll()
        currentQuestion = nil
        isPlaying = false
    }
}

