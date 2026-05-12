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
import EvidenceViewer from '../components/EvidenceViewer.jsx'
import PinReviewModal from '../components/PinReviewModal.jsx'
import { TAGS, tagById } from '../lib/scoring.js'

const TOTAL_MS = 300_000 // 5:00 — speed bonus rewards finishing well under the limit

// Live speed-bonus indicator. Mirrors scoreSpeed() in lib/scoring.js — keep in sync.
// Speed only pays out on a CORRECT verdict; the pill shows the max you could earn right now.
const currentSpeedTier = (timeLeftMs) => {
  const elapsedMs = TOTAL_MS - timeLeftMs
  if (elapsedMs <= 2 * 60_000) return { id: 'UNDER_2', label: 'Under 2 min', emoji: '⚡', pts: 50, color: 'text-yellow-300' }
  if (elapsedMs <= 4 * 60_000) return { id: 'UNDER_4', label: '2–4 min',     emoji: '🔥', pts: 25, color: 'text-orange-300' }
  return { id: 'OVER_4', label: 'Over 4 min', emoji: '🕐', pts: 0, color: 'text-rose-300' }
}

const VERDICTS = [
  { id: 'TRUE', label: 'TRUE', emoji: '✅', hint: 'It really happened' },
  { id: 'FALSE', label: 'FALSE', emoji: '❌', hint: 'Totally made up' },
  { id: 'MISLEADING', label: 'MISLEADING', emoji: '⚠️', hint: 'Real thing, twisted' },
  { id: 'SATIRE', label: 'SATIRE', emoji: '😂', hint: 'A joke' },
  { id: 'UNVERIFIABLE', label: 'UNVERIF', emoji: '❓', hint: "Can't tell" },
]

const typeIcon = (t) => {
  switch (t) {
    case 'article': return '📰'
    case 'tweet':   return '🐦'
    case 'tiktok':  return '📱'
    case 'reddit':  return '👽'
    case 'photo':   return '🖼️'
    case 'document':return '📄'
    case 'paper':   return '🧪'
    case 'report':  return '🛰️'
    case 'video':   return '📹'
    case 'blog':    return '✍️'
    default:        return '📎'
  }
}

const typeLabel = (t) => {
  switch (t) {
    case 'tiktok': return 'TIKTOK'
    case 'tweet':  return 'X POST'
    case 'paper':  return 'PAPER'
    case 'report': return 'REPORT'
    case 'reddit': return 'REDDIT'
    default:       return (t || 'doc').toUpperCase()
  }
}

