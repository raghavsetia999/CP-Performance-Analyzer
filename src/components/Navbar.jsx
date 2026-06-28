import React, { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import { Brand } from '../layouts/DashboardLayout'
import { Button } from './ui'
export default function Navbar() {
  const [open, setOpen] = useState(false)
  return (
    <header className="fixed inset-x-0 top-0 z-40 border-b border-white/[.06] bg-ink/75 backdrop-blur-xl">
      <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-5">
        <Brand />
        <nav className="hidden items-center gap-8 md:flex">
          {[
            ['Features', '#features'],
            ['How It Works', '#how'],
            ['Demo', '#demo'],
            ['Pricing', '#pricing'],
          ].map(([l, h]) => (
            <a key={l} href={h} className="text-sm text-slate-500 hover:text-white">
              {l}
            </a>
          ))}
        </nav>
        <div className="hidden gap-2 md:flex">
          <Link to="/login">
            <Button variant="ghost">Log in</Button>
          </Link>
          <Link to="/register">
            <Button>Start free</Button>
          </Link>
        </div>
        <button className="text-slate-400 md:hidden" onClick={() => setOpen(!open)}>
          {open ? <X /> : <Menu />}
        </button>
      </div>
      {open && (
        <div className="border-t border-white/[.06] p-5 md:hidden">
          <div className="flex flex-col gap-4">
            {[
              ['Features', '#features'],
              ['How It Works', '#how'],
              ['Demo', '#demo'],
              ['Pricing', '#pricing'],
            ].map(([l, h]) => (
              <a key={l} onClick={() => setOpen(false)} href={h} className="text-sm text-slate-400">
                {l}
              </a>
            ))}
            <Link to="/login">
              <Button className="w-full">Log in</Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}
