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

      <div className="relative z-10 w-full px-6 flex flex-col items-center">
        <div className="w-full max-w-3xl flex flex-col items-center text-center">
          <div className="font-chaos text-[clamp(44px,8vw,72px)] leading-[0.95] tracking-tight text-[#fef3c7] drop-shadow-[0_4px_0_#5a3a1a,0_10px_30px_rgba(0,0,0,0.6)] whitespace-nowrap">
            TRUTH<span className="text-[#c82424]">SCROLL</span>
          </div>
          <div className="mt-3 font-serif italic text-[#fef3c7]/90 text-base max-w-md drop-shadow-[0_2px_4px_rgba(0,0,0,0.55)]">
            {mode === 'login' ? 'Sign in to continue your investigation.' : 'Create an account to save your progress.'}
          </div>
        </div>

        <div className="mt-7 w-full max-w-md rounded-2xl bg-black/60 backdrop-blur-md ring-1 ring-white/15 p-6 shadow-2xl">
          <div className="flex rounded-full bg-black/40 p-1 mb-5 text-sm font-mono uppercase tracking-widest">
            <button
              type="button"
              onClick={() => setMode('login')}
              className={`flex-1 rounded-full py-2.5 transition ${mode === 'login' ? 'bg-[#f4a723] text-[#2d1d0c] font-bold' : 'text-[#fef3c7]/70'}`}
            >
              Log in
            </button>
            <button
              type="button"
              onClick={() => setMode('signup')}
              className={`flex-1 rounded-full py-2.5 transition ${mode === 'signup' ? 'bg-[#f4a723] text-[#2d1d0c] font-bold' : 'text-[#fef3c7]/70'}`}
            >
              Sign up
            </button>
          </div>

          <form onSubmit={submit} className="space-y-4">
            <label className="block">
              <span className="block text-xs font-mono uppercase tracking-widest text-white/70 mb-1.5">Username</span>
              <input
                type="text"
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full rounded-lg bg-white/10 ring-1 ring-white/15 px-4 py-3 text-base text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-[#f4a723]"
                placeholder="detective_42"
                required
                maxLength={20}
              />
            </label>
            <label className="block">
              <span className="block text-xs font-mono uppercase tracking-widest text-white/70 mb-1.5">Password</span>
              <input
                type="password"
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg bg-white/10 ring-1 ring-white/15 px-4 py-3 text-base text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-[#f4a723]"
                placeholder="At least 6 characters"
                required
                minLength={6}
                maxLength={100}
              />
            </label>
            {mode === 'signup' && (
              <label className="block">
                <span className="block text-xs font-mono uppercase tracking-widest text-white/70 mb-1.5">Confirm password</span>
                <input
                  type="password"
                  autoComplete="new-password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  className="w-full rounded-lg bg-white/10 ring-1 ring-white/15 px-4 py-3 text-base text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-[#f4a723]"
                  placeholder="Repeat your password"
                  required
                  minLength={6}
                  maxLength={100}
                />
              </label>
            )}

            {shownError && (
              <div
                key={shownError}
                role="alert"
                className="flex items-start gap-2 rounded-lg bg-rose-500/25 ring-2 ring-rose-400/70 text-rose-50 text-sm font-medium px-3.5 py-3 shadow-[0_0_18px_rgba(244,63,94,0.35)] animate-shake"
              >
                <span className="text-lg leading-none">⚠️</span>
                <span className="flex-1">{shownError}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={busy}
              className="press w-full rounded-full bg-[#f4a723] border-[3px] border-[#8a5326] px-6 py-3.5 font-display text-base font-extrabold uppercase tracking-widest text-[#2d1d0c] shadow-[0_6px_0_#8a5326,0_14px_28px_-6px_rgba(82,42,16,0.55)] hover:scale-[1.02] active:scale-95 transition-transform disabled:opacity-50"
            >
              {busy ? 'Working…' : mode === 'login' ? 'Log in →' : 'Create account →'}
            </button>
          </form>
        </div>

        {onContinueAsGuest && (
          <button
            type="button"
            onClick={onContinueAsGuest}
            className="mt-5 w-full text-center text-white/80 hover:text-white text-sm font-mono uppercase tracking-widest"
          >
            Continue as guest →
          </button>
        )}
      </div>
    </div>
  )
}
