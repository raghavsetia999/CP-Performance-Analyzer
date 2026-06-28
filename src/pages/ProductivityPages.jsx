import React, { useState } from 'react'
import {
  Activity,
  ArrowRight,
  Bot,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronRight,
  CircleUser,
  Clock3,
  CodeXml,
  Download,
  ExternalLink,
  FileText,
  Flame,
  Link2,
  Lock,
  MessageSquare,
  MoreHorizontal,
  RefreshCw,
  Save,
  Send,
  Shield,
  Sparkles,
  Target,
  Trash2,
  TrendingDown,
  TrendingUp,
  Trophy,
  User,
  Zap,
} from 'lucide-react'
import {
  AIResponseCard,
  BarChartView,
  ChartCard,
  DonutChart,
  InsightBanner,
  PracticeDayCard,
  ProblemTable,
  RatingBadge,
  SectionHeader,
  StatCard,
  TopicBadge,
  TrendChart,
} from '../components/AppComponents'
import {
  Avatar,
  Badge,
  Button,
  Card,
  Input,
  Label,
  Progress,
  Select,
  Switch,
} from '../components/ui'
import {
  practicePlan,
  problems,
  progressData,
  recommendations,
  topicData,
  user,
  verdictData,
} from '../data/mockData'

const Filters = () => (
  <div className="flex flex-wrap gap-2">
    <Select>
      <option>All topics</option>
      <option>Dynamic Programming</option>
      <option>Graphs</option>
    </Select>
    <Select>
      <option>All ratings</option>
      <option>1200–1400</option>
      <option>1400–1600</option>
    </Select>
    <Select>
      <option>All verdicts</option>
      <option>Wrong answer</option>
      <option>Time limit</option>
    </Select>
    <Select>
      <option>All contests</option>
      <option>Div. 2</option>
      <option>Div. 3</option>
    </Select>
  </div>
)
export function UpsolvingPage() {
  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="Turn failures into reps"
        title="Upsolving queue"
        description="Unsolved contest attempts ranked by learning value and urgency."
        action={
          <Button>
            <RefreshCw size={15} /> Refresh queue
          </Button>
        }
      />
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Waiting to upsolve" value="14" icon={Target} caption="6 high priority" />
        <StatCard label="Upsolved this month" value="11" icon={CheckCircle2} change="+37%" />
        <StatCard label="Average recovery time" value="3.2 days" icon={Clock3} change="-0.8 day" />
      </div>
      <Card>
        <div className="flex flex-col justify-between gap-4 p-5 lg:flex-row lg:items-center">
          <div>
            <h3 className="font-semibold">Unsolved attempted problems</h3>
            <p className="mt-1 text-xs text-slate-500">
              Problems you submitted during a contest but never solved
            </p>
          </div>
          <Filters />
        </div>
        <ProblemTable problems={problems} />
      </Card>
      <Card className="p-6">
        <SectionHeader
          title="Recommended upsolving order"
          description="An efficient sequence based on dependencies and expected learning gain"
        />
        <div className="grid gap-3 lg:grid-cols-3">
          {problems.slice(0, 3).map((p, i) => (
            <div
              key={p.contest}
              className="flex gap-4 rounded-xl border border-white/[.06] bg-black/15 p-4"
            >
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-cyan-400/10 font-mono text-cyan-300">
                0{i + 1}
              </span>
              <div>
                <p className="text-sm font-medium">{p.name}</p>
                <p className="mt-1 text-xs text-slate-600">
                  {p.contest} · {p.rating}
                </p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}

const prompts = [
  'Create a 7-day upsolving plan',
  'Explain why I am weak in DP',
  'Suggest problems for 1300–1500',
  'How should I improve contest performance?',
]
export function AICoachPage() {
  const [msg, setMsg] = useState('')
  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="Your personal CP strategist"
        title="AI performance coach"
        description="Grounded in your submission history—not generic advice."
        action={<Badge tone="green">● Context synced</Badge>}
      />
      <div className="grid gap-4 xl:grid-cols-[320px_1fr]">
        <div className="space-y-4">
          <Card className="p-5">
            <div className="flex items-center gap-3">
              <Avatar />
              <div>
                <p className="font-semibold">{user.handle}</p>
                <p className="text-xs text-slate-500">Performance context</p>
              </div>
            </div>
            <div className="mt-5 space-y-4">
              {[
                ['Current rating', '1,231'],
                ['Target rating', '1,600'],
                ['Weekly time', '7 hours'],
                ['Problems solved', '218'],
              ].map(([l, v]) => (
                <div key={l} className="flex justify-between text-sm">
                  <span className="text-slate-500">{l}</span>
                  <span className="font-medium">{v}</span>
                </div>
              ))}
            </div>
            <div className="mt-5 rounded-xl bg-rose-400/[.06] p-4">
              <p className="text-xs text-slate-500">Top weakness</p>
              <p className="mt-1 font-medium text-rose-300">Dynamic Programming</p>
              <Progress value={88} className="mt-3 [&>div]:from-rose-400 [&>div]:to-amber-400" />
            </div>
          </Card>
          <Card className="p-5">
            <p className="text-sm font-semibold">Suggested prompts</p>
            <div className="mt-3 space-y-2">
              {prompts.map((p) => (
                <button
                  key={p}
                  onClick={() => setMsg(p)}
                  className="w-full rounded-xl border border-white/[.06] p-3 text-left text-xs leading-5 text-slate-400 transition hover:border-cyan-400/20 hover:text-white"
                >
                  {p}
                  <ChevronRight size={13} className="float-right mt-1" />
                </button>
              ))}
            </div>
          </Card>
        </div>
        <Card className="flex min-h-[680px] flex-col overflow-hidden">
          <div className="flex items-center gap-3 border-b border-white/[.06] p-5">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-cyan-400 to-violet-500 text-slate-950">
              <Bot />
            </div>
            <div>
              <p className="font-semibold">CP Pulse Coach</p>
              <p className="text-xs text-emerald-400">● Ready with your latest data</p>
            </div>
          </div>
          <div className="flex-1 space-y-5 overflow-y-auto p-5 sm:p-7">
            <div className="flex max-w-xl gap-3">
              <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-violet-400/10 text-violet-300">
                <Sparkles size={16} />
              </div>
              <div className="rounded-2xl rounded-tl-sm bg-white/[.045] p-4 text-sm leading-6 text-slate-300">
                I’ve reviewed your latest 411 submissions. Your clearest opportunity is reducing
                repeated wrong attempts in DP and graphs. Here’s the focused picture:
              </div>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <AIResponseCard title="Why DP feels difficult">
                You often identify the right recurrence but lose accuracy in state definition and
                base cases. This causes 2.8 wrong attempts per accepted DP problem.
              </AIResponseCard>
              <AIResponseCard title="Revision focus">
                Revisit 1D transitions, prefix-state optimization, and recognizing when greedy state
                compression is valid.
              </AIResponseCard>
              <AIResponseCard title="7-day direction">
                Alternate targeted topic drills with two timed mixed sets. Keep Friday for upsolving
                your three highest-priority failures.
              </AIResponseCard>
              <AIResponseCard title="Starting problems">
                Begin with Boredom (455A), Vacations (699C), and Flowers (474D), in that order.
              </AIResponseCard>
            </div>
          </div>
          <div className="border-t border-white/[.06] p-4">
            <div className="flex gap-2">
              <Input
                value={msg}
                onChange={(e) => setMsg(e.target.value)}
                placeholder="Ask about your performance or request a plan…"
              />
              <Button size="icon">
                <Send size={17} />
              </Button>
            </div>
            <p className="mt-2 text-center text-[10px] text-slate-700">
              Advice is generated from mock performance data in this demo.
            </p>
          </div>
        </Card>
      </div>
    </div>
  )
}

export function PracticePlanPage() {
  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="Week of June 29"
        title="Your 7-day practice plan"
        description="One focused hour per day, shaped around your highest-leverage gaps."
        action={
          <div className="flex gap-2">
            <Button variant="secondary">
              <RefreshCw size={15} /> Regenerate
            </Button>
            <Button>
              <Check size={15} /> Mark week complete
            </Button>
          </div>
        }
      />
      <Card className="p-5">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <p className="text-sm font-semibold">Weekly progress</p>
            <p className="mt-1 text-xs text-slate-500">
              2 of 7 daily goals completed · 7 of 25 problems solved
            </p>
          </div>
          <span className="font-mono text-2xl font-semibold text-cyan-300">28%</span>
        </div>
        <Progress value={28} className="mt-4 h-3" />
      </Card>
      <div className="flex justify-end gap-2">
        <Button size="sm" variant="secondary">
          <CalendarDays size={14} /> Calendar
        </Button>
        <Button size="sm" variant="ghost">
          Cards
        </Button>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {practicePlan.map((x) => (
          <PracticeDayCard key={x.day} item={x} />
        ))}
      </div>
      <InsightBanner>
        Keep the plan deliberately narrow. The goal this week is not raw volume—it is proving you
        can define DP states cleanly and convert 1300–1400 problems with fewer retries.
      </InsightBanner>
    </div>
  )
}

export function RecommendationsPage() {
  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="Curated for your gaps"
        title="Problem recommendations"
        description="No random ladders. Every recommendation has a reason."
        action={
          <Button>
            <Sparkles size={15} /> Refresh picks
          </Button>
        }
      />
      <Card className="p-5">
        <Filters />
      </Card>
      <div className="grid gap-4 lg:grid-cols-2">
        {recommendations.map((p, i) => (
          <Card
            key={p.id}
            className="group p-5 transition hover:-translate-y-0.5 hover:border-cyan-400/20"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-xs text-slate-600">{p.id}</span>
                  {i < 2 && <Badge tone="cyan">Best match</Badge>}
                </div>
                <h3 className="mt-2 text-lg font-semibold">{p.name}</h3>
              </div>
              <RatingBadge>{p.rating}</RatingBadge>
            </div>
            <div className="mt-3 flex flex-wrap gap-1">
              {p.tags.map((t) => (
                <TopicBadge key={t}>{t}</TopicBadge>
              ))}
            </div>
            <div className="mt-5 rounded-xl bg-white/[.025] p-4">
              <p className="text-[10px] uppercase tracking-wider text-slate-600">
                Why this problem
              </p>
              <p className="mt-1 text-sm leading-6 text-slate-400">{p.reason}</p>
            </div>
            <Button variant="secondary" size="sm" className="mt-4">
              Solve on Codeforces <ExternalLink size={13} />
            </Button>
          </Card>
        ))}
      </div>
    </div>
  )
}

