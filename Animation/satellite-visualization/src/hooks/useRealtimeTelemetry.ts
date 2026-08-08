import { useState, useEffect } from 'react';
import type { RawTelemetry, AIPlan } from '../types/SatelliteState';
import { INITIAL_RAW_STATE } from './useMockTelemetry';

export const useRealtimeTelemetry = () => {
  const [rawState, setRawState] = useState<RawTelemetry>(INITIAL_RAW_STATE);
  const [plan, setPlan] = useState<AIPlan | null>(null);
  const [isSimulationActive, setIsSimulationActive] = useState<boolean>(true);

  const updateRawState = (updates: Partial<RawTelemetry>) => {
    // Allows local overrides if needed, just like mock telemetry
    setRawState((prev) => ({ ...prev, ...updates }));
  };

  useEffect(() => {
    if (!isSimulationActive) return;

    let interval: number;

    const fetchTelemetry = async () => {
      try {
        const response = await fetch('https://stellx.onrender.com/telemetry/next');
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        
        if (data.telemetry) {
          setRawState(data.telemetry);
        }
        if (data.plan) {
          setPlan(data.plan);
        }
      } catch (error) {
        console.error("Error fetching telemetry:", error);
      }
    };

    // Fetch immediately on mount
    fetchTelemetry();
    
    // Then poll every 6 seconds as per backend spec
    interval = window.setInterval(fetchTelemetry, 6000);

    return () => {
      window.clearInterval(interval);
    };
  }, [isSimulationActive]);

  return {
    rawState,
    plan,
    updateRawState,
    isSimulationActive,
    setIsSimulationActive,
  };
};
