import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { analyticsApi } from '../services/analyticsApi'
import { getApiErrorMessage } from '../services/apiClient'
import { useAuth } from './AuthContext'

const AnalyticsContext = createContext(null)

export function AnalyticsProvider({ children }) {
  const { user } = useAuth()
  const [report, setReport] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function refresh(handle = user?.codeforcesHandle) {
    if (!handle) {
      setReport(null)
      setError('Add a Codeforces handle in onboarding to load analytics.')
      return null
    }
    setLoading(true)
    setError('')
    try {
      const nextReport = await analyticsApi.analyze(handle)
      setReport(nextReport)
      return nextReport
    } catch (requestError) {
      setError(getApiErrorMessage(requestError))
      return null
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user?.codeforcesHandle) refresh(user.codeforcesHandle)
    else {
      setReport(null)
      setLoading(false)
    }
    // Refresh when the authenticated Codeforces identity changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.codeforcesHandle])

  const value = useMemo(
    () => ({ report, loading, error, refresh, setReport }),
    [report, loading, error],
  )

  return <AnalyticsContext.Provider value={value}>{children}</AnalyticsContext.Provider>
}

export function useAnalytics() {
  const context = useContext(AnalyticsContext)
  if (!context) throw new Error('useAnalytics must be used inside AnalyticsProvider')
  return context
}
