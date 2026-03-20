import React from 'react'
export default function ProjectCard({ project }) {
  return (
    <article className="project-card">
      <div className="project-topline">{project.category}</div>
      <h4>{project.title}</h4>
      <p><strong>Problema:</strong> {project.problem}</p>
      <p><strong>Abordagem:</strong> {project.approach}</p>
      <p><strong>Resultado:</strong> {project.outcome}</p>
      <div className="tag-list">
        {project.tools.map((tool) => (
          <span key={tool} className="tag">{tool}</span>
        ))}
      </div>
    </article>
  );
}