import React from 'react'
export default function InfoPanel({ location, onClose }) {
  return (
    <aside className="absolute right-4 top-32 z-40 w-[min(420px,calc(100vw-2rem))] overflow-hidden rounded-[28px] border border-white/10 bg-slate-950/85 backdrop-blur-2xl shadow-[0_30px_100px_rgba(0,0,0,0.45)] sm:right-8 sm:top-36">
      <div className={`h-1 w-full bg-gradient-to-r ${location.accent}`} />
      <div className="p-6 sm:p-7">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.35em] text-cyan-300">
              {location.label}
            </div>
            <h2 className="mt-2 text-3xl font-semibold text-white">{location.title}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-300">{location.subtitle}</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-full border border-white/10 px-3 py-2 text-sm text-slate-200 transition hover:border-cyan-300/60 hover:text-white"
          >
            Fechar
          </button>
        </div>

        <p className="rounded-2xl border border-white/5 bg-white/5 p-4 text-sm leading-6 text-slate-300">
          {location.description}
        </p>

        <div className="mt-5 space-y-3">
          {location.bullets.map((item) => (
            <div
              key={item}
              className="rounded-2xl border border-white/10 bg-slate-900/70 px-4 py-3 text-sm leading-6 text-slate-200"
            >
              {item}
            </div>
          ))}
        </div>
      </div>
    </aside>
  )
}