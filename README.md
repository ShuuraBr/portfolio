# Data City — Portfolio 3D v2.0

Portfólio interativo em 3D usando React + Vite + Three.js.

## Como rodar

```bash
npm install
npm run dev
```

Abra http://localhost:5173 no navegador.

## Como fazer build

```bash
npm run build
```

Os arquivos prontos ficam na pasta `dist/` — basta hospedar em qualquer servidor estático (Vercel, Netlify, GitHub Pages, etc.).

## Personalizar

### Seus dados (projetos, links, textos)
Edite `src/cityData.js` — altere `DISTRICTS` com seus projetos, links do LinkedIn/GitHub/currículo e descrições.

### Edifícios e cena 3D
Edite `src/sceneBuilder.js` — cada função `build*` constrói um distrito específico.

### UI (cores, topbar, painel)
Edite `src/styles.css` e `src/App.jsx`.

## Recursos

- **Ciclo dia/noite** sincronizado com o horário real do sistema
- **5 distritos** com arquitetura 3D única por tema
- **Texturas procedurais** em canvas: asfalto, calçada, grama, concreto, janelas
- **Vegetação**: árvores, arbustos, canteiros de flores
- **Fontes animadas** com spray e luz pontual
- **Postes de rua** com iluminação que acende à noite
- **Câmera orbital**: arrastar para girar, scroll para zoom, WASD para pan
- **Minimap** ao vivo com cone de visão
- **Painel lateral** com projetos e links

## Tecnologias

- React 18
- Three.js r165
- Vite 5
