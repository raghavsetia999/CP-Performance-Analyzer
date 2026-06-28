import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  Award,
  BarChart3,
  CheckCircle2,
  Clock3,
  Code2,
  Flame,
  Info,
  RefreshCw,
  Search,
  Target,
  Trophy,
  Users,
  XCircle,
} from 'lucide-react'
import { Badge, Button, Card, Input, Progress, Select } from '../components/ui'
import {
  AIResponseCard,
  BarChartView,
  ChartCard,
  DonutChart,
  InsightBanner,
  LoadingState,
  ProblemTable,
  RatingBadge,
  SectionHeader,
  StatCard,
  TrendChart,
  VerdictBadge,
  WeaknessCard,
} from '../components/AppComponents'
import {
  problems,
  progressData,
  ratingData,
  recentActivity,
  topicData,
  user,
  verdictData,
} from '../data/mockData'

export function DashboardPage() {
  return (
    <div className="space-y-6">
      <Card className="relative overflow-hidden p-6 sm:p-7">
        <div className="absolute right-0 top-0 h-full w-1/2 bg-gradient-to-l from-cyan-400/[.07] to-transparent" />
        <div className="relative flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
          <div>
            <Badge tone="green">● Synced 6 min ago</Badge>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight">
              Welcome back, {user.handle} <span className="text-slate-600">/</span>
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              You’re 369 points away from your target. Let’s close the gap.
            </p>
          </div>
          <Button>
            <RefreshCw size={16} /> Refresh Codeforces data
          </Button>
        </div>
      </Card>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
        <StatCard label="Total submissions" value="411" icon={Code2} change="+12.8%" />
        <StatCard label="Accepted problems" value="218" icon={CheckCircle2} change="+18 this mo." />
        <StatCard label="Current rating" value="1,231" icon={BarChart3} change="+37" />
        <StatCard label="Max rating" value="1,310" icon={Trophy} caption="Pupil" />
        <StatCard label="Avg attempts / AC" value="1.89" icon={Target} change="-0.16" />
        <StatCard
          label="Unsolved attempts"
          value="14"
          icon={AlertTriangle}
          caption="6 high priority"
        />
      </div>
      <div className="grid gap-4 xl:grid-cols-2">
        <ChartCard title="Topic-wise weakness" subtitle="Higher score means more attention needed">
          <BarChartView data={topicData} dataKey="weakness" nameKey="short" color="#8b5cf6" />
        </ChartCard>
        <ChartCard
          title="Rating-wise success rate"
          subtitle="Accepted problems / attempted problems"
        >
          <BarChartView data={ratingData} />
        </ChartCard>
        <ChartCard title="Verdict distribution" subtitle="Last 411 submissions">
          <DonutChart data={verdictData} />
        </ChartCard>
        <ChartCard title="Solved vs. attempted" subtitle="Six-month submission trend">
          <TrendChart data={progressData} dataKey="solved" secondary="attempted" />
        </ChartCard>
      </div>
      <InsightBanner>
        Your biggest current weakness is{' '}
        <strong className="text-white">Dynamic Programming in the 1300–1500 range</strong>. Your
        solve rate drops to 38% there, and 7 previously attempted problems remain unsolved. Start
        with a 3-problem transition-pattern drill.
      </InsightBanner>
      <Card>
        <div className="p-5">
          <SectionHeader
            title="Recent activity"
            description="Your latest Codeforces submissions"
            action={
              <Button variant="ghost" size="sm">
                View all <ArrowRight size={14} />
              </Button>
            }
          />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[650px] text-left text-sm">
            <thead>
              <tr className="border-y border-white/[.06] text-xs text-slate-500">
                <th className="px-5 py-3 font-medium">Problem</th>
                <th className="px-4 font-medium">Rating</th>
                <th className="px-4 font-medium">Verdict</th>
                <th className="px-4 font-medium">Submitted</th>
              </tr>
            </thead>
            <tbody>
              {recentActivity.map((x) => (
                <tr key={x.id} className="border-b border-white/[.04] last:border-0">
                  <td className="px-5 py-4">
                    <p className="font-medium">{x.problem}</p>
                    <p className="font-mono text-xs text-slate-600">{x.id}</p>
                  </td>
                  <td className="px-4">
                    <RatingBadge>{x.rating}</RatingBadge>
                  </td>
                  <td className="px-4">
                    <VerdictBadge>{x.verdict}</VerdictBadge>
                  </td>
                  <td className="px-4 text-slate-500">{x.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}

export function AnalyzeHandlePage() {
  const [state, setState] = useState('idle')
  const [handle, setHandle] = useState('raghav_setia')
  function analyze() {
    if (!handle.trim() || handle.toLowerCase().includes('invalid')) {
      setState('error')
      return
    }
    setState('loading')
    setTimeout(() => setState('done'), 900)
  }
  function chooseHandle(value) {
    setHandle(value)
    setState('idle')
  }
  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="Public profile analysis"
        title="Analyze any Codeforces handle"
        description="Pull a public submission history and turn it into a performance snapshot."
      />
      <Card className="p-6">
        <div className="mx-auto max-w-2xl">
          <label htmlFor="handle" className="text-sm font-medium">
            Codeforces handle
          </label>
          <div className="mt-2 flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search
                size={17}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-600"
              />
              <Input
                id="handle"
                value={handle}
                onChange={(e) => {
                  setHandle(e.target.value)
                  setState('idle')
                }}
                onKeyDown={(e) => e.key === 'Enter' && analyze()}
                className="pl-10"
                aria-invalid={state === 'error'}
              />
            </div>
            <Button onClick={analyze} disabled={state === 'loading'}>
              <BarChart3 size={16} /> {state === 'loading' ? 'Analyzing…' : 'Analyze handle'}
            </Button>
          </div>
          <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-600">
            Try:{' '}
            {['tourist', 'Benq', 'Um_nik'].map((x) => (
              <button
                key={x}
                onClick={() => chooseHandle(x)}
                className="text-slate-400 transition hover:text-cyan-300"
              >
                {x}
              </button>
            ))}
          </div>
        </div>
      </Card>
      {state === 'loading' && <LoadingState />}
      {state === 'error' && (
        <Card className="flex gap-4 border-rose-400/20 bg-rose-400/[.04] p-5">
          <XCircle className="shrink-0 text-rose-300" />
          <div>
            <h3 className="font-semibold text-rose-200">Handle not found</h3>
            <p className="mt-1 text-sm text-slate-500">
              Check the spelling and try again. Codeforces handles are case-sensitive.
            </p>
          </div>
        </Card>
      )}
      {state === 'idle' && (
        <Card className="dot-grid grid min-h-64 place-items-center p-8 text-center">
          <div>
            <Search className="mx-auto mb-4 text-slate-700" size={36} />
            <h3 className="font-semibold">Ready when you are</h3>
            <p className="mt-2 text-sm text-slate-500">
              Enter a handle to generate a public performance snapshot.
            </p>
          </div>
        </Card>
      )}
      {state === 'done' && (
        <>
          <Card className="overflow-hidden">
            <div className="border-b border-white/[.06] bg-gradient-to-r from-cyan-400/[.08] to-violet-400/[.06] p-6">
              <div className="flex items-center gap-4">
                <div className="grid h-14 w-14 place-items-center rounded-2xl bg-cyan-400 font-mono text-xl font-bold text-slate-950">
                  {handle.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-xl font-semibold">{handle}</h2>
                    <Badge tone="green">Valid handle</Badge>
                  </div>
                  <p className="mt-1 text-sm text-slate-500">{user.rank} · India</p>
                </div>
              </div>
            </div>
            <div className="grid gap-px bg-white/[.05] sm:grid-cols-3 lg:grid-cols-6">
              {[
                ['Handle', handle],
                ['Rank', user.rank],
                ['Rating', user.rating],
                ['Max rating', user.maxRating],
                ['Contribution', `+${user.contribution}`],
                ['Friends', user.friends],
              ].map(([l, v]) => (
                <div key={l} className="bg-[#0e131d] p-5">
                  <p className="text-xs text-slate-600">{l}</p>
                  <p className="mt-1 font-semibold">{v}</p>
                </div>
              ))}
            </div>
          </Card>
          <InsightBanner>
            We found <strong className="text-white">411 submissions across 332 problems</strong>. DP
            and graphs are the clearest improvement opportunities, especially above 1300 rating.
          </InsightBanner>
          <div className="flex justify-end">
            <Link to="/report/latest">
              <Button>
                Open full report <ArrowRight size={16} />
              </Button>
            </Link>
          </div>
        </>
      )}
    </div>
  )
}

export function WeaknessReportPage() {
  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="Performance diagnosis"
        title="Weakness report"
        description="Topics ranked by friction, recency, and conversion rate."
        action={<Badge tone="amber">Overall score · 68 / 100</Badge>}
      />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {topicData.map((x) => (
          <WeaknessCard key={x.topic} item={x} />
        ))}
      </div>
      <div className="grid gap-4 xl:grid-cols-[1.35fr_1fr]">
        <ChartCard title="Weakness score by topic" subtitle="Composite score from 0–100">
          <BarChartView data={topicData} dataKey="weakness" nameKey="short" color="#fb7185" />
        </ChartCard>
        <Card className="p-6">
          <div className="flex gap-3">
            <Info className="shrink-0 text-cyan-300" size={20} />
            <div>
              <h3 className="font-semibold">How the score works</h3>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Weakness score combines verdict frequency, failed attempts, solved ratio, problem
                difficulty, recency, and unsolved attempted problems.
              </p>
            </div>
          </div>
          <div className="mt-6 space-y-4">
            {[
              ['Solve conversion', 35],
              ['Failed attempts', 25],
              ['Difficulty gap', 20],
              ['Recency', 12],
              ['Abandoned problems', 8],
            ].map(([x, v]) => (
              <div key={x}>
                <div className="mb-1 flex justify-between text-xs">
                  <span className="text-slate-500">{x}</span>
                  <span>{v}%</span>
                </div>
                <Progress value={v * 2} />
              </div>
            ))}
          </div>
        </Card>
      </div>
      <Card>
        <div className="p-5">
          <SectionHeader
            title="Topic detail"
            description="Sort and compare the signals behind each score"
            action={
              <Select>
                <option>Sort: Weakest first</option>
                <option>Lowest AC rate</option>
              </Select>
            }
          />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px] text-left text-sm">
            <thead>
              <tr className="border-y border-white/[.06] text-xs text-slate-500">
                {[
                  'Topic',
                  'Attempted',
                  'Solved',
                  'Failed attempts',
                  'AC rate',
                  'Weakness',
                  'Last practiced',
                ].map((h) => (
                  <th key={h} className="px-5 py-3 font-medium">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {topicData.map((x) => (
                <tr key={x.topic} className="border-b border-white/[.04] last:border-0">
                  <td className="px-5 py-4 font-medium">{x.topic}</td>
                  <td className="px-5 text-slate-400">{x.attempted}</td>
                  <td className="px-5 text-slate-400">{x.solved}</td>
                  <td className="px-5 text-slate-400">{x.failed}</td>
                  <td className="px-5">
                    <span className={x.rate < 55 ? 'text-rose-300' : 'text-slate-300'}>
                      {x.rate}%
                    </span>
                  </td>
                  <td className="px-5">
                    <Badge tone={x.weakness > 70 ? 'red' : x.weakness > 50 ? 'amber' : 'green'}>
                      {x.weakness}
                    </Badge>
                  </td>
                  <td className="px-5 text-slate-500">{x.last}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}

export function RatingAnalysisPage() {
  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="Difficulty curve"
        title="Rating analysis"
        description="Find the exact rating band where confidence turns into friction."
      />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {ratingData.map((x, i) => (
          <Card key={x.bucket} className={`p-5 ${i === 3 ? 'border-amber-400/20' : ''}`}>
            <div className="flex justify-between">
              <RatingBadge>{x.bucket}</RatingBadge>
              {i === 3 && <Badge tone="amber">Gap</Badge>}
            </div>
            <p className="mt-5 text-3xl font-semibold">{x.rate}%</p>
            <p className="text-xs text-slate-600">success rate</p>
            <Progress value={x.rate} className="my-4" />
            <div className="flex justify-between text-xs text-slate-500">
              <span>
                {x.solved}/{x.attempted} solved
              </span>
              <span>{x.avg} attempts</span>
            </div>
          </Card>
        ))}
      </div>
      <InsightBanner icon={Target}>
        You’re comfortable through <strong className="text-white">1200</strong>, but success falls
        sharply after <strong className="text-white">1400</strong>. Build volume in 1300–1400 before
        pushing harder into 1500.
      </InsightBanner>
      <div className="grid gap-4 xl:grid-cols-2">
        <ChartCard title="Success rate by rating bucket">
          <BarChartView data={ratingData} />
        </ChartCard>
        <ChartCard title="Rating progress over time" subtitle="Current 1,231 · Peak 1,310">
          <TrendChart data={progressData} />
        </ChartCard>
      </div>
    </div>
  )
}

export function VerdictAnalysisPage() {
  const total = verdictData.reduce((a, b) => a + b.value, 0)
  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="Failure patterns"
        title="Verdict analysis"
        description="Understand why submissions fail—not just how often."
      />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Most common failure"
          value="Wrong answer"
          icon={XCircle}
          caption="31% of submissions"
        />
        <StatCard label="Wrong attempts before AC" value="1.84" icon={RefreshCw} change="-0.13" />
        <StatCard
          label="TLE-heavy topics"
          value="DP · Graphs"
          icon={Clock3}
          caption="21 of 34 TLEs"
        />
        <StatCard
          label="WA-heavy topics"
          value="Greedy · BS"
          icon={AlertTriangle}
          caption="57 of 126 WAs"
        />
      </div>
      <div className="grid gap-4 xl:grid-cols-[.85fr_1.15fr]">
        <ChartCard title="Verdict distribution" subtitle={`${total} total submissions`}>
          <DonutChart data={verdictData} />
        </ChartCard>
        <Card>
          <div className="p-5">
            <h3 className="font-semibold">Verdict breakdown</h3>
            <p className="mt-1 text-xs text-slate-500">Primary topic affected by each verdict</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-left text-sm">
              <thead>
                <tr className="border-y border-white/[.06] text-xs text-slate-500">
                  <th className="px-5 py-3">Verdict</th>
                  <th className="px-5">Count</th>
                  <th className="px-5">Percentage</th>
                  <th className="px-5">Most affected</th>
                </tr>
              </thead>
              <tbody>
                {verdictData.map((v, i) => (
                  <tr key={v.name} className="border-b border-white/[.04] last:border-0">
                    <td className="px-5 py-4">
                      <VerdictBadge>{v.name}</VerdictBadge>
                    </td>
                    <td className="px-5 font-mono">{v.value}</td>
                    <td className="px-5 text-slate-400">{Math.round((v.value / total) * 100)}%</td>
                    <td className="px-5 text-slate-400">
                      {['Greedy', 'Greedy', 'DP', 'Implementation', 'Graphs'][i]}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
      <InsightBanner icon={Clock3}>
        Most of your TLEs occur in <strong className="text-white">DP and graph problems</strong>.
        The pattern suggests complexity estimation and redundant state exploration are the main
        causes.
      </InsightBanner>
    </div>
  )
}
