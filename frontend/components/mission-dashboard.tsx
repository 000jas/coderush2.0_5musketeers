'use client';

import React, { useState, useEffect } from 'react';
import {
  Activity,
  AlertTriangle,
  ArrowUpRight,
  ChevronRight,
  Clock3,
  Cpu,
  Database,
  Gauge,
  Play,
  Pause,
  RefreshCw,
  SlidersHorizontal,
  Terminal,
  Wifi,
  Zap,
  Camera,
  FolderHeart,
  BarChart3,
  Info,
  Calendar,
  Layers,
  Radio,
  FileText,
  Settings2,
  Tv,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { useDashboardState } from '../hooks/useDashboardState';
import { TelemetryChart } from './TelemetryChart';
import { ProceduresSection } from './procedures-section';
import { TimelinePlannerSection } from './timeline-planner-section';
import { supabase } from '../lib/supabase';

export function MissionDashboard() {
  const {
    state,
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
    configuration,
    statistics,
  } = useDashboardState();

  const [selectedFault, setSelectedFault] = useState<string>('Battery Failure');
  const [selectedSubsystem, setSelectedSubsystem] = useState<string | null>(null);
  const [anomalyLogs, setAnomalyLogs] = useState<any[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const capturedImages = [
    '/images/earth_capture_1_1786162005451.png',
    '/images/earth_capture_2_1786162020003.png',
    '/images/earth_capture_3_1786162036719.png'
  ];

  useEffect(() => {
    if (isSimulationActive) {
      const interval = setInterval(() => {
        setCurrentImageIndex((prev) => (prev + 1) % capturedImages.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [isSimulationActive, capturedImages.length]);

  useEffect(() => {
    const fetchLogs = async () => {
      const { data, error } = await supabase.from('anomalies').select('*').order('created_at', { ascending: false });
      if (!error && data) {
        setAnomalyLogs(data);
      }
    };
    fetchLogs();
    
    // Optional: Set up realtime subscription
    const subscription = supabase.channel('anomalies_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'anomalies' }, payload => {
        fetchLogs();
      })
      .subscribe();
      
    return () => { supabase.removeChannel(subscription); }
  }, []);

  const handleApproveAnomaly = async (id: number) => {
    await supabase.from('anomalies').delete().eq('id', id);
  };

  const handleRejectAnomaly = async (id: number) => {
    await supabase.from('anomalies').delete().eq('id', id);
  };

  // Dynamic pass times and downlink percentages
  const [downlinkProgress, setDownlinkProgress] = useState(0);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  const isConnected = state.communicationStatus === 'Connected';
  const isDownlinking = state.missionMode === 'Data Downlink' && isConnected;
  const isObserving = state.cameraStatus === 'Active';
  const isFaulted = state.activeFault !== 'None';

  // Signal Strength Normalizer
  const signalPercent = isConnected
    ? Math.max(0, Math.min(100, Math.round(((state.signalStrength + 100) / 70) * 100)))
    : 0;

  // Animate downlink progress during active passes
  useEffect(() => {
    if (!isSimulationActive) return;
    const interval = setInterval(() => {
      if (isDownlinking) {
        setDownlinkProgress((prev) => (prev >= 100 ? 0 : prev + 12));
      } else {
        setDownlinkProgress(0);
      }
      // Upload progress heartbeat
      if (isConnected) {
        setUploadProgress((prev) => (prev >= 100 ? 0 : prev + 8));
      } else {
        setUploadProgress(0);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [isSimulationActive, isDownlinking, isConnected]);

  // Determine Subsystem Health Matrix states
  const getSubsystemStatus = (sub: string): 'Healthy' | 'Warning' | 'Critical' => {
    const fault = state.activeFault.toLowerCase();
    if (sub === 'Power' || sub === 'Battery') {
      if (fault.includes('battery') || state.batteryPercentage < 20 || fault.includes('power')) return 'Critical';
      if (state.batteryPercentage < 40 || fault.includes('solar')) return 'Warning';
    }
    if (sub === 'Thermal' || sub === 'CPU') {
      if (fault.includes('overtemp') || state.cpuTemperature > 75 || fault.includes('thermal') || fault.includes('overload')) return 'Critical';
      if (state.cpuTemperature > 60) return 'Warning';
    }
    if (sub === 'Communication') {
      if (state.communicationStatus === 'Disconnected') return 'Warning';
      if (fault.includes('antenna') || fault.includes('comm')) return 'Critical';
    }
    if (sub === 'Payload' || sub === 'Camera') {
      if (fault.includes('camera') || fault.includes('sensor')) return 'Critical';
    }
    if (sub === 'Storage') {
      if (state.storageUsed > 90 || fault.includes('storage')) return 'Critical';
      if (state.storageUsed > 75) return 'Warning';
    }
    return 'Healthy';
  };

  const getSubsystemBadge = (status: 'Healthy' | 'Warning' | 'Critical') => {
    if (status === 'Critical') return 'bg-red-50 text-red-700 border-red-200';
    if (status === 'Warning') return 'bg-amber-50 text-amber-700 border-amber-200';
    return 'bg-emerald-50 text-emerald-700 border-emerald-200';
  };

  const getSubsystemDot = (status: 'Healthy' | 'Warning' | 'Critical') => {
    if (status === 'Critical') return 'bg-red-500';
    if (status === 'Warning') return 'bg-amber-500';
    return 'bg-emerald-500';
  };

  const triggerFaultInjection = () => {
    injectAnomaly(selectedFault);
  };

  return (
    <div className="flex flex-col w-full min-h-screen bg-slate-50 text-slate-800 relative select-none">
      
      {/* 1. MISSION HEADER */}
      <header id="dashboard" className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-6 shadow-sm select-none">
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center size-9 rounded-xl bg-sky-500/10 text-sky-600 border border-sky-500/20">
            <Activity className="size-4.5" />
            <span className="absolute -top-0.5 -right-0.5 size-2 rounded-full bg-sky-500 animate-ping" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-widest text-sky-600">StellX Mission Control</span>
              <Badge variant="outline" className={`h-4.5 text-[8.5px] px-1.5 uppercase font-mono tracking-wider ${getSubsystemBadge(getSubsystemStatus('Power'))}`}>
                SATELLITE: {configuration.satelliteName}
              </Badge>
            </div>
            <h1 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Mission Operations Control</h1>
          </div>
        </div>

        {/* Live Status and Mode Details */}
        <div className="hidden lg:flex items-center gap-6 text-xs select-none">
          <div className="flex flex-col items-end">
            <span className="text-[10px] text-slate-400 uppercase font-semibold">MET (Elapsed Time)</span>
            <span className="font-mono text-slate-700 font-semibold">{statistics.missionDuration}</span>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-[10px] text-slate-400 uppercase font-semibold">Mission Health</span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className={`size-2 rounded-full ${
                state.overallSatelliteHealth === 'Critical' ? 'bg-red-500 animate-pulse' :
                state.overallSatelliteHealth === 'Warning' ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'
              }`} />
              <span className="font-bold text-slate-700 uppercase tracking-wider">{state.overallSatelliteHealth}</span>
            </div>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-[10px] text-slate-400 uppercase font-semibold">Orbit Number</span>
            <span className="font-mono text-slate-700 font-semibold">ORB-#{state.orbitNumber}</span>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-[10px] text-slate-400 uppercase font-semibold">Communication Window</span>
            <span className={`font-semibold ${isConnected ? 'text-emerald-600' : 'text-slate-400'}`}>
              {isConnected ? `LOCKED (${state.signalStrength} dBm)` : 'LOSS OF SIGNAL'}
            </span>
          </div>
        </div>

        {/* Simple Simulation Top Bar Indicators */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 border border-slate-200 bg-slate-100 px-3 py-1.5 rounded-lg select-none">
            <span className={`size-2 rounded-full ${isSimulationActive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
            <span className="text-[10px] font-mono font-bold tracking-widest text-slate-500">
              {isSimulationActive ? 'SIM ACTIVE' : 'SIM PAUSED'}
            </span>
          </div>
        </div>
      </header>

      {/* Main Workspace Layout Grid */}
      <main className="flex flex-col gap-6 p-6 w-full flex-1 max-w-[1720px] mx-auto select-none">
        
        {/* ==================== TOP ROW: CONTROLS & ANOMALY HUD ==================== */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
          
          {/* SIMULATION CONTROL CONSOLE */}
          <Card id="simulation" className="border-slate-200 bg-white rounded-2xl shadow-sm flex flex-col">
            <div className="px-4 py-3 border-b border-border/75 flex items-center gap-2">
              <Play className="size-4 text-emerald-500" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Simulation Control Console</span>
            </div>
            <CardContent className="p-4 flex flex-col sm:flex-row gap-4 items-center">
              
              <div className="flex flex-col gap-2 w-full sm:w-1/2">
                {/* Primary Run / Pause button */}
                <Button
                  onClick={() => setIsSimulationActive(!isSimulationActive)}
                  className={`w-full h-10 rounded-xl text-xs font-bold transition-all duration-200 ${
                    isSimulationActive
                      ? 'bg-amber-500 hover:bg-amber-600 text-white'
                      : 'bg-emerald-500 hover:bg-emerald-600 text-white'
                  }`}
                >
                  {isSimulationActive ? <Pause className="size-4 mr-1.5" /> : <Play className="size-4 mr-1.5" />}
                  {isSimulationActive ? 'Pause Simulation' : 'Run Simulation'}
                </Button>

                <Button
                  onClick={resetSimulation}
                  variant="outline"
                  className="w-full h-9 rounded-xl text-xs font-semibold border-slate-200 text-slate-600 bg-white hover:bg-slate-50"
                >
                  <RefreshCw className="size-3.5 mr-1.5" />
                  Reset System State
                </Button>
              </div>

              <div className="hidden sm:block h-16 w-px bg-slate-200" />

              {/* Anomaly Injector Controls */}
              <div className="flex flex-col gap-2 w-full sm:w-1/2">
                <span className="text-[10px] uppercase font-bold text-slate-400">Inject Telemetry Anomaly</span>
                <div className="flex gap-2">
                  <select
                    value={selectedFault}
                    onChange={(e) => setSelectedFault(e.target.value)}
                    className="h-9 px-3 bg-white border border-slate-200 rounded-xl text-xs flex-1 focus:outline-none focus:ring-1 focus:ring-sky-500"
                  >
                    <option value="Battery Failure">Battery Failure</option>
                    <option value="Solar Panel Failure">Solar Panel Failure</option>
                    <option value="Camera Failure">Camera Failure</option>
                    <option value="Communication Failure">Communication Failure</option>
                    <option value="Thermal Failure">Thermal Failure</option>
                    <option value="Storage Failure">Storage Failure</option>
                    <option value="CPU Overload">CPU Overload</option>
                    <option value="Power Failure">Power Failure</option>
                  </select>

                  <Button
                    onClick={triggerFaultInjection}
                    className="h-9 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl text-xs px-4"
                  >
                    Inject
                  </Button>
                </div>
              </div>

            </CardContent>
          </Card>

          {/* AI ANOMALY DETECTION PANEL */}
          {(() => {
            let panelStyle = 'border-emerald-200 bg-emerald-50/30';
            let dotStyle = 'bg-emerald-500';
            let titleColor = 'text-emerald-700';
            let msg = 'Nominal Operation';
            let cause = 'No anomaly detected';

            if (state.overallSatelliteHealth === 'Critical') {
              panelStyle = 'border-red-200 bg-red-50/30';
              dotStyle = 'bg-red-500 animate-pulse';
              titleColor = 'text-red-700';
              msg = 'Critical Anomaly';
              cause = state.activeFault;
            } else if (state.overallSatelliteHealth === 'Warning') {
              panelStyle = 'border-amber-200 bg-amber-50/30';
              dotStyle = 'bg-amber-500 animate-pulse';
              titleColor = 'text-amber-700';
              msg = 'Potential Anomaly Detected';
              cause = state.activeFault !== 'None' ? state.activeFault : 'System parameters trending out of nominal index.';
            }

            return (
              <Card className={`border ${panelStyle} transition-all duration-300 flex flex-col rounded-2xl shadow-sm h-full`}>
                <div className="px-4 py-3 border-b border-black/5 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className={`size-2 rounded-full ${dotStyle}`} />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">AI Anomaly Detection</span>
                  </div>
                  <span className="font-mono text-[9px] text-slate-400">CONFIDENCE: {
                    state.overallSatelliteHealth === 'Critical' ? '94.2%' :
                    state.overallSatelliteHealth === 'Warning' ? '86.7%' : '99.4%'
                  }</span>
                </div>
                <CardContent className="p-4 flex flex-col gap-2 justify-center flex-1">
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex flex-col">
                      <span className="text-[9px] uppercase font-bold text-slate-400">Classification</span>
                      <span className={`text-sm font-bold leading-normal mt-0.5 ${titleColor}`}>{msg}</span>
                    </div>
                    {state.overallSatelliteHealth !== 'Excellent' && (
                      <div className="flex flex-col items-end">
                        <span className="text-[9px] uppercase font-bold text-slate-400">Subsystem</span>
                        <span className="text-xs font-bold text-slate-700 uppercase mt-0.5">
                          {state.activeFault.split(' ')[0]}
                        </span>
                      </div>
                    )}
                  </div>

                  {state.overallSatelliteHealth === 'Critical' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-1">
                      <div className="flex flex-col">
                        <span className="text-[9px] uppercase font-bold text-slate-400">Detected Fault</span>
                        <p className="text-[11px] font-semibold text-red-600 mt-0.5">{cause}</p>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[9px] uppercase font-bold text-slate-400">Emergency Precautions (Backend)</span>
                        <div className="flex flex-col gap-1 mt-0.5">
                          {backendPlan?.precautions?.slice(0, 2).map((prec, i) => (
                            <span key={i} className="text-[10px] text-slate-600 font-semibold truncate">⚠️ {prec}</span>
                          )) || <span className="text-[10px] text-slate-500">Isolate secondary instruments.</span>}
                        </div>
                      </div>
                    </div>
                  ) : state.overallSatelliteHealth === 'Warning' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-1">
                      <div className="flex flex-col">
                        <span className="text-[9px] uppercase font-bold text-slate-400">Likely Cause</span>
                        <p className="text-[11px] font-semibold text-amber-700 mt-0.5">{cause}</p>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[9px] uppercase font-bold text-slate-400">Preventive Precautions (Backend)</span>
                        <div className="flex flex-col gap-1 mt-0.5">
                          {backendPlan?.precautions?.slice(0, 2).map((prec, i) => (
                            <span key={i} className="text-[10px] text-slate-600 font-semibold truncate">• {prec}</span>
                          )) || <span className="text-[10px] text-slate-500">Monitor thermal margins.</span>}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-1">
                      <div className="flex flex-col">
                        <span className="text-[9px] uppercase font-bold text-slate-400">Current Task</span>
                        <p className="text-[11px] font-semibold text-emerald-700 mt-0.5">{state.currentTask || 'Executing routine orbital scanning.'}</p>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[9px] uppercase font-bold text-slate-400">AI Recommendations (Nominal)</span>
                        <div className="flex flex-col gap-1 mt-0.5">
                          <span className="text-[10px] text-slate-600 font-semibold truncate">✓ Maintain current solar array tracking.</span>
                          <span className="text-[10px] text-slate-600 font-semibold truncate">✓ Continue standard telemetry downlink.</span>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })()}

        </div>

        {/* ==================== MAIN SECTION: TWO-COLUMN TELEMETRY VIEW ==================== */}
        <div id="telemetry-monitor" className="grid gap-6 xl:grid-cols-12 lg:grid-cols-12 md:grid-cols-1">
          
          {/* LEFT COLUMN: LIVE TELEMETRY PARAMETERS */}
          <div className="xl:col-span-4 lg:col-span-5 md:col-span-12">
            <Card className="border-border/70 bg-white rounded-2xl shadow-sm flex flex-col h-full">
              <div className="px-4 py-3 border-b border-border/75 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Gauge className="size-4 text-sky-500" />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Live Telemetry Board</span>
                </div>
                <Badge variant="secondary" className="font-mono text-[9px] bg-slate-100 text-slate-500 border-none">SYS_BOARD</Badge>
              </div>
              <CardContent className="p-4 flex flex-col gap-2">
                {[
                  { label: 'Battery Percentage', value: `${state.batteryPercentage}%`, status: getSubsystemStatus('Battery'), trend: '+0.35%', icon: Zap },
                  { label: 'Solar Panel Output', value: `${state.solarPanelOutput} W`, status: 'Normal', trend: '+12W', icon: Zap },
                  { label: 'Power Consumption', value: `${state.powerConsumption} W`, status: 'Normal', trend: '-5W', icon: Zap },
                  { label: 'CPU Temperature', value: `${state.cpuTemperature} °C`, status: getSubsystemStatus('CPU'), trend: '+0.2°C', icon: Cpu },
                  { label: 'Battery Temperature', value: `${state.batteryTemperature} °C`, status: getSubsystemStatus('Battery'), trend: '+0.1°C', icon: Cpu },
                  { label: 'Signal Strength', value: isConnected ? `${state.signalStrength} dBm` : 'OFFLINE', status: getSubsystemStatus('Communication'), trend: isConnected ? 'Locked' : 'Loss', icon: Wifi },
                  { label: 'Storage Used', value: `${state.storageUsed}%`, status: getSubsystemStatus('Storage'), trend: '+1.2%', icon: Database },
                  { label: 'Camera Status', value: state.cameraStatus, status: getSubsystemStatus('Camera'), trend: state.cameraStatus === 'Active' ? 'Imaging' : 'Idle', icon: Camera },
                  { label: 'Images Captured', value: state.imagesCaptured, status: 'Normal', trend: '+2', icon: Camera },
                  { label: 'Orbit Number', value: `ORB-${state.orbitNumber}`, status: 'Normal', trend: '+1', icon: Radio },
                  { label: 'Mission Mode', value: state.missionMode, status: 'Normal', trend: 'Sync', icon: Radio },
                  { label: 'Active Fault', value: state.activeFault, status: isFaulted ? 'Critical' : 'Normal', trend: isFaulted ? 'Alert' : 'None', icon: AlertTriangle },
                  { label: 'Overall Health', value: state.overallSatelliteHealth, status: state.overallSatelliteHealth === 'Critical' ? 'Critical' : state.overallSatelliteHealth === 'Warning' ? 'Warning' : 'Normal', trend: 'Status', icon: FolderHeart },
                ].map((param, index) => {
                  let badgeStyle = 'bg-slate-100 text-slate-600';
                  if (param.status === 'Critical') badgeStyle = 'bg-red-50 text-red-700 border border-red-100';
                  else if (param.status === 'Warning') badgeStyle = 'bg-amber-50 text-amber-700 border border-amber-100';
                  else if (param.status === 'Normal' || param.status === 'Healthy') badgeStyle = 'bg-emerald-50 text-emerald-700 border border-emerald-100';

                  const Icon = param.icon;

                  return (
                    <div key={index} className="flex items-center justify-between p-2 hover:bg-slate-50 border border-slate-100 rounded-xl transition-all duration-150">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="p-1.5 bg-slate-50 border border-slate-200/60 text-slate-500 rounded-lg shrink-0">
                          <Icon className="size-3.5" />
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="text-[10px] font-bold text-slate-700 truncate">{param.label}</span>
                          <span className="text-[8px] text-slate-400 font-mono">{param.trend}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-xs font-extrabold font-mono text-slate-800">{param.value}</span>
                        <Badge className={`text-[8px] px-1.5 py-0.5 rounded uppercase font-mono ${badgeStyle} shadow-none`}>
                          {param.status}
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </div>

          {/* RIGHT COLUMN: TELEMETRY TREND CHARTS */}
          <div className="xl:col-span-8 lg:col-span-7 md:col-span-12 grid gap-6 grid-cols-1 md:grid-cols-2">
            <TelemetryChart
              title="Power Analytics"
              data={history}
              metrics={[
                { key: 'batteryPercentage', label: 'Battery %', color: '#0ea5e9' },
                { key: 'solarPanelOutput', label: 'Solar Output (W)', color: '#10b981' },
              ]}
              minY={0}
              maxY={1300}
              unit="W/%"
            />

            <TelemetryChart
              title="Thermal Analytics"
              data={history}
              metrics={[
                { key: 'cpuTemperature', label: 'CPU Temp (°C)', color: '#f59e0b' },
                { key: 'batteryTemperature', color: '#ef4444', label: 'Battery Temp (°C)' },
              ]}
              minY={10}
              maxY={90}
              unit="°C"
            />

            <TelemetryChart
              title="Communication Analytics"
              data={history}
              metrics={[
                { key: 'signalStrength', label: 'Signal Strength (dBm)', color: '#0ea5e9' },
              ]}
              minY={-110}
              maxY={-20}
              unit="dBm"
            />

            <TelemetryChart
              title="Storage & Payload Analytics"
              data={history}
              metrics={[
                { key: 'storageUsed', label: 'Storage Used %', color: '#8b5cf6' },
                { key: 'imagesCaptured', label: 'Captured Images', color: '#10b981' },
              ]}
              minY={0}
              maxY={1600}
              unit="%/IMG"
            />
          </div>

        </div>

        {/* ==================== LIVE SATELLITE FEED (ONLY WHEN SIMULATION IS ACTIVE) ==================== */}
        {isSimulationActive && (
          <div className="w-full mt-2">
            <Card className="border-emerald-200 bg-white rounded-2xl shadow-sm flex flex-col">
              <div className="px-4 py-3 border-b border-border/75 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Camera className="size-4 text-emerald-500" />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Live Satellite Feed</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                  <Badge variant="secondary" className="font-mono text-[9px] bg-emerald-50 text-emerald-600 border-emerald-200 shadow-none">CAPTURING</Badge>
                </div>
              </div>
              <CardContent className="p-6 flex flex-col sm:flex-row gap-6 items-center bg-slate-50/50">
                <div className="w-full sm:w-1/3 flex flex-col gap-3">
                  <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wide">Recent Earth Capture</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    This image was captured by the satellite's primary MS-VIS-IR Optical Sensor during its recent pass over the Earth's terminator line.
                  </p>
                  <div className="text-[10px] font-mono text-slate-400 mt-2 flex flex-col gap-1">
                    <span>Timestamp: <span className="font-semibold text-slate-600">{new Date().toLocaleTimeString()}</span></span>
                    <span>Resolution: <span className="font-semibold text-slate-600">8K High Definition</span></span>
                  </div>
                </div>
                <div className="w-full sm:w-2/3 h-72 rounded-xl overflow-hidden border border-slate-200 relative group shadow-sm bg-black">
                  <img src={capturedImages[currentImageIndex]} alt="Earth Capture" className="w-full h-full object-cover transition-opacity duration-1000 ease-in-out" />
                  <div className="absolute bottom-3 right-3 bg-black/60 text-white text-[9px] font-mono px-2 py-1 rounded backdrop-blur-sm border border-white/10">
                    IMG_MSVIS_{currentImageIndex + 1}.png
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* ==================== BOTTOM ROW: LOGS, matrix, timeline, procedures ==================== */}
        <div className="grid gap-6 xl:grid-cols-12 lg:grid-cols-12 md:grid-cols-1 border-t border-slate-200 pt-6">
          
          {/* AI PROCEDURE ENGINE */}
          <div className="xl:col-span-4 lg:col-span-4 md:col-span-12 flex flex-col gap-6">
            <Card className="border-border/70 bg-white rounded-2xl shadow-sm flex flex-col h-full">
              <div className="px-4 py-3 border-b border-slate-200 flex items-center gap-2">
                <FileText className="size-4 text-sky-500" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">AI Procedures Workflow</span>
              </div>
              <CardContent className="p-4 flex flex-col gap-4">
                {(() => {
                  let steps: string[] = [];
                  if (state.overallSatelliteHealth === 'Critical') {
                    steps = backendPlan?.operator_notes || ['Stop Payload', 'Disable Camera', 'Reduce Power', 'Enter Safe Mode'];
                  } else if (state.overallSatelliteHealth === 'Warning') {
                    steps = backendPlan?.operator_notes || ['Reduce CPU Load', 'Rotate Solar Panels', 'Monitor Battery'];
                  } else {
                    steps = ['Capture Images', 'Store Images', 'Wait Contact Corridor', 'Downlink Data'];
                  }

                  return (
                    <div className="flex flex-col gap-2.5">
                      {steps.map((step, idx) => (
                        <div key={idx} className="flex flex-col items-center">
                          <div className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-center text-[10px] font-semibold text-slate-600 flex items-center justify-center gap-2">
                            <span className="size-1.5 rounded-full bg-sky-500" />
                            {step}
                          </div>
                          {idx < steps.length - 1 && (
                            <span className="text-slate-400 font-bold my-1 text-xs">↓</span>
                          )}
                        </div>
                      ))}
                    </div>
                  );
                })()}

                {isFaulted && (
                  <Button
                    onClick={approveRecovery}
                    className="w-full h-8 bg-sky-500 hover:bg-sky-600 text-white font-bold rounded-xl text-xs mt-2"
                  >
                    Execute Recovery Action
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>

          {/* CHRONOLOGICAL TIMELINE */}
          <div className="xl:col-span-4 lg:col-span-4 md:col-span-12">
            <Card className="border-border/70 bg-white rounded-2xl shadow-sm flex flex-col h-full">
              <div className="px-4 py-3 border-b border-slate-200 flex items-center gap-2">
                <Clock3 className="size-4 text-sky-500" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Timeline Events</span>
              </div>
              <CardContent className="p-4 overflow-y-auto max-h-[280px] flex flex-col gap-3">
                {timeline.length === 0 ? (
                  <span className="text-xs text-slate-400 italic text-center py-10">Awaiting telemetry timeline updates...</span>
                ) : (
                  <div className="flex flex-col gap-0 border-l border-slate-100 pl-3">
                    {timeline.slice(0, 5).map((ev, i) => (
                      <div key={i} className="flex flex-col gap-0.5 pb-3.5 relative">
                        <span className={`absolute -left-[17px] top-1 size-1.5 rounded-full ${
                          ev.severity === 'CRITICAL' ? 'bg-red-500' :
                          ev.severity === 'WARNING' ? 'bg-amber-500' : 'bg-emerald-500'
                        }`} />
                        <div className="flex justify-between text-[8px] text-slate-400 font-mono">
                          <span>{ev.timestamp} — {ev.subsystem}</span>
                          <span className="font-bold">{ev.severity}</span>
                        </div>
                        <span className="text-[10.5px] font-bold text-slate-700">{ev.description}</span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* SUBSYSTEM HEALTH MATRIX */}
          <div className="xl:col-span-4 lg:col-span-4 md:col-span-12">
            <Card className="border-border/70 bg-white rounded-2xl shadow-sm flex flex-col h-full">
              <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FolderHeart className="size-4 text-sky-500" />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Health Grid</span>
                </div>
                <span className="text-[8px] font-mono text-slate-400 uppercase">SYS_HEALTH</span>
              </div>
              <CardContent className="p-3 flex flex-col justify-between h-full gap-3">
                <div className="grid grid-cols-4 gap-2">
                  {['Power', 'Thermal', 'Communication', 'Payload', 'Storage', 'Battery', 'Camera', 'CPU'].map((sub) => {
                    const status = getSubsystemStatus(sub);
                    return (
                      <button
                        key={sub}
                        onClick={() => setSelectedSubsystem(selectedSubsystem === sub ? null : sub)}
                        className={`p-1.5 border rounded-xl text-center cursor-pointer transition-all duration-200 flex flex-col items-center justify-center gap-1 ${
                          selectedSubsystem === sub
                            ? 'border-sky-500 bg-sky-50 text-sky-700'
                            : 'border-slate-100 bg-slate-50 hover:border-slate-350 text-slate-600'
                        }`}
                      >
                        <span className={`size-1.5 rounded-full ${getSubsystemDot(status)}`} />
                        <span className="text-[7.5px] uppercase font-bold text-slate-500">{sub.substr(0, 5)}</span>
                      </button>
                    );
                  })}
                </div>

                <div className="border border-slate-200 bg-slate-50/60 rounded-xl p-2 flex items-center justify-between text-[9px] text-slate-500 min-h-[50px]">
                  {selectedSubsystem ? (
                    <div className="flex flex-col gap-0.5 w-full">
                      <div className="flex justify-between font-bold text-slate-700">
                        <span className="uppercase text-[8px]">{selectedSubsystem} Diagnostics</span>
                        <span className="text-[8px] font-mono uppercase font-bold text-sky-600">{getSubsystemStatus(selectedSubsystem)}</span>
                      </div>
                      <span className="text-slate-400 truncate text-[8.5px] mt-0.5">
                        {selectedSubsystem === 'Power' || selectedSubsystem === 'Battery' ? `Volts: ${state.batteryVoltage}V | Out: ${state.solarPanelOutput}W` : ''}
                        {selectedSubsystem === 'Thermal' || selectedSubsystem === 'CPU' ? `CPU: ${state.cpuTemperature}°C | Bat: ${state.batteryTemperature}°C` : ''}
                        {selectedSubsystem === 'Communication' ? `RF Transmit: Locked | Gain: ${state.signalStrength}dBm` : ''}
                        {selectedSubsystem === 'Payload' || selectedSubsystem === 'Camera' ? `State: ${state.cameraStatus} | Images: ${state.imagesCaptured}` : ''}
                        {selectedSubsystem === 'Storage' ? `Storage: ${state.storageUsed}% of total SSR` : ''}
                      </span>
                    </div>
                  ) : (
                    <span className="italic text-slate-400 mx-auto text-[8.5px]">Click any health node to view diagnostics</span>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

        </div>

        {/* LIVE EVENT LOG TERMINAL CONSOLE */}
        <div className="w-full">
          <Card className="border-slate-800 bg-[#020617] rounded-2xl shadow-sm flex flex-col h-[180px] overflow-hidden">
            <div className="px-4 py-2 bg-slate-950 border-b border-slate-800/80 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Terminal className="size-4 text-sky-400" />
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-300">Mission Event Stream</span>
              </div>
              <div className="flex gap-2">
                <span className="size-2 rounded-full bg-slate-800" />
                <span className="size-2 rounded-full bg-slate-800" />
                <span className="size-2 rounded-full bg-slate-800" />
              </div>
            </div>
            <CardContent className="p-4 font-mono text-[10px] overflow-y-auto flex-1 flex flex-col-reverse gap-1 bg-[#020617] scrollbar-thin">
              {logs.length === 0 ? (
                <span className="text-slate-500 italic select-none">Consolidation system online. Awaiting telemetry data ticks...</span>
              ) : (
                logs.map((log, index) => {
                  let colorClass = 'text-sky-400';
                  if (log.type === 'CRITICAL') colorClass = 'text-red-400 font-bold animate-pulse';
                  if (log.type === 'WARNING') colorClass = 'text-amber-400';
                  if (log.type === 'SUCCESS') colorClass = 'text-emerald-400';
                  if (log.type === 'SYSTEM') colorClass = 'text-indigo-400';

                  return (
                    <div
                      key={index}
                      className={`flex items-start gap-2 transition-all duration-200 leading-normal ${
                        index === 0 ? 'opacity-100 font-semibold' : 'opacity-40 hover:opacity-85'
                      }`}
                    >
                      <span className="text-slate-600 shrink-0 select-none">[{log.timestamp}]</span>
                      <span className={`${colorClass} shrink-0 select-none`}>[{log.type.toUpperCase()}]</span>
                      <span className="text-slate-300 font-mono">{log.message}</span>
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>
        </div>

      </main>

      {/* ADDITIONAL ACCESSIBLE TIMELINE PLANNER SECTIONS */}
      <section id="mission-planner" className="mx-auto flex max-w-[1720px] flex-col gap-4 p-6 w-full border-t border-slate-200 mt-10">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-400 select-none">
          <Calendar className="size-3.5 text-indigo-500" aria-hidden="true" />
          <span>Mission Planner</span>
        </div>
        <TimelinePlannerSection plan={backendPlan} />
      </section>

      <section id="procedure-engine" className="mx-auto flex max-w-[1720px] flex-col gap-4 p-6 w-full border-t border-slate-200 mt-10">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-400 select-none">
          <FileText className="size-3.5 text-indigo-500" aria-hidden="true" />
          <span>Procedure Library</span>
        </div>
        <ProceduresSection plan={backendPlan} />
      </section>

      <section id="digital-twin" className="mx-auto flex max-w-[1720px] flex-col gap-4 p-6 w-full border-t border-slate-200 mt-10">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-400 select-none">
          <Tv className="size-3.5 text-indigo-500" aria-hidden="true" />
          <span>Digital Twin</span>
        </div>
        <Card className="border-border/70 bg-white rounded-2xl shadow-sm h-64 flex items-center justify-center">
          <span className="text-slate-400 text-sm font-semibold">Digital Twin Visualization System Offline</span>
        </Card>
      </section>

      <section id="mission-replay" className="mx-auto flex max-w-[1720px] flex-col gap-4 p-6 w-full border-t border-slate-200 mt-10">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-400 select-none">
          <Play className="size-3.5 text-indigo-500" aria-hidden="true" />
          <span>Mission Replay</span>
        </div>
        <Card className="border-border/70 bg-white rounded-2xl shadow-sm h-64 flex items-center justify-center">
          <span className="text-slate-400 text-sm font-semibold">Replay Archive Empty</span>
        </Card>
      </section>

      <section id="logs" className="mx-auto flex max-w-[1720px] flex-col gap-4 p-6 w-full border-t border-slate-200 mt-10">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-400 select-none">
          <Radio className="size-3.5 text-indigo-500" aria-hidden="true" />
          <span>Anomaly Logs</span>
        </div>
        <Card className="border-border/70 bg-white rounded-2xl shadow-sm p-4 overflow-y-auto max-h-96">
          {anomalyLogs.length === 0 ? (
             <div className="h-48 flex items-center justify-center">
               <span className="text-slate-400 text-sm font-semibold">No Anomaly Logs Available</span>
             </div>
          ) : (
            <div className="flex flex-col gap-4">
              {anomalyLogs.map((log: any) => (
                <div key={log.id} className="p-4 border border-slate-200 rounded-xl bg-slate-50 flex flex-col gap-2">
                  <div className="flex justify-between items-start">
                    <span className="font-bold text-slate-700 text-sm">{log.headline}</span>
                    <Badge variant="outline" className={log.risk_level === 'critical' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-amber-50 text-amber-700 border-amber-200'}>
                      {log.risk_level?.toUpperCase()}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-500">{log.what_happened}</p>
                  
                  {log.status === 'Detected - Awaiting Operator Action' && (
                    <div className="flex gap-2 mt-2">
                      <Button onClick={() => handleApproveAnomaly(log.id)} className="h-7 text-[10px] bg-emerald-500 hover:bg-emerald-600 text-white px-3 py-1">Approve Fix</Button>
                      <Button onClick={() => handleRejectAnomaly(log.id)} variant="outline" className="h-7 text-[10px] border-slate-200 text-slate-600 hover:bg-slate-100 px-3 py-1">Reject</Button>
                    </div>
                  )}

                  <div className="text-[10px] text-slate-400 font-mono mt-1 flex justify-between border-t border-slate-200 pt-2">
                    <span>Status: <span className="font-semibold text-slate-600">{log.status}</span></span>
                    <span>{new Date(log.created_at).toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </section>

      <section id="data-collection" className="mx-auto flex max-w-[1720px] flex-col gap-4 p-6 w-full border-t border-slate-200 mt-10">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-400 select-none">
          <Database className="size-3.5 text-indigo-500" aria-hidden="true" />
          <span>Data Collection</span>
        </div>
        <Card className="border-border/70 bg-white rounded-2xl shadow-sm p-6 flex flex-col gap-6">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-1 border-2 border-dashed border-slate-200 rounded-xl p-8 flex flex-col items-center justify-center bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer">
              <Camera className="size-8 text-slate-400 mb-2" />
              <p className="text-sm font-semibold text-slate-600">Upload Images & Audio</p>
              <p className="text-xs text-slate-400 mt-1 text-center">Drag and drop files here, or click to browse.</p>
              <input type="file" multiple accept="image/*,audio/*" className="hidden" />
            </div>
            <div className="flex-1 grid grid-cols-2 gap-4 auto-rows-[120px]">
              <div className="bg-slate-100 rounded-xl flex flex-col items-center justify-center text-slate-400 border border-slate-200">
                <Camera className="size-6 mb-1" />
                <span className="text-[10px] uppercase font-bold">Image_001.jpg</span>
              </div>
              <div className="bg-slate-100 rounded-xl flex flex-col items-center justify-center text-slate-400 border border-slate-200">
                <Radio className="size-6 mb-1" />
                <span className="text-[10px] uppercase font-bold">Telemetry_Audio.wav</span>
              </div>
            </div>
          </div>
        </Card>
      </section>

      <section id="settings" className="mx-auto flex max-w-[1720px] flex-col gap-4 p-6 w-full border-t border-slate-200 mt-10 mb-20">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-400 select-none">
          <Settings2 className="size-3.5 text-indigo-500" aria-hidden="true" />
          <span>Settings</span>
        </div>
        <Card className="border-border/70 bg-white rounded-2xl shadow-sm h-64 flex items-center justify-center">
          <span className="text-slate-400 text-sm font-semibold">Configuration Panel Offline</span>
        </Card>
      </section>

    </div>
  );
}
