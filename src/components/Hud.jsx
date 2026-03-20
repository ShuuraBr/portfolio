import React from 'react'
export default function Hud({ activeLocation }) {
  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 z-30 flex justify-center px-4 pt-4 sm:px-8 sm:pt-6">
      <div className="w-full max-w-7xl rounded-[28px] border border-white/10 bg-white/5 px-5 py-4 backdrop-blur-xl shadow-neon sm:px-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-2 text-xs font-semibold uppercase tracking-[0.35em] text-cyan-300">
              Portfólio Interativo
            </div>
            <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-5xl">
              Seu Nome Aqui
            </h1>
            <p className="mt-2 text-base text-slate-300 sm:text-2xl sm:leading-none">
              Analista de Dados | BI | SQL | Dashboards
            </p>
          </div>

          <div className="max-w-xl text-sm leading-6 text-slate-300 sm:text-base">
            Navegue pela cidade com as setas ou teclas W, A, S e D. Pressione Enter ou clique em um edifício para abrir o conteúdo.
            <div className="mt-2 rounded-2xl border border-cyan-400/20 bg-cyan-400/5 px-4 py-2 text-cyan-100">
              Zona em foco: <span className="font-semibold">{activeLocation?.title ?? 'Exploração livre'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}