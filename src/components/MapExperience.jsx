import React from 'react'
import { useEffect, useMemo, useState } from 'react';
import { zones } from '../data/portfolioData.js';

const START = { x: 46, y: 52 };
const STEP = 2.2;

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function isInside(player, zone) {
  return (
    player.x >= zone.x &&
    player.x <= zone.x + zone.width &&
    player.y >= zone.y &&
    player.y <= zone.y + zone.height
  );
}

export default function MapExperience({ onZoneOpen }) {
  const [player, setPlayer] = useState(START);
  const activeZone = useMemo(() => zones.find((zone) => isInside(player, zone)) || null, [player]);

  useEffect(() => {
    function onKeyDown(event) {
      const key = event.key.toLowerCase();
      setPlayer((current) => {
        let next = { ...current };
        if (key === 'arrowup' || key === 'w') next.y -= STEP;
        if (key === 'arrowdown' || key === 's') next.y += STEP;
        if (key === 'arrowleft' || key === 'a') next.x -= STEP;
        if (key === 'arrowright' || key === 'd') next.x += STEP;
        return {
          x: clamp(next.x, 4, 95),
          y: clamp(next.y, 8, 92)
        };
      });

      if ((key === 'enter' || key === ' ') && activeZone) {
        event.preventDefault();
        onZoneOpen(activeZone.id);
      }
    }

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [activeZone, onZoneOpen]);

  return (
    <div className="map-shell">
      <div className="map-legend">
        <span>Use WASD ou setas para mover.</span>
        <span>Enter abre a área ativa.</span>
      </div>

      <div className="map-canvas">
        <div className="roads road-h" />
        <div className="roads road-v" />
        <div className="plaza">Praça Central</div>

        {zones.map((zone) => (
          <button
            type="button"
            key={zone.id}
            className={`zone ${activeZone?.id === zone.id ? 'zone-active' : ''}`}
            style={{
              left: `${zone.x}%`,
              top: `${zone.y}%`,
              width: `${zone.width}%`,
              height: `${zone.height}%`,
              '--zone-color': zone.color
            }}
            onClick={() => onZoneOpen(zone.id)}
          >
            <span className="zone-title">{zone.title}</span>
            <span className="zone-subtitle">{zone.subtitle}</span>
          </button>
        ))}

        <div className="player" style={{ left: `${player.x}%`, top: `${player.y}%` }}>
          <div className="player-core" />
          <div className="player-ring" />
        </div>
      </div>

      <div className="mobile-actions">
        {zones.map((zone) => (
          <button key={zone.id} type="button" className="secondary-button" onClick={() => onZoneOpen(zone.id)}>
            {zone.title}
          </button>
        ))}
      </div>
    </div>
  );
}