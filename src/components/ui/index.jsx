import React from 'react'
import { cn } from '../../lib/utils'

export function Button({ className, variant = 'primary', size = 'md', children, ...props }) {
  const variants = {
    primary:
      'bg-cyan-400 text-slate-950 hover:bg-cyan-300 shadow-[0_8px_28px_rgba(34,211,238,.18)]',
    secondary: 'bg-white/[.07] text-white hover:bg-white/[.11] border border-white/[.08]',
    ghost: 'text-slate-300 hover:text-white hover:bg-white/[.06]',
    danger: 'bg-rose-500/10 text-rose-300 border border-rose-500/20 hover:bg-rose-500/20',
  }
  const sizes = {
    sm: 'h-9 px-3 text-sm',
    md: 'h-11 px-4 text-sm',
    lg: 'h-12 px-5 text-[15px]',
    icon: 'h-10 w-10',
  }
  return (
    <button
      className={cn(
        'inline-flex shrink-0 items-center justify-center gap-2 rounded-xl font-semibold transition-all disabled:opacity-50',
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  )
}
export function Card({ className, children, ...props }) {
  return (
    <div
      className={cn('glass rounded-2xl shadow-[0_16px_50px_rgba(0,0,0,.18)]', className)}
      {...props}
    >
      {children}
    </div>
  )
}
export function Input({ className, ...props }) {
  return (
    <input
      className={cn(
        'h-11 w-full rounded-xl border border-white/[.08] bg-black/20 px-3.5 text-sm text-white outline-none placeholder:text-slate-600 focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-400/10',
        className,
      )}
      {...props}
    />
  )
}
export function Select({ className, children, ...props }) {
  return (
    <select
      className={cn(
        'h-11 rounded-xl border border-white/[.08] bg-[#111722] px-3.5 text-sm text-slate-300 outline-none focus:border-cyan-400/50',
        className,
      )}
      {...props}
    >
      {children}
    </select>
  )
}
export function Badge({ children, tone = 'slate', className }) {
  const tones = {
    slate: 'bg-slate-500/10 text-slate-300 border-slate-500/20',
    cyan: 'bg-cyan-400/10 text-cyan-300 border-cyan-400/20',
    violet: 'bg-violet-400/10 text-violet-300 border-violet-400/20',
    green: 'bg-emerald-400/10 text-emerald-300 border-emerald-400/20',
    amber: 'bg-amber-400/10 text-amber-300 border-amber-400/20',
    red: 'bg-rose-400/10 text-rose-300 border-rose-400/20',
  }
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-lg border px-2 py-1 text-xs font-semibold',
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  )
}
export function Progress({ value = 0, className }) {
  return (
    <div className={cn('h-2 overflow-hidden rounded-full bg-white/[.06]', className)}>
      <div
        className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-violet-400 transition-all"
        style={{ width: `${value}%` }}
      />
    </div>
  )
}
export function Avatar({ initials = 'RS', className }) {
  return (
    <div
      className={cn(
        'grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-cyan-400 to-violet-500 text-sm font-bold text-slate-950',
        className,
      )}
    >
      {initials}
    </div>
  )
}
export function Label({ children }) {
  return <label className="mb-2 block text-sm font-medium text-slate-300">{children}</label>
}
export function Switch({ active = true }) {
  return (
    <span
      className={cn(
        'flex h-6 w-11 rounded-full p-1 transition',
        active ? 'justify-end bg-cyan-400' : 'justify-start bg-slate-700',
      )}
    >
      <span className="h-4 w-4 rounded-full bg-white shadow" />
    </span>
  )
}
