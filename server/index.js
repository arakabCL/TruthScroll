import express from 'express'
import cors from 'cors'
import { fileURLToPath } from 'node:url'
import { dirname, join, resolve } from 'node:path'
import { existsSync } from 'node:fs'
import { db } from './db.js'
import {
  hashPassword,
  verifyPassword,
  signToken,
  requireAuth,
  validateSignup,
} from './auth.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const ROOT = resolve(__dirname, '..')
const DIST = join(ROOT, 'dist')

const app = express()
app.use(cors())
app.use(express.json({ limit: '64kb' }))

const userPublic = (row) => ({ id: row.id, username: row.username })

const getProgress = db.prepare('SELECT * FROM progress WHERE user_id = ?')
const insertProgress = db.prepare(`
  INSERT INTO progress (user_id, total_xp, skill_xp_json, grade_history, cases_completed, best_grade, updated_at)
  VALUES (?, 0, '{}', '[]', 0, NULL, ?)
`)
const updateProgress = db.prepare(`
  UPDATE progress
  SET total_xp = ?, skill_xp_json = ?, grade_history = ?, cases_completed = ?, best_grade = ?, updated_at = ?
  WHERE user_id = ?
`)

const progressOut = (row) => ({
  totalXP: row.total_xp,
  skillXP: JSON.parse(row.skill_xp_json || '{}'),
  gradeHistory: JSON.parse(row.grade_history || '[]'),
  casesCompleted: row.cases_completed,
  bestGrade: row.best_grade,
})

/* ─── Auth ─── */

app.post('/api/auth/signup', (req, res) => {
  const { username, password } = req.body || {}
  const err = validateSignup({ username, password })
  if (err) return res.status(400).json({ error: err })

  const existing = db.prepare('SELECT id FROM users WHERE username = ?').get(username)
  if (existing) return res.status(409).json({ error: 'Username already taken.' })

  const now = Date.now()
  const info = db
    .prepare('INSERT INTO users (username, password_hash, created_at) VALUES (?, ?, ?)')
    .run(username, hashPassword(password), now)

  insertProgress.run(info.lastInsertRowid, now)

  const user = { id: info.lastInsertRowid, username }
  res.json({ token: signToken(user), user: userPublic(user) })
})

app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body || {}
  if (!username || !password) return res.status(400).json({ error: 'Username and password required.' })

  const row = db.prepare('SELECT * FROM users WHERE username = ?').get(username)
  if (!row || !verifyPassword(password, row.password_hash)) {
    return res.status(401).json({ error: 'Wrong username or password.' })
  }

  res.json({ token: signToken(row), user: userPublic(row) })
})

app.get('/api/auth/me', requireAuth, (req, res) => {
  const row = db.prepare('SELECT id, username FROM users WHERE id = ?').get(req.user.uid)
  if (!row) return res.status(404).json({ error: 'User not found.' })

  let p = getProgress.get(row.id)
  if (!p) {
    insertProgress.run(row.id, Date.now())
    p = getProgress.get(row.id)
  }
  res.json({ user: userPublic(row), progress: progressOut(p) })
})

/* ─── Progress sync ─── */

const GRADE_ORDER = { F: 0, D: 1, C: 2, B: 3, A: 4, S: 5 }
const bestOf = (a, b) => {
  if (!a) return b
  if (!b) return a
  return (GRADE_ORDER[b] ?? -1) > (GRADE_ORDER[a] ?? -1) ? b : a
}

app.post('/api/progress', requireAuth, (req, res) => {
  const { totalXP, skillXP, gradeHistory, casesCompleted } = req.body || {}

  if (!Number.isFinite(totalXP) || totalXP < 0) return res.status(400).json({ error: 'Invalid totalXP.' })
  if (typeof skillXP !== 'object' || skillXP === null) return res.status(400).json({ error: 'Invalid skillXP.' })
  if (!Array.isArray(gradeHistory)) return res.status(400).json({ error: 'Invalid gradeHistory.' })
  if (!Number.isFinite(casesCompleted) || casesCompleted < 0) return res.status(400).json({ error: 'Invalid casesCompleted.' })

  let p = getProgress.get(req.user.uid)
  if (!p) {
    insertProgress.run(req.user.uid, Date.now())
    p = getProgress.get(req.user.uid)
  }

  const trimmedHistory = gradeHistory.slice(-50).filter((g) => typeof g === 'string')
  const newBest = trimmedHistory.reduce(bestOf, p.best_grade)

  // Monotonic: never let XP go backwards
  const nextXP = Math.max(p.total_xp, Math.floor(totalXP))
  const nextCases = Math.max(p.cases_completed, Math.floor(casesCompleted))

  updateProgress.run(
    nextXP,
    JSON.stringify(skillXP),
    JSON.stringify(trimmedHistory),
    nextCases,
    newBest,
    Date.now(),
    req.user.uid,
  )

  res.json({ progress: progressOut(getProgress.get(req.user.uid)) })
})

/* ─── Leaderboard ─── */

app.get('/api/leaderboard', (req, res) => {
  const rows = db.prepare(`
    SELECT u.id, u.username, p.total_xp, p.cases_completed, p.best_grade
    FROM users u
    JOIN progress p ON p.user_id = u.id
    ORDER BY p.total_xp DESC, p.cases_completed DESC, u.id ASC
    LIMIT 100
  `).all()

  res.json({
    leaderboard: rows.map((r, i) => ({
      rank: i + 1,
      userId: r.id,
      username: r.username,
      totalXP: r.total_xp,
      casesCompleted: r.cases_completed,
      bestGrade: r.best_grade,
    })),
  })
})

/* ─── Static SPA in production ─── */

if (existsSync(DIST)) {
  app.use(express.static(DIST))
  app.use((req, res, next) => {
    if (req.method !== 'GET' || req.path.startsWith('/api/')) return next()
    res.sendFile(join(DIST, 'index.html'))
  })
}

// In dev we run alongside Vite (which also reads PORT), so API_PORT takes precedence.
// In production (Railway) only PORT is set, and we listen on that.
const PORT = Number(process.env.API_PORT) || Number(process.env.PORT) || 3001
app.listen(PORT, '0.0.0.0', () => {
  console.log(`TruthScroll API listening on :${PORT}`)
})
