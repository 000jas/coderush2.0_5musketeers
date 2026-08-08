export interface RawTelemetry {
  timestamp: string;
  "Battery Percentage": number;
  "Solar Panel Output": number;
  "Power Consumption": number;
  "Battery Temperature": number;
  "CPU Temperature": number;
  "Communication Status": 'Connected' | 'Disconnected';
  "Signal Strength": number;
  "Storage Used": number;
  "Camera Status": 'Active' | 'Inactive';
  "Images Captured": number;
  "Current Task": string;
  "Mission Mode": string;
  "Orbit Number": number;
  "Active Fault": string;
  "Overall Satellite Health": 'Excellent' | 'Good' | 'Warning' | 'Critical';
}

export interface SatelliteState {
  timestamp: string;
  batteryPercentage: number;
  batteryVoltage: number;          // e.g., 28.0 to 32.5 V (derived)
  solarPanelOutput: number;        // Watts
  powerConsumption: number;        // Watts
  batteryTemperature: number;      // °C
  cpuTemperature: number;          // °C
  communicationStatus: 'Connected' | 'Disconnected';
  signalStrength: number;          // dBm, e.g. -100 to -30
  storageUsed: number;             // %
  cameraStatus: 'Active' | 'Inactive';
  imagesCaptured: number;
  currentTask: string;
  missionMode: string;
  orbitNumber: number;
  activeFault: string;             // "None" or error description
  overallSatelliteHealth: 'Excellent' | 'Good' | 'Warning' | 'Critical';
}

export interface TimelineEvent {
  timestamp: string;
  severity: 'INFO' | 'SUCCESS' | 'WARNING' | 'CRITICAL' | 'SYSTEM';
  subsystem: string;
  description: string;
}

export interface LogMessage {
  timestamp: string;
  type: 'INFO' | 'SUCCESS' | 'WARNING' | 'CRITICAL' | 'SYSTEM';
  message: string;
}
