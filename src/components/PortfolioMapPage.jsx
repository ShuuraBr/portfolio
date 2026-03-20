import React from 'react'
import { useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { profile, sections, cityZones } from '../data/portfolioData.js'

function SectionIcon({ type }) {
  const common = 'h-full w-full'
  switch (type) {
    case 'house':
      return (
        <svg viewBox="0 0 120 120" className={common} aria-hidden="true">
          <path d="M20 55 60 24 100 55" fill="none" stroke="currentColor" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M30 52h60v42H30z" fill="none" stroke="currentColor" strokeWidth="8" strokeLinejoin="round" />
          <path d="M52 70h16v24H52z" fill="none" stroke="currentColor" strokeWidth="8" strokeLinejoin="round" />
          <path d="M78 63h8" stroke="currentColor" strokeWidth="8" strokeLinecap="round" />
        </svg>
      )
    case 'city':
      return (
        <svg viewBox="0 0 120 120" className={common} aria-hidden="true">
          <path d="M18 96V52h22v44M46 96V34h28v62M78 96V22h24v74" fill="none" stroke="currentColor" strokeWidth="8" strokeLinejoin="round" />
          <path d="M26 62h6M26 74h6M54 46h8M54 60h8M54 74h8M86 34h8M86 48h8M86 62h8" stroke="currentColor" strokeWidth="8" strokeLinecap="round" />
        </svg>
      )
    case 'lab':
      return (
        <svg viewBox="0 0 120 120" className={common} aria-hidden="true">
          <path d="M46 20h28M54 20v24l-22 34a16 16 0 0 0 14 24h28a16 16 0 0 0 14-24L66 44V20" fill="none" stroke="currentColor" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M42 74h36" stroke="currentColor" strokeWidth="8" strokeLinecap="round" />
          <circle cx="50" cy="84" r="3" fill="currentColor" />
          <circle cx="69" cy="88" r="3" fill="currentColor" />
        </svg>
      )
    case 'tower':
      return (
        <svg viewBox="0 0 120 120" className={common} aria-hidden="true">
          <path d="M58 18h4v72h-4z" fill="currentColor" />
          <path d="M60 24 34 44h52L60 24Z" fill="none" stroke="currentColor" strokeWidth="8" strokeLinejoin="round" />
          <path d="M60 42 28 62h64L60 42Z" fill="none" stroke="currentColor" strokeWidth="8" strokeLinejoin="round" />
          <path d="M60 60 22 82h76L60 60Z" fill="none" stroke="currentColor" strokeWidth="8" strokeLinejoin="round" />
          <circle cx="60" cy="16" r="6" fill="currentColor" />
        </svg>
      )
    default:
      return (
        <svg viewBox="0 0 120 120" className={common} aria-hidden="true">
          <path d="M20 76h80M28 76V46h64v30M48 46V28h24v18" fill="none" stroke="currentColor" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M44 88h32" stroke="currentColor" strokeWidth="8" strokeLinecap="round" />
        </svg>
      )
  }
}

function IsometricTile({ zone, active, onSelect }) {
  return (
    <button
      type="button"
      onClick={() => onSelect(zone.id)}
      className="absolute -translate-x-1/2 -translate-y-1/2 text-left"
      style={{ left: zone.x, top: zone.y, width: zone.width, height: zone.height }}
    >
      <div
        className={`group relative h-full w-full transition duration-300 ${active ? 'scale-[1.03]' : 'hover:scale-[1.02]'}`}
        style={{ perspective: '900px' }}
      >
        <div className="absolute inset-[14%_10%_10%_10%] rounded-[34px] bg-black/25 blur-2xl" />

        <div
          className={`absolute inset-0 rounded-[36px] border transition-all duration-300 ${
            active
              ? 'border-cyan-300/80 shadow-[0_0_0_1px_rgba(103,232,249,0.35),0_22px_70px_rgba(14,165,233,0.22)]'
              : 'border-white/10 shadow-[0_14px_40px_rgba(2,6,23,0.35)]'
          }`}
          style={{
            transform: 'rotateX(58deg) rotateZ(-45deg)',
            transformStyle: 'preserve-3d',
            background: zone.tileGlow
          }}
        />

        <div
          className={`absolute inset-[17%_18%_26%_18%] rounded-[28px] border ${active ? 'border-cyan-200/50' : 'border-white/10'} bg-slate-950/68 backdrop-blur-md`}
          style={{ boxShadow: zone.panelShadow }}
        >
          <div className="absolute right-4 top-4 h-16 w-16 text-cyan-200/85">
            <SectionIcon type={zone.icon} />
          </div>
          <div className="px-6 py-5">
            <div className="text-[11px] uppercase tracking-[0.34em] text-cyan-300/85">{zone.district}</div>
            <div className="mt-3 text-[28px] font-semibold leading-none text-white">{zone.label}</div>
            <div className="mt-3 max-w-[75%] text-sm leading-6 text-slate-300">{zone.preview}</div>
          </div>
        </div>

        <div className="absolute bottom-[12%] left-[20%] right-[20%] flex items-end gap-3">
          {zone.skyline?.map((bar, idx) => (
            <div
              key={`${zone.id}-${idx}`}
              className="rounded-t-xl border border-white/8 bg-gradient-to-t from-slate-700/65 to-cyan-200/10"
              style={{ width: bar.w, height: bar.h }}
            />
          ))}
        </div>
      </div>
    </button>
  )
}

function DataRover({ target }) {
  return (
    <motion.div
      animate={{ left: target.x, top: target.y }}
      transition={{ type: 'spring', stiffness: 115, damping: 16, mass: 0.8 }}
      className="absolute z-30 -translate-x-1/2 -translate-y-1/2"
      style={{ width: 92, height: 92 }}
    >
      <motion.div
        animate={{ y: [0, -5, 0], rotate: [0, 1.5, 0, -1.5, 0] }}
        transition={{ duration: 3.6, repeat: Infinity, ease: 'easeInOut' }}
        className="relative h-full w-full"
      >
        <div className="absolute left-1/2 top-[16%] h-6 w-6 -translate-x-1/2 rounded-full border border-cyan-200/90 bg-cyan-300/80 shadow-[0_0_25px_rgba(103,232,249,0.95)]" />
        <div className="absolute left-1/2 top-[30%] h-12 w-14 -translate-x-1/2 rounded-[18px] border border-cyan-100/25 bg-slate-950/92 shadow-[0_16px_40px_rgba(14,165,233,0.24)]" />
        <div className="absolute left-1/2 top-[38%] h-4 w-8 -translate-x-1/2 rounded-full bg-cyan-300/90" />
        <div className="absolute left-[24%] top-[74%] h-2 w-8 rounded-full bg-slate-100/25" />
        <div className="absolute right-[24%] top-[74%] h-2 w-8 rounded-full bg-slate-100/25" />
        <div className="absolute left-[20%] top-[76%] h-2 w-10 rounded-full bg-cyan-300/35 blur-sm" />
        <div className="absolute right-[20%] top-[76%] h-2 w-10 rounded-full bg-cyan-300/35 blur-sm" />
        <div className="absolute inset-x-4 bottom-[14%] h-6 rounded-full bg-cyan-300/30 blur-xl" />
      </motion.div>
    </motion.div>
  )
}

function SidePanel({ section }) {
  return (
    <AnimatePresence mode="wait">
      <motion.aside
        key={section.id}
        initial={{ opacity: 0, x: 22, y: 8 }}
        animate={{ opacity: 1, x: 0, y: 0 }}
        exit={{ opacity: 0, x: -18, y: -6 }}
        transition={{ duration: 0.24 }}
        className="w-full max-w-[470px] rounded-[30px] border border-white/10 bg-[linear-gradient(180deg,rgba(2,6,23,0.92),rgba(2,6,23,0.78))] p-6 shadow-[0_18px_50px_rgba(2,6,23,0.46)] backdrop-blur-xl"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-xs uppercase tracking-[0.30em] text-cyan-300">{section.tag}</div>
            <h2 className="mt-3 text-3xl font-semibold text-white">{section.title}</h2>
          </div>
          <div className="h-14 w-14 text-cyan-200/85">
            <SectionIcon type={section.icon} />
          </div>
        </div>

        <p className="mt-5 text-sm leading-7 text-slate-300">{section.description}</p>

        <div className="mt-6 grid gap-3">
          {section.bullets.map((item) => (
            <div key={item} className="rounded-2xl border border-white/8 bg-white/[0.04] px-4 py-3 text-sm leading-6 text-slate-200">
              {item}
            </div>
          ))}
        </div>
      </motion.aside>
    </AnimatePresence>
  )
}

export default function PortfolioMapPage() {
  const [selectedId, setSelectedId] = useState('projects')

  const activeSection = useMemo(
    () => sections.find((section) => section.id === selectedId) ?? sections[0],
    [selectedId]
  )

  const activeZone = useMemo(
    () => cityZones.find((zone) => zone.id === selectedId) ?? cityZones[0],
    [selectedId]
  )

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_15%_20%,rgba(34,211,238,0.12),transparent_20%),radial-gradient(circle_at_85%_12%,rgba(37,99,235,0.16),transparent_22%),linear-gradient(135deg,#020617_0%,#031224_42%,#020617_100%)] text-white">
      <div className="mx-auto flex min-h-screen max-w-[1700px] flex-col px-6 py-6 lg:px-8">
        <header className="mb-6 rounded-[30px] border border-white/10 bg-white/[0.04] px-6 py-6 shadow-[0_16px_50px_rgba(2,6,23,0.34)] backdrop-blur-xl">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
            <div>
              <div className="text-xs uppercase tracking-[0.34em] text-cyan-300">Portfólio Interativo</div>
              <h1 className="mt-3 text-4xl font-semibold tracking-tight text-white md:text-5xl">{profile.name}</h1>
              <p className="mt-3 text-base text-slate-300">{profile.role}</p>
            </div>
            <div className="max-w-3xl text-sm leading-7 text-slate-300">{profile.summary}</div>
          </div>
        </header>

        <div className="grid flex-1 gap-6 xl:grid-cols-[1.55fr_0.82fr]">
          <section className="relative overflow-hidden rounded-[34px] border border-white/10 bg-[linear-gradient(180deg,rgba(2,6,23,0.58),rgba(2,6,23,0.78))] shadow-[0_20px_70px_rgba(2,6,23,0.42)] backdrop-blur-xl">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_28%,rgba(34,211,238,0.12),transparent_16%),radial-gradient(circle_at_62%_20%,rgba(59,130,246,0.12),transparent_18%),radial-gradient(circle_at_80%_70%,rgba(129,140,248,0.12),transparent_16%)]" />
            <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-cyan-300/5 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 h-56 bg-gradient-to-t from-cyan-500/[0.04] to-transparent" />

            <div className="relative h-[76vh] min-h-[720px] px-4 py-4 lg:px-6 lg:py-6">
              <div className="absolute left-[10%] top-[14%] h-44 w-44 rounded-full bg-cyan-400/8 blur-3xl" />
              <div className="absolute left-[44%] top-[6%] h-44 w-44 rounded-full bg-blue-400/10 blur-3xl" />
              <div className="absolute right-[8%] top-[18%] h-48 w-48 rounded-full bg-indigo-400/10 blur-3xl" />
              <div className="absolute bottom-[8%] left-[20%] h-36 w-36 rounded-full bg-cyan-400/8 blur-3xl" />

              <div className="absolute left-[10%] top-[64%] h-[14px] w-[78%] rounded-full bg-gradient-to-r from-white/6 via-cyan-200/10 to-white/6 blur-[1px]" />
              <div className="absolute left-[31%] top-[30%] h-[34%] w-[14px] rounded-full bg-gradient-to-b from-white/6 via-cyan-200/12 to-white/6 blur-[1px]" />
              <div className="absolute left-[62%] top-[26%] h-[40%] w-[14px] rounded-full bg-gradient-to-b from-white/6 via-cyan-200/12 to-white/6 blur-[1px]" />
              <div className="absolute left-[68%] top-[32%] h-[14px] w-[18%] rounded-full bg-gradient-to-r from-white/6 via-cyan-200/12 to-white/6 blur-[1px]" />

              {cityZones.map((zone) => (
                <IsometricTile key={zone.id} zone={zone} active={zone.id === selectedId} onSelect={setSelectedId} />
              ))}

              <DataRover target={activeZone} />

              <div className="absolute bottom-5 left-5 right-5 rounded-[26px] border border-white/10 bg-slate-950/58 px-5 py-4 backdrop-blur-lg">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <div className="text-xs uppercase tracking-[0.28em] text-cyan-300">Guia de navegação</div>
                    <div className="mt-2 text-sm leading-7 text-slate-200">
                      Explore a cidade de dados clicando nos distritos. Cada ambiente abre um painel com conteúdo profissional, cases e posicionamento técnico.
                    </div>
                  </div>
                  <div className="rounded-2xl border border-cyan-300/20 bg-cyan-300/8 px-4 py-3 text-sm text-cyan-100">
                    Unidade ativa: <span className="font-semibold">{activeZone.label}</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <div className="flex flex-col gap-6">
            <SidePanel section={activeSection} />

            <section className="rounded-[30px] border border-white/10 bg-white/[0.04] p-6 shadow-[0_16px_50px_rgba(2,6,23,0.34)] backdrop-blur-xl">
              <div className="text-xs uppercase tracking-[0.30em] text-cyan-300">Terminal de Contato</div>
              <div className="mt-5 grid gap-3 text-sm text-slate-200">
                <a className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 transition hover:border-cyan-300/40 hover:bg-cyan-300/[0.06]" href={profile.github} target="_blank" rel="noreferrer">GitHub — código, projetos e experimentos</a>
                <a className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 transition hover:border-cyan-300/40 hover:bg-cyan-300/[0.06]" href={profile.linkedin} target="_blank" rel="noreferrer">LinkedIn — trajetória, networking e posicionamento profissional</a>
                <a className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 transition hover:border-cyan-300/40 hover:bg-cyan-300/[0.06]" href={`mailto:${profile.email}`}>Currículo / contato direto — {profile.email}</a>
              </div>
            </section>

            <section className="rounded-[30px] border border-white/10 bg-[linear-gradient(180deg,rgba(15,23,42,0.82),rgba(15,23,42,0.72))] p-6 shadow-[0_16px_50px_rgba(2,6,23,0.34)] backdrop-blur-xl">
              <div className="text-xs uppercase tracking-[0.30em] text-cyan-300">Leitura Executiva</div>
              <div className="mt-4 space-y-3 text-sm leading-7 text-slate-300">
                <p>O mapa foi redesenhado como uma cidade de dados, com distritos visuais específicos para projetos, posicionamento profissional, stack, analytics e contato.</p>
                <p>O marcador central foi substituído por um rover de exploração, alinhado à lógica de navegação do ambiente e mais coerente com a experiência proposta.</p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}