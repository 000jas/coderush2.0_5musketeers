'use client'

import { useMemo, useState } from 'react'
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

const missions = [
  { name: 'Asteria Relay', code: 'AS-204', status: 'Operational', color: 'bg-primary', orbit: 'LEO • 482 km', latency: '18 ms' },
  { name: 'Kepler Array', code: 'KP-117', status: 'Limited', color: 'bg-warning', orbit: 'MEO • 8,614 km', latency: '64 ms' },
  { name: 'Northstar Link', code: 'NS-088', status: 'Critical', color: 'bg-danger', orbit: 'GEO • 35,786 km', latency: '211 ms' },
  { name: 'Solace Station', code: 'SL-301', status: 'Offline', color: 'bg-muted-foreground', orbit: 'Ground • Austin', latency: '—' },
]

const anomalies = [
  { severity: 'High', system: 'Thermal control', detail: 'Radiator loop pressure below threshold', time: '04m ago', icon: AlertTriangle },
  { severity: 'Medium', system: 'Comms array', detail: 'Packet loss detected on uplink 2', time: '18m ago', icon: Wifi },
  { severity: 'Low', system: 'Power bus', detail: 'Battery charge cycle completed', time: '42m ago', icon: Activity },
]

const commands = [
  { command: 'orbit.syncTelemetry', target: 'Asteria Relay', status: 'Executed', time: '09:42:18' },
  { command: 'comms.rotateKey', target: 'Kepler Array', status: 'Queued', time: '09:39:02' },
  { command: 'thermal.readSensors', target: 'Northstar Link', status: 'Failed', time: '09:31:44' },
  { command: 'power.setMode', target: 'Asteria Relay', status: 'Executed', time: '09:12:26' },
]

