import React from 'react'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import {
  ArrowDownRight,
  ArrowUpRight,
  Bot,
  ChevronRight,
  ExternalLink,
  Inbox,
  LoaderCircle,
  Sparkles,
} from 'lucide-react'
import { Badge, Button, Card, Progress } from './ui'

export const chartTheme = { grid: '#1d2737', text: '#718096', cyan: '#22d3ee', violet: '#8b5cf6' }
export function SectionHeader({ eyebrow, title, description, action }) {
  return (
    <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
      <div>
        {eyebrow && (
          <p className="mb-1 font-mono text-[11px] uppercase tracking-[.18em] text-cyan-400">
            {eyebrow}
          </p>
        )}
        <h2 className="text-xl font-semibold tracking-tight text-white sm:text-2xl">{title}</h2>
        {description && <p className="mt-1 max-w-2xl text-sm text-slate-500">{description}</p>}
      </div>
      {action}
    </div>
  )
}
export function StatCard({ label, value, icon: Icon, change, caption }) {
  const up = !String(change || '').startsWith('-')
  return (
    <Card className="group relative overflow-hidden p-5 transition hover:-translate-y-0.5 hover:border-cyan-400/20">
      <div className="absolute -right-6 -top-6 h-20 w-20 rounded-full bg-cyan-400/[.04] blur-xl" />
      <div className="mb-4 flex items-start justify-between">
        <span className="text-sm text-slate-500">{label}</span>
        {Icon && (
          <span className="rounded-lg bg-white/[.05] p-2 text-slate-400 group-hover:text-cyan-300">
            <Icon size={17} />
          </span>
        )}
      </div>
      <div className="flex items-end justify-between">
        <div>
          <p className="text-2xl font-semibold tracking-tight">{value}</p>
          {caption && <p className="mt-1 text-xs text-slate-600">{caption}</p>}
        </div>
        {change && (
          <span className={up ? 'text-emerald-400' : 'text-rose-400'}>
            {up ? (
              <ArrowUpRight className="inline" size={14} />
            ) : (
              <ArrowDownRight className="inline" size={14} />
            )}{' '}
            <span className="text-xs">{change}</span>
          </span>
        )}
      </div>
    </Card>
  )
}
export function ChartCard({ title, subtitle, children, className }) {
  return (
    <Card className={`p-5 ${className || ''}`}>
      <div className="mb-5">
        <h3 className="font-semibold">{title}</h3>
        {subtitle && <p className="mt-1 text-xs text-slate-500">{subtitle}</p>}
      </div>
      <div className="h-64">{children}</div>
    </Card>
  )
}
export function BarChartView({ data, dataKey = 'rate', nameKey = 'bucket', color = '#22d3ee' }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ left: -25, right: 5 }}>
        <CartesianGrid stroke={chartTheme.grid} vertical={false} />
        <XAxis
          dataKey={nameKey}
          tick={{ fill: chartTheme.text, fontSize: 11 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis tick={{ fill: chartTheme.text, fontSize: 11 }} axisLine={false} tickLine={false} />
        <Tooltip
          contentStyle={{
            background: '#111827',
            border: '1px solid #263043',
            borderRadius: 12,
            fontSize: 12,
          }}
          cursor={{ fill: 'rgba(0.1, 0.1, 0.1, 0.5)' }}
        />
        <Bar dataKey={dataKey} fill={color} radius={[6, 6, 2, 2]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
export function TrendChart({ data, dataKey = 'rating', secondary }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ left: -15, right: 10 }}>
        <defs>
          <linearGradient id={`g-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={chartTheme.cyan} stopOpacity={0.28} />
            <stop offset="1" stopColor={chartTheme.cyan} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke={chartTheme.grid} vertical={false} />
        <XAxis
          dataKey="month"
          tick={{ fill: chartTheme.text, fontSize: 11 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis tick={{ fill: chartTheme.text, fontSize: 11 }} axisLine={false} tickLine={false} />
        <Tooltip
          contentStyle={{
            background: '#111827',
            border: '1px solid #263043',
            borderRadius: 12,
            fontSize: 12,
          }}
        />
        <Area
          type="monotone"
          dataKey={dataKey}
          stroke={chartTheme.cyan}
          strokeWidth={2.5}
          fill={`url(#g-${dataKey})`}
        />
        {secondary && (
          <Line
            type="monotone"
            dataKey={secondary}
            stroke={chartTheme.violet}
            strokeWidth={2}
            dot={false}
          />
        )}
      </AreaChart>
    </ResponsiveContainer>
  )
}
export function DonutChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          innerRadius={62}
          outerRadius={90}
          paddingAngle={3}
          stroke="none"
        >
          {data.map((v, i) => (
            <Cell key={i} fill={v.color} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            background: '#111827',
            border: '1px solid #263043',
            borderRadius: 12,
            fontSize: 12,
          }}
        />
      </PieChart>
    </ResponsiveContainer>
  )
}
export function TopicBadge({ children }) {
  return <Badge tone="violet">{children}</Badge>
}
export function RatingBadge({ children }) {
  return <Badge tone="cyan">{children}</Badge>
}
export function VerdictBadge({ children }) {
  const s = String(children).toLowerCase()
  return (
    <Badge
      tone={
        s.includes('accepted')
          ? 'green'
          : s.includes('wrong')
            ? 'red'
            : s.includes('time')
              ? 'amber'
              : 'slate'
      }
    >
      {children}
    </Badge>
  )
}
export function PriorityBadge({ children }) {
  return (
    <Badge tone={children === 'High' ? 'red' : children === 'Medium' ? 'amber' : 'slate'}>
      {children}
    </Badge>
  )
}
export function AIResponseCard({ title, children, icon: Icon = Sparkles }) {
  return (
    <Card className="border-violet-400/20 bg-gradient-to-br from-violet-500/[.08] to-cyan-400/[.03] p-5">
      <div className="mb-3 flex items-center gap-2 text-violet-300">
        <Icon size={18} />
        <h3 className="font-semibold text-white">{title}</h3>
      </div>
      <div className="text-sm leading-6 text-slate-400">{children}</div>
    </Card>
  )
}
export function WeaknessCard({ item }) {
  return (
    <Card className="p-5 transition hover:border-rose-400/20">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-semibold">{item.short}</p>
          <p className="mt-1 text-xs text-slate-500">Last practiced {item.last}</p>
        </div>
        <div className="text-right">
          <span className="font-mono text-2xl font-semibold text-rose-300">{item.weakness}</span>
          <p className="text-[10px] uppercase text-slate-600">weakness</p>
        </div>
      </div>
      <Progress value={item.weakness} className="my-4 [&>div]:from-rose-400 [&>div]:to-amber-400" />
      <div className="grid grid-cols-3 gap-2 text-center">
        <Mini label="Tried" value={item.attempted} />
        <Mini label="Solved" value={item.solved} />
        <Mini label="AC rate" value={`${item.rate}%`} />
      </div>
    </Card>
  )
}
function Mini({ label, value }) {
  return (
    <div className="rounded-lg bg-black/20 p-2">
      <p className="text-sm font-semibold">{value}</p>
      <p className="text-[10px] text-slate-600">{label}</p>
    </div>
  )
}
export function EmptyState({
  title = 'Nothing here yet',
  description = 'Once data is available, it will appear here.',
}) {
  return (
    <Card className="grid min-h-64 place-items-center p-8 text-center">
      <div>
        <Inbox className="mx-auto mb-3 text-slate-600" />
        <h3 className="font-semibold">{title}</h3>
        <p className="mt-1 text-sm text-slate-500">{description}</p>
      </div>
    </Card>
  )
}
export function LoadingState() {
  return (
    <Card className="flex items-center gap-4 p-5">
      <LoaderCircle className="animate-spin text-cyan-400" />
      <div>
        <p className="font-medium">Analyzing submissions…</p>
        <p className="text-sm text-slate-500">Mapping verdicts, tags, and rating buckets.</p>
      </div>
    </Card>
  )
}
export function ProblemTable({ problems, action = 'Upsolve' }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[780px] text-left text-sm">
        <thead>
          <tr className="border-b border-white/[.07] text-xs text-slate-500">
            <th className="px-5 py-4 font-medium">Problem</th>
            <th className="px-4 py-4 font-medium">Rating</th>
            <th className="px-4 py-4 font-medium">Tags</th>
            <th className="px-4 py-4 font-medium">Last verdict</th>
            <th className="px-4 py-4 font-medium">Attempts</th>
            <th className="px-4 py-4 font-medium">Priority</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {problems.map((p) => (
            <tr
              key={p.contest || p.id}
              className="border-b border-white/[.045] last:border-0 hover:bg-white/[.025]"
            >
              <td className="px-5 py-4">
                <p className="font-medium text-slate-200">{p.name}</p>
                <p className="font-mono text-xs text-slate-600">{p.contest || p.id}</p>
              </td>
              <td className="px-4">
                <RatingBadge>{p.rating}</RatingBadge>
              </td>
              <td className="px-4">
                <div className="flex flex-wrap gap-1">
                  {p.tags.map((t) => (
                    <TopicBadge key={t}>{t}</TopicBadge>
                  ))}
                </div>
              </td>
              <td className="px-4">
                <VerdictBadge>{p.verdict || 'Unsolved'}</VerdictBadge>
              </td>
              <td className="px-4 text-slate-400">{p.attempts || '—'}</td>
              <td className="px-4">
                <PriorityBadge>{p.priority || 'Medium'}</PriorityBadge>
              </td>
              <td className="px-4">
                <a href={p.url || undefined} target="_blank" rel="noreferrer">
                  <Button size="sm" variant="secondary" disabled={!p.url}>
                    {action}
                    <ExternalLink size={13} />
                  </Button>
                </a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
export function PracticeDayCard({ item }) {
  return (
    <Card className={`p-5 ${item.done ? 'border-emerald-400/20 bg-emerald-400/[.025]' : ''}`}>
      <div className="flex items-start justify-between">
        <div className="flex gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-xl bg-white/[.06] font-mono text-sm text-cyan-300">
            {item.day}
          </div>
          <div>
            <p className="text-xs text-slate-500">{item.label}</p>
            <h3 className="font-semibold">{item.topic}</h3>
          </div>
        </div>
        <input type="checkbox" defaultChecked={item.done} className="h-5 w-5 accent-cyan-400" />
      </div>
      <p className="mt-4 text-sm text-slate-400">{item.goal}</p>
      <div className="mt-4 flex items-center gap-2">
        <RatingBadge>{item.range}</RatingBadge>
        <Badge>{item.count} problems</Badge>
      </div>
      <p className="mt-4 border-t border-white/[.06] pt-3 text-xs text-slate-600">
        Note · {item.note}
      </p>
    </Card>
  )
}
export function InsightBanner({ children, icon: Icon = Bot }) {
  return (
    <Card className="flex flex-col justify-between gap-5 border-cyan-400/20 bg-gradient-to-r from-cyan-400/[.08] to-violet-500/[.08] p-6 sm:flex-row sm:items-center">
      <div className="flex gap-4">
        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-cyan-400 text-slate-950">
          <Icon size={22} />
        </div>
        <div>
          <p className="font-mono text-[10px] uppercase tracking-widest text-cyan-300">
            AI performance note
          </p>
          <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-300">{children}</p>
        </div>
      </div>
      <ChevronRight className="hidden text-cyan-300 sm:block" />
    </Card>
  )
}
