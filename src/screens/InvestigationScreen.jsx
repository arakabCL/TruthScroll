import { useEffect, useMemo, useRef, useState } from 'react'
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  TouchSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import { AnimatePresence, motion } from 'framer-motion'

const TOTAL_MS = 110_000 // 1:50

const VERDICTS = [
  { id: 'TRUE', label: 'TRUE', emoji: '✅', hint: 'It really happened' },
  { id: 'FALSE', label: 'FALSE', emoji: '❌', hint: 'Totally made up' },
  { id: 'MISLEADING', label: 'MISLEADING', emoji: '⚠️', hint: 'Real thing, twisted' },
  { id: 'SATIRE', label: 'SATIRE', emoji: '😂', hint: 'A joke — not real news' },
  { id: 'UNVERIFIABLE', label: 'UNVERIFIABLE', emoji: '❓', hint: "Can't tell either way" },
]

const typeIcon = (t) => {
  switch (t) {
    case 'article': return '📰'
    case 'tweet': return '🐦'
    case 'photo': return '🖼️'
    case 'document': return '📄'
    case 'video': return '📹'
    case 'blog': return '✍️'
    default: return '📎'
  }
}

export default function InvestigationScreen({ headline, onSubmit, onAbandon }) {
  const [timeLeftMs, setTimeLeftMs] = useState(TOTAL_MS)
  const [boardIds, setBoardIds] = useState([])
  const [verdict, setVerdict] = useState(null)
  const [activeDragItem, setActiveDragItem] = useState(null)
  const startRef = useRef(Date.now())

  useEffect(() => {
    const interval = setInterval(() => {
      const elapsed = Date.now() - startRef.current
      const left = Math.max(0, TOTAL_MS - elapsed)
      setTimeLeftMs(left)
      if (left === 0) {
        clearInterval(interval)
        doSubmit(verdict ?? 'UNVERIFIABLE', 0)
      }
    }, 100)
    return () => clearInterval(interval)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const pool = useMemo(
    () => headline.evidencePool.filter((e) => !boardIds.includes(e.id)),
    [headline.evidencePool, boardIds],
  )
  const board = useMemo(
    () => headline.evidencePool.filter((e) => boardIds.includes(e.id)),
    [headline.evidencePool, boardIds],
  )

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 120, tolerance: 6 } }),
  )

  const handleDragStart = (event) => {
    const item = headline.evidencePool.find((e) => e.id === event.active.id)
    setActiveDragItem(item ?? null)
  }

  const handleDragEnd = (event) => {
    setActiveDragItem(null)
    const { over, active } = event
    if (!over) return
    if (over.id === 'board') {
      setBoardIds((ids) => (ids.includes(active.id) ? ids : [...ids, active.id]))
    } else if (over.id === 'pool') {
      setBoardIds((ids) => ids.filter((x) => x !== active.id))
    }
  }

  const toggleBoard = (id) => {
    setBoardIds((ids) =>
      ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id],
    )
  }

  const doSubmit = (v, overrideTimeLeft) => {
    onSubmit({
      verdict: v,
      boardIds,
      timeLeftMs: overrideTimeLeft ?? timeLeftMs,
      totalMs: TOTAL_MS,
    })
  }

  const canSubmit = verdict && boardIds.length > 0

  const mins = Math.floor(timeLeftMs / 60000)
  const secs = Math.floor((timeLeftMs % 60000) / 1000)
  const tenths = Math.floor((timeLeftMs % 1000) / 100)
  const timeStressed = timeLeftMs < 30_000

  return (
    <div className="paper-texture grain relative h-[100dvh] w-full overflow-hidden text-desk-ink">
      {/* Top bar: Back • Steps • Timer */}
      <div className="relative z-20 flex items-center justify-between gap-3 border-b border-desk-rule/40 bg-desk-paper/90 px-4 py-2.5 pt-[max(env(safe-area-inset-top),10px)] backdrop-blur-md">
        <button
          onClick={onAbandon}
          className="press rounded-full border border-desk-rule bg-white px-3 py-1.5 text-[11px] font-bold uppercase tracking-widest text-desk-ink/70 hover:bg-desk-rule/20"
        >
          ← Back
        </button>

        <div className="hidden sm:flex items-center gap-2">
          <Step n={1} label="Pin" active={boardIds.length === 0} done={boardIds.length > 0} />
          <div className="h-px w-5 bg-desk-rule/50" />
          <Step n={2} label="Verdict" active={boardIds.length > 0 && !verdict} done={!!verdict} />
          <div className="h-px w-5 bg-desk-rule/50" />
          <Step n={3} label="Submit" active={!!verdict && boardIds.length > 0} done={false} />
        </div>

        <div
          className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 font-mono text-[13px] tabular-nums font-bold shadow-sm transition-colors ${
            timeStressed
              ? 'animate-pulse border-red-500/50 bg-red-500/10 text-red-600'
              : 'border-desk-rule/80 bg-white text-desk-ink'
          }`}
        >
          <span>⏱</span>
          <span>{String(mins).padStart(1, '0')}:{String(secs).padStart(2, '0')}</span>
        </div>
      </div>

      {/* Mobile-only step row */}
      <div className="sm:hidden flex items-center justify-center gap-2 border-b border-desk-rule/30 bg-white/60 px-3 py-2">
        <Step n={1} label="Pin" active={boardIds.length === 0} done={boardIds.length > 0} />
        <div className="h-px w-3 bg-desk-rule/50" />
        <Step n={2} label="Verdict" active={boardIds.length > 0 && !verdict} done={!!verdict} />
        <div className="h-px w-3 bg-desk-rule/50" />
        <Step n={3} label="Submit" active={!!verdict && boardIds.length > 0} done={false} />
      </div>

      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="mx-auto flex h-[calc(100dvh-105px)] sm:h-[calc(100dvh-58px)] w-full max-w-3xl flex-col gap-3 px-3 py-3 overflow-hidden">
          {/* Claim — compact horizontal card */}
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="relative shrink-0 overflow-hidden rounded-xl bg-gradient-to-br from-[#1a1c23] to-[#0a0b0e] p-3 pr-4 shadow-desk border border-white/5"
          >
            <div className="flex items-center gap-3">
              <div
                className={`relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-gradient-to-br ${headline.thumbnailGradient} text-2xl shadow-inner`}
              >
                {headline.video ? (
                  <video
                    src={headline.video}
                    muted
                    loop
                    autoPlay
                    playsInline
                    preload="metadata"
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                ) : (
                  <span>{headline.thumbnail}</span>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[10px] font-bold uppercase tracking-widest text-white/45">
                  @{headline.fakeSource}
                </div>
                <div className="mt-0.5 font-display text-[14px] sm:text-[15px] font-semibold leading-[1.25] text-white line-clamp-2">
                  {headline.headline}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Pinned strip — only what the player chose */}
          <Droppable id="board">
            <div className="shrink-0">
              <div className="mb-1.5 flex items-baseline justify-between">
                <div className="font-serif text-[13px] font-semibold text-desk-ink">
                  Your clues
                  <span className="ml-1.5 text-[11px] font-mono text-desk-ink/50">
                    ({board.length} pinned)
                  </span>
                </div>
                {board.length > 0 && (
                  <div className="text-[10px] font-mono uppercase tracking-widest text-desk-ink/45">
                    tap × to unpin
                  </div>
                )}
              </div>
              <div
                className={`min-h-[54px] rounded-xl border-2 border-dashed p-2 transition-colors ${
                  board.length === 0
                    ? 'border-desk-rule/50 bg-white/40'
                    : 'border-desk-accent/40 bg-desk-accent/5'
                }`}
              >
                {board.length === 0 ? (
                  <div className="flex h-[38px] items-center justify-center text-[12px] italic text-desk-ink/50">
                    Pin the clues you trust ↓
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-1.5">
                    <AnimatePresence>
                      {board.map((item) => (
                        <motion.button
                          key={item.id}
                          layout
                          initial={{ opacity: 0, scale: 0.85 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.85 }}
                          transition={{ type: 'spring', stiffness: 320, damping: 24 }}
                          onClick={() => toggleBoard(item.id)}
                          className="press flex items-center gap-1.5 rounded-full border border-desk-ink/80 bg-white px-2.5 py-1 text-[11px] font-semibold text-desk-ink shadow-sm hover:bg-desk-rule/20"
                        >
                          <span className="text-[13px] leading-none">{typeIcon(item.type)}</span>
                          <span className="max-w-[140px] truncate">{item.title}</span>
                          <span className="text-desk-ink/40 text-[13px] leading-none">×</span>
                        </motion.button>
                      ))}
                    </AnimatePresence>
                  </div>
                )}
              </div>
            </div>
          </Droppable>

          {/* Clues list — single scrollable column */}
          <div className="flex min-h-0 flex-1 flex-col">
            <div className="mb-1.5 flex items-baseline justify-between">
              <div className="font-serif text-[13px] font-semibold text-desk-ink">
                Clues to check
                <span className="ml-1.5 text-[11px] font-mono text-desk-ink/50">
                  ({pool.length})
                </span>
              </div>
              <div className="text-[10px] font-mono uppercase tracking-widest text-desk-ink/45">
                tap + to pin
              </div>
            </div>
            <Droppable id="pool" className="min-h-0 flex-1">
              <div className="flex h-full flex-col gap-1.5 overflow-y-auto pr-1 pb-1">
                {pool.map((item) => (
                  <DraggableEvidence
                    key={item.id}
                    item={item}
                    onTap={() => toggleBoard(item.id)}
                  />
                ))}
                {pool.length === 0 && (
                  <div className="rounded-md border border-dashed border-desk-rule/60 p-3 text-center text-[12px] italic text-desk-ink/50">
                    All clues pinned — time to pick a verdict!
                  </div>
                )}
              </div>
            </Droppable>
          </div>

          {/* Verdict + Submit — always visible bottom band */}
          <div className="shrink-0 rounded-2xl border border-desk-rule/40 bg-white/80 p-3 shadow-sm backdrop-blur-md">
            <div className="mb-2 flex items-center justify-between">
              <div className="font-serif text-[14px] font-bold text-desk-ink">
                So… is it real?
              </div>
              {verdict ? (
                <div className="text-[11px] italic text-desk-ink/70">
                  {VERDICTS.find((v) => v.id === verdict)?.hint}
                </div>
              ) : (
                <div className="text-[10px] font-mono uppercase tracking-widest text-desk-ink/50">
                  tap one ↓
                </div>
              )}
            </div>
            <div className="grid grid-cols-5 gap-1.5">
              {VERDICTS.map((v) => {
                const active = verdict === v.id
                return (
                  <button
                    key={v.id}
                    onClick={() => setVerdict(v.id)}
                    className={`press flex flex-col items-center gap-0.5 rounded-xl border px-1 py-2 transition-all duration-200 ${
                      active
                        ? 'border-desk-ink bg-desk-ink text-white shadow-md scale-[1.04]'
                        : 'border-desk-rule/50 bg-white text-desk-ink/80 hover:bg-desk-rule/10'
                    }`}
                  >
                    <span className="text-[20px] leading-none">{v.emoji}</span>
                    <span className="text-[9px] font-bold uppercase tracking-wider leading-tight text-center">
                      {v.label}
                    </span>
                  </button>
                )
              })}
            </div>
            <button
              onClick={() => canSubmit && doSubmit(verdict)}
              disabled={!canSubmit}
              className={`press mt-3 w-full rounded-xl py-3.5 text-center font-display text-[15px] font-bold uppercase tracking-widest transition-all duration-300 ${
                canSubmit
                  ? 'bg-desk-accent text-white shadow-desk hover:bg-red-600 ring-4 ring-desk-accent/20'
                  : 'cursor-not-allowed bg-desk-rule/30 text-desk-ink/40 border border-desk-rule/50'
              }`}
            >
              {canSubmit
                ? 'Lock it in →'
                : boardIds.length === 0
                ? 'Pin at least one clue ↑'
                : 'Pick a verdict ↑'}
            </button>
          </div>
        </div>

        <DragOverlay>
          {activeDragItem ? (
            <EvidenceCardVisual item={activeDragItem} dragging />
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  )
}

function Step({ n, label, active, done }) {
  return (
    <div
      className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 transition-all ${
        done
          ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-700'
          : active
          ? 'border-desk-accent bg-desk-accent text-white shadow-sm scale-[1.03]'
          : 'border-desk-rule/50 bg-white/70 text-desk-ink/50'
      }`}
    >
      <span
        className={`flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold ${
          done
            ? 'bg-emerald-500 text-white'
            : active
            ? 'bg-white text-desk-accent'
            : 'bg-desk-rule/30 text-desk-ink/60'
        }`}
      >
        {done ? '✓' : n}
      </span>
      <span className="text-[10px] font-bold uppercase tracking-wider">{label}</span>
    </div>
  )
}

