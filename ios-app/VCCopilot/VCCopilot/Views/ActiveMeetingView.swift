//
//  ActiveMeetingView.swift
//  VCCopilot
//
//  Active meeting screen with recording, slide capture, and questions
//

import SwiftUI
import PhotosUI

struct ActiveMeetingView: View {
    @Environment(\.dismiss) var dismiss
    @EnvironmentObject var viewModel: MeetingViewModel
    @State private var showingCamera = false
    @State private var showingPhotoPicker = false
    @State private var selectedPhoto: PhotosPickerItem?
    @State private var showingSummary = false
    
    var body: some View {
        ZStack {
            VStack(spacing: 0) {
                // Header
                VStack(spacing: 10) {
                    HStack {
                        VStack(alignment: .leading) {
                            Text(viewModel.currentMeeting?.title ?? "Meeting")
                                .font(.headline)
                            Text(viewModel.meetingStatus)
                                .font(.caption)
                                .foregroundColor(.secondary)
                        }
                        
                        Spacer()
                        
                        // Recording indicator
                        if viewModel.audioManager.isRecording {
                            HStack(spacing: 5) {
                                Circle()
                                    .fill(Color.red)
                                    .frame(width: 10, height: 10)
                                Text(formatDuration(viewModel.audioManager.recordingDuration))
                                    .font(.caption)
                                    .monospacedDigit()
                            }
                        }
                    }
                    .padding()
                    .background(Color.gray.opacity(0.1))
                }
                
                // Main Content
                TabView {
                    // Transcript Tab
                    TranscriptTab(viewModel: viewModel)
                        .tabItem {
                            Label("Transcript", systemImage: "text.bubble")
                        }
                    
                    // Slides Tab
                    SlidesTab(viewModel: viewModel)
                        .tabItem {
                            Label("Slides", systemImage: "photo.on.rectangle")
                        }
                    
                    // Questions Tab
                    QuestionsTab(viewModel: viewModel)
                        .tabItem {
                            Label("Questions", systemImage: "questionmark.circle")
                        }
                }
                
                // Bottom Actions
                HStack(spacing: 20) {
                    // Capture Slide
                    Button(action: {
                        showingPhotoPicker = true
                    }) {
                        VStack {
                            Image(systemName: "camera.fill")
                                .font(.title2)
                            Text("Slide")
                                .font(.caption)
                        }
                        .frame(maxWidth: .infinity)
                        .padding()
                        .background(Color.blue.opacity(0.1))
                        .foregroundColor(.blue)
                        .cornerRadius(10)
                    }
                    
                    // End Meeting
                    Button(action: {
                        Task {
                            await viewModel.endMeeting()
                            showingSummary = true
                        }
                    }) {
                        VStack {
                            Image(systemName: "stop.circle.fill")
                                .font(.title2)
                            Text("End")
                                .font(.caption)
                        }
                        .frame(maxWidth: .infinity)
                        .padding()
                        .background(Color.red.opacity(0.1))
                        .foregroundColor(.red)
                        .cornerRadius(10)
                    }
                }
                .padding()
            }
            
            // Loading overlay
            if viewModel.isLoading {
                Color.black.opacity(0.3)
                    .ignoresSafeArea()
                
                VStack {
                    ProgressView()
                        .scaleEffect(1.5)
                    Text("Processing...")
                        .foregroundColor(.white)
                        .padding(.top)
                }
            }
        }
        .navigationBarBackButtonHidden(true)
        .photosPicker(isPresented: $showingPhotoPicker, selection: $selectedPhoto, matching: .images)
        .onChange(of: selectedPhoto) { newValue in
            Task {
                if let data = try? await newValue?.loadTransferable(type: Data.self),
                   let image = UIImage(data: data) {
                    await viewModel.captureSlide(image: image)
                }
            }
        }
        .sheet(isPresented: $showingSummary) {
            MeetingSummaryView()
                .environmentObject(viewModel)
        }
    }
    
    private func formatDuration(_ duration: TimeInterval) -> String {
        let minutes = Int(duration) / 60
        let seconds = Int(duration) % 60
        return String(format: "%02d:%02d", minutes, seconds)
    }
}

// MARK: - Transcript Tab
struct TranscriptTab: View {
    @ObservedObject var viewModel: MeetingViewModel
    
    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 15) {
                if viewModel.audioManager.latestTranscript.isEmpty {
                    VStack {
                        Image(systemName: "waveform")
                            .font(.system(size: 60))
                            .foregroundColor(.gray.opacity(0.5))
                        Text("Listening...")
                            .foregroundColor(.secondary)
                    }
                    .frame(maxWidth: .infinity, maxHeight: .infinity)
                    .padding()
                } else {
                    Text(viewModel.audioManager.latestTranscript)
                        .padding()
                }
            }
        }
    }
}

// MARK: - Slides Tab
struct SlidesTab: View {
    @ObservedObject var viewModel: MeetingViewModel
    
