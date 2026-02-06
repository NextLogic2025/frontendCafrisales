import React, { useState } from 'react'
import { LogOut, Menu, X } from 'components/ui/Icons'
import { SidebarNav, SidebarItem } from 'components/ui/SidebarNav'

type RoleLayoutProps = {
  roleLabel: string
  avatarText: string
  systemLabel?: string
  navItems: SidebarItem[]
  onSignOut: () => void | Promise<void>
  topRightSlot?: React.ReactNode
  children: React.ReactNode
}

import { NotificationBell } from './NotificationBell'

export function RoleLayout({ roleLabel, avatarText, systemLabel = 'Sistema', navItems, onSignOut, topRightSlot, children }: RoleLayoutProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <div className="min-h-dvh bg-neutral-50 text-neutral-900">
      {/* Mobile Top Bar */}
      <div className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-neutral-200 bg-white px-4 lg:hidden">
        <div className="flex items-center gap-3">
          <div className="grid h-8 w-8 place-items-center rounded-full bg-brand-red text-xs font-semibold text-white">
            {avatarText}
          </div>
          <span className="text-sm font-bold text-neutral-900">{roleLabel}</span>
        </div>
        <div className="flex items-center gap-2">
          <NotificationBell />
          <button
            type="button"
            onClick={() => setIsMenuOpen(true)}
            className="grid h-10 w-10 place-items-center rounded-xl bg-neutral-100 text-neutral-600 transition hover:bg-neutral-200"
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>
      </div>

      <div className="grid min-h-dvh w-full grid-cols-1 gap-6 lg:grid-cols-[260px_1fr]">
        {/* Mobile Backdrop */}
        {isMenuOpen && (
          <div
            className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm lg:hidden"
            onClick={() => setIsMenuOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside
          className={`
            fixed inset-y-0 left-0 z-[70] flex w-72 flex-col overflow-hidden bg-white p-4 shadow-2xl transition-transform duration-300 ease-in-out lg:static lg:z-0 lg:flex lg:h-[calc(100dvh-3rem)] lg:w-auto lg:translate-x-0 lg:self-start lg:rounded-3xl lg:border lg:border-neutral-200 lg:shadow-sm lg:sticky lg:top-6
            ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'}
          `}
        >
          <div className="mb-6 flex items-center justify-between lg:hidden">
            <span className="font-bold text-neutral-900">Menú</span>
            <button
              onClick={() => setIsMenuOpen(false)}
              className="grid h-10 w-10 place-items-center rounded-xl bg-neutral-100 text-neutral-500 hover:bg-neutral-200"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="mb-4 flex flex-col items-center gap-3 rounded-2xl bg-neutral-50 px-3 py-4 lg:flex-row lg:justify-between lg:py-3 cursor-default">
            <div className="flex items-center gap-3">
              <div className="grid h-12 w-12 place-items-center rounded-full bg-brand-red text-base font-semibold text-white lg:h-10 lg:w-10 lg:text-sm">
                {avatarText}
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-[0.18em] text-neutral-500">Rol</p>
                <p className="text-sm font-semibold text-neutral-900">{roleLabel}</p>
              </div>
            </div>
            <div className="hidden lg:block">
              <NotificationBell />
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto">
            <SidebarNav items={navItems} onItemClick={() => setIsMenuOpen(false)} />
          </div>

          <div className="mt-4 space-y-3 rounded-2xl border border-neutral-100 bg-neutral-50 px-3 py-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">{systemLabel}</p>
              <p className="text-sm text-neutral-700">Distribución Comercial (Embutidos)</p>
            </div>
            <button
              type="button"
              onClick={onSignOut}
              className="flex w-full items-center gap-2 rounded-xl bg-red-50 px-3 py-2 text-sm font-semibold text-brand-red transition hover:bg-red-100"
            >
              <LogOut className="h-4 w-4" />
              Cerrar sesión
            </button>
          </div>
        </aside>

        <main className="min-w-0 flex-1 space-y-5 px-4 py-6 lg:px-6">
          {topRightSlot && (
            <div className="flex items-center justify-end">{topRightSlot}</div>
          )}
          {children}
        </main>
      </div>
    </div>
  )
}
