'use client'

import { useEffect, useRef } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuthStore } from '@/stores/auth'
import type { AuthUser } from '@horizon/shared'

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'

const PUBLIC_PATHS = ['/login']

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { user, setAuth, clearAuth } = useAuthStore()
  const router = useRouter()
  const pathname = usePathname()
  const initialized = useRef(false)
  const bootstrapping = useRef(false)

  useEffect(() => {
    const isPublic = PUBLIC_PATHS.some((p) => pathname.startsWith(p))

    // Handle initial bootstrap
    if (!initialized.current && !bootstrapping.current) {
      bootstrapping.current = true
      
      async function bootstrap() {
        try {
          const res = await fetch(`${API_BASE}/api/v1/auth/refresh`, {
            method: 'POST',
            credentials: 'include',
          })
          if (!res.ok) throw new Error('no session')

          const json = await res.json()
          const token: string = json.data.accessToken

          const meRes = await fetch(`${API_BASE}/api/v1/auth/me`, {
            headers: { Authorization: `Bearer ${token}` },
            credentials: 'include',
          })
          if (!meRes.ok) throw new Error('no user')

          const meJson = await meRes.json()
          const userData: AuthUser = meJson.data

          setAuth(token, userData)
          if (isPublic) router.replace('/inbox')
        } catch {
          clearAuth()
          if (!isPublic) router.replace('/login')
        } finally {
          initialized.current = true
          bootstrapping.current = false
        }
      }

      bootstrap()
      return
    }

    // Handle subsequent navigations
    if (initialized.current && !user && !isPublic) {
      router.replace('/login')
    }
  }, [pathname, user, setAuth, clearAuth, router])


  return <>{children}</>
}