    var body: some View {
        ScrollView {
            VStack(spacing: 15) {
                ForEach(viewModel.slides) { slide in
                    VStack(alignment: .leading, spacing: 10) {
                        Text("Slide \(slide.slideNumber)")
                            .font(.headline)
                        
                        if let imageUrl = slide.imageUrl {
                            AsyncImage(url: URL(string: imageUrl)) { image in
                                image
                                    .resizable()
                                    .aspectRatio(contentMode: .fit)
                            } placeholder: {
                                ProgressView()
                            }
                            .frame(height: 200)
                            .cornerRadius(10)
                        }
                        
                        if let text = slide.text {
                            Text(text)
                                .font(.caption)
                                .foregroundColor(.secondary)
                        }
                    }
                    .padding()
                    .background(Color.gray.opacity(0.1))
                    .cornerRadius(10)
                }
                
                if viewModel.slides.isEmpty {
                    VStack {
                        Image(systemName: "photo.on.rectangle.angled")
                            .font(.system(size: 60))
                            .foregroundColor(.gray.opacity(0.5))
                        Text("No slides captured yet")
                            .foregroundColor(.secondary)
                    }
                    .frame(maxWidth: .infinity, maxHeight: .infinity)
                    .padding()
                }
            }
            .padding()
        }
    }
}

// MARK: - Questions Tab
struct QuestionsTab: View {
    @ObservedObject var viewModel: MeetingViewModel
    
    var body: some View {
        ScrollView {
            VStack(spacing: 15) {
                ForEach(viewModel.questionManager.pendingQuestions) { question in
                    QuestionCard(question: question, viewModel: viewModel)
                }
                
                if !viewModel.questionManager.askedQuestions.isEmpty {
                    Text("Asked Questions")
                        .font(.headline)
                        .padding(.top)
                    
                    ForEach(viewModel.questionManager.askedQuestions) { question in
                        QuestionCard(question: question, viewModel: viewModel, isAsked: true)
                    }
                }
                
                if viewModel.questions.isEmpty {
                    VStack {
                        Image(systemName: "questionmark.circle")
                            .font(.system(size: 60))
                            .foregroundColor(.gray.opacity(0.5))
                        Text("No questions yet")
                            .foregroundColor(.secondary)
                        Text("Capture slides to generate questions")
                            .font(.caption)
                            .foregroundColor(.secondary)
                    }
                    .frame(maxWidth: .infinity, maxHeight: .infinity)
                    .padding()
                }
            }
            .padding()
        }
    }
}

// MARK: - Question Card
struct QuestionCard: View {
    let question: Question
    @ObservedObject var viewModel: MeetingViewModel
    var isAsked: Bool = false
    
    var body: some View {
        VStack(alignment: .leading, spacing: 10) {
            HStack {
                Text("Priority: \(question.priority)")
                    .font(.caption)
                    .padding(.horizontal, 8)
                    .padding(.vertical, 4)
                    .background(priorityColor.opacity(0.2))
                    .foregroundColor(priorityColor)
                    .cornerRadius(5)
                
                Text(question.category.capitalized)
                    .font(.caption)
                    .padding(.horizontal, 8)
                    .padding(.vertical, 4)
                    .background(Color.blue.opacity(0.2))
                    .foregroundColor(.blue)
                    .cornerRadius(5)
                
                Spacer()
                
                if isAsked {
                    Image(systemName: "checkmark.circle.fill")
                        .foregroundColor(.green)
                }
            }
            
            Text(question.questionText)
                .font(.body)
            
            if !isAsked {
                HStack {
                    Button(action: {
                        Task {
                            await viewModel.playNextQuestion()
                        }
                    }) {
                        HStack {
                            Image(systemName: "speaker.wave.2.fill")
                            Text("Play")
                        }
                        .font(.caption)
                        .padding(.horizontal, 12)
                        .padding(.vertical, 6)
                        .background(Color.blue)
                        .foregroundColor(.white)
                        .cornerRadius(8)
                    }
                    
                    Button(action: {
                        viewModel.markQuestionAsAsked(question)
                    }) {
                        HStack {
                            Image(systemName: "checkmark")
                            Text("Mark Asked")
                        }
                        .font(.caption)
                        .padding(.horizontal, 12)
                        .padding(.vertical, 6)
                        .background(Color.green.opacity(0.2))
                        .foregroundColor(.green)
                        .cornerRadius(8)
                    }
                }
            }
        }
        .padding()
        .background(isAsked ? Color.gray.opacity(0.05) : Color.white)
        .cornerRadius(10)
        .overlay(
            RoundedRectangle(cornerRadius: 10)
                .stroke(Color.gray.opacity(0.2), lineWidth: 1)
        )
    }
    
    private var priorityColor: Color {
        if question.priority >= 8 {
            return .red
        } else if question.priority >= 5 {
            return .orange
        } else {
            return .gray
        }
    }
}

#Preview {
    NavigationStack {
        ActiveMeetingView()
            .environmentObject(MeetingViewModel())
    }
}

