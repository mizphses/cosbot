import { SignJWT, jwtVerify } from 'jose'

type sessionPayload = {
  email: string
  isAdmin?: boolean
  uid: string
  jti: string
}

export const createToken = async (payload: sessionPayload, secret: string) => {
  const jwt = new SignJWT(payload)
  const signKey = new TextEncoder().encode(secret)

  return jwt
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setIssuer('https://cos.fuminori.workers.dev')
    .setAudience('https://cos.fuminori.workers.dev')
    .setExpirationTime('2h')
    .sign(signKey)
}

export const verifyToken = async (token: string, secret: string) => {
  const verifyKey = new TextEncoder().encode(secret)
  const { payload } = await jwtVerify(token, verifyKey, {
    algorithms: ['HS256'],
    issuer: 'https://cos.fuminori.workers.dev',
    audience: 'https://cos.fuminori.workers.dev',
  })

  return payload as sessionPayload
}
