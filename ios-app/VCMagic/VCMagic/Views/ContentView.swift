//
//  ContentView.swift
//  VCMagic
//
//  Main content view - navigation root
//

import SwiftUI

struct ContentView: View {
    @EnvironmentObject var appState: AppState
    @StateObject private var viewModel = MeetingViewModel()
    
    var body: some View {
        NavigationStack {
            HomeView()
                .environmentObject(viewModel)
        }
    }
}

#Preview {
    ContentView()
        .environmentObject(AppState())
}

