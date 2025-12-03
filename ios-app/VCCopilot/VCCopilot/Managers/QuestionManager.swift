//
//  QuestionManager.swift
//  VCCopilot
//
//  Manages AI-generated questions and TTS playback
//

import Foundation
import AVFoundation

class QuestionManager: NSObject, ObservableObject {
    @Published var pendingQuestions: [Question] = []
    @Published var askedQuestions: [Question] = []
    @Published var isPlaying = false
    @Published var currentQuestion: Question?
    
    private var audioPlayer: AVAudioPlayer?
    private var audioCache: [String: Data] = [:]
    
    override init() {
        super.init()
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
    
    func playQuestion(_ question: Question) async {
        await MainActor.run {
            self.currentQuestion = question
            self.isPlaying = true
        }
        
        // Use iOS TTS to speak the question
        let utterance = AVSpeechUtterance(string: question.questionText)
        utterance.voice = AVSpeechSynthesisVoice(language: "en-US")
        utterance.rate = 0.5
        
        let synthesizer = AVSpeechSynthesizer()
        synthesizer.speak(utterance)
        
        // Wait for speech to finish
        try? await Task.sleep(nanoseconds: UInt64(question.questionText.count) * 50_000_000)
        
        await MainActor.run {
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

