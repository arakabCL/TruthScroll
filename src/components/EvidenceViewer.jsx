import { useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

export default function EvidenceViewer({ item, onClose }) {
  useEffect(() => {
    if (!item) return
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [item, onClose])

  return (
    <AnimatePresence>
      {item && (
        <motion.div
          key="viewer-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          onClick={onClose}
          className="fixed inset-0 z-[120] bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6"
        >
          <motion.div
            key="viewer-card"
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 6 }}
            transition={{ duration: 0.2, ease: [0.22, 0.61, 0.36, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-[760px] sm:max-w-[860px] lg:max-w-[960px] max-h-[94dvh] flex flex-col rounded-2xl bg-[#fdfcf9] text-[#1c1b18] shadow-[0_30px_80px_-10px_rgba(0,0,0,0.6)] ring-1 ring-black/10 overflow-hidden"
          >
            <ViewerHeader item={item} onClose={onClose} />
            <div className="flex-1 overflow-y-auto">
              <DocByType item={item} />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

/* ───── Header — bigger source + bigger close button. ───── */
function ViewerHeader({ item, onClose }) {
  return (
    <div className="relative flex items-center gap-3 border-b border-black/10 bg-white/85 backdrop-blur px-5 py-4">
      <div className="min-w-0 flex-1 truncate text-[14px] font-mono uppercase tracking-widest text-black/65">
        {item.source}
      </div>
      <button
        onClick={onClose}
        aria-label="Close"
        className="press shrink-0 rounded-full bg-black/5 hover:bg-black/10 w-12 h-12 flex items-center justify-center text-[24px] leading-none text-black/70 font-bold"
      >
        ×
      </button>
    </div>
  )
}

function DocByType({ item }) {
  switch (item.type) {
    case 'tiktok':  return <TikTokDoc item={item} />
    case 'article': return <ArticleDoc item={item} />
    case 'tweet':   return <TweetDoc item={item} />
    case 'reddit':  return <RedditDoc item={item} />
    case 'blog':    return <BlogDoc item={item} />
    case 'paper':   return <PaperDoc item={item} />
    case 'report':  return <ReportDoc item={item} />
    case 'email':   return <EmailDoc item={item} />
    case 'wiki':    return <WikiDoc item={item} />
    case 'instagram': return <InstagramDoc item={item} />
    default:        return <GenericDoc item={item} />
  }
}

/* ───────── TIKTOK ───────── */
function TikTokDoc({ item }) {
  return (
    <div className="bg-black text-white">
      <div className="px-5 pt-5 pb-4 border-b border-white/10 flex items-center gap-3">
        <div className="h-12 w-12 rounded-full bg-gradient-to-br from-pink-400 to-amber-400 ring-2 ring-white/40" />
        <div className="min-w-0 flex-1">
          <div className="font-bold text-[17px] truncate">{item.author}</div>
          <div className="text-[13px] text-white/55">{item.date} · TikTok</div>
        </div>
        <div className="text-[13px] font-mono text-pink-300">♪ original sound</div>
      </div>

      <div className="px-5 py-5 text-[17px] leading-[1.55] whitespace-pre-wrap">
        {item.body}
      </div>

      {item.engagement && (
        <div className="px-5 pb-4 flex items-center gap-6 text-[15px] text-white/85 font-mono">
          <span>❤ {item.engagement.likes}</span>
          <span>💬 {item.engagement.comments}</span>
          <span>🔁 {item.engagement.shares}</span>
        </div>
      )}

      {item.comments?.length > 0 && (
        <div className="bg-[#0b0b0d] border-t border-white/10 px-5 py-4 space-y-3.5">
          <div className="text-[12px] font-mono uppercase tracking-widest text-white/50">Top comments</div>
          {item.comments.map((c, i) => (
            <div key={i} className="text-[16px] leading-snug">
              <div className="flex gap-2">
                <span className="font-bold text-white/90">{c.author}:</span>
                <span className="text-white/85">{c.text}</span>
              </div>
              {c.reply && (
                <div className="mt-1 ml-5 flex gap-2 text-[15px] text-white/70">
                  <span className="text-white/40">↳</span>
                  <span className="font-bold">{c.reply.author}:</span>
                  <span>{c.reply.text}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {item.profile && (
        <div className="bg-black border-t border-white/10 px-5 py-4 text-[14px] font-mono text-white/65 space-y-1">
          <div>Account created: <span className="text-white/90">{item.profile.createdAgo}</span></div>
          <div>Followers: <span className="text-white/90">{item.profile.followers}</span></div>
          {item.profile.bio && <div>Bio: <span className="text-white/90">"{item.profile.bio}"</span></div>}
        </div>
      )}
    </div>
  )
}

/* ───────── ARTICLE ───────── */
function ArticleDoc({ item }) {
  return (
    <div className="bg-[#fdfcf9] text-[#1c1b18]">
      <div className="px-6 pt-5 pb-3 border-b border-black/10">
        <div className="font-display text-[13px] font-bold uppercase tracking-[0.22em] text-[#b91c1c]">
          {item.source}
        </div>
      </div>
      <article className="px-6 py-6 font-serif">
        <h1 className="text-[28px] sm:text-[30px] font-bold leading-tight mb-4">
          {item.headlineBig || item.title}
        </h1>
        <div className="text-[15px] text-black/65 mb-5 border-b border-black/10 pb-3">
          By {item.author}{item.date ? ` · ${item.date}` : ''}
        </div>
        <div className="text-[17px] leading-[1.7] whitespace-pre-wrap">{item.body}</div>
      </article>
    </div>
  )
}

/* ───────── TWEET / X THREAD ───────── */
function TweetDoc({ item }) {
  return (
    <div className="bg-white text-[#0f1419]">
      <div className="px-5 pt-5 pb-4 flex items-center gap-3 border-b border-black/5">
        <div className="h-14 w-14 rounded-full bg-gradient-to-br from-sky-300 to-indigo-500 ring-2 ring-white" />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 font-bold text-[18px]">
            {item.author}
            {item.verified && (
              <svg viewBox="0 0 24 24" className="h-5 w-5 text-sky-500" fill="currentColor">
                <path d="M22.5 12.5l-2.3-2.7.4-3.5-3.4-.7-1.8-3-3.4 1.2L8.6 2.6 6.8 5.6l-3.4.7.4 3.5L1.5 12.5l2.3 2.7-.4 3.5 3.4.7 1.8 3 3.4-1.2 3.4 1.2 1.8-3 3.4-.7-.4-3.5 2.3-2.7zM10.5 17l-4-4 1.4-1.4 2.6 2.6 5.6-5.6 1.4 1.4-7 7z" />
              </svg>
            )}
          </div>
          <div className="text-[14px] text-black/55">{item.handle} · {item.date}</div>
        </div>
        <div className="text-sky-500 font-bold text-[22px]">𝕏</div>
      </div>

      {item.thread?.length > 0 ? (
        <div className="divide-y divide-black/10">
          {item.thread.map((post, i) => (
            <div key={i} className="px-5 py-5 text-[18px] leading-[1.55]">
              <div className="mb-1.5 text-[14px] font-mono font-bold text-sky-600">{post.num}</div>
              <div className="whitespace-pre-wrap">{post.text}</div>
            </div>
          ))}
        </div>
      ) : (
        <div className="px-5 py-5 text-[18px] leading-[1.55] whitespace-pre-wrap">{item.body}</div>
      )}
    </div>
  )
}

/* ───────── REDDIT ───────── */
function RedditDoc({ item }) {
  return (
    <div className="bg-[#1a1a1b] text-[#d7dadc]">
      <div className="px-5 pt-5 pb-3 flex flex-wrap items-center gap-2 border-b border-white/10">
        <div className="rounded-full bg-orange-500 text-white text-[12px] font-bold uppercase tracking-widest px-2.5 py-0.5">reddit</div>
        <div className="text-[15px] font-mono text-orange-300">{item.subreddit}</div>
        <div className="text-[13px] text-white/45">· posted by {item.author} · {item.date}</div>
      </div>

      <div className="px-5 py-5">
        <div className="text-[20px] font-bold text-white leading-tight mb-3">{item.postTitle || item.title}</div>
        <div className="text-[17px] leading-[1.6] whitespace-pre-wrap text-white/90">{item.body}</div>
        <div className="mt-4 flex items-center gap-5 text-[14px] font-mono text-white/55">
          <span>⬆ {item.score?.toLocaleString?.() ?? item.score}</span>
          <span>💬 {item.comments_count} comments</span>
        </div>
      </div>

      {item.comments?.length > 0 && (
        <div className="bg-[#121213] border-t border-white/10 px-5 py-4 space-y-4">
          {item.comments.map((c, i) => (
            <div key={i} className="border-l-2 border-white/10 pl-4">
              <div className="flex items-center gap-2 mb-1 text-[15px]">
                <span className="font-bold text-white">{c.author}</span>
                <span className="font-mono text-[12px] text-white/45">{c.score?.toLocaleString?.() ?? c.score} pts</span>
              </div>
              <div className="text-[16px] leading-snug text-white/90 whitespace-pre-wrap">{c.text}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

/* ───────── BLOG ───────── */
function BlogDoc({ item }) {
  return (
    <div className="bg-[#fff8ee] text-[#1c1b18]">
      <div className="px-5 pt-5 pb-3 border-b border-amber-200/80 bg-gradient-to-r from-amber-100 to-rose-100">
        <div className="font-display text-[14px] uppercase tracking-widest text-amber-900/80">
          {item.source}
        </div>
        <div className="mt-1.5 text-[13px] font-mono text-amber-900/55">
          by {item.author} · {item.date} {item.tags && '· ' + item.tags.map(t => `#${t}`).join(' ')}
        </div>
      </div>

      <article className="px-5 py-5">
        <h1 className="font-chaos text-[28px] leading-tight text-rose-600 mb-4 drop-shadow-sm">
          {item.headlineBig || item.title}
        </h1>
        <div className="text-[17px] leading-[1.65] whitespace-pre-wrap text-[#1c1b18]/90 font-serif">
          {item.body}
        </div>
      </article>

      {item.ads?.length > 0 && (
        <div className="px-5 pb-5 space-y-2">
          {item.ads.map((ad, i) => (
            <div key={i} className="border border-rose-300 bg-rose-50 px-3 py-2.5 text-[15px] rounded">
              <span className="text-[11px] font-mono uppercase tracking-widest text-rose-500 mr-2">Ad</span>
              <span className="font-bold text-rose-900">{ad}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

/* ───────── PAPER ───────── */
function PaperDoc({ item }) {
  return (
    <div className="bg-white text-[#1c1b18]">
      <div className="px-6 pt-6 pb-5 border-b border-black/10 text-center">
        <div className="text-[13px] font-mono uppercase tracking-[0.22em] text-black/55">{item.source}</div>
        <h1 className="mt-3 font-serif text-[24px] leading-snug font-bold">
          {item.paperTitle || item.title}
        </h1>
        <div className="mt-2 text-[15px] text-black/70 italic">{item.author} ({item.date})</div>
      </div>
      <div className="px-6 py-6 text-[17px] leading-[1.75] font-serif whitespace-pre-wrap text-justify">
        {item.body}
      </div>
    </div>
  )
}

/* ───────── REPORT — manila case-file folder with two paper pages ───────── */
function ReportDoc({ item }) {
  return (
    <div className="bg-[#a05a1f] py-4 sm:py-6 px-3 sm:px-5">
      {/* Outer manila folder */}
      <div className="relative rounded-lg bg-[#e8c089] border-[3px] border-[#8a5326] shadow-[0_12px_30px_-8px_rgba(0,0,0,0.45)]">
        {/* Folder tab */}
        <div className="absolute -top-3 left-5 bg-[#e8c089] border-[3px] border-[#8a5326] border-b-0 rounded-t-lg px-4 py-1.5">
          <span className="font-chaos text-[11px] sm:text-[13px] tracking-widest text-[#5a3a1a] leading-none">
            CASE FILE · ANALYSIS
          </span>
        </div>
        {/* Red CONFIDENTIAL stamp */}
        <div className="absolute -top-1.5 right-4 sm:right-6 rotate-[-12deg] z-20 pointer-events-none">
          <div className="border-[2.5px] border-[#c82424] text-[#c82424] px-2 py-0.5 text-[10px] sm:text-[12px] font-chaos tracking-[0.18em] bg-[#fdfcf9]/30">
            CONFIDENTIAL
          </div>
        </div>

        {/* Two-page spread */}
        <div className="pt-6 pb-5 px-3 sm:px-5 grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
          {/* ─── Page 1 — Summary ─── */}
          <div className="relative bg-[#fdfcf9] border border-[#c2a373] shadow-[0_4px_10px_rgba(0,0,0,0.18)] rotate-[-0.6deg] px-4 py-4">
            {/* Paperclip */}
            <div className="absolute -top-2 left-1/2 -translate-x-1/2 text-[22px] rotate-[8deg] drop-shadow pointer-events-none">📎</div>

            <div className="text-[10px] sm:text-[11px] font-mono uppercase tracking-[0.2em] text-[#8a5326]/90">
              Page 1 · Summary
            </div>
            <div className="mt-1.5 font-chaos text-[18px] sm:text-[22px] leading-tight text-[#1c1b18]">
              {item.source}
            </div>
            <div className="text-[12px] sm:text-[13px] font-mono italic text-[#5a3a1a]/70 mt-0.5">
              {item.date}{item.author ? ` · ${item.author}` : ''}
            </div>

            {item.confidence && (
              <div className="mt-4 rounded-md border-[3px] border-[#c82424] bg-[#fef0a8] px-3 py-3 text-center shadow-inner">
                <div className="text-[10px] sm:text-[11px] font-mono font-bold tracking-widest text-[#c82424] uppercase">
                  AI-generated probability
                </div>
                <div className="mt-1 font-chaos text-[36px] sm:text-[44px] leading-none text-[#c82424] drop-shadow">
                  {item.confidence}
                </div>
              </div>
            )}

            {item.fileAnalyzed && (
              <div className="mt-3.5 rounded bg-[#fef3c7] border border-amber-300 px-3 py-2">
                <div className="text-[9px] sm:text-[10px] font-mono uppercase tracking-widest text-[#5a3a1a]/70">
                  File analyzed
                </div>
                <div className="mt-0.5 text-[13px] sm:text-[14px] font-serif text-[#1c1b18] leading-snug">
                  {item.fileAnalyzed}
                </div>
              </div>
            )}
          </div>

          {/* ─── Page 2 — Findings ─── */}
          <div className="relative bg-[#fdfcf9] border border-[#c2a373] shadow-[0_4px_10px_rgba(0,0,0,0.18)] rotate-[0.8deg] px-4 py-4">
            {/* Paperclip */}
            <div className="absolute -top-2 left-1/2 -translate-x-1/2 text-[22px] rotate-[-12deg] drop-shadow pointer-events-none">📎</div>

            <div className="text-[10px] sm:text-[11px] font-mono uppercase tracking-[0.2em] text-[#8a5326]/90">
              Page 2 · What we caught
            </div>
            <div className="mt-1.5 font-chaos text-[18px] sm:text-[22px] leading-tight text-[#1c1b18]">
              Red flags
            </div>

            {item.flags?.length > 0 && (
              <ul className="mt-3 space-y-2.5">
                {item.flags.map((f, i) => (
                  <li key={i} className="flex gap-2.5 text-[13px] sm:text-[14px] leading-snug font-serif text-[#1c1b18]">
                    <span className="shrink-0 inline-flex h-5 w-5 sm:h-6 sm:w-6 items-center justify-center rounded-full bg-[#c82424] text-white text-[10px] sm:text-[11px] font-mono font-bold mt-0.5">
                      {i + 1}
                    </span>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Footer note */}
        {item.body && (
          <div className="px-5 pb-4 -mt-1">
            <div className="rounded border border-amber-400/60 bg-[#fef0a8]/70 px-3 py-2 text-[11px] sm:text-[12px] italic text-[#5a3a1a] leading-snug">
              <span className="font-mono font-bold not-italic mr-1.5">NOTE:</span>
              {item.body}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

/* ───────── EMAIL ───────── */
function EmailDoc({ item }) {
  return (
    <div className="bg-[#fbf8ee] text-[#1c1b18]">
      <div className="px-5 pt-5 pb-3 border-b-2 border-amber-300/50 bg-amber-50">
        <div className="text-[13px] font-mono uppercase tracking-[0.2em] text-amber-800/80">
          {item.source}
        </div>
        <div className="mt-2.5 grid grid-cols-[80px_1fr] gap-x-3 gap-y-1 text-[15px] leading-tight">
          {item.from && (<><div className="text-black/50 font-mono">From:</div><div className="font-bold truncate">{item.from}</div></>)}
          {item.to && (<><div className="text-black/50 font-mono">To:</div><div className="truncate">{item.to}</div></>)}
          {item.subject && (<><div className="text-black/50 font-mono">Subject:</div><div className="font-bold uppercase truncate">{item.subject}</div></>)}
          {item.date && (<><div className="text-black/50 font-mono">Date:</div><div>{item.date}</div></>)}
        </div>
      </div>
      <div className="px-5 py-5 text-[17px] leading-[1.7] font-serif whitespace-pre-wrap">
        {item.body}
      </div>
      {item.disclaimer && (
        <div className="mx-5 mb-5 border-t border-black/10 pt-4 text-[14px] italic text-black/60 whitespace-pre-wrap">
          {item.disclaimer}
        </div>
      )}
    </div>
  )
}

/* ───────── WIKIPEDIA ───────── */
function WikiDoc({ item }) {
  return (
    <div className="bg-white text-[#202122]">
      <div className="px-5 pt-5 pb-3 border-b border-[#a2a9b1]">
        <div className="flex items-center gap-2 mb-3 text-[13px] font-mono uppercase tracking-widest text-black/60">
          <span className="rounded bg-[#eaecf0] px-2 py-0.5 text-[#202122] text-[14px]">W</span>
          Wikipedia
        </div>
        <h1 className="text-[28px] font-serif leading-tight border-b border-[#a2a9b1] pb-2 mb-1.5">
          {item.entry || item.title}
        </h1>
        <div className="text-[14px] text-black/60 italic">From Wikipedia, the free encyclopedia</div>
      </div>

      {item.sections?.length > 0 ? (
        <div className="px-5 py-5 space-y-5">
          {item.sections.map((s, i) => (
            <div key={i}>
              {s.heading && (
                <h2 className="text-[19px] font-serif font-bold border-b border-[#a2a9b1]/60 pb-1 mb-2.5">
                  {s.heading}
                </h2>
              )}
              <div className="text-[17px] leading-[1.7] text-[#202122] whitespace-pre-wrap">
                {s.body}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="px-5 py-5 text-[17px] leading-[1.7] whitespace-pre-wrap">{item.body}</div>
      )}

      {item.references?.length > 0 && (
        <div className="px-5 pb-5 mt-2 border-t border-[#a2a9b1] pt-4">
          <h3 className="text-[15px] font-serif font-bold mb-2.5">References</h3>
          <ol className="space-y-1.5 text-[14px] text-black/70 list-decimal pl-6">
            {item.references.map((r, i) => (
              <li key={i}>{r}</li>
            ))}
          </ol>
        </div>
      )}
    </div>
  )
}

/* ───────── INSTAGRAM ───────── */
function InstagramDoc({ item }) {
  return (
    <div className="bg-white text-[#262626]">
      <div className="px-4 py-3 border-b border-black/10 flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-pink-500 via-orange-400 to-yellow-300 p-[2px]">
          <div className="h-full w-full rounded-full bg-white" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-[16px] font-bold truncate">{item.author}</div>
          {item.subtitle && <div className="text-[13px] text-black/55 truncate">{item.subtitle}</div>}
        </div>
        <div className="text-[22px] text-black/40">⋯</div>
      </div>

      <div className="aspect-square bg-gradient-to-br from-slate-200 to-slate-500 relative flex items-center justify-center">
        {item.imageHint && (
          <div className="text-[120px] opacity-70 drop-shadow-md">{item.imageHint}</div>
        )}
        {item.slides && (
          <div className="absolute top-3 right-3 text-[13px] font-mono bg-black/45 text-white px-2 py-0.5 rounded-full">
            {item.slides}
          </div>
        )}
      </div>

      <div className="px-4 pt-3 pb-4">
        <div className="flex items-center gap-5 text-[26px] mb-2">
          <span>♡</span><span>💬</span><span>📤</span>
        </div>
        {item.engagement?.likes && (
          <div className="text-[16px] font-bold mb-1.5">{item.engagement.likes} likes</div>
        )}
        <div className="text-[16px] leading-[1.55] whitespace-pre-wrap">
          <span className="font-bold mr-2">{item.author}</span>
          {item.body}
        </div>
        {item.date && (
          <div className="mt-3 text-[12px] uppercase tracking-widest text-black/45">{item.date}</div>
        )}
      </div>
    </div>
  )
}

/* ───────── GENERIC ───────── */
function GenericDoc({ item }) {
  return (
    <div className="bg-[#fdfcf9] px-6 py-6 text-[#1c1b18]">
      <div className="text-[13px] font-mono uppercase tracking-widest text-black/60">{item.source}</div>
      <h1 className="mt-2 font-serif font-bold text-[22px] leading-snug">{item.title}</h1>
      {item.author && <div className="mt-1.5 text-[15px] text-black/65 italic">{item.author}{item.date ? ` · ${item.date}` : ''}</div>}
      {item.body ? (
        <div className="mt-4 text-[17px] leading-[1.65] whitespace-pre-wrap font-serif">{item.body}</div>
      ) : (
        <div className="mt-4 text-[15px] italic text-black/50">(No preview available for this evidence.)</div>
      )}
    </div>
  )
}
