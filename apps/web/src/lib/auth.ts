import { useAuthStore } from '@/stores/auth'

export function getAccessToken() {
  return useAuthStore.getState().accessToken
}

export function clearAuth() {
  useAuthStore.getState().clearAuth()
}
