import { useRef } from 'react';
import { useSatelliteState } from './hooks/useSatelliteState';
import { SpaceScene } from './scene/SpaceScene';
import { DashboardUI } from './components/DashboardUI';
import { DevPanel } from './components/DevPanel';
import './App.css';

function App() {
  const { state, updateState, isSimulationActive, setIsSimulationActive } = useSatelliteState();

  // Create a mutable reference to store the latest state for the 3D scene loop.
  // This avoids triggering React re-renders on the WebGL Canvas.
  const stateRef = useRef(state);
  stateRef.current = state;

  return (
    <div className="app-container">
      {/* Top Header Bar */}
      <header className="dashboard-header">
        <div className="dashboard-logo">
          <div className="logo-icon" />
          <h1>Mission Control Center</h1>
        </div>
        
        <div className="header-meta">
          <div className="meta-item">
            <span className="meta-label">Orbit Count</span>
            <span className="meta-val">L-ORB #{state.orbitNumber}</span>
          </div>
          <div className="meta-item">
            <span className="meta-label">Payload Mode</span>
            <span className="meta-val" style={{
              color: state.missionMode === 'Safe Mode' ? 'var(--color-danger)' : 
                     state.missionMode === 'Earth Observation' ? 'var(--color-success)' : 'var(--color-primary)'
            }}>
              {state.missionMode}
            </span>
          </div>
          {state.activeFault !== 'None' && (
            <div className="active-fault-marquee">
              <span className="fault-dot" />
              <span>ANOMALY DETECTED: {state.activeFault}</span>
            </div>
          )}
        </div>
      </header>

      {/* Grid Dashboard Workspace */}
      <div className="dashboard-workspace">
        {/* Left Panel: Detailed System HUD */}
        <DashboardUI state={state} />

        {/* Center Panel: Interactive 3D WebGL Canvas */}
        <SpaceScene stateRef={stateRef} />

        {/* Right Panel: Developer Overrides Panel */}
        <DevPanel
          state={state}
          updateState={updateState}
          isSimulationActive={isSimulationActive}
          setIsSimulationActive={setIsSimulationActive}
        />
      </div>
    </div>
  );
}

export default App;
