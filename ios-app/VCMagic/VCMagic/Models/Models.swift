//
//  Models.swift
//  VCMagic
//
//  Data models matching backend API
//

import Foundation

// MARK: - User
struct User: Codable, Identifiable {
    let id: String
    let email: String
    let name: String?
    let role: String
}

// MARK: - Deal
struct Deal: Codable, Identifiable {
    let id: String
    let companyName: String
    let website: String?
    let stage: String?
    let sector: String?
    let description: String?
}

// MARK: - Meeting
struct Meeting: Codable, Identifiable {
    let id: String
    let dealId: String
    let userId: String
    let title: String
    let date: Date
    var duration: Int?
    var status: String
    var transcriptUrl: String?
    var audioUrl: String?
    var summary: String?
    var keyTakeaways: [String]?
    var nextSteps: [String]?
    
    var deal: Deal?
    var slides: [Slide]?
    var questions: [Question]?
    var transcript: [TranscriptSegment]?
}

// MARK: - Slide
struct Slide: Codable, Identifiable {
    let id: String
    let meetingId: String
    let slideNumber: Int
    var imageUrl: String?
    var text: String?
    var timestamp: Date?
    
    var claims: [Claim]?
    var questions: [Question]?
}

// MARK: - Transcript Segment
struct TranscriptSegment: Codable, Identifiable {
    let id: String
    let meetingId: String
    let speaker: String
    let text: String
    let timestamp: Double
    let createdAt: Date
}

// MARK: - Question
struct Question: Codable, Identifiable {
    let id: String
    let meetingId: String
    let slideId: String?
    let questionText: String
    let category: String
    let priority: Int
    var asked: Bool
    var askedAt: Date?
    var answer: String?
}

// MARK: - Claim
struct Claim: Codable, Identifiable {
    let id: String
    let meetingId: String
    let slideId: String?
    let claimText: String
    let claimType: String
    var isVerified: Bool
    var confidence: Double?
}

// MARK: - API Response Models
struct MeetingResponse: Codable {
    let success: Bool
    let meeting: Meeting
}

struct SlideResponse: Codable {
    let success: Bool
    let slide: Slide
}

struct TranscribeResponse: Codable {
    let success: Bool
    let segment: TranscriptSegment
    let transcriptText: String
}

struct SlideAnalysisResponse: Codable {
    let success: Bool
    let analysis: SlideAnalysisData
    let claims: [ClaimData]
    let questions: [Question]
    let questionAudio: [QuestionAudio]
}

struct SlideAnalysisData: Codable {
    let text: String
    let description: String
    let keyPoints: [String]
}

struct ClaimData: Codable {
    let text: String
    let type: String
    let confidence: Double
}

struct QuestionAudio: Codable {
    let questionId: String
    let audioUrl: String
}

struct MeetingDetailResponse: Codable {
    let meeting: Meeting
}

struct MeetingSummaryResponse: Codable {
    let success: Bool
    let summary: MeetingSummary
    let actionItems: [String]
}

struct MeetingSummary: Codable {
    let executiveSummary: String
    let keyTakeaways: [String]
    let strengths: [String]
    let concerns: [String]
    let opportunities: [String]
    let nextSteps: [String]
    let investmentThesis: String
    let recommendedAction: String
    let confidenceScore: Double
}

// MARK: - API Error
enum APIError: Error, LocalizedError {
    case invalidURL
    case invalidResponse
    case invalidImage
    case decodingError
    case networkError(Error)
    case serverError(String)
    
    var errorDescription: String? {
        switch self {
        case .invalidURL:
            return "Invalid URL"
        case .invalidResponse:
            return "Invalid response from server"
        case .invalidImage:
            return "Invalid image data"
        case .decodingError:
            return "Failed to decode response"
        case .networkError(let error):
            return "Network error: \(error.localizedDescription)"
        case .serverError(let message):
            return "Server error: \(message)"
        }
    }
}

