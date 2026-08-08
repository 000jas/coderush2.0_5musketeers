import { useRealtimeTelemetry } from './useRealtimeTelemetry';
import { mapRawToState } from '../utils/telemetryMapper';
import type { SatelliteState, RawTelemetry, AIPlan } from '../types/SatelliteState';

/**
 * Custom hook to coordinate satellite telemetry state updates.
 * Exposes a clean, mapped camelCase interface for the React components and 3D scene,
 * while managing integration with the raw backend JSON schema.
 */
export const useSatelliteState = () => {
  const { rawState, plan, updateRawState, isSimulationActive, setIsSimulationActive } = useRealtimeTelemetry();
  
  // 1. Map raw telemetry to frontend-friendly state
  const state = mapRawToState(rawState);
  
  // 2. Wrap state overrides to map camelCase updates back to the raw schema
  const updateState = (updates: Partial<SatelliteState>) => {
    const rawUpdates: Partial<RawTelemetry> = {};
    
    if (updates.timestamp !== undefined) rawUpdates.timestamp = updates.timestamp;
    if (updates.batteryPercentage !== undefined) rawUpdates["Battery Percentage"] = updates.batteryPercentage;
    if (updates.solarPanelOutput !== undefined) rawUpdates["Solar Panel Output"] = updates.solarPanelOutput;
    if (updates.powerConsumption !== undefined) rawUpdates["Power Consumption"] = updates.powerConsumption;
    if (updates.batteryTemperature !== undefined) rawUpdates["Battery Temperature"] = updates.batteryTemperature;
    if (updates.cpuTemperature !== undefined) rawUpdates["CPU Temperature"] = updates.cpuTemperature;
    if (updates.communicationStatus !== undefined) rawUpdates["Communication Status"] = updates.communicationStatus;
    if (updates.signalStrength !== undefined) rawUpdates["Signal Strength"] = updates.signalStrength;
    if (updates.storageUsed !== undefined) rawUpdates["Storage Used"] = updates.storageUsed;
    if (updates.cameraStatus !== undefined) rawUpdates["Camera Status"] = updates.cameraStatus;
    if (updates.imagesCaptured !== undefined) rawUpdates["Images Captured"] = updates.imagesCaptured;
    if (updates.currentTask !== undefined) rawUpdates["Current Task"] = updates.currentTask;
    if (updates.missionMode !== undefined) rawUpdates["Mission Mode"] = updates.missionMode;
    if (updates.orbitNumber !== undefined) rawUpdates["Orbit Number"] = updates.orbitNumber;
    if (updates.activeFault !== undefined) rawUpdates["Active Fault"] = updates.activeFault;
    if (updates.overallSatelliteHealth !== undefined) rawUpdates["Overall Satellite Health"] = updates.overallSatelliteHealth;
    
    updateRawState(rawUpdates);
  };

  return {
    state,
    rawState,
    plan,
    updateState,
    isSimulationActive,
    setIsSimulationActive,
  };
};

