import { apiClient } from './apiClient'

export const aiApi = {
  async practicePlan(handle, preferredPracticeMinutes) {
    const { data } = await apiClient.post('/ai/practice-plan', {
      handle,
      preferredPracticeMinutes,
    })
    return data.data
  },

  async upsolvingPlan(handle) {
    const { data } = await apiClient.post('/ai/upsolving-plan', { handle })
    return data.data
  },

  async chat(handle, message) {
    const { data } = await apiClient.post('/ai/chat', { handle, message })
    return data.data
  },
}
