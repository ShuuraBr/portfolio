import React, { useMemo, useState } from 'react';
import CityScene from './components/CityScene.jsx';
import { districts } from './cityData.js';

export default function App() {
  const [activeId, setActiveId] = useState('projects');
  const activeDistrict = useMemo(
    () => districts.find((district) => district.id === activeId) ?? districts[0],
    [activeId]
  );

  return (
    <div className="app-shell">
      <div className="hero-panel glass">
        <div>
          <div className="eyebrow">PORTFÓLIO 3D INTERATIVO</div>
          <h1>Cidade Analítica 3D</h1>
          <p>
            Experiência premium em Three.js para apresentar projetos, trajetória, stack e dashboards em um
            ambiente urbano navegável e mais próximo de produto digital do que de portfólio estático.
          </p>
        </div>

        <div className="hero-actions">
          {districts.map((district) => (
            <button
              key={district.id}
              className={district.id === activeId ? 'pill active' : 'pill'}
              onClick={() => setActiveId(district.id)}
            >
              <span>{district.index}</span>
              {district.short}
            </button>
          ))}
        </div>
      </div>

      <div className="content-grid">
        <section className="scene-card glass">
          <div className="scene-header">
            <div>
              <div className="eyebrow">CENA PRINCIPAL</div>
              <h2>{activeDistrict.name}</h2>
            </div>
            <div className="scene-help">Clique no prédio ou use os atalhos no topo para focar um distrito.</div>
          </div>

          <div className="scene-wrapper">
            <CityScene districts={districts} activeDistrict={activeDistrict} onSelect={setActiveId} />
          </div>
        </section>

        <aside className="side-panel glass">
          <div className="eyebrow">DISTRITO ATIVO</div>
          <h3>{activeDistrict.short}</h3>
          <p className="subtitle">{activeDistrict.subtitle}</p>
          <p className="description">{activeDistrict.description}</p>

          <div className="metric-card" style={{ '--accent': activeDistrict.color }}>
            <div className="metric-label">Estrutura</div>
            <div className="metric-value">{activeDistrict.name}</div>
          </div>

          <div className="metric-card" style={{ '--accent': activeDistrict.accent }}>
            <div className="metric-label">Posicionamento</div>
            <div className="metric-value">Bloco {activeDistrict.index}</div>
          </div>

          <div className="details-list">
            {activeDistrict.details.map((item) => (
              <div key={item} className="detail-item">
                {item}
              </div>
            ))}
          </div>

          <div className="quick-notes">
            <div className="eyebrow">DIREÇÃO DE EVOLUÇÃO</div>
            <ul>
              <li>Inserir os seus projetos reais em cada prédio.</li>
              <li>Adicionar câmera com rota cinematográfica e aproximação por hover.</li>
              <li>Conectar GitHub, LinkedIn, currículo e dashboards definitivos.</li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}
