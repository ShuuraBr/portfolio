export const profile = {
  name: 'Seu Nome Aqui',
  role: 'Analista de Dados | BI | SQL | Dashboards',
  headline:
    'Portfólio interativo com projetos orientados a negócio, análise de dados, BI e storytelling executivo.',
  bio: [
    'Atuo na interseção entre dados, processos e tomada de decisão. Estruturo análises para transformar informação operacional e comercial em direcionamento executivo.',
    'Meu foco está em modelagem, SQL, dashboards, indicadores, diagnósticos de performance e produtos analíticos com aplicação prática.'
  ],
  contacts: {
    email: 'seuemail@exemplo.com',
    github: 'https://github.com/seuusuario',
    linkedin: 'https://linkedin.com/in/seuusuario',
    resume: 'Currículo disponível sob solicitação'
  }
}

export const locations = [
  {
    id: 'projects',
    label: 'Cidade de Dados',
    title: 'Projetos',
    subtitle: 'Casos aplicados e produtos analíticos',
    icon: '▦',
    x: 18,
    y: 18,
    depth: 1,
    accent: 'from-cyan-400/30 to-sky-400/10',
    building: 'data-city',
    description:
      'Conjunto de edifícios dedicado aos principais cases, com foco em problema de negócio, modelagem, análise e resultado.',
    bullets: [
      'Projeto completo de SQL com apresentação de insights',
      'Comparação de modelos de atribuição de marketing',
      'Painel orientado por pergunta de negócio',
      'Análise estatística de teste A/B',
      'Relatório setorial orientado por dados'
    ]
  },
  {
    id: 'about',
    label: 'Casa do Analista',
    title: 'Sobre Mim',
    subtitle: 'Perfil, trajetória e posicionamento',
    icon: '⌂',
    x: 7,
    y: 54,
    depth: 2,
    accent: 'from-emerald-400/25 to-teal-400/10',
    building: 'home-office',
    description:
      'Ambiente institucional para apresentar trajetória, diferenciais, contexto profissional e forma de trabalho.',
    bullets: profile.bio
  },
  {
    id: 'stack',
    label: 'Laboratório Tech',
    title: 'Linguagens e Ferramentas',
    subtitle: 'Stack técnica e instrumentação analítica',
    icon: '⚗',
    x: 38,
    y: 60,
    depth: 2,
    accent: 'from-violet-400/25 to-fuchsia-400/10',
    building: 'lab',
    description:
      'Espaço para apresentar ferramentas, linguagens, bancos e práticas usadas na construção dos projetos.',
    bullets: ['SQL', 'Python', 'Power BI', 'Excel', 'React', 'Node.js', 'MySQL']
  },
  {
    id: 'dashboards',
    label: 'Torre de Insights',
    title: 'Dashboards e Análises',
    subtitle: 'Visualização executiva e exploração orientada',
    icon: '▣',
    x: 55,
    y: 20,
    depth: 1,
    accent: 'from-amber-300/25 to-orange-300/10',
    building: 'tower',
    description:
      'Ambiente para visualizações analíticas, exploração de KPIs, storytelling e leitura executiva.',
    bullets: [
      'Dashboards orientados a decisão',
      'KPIs operacionais e comerciais',
      'Visualização por tendência, decomposição e causa',
      'Narrativa analítica para gestão'
    ]
  },
  {
    id: 'contact',
    label: 'Estação de Contato',
    title: 'Contato',
    subtitle: 'Canais institucionais e material profissional',
    icon: '◫',
    x: 76,
    y: 62,
    depth: 3,
    accent: 'from-rose-300/20 to-pink-300/10',
    building: 'station',
    description:
      'Canal de saída para networking, propostas, currículo e links institucionais.',
    bullets: [
      `GitHub: ${profile.contacts.github}`,
      `LinkedIn: ${profile.contacts.linkedin}`,
      `E-mail: ${profile.contacts.email}`,
      profile.contacts.resume
    ]
  }
]
