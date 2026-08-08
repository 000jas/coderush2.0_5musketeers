import { useState, useEffect, useRef } from 'react';
import '@/lib/envPolyfill';
import type { RawTelemetry, SatelliteState, TimelineEvent, LogMessage } from '../lib/types';
import { mapRawToState } from '../lib/telemetryMapper';
import { supabase } from '../lib/supabase';

// Initial local fallback telemetry values
const INITIAL_RAW_STATE: RawTelemetry = {
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

interface BackendPlan {
  headline?: string;
  risk_level?: string;
  satellite_instruction?: string;
  operator_notes?: string[];
  precautions?: string[];
  expected_outcome?: string;
  success_probability?: number;
  recovery_time?: string;
}

export const useDashboardState = () => {
  const [rawState, setRawState] = useState<RawTelemetry>(INITIAL_RAW_STATE);
  const [backendPlan, setBackendPlan] = useState<BackendPlan | null>(null);
  const [isSimulationActive, setIsSimulationActive] = useState<boolean>(false);
  const [history, setHistory] = useState<SatelliteState[]>([]);
  const [logs, setLogs] = useState<LogMessage[]>([]);
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  
  // Custom Mission Properties
  const [missionName, setMissionName] = useState<string>('Olympus-III');
  const [satelliteName, setSatelliteName] = useState<string>('OLYMPUS-3');
  const [orbitType, setOrbitType] = useState<string>('LEO (Low Earth Orbit)');
  const [missionGoal, setMissionGoal] = useState<string>('Global Multi-Spectral Earth Imaging');
  const [payloadType, setPayloadType] = useState<string>('MS-VIS-IR Optical Sensor');
  const [launchDate, setLaunchDate] = useState<string>('2026-04-12');
  const [activeGroundStation, setActiveGroundStation] = useState<string>('Svalbard (SESS)');
  
  // Counters & Metrics
  const [packetsReceived, setPacketsReceived] = useState<number>(0);
  const [sessionsCount, setSessionsCount] = useState<number>(1);
  const [faultsDetectedCount, setFaultsDetectedCount] = useState<number>(0);
  const [proceduresExecutedCount, setProceduresExecutedCount] = useState<number>(0);
  const [missionSeconds, setMissionSeconds] = useState<number>(9950);

  const prevCommsStatusRef = useRef<'Connected' | 'Disconnected'>('Connected');
  const prevFaultRef = useRef<string>('None');
  const localTickRef = useRef<number>(0);

  const state = mapRawToState(rawState);
  const apiBaseUrl = (import.meta as any).env?.VITE_API_BASE_URL || 'https://stellx.onrender.com';

  const addLog = (type: LogMessage['type'], message: string) => {
    const newLog: LogMessage = {
      timestamp: new Date().toLocaleTimeString(),
      type,
      message,
    };
    setLogs((prev) => [newLog, ...prev].slice(0, 150));
  };

  const addTimelineEvent = (severity: TimelineEvent['severity'], subsystem: string, description: string) => {
    const newEvent: TimelineEvent = {
      timestamp: new Date().toLocaleTimeString(),
      severity,
      subsystem,
      description,
    };
    setTimeline((prev) => [newEvent, ...prev].slice(0, 80));
  };

  const logAnomalyToDb = async (plan: BackendPlan, faultType: string) => {
    try {
      await supabase.from('anomalies').insert([{
        headline: plan.headline,
        risk_level: plan.risk_level,
        what_happened: `System detected anomaly: ${faultType}`,
        next_action: plan.satellite_instruction,
        precautions: plan.precautions,
        status: 'Detected - Awaiting Operator Action'
      }]);
    } catch (e) {
      console.error("Failed to insert auto-logged anomaly:", e);
    }
  };

  // Telemetry Poller from the Backend
  const fetchTelemetry = async () => {
    try {
      const res = await fetch(`${apiBaseUrl}/telemetry/next`);
      if (res.ok) {
        const data = await res.json();
        
        if (data.telemetry) {
          setRawState(data.telemetry);
          setPacketsReceived((prev) => prev + 1);
        }
        if (data.plan) {
          setBackendPlan(data.plan);
          
          if (data.telemetry && data.telemetry["Active Fault"] !== 'None') {
            if (data.telemetry["Active Fault"] !== prevFaultRef.current) {
              logAnomalyToDb(data.plan, data.telemetry["Active Fault"]);
            }
          }
        }
      } else {
        // Fallback to local simulator if server returns non-200
        runLocalSimulationTick();
      }
    } catch (err) {
      // Fallback to local simulator if server is offline / times out
      runLocalSimulationTick();
    }
  };

  // Local simulator tick in case the backend is sleeping or unreachable
  const runLocalSimulationTick = () => {
    setPacketsReceived((prev) => prev + 1);
    localTickRef.current = (localTickRef.current + 1) % 120;
    const tick = localTickRef.current;

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

      if (tick === 0) orbitNo += 1;

      // Normal cycle tracking
      if (tick >= 0 && tick < 30) {
        mode = "Normal Operation";
        cameraStatus = "Inactive";
        task = "Routine Systems Diagnostics & Orbiting";
        powerCons = 290;
        solarOutput = 1040;
        batteryPct = Math.min(100, batteryPct + 0.35);
        commsStatus = tick < 15 ? "Connected" : "Disconnected";
        signalStr = commsStatus === "Connected" ? -54 : -100;
        fault = "None";
        cpuTemp = parseFloat((38 + Math.sin(tick / 5) * 1.2).toFixed(1));
        batTemp = parseFloat((23 + Math.sin(tick / 4) * 0.4).toFixed(1));
      } else if (tick >= 30 && tick < 60) {
        mode = "Earth Observation";
        cameraStatus = "Active";
        task = "Capturing High-Resolution Earth Images";
        powerCons = 750;
        solarOutput = 420;
        batteryPct = Math.max(10, batteryPct - 0.65);
        commsStatus = "Disconnected";
        signalStr = -100;
        storageUsed = Math.min(100, parseFloat((storageUsed + 1.2).toFixed(1)));
        if ((tick - 30) % 6 === 0) imagesCap += 2;
        fault = "None";
        cpuTemp = parseFloat((45 + (tick - 30) * 0.55).toFixed(1));
        batTemp = parseFloat((24 + (tick - 30) * 0.12).toFixed(1));
      } else if (tick >= 60 && tick < 90) {
        mode = "Data Downlink";
        cameraStatus = "Inactive";
        task = "Transmitting Scientific Data to Ground Station";
        powerCons = 610;
        solarOutput = 810;
        batteryPct = Math.max(10, batteryPct - 0.25);
        commsStatus = "Connected";
        signalStr = Math.round(-85 + 35 * Math.sin(((tick - 60) / 30) * Math.PI));
        storageUsed = Math.max(0, parseFloat((storageUsed - 2.5).toFixed(1)));
        fault = "None";
        cpuTemp = Math.max(38, parseFloat((prev["CPU Temperature"] - 0.35).toFixed(1)));
        batTemp = Math.max(24, parseFloat((prev["Battery Temperature"] - 0.1).toFixed(1)));
      } else {
        mode = "Normal Operation";
        cameraStatus = "Inactive";
        task = "Optimal Solar Array Pointing & Battery Recharging";
        powerCons = 170;
        solarOutput = 1200;
        batteryPct = Math.min(100, batteryPct + 1.8);
        commsStatus = "Disconnected";
        signalStr = -100;
        fault = "None";
        cpuTemp = Math.max(36, parseFloat((prev["CPU Temperature"] - 0.8).toFixed(1)));
        batTemp = Math.min(28, parseFloat((prev["Battery Temperature"] + 0.25).toFixed(1)));
      }

      let health: 'Excellent' | 'Good' | 'Warning' | 'Critical' = "Excellent";
      if (fault !== "None") {
        health = "Critical";
      } else if (batteryPct < 20) {
        health = "Critical";
      } else if (batteryPct < 45) {
        health = "Warning";
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

    // Provide mock backend AI plan matching local state
    if (rawState["Active Fault"] !== 'None') {
      setBackendPlan({
        headline: 'Critical CPU Overheat / Core Anomaly',
        risk_level: 'critical',
        satellite_instruction: 'Immediately isolate payload sensors and disable non-vital subsystems.',
        operator_notes: [
          'De-energizing MS-VIS payload sensors.',
          'Rotating solar axles to survival low-angle profile.',
          'Setting CPU clock scheduler to idle prioritization.',
          'Broadcasting emergency beacon telemetry payload.',
        ],
        precautions: [
          'Isolate main lithium battery thermal loop.',
          'Standby for next line-of-sight ground station contact window.',
          'Do not initiate manual imaging scans during overtemp state.',
        ],
        expected_outcome: 'Core temperatures should stabilize within 150 seconds.',
        success_probability: 91.5,
        recovery_time: '02m 30s',
      });
    } else {
      setBackendPlan(null);
    }
  };

  // Inject Anomaly API dispatcher
  const injectAnomaly = async (faultType: string) => {
    addLog('SYSTEM', `Dispatching Telecommand Packet: INJECT_FAULT_SIGNAL (${faultType})`);
    
    // Map human selections to exact API keys supported by the Render backend
    let code = 'multi_fault';
    if (faultType === 'Battery Failure') code = 'battery_critical';
    else if (faultType === 'Solar Panel Failure') code = 'solar_failure';
    else if (faultType === 'Camera Failure') code = 'sensor_glitch';
    else if (faultType === 'Communication Failure') code = 'comm_loss';
    else if (faultType === 'Thermal Failure') code = 'cpu_overheat';
    else if (faultType === 'Storage Failure') code = 'storage_full';
    else if (faultType === 'CPU Overload') code = 'cpu_overheat';
    else if (faultType === 'Power Failure') code = 'battery_critical';

    try {
      const res = await fetch(`${apiBaseUrl}/telemetry/fault-injection`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fault_type: code }),
      });

      if (res.ok) {
        addLog('CRITICAL', `Fault injected successfully on StellX backend: "${code}"`);
        const data = await res.json();
        if (data.telemetry) setRawState(data.telemetry);
        if (data.plan) setBackendPlan(data.plan);
        if (data.telemetry && data.plan && data.telemetry["Active Fault"] !== 'None') {
          logAnomalyToDb(data.plan, data.telemetry["Active Fault"]);
        }
      } else {
        injectLocalAnomalyFallback(faultType);
      }
    } catch (err) {
      injectLocalAnomalyFallback(faultType);
    }
  };

  const injectLocalAnomalyFallback = (faultType: string) => {
    setRawState((prev) => ({
      ...prev,
      "Active Fault": `${faultType} Signal Injected`,
      "Overall Satellite Health": "Critical",
      "CPU Temperature": faultType.includes('Thermal') || faultType.includes('CPU') ? 85.5 : prev["CPU Temperature"],
      "Battery Percentage": faultType.includes('Battery') || faultType.includes('Power') ? 12 : prev["Battery Percentage"],
      "Communication Status": faultType.includes('Communication') ? 'Disconnected' : prev["Communication Status"],
      "Signal Strength": faultType.includes('Communication') ? -100 : prev["Signal Strength"],
      "Storage Used": faultType.includes('Storage') ? 98.4 : prev["Storage Used"],
    }));
    
    // Fallback AI precautions and procedure checklist in case the API is offline
    if (faultType.includes('Battery') || faultType.includes('Power')) {
      const plan = {
        headline: 'Emergency Action: battery_critical',
        risk_level: 'critical',
        satellite_instruction: 'Isolate compromised lithium-ion battery cells and limit bus current draw.',
        operator_notes: [
          'Stop Payload',
          'Disable Camera',
          'Reduce Power',
          'Enter Safe Mode',
          'Queue Commands',
          'Wait Ground Station',
          'Operator Approval'
        ],
        precautions: [
          'Isolate primary battery thermal runaway corridor.',
          'Limit thruster firings to prevent power bus current spikes.',
          'Inhibit high-draw payload sensors and optical gimbals.'
        ],
        expected_outcome: 'Bus voltage stabilized, thermal cell breakdown averted.',
        success_probability: 92.5,
        recovery_time: '01m 45s'
      };
      setBackendPlan(plan);
      logAnomalyToDb(plan, faultType);
    } else if (faultType.includes('Thermal') || faultType.includes('CPU')) {
      const plan = {
        headline: 'Emergency Action: cpu_overheat',
        risk_level: 'critical',
        satellite_instruction: 'Initiate CPU clock cycle throttling and align radiator plates.',
        operator_notes: [
          'Reduce CPU Load',
          'Stop Payload',
          'Monitor Battery',
          'Rotate Solar Panels'
        ],
        precautions: [
          'Shut down secondary high-frequency telemetry transmitters.',
          'Dampen payload imaging tasks to zero cycle states.',
          'Monitor CPU core junction decay rate closely.'
        ],
        expected_outcome: 'Junction temperature returns to safe operating threshold.',
        success_probability: 95.8,
        recovery_time: '03m 10s'
      };
      setBackendPlan(plan);
      logAnomalyToDb(plan, faultType);
    } else if (faultType.includes('Solar')) {
      const plan = {
        headline: 'Emergency Action: solar_failure',
        risk_level: 'critical',
        satellite_instruction: 'Reorient solar array panels to maximize sun tracking angle of incidence.',
        operator_notes: [
          'Rotate Solar Panels',
          'Monitor Battery',
          'Prepare Safe Mode'
        ],
        precautions: [
          'Shed non-essential thermal heating loops.',
          'Limit transmitter beacon gain levels to save power.',
          'Retract camera lens sunshield to minimize cross-sectional drag.'
        ],
        expected_outcome: 'Array output returns above threshold levels.',
        success_probability: 98.2,
        recovery_time: '04m 15s'
      };
      setBackendPlan(plan);
      logAnomalyToDb(plan, faultType);
    } else if (faultType.includes('Camera')) {
      const plan = {
        headline: 'Emergency Action: sensor_glitch',
        risk_level: 'critical',
        satellite_instruction: 'Disable camera optics power grid and queue optical sensor recalibration.',
        operator_notes: [
          'Stop Payload',
          'Disable Camera',
          'Wait Ground Station'
        ],
        precautions: [
          'Suspend scheduling of current orbital imagery scans.',
          'Force mechanical lens shutter doors to locked-shut mode.',
          'Initiate optical memory block diagnostic purge.'
        ],
        expected_outcome: 'Image sensor re-initializes cleanly on reboot.',
        success_probability: 97.4,
        recovery_time: '01m 15s'
      };
      setBackendPlan(plan);
      logAnomalyToDb(plan, faultType);
    } else if (faultType.includes('Communication')) {
      const plan = {
        headline: 'Emergency Action: comm_loss',
        risk_level: 'critical',
        satellite_instruction: 'Execute telemetry transmitter reboot and cycle secondary S-band transceiver.',
        operator_notes: [
          'Stop Payload',
          'Wait Ground Station',
          'Operator Approval'
        ],
        precautions: [
          'Point main parabolic antenna dish to Svalbard pass coordinates.',
          'Inhibit high-bandwidth data transmission corridors.',
          'Broadcast emergency telemetry pings on omnidirectional sub-carrier.'
        ],
        expected_outcome: 'Link locked, telemetry downlink restored.',
        success_probability: 90.5,
        recovery_time: '05m 00s'
      };
      setBackendPlan(plan);
      logAnomalyToDb(plan, faultType);
    } else if (faultType.includes('Storage')) {
      const plan = {
        headline: 'Emergency Action: storage_full',
        risk_level: 'critical',
        satellite_instruction: 'Flush transient data telemetry logs and enable deep storage compression.',
        operator_notes: [
          'Store Images',
          'Wait Ground Station',
          'Operator Approval'
        ],
        precautions: [
          'Inhibit further science camera capture executions.',
          'Prioritize downlink of completed observation telemetry files.',
          'Initiate solid-state storage sector mapping scans.'
        ],
        expected_outcome: 'SSR storage footprint compressed and cleared.',
        success_probability: 99.1,
        recovery_time: '02m 00s'
      };
      setBackendPlan(plan);
      logAnomalyToDb(plan, faultType);
    } else {
      const plan = {
        headline: 'Emergency Action: multi_fault',
        risk_level: 'critical',
        satellite_instruction: 'Perform whole satellite cold-reboot cycle and wait contact.',
        operator_notes: [
          'Reduce Power',
          'Enter Safe Mode',
          'Wait Ground Station'
        ],
        precautions: [
          'Limit all power draws to vital heartbeat telemetry.',
          'Point arrays to target sunlight coordinates.',
          'Observe battery voltage rates.'
        ],
        expected_outcome: 'Spacecraft enters survival safe state successfully.',
        success_probability: 88.4,
        recovery_time: '06m 00s'
      };
      setBackendPlan(plan);
      logAnomalyToDb(plan, faultType);
    }
    
    setFaultsDetectedCount((prev) => prev + 1);
    addLog('CRITICAL', `Local Simulator Fault Injected: "${faultType}"`);
    addTimelineEvent('CRITICAL', 'Core', `System Fault Flagged: ${faultType}`);
  };

  // Telemetry Poller interval mapping
  useEffect(() => {
    if (!isSimulationActive) return;

    // Fetch initial packet immediately
    fetchTelemetry();

    const interval = setInterval(() => {
      setMissionSeconds((prev) => prev + 1);
      if (prevFaultRef.current === 'None') {
        fetchTelemetry();
      }
    }, 3000); // 3-second sweep intervals matching backend constraints

    return () => clearInterval(interval);
  }, [isSimulationActive]);

  // Keep rolling history updated (max 30 elements)
  useEffect(() => {
    setHistory((prev) => {
      const nextHistory = [...prev, state];
      if (nextHistory.length > 30) {
        nextHistory.shift();
      }
      return nextHistory;
    });
  }, [rawState.timestamp]);

  // Handle timeline & logging on state changes
  useEffect(() => {
    if (state.communicationStatus !== prevCommsStatusRef.current) {
      if (state.communicationStatus === 'Connected') {
        addLog('SUCCESS', `Downlink completed. RF Contact established (Gain: ${state.signalStrength} dBm)`);
        addTimelineEvent('SUCCESS', 'Comms', 'Ground Station Link Locked');
        setSessionsCount((prev) => prev + 1);
      } else {
        addLog('WARNING', 'Telemetry downlink signal loss. Transited contact corridor.');
        addTimelineEvent('WARNING', 'Comms', 'Ground Station Contact Severed');
      }
      prevCommsStatusRef.current = state.communicationStatus;
    }

    if (state.activeFault !== prevFaultRef.current) {
      if (state.activeFault !== 'None') {
        addLog('CRITICAL', `Anomaly anomaly event logged: "${state.activeFault}"`);
        addTimelineEvent('CRITICAL', 'Anomaly', `Fault: ${state.activeFault}`);
      }
      prevFaultRef.current = state.activeFault;
    }
  }, [state.communicationStatus, state.activeFault]);

  const approveRecovery = () => {
    if (state.activeFault === 'None') return;

    addLog('SYSTEM', 'Operator Approved Safe Mode command sequence upload.');
    addLog('INFO', 'Executing anomaly mitigation protocol checklist...');

    setTimeout(() => {
      setRawState((prev) => ({
        ...prev,
        "Active Fault": "None",
        "Overall Satellite Health": "Excellent",
        "CPU Temperature": 40.0,
        "Battery Percentage": Math.max(prev["Battery Percentage"], 60),
        "Communication Status": "Connected",
        "Signal Strength": -54,
      }));
      setBackendPlan(null);
      setProceduresExecutedCount((prev) => prev + 1);
      addLog('SUCCESS', 'Telemetry stabilized. Core subsystems returned to nominal status.');
      addTimelineEvent('SUCCESS', 'Recovery', 'Mission Recovered - All subsystems nominal');
    }, 2500);
  };

  const resetSimulation = () => {
    setRawState(INITIAL_RAW_STATE);
    setBackendPlan(null);
    setHistory([]);
    setLogs([]);
    setTimeline([]);
    setPacketsReceived(0);
    setSessionsCount(1);
    setFaultsDetectedCount(0);
    setProceduresExecutedCount(0);
    setMissionSeconds(9950);
    localTickRef.current = 0;
    
    addLog('SYSTEM', 'Simulation dashboard variables reset completed.');
    addTimelineEvent('SYSTEM', 'Core', 'Spacecraft System Reset Dispatched');
  };

  const saveMission = (config: {
    satelliteName: string;
    missionName: string;
    orbitType: string;
    missionGoal: string;
    payloadType: string;
    launchDate: string;
    groundStation: string;
    initialBattery: number;
    initialStorage: number;
    missionMode: string;
  }) => {
    setSatelliteName(config.satelliteName);
    setMissionName(config.missionName);
    setOrbitType(config.orbitType);
    setMissionGoal(config.missionGoal);
    setPayloadType(config.payloadType);
    setLaunchDate(config.launchDate);
    setActiveGroundStation(config.groundStation);
    
    setRawState((prev) => ({
      ...prev,
      "Battery Percentage": config.initialBattery,
      "Storage Used": config.initialStorage,
      "Mission Mode": config.missionMode,
      "Current Task": `Executing goal: ${config.missionGoal}`,
    }));

    addLog('SYSTEM', `Mission Saved: "${config.missionName}" configured for spacecraft ${config.satelliteName}.`);
    addTimelineEvent('SYSTEM', 'Config', `Active Mission Configured: ${config.missionName}`);
  };

  const updateState = (updates: Partial<SatelliteState>) => {
    setRawState((prev) => {
      const nextRaw = { ...prev };
      if (updates.batteryPercentage !== undefined) nextRaw["Battery Percentage"] = updates.batteryPercentage;
      if (updates.solarPanelOutput !== undefined) nextRaw["Solar Panel Output"] = updates.solarPanelOutput;
      if (updates.powerConsumption !== undefined) nextRaw["Power Consumption"] = updates.powerConsumption;
      if (updates.batteryTemperature !== undefined) nextRaw["Battery Temperature"] = updates.batteryTemperature;
      if (updates.cpuTemperature !== undefined) nextRaw["CPU Temperature"] = updates.cpuTemperature;
      if (updates.signalStrength !== undefined) nextRaw["Signal Strength"] = updates.signalStrength;
      if (updates.storageUsed !== undefined) nextRaw["Storage Used"] = updates.storageUsed;
      if (updates.imagesCaptured !== undefined) nextRaw["Images Captured"] = updates.imagesCaptured;
      return nextRaw;
    });
  };

  return {
    state,
    rawState,
    backendPlan,
    history,
    logs,
    timeline,
    isSimulationActive,
    setIsSimulationActive,
    updateState,
    approveRecovery,
    resetSimulation,
    injectAnomaly,
    saveMission,
    configuration: {
      missionName,
      satelliteName,
      orbitType,
      missionGoal,
      payloadType,
      launchDate,
      activeGroundStation,
    },
    statistics: {
      missionDuration: new Date(missionSeconds * 1000).toISOString().substr(11, 8),
      packetsReceived,
      sessionsCount,
      faultsDetectedCount,
      proceduresExecutedCount,
      recoverySuccessRate: faultsDetectedCount > 0 
        ? Math.round((proceduresExecutedCount / faultsDetectedCount) * 100) 
        : 100,
    }
  };
};
