import React, { useMemo, useState } from 'react'
import { Bot, CalendarDays, Check, ChevronRight, RefreshCw, Send, Sparkles } from 'lucide-react'
import {
  AIResponseCard,
  InsightBanner,
  RatingBadge,
  SectionHeader,
} from '../components/AppComponents'
import { Avatar, Badge, Button, Card, Input, Progress } from '../components/ui'
import { practicePlan, user } from '../data/mockData'

const prompts = [
  'Create a 7-day upsolving plan',
  'Explain why I am weak in DP',
  'Suggest problems for 1300–1500',
  'How should I improve contest performance?',
]

const coachReplies = {
  'Create a 7-day upsolving plan':
    'I’d alternate focused DP and graph drills with one timed mixed set. Keep Friday for your three highest-priority failed problems and Sunday for review.',
  'Explain why I am weak in DP':
    'Your recurrence choice is usually sound, but state definition and base cases drive repeated wrong answers. Write the state in one sentence before coding.',
  'Suggest problems for 1300–1500':
    'Start with Boredom (455A), Vacations (699C), Magic Powder — 2 (670D2), and Two Buttons (520B). They target your current DP, binary-search, and graph gaps.',
  'How should I improve contest performance?':
    'Prioritize clean A/B conversion, set a 12-minute debugging limit, and upsolve every attempted problem within 48 hours.',
}

export function AICoachPage() {
  const [message, setMessage] = useState('')
  const [chat, setChat] = useState([])
  function send(value = message) {
    const question = value.trim()
    if (!question) return
    const answer =
      coachReplies[question] ||
      'Based on your recent history, I would keep the next practice block narrow: one weak topic, three problems, then a short written review of every failed attempt.'
    setChat((items) => [...items, { question, answer }])
    setMessage('')
  }
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
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between text-sm">
                  <span className="text-slate-500">{label}</span>
                  <span className="font-medium">{value}</span>
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
                repeated wrong attempts in DP and graphs.
              </div>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <AIResponseCard title="Why DP feels difficult">
                You often identify the recurrence but lose accuracy in state definition and base
                cases.
              </AIResponseCard>
              <AIResponseCard title="Starting problems">
                Begin with Boredom (455A), Vacations (699C), and Flowers (474D).
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
              <Button size="icon" aria-label="Send message" disabled={!message.trim()}>
                <Send size={17} />
              </Button>
            </div>
            <p className="mt-2 text-center text-[10px] text-slate-700">
              Advice is generated from mock performance data in this demo.
            </p>
          </form>
        </Card>
      </div>
    </div>
  )
}

export function PracticePlanPage() {
  const [tasks, setTasks] = useState(() => practicePlan.map((item) => ({ ...item })))
  const [view, setView] = useState('cards')
  const completed = tasks.filter((item) => item.done).length
  const percent = Math.round((completed / tasks.length) * 100)
  const solved = useMemo(
    () => tasks.filter((item) => item.done).reduce((sum, item) => sum + item.count, 0),
    [tasks],
  )
  function toggle(day) {
    setTasks((items) =>
      items.map((item) => (item.day === day ? { ...item, done: !item.done } : item)),
    )
  }
  function regenerate() {
    setTasks(practicePlan.map((item) => ({ ...item, done: false })))
  }
  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="Week of June 29"
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
      <Card className="p-5">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <p className="text-sm font-semibold">Weekly progress</p>
            <p className="mt-1 text-xs text-slate-500">
              {completed} of 7 daily goals completed · {solved} of 25 problems solved
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
        Keep the plan deliberately narrow. The goal this week is not raw volume—it is proving you
        can define DP states cleanly and convert 1300–1400 problems with fewer retries.
      </InsightBanner>
    </div>
  )
}
