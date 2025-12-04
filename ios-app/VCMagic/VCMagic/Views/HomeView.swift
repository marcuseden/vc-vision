//
//  HomeView.swift
//  VCMagic
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
                
                Text("VC Magic")
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
                // Ray-Ban Meta Status
                HStack {
                    Image(systemName: viewModel.rayBanManager.isConnected ? "checkmark.circle.fill" : "circle")
                        .foregroundColor(viewModel.rayBanManager.isConnected ? .green : .orange)
                        .font(.title3)
                    
                    VStack(alignment: .leading, spacing: 4) {
                        Text(viewModel.rayBanManager.deviceName)
                            .fontWeight(.semibold)
                        Text(viewModel.rayBanManager.isConnected ? "Connected via Bluetooth" : "Using iPhone Audio")
                            .font(.caption)
                            .foregroundColor(.secondary)
                    }
                    
                    Spacer()
                    
                    Button(action: {
                        viewModel.rayBanManager.refreshConnection()
                    }) {
                        Image(systemName: "arrow.clockwise")
                            .font(.caption)
                    }
                    .buttonStyle(.bordered)
                    .tint(viewModel.rayBanManager.isConnected ? .green : .orange)
                }
                .padding()
                .background(
                    viewModel.rayBanManager.isConnected ? 
                    Color.green.opacity(0.1) : Color.orange.opacity(0.1)
                )
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