export function ProgressPage() {
  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="Momentum over time"
        title="Progress tracking"
        description="The trends that matter after the contest ends."
        action={
          <Select>
            <option>Last 6 months</option>
            <option>Last year</option>
          </Select>
        }
      />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard label="Solved this week" value="12" icon={CheckCircle2} change="+4" />
        <StatCard label="Current AC rate" value="75%" icon={Target} change="+6%" />
        <StatCard label="Rating gained" value="+133" icon={TrendingUp} change="12.1%" />
        <StatCard label="Problems upsolved" value="37" icon={RefreshCw} change="+11" />
        <StatCard label="Current streak" value="9 days" icon={Flame} caption="Personal best · 14" />
      </div>
      <div className="grid gap-4 xl:grid-cols-2">
        <ChartCard title="Weekly solved count" subtitle="Solved and attempted">
          <TrendChart data={progressData} dataKey="solved" secondary="attempted" />
        </ChartCard>
        <ChartCard title="Rating progression" subtitle="Six-month change">
          <TrendChart data={progressData} dataKey="rating" />
        </ChartCard>
        <ChartCard title="AC rate trend">
          <TrendChart data={progressData} dataKey="ac" />
        </ChartCard>
        <ChartCard title="Weakness score trend" subtitle="Lower is better">
          <TrendChart data={progressData} dataKey="weakness" />
        </ChartCard>
      </div>
      <Card className="p-6">
        <SectionHeader
          title="Before vs. now"
          description="Your improvement since starting focused practice"
        />
        <div className="grid items-center gap-6 md:grid-cols-[1fr_auto_1fr_auto_1fr]">
          <Metric label="Previous weakness" value="78" sub="January" />
          <ArrowRight className="hidden text-slate-700 md:block" />
          <Metric label="Current weakness" value="49" sub="June" accent />
          <ArrowRight className="hidden text-slate-700 md:block" />
          <Metric label="Improvement" value="37.2%" sub="29 points lower" positive />
        </div>
      </Card>
    </div>
  )
}
function Metric({ label, value, sub, accent, positive }) {
  return (
    <div className="rounded-2xl bg-black/20 p-6 text-center">
      <p className="text-xs text-slate-600">{label}</p>
      <p
        className={`mt-2 text-4xl font-semibold ${accent ? 'text-cyan-300' : positive ? 'text-emerald-300' : ''}`}
      >
        {value}
      </p>
      <p className="mt-1 text-xs text-slate-600">{sub}</p>
    </div>
  )
}

