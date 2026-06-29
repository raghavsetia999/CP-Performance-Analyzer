import React, { useEffect, useMemo, useState } from 'react'
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

export function AICoachPage() {
  const { user: account } = useAuth()
  const { report } = useAnalytics()
  const [message, setMessage] = useState('')
  const [chat, setChat] = useState([])
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  async function send(value = message) {
    const question = value.trim()
    if (!question || !account?.codeforcesHandle) return
    setSubmitting(true)
    setError('')
    try {
      const response = await aiApi.chat(account.codeforcesHandle, question)
      setChat((items) => [...items, { question, answer: response.answer }])
      setMessage('')
    } catch (requestError) {
      setError(getApiErrorMessage(requestError))
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
        action={<Badge tone="green">Rule-based · AI disabled</Badge>}
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
              <p className="text-xs text-emerald-400">● Deterministic coach ready</p>
            </div>
          </div>
          <div className="flex-1 space-y-5 overflow-y-auto p-5 sm:p-7">
            <div className="flex max-w-xl gap-3">
              <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-violet-400/10 text-violet-300">
                <Sparkles size={16} />
              </div>
              <div className="rounded-2xl rounded-tl-sm bg-white/[.045] p-4 text-sm leading-6 text-slate-300">
                I’m using your verified analytics and deterministic rules. No external AI provider
                is enabled in this phase.
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
                <div className="max-w-xl rounded-2xl rounded-tl-sm bg-white/[.045] p-4 text-sm leading-6 text-slate-300">
                  {item.answer}
                </div>
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
              Rule-based response · external AI is disabled.
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
  }
  async function regenerate() {
    if (!account?.codeforcesHandle) return
    setLoading(true)
    setError('')
    try {
      const response = await aiApi.practicePlan(
        account.codeforcesHandle,
        account.preferredPracticeMinutes,
      )
      setTasks(response.plan)
      setOverview(response.overview)
    } catch (requestError) {
      setError(getApiErrorMessage(requestError))
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
      <Card className="p-8 text-center text-sm text-slate-500">Generating rule-based plan…</Card>
    )
  }
  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="Rule-based weekly plan"
        title="Your 7-day practice plan"
        description="One focused hour per day, shaped around your highest-leverage gaps."
        action={
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" onClick={regenerate}>
              <RefreshCw size={15} /> Regenerate
            </Button>
            <Button
              onClick={() => setTasks((items) => items.map((item) => ({ ...item, done: true })))}
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
        {overview || 'The plan is generated from your current analytics without external AI.'}
      </InsightBanner>
    </div>
  )
}
