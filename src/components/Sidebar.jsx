import React from 'react'
import { NavLink } from 'react-router-dom';

const items = [
  { to: '/', label: 'Mapa' },
  { to: '/projetos', label: 'Projetos' },
  { to: '/sobre', label: 'Sobre mim' },
  { to: '/stack', label: 'Stack' },
  { to: '/dashboards', label: 'Dashboards' },
  { to: '/contato', label: 'Contato' }
];

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div>
        <div className="brand-chip">PORTFÓLIO INTERATIVO</div>
        <h1 className="brand-title">Data Journey</h1>
        <p className="brand-subtitle">Experiência navegável para apresentar projetos, capacidade técnica e leitura de negócio.</p>
      </div>

      <nav className="nav-list">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        Publicação compatível com Hostinger e GitHub Pages.
      </div>
    </aside>
  );
}