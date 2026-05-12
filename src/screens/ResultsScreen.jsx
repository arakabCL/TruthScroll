import { motion } from 'framer-motion'

export default function ResultsScreen({
  result,
  runningScore,
  headlineIndex,
  totalHeadlines,
  onNext,
  onRestart,
  isRoundOver,
}) {
  const { headline, chosenVerdict, correct, board, breakdown } = result

  return (
    <div className="relative flex min-h-[100dvh] w-full items-center justify-center bg-[#2b221a] p-4 sm:p-8 overflow-hidden text-[#3b2a1a] selection:bg-black/10 shadow-[inset_0_0_150px_rgba(0,0,0,0.8)]">
      
      {/* Premium dark desk texture */}
      <div className="absolute inset-0 opacity-[0.25] pointer-events-none mix-blend-overlay" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }} />
      <div className="absolute inset-0 pointer-events-none mix-blend-multiply opacity-50 bg-gradient-to-br from-[#7a4c28] to-[#120a05]" />
           
      {/* Desk Decorations (Pens, Paperclips) */}
      <div className="absolute top-10 left-[10%] text-5xl rotate-45 opacity-60 drop-shadow-md z-0 pointer-events-none">📎</div>
      <div className="absolute bottom-20 left-[15%] text-6xl -rotate-12 opacity-80 drop-shadow-md z-0 pointer-events-none">🖋️</div>
      <div className="absolute bottom-10 right-[15%] text-5xl rotate-[70deg] opacity-60 drop-shadow-md z-0 pointer-events-none">📎</div>
      <div className="absolute top-20 right-[5%] text-6xl rotate-[120deg] opacity-70 drop-shadow-md z-0 pointer-events-none">✏️</div>

      {/* Main Manila Folder */}
      <motion.div 
        initial={{ y: 50, opacity: 0, rotate: -2 }}
        animate={{ y: 0, opacity: 1, rotate: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        className="relative w-full max-w-xl bg-[#e4c49d] rounded-sm shadow-card border-2 border-[#d2ab7a] p-5 sm:p-8 flex flex-col font-serif text-[#3b2a1a] z-10"
      >
        {/* Folder Tab */}
        <div className="absolute -top-10 left-10 w-48 h-10 bg-[#e4c49d] rounded-t-xl border-t-2 border-l-2 border-r-2 border-[#d2ab7a] shadow-[0_-4px_6px_rgba(0,0,0,0.05)] flex items-center px-4 -z-10">
          <span className="text-[10px] font-mono tracking-widest uppercase opacity-50">Case File {headlineIndex + 1}</span>
        </div>

        {/* Score Sticky Note */}
        <motion.div 
          initial={{ scale: 0, rotate: 0 }}
          animate={{ scale: 1, rotate: 12 }}
          transition={{ delay: 0.4, type: 'spring' }}
          className="absolute -top-6 -right-6 w-20 h-20 bg-[#fca5a5] shadow-md flex flex-col items-center justify-center font-serif font-bold text-black border border-red-300 z-30"
        >
          <span className="text-[9px] uppercase tracking-widest opacity-70">Points</span>
          <span className="text-2xl border-b-2 border-black/20 pb-0.5">+{breakdown.total}</span>
        </motion.div>

        {/* Content Top Section */}
        <div className="flex flex-col sm:flex-row gap-6 sm:gap-8 border-b-2 border-[#d2ab7a]/40 pb-6 mb-6 relative">
          {/* Big Paperclip */}
          <div className="absolute -top-10 left-8 text-7xl text-gray-500/80 rotate-12 drop-shadow-md z-30 pointer-events-none">📎</div>
          
          {/* Polaroid */}
          <div className="w-36 sm:w-44 shrink-0 bg-[#fdfcf9] p-2 pb-8 sm:p-3 sm:pb-10 shadow-md rounded-sm rotate-[-4deg] border border-[#e6ded3] self-start z-20">
            <div className="w-full aspect-square bg-black overflow-hidden relative shadow-inner mb-2 border border-black/10">
              {headline.video ? (
                <video src={headline.video} autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover opacity-90" />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-5xl bg-[#1c1b18] text-white">
                  {headline.thumbnail}
                </div>
              )}
            </div>
            <div className="text-center font-serif italic text-xs sm:text-sm text-black/70 font-bold opacity-80">
              Picture of Video
            </div>
          </div>
          
          {/* Findings */}
          <div className="flex-1">
             <div className="text-lg sm:text-xl font-bold uppercase tracking-wider mb-4 border-b-2 border-[#3b2a1a] inline-block pb-1">
               Subject: VIRAL POST #{headlineIndex + 1}
             </div>
             <div className="text-base sm:text-lg font-bold mb-2">Findings:</div>
             <ul className="space-y-2 text-[13px] sm:text-[15px] font-medium leading-tight">
                {board.length === 0 ? (
                  <li className="italic text-black/40">- No evidence submitted</li>
                ) : (
                  board.map(e => (
                    <li key={e.id} className="flex items-start gap-2">
                      <span className="font-bold opacity-70">-</span>
                      <span className="leading-snug">{e.title}</span>
                    </li>
                  ))
                )}
             </ul>
          </div>
        </div>

        {/* Conclusion Section */}
        <div className="border-b-2 border-[#d2ab7a]/40 pb-6 mb-6">
          <div className="text-base sm:text-lg font-bold mb-2">Conclusion:</div>
          <p className="text-[14px] sm:text-[16px] leading-relaxed whitespace-pre-wrap font-medium">
            {headline.explanation}
          </p>
        </div>

        {/* Verdict Stamp Area */}
        <div className="mt-4 self-end w-full max-w-[300px] relative">
          <div className="text-sm font-bold mb-1 ml-2 opacity-80">Verdict:</div>
          <div className="relative border-[5px] border-[#3b2a1a] p-4 sm:p-5 rotate-[-3deg] inline-block w-full text-center group">
            {/* Ink bleed effect */}
            <div className="absolute inset-0 opacity-[0.03] bg-black"></div>
            
            <span className="text-[#3b2a1a] text-3xl sm:text-4xl font-chaos uppercase tracking-tighter block leading-none mix-blend-multiply">
              {headline.correctVerdict}
            </span>
            
            {/* Hand-drawn scribble over verdict if needed */}
            <div className="absolute bottom-2 left-4 right-4 h-1 bg-[#3b2a1a] opacity-60 rounded-full rotate-1"></div>
            <div className="absolute top-2 left-6 right-2 h-[2px] bg-[#3b2a1a] opacity-40 rounded-full -rotate-1"></div>
          </div>

          {!correct && (
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.6, type: 'spring' }}
              className="absolute -bottom-4 -left-6 sm:-left-12 rotate-12 text-sm font-bold bg-[#fca5a5] border border-red-400 text-red-900 px-3 py-1 shadow-sm whitespace-nowrap"
            >
              You said: {chosenVerdict}
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Action Sticky Notes */}
      <motion.button 
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        onClick={onRestart} 
        className="absolute left-2 sm:left-10 md:left-20 top-[60%] sm:top-1/2 -translate-y-1/2 w-20 sm:w-24 h-20 sm:h-24 bg-[#fde047] shadow-lg rotate-[-8deg] flex flex-col items-center justify-center font-serif font-bold text-xs sm:text-sm press hover:scale-105 border border-[#eab308]/50 text-black/80 z-20"
      >
        <span className="uppercase tracking-widest text-center">Try<br/>Again</span>
        <span className="text-xl sm:text-2xl mt-1">←</span>
      </motion.button>

      {!isRoundOver ? (
        <motion.button 
          initial={{ x: 100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          onClick={onNext} 
          className="absolute right-2 sm:right-10 md:right-20 top-[40%] sm:top-1/2 -translate-y-1/2 w-20 sm:w-24 h-20 sm:h-24 bg-[#fde047] shadow-lg rotate-[5deg] flex flex-col items-center justify-center font-serif font-bold text-xs sm:text-sm press hover:scale-105 border border-[#eab308]/50 text-black/80 z-20"
        >
          <span className="uppercase tracking-widest text-center mb-1">Continue</span>
          <span className="text-xl sm:text-2xl leading-none">→</span>
        </motion.button>
      ) : (
        <motion.button 
          initial={{ x: 100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          onClick={onRestart} 
          className="absolute right-2 sm:right-10 md:right-20 top-[40%] sm:top-1/2 -translate-y-1/2 w-24 sm:w-28 h-24 sm:h-28 bg-[#fde047] shadow-lg rotate-[5deg] flex flex-col items-center justify-center font-serif font-bold text-xs sm:text-sm press hover:scale-105 border border-[#eab308]/50 text-black/80 z-20"
        >
          <span className="uppercase tracking-widest text-center mb-1">New<br/>Round</span>
          <span className="text-xl sm:text-2xl leading-none">→</span>
          <span className="text-[10px] mt-1 opacity-60">Total: {runningScore}</span>
        </motion.button>
      )}
    </div>
  )
}
