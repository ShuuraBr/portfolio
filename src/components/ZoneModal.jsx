import React from 'react'
import { dashboardMetrics, profile, projects } from '../data/portfolioData.js';
import MetricCard from './MetricCard.jsx';
import ProjectCard from './ProjectCard.jsx';

function modalContent(zoneId) {
  switch (zoneId) {
    case 'projects':
      return {
        title: 'Distrito dos Projetos',
        body: (
          <div className="modal-grid">
            {projects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        )
      };
    case 'about':
      return {
        title: 'Casa do Analista',
        body: (
          <div className="modal-stack">
            <p>{profile.summary}</p>
            <div className="metric-grid compact">
              <MetricCard label="Nome" value={profile.name} />
              <MetricCard label="Atuação" value={profile.role} />
              <MetricCard label="Foco" value="Planejamento e Dados" />
              <MetricCard label="Entrega" value="Análise + Execução" />
            </div>
          </div>
        )
      };
    case 'stack':
      return {
        title: 'Laboratório Tech',
        body: (
          <div className="tag-list large">
            {profile.stack.map((item) => (
              <span key={item} className="tag">{item}</span>
            ))}
          </div>
        )
      };
    case 'dashboards':
      return {
        title: 'Centro de Controle',
        body: (
          <div className="modal-stack">
            <div className="metric-grid compact">
              {dashboardMetrics.map((metric) => (
                <MetricCard key={metric.label} label={metric.label} value={metric.value} />
              ))}
            </div>
            <div className="project-card">
              <div className="project-topline">Estrutura recomendada</div>
              <h4>Dashboards orientados a decisão</h4>
              <p>KPIs executivos, decomposição de causas, navegação por filtros, leitura geográfica e foco em pergunta de negócio.</p>
            </div>
          </div>
        )
      };
    case 'contact':
      return {
        title: 'Terminal de Contato',
        body: (
          <div className="modal-stack">
            <a className="contact-link" href={profile.contact.linkedin} target="_blank" rel="noreferrer">LinkedIn</a>
            <a className="contact-link" href={profile.contact.github} target="_blank" rel="noreferrer">GitHub</a>
            <a className="contact-link" href={`mailto:${profile.contact.email}`}>{profile.contact.email}</a>
          </div>
        )
      };
    default:
      return null;
  }
}

export default function ZoneModal({ zoneId, onClose }) {
  const content = zoneId ? modalContent(zoneId) : null;
  if (!content) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={(event) => event.stopPropagation()}>
        <div className="modal-header">
          <div>
            <p className="eyebrow">ÁREA INTERATIVA</p>
            <h3>{content.title}</h3>
          </div>
          <button type="button" className="close-button" onClick={onClose}>Fechar</button>
        </div>
        <div className="modal-body">{content.body}</div>
      </div>
    </div>
  );
}