export default function InvestigationScreen({ headline, onSubmit, onAbandon }) {
  const [timeLeftMs, setTimeLeftMs] = useState(TOTAL_MS)
  // Store pinned items as { id, x, y, rotate }
  const [boardItems, setBoardItems] = useState([])
  const [verdict, setVerdict] = useState(null)
  const [activeDragItem, setActiveDragItem] = useState(null)
  // Live drag offset (in board %) for the item currently being moved — used so the
  // red string follows the doc as it's dragged around, not just on drop.
  const [dragOffset, setDragOffset] = useState(null) // { id, dx, dy } or null
  const [boardScale, setBoardScale] = useState(1)
  // Which evidence folders the detective has opened (and is therefore allowed to pin)
  const [openedIds, setOpenedIds] = useState(() => new Set())
  // Which evidence (if any) the detective is currently reading in the modal
  const [viewingId, setViewingId] = useState(null)
  // Which pinned doc is being reviewed (tag + note)
  const [reviewingId, setReviewingId] = useState(null)
  // Transient "Open the folder first" toast
  const [lockToast, setLockToast] = useState(false)
  const startRef = useRef(Date.now())
  const boardRef = useRef(null)

  const openEvidence = (id) => {
    setOpenedIds((prev) => {
      if (prev.has(id)) return prev
      const next = new Set(prev)
      next.add(id)
      return next
    })
    setViewingId(id)
  }

  const flashLockToast = () => {
    setLockToast(true)
    window.clearTimeout(flashLockToast._t)
    flashLockToast._t = window.setTimeout(() => setLockToast(false), 1600)
  }

  const viewingItem = useMemo(
    () => headline.evidencePool.find((e) => e.id === viewingId) || null,
    [headline.evidencePool, viewingId],
  )

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
    () => headline.evidencePool.filter((e) => !boardItems.some((b) => b.id === e.id)),
    [headline.evidencePool, boardItems],
  )
  const board = useMemo(
    () =>
      headline.evidencePool
        .filter((e) => boardItems.some((b) => b.id === e.id))
        .map((e) => ({
          ...e,
          boardData: boardItems.find((b) => b.id === e.id),
        })),
    [headline.evidencePool, boardItems],
  )

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 120, tolerance: 6 } }),
  )

  const handleWheel = (e) => {
    setBoardScale(s => Math.min(Math.max(s - e.deltaY * 0.005, 0.4), 2.5))
  }

  const handleDragStart = (event) => {
    const item = headline.evidencePool.find((e) => e.id === event.active.id)
    setActiveDragItem(item ?? null)
    setDragOffset(null)
  }

  const handleDragMove = (event) => {
    const { active, delta } = event
    if (!active) return
    const rect = boardRef.current?.getBoundingClientRect()
    if (!rect || rect.width === 0 || rect.height === 0) return
    setDragOffset({
      id: active.id,
      dx: (delta.x / rect.width) * 100,
      dy: (delta.y / rect.height) * 100,
    })
  }

  const handleDragEnd = (event) => {
    setActiveDragItem(null)
    setDragOffset(null)
    const { over, active } = event
    if (!over) return
    
    if (over.id === 'board') {
      const rect = boardRef.current?.getBoundingClientRect()
      if (!rect || !active.rect.current.translated) return

      const { top, left, width, height } = active.rect.current.translated
      
      // Calculate center of the dragged item relative to the board
      const centerX = left - rect.left + width / 2
      const centerY = top - rect.top + height / 2
      
      // Convert to percentages so it stays relative if the window resizes
      const xPercent = (centerX / rect.width) * 100
      const yPercent = (centerY / rect.height) * 100
      
      let didAddNew = false
      setBoardItems((prev) => {
        const exists = prev.find((p) => p.id === active.id)
        if (exists) {
          // Update position if already on board — preserve tag + note
          return prev.map((p) =>
            p.id === active.id ? { ...p, x: xPercent, y: yPercent } : p
          )
        }
        didAddNew = true
        return [
          ...prev,
          {
            id: active.id,
            x: xPercent,
            y: yPercent,
            rotate: (Math.random() * 12 - 6).toFixed(1) + 'deg',
            tag: null,
            note: '',
          },
        ]
      })
      // After a brand-new pin, open the tag + note review modal automatically.
      if (didAddNew) {
        setTimeout(() => setReviewingId(active.id), 50)
      }
    } else if (over.id === 'pool') {
      // Remove from board if dropped back in the pool
      setBoardItems((prev) => prev.filter((x) => x.id !== active.id))
    }
  }

  const toggleBoard = (id) => {
    // Allows double tap to remove from board
    setBoardItems((prev) =>
      prev.some((b) => b.id === id)
        ? prev.filter((x) => x.id !== id)
        : [...prev, { id, x: 50, y: 50, rotate: '0deg' }]
    )
  }

  const doSubmit = (v, overrideTimeLeft) => {
    onSubmit({
      verdict: v,
      pins: boardItems.map((b) => ({ id: b.id, tag: b.tag, note: b.note || '' })),
      timeLeftMs: overrideTimeLeft ?? timeLeftMs,
      totalMs: TOTAL_MS,
    })
  }

  const allPinsTagged = boardItems.length > 0 && boardItems.every((b) => b.tag)
  const canSubmit = verdict && allPinsTagged

  const reviewingItem = useMemo(() => {
    if (!reviewingId) return null
    const board = boardItems.find((b) => b.id === reviewingId)
    if (!board) return null
    const item = headline.evidencePool.find((e) => e.id === reviewingId)
    return item ? { item, board } : null
  }, [reviewingId, boardItems, headline.evidencePool])

  const savePinReview = ({ tag, note }) => {
    setBoardItems((prev) => prev.map((p) => p.id === reviewingId ? { ...p, tag, note } : p))
    setReviewingId(null)
  }
  const cancelPinReview = () => setReviewingId(null)
  const unpinReviewed = () => {
    setBoardItems((prev) => prev.filter((p) => p.id !== reviewingId))
    setReviewingId(null)
  }

  const mins = Math.floor(timeLeftMs / 60000)
  const secs = Math.floor((timeLeftMs % 60000) / 1000)
  const timeStressed = timeLeftMs < 30_000
  const liveTier = currentSpeedTier(timeLeftMs)

  return (
    <div className="bg-[#21252d] relative h-[100dvh] w-full overflow-hidden text-desk-paper flex flex-col shadow-[inset_0_0_120px_rgba(0,0,0,0.5)]">
      {/* Subtle wall texture */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-plus-lighter" style={{ backgroundImage: `repeating-linear-gradient(45deg, #fff 0, #fff 1px, transparent 1px, transparent 10px)` }} />
      {/* Top bar: Back • Timer */}
      <div className="relative z-20 flex items-center justify-between gap-3 bg-black/35 px-4 sm:px-6 py-3 pt-[max(env(safe-area-inset-top),14px)] backdrop-blur-md shadow-md border-b border-black/20">
        <button
          onClick={onAbandon}
          className="press flex items-center gap-1.5 rounded-full border-2 border-white/25 bg-black/55 px-4 sm:px-5 py-2 sm:py-2.5 text-[14px] sm:text-[15px] font-bold uppercase tracking-widest text-white hover:bg-white/10 shadow-md"
        >
          <span className="text-[18px] leading-none">←</span>
          <span>Back</span>
        </button>

        <div className="flex items-center gap-2 sm:gap-3">
          {/* Live speed-bonus tier — bigger so kids see what they're racing for */}
          <div
            title="Faster finishes earn a bigger speed bonus."
            className={`hidden sm:flex items-center gap-1.5 rounded-full border-2 border-white/20 bg-black/45 px-3.5 py-2 font-mono text-[14px] uppercase tracking-widest shadow-md ${liveTier.color}`}
          >
            <span aria-hidden className="text-[18px] leading-none">{liveTier.emoji}</span>
            <span className="font-bold">+{liveTier.pts}</span>
            <span className="text-white/65 normal-case tracking-normal">speed bonus</span>
          </div>
          {/* Mobile-condensed speed pill */}
          <div
            title="Faster finishes earn a bigger speed bonus."
            className={`sm:hidden flex items-center gap-1 rounded-full border-2 border-white/20 bg-black/45 px-2.5 py-1.5 font-mono text-[14px] font-bold shadow-md ${liveTier.color}`}
          >
            <span aria-hidden className="text-[16px] leading-none">{liveTier.emoji}</span>
            <span>+{liveTier.pts}</span>
          </div>

          <div
            className={`flex items-center gap-2 rounded-full border-2 px-4 sm:px-5 py-2 sm:py-2.5 font-mono text-[16px] sm:text-[18px] tabular-nums font-bold shadow-md transition-colors ${
              timeStressed
                ? 'animate-pulse border-red-500/60 bg-red-500/25 text-red-300'
                : 'border-white/25 bg-black/55 text-white'
            }`}
          >
            <span className="text-[16px] sm:text-[18px] leading-none">⏱</span>
            <span>{String(mins).padStart(1, '0')}:{String(secs).padStart(2, '0')}</span>
          </div>
        </div>
      </div>

      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragMove={handleDragMove}
        onDragEnd={handleDragEnd}
      >
        {/* Main Corkboard Area */}
        <div className="relative flex-1 w-full p-4 sm:p-6 lg:p-8 overflow-hidden flex flex-col items-center justify-center" onWheel={handleWheel}>
          {/* Zoom Controls */}
          <div className="absolute top-4 right-4 sm:top-8 sm:right-8 z-40 flex flex-col items-center bg-[#fdfcf9]/90 backdrop-blur border border-[#e6ded3] shadow-sm rounded-lg overflow-hidden text-[#1c1b18]/60">
            <button onClick={() => setBoardScale(s => Math.min(s + 0.15, 2.5))} className="p-2 sm:px-3 hover:bg-black/5 hover:text-black font-bold text-lg press">+</button>
            <div className="w-full h-[1px] bg-[#e6ded3]" />
            <button onClick={() => setBoardScale(s => Math.max(s - 0.15, 0.4))} className="p-2 sm:px-3 hover:bg-black/5 hover:text-black font-bold text-lg press">−</button>
          </div>

          {/* Wooden Frame */}
          <div 
            className="relative w-full max-w-5xl aspect-[4/3] sm:aspect-[16/10] rounded-[1.5rem] shadow-[0_25px_50px_rgba(0,0,0,0.6),0_0_100px_rgba(0,0,0,0.2)] border-[14px] sm:border-[22px] border-[#ca7c45] bg-[#d38b58] overflow-hidden origin-center transition-transform duration-75 shrink-0"
            style={{ transform: `scale(${boardScale})` }}
          >
            {/* Inner frame bevel */}
            <div className="absolute inset-0 border-[6px] sm:border-[8px] border-[#9e5623] pointer-events-none z-30" />
            <div className="absolute inset-0 border-t-[8px] border-l-[8px] border-black/20 pointer-events-none z-30 mix-blend-multiply" />
            <div className="absolute inset-0 border-b-[8px] border-r-[8px] border-white/20 pointer-events-none z-30 mix-blend-screen" />
            
            {/* Cork texture/noise */}
            <div className="absolute inset-0 opacity-[0.25] mix-blend-multiply pointer-events-none z-0" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }} />

            <Droppable id="board" className="absolute inset-0 z-10 overflow-hidden">
              <div 
                ref={boardRef} 
                className="absolute inset-0 z-0"
              >
            {/* Connecting Strings */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none z-0" style={{ filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.5))' }}>
              <AnimatePresence>
                {board.map((item) => {
                  const isDragging = dragOffset?.id === item.id
                  const x2 = item.boardData.x + (isDragging ? dragOffset.dx : 0)
                  const y2 = item.boardData.y + (isDragging ? dragOffset.dy : 0)
                  return (
                    <motion.line
                      key={item.id}
                      initial={{ pathLength: 0, opacity: 0 }}
                      animate={{ pathLength: 1, opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.6, ease: "easeOut" }}
                      x1="50%"
                      y1="50%"
                      x2={`${x2}%`}
                      y2={`${y2}%`}
                      stroke="#d93829"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeDasharray="6 4"
                    />
                  )
                })}
              </AnimatePresence>
            </svg>

            {/* Central Polaroid */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center p-3 sm:p-4 bg-[#ebd9c8] pb-8 sm:pb-10 shadow-[0_10px_20px_rgba(0,0,0,0.3)] rounded-sm rotate-[-1deg] z-10 max-w-[220px] sm:max-w-[260px]">
              {/* Pushpin */}
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-3.5 h-3.5 rounded-full bg-[#c82424] shadow-[inset_-2px_-2px_4px_rgba(0,0,0,0.4),0_4px_4px_rgba(0,0,0,0.3)] z-20">
                <div className="absolute top-0.5 left-0.5 w-1.5 h-1.5 rounded-full bg-white/50" />
                <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-[1px] h-3 bg-black/40 -z-10 shadow-[1px_2px_2px_rgba(0,0,0,0.3)]" />
              </div>
              
              <div className="w-44 h-44 sm:w-52 sm:h-52 bg-white pt-2 px-2 overflow-hidden relative shadow-sm">
                <div className="w-full h-full bg-black relative overflow-hidden">
                  {headline.video ? (
                    <video
                      src={headline.video}
                      muted
                      loop
                      autoPlay
                      playsInline
                      className="absolute inset-0 h-full w-full object-cover opacity-90"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-6xl">
                      {headline.thumbnail}
                    </div>
                  )}
                </div>
              </div>
              <div className="mt-4 font-chaos text-[11px] sm:text-[13px] text-[#5a4c40] text-center leading-snug px-2">
                {headline.headline}
              </div>
              <div className="mt-1 text-[9px] font-mono text-[#8a7c6c] uppercase tracking-widest">
                @{headline.fakeSource}
              </div>
            </div>

            {/* Pinned Evidence */}
            {board.map((item) => {
              return (
                <div
                  key={item.id}
                  className="absolute z-20"
                  style={{
                    top: `${item.boardData.y}%`,
                    left: `${item.boardData.x}%`,
                    transform: `translate(-50%, -50%) rotate(${item.boardData.rotate})`,
                  }}
                >
                  <DraggableFolder
                    item={item}
                    onBoard
                    opened
                    boardTag={item.boardData?.tag}
                    boardNote={item.boardData?.note}
                    onOpen={() => setReviewingId(item.id)}
                    onRemove={() => toggleBoard(item.id)}
                  />
                </div>
              )
            })}
          </div>
        </Droppable>
          </div>
        </div>

        {/* Verdict Floating Bar */}
        <div className={`absolute bottom-[290px] sm:bottom-[330px] left-0 right-0 px-3 transition-transform duration-500 z-30 flex justify-center pointer-events-none ${boardItems.length > 0 ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          <div className="bg-[#fdfcf9] p-2.5 sm:p-3 rounded-2xl shadow-card flex items-center gap-2 sm:gap-2.5 border-2 border-[#e6ded3] pointer-events-auto">
            <div className="hidden sm:block text-[12px] font-bold uppercase tracking-widest text-[#1c1b18]/65 ml-2 mr-1">
              Verdict:
            </div>
            {VERDICTS.map((v) => {
              const active = verdict === v.id
              return (
                <button
                  key={v.id}
                  onClick={() => setVerdict(v.id)}
                  className={`press flex flex-col items-center justify-center rounded-xl px-3 sm:px-4 py-2 sm:py-2.5 transition-all ${
                    active
                      ? 'bg-[#1c1b18] text-white shadow-md scale-105 border-2 border-[#1c1b18]'
                      : 'bg-black/5 text-[#1c1b18] hover:bg-black/10 border-2 border-transparent'
                  }`}
                >
                  <span className="text-[22px] sm:text-[24px] leading-none mb-1">{v.emoji}</span>
                  <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider">{v.label}</span>
                </button>
              )
            })}
            <button
              onClick={() => canSubmit && doSubmit(verdict)}
              disabled={!canSubmit}
              title={!allPinsTagged ? 'Tag every pinned doc first' : ''}
              className={`press ml-1.5 sm:ml-2.5 h-full rounded-xl px-5 sm:px-6 py-3 font-display text-[14px] sm:text-[16px] font-bold uppercase tracking-widest transition-all ${
                canSubmit
                  ? 'bg-red-600 text-white shadow-md hover:bg-red-700'
                  : 'bg-black/10 text-black/30 cursor-not-allowed'
              }`}
            >
              {!verdict ? 'Pick verdict' : !allPinsTagged ? 'Tag pins' : 'Submit'}
            </button>
          </div>
        </div>

        {/* Bottom Area: Folders of Evidence */}
        <div className="h-[280px] sm:h-[310px] shrink-0 bg-[#2a241e] border-t-4 border-[#1e1914] rounded-t-[2rem] shadow-[0_-10px_40px_rgba(0,0,0,0.6)] z-40 relative flex flex-col bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.05)_0%,transparent_80%)]">
          <div className="flex items-center justify-between px-6 pt-4 pb-2">
            <div className="font-serif text-[18px] sm:text-[20px] text-[#e2cfb6] font-semibold flex items-center gap-2.5">
              <span>Evidence Folders</span>
              <span className="bg-[#1e1914] text-[#a89074] text-[12px] px-2.5 py-0.5 rounded-full font-mono font-bold">{pool.length} left</span>
            </div>
            <div className="text-[12px] sm:text-[13px] font-mono tracking-widest text-[#a89074] animate-pulse">
              DRAG ONTO BOARD ↑
            </div>
          </div>
          
          <Droppable id="pool" className="flex-1 overflow-x-auto no-scrollbar flex items-end gap-3 sm:gap-4 px-4 sm:px-6 pb-4">
            {pool.map((item) => (
              <DraggableFolder
                key={item.id}
                item={item}
                opened={openedIds.has(item.id)}
                onOpen={() => openEvidence(item.id)}
                onLockedDrag={flashLockToast}
              />
            ))}
            {pool.length === 0 && (
              <div className="w-full h-full flex flex-col items-center justify-center text-[#a89074]/50 border-2 border-dashed border-[#a89074]/20 rounded-xl mx-2 mb-2">
                <span className="text-3xl mb-2">🗄️</span>
                <span className="font-serif text-sm italic">All evidence pinned</span>
              </div>
            )}
          </Droppable>
        </div>

        <DragOverlay dropAnimation={{ duration: 250, easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)' }}>
          {activeDragItem ? (
            <FolderVisual item={activeDragItem} dragging onBoard={true} opened />
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* "Open the folder first" toast */}
      <AnimatePresence>
        {lockToast && (
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.18 }}
            className="pointer-events-none fixed bottom-[260px] sm:bottom-[300px] left-1/2 -translate-x-1/2 z-[110]"
          >
            <div className="rounded-full bg-[#1c1b18] text-white px-4 py-2 text-[12px] font-mono uppercase tracking-widest shadow-[0_10px_30px_rgba(0,0,0,0.45)] ring-1 ring-white/10">
              🔒 Open the folder first
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Evidence viewer modal */}
      <EvidenceViewer
        item={viewingItem}
        onClose={() => setViewingId(null)}
      />

      {/* Pin review modal — tag + note for a pinned doc */}
      <PinReviewModal
        open={!!reviewingItem}
        item={reviewingItem?.item || null}
        initialTag={reviewingItem?.board?.tag}
        initialNote={reviewingItem?.board?.note}
        onSave={savePinReview}
        onCancel={cancelPinReview}
        onUnpin={unpinReviewed}
      />
    </div>
  )
}

function Droppable({ id, children, className = '' }) {
  const { isOver, setNodeRef } = useDroppable({ id })
  return (
    <div
      ref={setNodeRef}
      className={`${className} transition-colors ${isOver ? 'bg-white/5' : ''}`}
    >
      {children}
    </div>
  )
}

function DraggableFolder({ item, onBoard = false, opened = false, boardTag, boardNote, onOpen, onLockedDrag, onRemove }) {
  // A folder must be opened (read) before it can be dragged onto the board.
  const dragDisabled = !opened
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: item.id,
    disabled: dragDisabled,
  })

  // Detect a drag attempt on a locked folder so we can flash a toast instead of silently doing nothing.
  const pointerStartRef = useRef(null)
  const movedRef = useRef(false)

  const handlePointerDown = (e) => {
    pointerStartRef.current = { x: e.clientX, y: e.clientY }
    movedRef.current = false
  }
  const handlePointerMove = (e) => {
    if (!pointerStartRef.current) return
    const dx = e.clientX - pointerStartRef.current.x
    const dy = e.clientY - pointerStartRef.current.y
    if (Math.hypot(dx, dy) > 6) {
      movedRef.current = true
      if (dragDisabled && onLockedDrag) {
        onLockedDrag()
        pointerStartRef.current = null
      }
    }
  }
  const handleClick = (e) => {
    // Suppress click that follows a drag
    if (movedRef.current) return
    if (onOpen) onOpen()
  }

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      onPointerDownCapture={handlePointerDown}
      onPointerMove={handlePointerMove}
      onClick={handleClick}
      style={{ opacity: isDragging ? 0 : 1, touchAction: 'none' }}
      role="button"
      aria-label={dragDisabled ? `Tap to open: ${item.title}` : `Open or drag: ${item.title}`}
    >
      <FolderVisual item={item} onBoard={onBoard} opened={opened} boardTag={boardTag} boardNote={boardNote} onRemove={onRemove} />
    </div>
  )
}

function FolderVisual({ item, dragging = false, onBoard = false, opened = false, boardTag, boardNote, onRemove }) {
  if (onBoard) {
    const tag = boardTag ? tagById(boardTag) : null
    const untagged = !tag
    return (
      <div className={`relative bg-[#fdfcf9] w-[170px] sm:w-[190px] p-2.5 sm:p-3.5 shadow-[0_6px_18px_rgba(0,0,0,0.25)] border-2 ${untagged ? 'border-amber-400/80 ring-2 ring-amber-300/40' : 'border-[#e6ded3]'} text-[#1c1b18] ${dragging ? 'scale-110 rotate-3 z-50 shadow-2xl' : ''}`}>
        {/* Pushpin */}
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-[#c82424] shadow-[inset_-2px_-2px_4px_rgba(0,0,0,0.4),0_4px_4px_rgba(0,0,0,0.3)] z-30">
          <div className="absolute top-0.5 left-0.5 w-1.5 h-1.5 rounded-full bg-white/50" />
          <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-[1px] h-3 bg-black/40 -z-10 shadow-[1px_2px_2px_rgba(0,0,0,0.3)]" />
        </div>

        {/* Tag sticky note in the corner */}
        {tag ? (
          <div className="absolute -right-2.5 -top-2.5 rotate-[6deg] z-30 bg-[#fef3c7] border-2 border-amber-300 shadow-md px-2 py-1 text-[20px] sm:text-[22px] flex items-center">
            <span>{tag.emoji}</span>
          </div>
        ) : (
          <div className="absolute -right-2 -top-2.5 rotate-[6deg] z-30 bg-amber-300 border-2 border-amber-500 shadow-md px-2 py-1 text-[11px] font-mono font-bold uppercase tracking-widest text-amber-900 animate-pulse">
            tag me
          </div>
        )}

        <div className="text-[26px] sm:text-[28px] mb-2">{typeIcon(item.type)}</div>
        <div className="text-[13px] sm:text-[14px] font-bold text-black/90 line-clamp-4 leading-snug font-serif">
          {item.title}
        </div>
        <div className="mt-2.5 pt-2 border-t border-black/10 text-[10px] sm:text-[11px] font-mono text-black/55 uppercase tracking-widest truncate">
          {item.source}
        </div>
        {boardNote && (
          <div className="mt-1.5 text-[11px] sm:text-[12px] italic text-black/60 leading-snug line-clamp-2">
            “{boardNote}”
          </div>
        )}
        {onRemove && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              onRemove()
            }}
            className="absolute -right-2.5 -bottom-2.5 bg-black/80 text-white rounded-full w-7 h-7 flex items-center justify-center text-[14px] font-bold opacity-0 hover:opacity-100 transition-opacity"
            aria-label="Unpin from board"
          >
            ×
          </button>
        )}
      </div>
    )
  }

  // Once opened, the folder visual becomes a clean PAPER card — clearly a draggable document.
  if (opened) {
    return (
      <div
        className={`relative w-[170px] sm:w-[190px] h-[190px] sm:h-[210px] shrink-0 bg-[#fdfcf9] border border-[#e6ded3] shadow-[0_8px_18px_rgba(0,0,0,0.28),0_1px_0_rgba(255,255,255,0.4)_inset] rotate-[-1.5deg] transition-transform duration-300 ${
          dragging ? 'scale-105 rotate-2 z-50 shadow-2xl' : 'hover:-translate-y-3 hover:rotate-[1deg]'
        }`}
      >
        {/* Top corner-fold accent */}
        <div className="absolute top-0 right-0 w-6 h-6 bg-[#e8e2d3]" style={{ clipPath: 'polygon(100% 0, 100% 100%, 0 0)' }} />

        {/* READ stamp — bigger */}
        <div className="absolute -top-2 left-1.5 z-30 pointer-events-none rotate-[-14deg]">
          <div className="rounded-sm border-2 border-emerald-700/80 text-emerald-700 bg-emerald-50/85 text-[11px] sm:text-[12px] font-bold uppercase tracking-[0.16em] px-2 py-0.5 shadow-sm">
            Read ✓
          </div>
        </div>

        {/* Body */}
        <div className="absolute inset-x-0 top-9 sm:top-10 px-3 sm:px-4">
          <div className="text-[26px] leading-none mb-2">{typeIcon(item.type)}</div>
          <div className="text-[13px] sm:text-[14px] font-bold leading-snug text-black/85 line-clamp-4 font-serif">
            {item.title}
          </div>
        </div>

        {/* Source footer */}
        <div className="absolute bottom-0 inset-x-0 border-t border-black/10 bg-black/[0.02] px-2.5 py-1.5">
          <div className="text-[10px] sm:text-[11px] font-mono text-black/60 uppercase tracking-widest truncate">
            {item.source}
          </div>
        </div>

        {/* Drag-to-pin hint */}
        <div className="absolute bottom-8 right-2 pointer-events-none text-[18px] opacity-50">↗</div>
      </div>
    )
  }

  // Closed folder look — kid hasn't read it yet.
  return (
    <div className="relative flex flex-col w-[170px] sm:w-[190px] h-[190px] sm:h-[210px] shrink-0 transition-transform duration-300 hover:-translate-y-4">
      {/* Folder Tab */}
      <div className="w-[50%] h-6 sm:h-7 bg-[#d9af7a] rounded-t-lg border border-[#bc915a] border-b-0 self-start ml-2 z-10 flex items-center px-2.5">
        <span className="text-[11px] sm:text-[12px] font-mono font-bold text-[#5c4021] truncate uppercase">{typeLabel(item.type)}</span>
      </div>
      {/* Folder Body */}
      <div className="flex-1 bg-gradient-to-b from-[#e8c089] to-[#d6a566] border border-[#bc915a] rounded-b-lg rounded-tr-lg p-2.5 sm:p-3 flex flex-col shadow-lg relative -mt-[1px] z-20 group">
         {/* Paper sticking out (peek) */}
         <div className="absolute top-2.5 left-2.5 right-2.5 bottom-7 bg-[#fdfcf9]/95 rounded-sm border border-[#e6ded3] p-2.5 overflow-hidden shadow-inner rotate-1 transition-all duration-300">
           <div className="text-[22px] mb-1.5 leading-none opacity-70">{typeIcon(item.type)}</div>
           <div className="text-[13px] sm:text-[14px] font-bold text-black/60 line-clamp-3 leading-snug font-serif">
             {item.title}
           </div>
         </div>
         {/* Front flap */}
         <div className="absolute bottom-0 left-0 right-0 h-[55%] bg-gradient-to-t from-[#c99553] to-[#e0b77e] rounded-b-lg border-t border-white/20 shadow-[0_-2px_6px_rgba(0,0,0,0.1)] flex items-end p-2.5 pb-3.5">
            <div className="text-[11px] sm:text-[12px] font-mono text-[#4a3116] uppercase tracking-wider truncate w-full text-center opacity-90 font-semibold drop-shadow-sm">
              {item.source}
            </div>
         </div>

         {/* Lock seal + "Tap to open" overlay */}
         <div className="absolute inset-0 rounded-b-lg rounded-tr-lg bg-[#2a1a08]/30 z-30 pointer-events-none" />
         <div className="absolute top-2 right-2 z-40 pointer-events-none">
           <div className="rounded-full bg-[#c82424] text-white w-9 h-9 flex items-center justify-center text-[18px] shadow-md ring-2 ring-white/30">🔒</div>
         </div>
         <div className="absolute inset-x-0 bottom-[55%] z-40 pointer-events-none flex justify-center">
           <div className="rounded-full bg-black/85 text-white text-[11px] font-mono font-bold uppercase tracking-widest px-2.5 py-1 shadow ring-1 ring-white/10">
             Tap to open
           </div>
         </div>
      </div>
    </div>
  )
}
