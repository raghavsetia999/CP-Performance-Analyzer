import React, { lazy, Suspense } from 'react'
import { Route, Routes } from 'react-router-dom'
import ProtectedRoute from './components/ProtectedRoute'

const loadPage = (loader, name) =>
  lazy(() => loader().then((module) => ({ default: module[name] })))

const DashboardLayout = lazy(() => import('./layouts/DashboardLayout'))
const LandingPage = loadPage(() => import('./pages/PublicPages'), 'LandingPage')
const LoginPage = loadPage(() => import('./pages/PublicPages'), 'LoginPage')
const RegisterPage = loadPage(() => import('./pages/PublicPages'), 'RegisterPage')
const ForgotPasswordPage = loadPage(() => import('./pages/PublicPages'), 'ForgotPasswordPage')
const OnboardingPage = loadPage(() => import('./pages/PublicPages'), 'OnboardingPage')
const NotFoundPage = loadPage(() => import('./pages/PublicPages'), 'NotFoundPage')
const DashboardPage = loadPage(() => import('./pages/AnalyticsPages'), 'DashboardPage')
const AnalyzeHandlePage = loadPage(() => import('./pages/AnalyticsPages'), 'AnalyzeHandlePage')
const WeaknessReportPage = loadPage(() => import('./pages/AnalyticsPages'), 'WeaknessReportPage')
const RatingAnalysisPage = loadPage(() => import('./pages/AnalyticsPages'), 'RatingAnalysisPage')
const VerdictAnalysisPage = loadPage(() => import('./pages/AnalyticsPages'), 'VerdictAnalysisPage')
const UpsolvingPage = loadPage(() => import('./pages/ProductivityPages'), 'UpsolvingPage')
const RecommendationsPage = loadPage(
  () => import('./pages/ProductivityPages'),
  'RecommendationsPage',
)
const ProgressPage = loadPage(() => import('./pages/ProductivityPages'), 'ProgressPage')
const ProfilePage = loadPage(() => import('./pages/ProductivityPages'), 'ProfilePage')
const SettingsPage = loadPage(() => import('./pages/ProductivityPages'), 'SettingsPage')
const ReportDetailsPage = loadPage(() => import('./pages/ProductivityPages'), 'ReportDetailsPage')
const AICoachPage = loadPage(() => import('./pages/InteractivePages'), 'AICoachPage')
const PracticePlanPage = loadPage(() => import('./pages/InteractivePages'), 'PracticePlanPage')

function PageFallback() {
  return (
    <div className="grid min-h-screen place-items-center bg-ink">
      <div className="text-center">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-cyan-400 border-t-transparent" />
        <p className="mt-3 text-sm text-slate-500">Loading workspace…</p>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <Suspense fallback={<PageFallback />}>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/onboarding" element={<OnboardingPage />} />
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/analyze" element={<AnalyzeHandlePage />} />
            <Route path="/weakness" element={<WeaknessReportPage />} />
            <Route path="/rating-analysis" element={<RatingAnalysisPage />} />
            <Route path="/verdict-analysis" element={<VerdictAnalysisPage />} />
            <Route path="/upsolving" element={<UpsolvingPage />} />
            <Route path="/ai-coach" element={<AICoachPage />} />
            <Route path="/practice-plan" element={<PracticePlanPage />} />
            <Route path="/recommendations" element={<RecommendationsPage />} />
            <Route path="/progress" element={<ProgressPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/report/:id" element={<ReportDetailsPage />} />
          </Route>
        </Route>
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  )
}
