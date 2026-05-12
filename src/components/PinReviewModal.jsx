import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { TAGS, NOTE_CHAR_CAP } from '../lib/scoring.js'

export default function PinReviewModal({ open, item, initialTag, initialNote, onSave, onCancel, onUnpin }) {
  const [tag, setTag] = useState(initialTag || null)
  const [note, setNote] = useState(initialNote || '')

  // Reset state whenever a different pin's modal opens
  useEffect(() => {
    if (open) {
      setTag(initialTag || null)
      setNote(initialNote || '')
    }
  }, [open, initialTag, initialNote, item?.id])

  useEffect(() => {
    if (!open) return
    const onKey = (e) => { if (e.key === 'Escape') onCancel() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onCancel])

  if (!open || !item) return null
  const canSave = !!tag

  return (
    <AnimatePresence>
      <motion.div
        key="pin-review-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.18 }}
        onClick={onCancel}
        className="fixed inset-0 z-[125] bg-black/75 backdrop-blur-sm flex items-end sm:items-center justify-center p-3 sm:p-6"
      >
        <motion.div
          key="pin-review-card"
          initial={{ opacity: 0, y: 30, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.97 }}
          transition={{ duration: 0.22, ease: [0.22, 0.61, 0.36, 1] }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-[640px] sm:max-w-[720px] max-h-[92dvh] flex flex-col rounded-2xl bg-[#fdfcf9] text-[#1c1b18] shadow-[0_30px_80px_-10px_rgba(0,0,0,0.6)] ring-1 ring-black/10 overflow-hidden"
        >
          {/* Sticky-note header */}
          <div className="px-5 py-4 border-b border-black/10 bg-[#fef3c7] flex items-start gap-3">
            <div className="text-[32px] leading-none mt-0.5">📌</div>
            <div className="min-w-0 flex-1">
              <div className="text-[12px] font-mono uppercase tracking-widest text-black/60">
                Pin review — tag this doc and write a note
              </div>
              <div className="mt-1.5 font-serif text-[19px] font-bold leading-snug line-clamp-2">
                {item.title}
              </div>
              <div className="mt-1 text-[13px] font-mono text-black/55 uppercase tracking-widest truncate">
                {item.source}
              </div>
            </div>
            <button
              onClick={onCancel}
              aria-label="Close"
              className="press shrink-0 rounded-full bg-black/5 hover:bg-black/10 w-11 h-11 flex items-center justify-center text-[22px] leading-none text-black/70 font-bold"
            >
              ×
            </button>
          </div>

          {/* Tag picker */}
          <div className="px-5 pt-5">
            <div className="text-[12px] font-mono uppercase tracking-widest text-black/60 mb-2.5">
              Sticky tag
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              {TAGS.map((t) => {
                const active = tag === t.id
                return (
                  <button
                    key={t.id}
                    onClick={() => setTag(t.id)}
                    className={`press flex items-center gap-2.5 rounded-xl border-2 px-3.5 py-3 text-left transition-colors ${
                      active
                        ? 'bg-[#1c1b18] border-[#1c1b18] text-white shadow-md'
                        : 'bg-white border-[#e6ded3] hover:border-black/30 text-[#1c1b18]'
                    }`}
                  >
                    <span className="text-[26px] leading-none">{t.emoji}</span>
                    <div className="min-w-0">
                      <div className="text-[14px] font-bold uppercase tracking-wider leading-tight">{t.label}</div>
                      <div className={`text-[12px] leading-tight mt-0.5 ${active ? 'text-white/70' : 'text-black/55'}`}>
                        {t.hint}
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Note */}
          <div className="px-5 pt-5 pb-5 flex-1 flex flex-col">
            <div className="flex items-baseline justify-between mb-2">
              <div className="text-[12px] font-mono uppercase tracking-widest text-black/60">
                Why this tag? (1–3 sentences)
              </div>
              <div className={`text-[12px] font-mono ${note.length > NOTE_CHAR_CAP - 20 ? 'text-rose-600' : 'text-black/50'}`}>
                {note.length} / {NOTE_CHAR_CAP}
              </div>
            </div>
            <textarea
              value={note}
              maxLength={NOTE_CHAR_CAP}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. The account is only 6 weeks old and has too many followers — supports my FALSE call."
              className="w-full min-h-[120px] rounded-lg border-2 border-[#e6ded3] bg-white p-3.5 text-[16px] leading-[1.55] font-serif text-[#1c1b18] focus:border-black/50 focus:outline-none resize-none"
            />
            <div className="mt-2 text-[13px] italic text-black/60 leading-snug">
              Specific beats vague. Quote a detail from the doc and link it to your verdict.
            </div>
          </div>

          {/* Footer actions */}
          <div className="px-5 py-4 border-t border-black/10 bg-black/[0.02] flex items-center justify-between gap-2">
            {onUnpin ? (
              <button
                onClick={onUnpin}
                className="press text-[13px] font-mono font-bold uppercase tracking-widest text-rose-700 hover:text-rose-900 px-2 py-1"
              >
                Unpin
              </button>
            ) : <div />}
            <div className="flex items-center gap-2.5">
              <button
                onClick={onCancel}
                className="press rounded-full border-2 border-black/15 bg-white hover:bg-black/5 px-5 py-2.5 text-[14px] font-mono font-bold uppercase tracking-widest text-black/70"
              >
                Cancel
              </button>
              <button
                onClick={() => canSave && onSave({ tag, note: note.trim() })}
                disabled={!canSave}
                className={`press rounded-full px-6 py-2.5 text-[14px] font-bold uppercase tracking-widest shadow-md transition-colors ${
                  canSave
                    ? 'bg-[#1c1b18] text-white hover:bg-black'
                    : 'bg-black/10 text-black/40 cursor-not-allowed'
                }`}
              >
                {initialTag ? 'Update pin' : 'Pin to board'}
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
