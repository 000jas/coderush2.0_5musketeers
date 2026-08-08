import React from 'react';
import type { SatelliteState } from '../types/SatelliteState';

interface DashboardUIProps {
  state: SatelliteState;
}

export const DashboardUI: React.FC<DashboardUIProps> = ({ state }) => {
  // Helpers to assign CSS classes based on status
  const getHealthClass = (health: string) => {
    if (health === 'Critical') return 'status-critical';
    if (health === 'Warning') return 'status-warning';
    return 'status-healthy';
  };

  const getHealthBgClass = (health: string) => {
    if (health === 'Critical') return 'bg-critical';
    if (health === 'Warning') return 'bg-warning';
    return 'bg-healthy';
  };

  const getHealthBadgeClass = (health: string) => {
    if (health === 'Critical') return 'status-badge critical';
    if (health === 'Warning') return 'status-badge warning';
    return 'status-badge healthy';
  };

  const getCommsBadgeClass = (status: string) => {
    return status === 'Connected' ? 'status-badge healthy' : 'status-badge warning';
  };

  const getCameraBadgeClass = (status: string) => {
    if (status === 'Active') return 'status-badge healthy';
    return 'status-badge warning';
  };

  return (
    <div className="hud-panel left-panel">
      {/* 1. System Health & Core Identification */}
      <div className={`widget ${state.overallSatelliteHealth === 'Critical' ? 'widget-critical' : ''}`}>
        <div className="widget-title">
          <span>SYSTEM HEALTH</span>
          <span className={getHealthClass(state.overallSatelliteHealth)}>●</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>SATELLITE IDENTIFIER</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 'bold', fontSize: '1.05rem', color: 'var(--color-primary)' }}>
              OLYMPUS-III (CO-42)
            </div>
          </div>
          <span className={getHealthBadgeClass(state.overallSatelliteHealth)}>
            {state.overallSatelliteHealth}
          </span>
        </div>
      </div>

      {/* 2. Active Task Terminal */}
      <div className="widget">
        <div className="widget-title">ACTIVE TELEMETRY STREAM</div>
        <div className="task-terminal">
          {state.currentTask}
        </div>
      </div>

      {/* 3. Power Subsystem */}
      <div className="widget">
        <div className="widget-title">EPS (POWER SUBREGULATOR)</div>
        <div className="grid-2x2">
          <div className="telemetry-item">
            <span className="telemetry-label">Battery Level</span>
            <span className="telemetry-value">
              {state.batteryPercentage}<span className="telemetry-unit">%</span>
            </span>
          </div>
          <div className="telemetry-item">
            <span className="telemetry-label">Voltage</span>
            <span className="telemetry-value">
              {state.batteryVoltage.toFixed(2)}<span className="telemetry-unit">V</span>
            </span>
          </div>
          <div className="telemetry-item">
            <span className="telemetry-label">Solar Output</span>
            <span className="telemetry-value" style={{ color: state.solarPanelOutput > 0 ? 'var(--color-success)' : 'var(--text-main)' }}>
              {state.solarPanelOutput}<span className="telemetry-unit">W</span>
            </span>
          </div>
          <div className="telemetry-item">
            <span className="telemetry-label">Load draw</span>
            <span className="telemetry-value" style={{ color: state.powerConsumption > 50 ? 'var(--color-warning)' : 'var(--text-main)' }}>
              {state.powerConsumption}<span className="telemetry-unit">W</span>
            </span>
          </div>
        </div>

        {/* Battery Level Visual Bar */}
        <div style={{ marginTop: '8px' }}>
          <div className="progress-bar-container">
            <div
              className={`progress-bar-fill ${getHealthBgClass(state.batteryPercentage < 20 ? 'Critical' : state.batteryPercentage < 40 ? 'Warning' : 'Healthy')}`}
              style={{ width: `${state.batteryPercentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* 4. Thermal Environment */}
      <div className="widget">
        <div className="widget-title">THERMAL ENVIRONMENTAL CONTROL</div>
        <div className="grid-2x2">
          <div className="telemetry-item">
            <span className="telemetry-label">CPU Temp</span>
            <span className="telemetry-value" style={{ color: state.cpuTemperature > 70 ? 'var(--color-danger)' : state.cpuTemperature > 50 ? 'var(--color-warning)' : 'var(--text-main)' }}>
              {state.cpuTemperature.toFixed(1)}<span className="telemetry-unit">°C</span>
            </span>
          </div>
          <div className="telemetry-item">
            <span className="telemetry-label">Battery Temp</span>
            <span className="telemetry-value" style={{ color: state.batteryTemperature > 30 ? 'var(--color-warning)' : 'var(--text-main)' }}>
              {state.batteryTemperature.toFixed(1)}<span className="telemetry-unit">°C</span>
            </span>
          </div>
        </div>
      </div>

      {/* 5. Communications & Payloads */}
      <div className="widget">
        <div className="widget-title">PAYLOAD & COMMS (RF/OPTICAL)</div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>RF LINK STATE</span>
            <span className={getCommsBadgeClass(state.communicationStatus)}>{state.communicationStatus}</span>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>CAMERA STATE</span>
            <span className={getCameraBadgeClass(state.cameraStatus)}>{state.cameraStatus}</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>IMAGES DOWNLINKED</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 'bold', color: 'var(--color-primary)' }}>
              {state.imagesCaptured} IMGs
            </span>
          </div>
        </div>

        {/* Signal Strength Progress Bar */}
        {(() => {
          const signalPercent = state.communicationStatus === 'Connected'
            ? Math.max(0, Math.min(100, Math.round(((state.signalStrength + 100) / 70) * 100)))
            : 0;
          return (
            <div style={{ marginTop: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', marginBottom: '4px' }}>
                <span style={{ color: 'var(--text-muted)' }}>LINK SIGNAL STRENGTH</span>
                <span style={{ fontFamily: 'var(--font-mono)' }}>
                  {state.communicationStatus === 'Connected' ? `${state.signalStrength} dBm (${signalPercent}%)` : 'OFFLINE'}
                </span>
              </div>
              <div className="progress-bar-container">
                <div
                  className="progress-bar-fill bg-healthy"
                  style={{
                    width: `${signalPercent}%`,
                    backgroundColor: state.communicationStatus === 'Connected' ? 'var(--color-primary)' : 'var(--text-dim)'
                  }}
                />
              </div>
            </div>
          );
        })()}

        {/* Solid State Storage Progress Bar */}
        <div style={{ marginTop: '10px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', marginBottom: '4px' }}>
            <span style={{ color: 'var(--text-muted)' }}>SOLID STATE RECORDER (SSR)</span>
            <span style={{ fontFamily: 'var(--font-mono)' }}>{state.storageUsed}%</span>
          </div>
          <div className="progress-bar-container">
            <div
              className={`progress-bar-fill ${state.storageUsed > 85 ? 'bg-critical' : state.storageUsed > 60 ? 'bg-warning' : 'bg-healthy'}`}
              style={{ width: `${state.storageUsed}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
