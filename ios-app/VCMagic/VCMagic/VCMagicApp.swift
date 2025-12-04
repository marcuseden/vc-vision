//
//  VCMagicApp.swift
//  VCMagic
//
//  VC Magic - AI-Powered Meeting Intelligence
//

import SwiftUI

@main
struct VCMagicApp: App {
    @StateObject private var appState = AppState()
    
    var body: some Scene {
        WindowGroup {
            ContentView()
                .environmentObject(appState)
        }
    }
}

// App-wide state management
class AppState: ObservableObject {
    @Published var currentUser: User?
    @Published var isAuthenticated = false
    
    init() {
        // For now, create a default user
        // In production, implement proper authentication
        self.currentUser = User(
            id: UUID().uuidString,
            email: "user@vcfund.com",
            name: "VC Analyst",
            role: "analyst"
        )
        self.isAuthenticated = true
    }
}