const schedule = [
  { time: '10:00', title: 'Routine telemetry sweep', detail: 'Asteria Relay • 12 min', tone: 'primary' },
  { time: '11:30', title: 'Station-keeping burn', detail: 'Kepler Array • 08 min', tone: 'warning' },
  { time: '13:45', title: 'Deep space comms window', detail: 'Northstar Link • 24 min', tone: 'violet' },
]

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
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [missionOpen, setMissionOpen] = useState(false)
  const [selectedMission, setSelectedMission] = useState(missions[0])
  const [search, setSearch] = useState('')
  const [anomalyFilter, setAnomalyFilter] = useState('All')
  const [running, setRunning] = useState(false)
  const [notice, setNotice] = useState('')

  const filteredMissions = useMemo(() => missions.filter((mission) => `${mission.name} ${mission.code}`.toLowerCase().includes(search.toLowerCase())), [search])
  const filteredAnomalies = anomalyFilter === 'All' ? anomalies : anomalies.filter((item) => item.severity === anomalyFilter)

  function announce(message: string) {
    setNotice(message)
    window.setTimeout(() => setNotice(''), 2600)
  }

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-background text-foreground">
        <aside className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-border/70 bg-sidebar px-3 py-4 transition-transform duration-200 lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="flex items-center justify-between px-3 pb-5">
            <div className="flex items-center gap-2.5"><div className="grid size-8 place-items-center rounded-xl bg-primary text-primary-foreground"><Command className="size-4" aria-hidden="true" /></div><span className="font-semibold tracking-tight">Nexus Control</span></div>
            <Button variant="ghost" size="icon-sm" className="lg:hidden" onClick={() => setSidebarOpen(false)} aria-label="Close navigation"><X /></Button>
          </div>
          <div className="flex flex-col gap-6 overflow-y-auto px-1">
            <nav aria-label="Primary navigation" className="flex flex-col gap-1">
              <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Workspace</p>
              <Button variant="secondary" className="justify-start gap-3"><LayoutDashboard data-icon="inline-start" />Overview</Button>
              <Button variant="ghost" className="justify-start gap-3 text-muted-foreground"><Radio data-icon="inline-start" />Missions<Badge className="ml-auto">4</Badge></Button>
              <Button variant="ghost" className="justify-start gap-3 text-muted-foreground"><Terminal data-icon="inline-start" />Command center</Button>
              <Button variant="ghost" className="justify-start gap-3 text-muted-foreground"><Database data-icon="inline-start" />Data streams</Button>
            </nav>
            <nav aria-label="System navigation" className="flex flex-col gap-1">
              <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">System</p>
              <Button variant="ghost" className="justify-start gap-3 text-muted-foreground"><Bell data-icon="inline-start" />Alerts<Badge variant="destructive" className="ml-auto">3</Badge></Button>
              <Button variant="ghost" className="justify-start gap-3 text-muted-foreground"><Settings2 data-icon="inline-start" />Configuration</Button>
            </nav>
          </div>
          <div className="mt-auto flex flex-col gap-3 rounded-xl bg-muted/70 p-3">
            <div className="flex items-center gap-2"><ShieldCheck className="size-4 text-success" aria-hidden="true" /><span className="text-xs font-medium">All systems secure</span></div>
            <div className="flex items-center justify-between text-[11px] text-muted-foreground"><span>Last audit</span><span>Today, 08:40</span></div>
          </div>
        </aside>

        <div className={`transition-[padding] duration-200 lg:pl-64 ${sidebarOpen ? '' : 'lg:pl-0'}`}>
          <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-3 border-b border-border/70 bg-background/95 px-4 backdrop-blur sm:px-6">
            <div className="flex min-w-0 items-center gap-3">
              <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setSidebarOpen(true)} aria-label="Open navigation"><Menu /></Button>
              <Button variant="ghost" size="icon" className="hidden lg:inline-flex" onClick={() => setSidebarOpen(!sidebarOpen)} aria-label="Toggle navigation">{sidebarOpen ? <PanelLeftClose /> : <PanelLeftOpen />}</Button>
              <Separator orientation="vertical" className="hidden h-5 sm:block" />
              <span className="hidden text-sm font-medium text-muted-foreground sm:block">Mission overview</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative hidden md:block"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" /><Input value={search} onChange={(event) => setSearch(event.target.value)} className="h-9 w-48 rounded-lg bg-muted/50 pl-9 text-sm lg:w-64" placeholder="Search anything..." aria-label="Search missions" /></div>
              <Tooltip><TooltipTrigger render={<Button variant="ghost" size="icon" aria-label="Help"><CircleHelp /></Button>} /><TooltipContent>Open help center</TooltipContent></Tooltip>
              <Button variant="ghost" size="icon" aria-label="Notifications" onClick={() => announce('You have 3 active alerts')}><Bell /></Button>
              <div className="ml-1 grid size-8 place-items-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">SK</div>
            </div>
          </header>

          <main className="mx-auto flex max-w-[1600px] flex-col gap-6 p-4 sm:p-6 lg:p-8">
            <div aria-live="polite" className={`fixed bottom-5 left-1/2 z-50 -translate-x-1/2 rounded-full bg-foreground px-4 py-2 text-xs font-medium text-background shadow-lg transition-opacity ${notice ? 'opacity-100' : 'pointer-events-none opacity-0'}`}>{notice}</div>
            <section className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
              <div className="flex flex-col gap-2"><div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.16em] text-primary"><Sparkles className="size-3.5" aria-hidden="true" />Operations center</div><h1 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl">Good morning, Soren.</h1><p className="text-pretty text-sm text-muted-foreground">Here&apos;s the latest across your active mission network.</p></div>
              <div className="flex flex-wrap items-center gap-2">
                <Popover open={missionOpen} onOpenChange={setMissionOpen}>
                  <PopoverTrigger render={<Button variant="outline" className="h-10 min-w-56 justify-between bg-card"><span className="flex items-center gap-2"><StatusDot status={selectedMission.status} /><span className="truncate text-sm">{selectedMission.name}</span></span><ChevronDown className="size-4 text-muted-foreground" /></Button>} />
                  <PopoverContent align="end" className="w-80 p-2">
                    <div className="flex items-center gap-2 px-2 pb-2"><Search className="size-4 text-muted-foreground" aria-hidden="true" /><Input autoFocus value={search} onChange={(event) => setSearch(event.target.value)} className="h-8 border-0 bg-transparent p-0 shadow-none focus-visible:ring-0" placeholder="Find a mission" /></div>
                    <Separator />
                    <div className="flex flex-col gap-1 py-2">{filteredMissions.map((mission) => <button key={mission.code} type="button" onClick={() => { setSelectedMission(mission); setMissionOpen(false); setSearch('') }} className="flex items-center gap-3 rounded-lg px-2 py-2.5 text-left hover:bg-muted"><StatusDot status={mission.status} /><span className="flex min-w-0 flex-1 flex-col"><span className="truncate text-sm font-medium">{mission.name}</span><span className="text-xs text-muted-foreground">{mission.code} · {mission.orbit}</span></span>{selectedMission.code === mission.code && <Check className="size-4 text-primary" aria-hidden="true" />}</button>)}</div>
                    <Separator /><button type="button" onClick={() => announce('Mission directory opened')} className="flex w-full items-center justify-between px-2 pt-2 text-xs font-medium text-primary">View all missions<ChevronRight className="size-4" aria-hidden="true" /></button>
                  </PopoverContent>
                </Popover>
                <Button onClick={() => announce('New command draft created')}><Plus data-icon="inline-start" />New command</Button>
              </div>
            </section>

            <section aria-label="Mission metrics" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"><MetricCard label="Network uptime" value="99.98%" detail="0.04% from last week" trend="up" icon={Gauge} tone="text-primary" /><MetricCard label="Active missions" value="04" detail="2 require attention" icon={Globe2} tone="text-violet" /><MetricCard label="Commands today" value="128" detail="18.2% from yesterday" trend="up" icon={Zap} tone="text-warning" /><MetricCard label="Open anomalies" value="03" detail="1 high severity" trend="down" icon={AlertTriangle} tone="text-danger" /></section>

            <section className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(340px,0.65fr)]">
              <Card className="border-border/70 shadow-sm"><CardHeader className="flex-row items-start justify-between gap-4 border-b border-border/70 pb-4"><div><CardTitle>Resource utilization</CardTitle><CardDescription className="mt-1">Live capacity across {selectedMission.name}</CardDescription></div><Button variant="ghost" size="icon-sm" aria-label="Resource options"><MoreHorizontal /></Button></CardHeader><CardContent className="grid gap-5 p-5 sm:grid-cols-3"><div className="flex flex-col gap-3"><div className="flex items-center justify-between text-xs"><span className="text-muted-foreground">Compute</span><span className="font-medium">68%</span></div><Progress value={68} className="[&_[data-slot=progress-indicator]]:bg-primary" /><span className="text-xs text-muted-foreground">Within nominal range</span></div><div className="flex flex-col gap-3"><div className="flex items-center justify-between text-xs"><span className="text-muted-foreground">Storage</span><span className="font-medium">42%</span></div><Progress value={42} className="[&_[data-slot=progress-indicator]]:bg-violet" /><span className="text-xs text-muted-foreground">1.7 TB of 4 TB used</span></div><div className="flex flex-col gap-3"><div className="flex items-center justify-between text-xs"><span className="text-muted-foreground">Bandwidth</span><span className="font-medium">81%</span></div><Progress value={81} className="[&_[data-slot=progress-indicator]]:bg-warning" /><span className="text-xs text-muted-foreground">Peak window in 2h</span></div></CardContent></Card>
              <Card className="border-border/70 shadow-sm"><CardHeader className="border-b border-border/70 pb-4"><div className="flex items-center justify-between"><div><CardTitle>Network health</CardTitle><CardDescription className="mt-1">Last 24 hours</CardDescription></div><Badge variant="secondary" className="gap-1.5"><span className="size-1.5 rounded-full bg-success" />Healthy</Badge></div></CardHeader><CardContent className="flex items-end gap-1 p-5"><div className="flex h-20 flex-1 items-end gap-1">{[36, 48, 42, 58, 54, 64, 60, 72, 64, 77, 70, 82, 76, 88, 80, 93, 90, 84, 96, 86, 92, 94, 90, 98].map((height, index) => <span key={index} className="min-w-1 flex-1 rounded-t-sm bg-primary/20" style={{ height: `${height}%` }} />)}</div><div className="flex h-20 flex-col justify-between text-[10px] text-muted-foreground"><span>100</span><span>50</span><span>0</span></div></CardContent></Card>
            </section>

            <section className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(340px,0.65fr)]">
              <Card className="border-border/70 shadow-sm"><CardHeader className="flex-row items-start justify-between gap-4 border-b border-border/70 pb-4"><div><CardTitle>Active anomalies</CardTitle><CardDescription className="mt-1">Signals requiring operator review</CardDescription></div><Button variant="outline" size="sm" onClick={() => announce('All anomalies marked as reviewed')}><Check data-icon="inline-start" />Review all</Button></CardHeader><CardContent className="p-0"><Tabs value={anomalyFilter} onValueChange={(value) => setAnomalyFilter(value)}><TabsList variant="line" className="m-4"><TabsTrigger value="All">All <span className="ml-1 text-xs text-muted-foreground">3</span></TabsTrigger><TabsTrigger value="High">High <span className="ml-1 text-xs text-muted-foreground">1</span></TabsTrigger><TabsTrigger value="Medium">Medium <span className="ml-1 text-xs text-muted-foreground">1</span></TabsTrigger></TabsList></Tabs><div className="flex flex-col">{filteredAnomalies.map((item) => { const Icon = item.icon; return <div key={item.system} className="flex items-center gap-3 border-t border-border/60 px-5 py-4"><div className={`grid size-9 shrink-0 place-items-center rounded-lg ${item.severity === 'High' ? 'bg-danger/10 text-danger' : item.severity === 'Medium' ? 'bg-warning/10 text-warning' : 'bg-muted text-muted-foreground'}`}><Icon className="size-4" aria-hidden="true" /></div><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><span className="text-sm font-medium">{item.system}</span><Badge variant={item.severity === 'High' ? 'destructive' : 'secondary'}>{item.severity}</Badge></div><p className="truncate text-xs text-muted-foreground">{item.detail}</p></div><span className="shrink-0 text-xs text-muted-foreground">{item.time}</span><Button variant="ghost" size="icon-sm" aria-label={`Open ${item.system} anomaly`} onClick={() => announce(`${item.system} anomaly opened`)}><ChevronRight /></Button></div> })}</div></CardContent></Card>
              <Card className="border-border/70 shadow-sm"><CardHeader className="border-b border-border/70 pb-4"><div className="flex items-center justify-between"><div><CardTitle>Quick actions</CardTitle><CardDescription className="mt-1">Common operator controls</CardDescription></div><SlidersHorizontal className="size-4 text-muted-foreground" aria-hidden="true" /></div></CardHeader><CardContent className="flex flex-col gap-2 p-4"><Button variant="outline" className="justify-start gap-3" onClick={() => setRunning(!running)}>{running ? <TimerReset data-icon="inline-start" /> : <Play data-icon="inline-start" />}{running ? 'Stop telemetry sweep' : 'Run telemetry sweep'}<span className="ml-auto text-xs text-muted-foreground">⌘ T</span></Button><Button variant="outline" className="justify-start gap-3" onClick={() => announce('Diagnostic report is being generated')}><Bot data-icon="inline-start" />Generate diagnostic report<ChevronRight className="ml-auto" /></Button><Button variant="outline" className="justify-start gap-3" onClick={() => announce('Secure mode enabled')}><ShieldCheck data-icon="inline-start" />Enable secure mode<ChevronRight className="ml-auto" /></Button></CardContent></Card>
            </section>

            <section className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(340px,0.65fr)]">
              <Card className="overflow-hidden border-border/70 shadow-sm"><CardHeader className="flex-row items-start justify-between border-b border-border/70 pb-4"><div><CardTitle>Command activity</CardTitle><CardDescription className="mt-1">Recent actions across the network</CardDescription></div><Button variant="ghost" size="sm" onClick={() => announce('Command log opened')}>View log<ChevronRight data-icon="inline-end" /></Button></CardHeader><div className="overflow-x-auto"><table className="w-full min-w-[620px] text-left text-sm"><thead className="bg-muted/40 text-xs text-muted-foreground"><tr><th className="px-5 py-3 font-medium">Command</th><th className="px-5 py-3 font-medium">Target</th><th className="px-5 py-3 font-medium">Status</th><th className="px-5 py-3 font-medium">Time</th></tr></thead><tbody>{commands.map((item) => <tr key={item.command} className="border-t border-border/60"><td className="px-5 py-3.5 font-mono text-xs">{item.command}</td><td className="px-5 py-3.5 text-muted-foreground">{item.target}</td><td className="px-5 py-3.5"><Badge variant={item.status === 'Failed' ? 'destructive' : item.status === 'Queued' ? 'outline' : 'secondary'}>{item.status}</Badge></td><td className="px-5 py-3.5 text-xs text-muted-foreground">{item.time}</td></tr>)}</tbody></table></div></Card>
              <Card className="border-border/70 shadow-sm"><CardHeader className="border-b border-border/70 pb-4"><div className="flex items-center justify-between"><div><CardTitle>Upcoming schedule</CardTitle><CardDescription className="mt-1">Today, August 7</CardDescription></div><Button variant="ghost" size="icon-sm" aria-label="Schedule options"><MoreHorizontal /></Button></div></CardHeader><CardContent className="flex flex-col gap-0 p-5">{schedule.map((item, index) => <div key={item.time} className="flex gap-3"><div className="flex flex-col items-center"><span className={`mt-1.5 size-2.5 rounded-full ${item.tone === 'primary' ? 'bg-primary' : item.tone === 'warning' ? 'bg-warning' : 'bg-violet'}`} />{index !== schedule.length - 1 && <span className="my-1 h-full w-px bg-border" />}</div><div className="flex flex-col gap-1 pb-5"><span className="font-mono text-xs text-muted-foreground">{item.time}</span><span className="text-sm font-medium">{item.title}</span><span className="text-xs text-muted-foreground">{item.detail}</span></div></div>)}</CardContent></Card>
            </section>

            <footer className="flex flex-col gap-3 border-t border-border/70 pt-5 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between"><div className="flex items-center gap-2"><span className="size-1.5 rounded-full bg-success" />Live data stream connected<span className="hidden sm:inline">•</span><span>Updated just now</span></div><div className="flex items-center gap-4"><span className="flex items-center gap-1.5"><Clock3 className="size-3.5" />UTC−05:00</span><span className="flex items-center gap-1.5"><Wifi className="size-3.5" />Latency {selectedMission.latency}</span></div></footer>
          </main>
        </div>
      </div>
    </TooltipProvider>
  )
}
