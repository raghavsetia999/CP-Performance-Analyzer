import React, { useState } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import {
  Activity,
  BarChart3,
  Bell,
  Bot,
  BrainCircuit,
  ChevronLeft,
  ClipboardList,
  Gauge,
  LayoutDashboard,
  LogOut,
  Menu,
  Moon,
  RefreshCw,
  Search,
  Settings,
  Sparkles,
  Target,
  TrendingUp,
  User,
  X,
} from 'lucide-react'
import { Avatar, Button, Input } from '../components/ui'
import { useAuth } from '../context/AuthContext'
import { cn } from '../lib/utils'

const groups = [
  {
    label: 'Overview',
    links: [
      ['Dashboard', '/dashboard', LayoutDashboard],
      ['Analyze Handle', '/analyze', Search],
    ],
  },
  {
    label: 'Intelligence',
    links: [
      ['Weakness Report', '/weakness', BrainCircuit],
      ['Rating Analysis', '/rating-analysis', BarChart3],
      ['Verdict Analysis', '/verdict-analysis', Activity],
      ['Upsolving', '/upsolving', Target],
    ],
  },
  {
    label: 'Improve',
    links: [
      ['AI Coach', '/ai-coach', Bot],
      ['Practice Plan', '/practice-plan', ClipboardList],
      ['Recommendations', '/recommendations', Sparkles],
      ['Progress', '/progress', TrendingUp],
    ],
  },
  {
    label: 'Account',
    links: [
      ['Profile', '/profile', User],
      ['Settings', '/settings', Settings],
    ],
  },
]
export function Brand({ compact = false }) {
  return (
    <NavLink to="/" className="flex items-center gap-2.5">
      <span className="relative grid h-9 w-9 place-items-center overflow-hidden rounded-xl bg-cyan-400 text-slate-950">
        <Gauge size={20} />
        <span className="absolute bottom-0 h-1 w-full bg-violet-500" />
      </span>
      {!compact && (
        <span className="text-[15px] font-bold tracking-tight">
          CP<span className="text-cyan-300">Pulse</span>
        </span>
      )}
    </NavLink>
  )
}
function Sidebar({ open, setOpen, collapsed, setCollapsed }) {
  return (
    <>
      <div
        onClick={() => setOpen(false)}
        className={cn(
          'fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden',
          open ? 'block' : 'hidden',
        )}
      />
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex flex-col border-r border-white/[.07] bg-[#0b0f18]/95 backdrop-blur-2xl transition-all lg:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full',
          collapsed ? 'w-[82px]' : 'w-[260px]',
        )}
      >
        <div className="flex h-[72px] items-center justify-between border-b border-white/[.06] px-5">
          <Brand compact={collapsed} />
          <button onClick={() => setOpen(false)} className="text-slate-500 lg:hidden">
            <X />
          </button>
        </div>
        <nav className="scrollbar-none flex-1 overflow-y-auto px-3 py-5">
          {groups.map((group) => (
            <div key={group.label} className="mb-5">
              <p
                className={cn(
                  'mb-2 px-3 font-mono text-[9px] uppercase tracking-[.2em] text-slate-700',
                  collapsed && 'text-center',
                )}
              >
                {collapsed ? '•••' : group.label}
              </p>
              {group.links.map(([label, to, Icon]) => (
                <NavLink
                  key={to}
                  to={to}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    cn(
                      'mb-1 flex h-10 items-center gap-3 rounded-xl px-3 text-sm transition',
                      isActive
                        ? 'bg-cyan-400/10 text-cyan-300'
                        : 'text-slate-500 hover:bg-white/[.045] hover:text-slate-200',
                      collapsed && 'justify-center',
                    )
                  }
                >
                  <Icon size={17} />
                  {!collapsed && <span>{label}</span>}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>
        <div className="border-t border-white/[.06] p-3">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden h-10 w-full items-center justify-center gap-2 rounded-xl text-slate-600 hover:bg-white/[.04] hover:text-slate-300 lg:flex"
          >
            <ChevronLeft size={17} className={cn('transition', collapsed && 'rotate-180')} />
            {!collapsed && <span className="text-xs">Collapse sidebar</span>}
          </button>
        </div>
      </aside>
    </>
  )
}
function Topbar({ setOpen, collapsed, user, onLogout }) {
  const location = useLocation()
  const title =
    groups.flatMap((g) => g.links).find((l) => l[1] === location.pathname)?.[0] || 'Dashboard'
  const initials =
    user?.name
      ?.split(/\s+/)
      .map((part) => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase() || 'CP'
  return (
    <header
      className={cn(
        'fixed left-0 right-0 top-0 z-30 flex h-[72px] items-center justify-between border-b border-white/[.06] bg-ink/80 px-4 backdrop-blur-xl transition-all sm:px-6',
        collapsed ? 'lg:left-[82px]' : 'lg:left-[260px]',
      )}
    >
      <div className="flex items-center gap-3">
        <button
          onClick={() => setOpen(true)}
          className="rounded-lg p-2 text-slate-400 hover:bg-white/[.05] lg:hidden"
        >
          <Menu />
        </button>
        <div>
          <p className="text-xs text-slate-600">Workspace</p>
          <h1 className="text-sm font-semibold sm:text-base">{title}</h1>
        </div>
      </div>
      <div className="flex items-center gap-1 sm:gap-2">
        <div className="relative hidden md:block">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" />
          <Input placeholder="Search problems, reports…" className="h-10 w-56 pl-9" />
        </div>
        <Button variant="ghost" size="icon" title="Refresh data">
          <RefreshCw size={17} />
        </Button>
        <Button variant="ghost" size="icon" title="Notifications" className="relative">
          <Bell size={18} />
          <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-cyan-400" />
        </Button>
        <Button variant="ghost" size="icon" title="Theme">
          <Moon size={17} />
        </Button>
        <Avatar initials={initials} className="ml-1 h-9 w-9 text-xs" />
        <Button variant="ghost" size="icon" title="Log out" onClick={onLogout}>
          <LogOut size={17} />
        </Button>
      </div>
    </header>
  )
}
export default function DashboardLayout() {
  const { user, logout } = useAuth()
  const [open, setOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(false)
  return (
    <div className="min-h-screen bg-ink">
      <Sidebar {...{ open, setOpen, collapsed, setCollapsed }} />
      <Topbar setOpen={setOpen} collapsed={collapsed} user={user} onLogout={logout} />
      <main
        className={cn(
          'min-h-screen pt-[72px] transition-all',
          collapsed ? 'lg:pl-[82px]' : 'lg:pl-[260px]',
        )}
      >
        <div className="mx-auto max-w-[1600px] p-4 sm:p-6 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
