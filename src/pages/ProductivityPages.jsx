import React, { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  Activity,
  CheckCircle2,
  ChevronRight,
  Clock3,
  CodeXml,
  Download,
  ExternalLink,
  FileText,
  RefreshCw,
  Save,
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
import { useAnalytics } from '../context/AnalyticsContext'
import { useAuth } from '../context/AuthContext'
import { getApiErrorMessage } from '../services/apiClient'
import { progressApi } from '../services/progressApi'
import { reportApi } from '../services/reportApi'
import { userApi } from '../services/userApi'

function DataState({ loading, error, onRetry }) {
  if (loading) {
    return <Card className="p-8 text-center text-sm text-slate-500">Loading live analytics…</Card>
  }
  return (
    <Card className="border-rose-400/20 bg-rose-400/[.04] p-6">
      <p className="text-sm text-rose-200">{error || 'No data is available yet.'}</p>
      {onRetry && (
        <Button className="mt-4" size="sm" onClick={() => onRetry()}>
          Retry
        </Button>
      )}
    </Card>
  )
}

function displayVerdict(verdict) {
  return (
    {
      WRONG_ANSWER: 'Wrong answer',
      TIME_LIMIT_EXCEEDED: 'Time limit',
      RUNTIME_ERROR: 'Runtime error',
      COMPILATION_ERROR: 'Compilation error',
      MEMORY_LIMIT_EXCEEDED: 'Memory limit',
    }[verdict] || String(verdict || 'Unknown').replaceAll('_', ' ')
  )
}

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
  const { report, loading, error, refresh } = useAnalytics()
  if (!report) return <DataState loading={loading} error={error} onRetry={refresh} />
  const queue = report.upsolvingAnalysis.map((problem) => ({
    ...problem,
    verdict: displayVerdict(problem.lastVerdict),
  }))
  const highPriority = queue.filter((problem) => problem.priorityLevel === 'High').length
  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="Turn failures into reps"
        title="Upsolving queue"
        description="Unsolved contest attempts ranked by learning value and urgency."
        action={
          <Button onClick={() => refresh(undefined, { refresh: true })}>
            <RefreshCw size={15} /> Refresh queue
          </Button>
        }
      />
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Waiting to upsolve"
          value={queue.length}
          icon={Target}
          caption={`${highPriority} high priority`}
        />
        <StatCard
          label="Repeated failures"
          value={queue.filter((problem) => problem.attempts >= 3).length}
          icon={RefreshCw}
          caption="Three or more attempts"
        />
        <StatCard
          label="Top priority score"
          value={queue[0]?.priorityScore || 0}
          icon={Clock3}
          caption="Out of 100"
        />
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
        <ProblemTable problems={queue} />
      </Card>
      <Card className="p-6">
        <SectionHeader
          title="Recommended upsolving order"
          description="An efficient sequence based on dependencies and expected learning gain"
        />
        <div className="grid gap-3 lg:grid-cols-3">
          {queue.slice(0, 3).map((p, i) => (
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

export function RecommendationsPage() {
  const { report, loading, error, refresh } = useAnalytics()
  if (!report) return <DataState loading={loading} error={error} onRetry={refresh} />
  const recommendation = report.recommendations
  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="Curated for your gaps"
        title="Problem recommendations"
        description="No random ladders. Every recommendation has a reason."
        action={
          <Button onClick={() => refresh(undefined, { refresh: true })}>
            <Sparkles size={15} /> Refresh picks
          </Button>
        }
      />
      <Card className="p-5">
        <Filters />
        <div className="mt-4 flex flex-wrap gap-2">
          {recommendation.focusTopics.map((topic) => (
            <Badge key={topic.topic} tone="cyan">
              Focus · {topic.topic}
            </Badge>
          ))}
          <Badge tone="amber">Range · {recommendation.recommendedRatingRange.bucket}</Badge>
        </div>
      </Card>
      <div className="grid gap-4 lg:grid-cols-2">
        {recommendation.recommendedProblems.map((p, i) => (
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
            <a href={p.url || undefined} target="_blank" rel="noreferrer">
              <Button variant="secondary" size="sm" className="mt-4">
                Solve on Codeforces <ExternalLink size={13} />
              </Button>
            </a>
          </Card>
        ))}
      </div>
    </div>
  )
}

export function ProgressPage() {
  const { user: account } = useAuth()
  const [progress, setProgress] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  async function loadProgress() {
    if (!account?.codeforcesHandle) {
      setError('Add a Codeforces handle before viewing progress.')
      setLoading(false)
      return
    }
    setLoading(true)
    setError('')
    try {
      setProgress(await progressApi.get(account.codeforcesHandle))
    } catch (requestError) {
      setError(getApiErrorMessage(requestError))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadProgress()
    // Reload when the tracked handle changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [account?.codeforcesHandle])

  if (!progress) return <DataState loading={loading} error={error} onRetry={loadProgress} />

  if (!progress.hasEnoughData) {
    return (
      <div className="space-y-6">
        <SectionHeader
          eyebrow="Momentum over time"
          title="Progress tracking"
          description="Save at least two reports to compare real performance snapshots."
        />
        <Card className="p-8 text-center">
          <p className="text-3xl font-semibold text-cyan-300">{progress.reportCount}</p>
          <p className="mt-2 text-sm text-slate-500">saved report snapshots available</p>
        </Card>
      </div>
    )
  }

  const first = progress.points[0]
  const latest = progress.points.at(-1)
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
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Solved problems" value={latest.solved} icon={CheckCircle2} />
        <StatCard
          label="Solved improvement"
          value={`+${latest.solved - first.solved}`}
          icon={Target}
        />
        <StatCard
          label="Rating change"
          value={`${(latest.rating || 0) - (first.rating || 0) >= 0 ? '+' : ''}${(latest.rating || 0) - (first.rating || 0)}`}
          icon={TrendingUp}
        />
        <StatCard
          label="Weakness change"
          value={latest.weakness - first.weakness}
          icon={TrendingDown}
          caption="Lower is better"
        />
      </div>
      <div className="grid gap-4 xl:grid-cols-2">
        <ChartCard title="Solved count trend" subtitle="Saved report snapshots">
          <TrendChart data={progress.points} dataKey="solved" />
        </ChartCard>
        <ChartCard title="Rating progression" subtitle="Saved report snapshots">
          <TrendChart data={progress.points} dataKey="rating" />
        </ChartCard>
        <ChartCard title="Weakness score trend" subtitle="Lower is better">
          <TrendChart data={progress.points} dataKey="weakness" />
        </ChartCard>
        <Card className="p-6">
          <SectionHeader
            title="Topic improvement"
            description="Positive means weakness decreased"
          />
          <div className="space-y-3">
            {progress.topicImprovement.slice(0, 6).map((topic) => (
              <div
                key={topic.topic}
                className="flex items-center justify-between rounded-xl bg-black/20 p-3"
              >
                <span className="text-sm">{topic.topic}</span>
                <Badge tone={topic.improvement > 0 ? 'green' : 'amber'}>
                  {topic.improvement > 0 ? '+' : ''}
                  {topic.improvement}
                </Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}
export function ProfilePage() {
  const { user: account, updateUser } = useAuth()
  const { report } = useAnalytics()
  const [reports, setReports] = useState([])
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    reportApi
      .list()
      .then(setReports)
      .catch(() => setReports([]))
  }, [])

  async function saveProfile(event) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    setSaving(true)
    setError('')
    try {
      const nextUser = await userApi.updateProfile({
        name: form.get('name'),
        targetRating: Number(form.get('targetRating')),
        preferredPracticeMinutes: Number(form.get('preferredPracticeMinutes')),
      })
      updateUser(nextUser)
      setEditing(false)
    } catch (requestError) {
      setError(getApiErrorMessage(requestError))
    } finally {
      setSaving(false)
    }
  }

  const profile = report?.profile
  const initials = account?.name
    ?.split(/\s+/)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
  const memberSince = account?.createdAt
    ? new Date(account.createdAt).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })
    : 'Unknown'

  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="Account"
        title="Profile"
        description="Your competitive programming identity and account history."
        action={
          <Button variant="secondary" onClick={() => setEditing((value) => !value)}>
            <User size={15} /> Edit profile
          </Button>
        }
      />
      <Card className="overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-cyan-400/20 via-violet-500/15 to-transparent" />
        <div className="px-6 pb-6">
          <div className="-mt-10 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div className="flex items-end gap-4">
              <Avatar
                initials={initials}
                className="h-20 w-20 rounded-2xl border-4 border-[#0e131d] text-xl"
              />
              <div className="pb-1">
                <h2 className="text-xl font-semibold">{account?.name}</h2>
                <p className="text-sm text-slate-500">
                  @{account?.codeforcesHandle || 'No handle connected'}
                </p>
              </div>
            </div>
            <Badge tone={account?.codeforcesHandle ? 'green' : 'amber'}>
              {account?.codeforcesHandle ? '● Codeforces connected' : 'Codeforces not connected'}
            </Badge>
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {[
              ['Email', account?.email],
              ['Current rating', profile?.rating ?? 'Unrated'],
              ['Target rating', account?.targetRating],
              ['Practice time', `${account?.preferredPracticeMinutes || 60} min / day`],
              ['Member since', memberSince],
            ].map(([l, v]) => (
              <div key={l} className="rounded-xl bg-black/20 p-4">
                <p className="text-xs text-slate-600">{l}</p>
                <p className="mt-1 text-sm font-medium">{v}</p>
              </div>
            ))}
          </div>
        </div>
      </Card>
      {editing && (
        <Card className="p-6">
          <SectionHeader title="Edit profile" description="Changes are saved to your account." />
          <form className="grid gap-5 sm:grid-cols-3" onSubmit={saveProfile}>
            <SettingField label="Full name" name="name" value={account?.name || ''} />
            <SettingField
              label="Target rating"
              name="targetRating"
              value={account?.targetRating || 1600}
              type="number"
            />
            <div>
              <Label>Daily practice time</Label>
              <Select
                name="preferredPracticeMinutes"
                defaultValue={String(account?.preferredPracticeMinutes || 60)}
                className="w-full"
              >
                {[30, 60, 90, 120].map((minutes) => (
                  <option key={minutes} value={minutes}>
                    {minutes} minutes
                  </option>
                ))}
              </Select>
            </div>
            <div className="flex items-center gap-3 sm:col-span-3">
              <Button type="submit" disabled={saving}>
                {saving ? 'Saving...' : 'Save profile'}
              </Button>
              {error && <p className="text-sm text-rose-300">{error}</p>}
            </div>
          </form>
        </Card>
      )}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="p-6">
          <SectionHeader title="Connected accounts" />
          <div className="space-y-3">
            <Connected
              icon={Zap}
              name="Codeforces"
              value={account?.codeforcesHandle || 'Not connected'}
              active={Boolean(account?.codeforcesHandle)}
            />
            <Connected icon={CodeXml} name="GitHub" value="Not connected" />
          </div>
        </Card>
        <Card className="p-6">
          <SectionHeader
            title="Recent reports"
            action={
              <Link to="/progress">
                <Button size="sm" variant="ghost">
                  View progress
                </Button>
              </Link>
            }
          />
          <div className="space-y-2">
            {reports.slice(0, 3).map((savedReport) => (
              <Link
                to={`/report/${savedReport._id || savedReport.id}`}
                key={savedReport._id || savedReport.id}
                className="flex items-center justify-between rounded-xl p-3 hover:bg-white/[.03]"
              >
                <div className="flex items-center gap-3">
                  <FileText size={17} className="text-slate-600" />
                  <div>
                    <p className="text-sm">Analysis for {savedReport.handle}</p>
                    <p className="text-xs text-slate-600">
                      {new Date(savedReport.generatedAt).toLocaleString()}
                    </p>
                  </div>
                </div>
                <ChevronRight size={15} className="text-slate-700" />
              </Link>
            ))}
            {!reports.length && <p className="text-sm text-slate-500">No saved reports yet.</p>}
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
      {active ? (
        <Link to="/settings">
          <Button variant="ghost" size="sm">
            Manage
          </Button>
        </Link>
      ) : (
        <Button variant="secondary" size="sm" disabled title="Coming in a later milestone">
          Coming later
        </Button>
      )}
    </div>
  )
}

const settingsTabs = ['Account', 'Codeforces', 'Notifications', 'AI Coach', 'Data Refresh']
export function SettingsPage() {
  const { user: account, updateUser } = useAuth()
  const [tab, setTab] = useState('Account')
  const [preferences, setPreferences] = useState(account?.preferences || {})
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => setPreferences(account?.preferences || {}), [account?.preferences])

  async function saveAccount(event) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    setSaving(true)
    setMessage('')
    try {
      const nextUser = await userApi.updateProfile({
        name: form.get('name'),
        targetRating: Number(form.get('targetRating')),
        preferredPracticeMinutes: Number(form.get('preferredPracticeMinutes')),
      })
      updateUser(nextUser)
      setMessage('Account settings saved.')
    } catch (requestError) {
      setMessage(getApiErrorMessage(requestError))
    } finally {
      setSaving(false)
    }
  }

  async function savePreferences() {
    setSaving(true)
    setMessage('')
    try {
      const nextUser = await userApi.updatePreferences(preferences)
      updateUser(nextUser)
      setMessage('Preferences saved.')
    } catch (requestError) {
      setMessage(getApiErrorMessage(requestError))
    } finally {
      setSaving(false)
    }
  }

  async function saveCodeforces(event) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    setSaving(true)
    setMessage('')
    try {
      let nextUser = account
      const handle = String(form.get('codeforcesHandle')).trim()
      if (handle !== account.codeforcesHandle) nextUser = await userApi.updateHandle(handle)
      nextUser = await userApi.updatePreferences({
        includeGymSubmissions: Boolean(preferences.includeGymSubmissions),
      })
      updateUser(nextUser)
      setMessage('Codeforces settings saved.')
    } catch (requestError) {
      setMessage(getApiErrorMessage(requestError))
    } finally {
      setSaving(false)
    }
  }

  function togglePreference(key) {
    setPreferences((current) => ({ ...current, [key]: !current[key] }))
  }

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
              <form className="grid gap-5 sm:grid-cols-2" onSubmit={saveAccount}>
                <SettingField label="Full name" name="name" value={account?.name || ''} />
                <SettingField
                  label="Email address"
                  name="email"
                  value={account?.email || ''}
                  readOnly
                />
                <SettingField
                  label="Target rating"
                  name="targetRating"
                  value={account?.targetRating || 1600}
                  type="number"
                />
                <div>
                  <Label>Daily practice time</Label>
                  <Select
                    className="w-full"
                    name="preferredPracticeMinutes"
                    defaultValue={String(account?.preferredPracticeMinutes || 60)}
                  >
                    {[30, 60, 90, 120].map((minutes) => (
                      <option value={minutes} key={minutes}>
                        {minutes} minutes
                      </option>
                    ))}
                  </Select>
                </div>
                <div className="sm:col-span-2">
                  <Button type="submit" disabled={saving}>
                    Save changes
                  </Button>
                </div>
              </form>
            ) : tab === 'Codeforces' ? (
              <form className="space-y-5" onSubmit={saveCodeforces}>
                <SettingField
                  label="Codeforces handle"
                  name="codeforcesHandle"
                  value={account?.codeforcesHandle || ''}
                />
                <PreferenceToggle
                  title="Include gym submissions"
                  description="Use gym contests in performance analysis."
                  active={Boolean(preferences.includeGymSubmissions)}
                  onToggle={() => togglePreference('includeGymSubmissions')}
                />
                <Button type="submit" disabled={saving}>
                  Save Codeforces settings
                </Button>
              </form>
            ) : (
              <div className="space-y-3">
                {getSettings(tab).map(([key, title, description]) => (
                  <PreferenceToggle
                    key={key}
                    title={title}
                    description={description}
                    active={Boolean(preferences[key])}
                    onToggle={() => togglePreference(key)}
                  />
                ))}
                <Button className="mt-3" onClick={savePreferences} disabled={saving}>
                  Save preferences
                </Button>
              </div>
            )}
            {message && <p className="mt-4 text-sm text-slate-400">{message}</p>}
          </Card>
          {tab === 'Account' && (
            <Card className="border-rose-500/20 p-6">
              <h3 className="font-semibold text-rose-300">Danger zone</h3>
              <p className="mt-2 text-sm text-slate-500">
                Permanently delete your account and all generated reports.
              </p>
              <Button
                variant="danger"
                className="mt-5"
                disabled
                title="Coming in a later milestone"
              >
                <Trash2 size={15} /> Delete account
              </Button>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
function SettingField({ label, value, type = 'text', name, readOnly = false }) {
  return (
    <div>
      <Label>{label}</Label>
      <Input defaultValue={value} type={type} name={name} readOnly={readOnly} />
    </div>
  )
}
function getSettings(tab) {
  const map = {
    Notifications: [
      ['weeklyReport', 'Weekly report', 'Receive a weekly improvement summary.'],
      ['streakReminders', 'Streak reminders', 'Get notified before a streak expires.'],
      ['contestReminders', 'Contest reminder', 'Remind me about upcoming Codeforces rounds.'],
    ],
    'AI Coach': [
      [
        'detailedAIExplanations',
        'Detailed explanations',
        'Include reasoning behind each recommendation.',
      ],
    ],
    'Data Refresh': [
      [
        'automaticRefresh',
        'Automatic refresh',
        'Refresh analytics when your workspace loads after the cache expires.',
      ],
    ],
  }
  return map[tab] || []
}

function PreferenceToggle({ title, description, active, onToggle }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="flex w-full items-center justify-between gap-5 rounded-xl border border-white/[.06] p-4 text-left"
    >
      <span>
        <span className="block text-sm font-medium">{title}</span>
        <span className="mt-1 block text-xs text-slate-600">{description}</span>
      </span>
      <Switch active={active} />
    </button>
  )
}

export function ReportDetailsPage() {
  const { id } = useParams()
  const { user: account } = useAuth()
  const [report, setReport] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [exporting, setExporting] = useState(false)

  async function loadReport() {
    setLoading(true)
    setError('')
    try {
      const nextReport =
        id === 'latest' ? await reportApi.latest(account.codeforcesHandle) : await reportApi.get(id)
      setReport(nextReport)
    } catch (requestError) {
      setError(getApiErrorMessage(requestError))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadReport()
    // Report identity is controlled by the route.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, account?.codeforcesHandle])

  async function exportPdf() {
    const reportId = report?._id || report?.id || id
    if (!reportId || reportId === 'latest') return
    setExporting(true)
    setError('')
    try {
      const blob = await reportApi.exportPdf(reportId)
      const url = URL.createObjectURL(blob)
      const anchor = document.createElement('a')
      anchor.href = url
      anchor.download = `cp-performance-${report.handle}.pdf`
      document.body.appendChild(anchor)
      anchor.click()
      anchor.remove()
      URL.revokeObjectURL(url)
    } catch (requestError) {
      setError(getApiErrorMessage(requestError))
    } finally {
      setExporting(false)
    }
  }

  if (!report) return <DataState loading={loading} error={error} onRetry={loadReport} />

  const topics = report.topicAnalysis || []
  const weakness = topics.length
    ? Math.round(
        topics.reduce((total, topic) => total + topic.weakness * topic.attempted, 0) /
          topics.reduce((total, topic) => total + topic.attempted, 0),
      )
    : 0
  const ratingProgress = (report.summary.ratingHistory || []).slice(-12).map((change) => ({
    month: new Date(change.changedAt).toLocaleDateString(undefined, { month: 'short' }),
    rating: change.newRating,
  }))
  const queue = (report.upsolvingProblems || []).map((problem) => ({
    ...problem,
    verdict: displayVerdict(problem.lastVerdict),
  }))
  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow={`Generated ${new Date(report.generatedAt).toLocaleString()}`}
        title="Full performance report"
        description={`A saved snapshot of ${report.handle} based on ${report.summary.totalSubmissions} submissions.`}
        action={
          <div className="flex gap-2">
            <Button variant="secondary" disabled>
              <Save size={15} /> Saved
            </Button>
            <Button onClick={exportPdf} disabled={exporting}>
              <Download size={15} /> {exporting ? 'Exporting...' : 'Export PDF'}
            </Button>
          </div>
        }
      />
      <InsightBanner>
        {report.recommendations?.practiceStrategy?.[0] ||
          'Use the verified analytics below to choose the next focused practice block.'}
      </InsightBanner>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Solved problems" value={report.summary.solvedProblems} icon={Trophy} />
        <StatCard label="Weakness score" value={`${weakness} / 100`} icon={TrendingDown} />
        <StatCard
          label="Current rating"
          value={report.profile.rating ?? 'Unrated'}
          icon={Activity}
        />
        <StatCard
          label="Target gap"
          value={Math.max((account.targetRating || 1600) - (report.profile.rating || 0), 0)}
          icon={Target}
          caption={`To ${account.targetRating || 1600}`}
        />
      </div>
      <div className="grid gap-4 xl:grid-cols-2">
        <ChartCard title="Weak topic analysis">
          <BarChartView
            data={topics.slice(0, 10)}
            dataKey="weakness"
            nameKey="short"
            color="#fb7185"
          />
        </ChartCard>
        <ChartCard title="Rating gap analysis">
          <TrendChart data={ratingProgress} dataKey="rating" />
        </ChartCard>
        <ChartCard title="Verdict analysis">
          <DonutChart data={report.verdictAnalysis.distribution || []} />
        </ChartCard>
        <AIResponseCard title="AI recommendation summary">
          {(report.recommendations?.practiceStrategy || []).join(' ')}
        </AIResponseCard>
      </div>
      <Card>
        <div className="p-5">
          <SectionHeader
            title="Upsolving priority"
            description="Highest-learning-value unsolved attempts"
          />
        </div>
        <ProblemTable problems={queue.slice(0, 5)} />
      </Card>
    </div>
  )
}
