//
//  MeetingViewModel.swift
//  VCCopilot
//
//  Main view model for meeting management
//

import Foundation
import SwiftUI

@MainActor
class MeetingViewModel: ObservableObject {
    @Published var currentMeeting: Meeting?
    @Published var transcriptSegments: [TranscriptSegment] = []
    @Published var slides: [Slide] = []
    @Published var questions: [Question] = []
    @Published var isLoading = false
    @Published var errorMessage: String?
    @Published var meetingStatus: String = "Not Started"
    
    // Managers
    let audioManager = AudioRecordingManager()
    let rayBanManager = RayBanManager()
    let slideManager = SlideCaptureManager()
    let questionManager = QuestionManager()
    
    func startMeeting(dealId: String, userId: String, title: String) async {
        isLoading = true
        errorMessage = nil
        
        do {
            let meeting = try await APIClient.shared.createMeeting(
                dealId: dealId,
                userId: userId,
                title: title
            )
            
            currentMeeting = meeting
            meetingStatus = "In Progress"
            
            // Start audio recording
            audioManager.startRecording(meetingId: meeting.id)
            
            print("Meeting started: \(meeting.id)")
            
        } catch {
            errorMessage = "Failed to start meeting: \(error.localizedDescription)"
            print(error)
        }
        
        isLoading = false
    }
    
    func captureSlide(image: UIImage) async {
        guard let meetingId = currentMeeting?.id else { return }
        
        do {
            let timestamp = audioManager.recordingDuration
            let slide = try await slideManager.captureSlide(
                image: image,
                meetingId: meetingId,
                timestamp: timestamp
            )
            
            slides.append(slide)
            
            // Analyze slide
            let analysis = try await slideManager.analyzeSlide(slideId: slide.id)
            
            // Add new questions
            questions.append(contentsOf: analysis.questions)
            
            // Sort questions by priority
            questions.sort { $0.priority > $1.priority }
            
            // Update question manager
            questionManager.pendingQuestions = questions.filter { !$0.asked }
            
            print("Slide captured and analyzed. \(analysis.questions.count) questions generated.")
            
        } catch {
            errorMessage = "Failed to capture slide: \(error.localizedDescription)"
            print(error)
        }
    }
    
    func playNextQuestion() async {
        guard let question = questionManager.pendingQuestions.first else {
            return
        }
        
        await questionManager.playQuestion(question)
    }
    
    func markQuestionAsAsked(_ question: Question) {
        questionManager.markAsAsked(question)
        
        if let index = questions.firstIndex(where: { $0.id == question.id }) {
            questions[index].asked = true
        }
    }
    
    func endMeeting() async {
        guard let meetingId = currentMeeting?.id else { return }
        
        isLoading = true
        
        // Stop recording
        audioManager.stopRecording()
        
        do {
            let summary = try await APIClient.shared.completeMeeting(meetingId: meetingId)
            
            meetingStatus = "Completed"
            
            // Update meeting with summary
            if var meeting = currentMeeting {
                meeting.summary = summary.executiveSummary
                meeting.keyTakeaways = summary.keyTakeaways
                meeting.nextSteps = summary.nextSteps
                meeting.status = "completed"
                currentMeeting = meeting
            }
            
            print("Meeting completed. Summary generated.")
            
        } catch {
            errorMessage = "Failed to complete meeting: \(error.localizedDescription)"
            print(error)
        }
        
        isLoading = false
    }
    
    func reset() {
        currentMeeting = nil
        transcriptSegments.removeAll()
        slides.removeAll()
        questions.removeAll()
        meetingStatus = "Not Started"
        errorMessage = nil
        
        slideManager.reset()
        questionManager.reset()
    }
}

