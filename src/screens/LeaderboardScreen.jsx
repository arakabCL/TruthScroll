import { useEffect, useState } from 'react'
import { api } from '../lib/api.js'
import { rankFor } from '../lib/scoring.js'

export default function LeaderboardScreen({ onBack, currentUsername }) {
  const [rows, setRows] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false
    api.leaderboard()
      .then(({ leaderboard }) => { if (!cancelled) setRows(leaderboard) })
      .catch((e) => { if (!cancelled) setError(e.message) })
    return () => { cancelled = true }
  }, [])

  return (
    <div className="relative h-[100dvh] w-full overflow-hidden bg-[#1a1f2e] text-white no-select flex flex-col">
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
        <button
          onClick={onBack}
          className="press rounded-full border border-white/25 bg-black/30 px-4 py-1.5 font-mono text-[11px] uppercase tracking-widest text-white/80 hover:bg-black/50"
        >
          ← Back
        </button>
        <div className="font-chaos text-2xl tracking-tight">LEADERBOARD</div>
        <div className="w-[68px]" />
      </div>

      <div className="flex-1 overflow-auto px-4 py-4">
        {error && (
          <div className="rounded-lg bg-rose-500/15 ring-1 ring-rose-400/40 text-rose-200 text-sm px-3 py-2 mb-3">
            {error}
          </div>
        )}

        {!rows && !error && (
          <div className="text-white/60 text-center mt-10 font-mono text-sm uppercase tracking-widest">
            Loading…
          </div>
        )}

        {rows && rows.length === 0 && (
          <div className="text-white/60 text-center mt-10 font-mono text-sm uppercase tracking-widest">
            No agents on the board yet. Be the first.
          </div>
        )}

        {rows && rows.length > 0 && (
          <ol className="mx-auto max-w-md space-y-2">
            {rows.map((r) => {
              const isMe = currentUsername && r.username.toLowerCase() === currentUsername.toLowerCase()
              const { current } = rankFor(r.totalXP)
              return (
                <li
                  key={r.userId}
                  className={`flex items-center gap-3 rounded-xl px-3 py-2.5 ring-1 ${isMe ? 'bg-feed-lime/15 ring-feed-lime/50' : 'bg-white/5 ring-white/10'}`}
                >
                  <div className={`w-8 text-center font-display font-bold ${r.rank === 1 ? 'text-amber-300' : r.rank === 2 ? 'text-slate-200' : r.rank === 3 ? 'text-orange-300' : 'text-white/60'}`}>
                    {r.rank <= 3 ? ['🥇','🥈','🥉'][r.rank - 1] : `#${r.rank}`}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="truncate font-display font-bold">
                      {r.username}
                      {isMe && <span className="ml-2 text-[10px] font-mono uppercase tracking-widest text-feed-lime">you</span>}
                    </div>
                    <div className="text-[11px] font-mono uppercase tracking-widest text-white/55">
                      {current.name} · {r.casesCompleted} {r.casesCompleted === 1 ? 'case' : 'cases'}
                      {r.bestGrade && <> · best {r.bestGrade}</>}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-display font-bold text-feed-lime tabular-nums">{r.totalXP.toLocaleString()}</div>
                    <div className="text-[10px] font-mono uppercase tracking-widest text-white/50">XP</div>
                  </div>
                </li>
              )
            })}
          </ol>
        )}
      </div>
    </div>
  )
}
