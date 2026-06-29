import { apiClient } from './apiClient'

export const analyticsApi = {
  async analyze(handle) {
    const { data } = await apiClient.post(`/analytics/analyze/${encodeURIComponent(handle)}`)
    return data.data
  },

  async getSummary(handle) {
    const { data } = await apiClient.get(`/analytics/summary/${encodeURIComponent(handle)}`)
    return data.data
  },

  async getWeakness(handle) {
    const { data } = await apiClient.get(`/analytics/weakness/${encodeURIComponent(handle)}`)
    return data.data
  },

  async getRating(handle) {
    const { data } = await apiClient.get(`/analytics/rating/${encodeURIComponent(handle)}`)
    return data.data
  },

  async getVerdicts(handle) {
    const { data } = await apiClient.get(`/analytics/verdicts/${encodeURIComponent(handle)}`)
    return data.data
  },

  async getUpsolving(handle) {
    const { data } = await apiClient.get(`/analytics/upsolving/${encodeURIComponent(handle)}`)
    return data.data
  },
}
