import { useRef, useState, useEffect } from 'react';
import { useSatelliteState } from './hooks/useSatelliteState';
import { SpaceScene } from './scene/SpaceScene';
import { DashboardUI } from './components/DashboardUI';
import { DevPanel } from './components/DevPanel';
import { AnomalyModal } from './components/AnomalyModal';
import { supabase } from './lib/supabase';
import './App.css';

function App() {
  const { state, plan, updateState, isSimulationActive, setIsSimulationActive } = useSatelliteState();
  const [showAnomalyModal, setShowAnomalyModal] = useState(false);

  // Keep track of the last processed plan headline to avoid repeated popups
  const lastProcessedHeadline = useRef<string | null>(null);

  useEffect(() => {
    if (plan && (plan.risk_level === 'critical' || plan.risk_level === 'high' || plan.risk_level === 'elevated')) {
      if (plan.headline !== lastProcessedHeadline.current) {
        setShowAnomalyModal(true);
        lastProcessedHeadline.current = plan.headline;
      }
    }
  }, [plan]);

  useEffect(() => {
    const subscription = supabase.channel('anomaly_approval')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'anomalies' }, payload => {
        if (payload.new.status === 'Approved & Resolved') {
          handleAnomalyApprove();
        }
      })
      .subscribe();
    
    return () => { supabase.removeChannel(subscription); };
  }, []);

  const handleAnomalyApprove = () => {
    setShowAnomalyModal(false);
    updateState({
      activeFault: 'None',
      overallSatelliteHealth: 'Good',
      missionMode: 'Safe Mode'
    });
  };

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

        {/* Nominal Plan Widget */}
        {!showAnomalyModal && plan && plan.risk_level === 'nominal' && (
          <div className="nominal-plan-widget">
            <h3>Nominal Operation Plan</h3>
            <p className="plan-headline">{plan.headline}</p>
            <p className="plan-action">{plan.next_action}</p>
          </div>
        )}
      </div>

      {showAnomalyModal && plan && (
        <AnomalyModal 
          plan={plan} 
          onDismiss={() => setShowAnomalyModal(false)} 
          onApprove={handleAnomalyApprove}
        />
      )}
    </div>
  );
}

export default App;
