import React from 'react'
export default function Header({ title, subtitle }) {
  return (
    <header className="page-header">
      <div>
        <p className="eyebrow">ANÁLISE DE DADOS · EXPERIÊNCIA INTERATIVA</p>
        <h2>{title}</h2>
        <p className="page-subtitle">{subtitle}</p>
      </div>
    </header>
  );
}