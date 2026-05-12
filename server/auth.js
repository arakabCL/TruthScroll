import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me'
const JWT_EXPIRES = '30d'

export const hashPassword = (pw) => bcrypt.hashSync(pw, 10)
export const verifyPassword = (pw, hash) => bcrypt.compareSync(pw, hash)

export const signToken = (user) =>
  jwt.sign({ uid: user.id, username: user.username }, JWT_SECRET, { expiresIn: JWT_EXPIRES })

export const verifyToken = (token) => {
  try { return jwt.verify(token, JWT_SECRET) } catch { return null }
}

export const requireAuth = (req, res, next) => {
  const header = req.headers.authorization || ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : null
  const payload = token ? verifyToken(token) : null
  if (!payload) return res.status(401).json({ error: 'Not authenticated' })
  req.user = payload
  next()
}

// Username: 3–20 chars, letters/numbers/underscore/dash
export const USERNAME_RE = /^[A-Za-z0-9_-]{3,20}$/

export const validateSignup = ({ username, password }) => {
  if (typeof username !== 'string' || !USERNAME_RE.test(username)) {
    return 'Username must be 3–20 letters, numbers, _ or -.'
  }
  if (typeof password !== 'string' || password.length < 6 || password.length > 100) {
    return 'Password must be 6–100 characters.'
  }
  return null
}
