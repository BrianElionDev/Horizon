export interface User {
  id: string
  email: string
  name: string | null
  role: string
  createdAt: string
  updatedAt: string
}

export interface Session {
  id: string
  userId: string
  expiresAt: string
  createdAt: string
}

export interface AuthUser {
  id: string
  email: string
  name: string | null
  role: string
}
