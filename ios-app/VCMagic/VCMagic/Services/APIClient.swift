//
//  APIClient.swift
//  VCMagic
//
//  API client for backend communication
//

import Foundation

class APIClient {
    static let shared = APIClient()
    
    private let baseURL = "https://vc-vision.vercel.app"
    private let session: URLSession
    
    private init() {
        let config = URLSessionConfiguration.default
        config.timeoutIntervalForRequest = 30
        config.timeoutIntervalForResource = 300
        self.session = URLSession(configuration: config)
    }
    
    // MARK: - Meeting Management
    
    func createMeeting(dealId: String, userId: String, title: String) async throws -> Meeting {
        let url = URL(string: "\(baseURL)/api/meetings")!
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        
        let body: [String: Any] = [
            "dealId": dealId,
            "userId": userId,
            "title": title,
            "date": ISO8601DateFormatter().string(from: Date())
        ]
        
        request.httpBody = try JSONSerialization.data(withJSONObject: body)
        
        let (data, response) = try await session.data(for: request)
        
        guard let httpResponse = response as? HTTPURLResponse else {
            throw APIError.invalidResponse
        }
        
        guard httpResponse.statusCode == 200 else {
            throw APIError.serverError("Status code: \(httpResponse.statusCode)")
        }
        
        let decoder = JSONDecoder()
        decoder.dateDecodingStrategy = .iso8601
        let meetingResponse = try decoder.decode(MeetingResponse.self, from: data)
        return meetingResponse.meeting
    }
    
    func getMeeting(id: String) async throws -> Meeting {
        let url = URL(string: "\(baseURL)/api/meetings?id=\(id)")!
        let (data, _) = try await session.data(from: url)
        
        let decoder = JSONDecoder()
        decoder.dateDecodingStrategy = .iso8601
        let response = try decoder.decode(MeetingDetailResponse.self, from: data)
        return response.meeting
    }
    
    func completeMeeting(meetingId: String) async throws -> MeetingSummary {
        let url = URL(string: "\(baseURL)/api/meetings/summary")!
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        
        let body = ["meetingId": meetingId]
        request.httpBody = try JSONSerialization.data(withJSONObject: body)
        
        let (data, _) = try await session.data(for: request)
        
        let decoder = JSONDecoder()
        decoder.dateDecodingStrategy = .iso8601
        let response = try decoder.decode(MeetingSummaryResponse.self, from: data)
        return response.summary
    }
    
    // MARK: - Audio Transcription
    
    func transcribeAudio(meetingId: String, audioData: Data, timestamp: Double) async throws -> TranscriptSegment {
        let url = URL(string: "\(baseURL)/api/transcribe")!
        
        let boundary = "Boundary-\(UUID().uuidString)"
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("multipart/form-data; boundary=\(boundary)", forHTTPHeaderField: "Content-Type")
        
        var body = Data()
        
        // Add audio file
        body.append("--\(boundary)\r\n".data(using: .utf8)!)
        body.append("Content-Disposition: form-data; name=\"audio\"; filename=\"audio.m4a\"\r\n".data(using: .utf8)!)
        body.append("Content-Type: audio/m4a\r\n\r\n".data(using: .utf8)!)
        body.append(audioData)
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
        
        let (data, _) = try await session.data(for: request)
        
        let decoder = JSONDecoder()
        decoder.dateDecodingStrategy = .iso8601
        let response = try decoder.decode(TranscribeResponse.self, from: data)
        return response.segment
    }
    
    // MARK: - Slide Management
    
    func uploadSlide(meetingId: String, imageData: Data, slideNumber: Int, timestamp: Double?) async throws -> Slide {
        let url = URL(string: "\(baseURL)/api/slides")!
        let boundary = "Boundary-\(UUID().uuidString)"
        
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("multipart/form-data; boundary=\(boundary)", forHTTPHeaderField: "Content-Type")
        
        var body = Data()
        
        // Add image
        body.append("--\(boundary)\r\n".data(using: .utf8)!)
        body.append("Content-Disposition: form-data; name=\"image\"; filename=\"slide.jpg\"\r\n".data(using: .utf8)!)
        body.append("Content-Type: image/jpeg\r\n\r\n".data(using: .utf8)!)
        body.append(imageData)
        body.append("\r\n".data(using: .utf8)!)
        
        // Add meetingId
        body.append("--\(boundary)\r\n".data(using: .utf8)!)
        body.append("Content-Disposition: form-data; name=\"meetingId\"\r\n\r\n".data(using: .utf8)!)
        body.append("\(meetingId)\r\n".data(using: .utf8)!)
        
        // Add slideNumber
        body.append("--\(boundary)\r\n".data(using: .utf8)!)
        body.append("Content-Disposition: form-data; name=\"slideNumber\"\r\n\r\n".data(using: .utf8)!)
        body.append("\(slideNumber)\r\n".data(using: .utf8)!)
        
        // Add timestamp if provided
        if let timestamp = timestamp {
            body.append("--\(boundary)\r\n".data(using: .utf8)!)
            body.append("Content-Disposition: form-data; name=\"timestamp\"\r\n\r\n".data(using: .utf8)!)
            body.append("\(timestamp)\r\n".data(using: .utf8)!)
        }
        
        body.append("--\(boundary)--\r\n".data(using: .utf8)!)
        
        request.httpBody = body
        
        let (data, _) = try await session.data(for: request)
        
        let decoder = JSONDecoder()
        decoder.dateDecodingStrategy = .iso8601
        let response = try decoder.decode(SlideResponse.self, from: data)
        return response.slide
    }
    
    func analyzeSlide(slideId: String) async throws -> SlideAnalysisResponse {
        let url = URL(string: "\(baseURL)/api/slides/intel")!
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        
        let body = ["slideId": slideId]
        request.httpBody = try JSONSerialization.data(withJSONObject: body)
        
        let (data, _) = try await session.data(for: request)
        
        let decoder = JSONDecoder()
        decoder.dateDecodingStrategy = .iso8601
        return try decoder.decode(SlideAnalysisResponse.self, from: data)
    }
}

// MARK: - Data Extension
extension Data {
    mutating func append(_ string: String) {
        if let data = string.data(using: .utf8) {
            append(data)
        }
    }
}

