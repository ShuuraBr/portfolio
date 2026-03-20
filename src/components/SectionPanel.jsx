import React from 'react'
export default function SectionPanel({ title, children }) {
  return (
    <section className="panel">
      <div className="panel-title-row">
        <h3>{title}</h3>
      </div>
      {children}
    </section>
  );
}