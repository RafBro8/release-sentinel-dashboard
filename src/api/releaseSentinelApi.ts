import { API_BASE_URL } from '../config'

export type ApiStatusResponse = {
  service: string
  status: string
}

export async function getApiStatus(): Promise<ApiStatusResponse> {
  const response = await fetch(`${API_BASE_URL}/api/status`)

  if (!response.ok) {
    throw new Error(`API status request failed with ${response.status}`)
  }

  return response.json() as Promise<ApiStatusResponse>
}
