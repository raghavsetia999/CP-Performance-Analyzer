import React, { useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { Bot, CalendarDays, Check, ChevronRight, RefreshCw, Send, Sparkles } from 'lucide-react'
import {
  AIResponseCard,
  InsightBanner,
  RatingBadge,
  SectionHeader,
} from '../components/AppComponents'
import { Avatar, Badge, Button, Card, Input, Progress } from '../components/ui'
import { useAnalytics } from '../context/AnalyticsContext'
import { useAuth } from '../context/AuthContext'
import { aiApi } from '../services/aiApi'
import { getApiErrorMessage } from '../services/apiClient'

const prompts = [
  'Create a 7-day upsolving plan',
  'Explain why I am weak in DP',
  'Suggest problems for 1300–1500',
  'How should I improve contest performance?',
]

function CoachMessage({ item }) {
  const paragraphs = item.answer
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
  const responseEngine =
    item.source === 'gemini'
      ? `Gemini${item.model ? ` · ${item.model}` : ''}`
      : 'Rule-based fallback'

  return (
    <div className="max-w-xl rounded-2xl rounded-tl-sm border border-white/[.05] bg-white/[.045] p-5 text-sm text-slate-300">
      <div className="space-y-3 leading-7">
        {paragraphs.map((paragraph, index) => (
          <p key={`${paragraph.slice(0, 30)}-${index}`} className="whitespace-pre-line">
            {paragraph}
          </p>
        ))}
      </div>
      {item.evidence?.length > 0 && (
        <div className="mt-5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-violet-300">
            Evidence from your data
          </p>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {item.evidence.map((fact, index) => (
              <div
                key={`${fact.label}-${index}`}
                className="rounded-xl border border-white/[.05] bg-black/15 p-3"
              >
                <p className="text-[10px] text-slate-600">{fact.label}</p>
                <p className="mt-1 text-xs font-medium text-slate-300">{fact.value}</p>
              </div>
            ))}
          </div>
        </div>
      )}
      {item.suggestedActions?.length > 0 && (
        <div className="mt-5 rounded-xl bg-cyan-400/[.05] p-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-cyan-300">
            Recommended next steps
          </p>
          <ul className="mt-3 space-y-2">
            {item.suggestedActions.map((action, index) => (
              <li key={`${action}-${index}`} className="flex gap-2 leading-6 text-slate-400">
                <span className="font-mono text-cyan-400">{index + 1}.</span>
                <span>{action}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      {item.fallbackReason && (
        <div className="mt-4 rounded-xl border border-amber-400/15 bg-amber-400/[.05] px-3 py-2 text-[11px] leading-5 text-amber-200/80">
          {item.fallbackReason === 'gemini_rate_limited'
            ? 'Gemini quota is temporarily exhausted. This answer was produced from the same verified analytics by the deterministic fallback.'
            : 'Gemini was temporarily unavailable. This answer was produced from the same verified analytics by the deterministic fallback.'}
        </div>
      )}
      <div className="mt-5 flex flex-wrap gap-x-4 gap-y-1 border-t border-white/[.06] pt-3 text-[10px] text-slate-600">
        <span>Primary data: Codeforces API analytics</span>
        <span>Response engine: {responseEngine}</span>
      </div>
    </div>
  )
}

export function AICoachPage() {
  const { user: account } = useAuth()
  const { report } = useAnalytics()
  const [message, setMessage] = useState('')
  const [chat, setChat] = useState([])
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [coachSource, setCoachSource] = useState(null)
  async function send(value = message) {
    const question = value.trim()
    if (!question || !account?.codeforcesHandle) return
    setSubmitting(true)
    setError('')
    try {
      const response = await aiApi.chat(account.codeforcesHandle, question)
      setChat((items) => [
        ...items,
        {
          question,
          answer: response.answer,
          suggestedActions: response.suggestedActions || [],
          evidence: response.evidence || [],
          intent: response.intent,
          fallbackReason: response.fallbackReason,
          source: response.source,
          model: response.model,
        },
      ])
      setCoachSource(response.source)
      setMessage('')
      toast.success('Coach response ready')
    } catch (requestError) {
      const message = getApiErrorMessage(requestError)
      setError(message)
      toast.error(message)
    } finally {
      setSubmitting(false)
    }
  }
  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="Your personal CP strategist"
        title="AI performance coach"
        description="Grounded in your submission history—not generic advice."
        action={
          <Badge tone="green">
            {coachSource === 'rule_based' ? 'Rule-based fallback' : 'Gemini · fallback protected'}
          </Badge>
        }
      />
      <div className="grid gap-4 xl:grid-cols-[320px_1fr]">
        <div className="space-y-4">
          <Card className="p-5">
            <div className="flex items-center gap-3">
              <Avatar />
              <div>
                <p className="font-semibold">{account?.codeforcesHandle || 'No handle'}</p>
                <p className="text-xs text-slate-500">Performance context</p>
              </div>
            </div>
            <div className="mt-5 space-y-4">
              {[
                ['Current rating', report?.profile.rating ?? '—'],
                ['Target rating', account?.targetRating ?? '—'],
                ['Daily time', `${account?.preferredPracticeMinutes || 60} min`],
                ['Problems solved', report?.summary.solvedProblems ?? '—'],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between text-sm">
                  <span className="text-slate-500">{label}</span>
                  <span className="font-medium">{value}</span>
                </div>
              ))}
            </div>
            <div className="mt-5 rounded-xl bg-rose-400/[.06] p-4">
              <p className="text-xs text-slate-500">Top weakness</p>
              <p className="mt-1 font-medium text-rose-300">
                {report?.recommendations.focusTopics[0]?.topic || 'Not enough data'}
              </p>
              <Progress
                value={report?.recommendations.focusTopics[0]?.weakness || 0}
                className="mt-3 [&>div]:from-rose-400 [&>div]:to-amber-400"
              />
            </div>
          </Card>
          <Card className="p-5">
            <p className="text-sm font-semibold">Suggested prompts</p>
            <div className="mt-3 space-y-2">
              {prompts.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => send(prompt)}
                  disabled={submitting}
                  className="w-full rounded-xl border border-white/[.06] p-3 text-left text-xs leading-5 text-slate-400 transition hover:border-cyan-400/20 hover:text-white"
                >
                  {prompt}
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
              <p className="text-xs text-emerald-400">
                ●{' '}
                {coachSource === 'rule_based' ? 'Rule-based fallback active' : 'Gemini coach ready'}
              </p>
            </div>
          </div>
          <div className="flex-1 space-y-5 overflow-y-auto p-5 sm:p-7">
            <div className="flex max-w-xl gap-3">
              <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-violet-400/10 text-violet-300">
                <Sparkles size={16} />
              </div>
              <div className="rounded-2xl rounded-tl-sm bg-white/[.045] p-4 text-sm leading-6 text-slate-300">
                Codeforces profile, submission, rating, verdict, and topic analytics are the primary
                source. Gemini turns those verified facts into a readable explanation; the
                deterministic coach takes over if Gemini is unavailable.
              </div>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <AIResponseCard title="Primary focus">
                {report?.recommendations.practiceStrategy[0] || 'Generate an analysis first.'}
              </AIResponseCard>
              <AIResponseCard title="Upsolving direction">
                {report?.recommendations.upsolvingPriority[0]?.reason ||
                  'No unfinished attempted problem is currently prioritized.'}
              </AIResponseCard>
            </div>
            {chat.map((item, index) => (
              <div key={`${item.question}-${index}`} className="space-y-3">
                <div className="ml-auto max-w-xl rounded-2xl rounded-tr-sm bg-cyan-400 p-4 text-sm text-slate-950">
                  {item.question}
                </div>
                <CoachMessage item={item} />
              </div>
            ))}
            {error && <p className="text-sm text-rose-300">{error}</p>}
          </div>
          <form
            className="border-t border-white/[.06] p-4"
            onSubmit={(event) => {
              event.preventDefault()
              send()
            }}
          >
            <div className="flex gap-2">
              <Input
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                placeholder="Ask about your performance or request a plan…"
              />
              <Button
                size="icon"
                aria-label="Send message"
                disabled={!message.trim() || submitting}
              >
                <Send size={17} />
              </Button>
            </div>
            <p className="mt-2 text-center text-[10px] text-slate-700">
              Analytics-grounded response · Gemini with rule-based fallback.
            </p>
          </form>
        </Card>
      </div>
    </div>
  )
}

export function PracticePlanPage() {
  const { user: account } = useAuth()
  const [tasks, setTasks] = useState([])
  const [view, setView] = useState('cards')
  const [overview, setOverview] = useState('')
  const [planSource, setPlanSource] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const completed = tasks.filter((item) => item.done).length
  const percent = tasks.length ? Math.round((completed / tasks.length) * 100) : 0
  const solved = useMemo(
    () => tasks.filter((item) => item.done).reduce((sum, item) => sum + item.count, 0),
    [tasks],
  )
  function toggle(day) {
    setTasks((items) =>
      items.map((item) => (item.day === day ? { ...item, done: !item.done } : item)),
    )
    const task = tasks.find((item) => item.day === day)
    if (task)
      toast.success(task.done ? `${task.label} marked incomplete` : `${task.label} completed`)
  }
  async function regenerate(notify = false) {
    if (!account?.codeforcesHandle) return
    setLoading(true)
    setError('')
    const toastId = notify ? toast.loading('Regenerating practice plan...') : null
    try {
      const response = await aiApi.practicePlan(
        account.codeforcesHandle,
        account.preferredPracticeMinutes,
      )
      setTasks(response.plan)
      setOverview(response.overview)
      setPlanSource(response.source)
      if (toastId) toast.success('Practice plan regenerated', { id: toastId })
    } catch (requestError) {
      const message = getApiErrorMessage(requestError)
      setError(message)
      if (toastId) toast.error(message, { id: toastId })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    regenerate()
    // Regenerate when the tracked handle changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [account?.codeforcesHandle])

  if (loading && !tasks.length) {
    return (
      <Card className="p-8 text-center text-sm text-slate-500">Generating your practice plan…</Card>
    )
  }
  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow={planSource === 'rule_based' ? 'Rule-based fallback plan' : 'Gemini weekly plan'}
        title="Your 7-day practice plan"
        description="One focused hour per day, shaped around your highest-leverage gaps."
        action={
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" onClick={() => regenerate(true)}>
              <RefreshCw size={15} /> Regenerate
            </Button>
            <Button
              onClick={() => {
                setTasks((items) => items.map((item) => ({ ...item, done: true })))
                toast.success('Week marked complete')
              }}
            >
              <Check size={15} /> Mark week complete
            </Button>
          </div>
        }
      />
      {error && <Card className="border-rose-400/20 p-4 text-sm text-rose-300">{error}</Card>}
      <Card className="p-5">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <p className="text-sm font-semibold">Weekly progress</p>
            <p className="mt-1 text-xs text-slate-500">
              {completed} of {tasks.length} daily goals completed · {solved} planned problems done
            </p>
          </div>
          <span className="font-mono text-2xl font-semibold text-cyan-300">{percent}%</span>
        </div>
        <Progress value={percent} className="mt-4 h-3" />
      </Card>
      <div className="flex justify-end gap-2">
        <Button
          size="sm"
          variant={view === 'calendar' ? 'secondary' : 'ghost'}
          onClick={() => setView('calendar')}
        >
          <CalendarDays size={14} /> Calendar
        </Button>
        <Button
          size="sm"
          variant={view === 'cards' ? 'secondary' : 'ghost'}
          onClick={() => setView('cards')}
        >
          Cards
        </Button>
      </div>
      <div
        className={
          view === 'calendar'
            ? 'grid gap-3 lg:grid-cols-7'
            : 'grid gap-4 sm:grid-cols-2 xl:grid-cols-4'
        }
      >
        {tasks.map((item) => (
          <Card
            key={item.day}
            className={`p-5 transition ${item.done ? 'border-emerald-400/20 bg-emerald-400/[.025]' : ''}`}
          >
            <div className="flex items-start justify-between">
              <div className="flex gap-3">
                <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-white/[.06] font-mono text-sm text-cyan-300">
                  {item.day}
                </div>
                <div>
                  <p className="text-xs text-slate-500">{item.label}</p>
                  <h3 className="font-semibold">{item.topic}</h3>
                </div>
              </div>
              <input
                type="checkbox"
                checked={item.done}
                onChange={() => toggle(item.day)}
                aria-label={`Mark ${item.label} complete`}
                className="h-5 w-5 accent-cyan-400"
              />
            </div>
            <p className="mt-4 text-sm text-slate-400">{item.goal}</p>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <RatingBadge>{item.range}</RatingBadge>
              <Badge>{item.count} problems</Badge>
            </div>
            <p className="mt-4 border-t border-white/[.06] pt-3 text-xs text-slate-600">
              Note · {item.note}
            </p>
          </Card>
        ))}
      </div>
      <InsightBanner>
        {overview || 'The plan is generated from your current verified analytics.'}
      </InsightBanner>
    </div>
  )
}
