'use client';

import React, { useState, useEffect } from 'react';
import type { SatelliteState } from '../lib/types';
import { ShieldAlert, Zap, Cpu, Wifi, Camera } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface DigitalTwinProps {
  state: SatelliteState;
}

export const DigitalTwin: React.FC<DigitalTwinProps> = ({ state }) => {
  const [angle, setAngle] = useState<number>(0);
  
  // Continuous orbital rotation animation
  useEffect(() => {
    let animId: number;
    const tick = () => {
      setAngle((prev) => (prev + 0.3) % 360);
      animId = requestAnimationFrame(tick);
    };
    animId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animId);
  }, []);

  const isConnected = state.communicationStatus === 'Connected';
  const isObserving = state.cameraStatus === 'Active';
  const isFaulted = state.activeFault !== 'None';
  const isSafeMode = state.missionMode === 'Safe Mode';

  // Calculate satellite coordinates on the SVG orbit path
  // Center is (250, 220), radius is 170
  const rad = (angle * Math.PI) / 180;
  const satX = 250 + Math.cos(rad) * 170;
  const satY = 220 + Math.sin(rad) * 170;

  // Determine LED colors based on battery capacity
  let ledColor = '#10b981'; // Green
  if (state.batteryPercentage < 20) ledColor = '#ef4444'; // Red
  else if (state.batteryPercentage < 45 || isSafeMode) ledColor = '#f59e0b'; // Amber

  // Determine camera angle
  const cameraRotation = isObserving ? Math.sin(angle * 0.1) * 20 : 0;

  // Determine solar panel angle
  let panelAngle = 0;
  if (isSafeMode) {
    panelAngle = 90; // Stowed flat
  } else if (isObserving) {
    panelAngle = 45; // Oriented to avoid camera blockage
  } else {
    // Face the sun (positioned at top right ~ 420, 50)
    const sunAngle = Math.atan2(50 - satY, 420 - satX) * (180 / Math.PI);
    panelAngle = sunAngle - angle; // relative rotation
  }

  // Find which subsystem is faulted to highlight it
  const getFaultedSubsystem = (): string | null => {
    if (!isFaulted) return null;
    const fault = state.activeFault.toLowerCase();
    if (fault.includes('battery') || fault.includes('power')) return 'Power';
    if (fault.includes('solar')) return 'Solar';
    if (fault.includes('cpu') || fault.includes('thermal')) return 'CPU';
    if (fault.includes('antenna') || fault.includes('comms') || fault.includes('transmitter')) return 'Comms';
    if (fault.includes('camera') || fault.includes('sensor')) return 'Payload';
    if (fault.includes('storage')) return 'Storage';
    return 'Core';
  };

  const faultedSubsystem = getFaultedSubsystem();

  return (
    <Card className="border-border/70 bg-card rounded-2xl shadow-sm overflow-hidden h-full min-h-[460px] flex flex-col relative select-none">
      
      {/* HUD Information Overlay */}
      <div className="absolute top-4 left-4 z-10 flex flex-col gap-1 pointer-events-none">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">spacecraft digital twin</span>
        <div className="flex items-center gap-1.5 mt-0.5">
          <span className={`size-2 rounded-full ${isSafeMode ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`} />
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">
            {isSafeMode ? 'SAFE MODE ACTIVE' : 'NOMINAL FLIGHT PATH'}
          </span>
        </div>
      </div>

      <div className="absolute top-4 right-4 z-10 flex gap-2 pointer-events-none">
        {isObserving && (
          <div className="flex items-center gap-1.5 bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 px-2 py-0.5 rounded text-[9px] font-bold uppercase">
            <Camera className="size-3" /> IMAGING EARTH
          </div>
        )}
        {isConnected && (
          <div className="flex items-center gap-1.5 bg-sky-500/10 text-sky-600 border border-sky-500/20 px-2 py-0.5 rounded text-[9px] font-bold uppercase">
            <Wifi className="size-3" /> RF DOWNLINK
          </div>
        )}
        {isFaulted && (
          <div className="flex items-center gap-1.5 bg-red-500/10 text-red-600 border border-red-500/20 px-2 py-0.5 rounded text-[9px] font-bold uppercase animate-pulse">
            <ShieldAlert className="size-3" /> FAULT: {faultedSubsystem}
          </div>
        )}
      </div>

      {/* SVG Space Canvas */}
      <div className="flex-1 w-full bg-slate-950 flex items-center justify-center p-4 relative">
        
        {/* Subtle grid pattern background inside the space box */}
        <div className="absolute inset-0 opacity-15 pointer-events-none" style={{
          backgroundImage: 'radial-gradient(rgba(56, 189, 248, 0.15) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }} />

        <svg viewBox="0 0 500 440" className="w-full max-w-[500px] h-full overflow-visible z-10">
          
          {/* 1. Background stars */}
          <g opacity="0.3">
            <circle cx="50" cy="80" r="1.2" fill="#fff" />
            <circle cx="120" cy="40" r="0.8" fill="#fff" />
            <circle cx="80" cy="180" r="1.5" fill="#fff" />
            <circle cx="440" cy="150" r="1.0" fill="#fff" />
            <circle cx="410" cy="290" r="1.2" fill="#fff" />
            <circle cx="350" cy="350" r="0.7" fill="#fff" />
            <circle cx="180" cy="380" r="1.4" fill="#fff" />
            <circle cx="280" cy="30" r="1.0" fill="#fff" />
          </g>

          {/* 2. Sun (Light Source Indicator) */}
          <g transform="translate(420, 50)" className="select-none">
            <circle cx="0" cy="0" r="18" fill="#fef08a" opacity="0.15" />
            <circle cx="0" cy="0" r="12" fill="#fef08a" opacity="0.3" className="animate-ping" style={{ animationDuration: '4s' }} />
            <circle cx="0" cy="0" r="8" fill="#fef08a" />
            {/* Sun Rays */}
            {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
              <line key={deg} x1="0" y1="0" x2="15" y2="0" stroke="#fef08a" strokeWidth="1.5" transform={`rotate(${deg})`} />
            ))}
          </g>

          {/* 3. Orbit Ring (Behind Earth) */}
          <ellipse cx="250" cy="220" rx="170" ry="170" fill="none" stroke="rgba(56, 189, 248, 0.15)" strokeWidth="1.5" strokeDasharray="6,6" />

          {/* 4. Active Communication Downlink Beam (Pulsing laser beam from Satellite to Earth center Ground station) */}
          {isConnected && (
            <g>
              {/* Downlink beam lines */}
              <line x1={satX} y1={satY} x2="250" y2="220" stroke="#0ea5e9" strokeWidth="4" opacity="0.2" strokeLinecap="round" />
              <line x1={satX} y1={satY} x2="250" y2="220" stroke="#e0f2fe" strokeWidth="1.5" opacity="0.6" strokeLinecap="round" />
              {/* Pulse waves */}
              <circle cx={(satX + 250) / 2} cy={(satY + 220) / 2} r="12" fill="none" stroke="#38bdf8" strokeWidth="1.5" opacity="0.4" className="animate-ping" style={{ animationDuration: '1.5s' }} />
            </g>
          )}

          {/* 5. Central Earth Globe */}
          <g transform="translate(250, 220)">
            {/* Atmosphere outer glow */}
            <circle cx="0" cy="0" r="64" fill="#0284c7" opacity="0.08" />
            <circle cx="0" cy="0" r="58" fill="#38bdf8" opacity="0.12" />
            
            {/* Ocean sphere body */}
            <circle cx="0" cy="0" r="50" fill="#0f172a" stroke="rgba(56, 189, 248, 0.3)" strokeWidth="1.5" />
            
            {/* Holographic grid lines */}
            <path d="M -50 0 A 50 15 0 0 0 50 0" fill="none" stroke="rgba(56, 189, 248, 0.12)" strokeWidth="1" />
            <path d="M -50 0 A 50 15 0 0 1 50 0" fill="none" stroke="rgba(56, 189, 248, 0.12)" strokeWidth="1" />
            <path d="M 0 -50 A 15 50 0 0 0 0 50" fill="none" stroke="rgba(56, 189, 248, 0.12)" strokeWidth="1" />
            <path d="M 0 -50 A 15 50 0 0 1 0 50" fill="none" stroke="rgba(56, 189, 248, 0.12)" strokeWidth="1" />
            <line x1="-50" y1="0" x2="50" y2="0" stroke="rgba(56, 189, 248, 0.12)" strokeWidth="1" />
            <line x1="0" y1="-50" x2="0" y2="50" stroke="rgba(56, 189, 248, 0.12)" strokeWidth="1" />

            {/* Stylized Abstract Continents outlines */}
            <path d="M -25 -25 Q -10 -35 10 -30 Q 30 -20 20 -5 Q 35 15 15 25 Q -15 35 -20 15 Q -35 -5 -25 -25 Z" fill="rgba(56, 189, 248, 0.08)" stroke="rgba(56, 189, 248, 0.25)" strokeWidth="1" />
            <path d="M -40 10 Q -25 15 -30 25 Q -42 35 -40 10 Z" fill="rgba(56, 189, 248, 0.08)" stroke="rgba(56, 189, 248, 0.2)" strokeWidth="1" />

            {/* Ground Stations (Norway & Antarctica beacons) */}
            {/* Svalbard Ground station (Northern hemisphere) */}
            <circle cx="15" cy="-35" r="3" fill="#38bdf8" className={isConnected ? "animate-pulse" : ""} />
            <circle cx="15" cy="-35" r="6" fill="none" stroke="#38bdf8" strokeWidth="0.8" opacity="0.5" className="animate-ping" />
            <text x="22" y="-33" fill="#38bdf8" fontSize="6.5" fontFamily="var(--font-mono)" opacity="0.8">SESS</text>

            {/* McMurdo station (Southern hemisphere) */}
            <circle cx="-18" cy="38" r="3" fill="#38bdf8" />
            <text x="-38" y="44" fill="#38bdf8" fontSize="6.5" fontFamily="var(--font-mono)" opacity="0.8">McMurdo</text>
          </g>

          {/* 6. Satellite Assembly (Revolving on coordinates satX, satY) */}
          <g transform={`translate(${satX}, ${satY})`} className="select-none">
            
            {/* Anomaly Fault emergency pulsing halo */}
            {isFaulted && (
              <circle cx="0" cy="0" r="32" fill="none" stroke="#ef4444" strokeWidth="2" opacity="0.4" className="animate-ping" />
            )}

            {/* Main Solar Panels Wing Axles (Extend left and right) */}
            <line x1="-34" y1="0" x2="34" y2="0" stroke="#64748b" strokeWidth="2.5" />

            {/* LEFT Solar array wing (Pivoting dynamically based on panelAngle) */}
            <g transform={`translate(-26, 0) rotate(${panelAngle})`}>
              {/* Solar panels backing */}
              <rect x="-18" y="-10" width="18" height="20" fill="#0f172a" stroke="#cbd5e1" strokeWidth="1" rx="1.5" />
              {/* Grid cell highlights */}
              <line x1="-9" y1="-10" x2="-9" y2="10" stroke="#0ea5e9" strokeWidth="0.8" />
              <line x1="-18" y1="0" x2="0" y2="0" stroke="#0ea5e9" strokeWidth="0.8" />
              <rect x="-17" y="-9" width="16" height="18" fill="rgba(14, 165, 233, 0.1)" stroke="none" />
              
              {/* Solar Panel drives failure label */}
              {faultedSubsystem === 'Solar' && (
                <rect x="-18" y="-10" width="18" height="20" fill="rgba(239, 68, 68, 0.25)" stroke="#ef4444" strokeWidth="1.2" />
              )}
            </g>

            {/* RIGHT Solar array wing */}
            <g transform={`translate(26, 0) rotate(${panelAngle})`}>
              <rect x="0" y="-10" width="18" height="20" fill="#0f172a" stroke="#cbd5e1" strokeWidth="1" rx="1.5" />
              <line x1="9" y1="-10" x2="9" y2="10" stroke="#0ea5e9" strokeWidth="0.8" />
              <line x1="0" y1="0" x2="18" y2="0" stroke="#0ea5e9" strokeWidth="0.8" />
              <rect x="1" y="-9" width="16" height="18" fill="rgba(14, 165, 233, 0.1)" stroke="none" />
              
              {faultedSubsystem === 'Solar' && (
                <rect x="0" y="-10" width="18" height="20" fill="rgba(239, 68, 68, 0.25)" stroke="#ef4444" strokeWidth="1.2" />
              )}
            </g>

            {/* Satellite Core Box Chassis (Gold Foil) */}
            <rect x="-10" y="-12" width="20" height="24" fill="#d97706" stroke="#f59e0b" strokeWidth="1.2" rx="2" />
            {/* Chassis metal borders */}
            <rect x="-8" y="-10" width="16" height="20" fill="none" stroke="#f8fafc" strokeWidth="0.5" opacity="0.3" />

            {/* Subsystem specific fault indicators */}
            {faultedSubsystem === 'Power' && (
              <rect x="-11" y="-13" width="22" height="26" fill="none" stroke="#ef4444" strokeWidth="1.5" className="animate-pulse" />
            )}

            {/* Battery status LED (Centered) */}
            <circle cx="0" cy="-4" r="2.5" fill={ledColor} />
            
            {/* Active Task / Heartbeat blinking LED */}
            <circle cx="0" cy="4" r="2.2" fill={isSafeMode ? '#f59e0b' : '#38bdf8'} className="animate-pulse" />

            {/* Gimbal Camera optical barrel (Bottom pointing to Earth) */}
            <g transform={`translate(0, 12) rotate(${cameraRotation})`}>
              {/* Support yoke */}
              <line x1="-4" y1="0" x2="4" y2="0" stroke="#475569" strokeWidth="2" />
              {/* Lens Cylinder tube */}
              <rect x="-2.5" y="0" width="5" height="10" fill="#1e293b" stroke="#cbd5e1" strokeWidth="0.8" />
              {/* Lens glass cap */}
              <ellipse cx="0" cy="10" rx="2.5" ry="1" fill="#06b6d4" />
              
              {/* Optical flash during Active Imaging scan */}
              {isObserving && (
                <path d="M -8 11 L 8 11 L 18 35 L -18 35 Z" fill="url(#lens-glow)" opacity="0.3" />
              )}
              
              {faultedSubsystem === 'Payload' && (
                <rect x="-3.5" y="-1" width="7" height="12" fill="rgba(239, 68, 68, 0.25)" stroke="#ef4444" strokeWidth="1.2" />
              )}
            </g>

            {/* Parabolic Antenna Dish (Top pointing back to orbit Normal) */}
            <g transform="translate(0, -12)">
              {/* Support stem */}
              <line x1="0" y1="0" x2="0" y2="-6" stroke="#475569" strokeWidth="1.5" />
              {/* Gold dish curve */}
              <path d="M -8 -9 Q 0 -5 8 -9" fill="none" stroke="#d97706" strokeWidth="1.8" strokeLinecap="round" />
              {/* Subreflector tip */}
              <line x1="0" y1="-5" x2="0" y2="-10" stroke="#64748b" strokeWidth="0.8" />
              
              {faultedSubsystem === 'Comms' && (
                <circle cx="0" cy="-6" r="8" fill="rgba(239, 68, 68, 0.2)" stroke="#ef4444" strokeWidth="1" />
              )}
            </g>
          </g>

          {/* Lens glow gradient definition */}
          <defs>
            <linearGradient id="lens-glow" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#06b6d4" stopOpacity="0" />
            </linearGradient>
          </defs>

        </svg>
      </div>

      <div className="absolute bottom-3 left-4 pointer-events-none flex flex-col gap-0.5 text-[8.5px] font-mono text-slate-500 bg-background/90 px-2 py-1 rounded border border-border/60 backdrop-blur-xs select-none">
        <div>TELEMETRY CLOCK: ACTIVE</div>
        <div>ORBIT TRANSIT: 45s REV</div>
      </div>
    </Card>
  );
};
