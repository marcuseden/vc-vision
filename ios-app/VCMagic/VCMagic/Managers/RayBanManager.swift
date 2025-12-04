//
//  RayBanManager.swift
//  VCMagic
//
//  Manages Ray-Ban Meta Gen 2 connection using AVAudioSession
//  Based on Meta Wearables documentation: https://wearables.developer.meta.com/docs/develop
//

import Foundation
import AVFoundation
import Combine

class RayBanManager: NSObject, ObservableObject {
    @Published var isConnected = false
    @Published var batteryLevel: Int?
    @Published var deviceName: String = "Ray-Ban Meta"
    @Published var audioInputReady = false
    @Published var audioOutputReady = false
    @Published var currentRoute: String = "iPhone"
    
    private var cancellables = Set<AnyCancellable>()
    
    override init() {
        super.init()
        setupAudioSession()
        observeRouteChanges()
    }
    
    private func setupAudioSession() {
        do {
            let session = AVAudioSession.sharedInstance()
            
            // Configure for Ray-Ban Meta Gen 2
            // Allows Bluetooth audio and handles routing
            try session.setCategory(
                .playAndRecord,
                mode: .videoChat,  // Best for voice communication
                options: [
                    .allowBluetooth,
                    .allowBluetoothA2DP,
                    .defaultToSpeaker
                ]
            )
            
            try session.setActive(true)
            
            print("✅ Audio session configured for Ray-Ban Meta")
            
            // Check current route
            checkAudioRoute()
            
        } catch {
            print("❌ Failed to setup audio session: \(error)")
        }
    }
    
    private func observeRouteChanges() {
        // Listen for audio route changes (when Ray-Ban connects/disconnects)
        NotificationCenter.default.publisher(for: AVAudioSession.routeChangeNotification)
            .sink { [weak self] notification in
                self?.handleRouteChange(notification: notification)
            }
            .store(in: &cancellables)
    }
    
    private func handleRouteChange(notification: Notification) {
        guard let userInfo = notification.userInfo,
              let reasonValue = userInfo[AVAudioSessionRouteChangeReasonKey] as? UInt,
              let reason = AVAudioSession.RouteChangeReason(rawValue: reasonValue) else {
            return
        }
        
        switch reason {
        case .newDeviceAvailable:
            print("🎧 New audio device connected")
            checkAudioRoute()
        case .oldDeviceUnavailable:
            print("🎧 Audio device disconnected")
            checkAudioRoute()
        default:
            break
        }
    }
    
    func checkAudioRoute() {
        let session = AVAudioSession.sharedInstance()
        let currentRoute = session.currentRoute
        
        // Check if Ray-Ban Meta is connected
        var rayBanConnected = false
        var routeName = "iPhone"
        
        // Check outputs (speakers)
        for output in currentRoute.outputs {
            let portName = output.portName.lowercased()
            let portType = output.portType
            
            print("🔊 Output: \(output.portName) - Type: \(portType.rawValue)")
            
            if portName.contains("ray-ban") || 
               portName.contains("meta") ||
               portName.contains("stories") {  // Some Ray-Bans show as "Stories"
                rayBanConnected = true
                routeName = output.portName
                audioOutputReady = true
            }
        }
        
        // Check inputs (microphone)
        if let input = session.currentRoute.inputs.first {
            let portName = input.portName.lowercased()
            
            print("🎤 Input: \(input.portName) - Type: \(input.portType.rawValue)")
            
            if portName.contains("ray-ban") || 
               portName.contains("meta") ||
               portName.contains("stories") {
                rayBanConnected = true
                routeName = input.portName
                audioInputReady = true
            }
        }
        
        DispatchQueue.main.async {
            self.isConnected = rayBanConnected
            self.deviceName = routeName
            self.currentRoute = routeName
        }
        
        if rayBanConnected {
            print("✅ Ray-Ban Meta Gen 2 connected: \(routeName)")
        } else {
            print("📱 Using iPhone audio")
        }
    }
    
    func forceRayBanRoute() {
        do {
            let session = AVAudioSession.sharedInstance()
            
            // Force Bluetooth route if available
            if let availableInputs = session.availableInputs {
                for input in availableInputs {
                    let portName = input.portName.lowercased()
                    if portName.contains("ray-ban") || 
                       portName.contains("meta") ||
                       portName.contains("stories") {
                        try session.setPreferredInput(input)
                        print("✅ Forced Ray-Ban as audio input")
                        break
                    }
                }
            }
            
            checkAudioRoute()
            
        } catch {
            print("❌ Failed to set Ray-Ban as preferred input: \(error)")
        }
    }
    
    func refreshConnection() {
        // Refresh audio routing
        do {
            let session = AVAudioSession.sharedInstance()
            try session.setActive(false)
            try session.setActive(true)
            checkAudioRoute()
        } catch {
            print("❌ Failed to refresh connection: \(error)")
        }
    }
    
    // Get list of available Bluetooth devices
    func getAvailableDevices() -> [String] {
        let session = AVAudioSession.sharedInstance()
        var devices: [String] = []
        
        if let inputs = session.availableInputs {
            for input in inputs {
                devices.append("\(input.portName) (\(input.portType.rawValue))")
            }
        }
        
        return devices
    }
}

// MARK: - Meta SDK Integration Notes
/*
 For full Meta Ray-Ban Meta Gen 2 integration:
 
 1. Add Meta Wearables SDK (when available)
 2. Replace AVAudioSession with Meta SDK APIs
 3. Benefits:
    - Direct audio streaming
    - Better latency
    - Battery monitoring
    - Device controls
 
 Current implementation uses AVAudioSession which:
 ✅ Works with Ray-Ban Meta Gen 2 (as Bluetooth device)
 ✅ No additional SDK needed
 ✅ Standard iOS Bluetooth audio
 ✅ Production-ready NOW
 
 See META_INTEGRATION_GUIDE.md for Meta SDK integration
 */

