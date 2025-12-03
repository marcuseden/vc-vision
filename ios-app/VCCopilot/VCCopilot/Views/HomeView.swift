//
//  HomeView.swift
//  VCCopilot
//
//  Home screen with new meeting button
//

import SwiftUI

struct HomeView: View {
    @EnvironmentObject var appState: AppState
    @EnvironmentObject var viewModel: MeetingViewModel
    @State private var showingMeetingSetup = false
    
    var body: some View {
        VStack(spacing: 30) {
            // Header
            VStack(spacing: 10) {
                Image(systemName: "brain.head.profile")
                    .font(.system(size: 80))
                    .foregroundColor(.blue)
                
                Text("VC Copilot")
                    .font(.largeTitle)
                    .fontWeight(.bold)
                
                Text("AI-Powered Meeting Intelligence")
                    .font(.subheadline)
                    .foregroundColor(.secondary)
            }
            .padding(.top, 60)
            
            Spacer()
            
            // Connection Status
            VStack(spacing: 15) {
                HStack {
                    Image(systemName: viewModel.rayBanManager.isConnected ? "checkmark.circle.fill" : "circle")
                        .foregroundColor(viewModel.rayBanManager.isConnected ? .green : .gray)
                    Text("Ray-Ban Meta Gen 2")
                    Spacer()
                    if !viewModel.rayBanManager.isConnected {
                        Button("Connect") {
                            viewModel.rayBanManager.startScanning()
                        }
                        .font(.caption)
                        .buttonStyle(.bordered)
                    }
                }
                .padding()
                .background(Color.gray.opacity(0.1))
                .cornerRadius(10)
                
                HStack {
                    Image(systemName: "wifi")
                        .foregroundColor(.green)
                    Text("Backend API")
                    Spacer()
                    Text("Connected")
                        .font(.caption)
                        .foregroundColor(.green)
                }
                .padding()
                .background(Color.gray.opacity(0.1))
                .cornerRadius(10)
            }
            .padding(.horizontal)
            
            Spacer()
            
            // New Meeting Button
            Button(action: {
                showingMeetingSetup = true
            }) {
                HStack {
                    Image(systemName: "plus.circle.fill")
                    Text("New Meeting")
                }
                .font(.title3)
                .fontWeight(.semibold)
                .foregroundColor(.white)
                .frame(maxWidth: .infinity)
                .padding()
                .background(Color.blue)
                .cornerRadius(15)
            }
            .padding(.horizontal)
            .padding(.bottom, 50)
            
            Text("Backend: https://vc-vision.vercel.app")
                .font(.caption2)
                .foregroundColor(.secondary)
                .padding(.bottom, 20)
        }
        .navigationBarHidden(true)
        .sheet(isPresented: $showingMeetingSetup) {
            MeetingSetupView()
                .environmentObject(viewModel)
        }
    }
}

#Preview {
    HomeView()
        .environmentObject(AppState())
        .environmentObject(MeetingViewModel())
}

