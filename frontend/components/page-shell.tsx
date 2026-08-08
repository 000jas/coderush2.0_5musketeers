'use client'

import React from 'react'
import { Menu, PanelLeftClose, PanelLeftOpen, CircleHelp, Bell } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { useSidebar } from '@/components/sidebar-context'
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip'
import { LucideIcon } from 'lucide-react'

interface PageHeaderProps {
  title: string
}

export function PageHeader({ title }: PageHeaderProps) {
  const { isCollapsed, setIsCollapsed, setIsMobileOpen } = useSidebar()

  return (
    <TooltipProvider>
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-3 border-b border-border/70 bg-background/95 px-4 backdrop-blur sm:px-6 w-full">
        <div className="flex min-w-0 items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setIsMobileOpen(true)}
            aria-label="Open navigation"
          >
            <Menu className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="hidden lg:inline-flex"
            onClick={() => setIsCollapsed(!isCollapsed)}
            aria-label="Toggle navigation"
          >
            {isCollapsed ? <PanelLeftOpen className="size-4" /> : <PanelLeftClose className="size-4" />}
          </Button>
          <Separator orientation="vertical" className="hidden h-5 sm:block" />
          <span className="hidden text-sm font-medium text-muted-foreground sm:block">{title}</span>
        </div>
        <div className="flex items-center gap-2">
          <Tooltip>
            <TooltipTrigger
              render={
                <Button variant="ghost" size="icon" aria-label="Help">
                  <CircleHelp className="size-4" />
                </Button>
              }
            />
            <TooltipContent>Open help center</TooltipContent>
          </Tooltip>
          <Button variant="ghost" size="icon" aria-label="Notifications">
            <Bell className="size-4" />
          </Button>
          <div className="ml-1 grid size-8 place-items-center rounded-full bg-primary text-xs font-semibold text-primary-foreground select-none">
            SK
          </div>
        </div>
      </header>
    </TooltipProvider>
  )
}

interface EmptyStateProps {
  title: string
  description: string
  icon: LucideIcon
  actionLabel?: string
  onAction?: () => void
}

export function EmptyState({ title, description, icon: Icon, actionLabel, onAction }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 border border-dashed border-border/80 rounded-2xl bg-card/40 my-6 py-16 px-4 animate-in fade-in-50 slide-in-from-bottom-3 duration-500">
      <div className="grid size-12 place-items-center rounded-2xl bg-muted/65 text-muted-foreground mb-4">
        <Icon className="size-6 text-muted-foreground/80" aria-hidden="true" />
      </div>
      <h3 className="text-base font-semibold tracking-tight text-foreground">{title}</h3>
      <p className="mt-1.5 text-xs text-muted-foreground max-w-sm text-balance leading-relaxed">
        {description}
      </p>
      {actionLabel && onAction && (
        <Button
          variant="outline"
          size="sm"
          className="mt-5 h-9 text-xs rounded-xl"
          onClick={onAction}
        >
          {actionLabel}
        </Button>
      )}
    </div>
  )
}
