//
//  RayBanManager.swift
//  VCCopilot
//
//  Manages Ray-Ban Meta Gen 2 Bluetooth connection
//

import Foundation
import CoreBluetooth
import AVFoundation

class RayBanManager: NSObject, ObservableObject {
    @Published var isConnected = false
    @Published var batteryLevel: Int?
    @Published var deviceName: String?
    
    private var centralManager: CBCentralManager!
    private var connectedPeripheral: CBPeripheral?
    
    override init() {
        super.init()
        centralManager = CBCentralManager(delegate: self, queue: nil)
    }
    
    func startScanning() {
        guard centralManager.state == .poweredOn else {
            print("Bluetooth is not powered on")
            return
        }
        
        centralManager.scanForPeripherals(withServices: nil, options: nil)
        print("Scanning for Ray-Ban Meta devices...")
    }
    
    func stopScanning() {
        centralManager.stopScan()
    }
    
    func connect(to peripheral: CBPeripheral) {
        centralManager.connect(peripheral, options: nil)
    }
    
    func disconnect() {
        if let peripheral = connectedPeripheral {
            centralManager.cancelPeripheralConnection(peripheral)
        }
    }
    
    // Configure audio session to use Ray-Ban as input/output
    func configureAudioSession() {
        do {
            let session = AVAudioSession.sharedInstance()
            try session.setCategory(.playAndRecord, mode: .default, options: [.allowBluetooth, .defaultToSpeaker])
            try session.setActive(true)
            
            // Select Ray-Ban as preferred device
            if let availableInputs = session.availableInputs {
                for input in availableInputs {
                    if input.portName.contains("Ray-Ban") || input.portName.contains("Meta") {
                        try session.setPreferredInput(input)
                        print("Set Ray-Ban as audio input")
                        break
                    }
                }
            }
        } catch {
            print("Failed to configure audio session: \(error)")
        }
    }
}

// MARK: - CBCentralManagerDelegate
extension RayBanManager: CBCentralManagerDelegate {
    func centralManagerDidUpdateState(_ central: CBCentralManager) {
        switch central.state {
        case .poweredOn:
            print("Bluetooth is powered on")
        case .poweredOff:
            print("Bluetooth is powered off")
        case .unsupported:
            print("Bluetooth not supported")
        default:
            break
        }
    }
    
    func centralManager(_ central: CBCentralManager, didDiscover peripheral: CBPeripheral, advertisementData: [String : Any], rssi RSSI: NSNumber) {
        // Look for Ray-Ban Meta devices
        if let name = peripheral.name, (name.contains("Ray-Ban") || name.contains("Meta")) {
            print("Found Ray-Ban device: \(name)")
            deviceName = name
            connect(to: peripheral)
            stopScanning()
        }
    }
    
    func centralManager(_ central: CBCentralManager, didConnect peripheral: CBPeripheral) {
        print("Connected to Ray-Ban")
        connectedPeripheral = peripheral
        isConnected = true
        configureAudioSession()
    }
    
    func centralManager(_ central: CBCentralManager, didDisconnectPeripheral peripheral: CBPeripheral, error: Error?) {
        print("Disconnected from Ray-Ban")
        isConnected = false
        connectedPeripheral = nil
    }
}

// MARK: - CBPeripheralDelegate
extension RayBanManager: CBPeripheralDelegate {
    // Implement peripheral delegate methods as needed
}

