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
  { id: 'SATIRE', label: 'SATIRE', emoji: '😂', hint: 'A joke' },
  { id: 'UNVERIFIABLE', label: 'UNVERIF', emoji: '❓', hint: "Can't tell" },
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
  // Store pinned items as { id, x, y, rotate }
  const [boardItems, setBoardItems] = useState([])
  const [verdict, setVerdict] = useState(null)
  const [activeDragItem, setActiveDragItem] = useState(null)
  const [boardScale, setBoardScale] = useState(1)
  const startRef = useRef(Date.now())
  const boardRef = useRef(null)

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
  }

  const handleDragEnd = (event) => {
    setActiveDragItem(null)
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
      
      setBoardItems((prev) => {
        const exists = prev.find((p) => p.id === active.id)
        if (exists) {
          // Update position if already on board
          return prev.map((p) =>
            p.id === active.id ? { ...p, x: xPercent, y: yPercent } : p
          )
        }
        // New item onto the board
        return [
          ...prev,
          {
            id: active.id,
            x: xPercent,
            y: yPercent,
            rotate: (Math.random() * 12 - 6).toFixed(1) + 'deg',
          },
        ]
      })
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
      boardIds: boardItems.map((b) => b.id),
      timeLeftMs: overrideTimeLeft ?? timeLeftMs,
      totalMs: TOTAL_MS,
    })
  }

  const canSubmit = verdict && boardItems.length > 0

  const mins = Math.floor(timeLeftMs / 60000)
  const secs = Math.floor((timeLeftMs % 60000) / 1000)
  const timeStressed = timeLeftMs < 30_000

  return (
    <div className="bg-[#21252d] relative h-[100dvh] w-full overflow-hidden text-desk-paper flex flex-col shadow-[inset_0_0_120px_rgba(0,0,0,0.5)]">
      {/* Subtle wall texture */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-plus-lighter" style={{ backgroundImage: `repeating-linear-gradient(45deg, #fff 0, #fff 1px, transparent 1px, transparent 10px)` }} />
      {/* Top bar: Back • Timer */}
      <div className="relative z-20 flex items-center justify-between gap-3 bg-black/30 px-4 py-2.5 pt-[max(env(safe-area-inset-top),10px)] backdrop-blur-md shadow-md border-b border-black/20">
        <button
          onClick={onAbandon}
          className="press rounded-full border border-white/20 bg-black/50 px-3 py-1.5 text-[11px] font-bold uppercase tracking-widest text-white/80 hover:bg-white/10"
        >
          ← Back
        </button>

        <div
          className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 font-mono text-[13px] tabular-nums font-bold shadow-sm transition-colors ${
            timeStressed
              ? 'animate-pulse border-red-500/50 bg-red-500/20 text-red-400'
              : 'border-white/20 bg-black/50 text-white'
          }`}
        >
          <span>⏱</span>
          <span>{String(mins).padStart(1, '0')}:{String(secs).padStart(2, '0')}</span>
        </div>
      </div>

      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
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
                  return (
                    <motion.line
                      key={item.id}
                      initial={{ pathLength: 0, opacity: 0 }}
                      animate={{ pathLength: 1, opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.6, ease: "easeOut" }}
                      x1="50%"
                      y1="50%"
                      x2={`${item.boardData.x}%`}
                      y2={`${item.boardData.y}%`}
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
                  <DraggableFolder item={item} onBoard onTap={() => toggleBoard(item.id)} />
                </div>
              )
            })}
          </div>
        </Droppable>
          </div>
        </div>

        {/* Verdict Floating Bar */}
        <div className={`absolute bottom-[240px] sm:bottom-[280px] left-0 right-0 px-3 transition-transform duration-500 z-30 flex justify-center pointer-events-none ${boardItems.length > 0 ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          <div className="bg-[#fdfcf9] p-2 sm:p-2.5 rounded-2xl shadow-card flex items-center gap-1.5 sm:gap-2 border-2 border-[#e6ded3] pointer-events-auto">
            <div className="hidden sm:block text-[10px] font-bold uppercase tracking-widest text-[#1c1b18]/60 ml-2 mr-1">
              Verdict:
            </div>
            {VERDICTS.map((v) => {
              const active = verdict === v.id
              return (
                <button
                  key={v.id}
                  onClick={() => setVerdict(v.id)}
                  className={`press flex flex-col items-center justify-center rounded-xl px-2 sm:px-3 py-1.5 transition-all ${
                    active
                      ? 'bg-[#1c1b18] text-white shadow-md scale-105 border border-[#1c1b18]'
                      : 'bg-black/5 text-[#1c1b18] hover:bg-black/10 border border-transparent'
                  }`}
                >
                  <span className="text-[16px] sm:text-[18px] leading-none mb-0.5">{v.emoji}</span>
                  <span className="text-[8px] sm:text-[9px] font-bold uppercase tracking-wider">{v.label}</span>
                </button>
              )
            })}
            <button
              onClick={() => canSubmit && doSubmit(verdict)}
              disabled={!canSubmit}
              className={`press ml-1 sm:ml-2 h-full rounded-xl px-4 sm:px-5 font-display text-[12px] sm:text-[13px] font-bold uppercase tracking-widest transition-all ${
                canSubmit
                  ? 'bg-red-600 text-white shadow-md hover:bg-red-700'
                  : 'bg-black/10 text-black/30 cursor-not-allowed'
              }`}
            >
              Submit
            </button>
          </div>
        </div>

        {/* Bottom Area: Folders of Evidence */}
        <div className="h-[230px] sm:h-[260px] shrink-0 bg-[#2a241e] border-t-4 border-[#1e1914] rounded-t-[2rem] shadow-[0_-10px_40px_rgba(0,0,0,0.6)] z-40 relative flex flex-col bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.05)_0%,transparent_80%)]">
          <div className="flex items-center justify-between px-6 pt-4 pb-2">
            <div className="font-serif text-[15px] sm:text-[17px] text-[#e2cfb6] font-semibold flex items-center gap-2">
              <span>Evidence Folders</span>
              <span className="bg-[#1e1914] text-[#a89074] text-[10px] px-2 py-0.5 rounded-full font-mono">{pool.length} left</span>
            </div>
            <div className="text-[10px] sm:text-[11px] font-mono tracking-widest text-[#a89074] animate-pulse">
              DRAG ONTO BOARD ↑
            </div>
          </div>
          
          <Droppable id="pool" className="flex-1 overflow-x-auto no-scrollbar flex items-end gap-3 sm:gap-4 px-4 sm:px-6 pb-4">
            {pool.map((item) => (
              <DraggableFolder key={item.id} item={item} onTap={() => toggleBoard(item.id)} />
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
            <FolderVisual item={activeDragItem} dragging onBoard={true} />
          ) : null}
        </DragOverlay>
      </DndContext>
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

function DraggableFolder({ item, onBoard = false, onTap }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: item.id,
  })
  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      onDoubleClick={onTap}
      style={{ opacity: isDragging ? 0 : 1, touchAction: 'none' }}
    >
      <FolderVisual item={item} onBoard={onBoard} onTap={onTap} />
    </div>
  )
}

function FolderVisual({ item, dragging = false, onBoard = false, onTap }) {
  if (onBoard) {
    // Pinned article look
    return (
      <div className={`relative bg-[#fdfcf9] w-[140px] sm:w-[160px] p-2 sm:p-3 shadow-[0_5px_15px_rgba(0,0,0,0.2)] border border-[#e6ded3] text-[#1c1b18] ${dragging ? 'scale-110 rotate-3 z-50 shadow-2xl' : ''}`}>
        {/* Pushpin */}
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-3.5 h-3.5 rounded-full bg-[#c82424] shadow-[inset_-2px_-2px_4px_rgba(0,0,0,0.4),0_4px_4px_rgba(0,0,0,0.3)] z-30">
          <div className="absolute top-0.5 left-0.5 w-1.5 h-1.5 rounded-full bg-white/50" />
          <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-[1px] h-3 bg-black/40 -z-10 shadow-[1px_2px_2px_rgba(0,0,0,0.3)]" />
        </div>
        <div className="text-[18px] sm:text-[22px] mb-1.5">{typeIcon(item.type)}</div>
        <div className="text-[10px] sm:text-[11px] font-bold text-black/90 line-clamp-4 leading-snug font-serif">
          {item.title}
        </div>
        <div className="mt-2 pt-1.5 border-t border-black/10 text-[8px] sm:text-[9px] font-mono text-black/50 uppercase tracking-widest truncate">
          {item.source}
        </div>
        {onTap && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              onTap()
            }}
            className="absolute -right-2 -top-2 bg-black/80 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs opacity-0 hover:opacity-100 transition-opacity"
          >
            ×
          </button>
        )}
      </div>
    )
  }

  // Pool folder look
  return (
    <div className={`relative flex flex-col w-[130px] sm:w-[150px] h-[150px] sm:h-[170px] shrink-0 transition-transform duration-300 ${dragging ? 'scale-105 -rotate-2 z-50 shadow-2xl' : 'hover:-translate-y-4'}`}>
      {/* Folder Tab */}
      <div className="w-[45%] h-5 sm:h-6 bg-[#d9af7a] rounded-t-lg border border-[#bc915a] border-b-0 self-start ml-2 z-10 flex items-center px-2">
        <span className="text-[9px] sm:text-[10px] font-mono font-bold text-[#5c4021] truncate uppercase">{item.type}</span>
      </div>
      {/* Folder Body */}
      <div className="flex-1 bg-gradient-to-b from-[#e8c089] to-[#d6a566] border border-[#bc915a] rounded-b-lg rounded-tr-lg p-2 sm:p-2.5 flex flex-col shadow-lg relative -mt-[1px] z-20 group">
         {/* Paper sticking out */}
         <div className="absolute top-2 left-2 right-2 bottom-6 bg-[#fdfcf9] rounded-sm border border-[#e6ded3] p-2 overflow-hidden shadow-inner rotate-1 group-hover:rotate-2 group-hover:-translate-y-2 transition-all duration-300">
           <div className="text-[10px] sm:text-[11px] font-bold text-black/80 line-clamp-3 leading-snug font-serif">
             {item.title}
           </div>
           <div className="mt-1.5 w-10 h-1 bg-black/10 rounded-full"></div>
           <div className="mt-1 w-16 h-1 bg-black/10 rounded-full"></div>
           <div className="mt-1 w-12 h-1 bg-black/10 rounded-full"></div>
         </div>
         {/* Front flap */}
         <div className="absolute bottom-0 left-0 right-0 h-[55%] bg-gradient-to-t from-[#c99553] to-[#e0b77e] rounded-b-lg border-t border-white/20 shadow-[0_-2px_6px_rgba(0,0,0,0.1)] flex items-end p-2 pb-3">
            <div className="text-[9px] sm:text-[10px] font-mono text-[#4a3116] uppercase tracking-wider truncate w-full text-center opacity-90 font-semibold drop-shadow-sm">
              {item.source}
            </div>
         </div>
      </div>
    </div>
  )
}
