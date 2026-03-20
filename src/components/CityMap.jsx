import React from 'react'
import { useEffect, useMemo, useState } from 'react'
import { locations } from '../data/portfolioData'

const STEP = 2.5

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value))
}

function distance(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y)
}

function Building({ location, focused, onOpen }) {
  return (
    <button
      type="button"
      aria-label={location.title}
      onClick={() => onOpen(location.id)}
      className="group absolute -translate-x-1/2 -translate-y-1/2 focus:outline-none"
      style={{ left: `${location.x}%`, top: `${location.y}%` }}
    >
      <div className={`building ${location.building} ${focused ? 'active' : ''}`}>
        <div className="building-glow" />
        <div className="building-core">
          <div className="building-title">
            <span className="building-kicker">{location.label}</span>
            <strong>{location.title}</strong>
          </div>
        </div>
      </div>
    </button>
  )
}

export default function CityMap({ activeId, onActiveChange, onOpen }) {
  const [player, setPlayer] = useState({ x: 50, y: 78 })

  useEffect(() => {
    function handleKeyDown(event) {
      if (["ArrowUp", "w", "W"].includes(event.key)) {
        setPlayer((prev) => ({ ...prev, y: clamp(prev.y - STEP, 8, 92) }))
      }
      if (["ArrowDown", "s", "S"].includes(event.key)) {
        setPlayer((prev) => ({ ...prev, y: clamp(prev.y + STEP, 8, 92) }))
      }
      if (["ArrowLeft", "a", "A"].includes(event.key)) {
        setPlayer((prev) => ({ ...prev, x: clamp(prev.x - STEP, 4, 96) }))
      }
      if (["ArrowRight", "d", "D"].includes(event.key)) {
        setPlayer((prev) => ({ ...prev, x: clamp(prev.x + STEP, 4, 96) }))
      }
      if (event.key === 'Enter' && activeId) {
        onOpen(activeId)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [activeId, onOpen])

  const nearest = useMemo(() => {
    const sorted = [...locations].sort((a, b) => distance(player, a) - distance(player, b))
    return sorted[0]
  }, [player])

  useEffect(() => {
    if (!nearest) return
    if (distance(player, nearest) <= 16) {
      onActiveChange(nearest.id)
    } else {
      onActiveChange(null)
    }
  }, [nearest, player, onActiveChange])

  const camera = useMemo(() => {
    const translateX = (player.x - 50) * -0.65
    const translateY = (player.y - 50) * -0.5
    const rotateY = (player.x - 50) * 0.08
    return {
      transform: `translate(${translateX}px, ${translateY}px) rotateX(67deg) rotateZ(-2deg) rotateY(${rotateY}deg)`,
    }
  }, [player])

  return (
    <div className="relative h-full w-full overflow-hidden rounded-[32px] border border-white/10 bg-[radial-gradient(circle_at_top,#10305f_0%,#07152d_34%,#040b18_68%,#020611_100%)] shadow-[0_20px_80px_rgba(2,12,28,0.75)]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(56,189,248,0.16),transparent_24%),radial-gradient(circle_at_80%_18%,rgba(14,165,233,0.12),transparent_16%),radial-gradient(circle_at_70%_70%,rgba(99,102,241,0.10),transparent_18%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(148,163,184,0.08),transparent_18%,transparent_82%,rgba(2,6,23,0.85))]" />

      <div className="absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 items-center gap-3 rounded-full border border-white/10 bg-slate-950/60 px-4 py-3 text-xs text-slate-200 backdrop-blur-lg">
        <span className="inline-flex h-3 w-3 rounded-full bg-cyan-300 shadow-[0_0_18px_rgba(103,232,249,0.85)]" />
        <span>Você está no mapa. Aproxime-se de um edifício para entrar em foco.</span>
      </div>

      <div className="map-perspective absolute inset-x-[2%] bottom-[6%] top-[10%] [perspective:1700px]">
        <div className="city-plane" style={camera}>
          <div className="street-grid" />
          <div className="road road-main-h" />
          <div className="road road-main-v" />
          <div className="road road-side-left" />
          <div className="road road-side-right" />
          <div className="road road-cross-top" />
          <div className="road road-cross-bottom" />
          <div className="road road-lab-link" />
          <div className="road road-contact-link" />
          <div className="lane-glow lane-h" />
          <div className="lane-glow lane-v" />

          {locations.map((location) => (
            <Building
              key={location.id}
              location={location}
              focused={activeId === location.id}
              onOpen={onOpen}
            />
          ))}

          <div
            className="player-marker"
            style={{ left: `${player.x}%`, top: `${player.y}%` }}
          >
            <div className="player-shadow" />
            <div className="player-body">
              <span />
            </div>
          </div>
        </div>
      </div>

      <div className="pointer-events-none absolute inset-x-6 bottom-24 z-20 flex justify-between text-[11px] uppercase tracking-[0.32em] text-slate-400 sm:inset-x-10">
        <span>Setor institucional</span>
        <span>Centro analítico</span>
        <span>Saída e contato</span>
      </div>
    </div>
  )
}