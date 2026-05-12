import { useEffect, useState } from 'react'
import { useAuth } from '../lib/auth-context.jsx'

export default function AuthScreen({ onContinueAsGuest, onAuthed }) {
  const { login, signup, error, clearError } = useAuth()
  const [mode, setMode] = useState('login') // 'login' | 'signup'
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [busy, setBusy] = useState(false)
  const [localError, setLocalError] = useState(null)

  useEffect(() => {
    const img = new Image()
    img.src = '/start.png'
  }, [])

  useEffect(() => { clearError(); setLocalError(null) }, [mode, clearError])

  const submit = async (e) => {
    e.preventDefault()
    if (busy) return
    setLocalError(null)
    clearError()

    if (mode === 'signup' && password !== confirm) {
      setLocalError("Passwords don't match.")
      return
    }

    setBusy(true)
    const ok = mode === 'login'
      ? await login(username, password)
      : await signup(username, password)
    setBusy(false)
    if (ok) onAuthed?.()
  }

  const shownError = localError || error

  return (
    <div className="relative h-[100dvh] w-full overflow-hidden bg-[#3d5775] no-select flex items-center justify-center">
      <div className="absolute inset-0 sm:inset-auto sm:left-1/2 sm:top-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:h-[max(100dvh,calc(100vw*9/16))] sm:w-[max(100vw,calc(100dvh*16/9))]">
        <img
          src="/start.png"
          alt=""
          aria-hidden
          draggable={false}
          className="absolute inset-0 h-full w-full object-cover pointer-events-none select-none"
        />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0.1)_0%,rgba(0,0,0,0.7)_85%)] pointer-events-none" />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-sm px-6 flex flex-col items-center">
        <div className="w-full text-center">
          <div className="font-chaos text-[clamp(34px,7vw,56px)] leading-none tracking-tight text-white drop-shadow-[0_8px_30px_rgba(0,0,0,0.6)]">
            TRUTH<span className="text-feed-accent">SCROLL</span>
          </div>
          <div className="mt-2 font-serif italic text-white/80 text-sm">
            {mode === 'login' ? 'Sign in to continue your investigation.' : 'Create an account to save your progress.'}
          </div>
        </div>

        <div className="mt-6 rounded-2xl bg-black/55 backdrop-blur-md ring-1 ring-white/15 p-5 shadow-2xl">
          <div className="flex rounded-full bg-black/40 p-1 mb-4 text-[12px] font-mono uppercase tracking-widest">
            <button
              type="button"
              onClick={() => setMode('login')}
              className={`flex-1 rounded-full py-1.5 transition ${mode === 'login' ? 'bg-feed-lime text-black' : 'text-white/70'}`}
            >
              Log in
            </button>
            <button
              type="button"
              onClick={() => setMode('signup')}
              className={`flex-1 rounded-full py-1.5 transition ${mode === 'signup' ? 'bg-feed-lime text-black' : 'text-white/70'}`}
            >
              Sign up
            </button>
          </div>

          <form onSubmit={submit} className="space-y-3">
            <label className="block">
              <span className="block text-[10px] font-mono uppercase tracking-widest text-white/60 mb-1">Username</span>
              <input
                type="text"
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full rounded-lg bg-white/10 ring-1 ring-white/15 px-3 py-2 text-white placeholder-white/30 focus:outline-none focus:ring-feed-lime"
                placeholder="detective_42"
                required
                maxLength={20}
              />
            </label>
            <label className="block">
              <span className="block text-[10px] font-mono uppercase tracking-widest text-white/60 mb-1">Password</span>
              <input
                type="password"
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg bg-white/10 ring-1 ring-white/15 px-3 py-2 text-white placeholder-white/30 focus:outline-none focus:ring-feed-lime"
                placeholder="At least 6 characters"
                required
                minLength={6}
                maxLength={100}
              />
            </label>
            {mode === 'signup' && (
              <label className="block">
                <span className="block text-[10px] font-mono uppercase tracking-widest text-white/60 mb-1">Confirm password</span>
                <input
                  type="password"
                  autoComplete="new-password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  className="w-full rounded-lg bg-white/10 ring-1 ring-white/15 px-3 py-2 text-white placeholder-white/30 focus:outline-none focus:ring-feed-lime"
                  placeholder="Repeat your password"
                  required
                  minLength={6}
                  maxLength={100}
                />
              </label>
            )}

            {shownError && (
              <div className="rounded-lg bg-rose-500/15 ring-1 ring-rose-400/40 text-rose-200 text-sm px-3 py-2">
                {shownError}
              </div>
            )}

            <button
              type="submit"
              disabled={busy}
              className="press w-full rounded-full bg-feed-lime px-6 py-3 font-display text-sm font-bold uppercase tracking-widest text-black shadow-[0_0_24px_rgba(204,255,0,0.45)] disabled:opacity-50"
            >
              {busy ? 'Working…' : mode === 'login' ? 'Log in →' : 'Create account →'}
            </button>
          </form>
        </div>

        {onContinueAsGuest && (
          <button
            type="button"
            onClick={onContinueAsGuest}
            className="mt-4 w-full text-center text-white/70 hover:text-white text-sm font-mono uppercase tracking-widest"
          >
            Continue as guest →
          </button>
        )}
      </div>
    </div>
  )
}
