//
//  MeetingSetupView.swift
//  VCMagic
//
//  Meeting setup screen
//

import SwiftUI

struct MeetingSetupView: View {
    @Environment(\.dismiss) var dismiss
    @EnvironmentObject var appState: AppState
    @EnvironmentObject var viewModel: MeetingViewModel
    
    @State private var companyName = "Demo Company"
    @State private var meetingTitle = "Initial Pitch Meeting"
    @State private var dealId = "demo-deal-\(UUID().uuidString.prefix(8))"
    
    var body: some View {
        NavigationStack {
            Form {
                Section("Company") {
                    TextField("Company Name", text: $companyName)
                }
                
                Section("Meeting Details") {
                    TextField("Meeting Title", text: $meetingTitle)
                }
                
                Section("Ready to Start?") {
                    HStack {
                        Image(systemName: viewModel.rayBanManager.isConnected ? "checkmark.circle.fill" : "xmark.circle.fill")
                            .foregroundColor(viewModel.rayBanManager.isConnected ? .green : .red)
                        Text("Ray-Ban Connected")
                        Spacer()
                        if !viewModel.rayBanManager.isConnected {
                            Button("Connect") {
                                viewModel.rayBanManager.startScanning()
                            }
                            .font(.caption)
                        }
                    }
                }
            }
            .navigationTitle("New Meeting")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancel") {
                        dismiss()
                    }
                }
                
                ToolbarItem(placement: .primaryAction) {
                    NavigationLink(destination: ActiveMeetingView().environmentObject(viewModel)) {
                        Button("Start") {
                            Task {
                                guard let userId = appState.currentUser?.id else { return }
                                
                                // Create deal (simplified - in production get from backend)
                                await viewModel.startMeeting(
                                    dealId: dealId,
                                    userId: userId,
                                    title: meetingTitle
                                )
                                
                                dismiss()
                            }
                        }
                        .fontWeight(.semibold)
                        .disabled(companyName.isEmpty || meetingTitle.isEmpty)
                    }
                }
            }
        }
    }
}

#Preview {
    MeetingSetupView()
        .environmentObject(AppState())
        .environmentObject(MeetingViewModel())
}

