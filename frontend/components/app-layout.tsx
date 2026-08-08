'use client'

import { SidebarProvider, useSidebar } from './sidebar-context'
import { AppSidebar } from './app-sidebar'
import { cn } from '@/lib/utils'

function AppLayoutContent({ children }: { children: React.ReactNode }) {
  const { isCollapsed } = useSidebar()

  return (
    <div className="min-h-screen bg-background text-foreground flex w-full relative">
      {/* Redesigned collapsible sidebar */}
      <AppSidebar />

      {/* Main body of page */}
      <div
        className={cn(
          "flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out",
          isCollapsed ? "lg:pl-[70px]" : "lg:pl-64"
        )}
      >
        {children}
      </div>
    </div>
  )
}

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AppLayoutContent>{children}</AppLayoutContent>
    </SidebarProvider>
  )
}
