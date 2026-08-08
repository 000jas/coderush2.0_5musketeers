import { useState, useEffect, useRef } from 'react';
import type { RawTelemetry } from '../types/SatelliteState';

export const INITIAL_RAW_STATE: RawTelemetry = {
  timestamp: new Date().toISOString(),
  "Battery Percentage": 85,
  "Solar Panel Output": 1020,
  "Power Consumption": 320,
  "Battery Temperature": 24.2,
  "CPU Temperature": 38.5,
  "Communication Status": "Connected",
  "Signal Strength": -55,
  "Storage Used": 20.0,
  "Camera Status": "Inactive",
  "Images Captured": 1536,
  "Current Task": "Orbiting Earth & Routine Systems Diagnostics",
  "Mission Mode": "Normal Operation",
  "Orbit Number": 3,
  "Active Fault": "None",
  "Overall Satellite Health": "Excellent",
};

export const useMockTelemetry = () => {
  const [rawState, setRawState] = useState<RawTelemetry>(INITIAL_RAW_STATE);
  const [isSimulationActive, setIsSimulationActive] = useState<boolean>(true);
  const tickRef = useRef<number>(0);

  // Expose a function to update raw state properties manually (via DevPanel overrides)
  const updateRawState = (updates: Partial<RawTelemetry>) => {
    setRawState((prev) => {
      const next = { ...prev, ...updates };
      // Align health statuses on manual override
      if (updates["Battery Percentage"] !== undefined) {
        const pct = updates["Battery Percentage"];
        if (pct < 20) {
          next["Overall Satellite Health"] = "Critical";
        } else if (pct < 40) {
          next["Overall Satellite Health"] = "Warning";
        } else if (next["Active Fault"] === "None") {
          next["Overall Satellite Health"] = "Excellent";
        }
      }

      if (updates["Active Fault"] !== undefined) {
        const fault = updates["Active Fault"];
        if (fault === "None") {
          next["Overall Satellite Health"] = next["Battery Percentage"] < 20 ? "Critical" : next["Battery Percentage"] < 40 ? "Warning" : "Excellent";
        } else {
          next["Overall Satellite Health"] = fault.toLowerCase().includes("critical") || fault.toLowerCase().includes("overtemp") ? "Critical" : "Warning";
        }
      }

      next.timestamp = new Date().toISOString();
      return next;
    });
  };

  useEffect(() => {
    if (!isSimulationActive) return;

    const interval = setInterval(() => {
      tickRef.current = (tickRef.current + 1) % 120;
      const tick = tickRef.current;

      setRawState((prev) => {
        let batteryPct = prev["Battery Percentage"];
        let solarOutput = prev["Solar Panel Output"];
        let powerCons = prev["Power Consumption"];
        let batTemp = prev["Battery Temperature"];
        let cpuTemp = prev["CPU Temperature"];
        let commsStatus = prev["Communication Status"];
        let signalStr = prev["Signal Strength"];
        let storageUsed = prev["Storage Used"];
        let cameraStatus = prev["Camera Status"];
        let imagesCap = prev["Images Captured"];
        let task = prev["Current Task"];
        let mode = prev["Mission Mode"];
        let orbitNo = prev["Orbit Number"];
        let fault = prev["Active Fault"];

        // Increment orbit count at cycle start
        if (tick === 0) {
          orbitNo += 1;
        }

        // --- Cycle States ---
        if (tick >= 0 && tick < 30) {
          // NORMAL OPERATION (Orbiting)
          mode = "Normal Operation";
          cameraStatus = "Inactive";
          task = "Routine Systems Diagnostics & Orbiting";
          powerCons = 310;
          solarOutput = 1040;

          // Slowly charge
          batteryPct = Math.min(100, batteryPct + 0.4);

          // Connected for first 15s of orbit slice, then Disconnected
          if (tick < 15) {
            commsStatus = "Connected";
            signalStr = -55;
          } else {
            commsStatus = "Disconnected";
            signalStr = -100;
          }

          fault = "None";
          cpuTemp = parseFloat((37 + Math.sin(tick / 5) * 1.5).toFixed(1));
          batTemp = parseFloat((23 + Math.sin(tick / 4) * 0.5).toFixed(1));

        } else if (tick >= 30 && tick < 60) {
          // EARTH OBSERVATION (Imaging)
          mode = "Earth Observation";
          cameraStatus = "Active";
          task = "Capturing High-Resolution Earth Images";
          powerCons = 760;
          solarOutput = 410; // panels angled away

          // Discharge battery
          batteryPct = Math.max(10, batteryPct - 0.7);

          commsStatus = "Disconnected";
          signalStr = -100;

          // Increase storage and images
          storageUsed = Math.min(100, parseFloat((storageUsed + 1.5).toFixed(1)));
          if ((tick - 30) % 6 === 0 && tick !== 30) {
            imagesCap += 2;
          }

          fault = "None";
          cpuTemp = parseFloat((46 + (tick - 30) * 0.6).toFixed(1));
          batTemp = parseFloat((24 + (tick - 30) * 0.15).toFixed(1));

        } else if (tick >= 60 && tick < 90) {
          // DATA DOWNLINK (Transmitting)
          mode = "Data Downlink";
          cameraStatus = "Inactive";
          task = "Transmitting Scientific Data to Ground Station";
          powerCons = 620;
          solarOutput = 840;

          // Discharge battery slightly less
          batteryPct = Math.max(10, batteryPct - 0.3);

          commsStatus = "Connected";
          // Signal strength parabola peaking at tick 75
          const relTick = tick - 60;
          signalStr = Math.round(-85 + 35 * Math.sin((relTick / 30) * Math.PI));

          // Downlink storage data
          storageUsed = Math.max(0, parseFloat((storageUsed - 2.8).toFixed(1)));
          fault = "None";
          
          cpuTemp = Math.max(38, parseFloat((prev["CPU Temperature"] - 0.4).toFixed(1)));
          batTemp = Math.max(24, parseFloat((prev["Battery Temperature"] - 0.1).toFixed(1)));

        } else if (tick >= 90 && tick < 105) {
          // RECHARGE & OPTIMIZE
          mode = "Normal Operation";
          cameraStatus = "Inactive";
          task = "Optimal Solar Array Pointing & Battery Recharging";
          powerCons = 190;
          solarOutput = 1190; // High recharge efficiency

          batteryPct = Math.min(100, batteryPct + 2.2);
          commsStatus = "Disconnected";
          signalStr = -100;
          fault = "None";

          cpuTemp = Math.max(36, parseFloat((prev["CPU Temperature"] - 0.8).toFixed(1)));
          batTemp = Math.min(28, parseFloat((prev["Battery Temperature"] + 0.2).toFixed(1)));

        } else if (tick >= 105 && tick < 120) {
          // SAFE MODE (Thermal Overheat Anomaly)
          mode = "Safe Mode";
          cameraStatus = "Inactive";
          task = "CRITICAL: CPU Overheat Detected - Entering Survival Standby";
          powerCons = 120;
          solarOutput = 610;

          // Slow charge recovery
          batteryPct = Math.min(100, batteryPct + 0.3);
          commsStatus = "Connected"; // Beacon
          signalStr = -76;
          
          fault = "CPU Thermal Sensor Overtemp: 82.5°C";

          if (tick === 105) {
            cpuTemp = 82.5;
            batTemp = 33.0;
          } else {
            cpuTemp = parseFloat((prev["CPU Temperature"] - 2.2).toFixed(1));
            batTemp = parseFloat((prev["Battery Temperature"] - 0.3).toFixed(1));
          }
        }

        // Determine health category based on active fault or battery warnings
        let health: 'Excellent' | 'Good' | 'Warning' | 'Critical' = "Excellent";
        if (fault !== "None") {
          health = fault.toLowerCase().includes("critical") || fault.toLowerCase().includes("overtemp") ? "Critical" : "Warning";
        } else if (batteryPct < 20) {
          health = "Critical";
        } else if (batteryPct < 40) {
          health = "Warning";
        } else if (batteryPct < 60) {
          health = "Good";
        }

        return {
          timestamp: new Date().toISOString(),
          "Battery Percentage": Math.round(batteryPct),
          "Solar Panel Output": Math.round(solarOutput),
          "Power Consumption": Math.round(powerCons),
          "Battery Temperature": parseFloat(batTemp.toFixed(1)),
          "CPU Temperature": parseFloat(cpuTemp.toFixed(1)),
          "Communication Status": commsStatus,
          "Signal Strength": signalStr,
          "Storage Used": parseFloat(storageUsed.toFixed(1)),
          "Camera Status": cameraStatus,
          "Images Captured": imagesCap,
          "Current Task": task,
          "Mission Mode": mode,
          "Orbit Number": orbitNo,
          "Active Fault": fault,
          "Overall Satellite Health": health,
        };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isSimulationActive]);

  return {
    rawState,
    updateRawState,
    isSimulationActive,
    setIsSimulationActive,
  };
};
