import React from 'react';
import type { SatelliteState } from '../types/SatelliteState';
import { DataCollectionPanel } from './DataCollectionPanel';

interface DevPanelProps {
  state: SatelliteState;
  updateState: (updates: Partial<SatelliteState>) => void;
  isSimulationActive: boolean;
  setIsSimulationActive: (active: boolean) => void;
}

export const DevPanel: React.FC<DevPanelProps> = ({
  state,
  updateState,
  isSimulationActive,
  setIsSimulationActive,
}) => {
  const handleMissionModeChange = (mode: string) => {
    let cameraStatus: 'Active' | 'Inactive' = 'Inactive';
    let currentTask = state.currentTask;

    if (mode === 'Safe Mode') {
      cameraStatus = 'Inactive';
      currentTask = 'CRITICAL: Manual Override to Safe Mode';
    } else if (mode === 'Earth Observation') {
      cameraStatus = 'Active';
      currentTask = 'Target Lock: Manual Imaging Target Selected';
    } else if (mode === 'Data Downlink') {
      cameraStatus = 'Inactive';
      currentTask = 'Downlinking: Manual Downlink Stream Triggered';
    } else {
      currentTask = 'Normal Operation: Orbiting Earth & Routine Idle';
    }

    updateState({
      missionMode: mode,
      cameraStatus,
      currentTask,
    });
  };

  return (
    <div className="hud-panel right-panel" style={{ display: 'flex', flexDirection: 'column' }}>
      {/* 1. Simulation Master Control */}
      <div className="widget" style={{ borderColor: isSimulationActive ? 'var(--color-primary)' : 'var(--text-dim)' }}>
        <div className="widget-title">SIMULATOR SETTINGS</div>
        <div className="sim-status-bar">
          <span>REAL-TIME SIMULATION</span>
          <span style={{ color: isSimulationActive ? 'var(--color-success)' : 'var(--text-muted)' }}>
            {isSimulationActive ? 'RUNNING' : 'PAUSED'}
          </span>
        </div>
        
        <label className="control-toggle">
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Enable Auto-Simulator</span>
          <span className="switch">
            <input
              type="checkbox"
              checked={isSimulationActive}
              onChange={(e) => setIsSimulationActive(e.target.checked)}
            />
            <span className="slider"></span>
          </span>
        </label>
        
        <div style={{ fontSize: '0.68rem', color: 'var(--text-dim)', fontStyle: 'italic', marginTop: '2px' }}>
          *Pause simulator to manually modify values using controls below.
        </div>
      </div>

      {/* 2. Subsystem Toggles & Dropdowns */}
      <div className="widget">
        <div className="widget-title">MISSION CONTROL INTERFACE</div>
        
        <div className="dev-controls">
          {/* Mission Mode Select */}
          <div className="control-group">
            <label className="control-label">MISSION MODE</label>
            <select
              className="control-select"
              value={state.missionMode}
              onChange={(e) => handleMissionModeChange(e.target.value)}
            >
              <option value="Normal Operation">Normal Operation</option>
              <option value="Earth Observation">Earth Observation</option>
              <option value="Data Downlink">Data Downlink</option>
              <option value="Safe Mode">Safe Mode</option>
            </select>
          </div>

          {/* Current Task Selection */}
          <div className="control-group">
            <label className="control-label">CURRENT TASK DESCRIPTION</label>
            <select
              className="control-select"
              value={state.currentTask}
              onChange={(e) => updateState({ currentTask: e.target.value })}
            >
              <option value="Routine Systems Diagnostics & Orbiting">Routine Orbiting</option>
              <option value="Capturing High-Resolution Earth Images">Imaging Earth Targets</option>
              <option value="Transmitting Scientific Data to Ground Station">Downlinking Ground Station</option>
              <option value="Optimal Solar Array Pointing & Battery Recharging">Solar Array Recharging</option>
              <option value="CRITICAL: CPU Overheat Detected - Entering Survival Standby">CPU Overheat Standby</option>
              <option value="Payload Diagnostics - Sensor Checkup">Payload Diagnostics</option>
            </select>
          </div>

          {/* Fault Injector */}
          <div className="control-group">
            <label className="control-label">INJECT FAULT STATE</label>
            <select
              className="control-select"
              value={state.activeFault}
              onChange={(e) => updateState({ activeFault: e.target.value })}
            >
              <option value="None">None (System Nominal)</option>
              <option value="CPU Thermal Sensor Overtemp: 82.5°C">CPU Overtemperature (Thermal)</option>
              <option value="Reaction Wheel Failure - Axis Desat Required">Reaction Wheel Drift (Guidance)</option>
              <option value="Battery Thermal Runaway Warning: 42°C">Battery Thermal Overheat</option>
              <option value="Antenna Gymbal Actuator Jam">Antenna Steering Jam (Comms)</option>
              <option value="Solar Panel Actuator Slip">Solar Panel Drive Failure</option>
            </select>
          </div>

          {/* Comms Toggle */}
          <label className="control-toggle" style={{ marginTop: '4px' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-main)', fontWeight: 'bold' }}>RF TRANSMITTER POWER</span>
            <span className="switch">
              <input
                type="checkbox"
                checked={state.communicationStatus === 'Connected'}
                onChange={(e) => {
                  const status = e.target.checked ? 'Connected' : 'Disconnected';
                  updateState({
                    communicationStatus: status,
                    signalStrength: status === 'Connected' ? -55 : -100,
                  });
                }}
              />
              <span className="slider"></span>
            </span>
          </label>
        </div>
      </div>

      {/* 3. Subsystem Sliders */}
      <div className="widget" style={{ display: isSimulationActive ? 'none' : 'block' }}>
        <div className="widget-title">TELEMETRY SLIDERS OVERRIDE</div>
        
        <div className="dev-controls">
          {/* Battery level Slider */}
          <div className="control-group">
            <div className="control-label">
              <span>BATTERY CAPACITY</span>
              <span style={{ fontFamily: 'var(--font-mono)' }}>{state.batteryPercentage}%</span>
            </div>
            <input
              type="range"
              className="control-slider"
              min="0"
              max="100"
              value={state.batteryPercentage}
              onChange={(e) => updateState({ batteryPercentage: parseInt(e.target.value) })}
            />
          </div>

          {/* CPU Temperature Slider */}
          <div className="control-group">
            <div className="control-label">
              <span>CPU TEMPERATURE</span>
              <span style={{ fontFamily: 'var(--font-mono)' }}>{state.cpuTemperature}°C</span>
            </div>
            <input
              type="range"
              className="control-slider"
              min="10"
              max="100"
              value={state.cpuTemperature}
              onChange={(e) => updateState({ cpuTemperature: parseFloat(e.target.value) })}
            />
          </div>

          {/* SSR Storage slider */}
          <div className="control-group">
            <div className="control-label">
              <span>RECORDER STORAGE</span>
              <span style={{ fontFamily: 'var(--font-mono)' }}>{state.storageUsed}%</span>
            </div>
            <input
              type="range"
              className="control-slider"
              min="0"
              max="100"
              value={state.storageUsed}
              onChange={(e) => updateState({ storageUsed: parseFloat(e.target.value) })}
            />
          </div>

          {/* Signal strength slider */}
          <div className="control-group">
            <div className="control-label">
              <span>LINK SIGNAL STRENGTH</span>
              <span style={{ fontFamily: 'var(--font-mono)' }}>
                {state.communicationStatus === 'Connected' ? `${state.signalStrength} dBm` : 'OFFLINE'}
              </span>
            </div>
            <input
              type="range"
              className="control-slider"
              min="-100"
              max="-30"
              value={state.signalStrength}
              disabled={state.communicationStatus === 'Disconnected'}
              style={{ opacity: state.communicationStatus === 'Disconnected' ? 0.4 : 1 }}
              onChange={(e) => updateState({ signalStrength: parseInt(e.target.value) })}
            />
          </div>
        </div>
      </div>

      <DataCollectionPanel imagesCaptured={state.imagesCaptured} />
    </div>
  );
};