function Droppable({ id, children, className = '' }) {
  const { isOver, setNodeRef } = useDroppable({ id })
  return (
    <div
      ref={setNodeRef}
      className={`${className} transition ${isOver ? 'ring-2 ring-desk-accent/70' : ''}`}
    >
      {children}
    </div>
  )
}

function DraggableEvidence({ item, onBoard = false, onTap }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: item.id,
  })
  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      onDoubleClick={onTap}
      style={{ opacity: isDragging ? 0.3 : 1, touchAction: 'manipulation' }}
    >
      <EvidenceCardVisual item={item} onBoard={onBoard} onTap={onTap} />
    </div>
  )
}

function EvidenceCardVisual({ item, onBoard = false, dragging = false, onTap }) {
  return (
    <div
      className={`relative select-none rounded-lg border bg-white pl-3 pr-10 py-2 text-desk-ink shadow-sm transition-all hover:shadow-md hover:border-desk-ink/40 ${
        onBoard ? 'border-desk-accent/50' : 'border-desk-rule/40'
      } ${dragging ? 'rotate-1 ring-2 ring-desk-accent shadow-xl z-50 scale-[1.02]' : ''}`}
    >
      <div className="flex items-center gap-2.5">
        <div className="text-[18px] leading-none shrink-0">{typeIcon(item.type)}</div>
        <div className="min-w-0 flex-1">
          <div className="text-[12px] font-semibold leading-snug text-desk-ink line-clamp-1">
            {item.title}
          </div>
          <div className="truncate text-[10px] font-mono uppercase tracking-wider text-desk-ink/55">
            {item.source}
          </div>
        </div>
      </div>
      {onTap && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            onTap()
          }}
          className={`absolute right-2 top-1/2 -translate-y-1/2 flex h-7 w-7 items-center justify-center rounded-full text-[16px] font-bold transition-all ${
            onBoard
              ? 'bg-desk-accent/15 text-desk-accent hover:bg-desk-accent/25'
              : 'bg-desk-ink/5 text-desk-ink/60 hover:bg-emerald-500/15 hover:text-emerald-700'
          }`}
          aria-label={onBoard ? 'unpin' : 'pin'}
        >
          {onBoard ? '×' : '+'}
        </button>
      )}
    </div>
  )
}
