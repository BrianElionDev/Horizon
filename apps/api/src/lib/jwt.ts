import jwt, { type SignOptions } from 'jsonwebtoken'
import type { AuthUser } from '@horizon/shared'

const secret = () => {
  const s = process.env.JWT_SECRET
  if (!s) throw new Error('JWT_SECRET is not set')
  return s
}

export function signAccessToken(user: AuthUser): string {
  const options: SignOptions = {
    expiresIn: (process.env.JWT_ACCESS_EXPIRY ?? '15m') as SignOptions['expiresIn'],
  }
  return jwt.sign(
    { sub: user.id, email: user.email, name: user.name, role: user.role },
    secret(),
    options
  )
}

export function verifyAccessToken(token: string): AuthUser {
  const payload = jwt.verify(token, secret()) as {
    sub: string
    email: string
    name: string | null
    role: string
  }
  return { id: payload.sub, email: payload.email, name: payload.name, role: payload.role }
}
