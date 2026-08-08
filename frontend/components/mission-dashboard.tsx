'use client'

import { useMemo, useState, useEffect } from 'react'
import {
  Activity,
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  Bell,
  Bot,
  Check,
  ChevronDown,
  ChevronRight,
  CircleHelp,
  Clock3,
  Command,
  Cpu,
  Database,
  Gauge,
  Globe2,
  LayoutDashboard,
  Menu,
  MoreHorizontal,
  PanelLeftClose,
  PanelLeftOpen,
  Play,
  Plus,
  Radio,
  Search,
  Settings2,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Terminal,
  TimerReset,
  Wifi,
  X,
  Zap,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { useSidebar } from '@/components/sidebar-context'
import { cn } from '@/lib/utils'

// Import Section Components
import { MissionsSection } from '@/components/missions-section'
import { TimelinePlannerSection } from '@/components/timeline-planner-section'
import { CommandCenterSection } from '@/components/command-center-section'
import { ProceduresSection } from '@/components/procedures-section'
import { EventTimelineSection } from '@/components/event-timeline-section'
import { ReportsSection } from '@/components/reports-section'

interface Mission {
  name: string
  code: string
  status: string
  color: string
  orbit: string
  latency: string
}

interface Anomaly {
  severity: string
  system: string
  detail: string
  time: string
  icon: React.ComponentType<any>
}

interface CommandActivity {
  command: string
  target: string
  status: string
  time: string
}

interface ScheduleItem {
  time: string
  title: string
  detail: string
  tone: string
}

const missions: Mission[] = [
  { name: 'StellX-1', code: 'STX-1', status: 'Nominal', color: 'bg-success', orbit: 'LEO', latency: '124ms' }
]
const anomalies: Anomaly[] = []
const commands: CommandActivity[] = []
const schedule: ScheduleItem[] = []

function StatusDot({ status }: { status: string }) {
  const color = status === 'Operational' ? 'bg-success' : status === 'Limited' ? 'bg-warning' : status === 'Critical' ? 'bg-danger' : 'bg-muted-foreground'
  return <span aria-hidden="true" className={`size-2 rounded-full ${color}`} />
}

function MetricCard({ label, value, detail, trend, icon: Icon, tone = 'default' }: { label: string; value: string; detail: string; trend?: 'up' | 'down'; icon: typeof Gauge; tone?: string }) {
  return (
    <Card className="min-w-0 border-border/70 bg-card shadow-sm">
      <CardContent className="flex items-start justify-between gap-3 p-4 sm:p-5">
        <div className="flex min-w-0 flex-col gap-2">
          <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground"><Icon className={`size-4 ${tone}`} aria-hidden="true" />{label}</div>
          <div className="text-2xl font-semibold tracking-tight sm:text-3xl">{value}</div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            {trend === 'up' && <ArrowUpRight className="size-3.5 text-success" aria-hidden="true" />}
            {trend === 'down' && <ArrowDownRight className="size-3.5 text-danger" aria-hidden="true" />}
            {detail}
          </div>
        </div>
        <div className="grid size-9 shrink-0 place-items-center rounded-xl bg-muted text-muted-foreground"><Icon className="size-4" aria-hidden="true" /></div>
      </CardContent>
    </Card>
  )
}

export function MissionDashboard() {
  const { isCollapsed, setIsCollapsed, isMobileOpen, setIsMobileOpen, setActiveSection } = useSidebar()
  const [missionOpen, setMissionOpen] = useState(false)
  const fallbackMission = { name: 'StellX-1', status: 'Offline', code: 'STX-1', orbit: 'LEO', latency: '—' }
  const [selectedMission, setSelectedMission] = useState<Mission | typeof fallbackMission>(fallbackMission)
  const [search, setSearch] = useState('')
  const [anomalyFilter, setAnomalyFilter] = useState('All')
  const [running, setRunning] = useState(false)
  const [notice, setNotice] = useState('')
  const [isSimulationOpen, setIsSimulationOpen] = useState(false)
  const [selectedFault, setSelectedFault] = useState('auto')
  const [injecting, setInjecting] = useState(false)

  const [telemetry, setTelemetry] = useState<any>(null)
  const [plan, setPlan] = useState<any>(null)

  const fetchTelemetry = async () => {
    try {
      const res = await fetch('https://stellx.onrender.com/telemetry/next')
      if (res.ok) {
        const data = await res.json()
        setTelemetry(data.telemetry)
        setPlan(data.plan)
        if (data.telemetry) {
          setSelectedMission({
            name: 'StellX-1',
            code: 'STX-1',
            status: data.telemetry['Overall Satellite Health'] === 'Good' ? 'Nominal' : 'Warning',
            color: data.telemetry['Overall Satellite Health'] === 'Good' ? 'bg-success' : 'bg-warning',
            orbit: `LEO - Orbit #${data.telemetry['Orbit Number']}`,
            latency: `${data.telemetry['Signal Strength']} dBm`
          })
        }
      }
    } catch (error) {
      console.error('Failed to fetch telemetry:', error)
    }
  }

  const injectFault = async () => {
    try {
      setInjecting(true)
      const res = await fetch('https://stellx.onrender.com/telemetry/fault-injection', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ fault_type: selectedFault })
      })
      if (res.ok) {
        announce(`Success: Injected ${selectedFault} fault signal`)
        await fetchTelemetry()
        setIsSimulationOpen(false)
      } else {
        announce('Fault injection failed')
      }
    } catch (err) {
      console.error(err)
      announce('Fault injection error')
    } finally {
      setInjecting(false)
    }
  }

  useEffect(() => {
    fetchTelemetry()
  }, [])

  useEffect(() => {
    if (running) {
      const interval = setInterval(fetchTelemetry, 3000)
      return () => clearInterval(interval)
    }
  }, [running])

  const filteredMissions = useMemo(() => missions.filter((mission) => `${mission.name} ${mission.code}`.toLowerCase().includes(search.toLowerCase())), [search])

  const filteredAnomalies = useMemo(() => {
    if (!telemetry || telemetry['Active Fault'] === 'None') return []
    const rawAnomalies = [{
      severity: telemetry['Overall Satellite Health'] === 'Good' ? 'Medium' : 'High',
      system: 'Core Subsystem',
      detail: `Active Fault: ${telemetry['Active Fault']}`,
      time: new Date(telemetry.timestamp || Date.now()).toLocaleTimeString(),
      icon: AlertTriangle
    }]
    return anomalyFilter === 'All' ? rawAnomalies : rawAnomalies.filter((item) => item.severity === anomalyFilter)
  }, [telemetry, anomalyFilter])

  function announce(message: string) {
    setNotice(message)
    window.setTimeout(() => setNotice(''), 2600)
  }

  // Scrollspy feature
  useEffect(() => {
    const sections = ['dashboard', 'missions', 'timeline-planner', 'command-center', 'procedures', 'event-timeline', 'reports']
    const observers = sections.map((id) => {
      const element = document.getElementById(id)
      if (!element) return null

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setActiveSection(id)
          }
        },
        {
          rootMargin: '-30% 0px -60% 0px'
        }
      )
      observer.observe(element)
      return { observer, element }
    })

    return () => {
      observers.forEach((obs) => {
        if (obs) {
          obs.observer.unobserve(obs.element)
        }
      })
    }
  }, [setActiveSection])

  return (
    <TooltipProvider>
      <div className="flex flex-col w-full min-h-screen relative">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-3 border-b border-border/70 bg-background/95 px-4 backdrop-blur sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setIsMobileOpen(true)} aria-label="Open navigation"><Menu /></Button>
            <Button variant="ghost" size="icon" className="hidden lg:inline-flex" onClick={() => setIsCollapsed(!isCollapsed)} aria-label="Toggle navigation">{isCollapsed ? <PanelLeftOpen /> : <PanelLeftClose />}</Button>
            <Separator orientation="vertical" className="hidden h-5 sm:block" />
            <span className="hidden text-sm font-medium text-muted-foreground sm:block">Mission Control Overview</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative hidden md:block"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" /><Input value={search} onChange={(event) => setSearch(event.target.value)} className="h-9 w-48 rounded-lg bg-muted/50 pl-9 text-sm lg:w-64" placeholder="Search anything..." aria-label="Search missions" /></div>
            <Button
              onClick={() => setIsSimulationOpen(true)}
              variant="outline"
              className="h-9 gap-2 text-xs font-semibold rounded-xl play-btn-red-green transition-all duration-200"
            >
              <Play className="size-3.5 fill-current text-current-play-icon" aria-hidden="true" />
              <span>Play</span>
            </Button>
            <Tooltip><TooltipTrigger render={<Button variant="ghost" size="icon" aria-label="Help"><CircleHelp /></Button>} /><TooltipContent>Open help center</TooltipContent></Tooltip>
            <Button variant="ghost" size="icon" aria-label="Notifications" onClick={() => announce('You have 3 active alerts')}><Bell /></Button>
            <div className="ml-1 grid size-8 place-items-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">SK</div>
          </div>
        </header>

        <main className="mx-auto flex max-w-[1600px] flex-col gap-6 p-4 sm:p-6 lg:p-8 w-full flex-1 pb-24">
          <div aria-live="polite" className={`fixed bottom-5 left-1/2 z-50 -translate-x-1/2 rounded-full bg-foreground px-4 py-2 text-xs font-medium text-background shadow-lg transition-opacity ${notice ? 'opacity-100' : 'pointer-events-none opacity-0'}`}>{notice}</div>

          {/* Section 1: Dashboard Overview (Existing Hero) */}
          <section id="dashboard" className="scroll-mt-20 flex flex-col gap-6 w-full pt-2">
            <section className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.16em] text-primary">
                  <Sparkles className="size-3.5" aria-hidden="true" />Operations center
                </div>
                <h1 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl">LIVE MISSION STATUS</h1>
                <p className="text-pretty text-sm text-muted-foreground">Real-time insights into spacecraft health, communications, and operational readiness.</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Popover open={missionOpen} onOpenChange={setMissionOpen}>
                  <PopoverTrigger render={<Button variant="outline" className="h-10 min-w-56 justify-between bg-card"><span className="flex items-center gap-2"><StatusDot status={selectedMission.status} /><span className="truncate text-sm">{selectedMission.name}</span></span><ChevronDown className="size-4 text-muted-foreground" /></Button>} />
                  <PopoverContent align="end" className="w-80 p-2">
                    <div className="flex items-center gap-2 px-2 pb-2"><Search className="size-4 text-muted-foreground" aria-hidden="true" /><Input autoFocus value={search} onChange={(event) => setSearch(event.target.value)} className="h-8 border-0 bg-transparent p-0 shadow-none focus-visible:ring-0" placeholder="Find a satellite" /></div>
                    <Separator />
                    <div className="flex flex-col gap-1 py-2">
                      {filteredMissions.length === 0 ? (
                        <div className="px-3 py-4 text-center text-xs text-muted-foreground select-none">
                          No satellites available
                        </div>
                      ) : (
                        filteredMissions.map((mission) => (
                          <button key={mission.code} type="button" onClick={() => { setSelectedMission(mission); setMissionOpen(false); setSearch('') }} className="flex items-center gap-3 rounded-lg px-2 py-2.5 text-left hover:bg-muted font-medium"><StatusDot status={mission.status} /><span className="flex min-w-0 flex-1 flex-col"><span className="truncate text-sm font-medium">{mission.name}</span><span className="text-xs text-muted-foreground">{mission.code} · {mission.orbit}</span></span>{selectedMission.code === mission.code && <Check className="size-4 text-primary" aria-hidden="true" />}</button>
                        ))
                      )}
                    </div>
                    <Separator /><button type="button" onClick={() => announce('Mission directory opened')} className="flex w-full items-center justify-between px-2 pt-2 text-xs font-medium text-primary">View all satellites<ChevronRight className="size-4" aria-hidden="true" /></button>
                  </PopoverContent>
                </Popover>
                <Button onClick={() => announce('New command draft created')} disabled><Plus data-icon="inline-start" />New command</Button>
              </div>
            </section>

            

            <section className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(340px,0.65fr)]">
              <Card className="border-border/70 shadow-sm left-accent">
                <CardHeader className="flex-row items-center justify-between gap-4 border-b border-border/70 pb-4">
                  <div className="flex items-center gap-2">
                    <Gauge className="size-4.5 text-primary" aria-hidden="true" />
                    <div>
                      <CardTitle>Resource utilization</CardTitle>
                      <CardDescription className="mt-1">Live capacity across {selectedMission.name}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="grid gap-5 p-5 sm:grid-cols-3">
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground font-medium">Compute</span>
                      <span className="font-semibold text-muted-foreground">{telemetry ? `${telemetry['CPU Temperature']}°C` : '—'}</span>
                    </div>
                    <Progress value={telemetry ? Math.min(100, Math.max(0, (telemetry['CPU Temperature'] - 20) * 1.5)) : 0} className="[&_[data-slot=progress-indicator]]:bg-primary" />
                    <span className="text-xs text-muted-foreground select-none">{telemetry ? 'Operating temp nominal' : 'Offline'}</span>
                  </div>
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground font-medium">Storage</span>
                      <span className="font-semibold text-muted-foreground">{telemetry ? `${telemetry['Storage Used']}%` : '—'}</span>
                    </div>
                    <Progress value={telemetry ? telemetry['Storage Used'] : 0} className="[&_[data-slot=progress-indicator]]:bg-violet" />
                    <span className="text-xs text-muted-foreground select-none">{telemetry ? `${telemetry['Storage Used']}% used` : '0 GB used'}</span>
                  </div>
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground font-medium">Bandwidth</span>
                      <span className="font-semibold text-muted-foreground">{telemetry ? `${telemetry['Signal Strength']} dBm` : '—'}</span>
                    </div>
                    <Progress value={telemetry ? Math.max(0, 100 + telemetry['Signal Strength']) : 0} className="[&_[data-slot=progress-indicator]]:bg-warning" />
                    <span className="text-xs text-muted-foreground select-none">{telemetry ? 'Uplink signal locked' : 'No active link'}</span>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-border/70 shadow-sm">
                <CardHeader className="border-b border-border/70 pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                       <Globe2 className="size-4.5 text-primary" aria-hidden="true" />
                       <div>
                          <CardTitle>Network health</CardTitle>
                          <CardDescription className="mt-1">Last 24 hours</CardDescription>
                       </div>
                    </div>
                    {telemetry ? (
                      <Badge variant="secondary" className="gap-1.5 bg-green-500/10 text-green-500 border-none"><span className="size-1.5 rounded-full bg-green-400 animate-pulse" />Connected</Badge>
                    ) : (
                      <Badge variant="secondary" className="gap-1.5"><span className="size-1.5 rounded-full bg-muted-foreground" />Disconnected</Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="flex items-end gap-1 p-5">
                  <div className="flex h-20 flex-1 items-end gap-1 select-none">
                    {Array.from({ length: 24 }).map((_, index) => {
                      const activeHeight = telemetry ? (20 + (index % 5) * 12 + Math.abs(telemetry['Signal Strength'] % 7) * 4) : 4;
                      return (
                        <span key={index} className={cn("min-w-1 flex-1 rounded-t-sm transition-all duration-300", telemetry ? "bg-primary" : "bg-primary/5")} style={{ height: `${activeHeight}%` }} />
                      );
                    })}
                  </div>
                  <div className="flex h-20 flex-col justify-between text-[10px] text-muted-foreground select-none">
                    <span>100</span>
                    <span>50</span>
                    <span>0</span>
                  </div>
                </CardContent>
              </Card>
            </section>

            <section className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(340px,0.65fr)]">
              <Card className="border-border/70 shadow-sm left-accent">
                <CardHeader className="flex-row items-center justify-between gap-4 border-b border-border/70 pb-4">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="size-4.5 text-danger" aria-hidden="true" />
                    <div>
                      <CardTitle>Active anomalies</CardTitle>
                      <CardDescription className="mt-1">Signals requiring operator review</CardDescription>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => announce('All anomalies marked as reviewed')} disabled><Check data-icon="inline-start" />Review all</Button>
                </CardHeader>
                <CardContent className="p-0">
                  <Tabs value={anomalyFilter} onValueChange={(value) => setAnomalyFilter(value)}>
                    <TabsList variant="line" className="m-4">
                      <TabsTrigger value="All">All <span className="ml-1 text-xs text-muted-foreground">{filteredAnomalies.length}</span></TabsTrigger>
                      <TabsTrigger value="High">High <span className="ml-1 text-xs text-muted-foreground">{filteredAnomalies.filter(a => a.severity === 'High').length}</span></TabsTrigger>
                      <TabsTrigger value="Medium">Medium <span className="ml-1 text-xs text-muted-foreground">{filteredAnomalies.filter(a => a.severity === 'Medium').length}</span></TabsTrigger>
                    </TabsList>
                  </Tabs>
                  <div className="flex flex-col">
                    {filteredAnomalies.length === 0 ? (
                      <div className="py-14 text-center text-xs text-muted-foreground flex flex-col items-center justify-center gap-2 select-none">
                        <ShieldCheck className="size-5 text-success" />
                        <span>All systems secure. No anomalies detected.</span>
                      </div>
                    ) : (
                      filteredAnomalies.map((item) => {
                        const Icon = item.icon
                        return (
                          <div key={item.system} className="flex items-center gap-3 border-t border-border/60 px-5 py-4">
                            <div className={`grid size-9 shrink-0 place-items-center rounded-lg ${item.severity === 'High' ? 'bg-danger/10 text-danger' : item.severity === 'Medium' ? 'bg-warning/10 text-warning' : 'bg-muted text-muted-foreground'}`}><Icon className="size-4" aria-hidden="true" /></div>
                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="text-sm font-medium">{item.system}</span>
                                <Badge variant={item.severity === 'High' ? 'destructive' : 'secondary'}>{item.severity}</Badge>
                              </div>
                              <p className="truncate text-xs text-muted-foreground">{item.detail}</p>
                            </div>
                            <span className="shrink-0 text-xs text-muted-foreground">{item.time}</span>
                            <Button variant="ghost" size="icon-sm" aria-label={`Open ${item.system} anomaly`} onClick={() => announce(`${item.system} anomaly opened`)}><ChevronRight /></Button>
                          </div>
                        )
                      })
                    )}
                  </div>
                </CardContent>
              </Card>
              <Card className="border-border/70 shadow-sm charcoal-panel">
                <CardHeader className="border-b border-border/70 pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <SlidersHorizontal className="size-4 text-primary" aria-hidden="true" />
                      <div>
                        <CardTitle>Quick actions</CardTitle>
                        <CardDescription className="mt-1">Common operator controls</CardDescription>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="flex flex-col gap-2 p-4">
                  <Button 
                    variant="outline" 
                    className={cn("justify-start gap-3 transition-colors", running && "border-primary bg-primary/10 text-primary")} 
                    onClick={() => {
                      setRunning(!running);
                      announce(running ? 'Telemetry polling inactive' : 'Telemetry polling active (3s intervals)');
                    }}
                  >
                    <Play className={cn("size-3.5", running && "fill-primary animate-pulse")} data-icon="inline-start" />
                    <span>{running ? 'Stop telemetry sweep' : 'Run telemetry sweep'}</span>
                    <span className="ml-auto text-xs text-muted-foreground">⌘ T</span>
                  </Button>
                  <Button variant="outline" className="justify-start gap-3" onClick={() => announce('Diagnostic report is being generated')}>
                    <Bot data-icon="inline-start" />Generate diagnostic report<ChevronRight className="ml-auto" />
                  </Button>
                  <Button variant="outline" className="justify-start gap-3" onClick={() => announce('Secure mode enabled')}>
                    <ShieldCheck data-icon="inline-start" />Enable secure mode<ChevronRight className="ml-auto" />
                  </Button>
                </CardContent>
              </Card>
            </section>

            <section className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(340px,0.65fr)]">
              <Card className="overflow-hidden border-border/70 shadow-sm left-accent">
                <CardHeader className="flex-row items-center justify-between border-b border-border/70 pb-4">
                  <div className="flex items-center gap-2">
                    <Terminal className="size-4.5 text-primary" aria-hidden="true" />
                    <div>
                      <CardTitle>Command activity</CardTitle>
                      <CardDescription className="mt-1">Recent actions across the network</CardDescription>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => announce('Command log opened')} disabled>View log<ChevronRight data-icon="inline-end" /></Button>
                </CardHeader>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[620px] text-left text-sm">
                    <thead className="bg-muted/40 text-xs text-muted-foreground">
                      <tr>
                        <th className="px-5 py-3 font-medium">Command</th>
                        <th className="px-5 py-3 font-medium">Target</th>
                        <th className="px-5 py-3 font-medium">Status</th>
                        <th className="px-5 py-3 font-medium">Time</th>
                      </tr>
                    </thead>
                    <tbody>
                      {commands.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="py-12 text-center text-xs text-muted-foreground select-none">
                            No command packets dispatched during this session.
                          </td>
                        </tr>
                      ) : (
                        commands.map((item) => (
                          <tr key={item.command} className="border-t border-border/60">
                            <td className="px-5 py-3.5 font-mono text-xs">{item.command}</td>
                            <td className="px-5 py-3.5 text-muted-foreground">{item.target}</td>
                            <td className="px-5 py-3.5"><Badge variant={item.status === 'Failed' ? 'destructive' : item.status === 'Queued' ? 'outline' : 'secondary'}>{item.status}</Badge></td>
                            <td className="px-5 py-3.5 text-xs text-muted-foreground">{item.time}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </Card>
              <Card className="border-border/70 shadow-sm">
                <CardHeader className="border-b border-border/70 pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Clock3 className="size-4.5 text-primary" aria-hidden="true" />
                      <div>
                        <CardTitle>Upcoming schedule</CardTitle>
                        <CardDescription className="mt-1">Today, August 7</CardDescription>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon-sm" aria-label="Schedule options" disabled><MoreHorizontal /></Button>
                  </div>
                </CardHeader>
                <CardContent className="p-5">
                  {schedule.length === 0 ? (
                    <div className="py-10 text-center text-xs text-muted-foreground select-none">
                      No operational timetables scheduled for today.
                    </div>
                  ) : (
                    <div className="flex flex-col gap-0">
                      {schedule.map((item, index) => (
                        <div key={item.time} className="flex gap-3">
                          <div className="flex flex-col items-center">
                            <span className={`mt-1.5 size-2.5 rounded-full ${item.tone === 'primary' ? 'bg-primary' : item.tone === 'warning' ? 'bg-warning' : 'bg-violet'}`} />
                            {index !== schedule.length - 1 && <span className="my-1 h-full w-px bg-border" />}
                          </div>
                          <div className="flex flex-col gap-1 pb-5">
                            <span className="font-mono text-xs text-muted-foreground">{item.time}</span>
                            <span className="text-sm font-medium">{item.title}</span>
                            <span className="text-xs text-muted-foreground">{item.detail}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </section>
          </section>

          {/* Section 2: Missions */}
          <section id="missions" className="scroll-mt-20 flex flex-col gap-4 w-full pt-16 border-t border-border/70">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground select-none">
              <Radio className="size-3.5 text-primary" aria-hidden="true" />
              <span>Missions</span>
            </div>
            <MissionsSection telemetry={telemetry} />
          </section>

          {/* Section 3: Timeline Planner */}
          <section id="timeline-planner" className="scroll-mt-20 flex flex-col gap-4 w-full pt-16 border-t border-border/70">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground select-none">
              <Clock3 className="size-3.5 text-violet-500" aria-hidden="true" />
              <span>Timeline Planner</span>
            </div>
            <TimelinePlannerSection plan={plan} />
          </section>



          {/* Section 5: Command Center */}
          <section id="command-center" className="scroll-mt-20 flex flex-col gap-4 w-full pt-16 border-t border-border/70">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground select-none">
              <Terminal className="size-3.5 text-warning" aria-hidden="true" />
              <span>Command Center</span>
            </div>
            <CommandCenterSection />
          </section>

          {/* Section 6: Procedures */}
          <section id="procedures" className="scroll-mt-20 flex flex-col gap-4 w-full pt-16 border-t border-border/70">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground select-none">
              <Database className="size-3.5 text-indigo-500" aria-hidden="true" />
              <span>Procedures</span>
            </div>
            <ProceduresSection plan={plan} />
          </section>

          {/* Section 7: Event Timeline */}
          <section id="event-timeline" className="scroll-mt-20 flex flex-col gap-4 w-full pt-16 border-t border-border/70">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground select-none">
              <Activity className="size-3.5 text-emerald-500" aria-hidden="true" />
              <span>Event Timeline</span>
            </div>
            <EventTimelineSection />
          </section>

          {/* Section 8: Reports */}
          <section id="reports" className="scroll-mt-20 flex flex-col gap-4 w-full pt-16 border-t border-border/70">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground select-none">
              <Activity className="size-3.5 text-muted-foreground" aria-hidden="true" />
              <span>Reports</span>
            </div>
            <ReportsSection />
          </section>

          <footer className="mt-16 flex flex-col gap-3 border-t border-border/70 pt-5 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between w-full">
            <div className="flex items-center gap-2">
              <span className={cn("size-1.5 rounded-full", telemetry ? "bg-green-500 animate-pulse" : "bg-muted-foreground")} />
              <span>{telemetry ? 'Live data stream connected' : 'Disconnected'}</span>
              <span className="hidden sm:inline">•</span>
              <span>Updated just now</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5"><Clock3 className="size-3.5" />UTC−05:00</span>
              <span className="flex items-center gap-1.5">
                <Wifi className="size-3.5" />
                Latency {telemetry ? `${telemetry['Signal Strength']} dBm` : '—'}
              </span>
            </div>
          </footer>
        </main>

        {/* Simulation Modal Overlay Dashboard */}
        {isSimulationOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-md animate-in fade-in-50 duration-200">
            <Card className="border border-border/80 shadow-2xl bg-card rounded-2xl w-full max-w-xl p-6 relative animate-in zoom-in-95 duration-200">
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-4 right-4 rounded-xl size-8"
                onClick={() => setIsSimulationOpen(false)}
                aria-label="Close modal"
              >
                <X className="size-4" />
              </Button>
              
              <div className="flex flex-col gap-6 pt-2">
                <div className="flex flex-col gap-1.5">
                  <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
                    <Cpu className="size-5 text-primary" />
                    <span>Simulation Panel</span>
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    Simulate subsystem stress and inject custom fault vectors to satellite ops engine.
                  </p>
                </div>
                
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Select Fault to Inject</label>
                    <select
                      value={selectedFault}
                      onChange={(e) => setSelectedFault(e.target.value)}
                      className="w-full h-10 px-3 bg-muted border border-border text-foreground rounded-xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-primary"
                    >
                      <option value="auto">Auto Fault (Random Selection)</option>
                      <option value="battery_critical">Battery Critical</option>
                      <option value="cpu_overheat">CPU Overheat</option>
                      <option value="comm_loss">Communication Loss</option>
                      <option value="storage_full">Storage Full</option>
                      <option value="solar_failure">Solar Panel Failure</option>
                      <option value="sensor_glitch">Sensor Glitch</option>
                      <option value="multi_fault">Multi-Fault</option>
                    </select>
                  </div>
                  
                  <div className="flex flex-col gap-2 p-4 border border-border/85 bg-muted/20 rounded-xl">
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Active Engine Parameter Injection</span>
                    <p className="text-xs text-muted-foreground leading-normal">
                      Injecting a fault triggers a payload modification on the live StellX satellite platform simulator.
                    </p>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-4 border-t border-border/40">
                  <Button variant="outline" size="sm" className="rounded-xl px-4 text-xs h-9" onClick={() => setIsSimulationOpen(false)}>
                    Close
                  </Button>
                  <Button 
                    size="sm" 
                    className="rounded-xl px-4 text-xs h-9 bg-primary text-primary-foreground hover:bg-primary/80" 
                    onClick={injectFault}
                    disabled={injecting}
                  >
                    {injecting ? 'Injecting...' : 'Inject Fault'}
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </TooltipProvider>
  )
}
