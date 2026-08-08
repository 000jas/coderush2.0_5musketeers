import type { RawTelemetry, SatelliteState } from './types';

/**
 * Maps RawTelemetry received from the backend/simulator to the internal camelCase SatelliteState.
 */
export const mapRawToState = (raw: RawTelemetry): SatelliteState => {
  const batteryPct = raw["Battery Percentage"];
  // Calculate a realistic battery voltage curve: 28.0V (0%) to 32.5V (100%)
  const batteryVoltage = parseFloat((batteryPct * 0.045 + 28.0).toFixed(2));

  return {
    timestamp: raw.timestamp,
    batteryPercentage: batteryPct,
    batteryVoltage,
    solarPanelOutput: raw["Solar Panel Output"],
    powerConsumption: raw["Power Consumption"],
    batteryTemperature: raw["Battery Temperature"],
    cpuTemperature: raw["CPU Temperature"],
    communicationStatus: raw["Communication Status"],
    signalStrength: raw["Signal Strength"],
    storageUsed: raw["Storage Used"],
    cameraStatus: raw["Camera Status"],
    imagesCaptured: raw["Images Captured"],
    currentTask: raw["Current Task"],
    missionMode: raw["Mission Mode"],
    orbitNumber: raw["Orbit Number"],
    activeFault: raw["Active Fault"],
    overallSatelliteHealth: raw["Overall Satellite Health"],
  };
};

/**
 * Maps the internal camelCase SatelliteState back to RawTelemetry.
 */
export const mapStateToRaw = (state: SatelliteState): RawTelemetry => {
  return {
    timestamp: state.timestamp,
    "Battery Percentage": state.batteryPercentage,
    "Solar Panel Output": state.solarPanelOutput,
    "Power Consumption": state.powerConsumption,
    "Battery Temperature": state.batteryTemperature,
    "CPU Temperature": state.cpuTemperature,
    "Communication Status": state.communicationStatus,
    "Signal Strength": state.signalStrength,
    "Storage Used": state.storageUsed,
    "Camera Status": state.cameraStatus,
    "Images Captured": state.imagesCaptured,
    "Current Task": state.currentTask,
    "Mission Mode": state.missionMode,
    "Orbit Number": state.orbitNumber,
    "Active Fault": state.activeFault,
    "Overall Satellite Health": state.overallSatelliteHealth,
  };
};
