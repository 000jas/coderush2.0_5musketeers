'use client'

import {
  LayoutDashboard,
  Radio,
  Clock3,
  FileText,
  Activity,
  Play,
  History,
  Settings2,
  Tv,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  X
} from 'lucide-react'
import { useSidebar } from './sidebar-context'
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export function AppSidebar() {
  const { isCollapsed, setIsCollapsed, isMobileOpen, setIsMobileOpen, activeSection, setActiveSection } = useSidebar()

  const navItems = [
    { name: 'Mission Dashboard', id: 'dashboard', icon: LayoutDashboard },
    { name: 'Mission Planner', id: 'mission-planner', icon: Clock3 },
    { name: 'Telemetry Monitor', id: 'telemetry-monitor', icon: Activity },
    { name: 'Digital Twin', id: 'digital-twin', icon: Tv },
    { name: 'Procedure Engine', id: 'procedure-engine', icon: FileText },
    { name: 'Simulation', id: 'simulation', icon: Play },
    { name: 'Mission Replay', id: 'mission-replay', icon: History },
    { name: 'Mission History', id: 'mission-history', icon: Radio },
    { name: 'Settings', id: 'settings', icon: Settings2 },
  ]

  const handleScroll = (id: string, e: React.MouseEvent) => {
    e.preventDefault()
    const element = document.getElementById(id)
    if (element) {
      const yOffset = -64
      const y = element.getBoundingClientRect().top + window.scrollY + yOffset
      window.scrollTo({ top: y, behavior: 'smooth' })
      setActiveSection(id)
    }
    setIsMobileOpen(false)
  }

  return (
    <TooltipProvider>
      {/* Mobile Drawer Overlay Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/20 backdrop-blur-xs lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex flex-col border-r border-sidebar-border bg-sidebar transition-all duration-300 ease-in-out lg:translate-x-0",
          isCollapsed ? "w-[70px] px-2 py-4" : "w-64 px-4 py-4",
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Top Header Row / Logo */}
        <div className="flex h-12 items-center justify-between px-2 pb-3">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <span className="text-xl shrink-0 select-none">🚀</span>
            <div className={cn(
              "flex flex-col transition-opacity duration-350",
              isCollapsed ? "opacity-0 w-0" : "opacity-100"
            )}>
              <span className="font-bold text-sm tracking-wide text-foreground leading-none">STELLX</span>
              <span className="text-[9px] text-muted-foreground leading-none mt-1 select-none">Mission Operations Platform</span>
            </div>
          </div>

          {/* Mobile Close Button */}
          <Button
            variant="ghost"
            size="icon"
            className="size-8 lg:hidden"
            onClick={() => setIsMobileOpen(false)}
            aria-label="Close navigation"
          >
            <X className="size-4" />
          </Button>
        </div>

        {/* Navigation Area scrollable */}
        <nav
          aria-label="Primary navigation"
          className="flex flex-1 flex-col gap-1.5 overflow-y-auto pt-4"
        >
          {/* Section Header */}
          {!isCollapsed && (
            <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground select-none">
              Console Menu
            </p>
          )}

          {navItems.map((item) => {
            const active = item.id === activeSection
            const Icon = item.icon

            const linkContent = (
              <a
                href={`#${item.id}`}
                onClick={(e) => handleScroll(item.id, e)}
                className={cn(
                  "relative flex h-10 items-center rounded-xl transition-all duration-200 outline-hidden cursor-pointer",
                  isCollapsed ? "justify-center w-10 mx-auto" : "px-3 gap-3 w-full",
                  active
                    ? "bg-primary/[0.07] text-primary font-medium"
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                )}
              >
                {/* Active left indicator line */}
                {active && (
                  <div
                    className={cn(
                      "absolute bg-primary rounded-r-md transition-all duration-300",
                      isCollapsed ? "left-0 top-2 bottom-2 w-1" : "left-0 top-2 bottom-2 w-1"
                    )}
                  />
                )}
                <Icon className={cn("size-4 shrink-0", active ? "text-primary" : "text-muted-foreground")} aria-hidden="true" />
                <span
                  className={cn(
                    "text-sm tracking-wide transition-opacity duration-200",
                    isCollapsed ? "opacity-0 hidden" : "opacity-100 block"
                  )}
                >
                  {item.name}
                </span>
              </a>
            )

            if (isCollapsed) {
              return (
                <Tooltip key={item.name}>
                  <TooltipTrigger render={linkContent} />
                  <TooltipContent side="right" align="center" className="ml-1">
                    {item.name}
                  </TooltipContent>
                </Tooltip>
              )
            }

            return <div key={item.name}>{linkContent}</div>
          })}
        </nav>

        {/* Bottom Footer Section */}
        <div className="mt-auto flex flex-col gap-4 pt-4 border-t border-sidebar-border/40">
          {/* Security Banner Card */}
          <div
            className={cn(
              "flex items-center rounded-xl bg-muted/60 p-2.5 transition-all duration-300 select-none",
              isCollapsed ? "justify-center mx-auto w-10 h-10 p-0" : "gap-3"
            )}
          >
            {isCollapsed ? (
              <Tooltip>
                <TooltipTrigger
                  render={
                    <div className="grid size-10 place-items-center rounded-xl cursor-default text-success">
                      <ShieldCheck className="size-5" aria-hidden="true" />
                    </div>
                  }
                />
                <TooltipContent side="right" className="space-y-1 p-2">
                  <p className="font-semibold text-success flex items-center gap-1.5 text-xs">
                    <ShieldCheck className="size-3.5" /> All systems secure
                  </p>
                  <p className="text-[10px] text-muted-foreground">Last audit: Today, 08:40</p>
                </TooltipContent>
              </Tooltip>
            ) : (
              <>
                <ShieldCheck className="size-5 text-success shrink-0" aria-hidden="true" />
                <div className="flex flex-col min-w-0">
                  <span className="text-[11px] font-medium text-foreground truncate">All systems secure</span>
                  <span className="text-[9px] text-muted-foreground truncate">Last audit today 08:40</span>
                </div>
              </>
            )}
          </div>

          {/* Collapse sidebar toggle button */}
          <Button
            variant="ghost"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={cn(
              "hidden lg:flex w-full items-center justify-center h-9 text-muted-foreground hover:text-foreground",
              isCollapsed ? "px-0" : "gap-2 px-3"
            )}
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? (
              <ChevronRight className="size-4 shrink-0" />
            ) : (
              <>
                <ChevronLeft className="size-4 shrink-0" />
                <span className="text-xs font-medium">Collapse</span>
              </>
            )}
          </Button>
        </div>
      </aside>
    </TooltipProvider>
  )
}
