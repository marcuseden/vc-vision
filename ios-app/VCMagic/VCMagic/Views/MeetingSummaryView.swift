//
//  MeetingSummaryView.swift
//  VCMagic
//
//  Meeting summary and completion screen
//

import SwiftUI

struct MeetingSummaryView: View {
    @Environment(\.dismiss) var dismiss
    @EnvironmentObject var viewModel: MeetingViewModel
    
    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: 25) {
                    // Header
                    VStack(alignment: .leading, spacing: 10) {
                        Text(viewModel.currentMeeting?.title ?? "Meeting Complete")
                            .font(.title)
                            .fontWeight(.bold)
                        
                        HStack {
                            Label("\(viewModel.slides.count) slides", systemImage: "photo")
                            Label("\(viewModel.questions.count) questions", systemImage: "questionmark.circle")
                            Spacer()
                            Text(viewModel.meetingStatus)
                                .font(.caption)
                                .padding(.horizontal, 10)
                                .padding(.vertical, 5)
                                .background(Color.green.opacity(0.2))
                                .foregroundColor(.green)
                                .cornerRadius(5)
                        }
                        .font(.caption)
                    }
                    .padding()
                    .background(Color.gray.opacity(0.1))
                    .cornerRadius(10)
                    
                    // Executive Summary
                    if let summary = viewModel.currentMeeting?.summary {
                        SectionCard(title: "Executive Summary", icon: "doc.text") {
                            Text(summary)
                                .font(.body)
                        }
                    }
                    
                    // Key Takeaways
                    if let takeaways = viewModel.currentMeeting?.keyTakeaways, !takeaways.isEmpty {
                        SectionCard(title: "Key Takeaways", icon: "lightbulb") {
                            VStack(alignment: .leading, spacing: 10) {
                                ForEach(Array(takeaways.enumerated()), id: \.offset) { index, takeaway in
                                    HStack(alignment: .top, spacing: 10) {
                                        Text("\(index + 1).")
                                            .fontWeight(.semibold)
                                        Text(takeaway)
                                    }
                                }
                            }
                        }
                    }
                    
                    // Next Steps
                    if let nextSteps = viewModel.currentMeeting?.nextSteps, !nextSteps.isEmpty {
                        SectionCard(title: "Next Steps", icon: "arrow.right.circle") {
                            VStack(alignment: .leading, spacing: 10) {
                                ForEach(Array(nextSteps.enumerated()), id: \.offset) { index, step in
                                    HStack(alignment: .top, spacing: 10) {
                                        Image(systemName: "checkmark.square")
                                            .foregroundColor(.blue)
                                        Text(step)
                                    }
                                }
                            }
                        }
                    }
                    
                    // Stats
                    HStack(spacing: 15) {
                        StatCard(title: "Duration", value: formatDuration(viewModel.audioManager.recordingDuration), icon: "clock")
                        StatCard(title: "Slides", value: "\(viewModel.slides.count)", icon: "photo")
                        StatCard(title: "Questions", value: "\(viewModel.questions.count)", icon: "questionmark.circle")
                    }
                }
                .padding()
            }
            .navigationTitle("Meeting Summary")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Done") {
                        viewModel.reset()
                        dismiss()
                    }
                }
                
                ToolbarItem(placement: .primaryAction) {
                    Button(action: {
                        // Share functionality
                    }) {
                        Image(systemName: "square.and.arrow.up")
                    }
                }
            }
        }
    }
    
    private func formatDuration(_ duration: TimeInterval) -> String {
        let minutes = Int(duration) / 60
        return "\(minutes) min"
    }
}

// MARK: - Section Card
struct SectionCard<Content: View>: View {
    let title: String
    let icon: String
    let content: Content
    
    init(title: String, icon: String, @ViewBuilder content: () -> Content) {
        self.title = title
        self.icon = icon
        self.content = content()
    }
    
    var body: some View {
        VStack(alignment: .leading, spacing: 15) {
            HStack {
                Image(systemName: icon)
                    .foregroundColor(.blue)
                Text(title)
                    .font(.headline)
            }
            
            content
        }
        .padding()
        .background(Color.white)
        .cornerRadius(10)
        .overlay(
            RoundedRectangle(cornerRadius: 10)
                .stroke(Color.gray.opacity(0.2), lineWidth: 1)
        )
    }
}

// MARK: - Stat Card
struct StatCard: View {
    let title: String
    let value: String
    let icon: String
    
    var body: some View {
        VStack {
            Image(systemName: icon)
                .font(.title2)
                .foregroundColor(.blue)
            
            Text(value)
                .font(.title3)
                .fontWeight(.bold)
            
            Text(title)
                .font(.caption)
                .foregroundColor(.secondary)
        }
        .frame(maxWidth: .infinity)
        .padding()
        .background(Color.gray.opacity(0.1))
        .cornerRadius(10)
    }
}

#Preview {
    MeetingSummaryView()
        .environmentObject(MeetingViewModel())
}

