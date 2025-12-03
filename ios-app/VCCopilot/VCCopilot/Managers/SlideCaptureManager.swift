//
//  SlideCaptureManager.swift
//  VCCopilot
//
//  Manages slide capture and upload
//

import Foundation
import SwiftUI
import PhotosUI

class SlideCaptureManager: ObservableObject {
    @Published var capturedSlides: [UIImage] = []
    @Published var currentSlideNumber = 1
    @Published var isUploading = false
    
    func captureSlide(image: UIImage, meetingId: String, timestamp: Double?) async throws -> Slide {
        isUploading = true
        defer { isUploading = false }
        
        let slide = try await APIClient.shared.uploadSlide(
            meetingId: meetingId,
            image: image,
            slideNumber: currentSlideNumber,
            timestamp: timestamp
        )
        
        await MainActor.run {
            self.capturedSlides.append(image)
            self.currentSlideNumber += 1
        }
        
        return slide
    }
    
    func analyzeSlide(slideId: String) async throws -> SlideAnalysisResponse {
        return try await APIClient.shared.analyzeSlide(slideId: slideId)
    }
    
    func reset() {
        capturedSlides.removeAll()
        currentSlideNumber = 1
    }
}

