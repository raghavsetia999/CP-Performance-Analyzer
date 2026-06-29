import { apiClient } from './apiClient'

export const recommendationApi = {
  async get(handle) {
    const { data } = await apiClient.get(`/recommendations/${encodeURIComponent(handle)}`)
    return data.data
  },
}