export function ProfilePage() {
  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="Account"
        title="Profile"
        description="Your competitive programming identity and account history."
        action={
          <Button variant="secondary">
            <User size={15} /> Edit profile
          </Button>
        }
      />
      <Card className="overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-cyan-400/20 via-violet-500/15 to-transparent" />
        <div className="px-6 pb-6">
          <div className="-mt-10 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div className="flex items-end gap-4">
              <Avatar className="h-20 w-20 rounded-2xl border-4 border-[#0e131d] text-xl" />
              <div className="pb-1">
                <h2 className="text-xl font-semibold">{user.name}</h2>
                <p className="text-sm text-slate-500">@{user.handle}</p>
              </div>
            </div>
            <Badge tone="green">● Codeforces connected</Badge>
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {[
              ['Email', user.email],
              ['Current rating', user.rating],
              ['Target rating', user.target],
              ['Practice time', '60 min / day'],
              ['Member since', 'Jan 2026'],
            ].map(([l, v]) => (
              <div key={l} className="rounded-xl bg-black/20 p-4">
                <p className="text-xs text-slate-600">{l}</p>
                <p className="mt-1 text-sm font-medium">{v}</p>
              </div>
            ))}
          </div>
        </div>
      </Card>
      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="p-6">
          <SectionHeader title="Connected accounts" />
          <div className="space-y-3">
            <Connected icon={Zap} name="Codeforces" value="raghav_setia" active />
            <Connected icon={CodeXml} name="GitHub" value="Not connected" />
          </div>
        </Card>
        <Card className="p-6">
          <SectionHeader
            title="Recent reports"
            action={
              <Button size="sm" variant="ghost">
                View all
              </Button>
            }
          />
          <div className="space-y-2">
            {[
              'Weekly performance · Jun 24',
              'Full analysis · Jun 17',
              'Rating gap report · Jun 02',
            ].map((x, i) => (
              <div
                key={x}
                className="flex items-center justify-between rounded-xl p-3 hover:bg-white/[.03]"
              >
                <div className="flex items-center gap-3">
                  <FileText size={17} className="text-slate-600" />
                  <div>
                    <p className="text-sm">{x}</p>
                    <p className="text-xs text-slate-600">
                      {i === 0 ? '4 days ago' : i === 1 ? '11 days ago' : '26 days ago'}
                    </p>
                  </div>
                </div>
                <ChevronRight size={15} className="text-slate-700" />
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}
function Connected({ icon: Icon, name, value, active }) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-white/[.06] p-4">
      <div className="flex items-center gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-xl bg-white/[.04]">
          <Icon size={18} />
        </span>
        <div>
          <p className="text-sm font-medium">{name}</p>
          <p className="text-xs text-slate-600">{value}</p>
        </div>
      </div>
      <Button variant={active ? 'ghost' : 'secondary'} size="sm">
        {active ? 'Manage' : 'Connect'}
      </Button>
    </div>
  )
}

const settingsTabs = [
  'Account',
  'Codeforces',
  'Appearance',
  'Notifications',
  'AI Coach',
  'Data Refresh',
]
export function SettingsPage() {
  const [tab, setTab] = useState('Account')
  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="Preferences"
        title="Settings"
        description="Tune CP Pulse to match the way you practice."
      />
      <div className="grid gap-5 lg:grid-cols-[230px_1fr]">
        <Card className="h-fit p-2">
          {settingsTabs.map((x) => (
            <button
              key={x}
              onClick={() => setTab(x)}
              className={`w-full rounded-xl px-4 py-3 text-left text-sm transition ${tab === x ? 'bg-cyan-400/10 text-cyan-300' : 'text-slate-500 hover:bg-white/[.035]'}`}
            >
              {x}
            </button>
          ))}
        </Card>
        <div className="space-y-4">
          <Card className="p-6">
            <SectionHeader
              title={`${tab} settings`}
              description={
                tab === 'Account'
                  ? 'Manage your core identity and security.'
                  : 'Choose how this part of your workspace behaves.'
              }
            />
            {tab === 'Account' ? (
              <div className="grid gap-5 sm:grid-cols-2">
                <SettingField label="Full name" value={user.name} />
                <SettingField label="Email address" value={user.email} />
                <SettingField label="New password" value="••••••••" type="password" />
                <SettingField label="Confirm password" value="••••••••" type="password" />
                <div className="sm:col-span-2">
                  <Button>Save changes</Button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {getSettings(tab).map(([title, desc, active]) => (
                  <div
                    key={title}
                    className="flex items-center justify-between gap-5 rounded-xl border border-white/[.06] p-4"
                  >
                    <div>
                      <p className="text-sm font-medium">{title}</p>
                      <p className="mt-1 text-xs text-slate-600">{desc}</p>
                    </div>
                    <Switch active={active} />
                  </div>
                ))}
                <Button className="mt-3">Save preferences</Button>
              </div>
            )}
          </Card>
          {tab === 'Account' && (
            <Card className="border-rose-500/20 p-6">
              <h3 className="font-semibold text-rose-300">Danger zone</h3>
              <p className="mt-2 text-sm text-slate-500">
                Permanently delete your account and all generated reports.
              </p>
              <Button variant="danger" className="mt-5">
                <Trash2 size={15} /> Delete account
              </Button>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
function SettingField({ label, value, type = 'text' }) {
  return (
    <div>
      <Label>{label}</Label>
      <Input defaultValue={value} type={type} />
    </div>
  )
}
function getSettings(tab) {
  const map = {
    Codeforces: [
      ['Automatic handle sync', 'Keep your handle profile up to date.', true],
      ['Include gym submissions', 'Use gym contests in performance analysis.', false],
    ],
    Appearance: [
      ['Dark theme', 'Use the low-light analytics theme.', true],
      ['Compact charts', 'Reduce chart height on smaller screens.', false],
    ],
    Notifications: [
      ['Weekly report', 'Receive a weekly improvement summary.', true],
      ['Streak reminders', 'Get notified before a streak expires.', true],
      ['Contest reminder', 'Remind me about upcoming Codeforces rounds.', false],
    ],
    'AI Coach': [
      ['Detailed explanations', 'Include reasoning behind each recommendation.', true],
      ['Aggressive roadmap', 'Prioritize faster rating growth over breadth.', false],
    ],
    'Data Refresh': [
      ['Refresh after contests', 'Sync automatically when a round ends.', true],
      ['Daily background refresh', 'Fetch new submissions once a day.', false],
    ],
  }
  return map[tab] || []
}

export function ReportDetailsPage() {
  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="Generated June 28, 2026 · 14:32 IST"
        title="Full performance report"
        description="A complete snapshot of raghav_setia based on 411 submissions."
        action={
          <div className="flex gap-2">
            <Button variant="secondary">
              <Save size={15} /> Save
            </Button>
            <Button>
              <Download size={15} /> Export PDF
            </Button>
          </div>
        }
      />
      <InsightBanner>
        Your performance is trending upward, with a 12.1% rating gain over six months. The strongest
        path to 1600 is improving DP modeling and increasing conversion in the 1400–1600 band.
      </InsightBanner>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Performance score" value="72 / 100" icon={Trophy} change="+8" />
        <StatCard label="Weakness score" value="49 / 100" icon={TrendingDown} change="-29" />
        <StatCard label="Current rating" value="1,231" icon={Activity} change="+133" />
        <StatCard label="Target gap" value="369" icon={Target} caption="To Expert" />
      </div>
      <div className="grid gap-4 xl:grid-cols-2">
        <ChartCard title="Weak topic analysis">
          <BarChartView data={topicData} dataKey="weakness" nameKey="short" color="#fb7185" />
        </ChartCard>
        <ChartCard title="Rating gap analysis">
          <TrendChart data={progressData} dataKey="rating" />
        </ChartCard>
        <ChartCard title="Verdict analysis">
          <DonutChart data={verdictData} />
        </ChartCard>
        <AIResponseCard title="AI recommendation summary">
          Spend the next two weeks on DP state definition and graph modeling at 1300–1500. Upsolve
          the top six failed contest problems before adding new high-difficulty material. Keep one
          weekly virtual contest to test transfer under time pressure.
        </AIResponseCard>
      </div>
      <Card>
        <div className="p-5">
          <SectionHeader
            title="Upsolving priority"
            description="Highest-learning-value unsolved attempts"
          />
        </div>
        <ProblemTable problems={problems.slice(0, 3)} />
      </Card>
    </div>
  )
}
