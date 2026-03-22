import * as THREE from 'three'
import { DISTRICTS } from './cityData'

const PI = Math.PI

// ─── TEXTURE FACTORY ─────────────────────────────────────────────────────────
function mkTex(fn, rx = 1, ry = 1) {
  const t = new THREE.CanvasTexture(fn())
  t.wrapS = t.wrapT = THREE.RepeatWrapping
  t.repeat.set(rx, ry)
  return t
}

// Realistic building window facade texture
// Each window has: concrete surround, dark frame, glass pane with subtle glow
function makeFacadeTex({ winColor = '#88bbff', bg = '#0d1a2e', frameColor = '#08111e', rows = 10, cols = 5, litRatio = 0.55, nightColor = '#ffe8a0' } = {}) {
  const W = 512, H = 1024
  const c = document.createElement('canvas'); c.width = W; c.height = H
  const ctx = c.getContext('2d')

  // Base concrete
  ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H)

  // Concrete noise
  for (let i = 0; i < 2000; i++) {
    ctx.fillStyle = `rgba(200,210,230,${.008 + Math.random() * .012})`
    ctx.fillRect(Math.random() * W, Math.random() * H, Math.random() * 6, Math.random() * 4)
  }

  // Horizontal floor-separator bands
  const bh = H / rows
  for (let r = 0; r < rows; r++) {
    ctx.fillStyle = 'rgba(0,0,0,0.35)'
    ctx.fillRect(0, r * bh, W, 2)
  }

  // Windows
  const bw = W / cols
  for (let r = 0; r < rows; r++) {
    for (let col = 0; col < cols; col++) {
      const wx = col * bw + bw * .12
      const wy = r * bh + bh * .1
      const ww = bw * .76
      const wh = bh * .72

      // Window frame (dark recess)
      ctx.fillStyle = frameColor
      ctx.fillRect(wx - 2, wy - 2, ww + 4, wh + 4)

      const lit = Math.random() < litRatio
      const isNight = Math.random() < .3 && lit // warm night light
      if (lit) {
        const grd = ctx.createLinearGradient(wx, wy, wx, wy + wh)
        const base = isNight ? nightColor : winColor
        grd.addColorStop(0, base)
        grd.addColorStop(1, base + '88')
        ctx.fillStyle = grd
        ctx.globalAlpha = .55 + Math.random() * .4
        ctx.fillRect(wx, wy, ww, wh)

        // Window pane glint
        ctx.fillStyle = 'rgba(255,255,255,0.08)'
        ctx.fillRect(wx + 2, wy + 2, ww * .3, wh * .15)
        ctx.globalAlpha = 1
      } else {
        ctx.fillStyle = 'rgba(0,5,15,0.9)'
        ctx.fillRect(wx, wy, ww, wh)
      }

      // Vertical center mullion
      ctx.fillStyle = frameColor
      ctx.globalAlpha = .7
      ctx.fillRect(wx + ww / 2 - 1, wy, 2, wh)
      // Horizontal mid rail
      ctx.fillRect(wx, wy + wh / 2 - 1, ww, 2)
      ctx.globalAlpha = 1
    }
  }

  // Subtle vertical pilasters
  for (let col = 0; col <= cols; col++) {
    ctx.fillStyle = 'rgba(0,0,0,0.2)'
    ctx.fillRect(col * bw, 0, 3, H)
  }

  return c
}

// Rooftop texture — concrete with AC units, vents, gravel
function makeRooftopTex() {
  const c = document.createElement('canvas'); c.width = 256; c.height = 256
  const ctx = c.getContext('2d')
  ctx.fillStyle = '#0c1620'; ctx.fillRect(0, 0, 256, 256)
  // Gravel dots
  for (let i = 0; i < 1500; i++) {
    ctx.fillStyle = `rgba(${40 + Math.random() * 30},${50 + Math.random() * 30},${70 + Math.random() * 30},0.6)`
    const r = .5 + Math.random() * 1.5
    ctx.beginPath(); ctx.arc(Math.random() * 256, Math.random() * 256, r, 0, PI * 2); ctx.fill()
  }
  // Grid lines
  ctx.strokeStyle = 'rgba(0,0,0,0.4)'; ctx.lineWidth = 1
  for (let i = 0; i < 8; i++) {
    ctx.beginPath(); ctx.moveTo(i * 32, 0); ctx.lineTo(i * 32, 256); ctx.stroke()
    ctx.beginPath(); ctx.moveTo(0, i * 32); ctx.lineTo(256, i * 32); ctx.stroke()
  }
  return new THREE.CanvasTexture(c)
}

// Asphalt — dark with subtle noise
function makeAsphaltTex() {
  const c = document.createElement('canvas'); c.width = 512; c.height = 512
  const ctx = c.getContext('2d')
  ctx.fillStyle = '#0e1622'; ctx.fillRect(0, 0, 512, 512)
  for (let i = 0; i < 5000; i++) {
    ctx.fillStyle = `rgba(${50 + Math.random() * 30},${55 + Math.random() * 35},${75 + Math.random() * 30},${.03 + Math.random() * .04})`
    ctx.fillRect(Math.random() * 512, Math.random() * 512, 1 + Math.random() * 4, 1 + Math.random() * 2)
  }
  // Subtle wear lines
  for (let i = 0; i < 8; i++) {
    ctx.fillStyle = `rgba(80,90,110,${.02 + Math.random() * .03})`
    ctx.fillRect(Math.random() * 512, Math.random() * 512, 1, 40 + Math.random() * 80)
  }
  const t = new THREE.CanvasTexture(c)
  t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(6, 6)
  return t
}

// Sidewalk — light concrete slabs with gaps
function makeSidewalkTex() {
  const c = document.createElement('canvas'); c.width = 256; c.height = 256
  const ctx = c.getContext('2d')
  ctx.fillStyle = '#1e2d42'; ctx.fillRect(0, 0, 256, 256)
  // Tile grout
  ctx.strokeStyle = '#111e2e'; ctx.lineWidth = 2.5
  for (let i = 0; i <= 8; i++) { ctx.beginPath(); ctx.moveTo(i * 32, 0); ctx.lineTo(i * 32, 256); ctx.stroke() }
  for (let i = 0; i <= 8; i++) { ctx.beginPath(); ctx.moveTo(0, i * 32); ctx.lineTo(256, i * 32); ctx.stroke() }
  // Slight highlight on each tile
  for (let row = 0; row < 8; row++) for (let col = 0; col < 8; col++) {
    ctx.fillStyle = `rgba(255,255,255,${.012 + Math.random() * .015})`
    ctx.fillRect(col * 32 + 2, row * 32 + 2, 28, 28)
  }
  const t = new THREE.CanvasTexture(c)
  t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(5, 5)
  return t
}

// Grass with subtle variation
function makeGrassTex() {
  const c = document.createElement('canvas'); c.width = 256; c.height = 256
  const ctx = c.getContext('2d')
  ctx.fillStyle = '#0b1c0b'; ctx.fillRect(0, 0, 256, 256)
  for (let i = 0; i < 1200; i++) {
    const g = 30 + Math.random() * 60
    ctx.fillStyle = `rgba(${Math.random() * 15},${g},${Math.random() * 10},.55)`
    ctx.fillRect(Math.random() * 256, Math.random() * 256, 1 + Math.random() * 2, 3 + Math.random() * 5)
  }
  const t = new THREE.CanvasTexture(c)
  t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(8, 8)
  return t
}

// Concrete plaza
function makeConcreteTex() {
  const c = document.createElement('canvas'); c.width = 256; c.height = 256
  const ctx = c.getContext('2d')
  ctx.fillStyle = '#131e2e'; ctx.fillRect(0, 0, 256, 256)
  for (let i = 0; i < 1500; i++) {
    ctx.fillStyle = `rgba(100,120,155,${.015 + Math.random() * .02})`
    ctx.fillRect(Math.random() * 256, Math.random() * 256, Math.random() * 5, Math.random() * 4)
  }
  ctx.strokeStyle = 'rgba(0,0,0,0.25)'; ctx.lineWidth = 1
  for (let i = 0; i <= 8; i++) { ctx.beginPath(); ctx.moveTo(i * 32, 0); ctx.lineTo(i * 32, 256); ctx.stroke() }
  for (let i = 0; i <= 8; i++) { ctx.beginPath(); ctx.moveTo(0, i * 32); ctx.lineTo(256, i * 32); ctx.stroke() }
  const t = new THREE.CanvasTexture(c)
  t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(4, 4)
  return t
}

export function buildTextures() {
  const TEX = {}
  TEX.asphalt  = makeAsphaltTex()
  TEX.sidewalk = makeSidewalkTex()
  TEX.grass    = makeGrassTex()
  TEX.concrete = makeConcreteTex()
  TEX.rooftop  = makeRooftopTex()

  // Per-district facade textures
  const configs = {
    bBlue:   { winColor: '#88bbff', nightColor: '#ffe4a0', bg: '#0b1830', rows: 12, cols: 5 },
    bGreen:  { winColor: '#88ffcc', nightColor: '#ffeeaa', bg: '#0a1a10', rows: 10, cols: 4 },
    bPurple: { winColor: '#cc99ff', nightColor: '#ffbb88', bg: '#110824', rows: 11, cols: 5 },
    bYellow: { winColor: '#ffe090', nightColor: '#ff9944', bg: '#181200', rows: 12, cols: 4 },
    bRed:    { winColor: '#ffaaaa', nightColor: '#ff7744', bg: '#1e0808', rows: 10, cols: 4 },
    bGray:   { winColor: '#aac0d8', nightColor: '#ffe8aa', bg: '#0f1620', rows: 11, cols: 5 },
  }
  for (const [key, cfg] of Object.entries(configs)) {
    const c = makeFacadeTex(cfg)
    TEX[key] = new THREE.CanvasTexture(c)
    // Side version — fewer columns
    const cs = makeFacadeTex({ ...cfg, cols: 3 })
    TEX[key + 'S'] = new THREE.CanvasTexture(cs)
  }

  return TEX
}

// ─── PRIMITIVES ───────────────────────────────────────────────────────────────
export function box(w, h, d, col, emi, ei, tex) {
  const mat = new THREE.MeshStandardMaterial({ color: new THREE.Color(col), roughness: .65, metalness: .2 })
  if (emi) { mat.emissive = new THREE.Color(emi); mat.emissiveIntensity = ei || 0 }
  if (tex) { mat.map = tex; mat.roughness = .75 }
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat)
  m.castShadow = true; m.receiveShadow = true; return m
}

// Building mesh with per-face materials: front/back use facade tex, sides use side tex, top uses rooftop
function bldMesh(w, h, d, { frontTex, sideTex, topTex, col = 0x0e1a2e, emi, ei = 0 } = {}) {
  const make = (tex) => {
    const m = new THREE.MeshStandardMaterial({ color: new THREE.Color(col), roughness: .7, metalness: .15 })
    if (tex) m.map = tex
    if (emi) { m.emissive = new THREE.Color(emi); m.emissiveIntensity = ei }
    return m
  }
  const topMat = new THREE.MeshStandardMaterial({ color: 0x0a1420, map: topTex, roughness: .9 })
  const botMat = new THREE.MeshStandardMaterial({ color: 0x060c18, roughness: 1 })
  // BoxGeometry face order: +X, -X, +Y, -Y, +Z, -Z
  const mats = [make(sideTex), make(sideTex), topMat, botMat, make(frontTex), make(frontTex)]
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mats)
  mesh.castShadow = true; mesh.receiveShadow = true; return mesh
}

export function cyl(rt, rb, h, seg, col, emi, ei) {
  const mat = new THREE.MeshStandardMaterial({ color: new THREE.Color(col), roughness: .35, metalness: .65 })
  if (emi) { mat.emissive = new THREE.Color(emi); mat.emissiveIntensity = ei || 0 }
  const m = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg), mat)
  m.castShadow = true; m.receiveShadow = true; return m
}

export function pln(w, h, col, tex) {
  const mat = new THREE.MeshStandardMaterial({ color: new THREE.Color(col), roughness: .9 })
  if (tex) mat.map = tex
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat); m.receiveShadow = true; return m
}

export function lbl(text, color, size) {
  const c = document.createElement('canvas'); c.width = 512; c.height = 96
  const ctx = c.getContext('2d'); ctx.clearRect(0, 0, 512, 96)
  ctx.font = `bold ${Math.round((size || .9) * 36)}px Arial Black,sans-serif`
  ctx.fillStyle = color || '#fff'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
  ctx.shadowColor = color; ctx.shadowBlur = 16; ctx.fillText(text, 256, 48)
  const m = new THREE.Mesh(new THREE.PlaneGeometry(7, 1.3),
    new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(c), transparent: true, depthWrite: false, side: THREE.DoubleSide }))
  return m
}

export function wMat(col, ei, windowMaterials) {
  const m = new THREE.MeshStandardMaterial({ color: new THREE.Color(col), emissive: new THREE.Color(col), emissiveIntensity: ei })
  windowMaterials.push(m); return m
}

// ─── STREET LAMP ─────────────────────────────────────────────────────────────
export function makeLamp(x, z, lampLights) {
  const g = new THREE.Group()
  const postMat = new THREE.MeshStandardMaterial({ color: 0x2a3a50, metalness: .8, roughness: .4 })
  const post = new THREE.Mesh(new THREE.CylinderGeometry(.055, .10, 5.8, 10), postMat); post.position.y = 2.9; post.castShadow = true; g.add(post)
  const arm = new THREE.Mesh(new THREE.CylinderGeometry(.038, .038, 1.6, 8), postMat)
  arm.rotation.z = PI / 2; arm.position.set(.8, 5.5, 0); g.add(arm)
  const hood = new THREE.Mesh(new THREE.CylinderGeometry(.24, .32, .35, 10), new THREE.MeshStandardMaterial({ color: 0x1a2840, metalness: .9, roughness: .2 }))
  hood.position.set(1.6, 5.35, 0); g.add(hood)
  const bulb = new THREE.Mesh(new THREE.SphereGeometry(.13, 10, 8), new THREE.MeshStandardMaterial({ color: 0xfff8e0, emissive: 0xffe090, emissiveIntensity: 5 }))
  bulb.position.set(1.6, 5.18, 0); g.add(bulb)
  const pl = new THREE.PointLight(0xffe8a0, 1.6, 16); pl.position.set(1.6, 5.0, 0); g.add(pl)
  lampLights.push(pl)
  g.position.set(x, 0, z); return g
}

// ─── TREE ────────────────────────────────────────────────────────────────────
export function makeTree(x, z, s = 1, v = 0) {
  const g = new THREE.Group()
  const tk = cyl(.07, .13, 1.4 * s, 7, 0x3b1e08); tk.position.y = .7 * s; g.add(tk)
  if (v === 0) {
    ;[[1.1, 2.5, 0x0d3010], [.82, 1.9, 0x0b2a0e], [.52, 1.35, 0x0e3814]].forEach(([r, h, col], i) => {
      const f = new THREE.Mesh(new THREE.ConeGeometry(r * s, h * s, 8), new THREE.MeshStandardMaterial({ color: col, roughness: .9 }))
      f.position.y = (1.3 + h * .4 + i * 1.1) * s; f.castShadow = true; g.add(f)
    })
  } else {
    const fo = new THREE.Mesh(new THREE.SphereGeometry(.95 * s, 8, 6), new THREE.MeshStandardMaterial({ color: 0x0c2c0c, roughness: .88 }))
    fo.position.y = (1.3 + .95) * s; fo.castShadow = true; g.add(fo)
    const ft = new THREE.Mesh(new THREE.SphereGeometry(.65 * s, 7, 5), new THREE.MeshStandardMaterial({ color: 0x0f3816, roughness: .9 }))
    ft.position.y = (1.3 + 1.7) * s; g.add(ft)
  }
  g.position.set(x, 0, z); return g
}

export function makeBush(x, z, s = .8) {
  const g = new THREE.Group()
  ;[[0, 0, 0, .55], [-.3, -.1, .2, .4], [.35, -.05, -.2, .38], [0, .2, 0, .35]].forEach(([dx, dy, dz, r]) => {
    const m = new THREE.Mesh(new THREE.SphereGeometry(r * s, 7, 5), new THREE.MeshStandardMaterial({ color: 0x0a2808, roughness: .95 }))
    m.position.set(dx * s, (dy + .3) * s, dz * s); m.castShadow = true; g.add(m)
  })
  g.position.set(x, 0, z); return g
}

// ─── FOUNTAIN ────────────────────────────────────────────────────────────────
export function makeFountain(x, z, lampLights) {
  const g = new THREE.Group()
  const stoneMat = new THREE.MeshStandardMaterial({ color: 0x1a2a38, roughness: .7, metalness: .2 })
  const basin = new THREE.Mesh(new THREE.CylinderGeometry(3.2, 3.7, .6, 28), stoneMat); basin.position.y = .3; basin.castShadow = true; g.add(basin)
  const rim = new THREE.Mesh(new THREE.TorusGeometry(3.2, .12, 8, 40), stoneMat); rim.rotation.x = PI / 2; rim.position.y = .62; g.add(rim)
  const water = new THREE.Mesh(new THREE.CircleGeometry(2.95, 36),
    new THREE.MeshStandardMaterial({ color: 0x1a4875, emissive: 0x0a2845, emissiveIntensity: .4, transparent: true, opacity: .9, metalness: .4, roughness: .05 }))
  water.rotation.x = -PI / 2; water.position.y = .62; water.userData.water = true; g.add(water)
  const col = cyl(.17, .22, 1.3, 12, 0x223344); col.position.y = 1.25; g.add(col)
  const top = new THREE.Mesh(new THREE.SphereGeometry(.38, 12, 8), new THREE.MeshStandardMaterial({ color: 0x1a3050, roughness: .35, metalness: .6 }))
  top.position.y = 2.0; g.add(top)
  for (let i = 0; i < 12; i++) {
    const a = i / 12 * PI * 2
    const d = new THREE.Mesh(new THREE.SphereGeometry(.07, 5, 5),
      new THREE.MeshStandardMaterial({ color: 0x5aaddd, emissive: 0x2277aa, emissiveIntensity: .55, transparent: true, opacity: .78 }))
    d.position.set(Math.cos(a) * .5, 2.1, Math.sin(a) * .5); d.userData.spray = true; d.userData.ang = a; d.userData.phase = i * .52; g.add(d)
  }
  const pl = new THREE.PointLight(0x3399cc, .8, 8); pl.position.y = .8; g.add(pl); lampLights.push(pl)
  // Decorative rim posts
  for (let i = 0; i < 16; i++) {
    const a = i / 16 * PI * 2
    const post = cyl(.055, .055, .45, 6, 0x1a2a38); post.position.set(Math.cos(a) * 3.2, .75, Math.sin(a) * 3.2); g.add(post)
  }
  g.position.set(x, 0, z); return g
}

// ─── ROADS — CORRECTED ────────────────────────────────────────────────────────
// Two explicit functions: NS (length along Z) and EW (length along X)
// No compound rotations — just rotation.x = -PI/2 for both
export function buildRoads(scene, TEX) {
  const asf = new THREE.MeshStandardMaterial({ color: 0x0e1622, map: TEX.asphalt, roughness: .93, metalness: .0 })
  const dashMat = new THREE.MeshStandardMaterial({ color: 0xffd166, emissive: 0xffd166, emissiveIntensity: .3 })
  const edgeMat = new THREE.MeshStandardMaterial({ color: 0xd0d8e8, emissive: 0x808898, emissiveIntensity: .08 })
  const crossMat = new THREE.MeshStandardMaterial({ color: 0xe0e8f0, emissive: 0x888898, emissiveIntensity: .06 })

  // North-South road: width=roadW along X, length=roadL along Z, centered at (cx, cz)
  function roadNS(cx, cz, roadL, roadW = 7) {
    const r = new THREE.Mesh(new THREE.PlaneGeometry(roadW, roadL), asf)
    r.rotation.x = -PI / 2; r.position.set(cx, .018, cz); r.receiveShadow = true; scene.add(r)
    // Center dashes along Z axis
    const n = Math.floor(roadL / 5)
    for (let i = 0; i < n; i++) {
      const d = new THREE.Mesh(new THREE.PlaneGeometry(.14, 2.2), dashMat)
      d.rotation.x = -PI / 2; d.position.set(cx, .032, cz - roadL / 2 + i * (roadL / n) + roadL / n / 2); scene.add(d)
    }
    // Edge lines
    for (const s of [-1, 1]) {
      const e = new THREE.Mesh(new THREE.PlaneGeometry(.18, roadL), edgeMat)
      e.rotation.x = -PI / 2; e.position.set(cx + s * (roadW / 2 - .12), .034, cz); scene.add(e)
    }
  }

  // East-West road: length=roadL along X, width=roadW along Z, centered at (cx, cz)
  function roadEW(cx, cz, roadL, roadW = 7) {
    const r = new THREE.Mesh(new THREE.PlaneGeometry(roadL, roadW), asf)
    r.rotation.x = -PI / 2; r.position.set(cx, .018, cz); r.receiveShadow = true; scene.add(r)
    // Center dashes along X axis
    const n = Math.floor(roadL / 5)
    for (let i = 0; i < n; i++) {
      const d = new THREE.Mesh(new THREE.PlaneGeometry(2.2, .14), dashMat)
      d.rotation.x = -PI / 2; d.position.set(cx - roadL / 2 + i * (roadL / n) + roadL / n / 2, .032, cz); scene.add(d)
    }
    // Edge lines
    for (const s of [-1, 1]) {
      const e = new THREE.Mesh(new THREE.PlaneGeometry(roadL, .18), edgeMat)
      e.rotation.x = -PI / 2; e.position.set(cx, .034, cz + s * (roadW / 2 - .12)); scene.add(e)
    }
  }

  // Intersection square
  function intersection(cx, cz, size = 7) {
    const r = new THREE.Mesh(new THREE.PlaneGeometry(size, size), asf)
    r.rotation.x = -PI / 2; r.position.set(cx, .019, cz); scene.add(r)
    // Zebra crossing on each side
    for (let side = 0; side < 4; side++) {
      const angle = side * PI / 2
      for (let strip = 0; strip < 4; strip++) {
        const sw = .7, slen = 2
        const off = -1.5 + strip * .85
        const dist = size / 2 + 1
        const zc = new THREE.Mesh(new THREE.PlaneGeometry(sw, slen), crossMat)
        zc.rotation.x = -PI / 2; zc.rotation.z = angle
        const rx = Math.cos(angle) * off + Math.sin(angle) * -dist
        const rz = -Math.sin(angle) * off + Math.cos(angle) * -dist
        zc.position.set(cx + rx, .035, cz + rz); scene.add(zc)
      }
    }
  }

  // ── Main arteries
  roadNS(0, -20, 120)          // Main N-S spine (center)
  roadEW(0, 0, 130)            // Main E-W spine (center)

  // ── District connection roads
  roadNS(-28, -16, 30)         // Road to Sobre (west branch)
  roadNS(28, -16, 30)          // Road to Laboratorio (east branch)
  roadEW(-14, -22, 28)         // W cross-connector at Sobre latitude
  roadEW(14, -22, 28)          // E cross-connector
  roadNS(0, -44, 22)           // North spur to Dashboards
  roadNS(0, 20, 16)            // South spur to Contato

  // ── Secondary streets
  roadEW(-14, 5, 38)           // W secondary E-W
  roadEW(14, 5, 38)            // E secondary E-W
  roadEW(0, -33, 50)           // Mid cross street (Dashboards latitude)
  roadNS(-14, -28, 22)         // Inner W N-S
  roadNS(14, -28, 22)          // Inner E N-S

  // ── Intersections (cover the asphalt gap at junctions)
  intersection(0, 0)
  intersection(0, -22)
  intersection(-28, -22, 6)
  intersection(28, -22, 6)
  intersection(0, -44, 6)
  intersection(0, 14, 6)
  intersection(-14, 0, 6)
  intersection(14, 0, 6)
  intersection(-14, -33, 6)
  intersection(14, -33, 6)
}

export function buildGround(scene, TEX) {
  // Base ground
  const g = pln(500, 500, 0x080f18); g.rotation.x = -PI / 2; g.receiveShadow = true; scene.add(g)

  // Park patches with grass texture
  const parkMat = new THREE.MeshStandardMaterial({ color: 0x071207, map: TEX.grass, roughness: .97 })
  ;[
    [-14, -11, 10, 9], [14, -11, 10, 9],
    [-14, 5, 10, 8],  [14, 5, 10, 8],
    [0, -33, 22, 10], [0, 16, 22, 8],
    [-14, -33, 10, 7], [14, -33, 10, 7],
  ].forEach(([x, z, w, d]) => {
    const p = new THREE.Mesh(new THREE.PlaneGeometry(w, d), parkMat)
    p.rotation.x = -PI / 2; p.position.set(x, .012, z); p.receiveShadow = true; scene.add(p)
  })
}

export function buildSidewalks(scene, TEX) {
  const swMat = new THREE.MeshStandardMaterial({ color: 0x14202e, map: TEX.sidewalk, roughness: .88 })

  // NS sidewalk: alongside a NS road
  function swNS(cx, cz, len, roadW = 7) {
    for (const s of [-1, 1]) {
      const sw = new THREE.Mesh(new THREE.PlaneGeometry(2.5, len), swMat)
      sw.rotation.x = -PI / 2; sw.position.set(cx + s * (roadW / 2 + 1.3), .045, cz); sw.receiveShadow = true; scene.add(sw)
      // Curb
      const curb = box(2.5, .1, len, 0x0e1a24); curb.position.set(cx + s * (roadW / 2 + 1.3), .05, cz); scene.add(curb)
    }
  }
  function swEW(cx, cz, len, roadW = 7) {
    for (const s of [-1, 1]) {
      const sw = new THREE.Mesh(new THREE.PlaneGeometry(len, 2.5), swMat)
      sw.rotation.x = -PI / 2; sw.position.set(cx, .045, cz + s * (roadW / 2 + 1.3)); sw.receiveShadow = true; scene.add(sw)
      const curb = box(len, .1, 2.5, 0x0e1a24); curb.position.set(cx, .05, cz + s * (roadW / 2 + 1.3)); scene.add(curb)
    }
  }

  swNS(0, -20, 120)
  swEW(0, 0, 130)
  swNS(0, -44, 22)
  swNS(0, 20, 16)
}

export function buildLamps(scene, lampLights) {
  ;[
    // Along main N-S road
    [-5, -5], [5, -5], [-5, -14], [5, -14], [-5, -24], [5, -24],
    [-5, -34], [5, -34], [-5, -44], [5, -44],
    // Along main E-W road
    [-12, 5], [12, 5], [-22, 5], [22, 5], [-34, 5], [34, 5],
    [-12, -5], [12, -5], [-22, -5], [22, -5],
    // Branch roads
    [-28, -10], [-28, -18], [-28, -26], [28, -10], [28, -18], [28, -26],
    [-5, 10], [5, 10], [-5, 18], [5, 18],
    [-14, -28], [14, -28], [-14, -38], [14, -38],
  ].forEach(([x, z]) => scene.add(makeLamp(x, z, lampLights)))
}

export function buildFountains(scene, lampLights) {
  scene.add(makeFountain(0, 11, lampLights))
  scene.add(makeFountain(-28, 2, lampLights))
  scene.add(makeFountain(28, 2, lampLights))
}

// ─── BACKGROUND SKYLINE ───────────────────────────────────────────────────────
export function buildBackground(scene) {
  // Dense outer city ring — buildings at distance 65-130
  const bgConfigs = [
    // [x, z, w, h, d, hue]
    [-75, -20, 8, 28, 7, 0], [-80, -35, 6, 22, 6, 1], [-70, -50, 9, 35, 7, 0],
    [-85, -5, 7, 18, 6, 2], [-90, 10, 5, 25, 5, 1], [-78, 25, 8, 20, 7, 0],
    [-65, 35, 7, 16, 6, 2], [-88, -52, 6, 30, 6, 1], [-70, -68, 8, 22, 7, 0],
    [-55, -75, 10, 28, 8, 2], [-35, -72, 7, 20, 6, 1],

    [75, -20, 8, 26, 7, 1], [80, -38, 6, 32, 6, 0], [72, -55, 9, 18, 7, 2],
    [88, -8, 7, 24, 6, 1], [90, 12, 5, 20, 5, 0], [78, 28, 8, 15, 7, 2],
    [68, 38, 7, 22, 6, 1], [86, -58, 6, 28, 6, 0], [72, -72, 8, 18, 7, 2],
    [58, -78, 10, 32, 8, 1], [38, -76, 7, 24, 6, 0],

    [-15, -75, 8, 30, 7, 2], [0, -78, 10, 42, 8, 0], [15, -75, 8, 28, 7, 1],
    [-30, -70, 7, 22, 6, 2], [30, -70, 7, 18, 6, 1],
    [-10, -85, 6, 35, 6, 0], [10, -85, 7, 40, 6, 2],
    [-25, -88, 6, 18, 5, 1], [25, -88, 5, 22, 5, 0],

    [-20, 60, 8, 18, 7, 0], [0, 65, 9, 22, 8, 2], [20, 60, 7, 16, 6, 1],
    [-38, 55, 6, 14, 6, 0], [38, 55, 7, 18, 6, 2],
    [-55, 45, 7, 20, 6, 1], [55, 45, 8, 24, 7, 0],

    // Very far horizon layer
    [-110, -30, 12, 50, 10, 0], [-120, -60, 10, 38, 9, 1], [-100, -85, 11, 60, 9, 2],
    [-130, 0, 9, 32, 8, 0], [-115, 40, 10, 28, 8, 1],
    [110, -30, 12, 45, 10, 2], [120, -65, 10, 55, 9, 0], [100, -88, 11, 40, 9, 1],
    [130, 5, 9, 35, 8, 2], [115, 42, 10, 30, 8, 0],
    [0, -110, 14, 65, 11, 1], [-40, -108, 11, 48, 9, 2], [40, -108, 11, 52, 9, 0],
    [-80, -105, 10, 38, 9, 1], [80, -105, 10, 42, 9, 2],
  ]

  const hues = [
    { wall: 0x0c1628, win: 0x3366aa, ei: .08 },
    { wall: 0x0e1420, win: 0x224466, ei: .06 },
    { wall: 0x100e20, win: 0x442266, ei: .07 },
  ]

  bgConfigs.forEach(([x, z, w, h, d, hueIdx]) => {
    const { wall, win, ei } = hues[hueIdx]
    const bm = new THREE.MeshStandardMaterial({ color: wall, roughness: .85, metalness: .1 })
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), bm)
    mesh.position.set(x, h / 2, z); mesh.castShadow = false; mesh.receiveShadow = false; scene.add(mesh)

    // Roof ledge
    const rf = new THREE.Mesh(new THREE.BoxGeometry(w + .3, .25, d + .3),
      new THREE.MeshStandardMaterial({ color: 0x0a1220, roughness: .9 }))
    rf.position.set(x, h + .13, z); scene.add(rf)

    // Random antenna
    if (Math.random() > .55) {
      const ant = cyl(.03, .03, 3 + Math.random() * 5, 4, win, win, .4)
      ant.position.set(x + (Math.random() - .5) * w * .3, h + 2 + Math.random() * 2, z + (Math.random() - .5) * d * .3)
      scene.add(ant)
    }

    // Window rows
    const nFloors = Math.max(2, Math.floor(h / 3.5))
    for (let f = 0; f < nFloors; f++) {
      for (let c = 0; c < 3; c++) {
        if (Math.random() > .55) {
          const wn = new THREE.Mesh(new THREE.PlaneGeometry(.7, .5),
            new THREE.MeshStandardMaterial({ color: win, emissive: new THREE.Color(win), emissiveIntensity: .15 + Math.random() * ei }))
          wn.position.set(x - w * .3 + c * w * .3, 1.5 + f * 3, z - d / 2 - .01); scene.add(wn)
        }
      }
    }
  })

  // Mountain/hill silhouette in the far distance
  const mountainDefs = [
    [-180, -150, 200, 55, 60], [-60, -170, 140, 70, 50], [80, -160, 180, 48, 55],
    [200, -140, 160, 62, 50], [-200, -130, 120, 40, 45],
    [-140, 80, 100, 32, 40], [140, 90, 120, 38, 45], [0, 130, 150, 45, 50],
  ]
  const mtMat = new THREE.MeshStandardMaterial({ color: 0x060c18, roughness: 1, metalness: 0 })
  mountainDefs.forEach(([x, z, w, h, d]) => {
    // Main peak
    const peak = new THREE.Mesh(new THREE.CylinderGeometry(0, w / 2, h, 5), mtMat)
    peak.position.set(x, h / 2 - 1, z); scene.add(peak)
    // Flanking sub-peaks
    ;[[-w * .45, 0, .65], [w * .42, 0, .72]].forEach(([dx, , s]) => {
      const sp = new THREE.Mesh(new THREE.CylinderGeometry(0, (w / 2) * s, h * s, 5), mtMat)
      sp.position.set(x + dx, (h * s) / 2 - 2, z); scene.add(sp)
    })
  })
}

export function buildStars(scene) {
  // Two layers: far diffuse field + bright close stars
  const geoFar = new THREE.BufferGeometry(); const posFar = []
  for (let i = 0; i < 3500; i++) {
    const t = Math.random() * PI * 2, p = Math.random() * PI * .5, r = 200 + Math.random() * 80
    posFar.push(Math.cos(t) * Math.sin(p) * r, Math.cos(p) * r * .45 + 35, Math.sin(t) * Math.sin(p) * r)
  }
  geoFar.setAttribute('position', new THREE.Float32BufferAttribute(posFar, 3))
  const starsFar = new THREE.Points(geoFar, new THREE.PointsMaterial({ color: 0xaabbff, size: .22, sizeAttenuation: true, transparent: true, opacity: .75 }))
  starsFar.userData.starField = true; scene.add(starsFar)

  // Brighter close stars
  const geoNear = new THREE.BufferGeometry(); const posNear = []
  for (let i = 0; i < 400; i++) {
    const t = Math.random() * PI * 2, p = .05 + Math.random() * PI * .38, r = 180 + Math.random() * 40
    posNear.push(Math.cos(t) * Math.sin(p) * r, Math.cos(p) * r * .5 + 40, Math.sin(t) * Math.sin(p) * r)
  }
  geoNear.setAttribute('position', new THREE.Float32BufferAttribute(posNear, 3))
  const starsNear = new THREE.Points(geoNear, new THREE.PointsMaterial({ color: 0xffffff, size: .45, sizeAttenuation: true, transparent: true, opacity: .9 }))
  starsNear.userData.starField = true; scene.add(starsNear)
}

// ─── DISTRICTS ────────────────────────────────────────────────────────────────
export function buildProjetos(scene, buildings, TEX, windowMaterials) {
  const D = DISTRICTS.projetos; const g = new THREE.Group(); g.position.set(D.pos.x, 0, D.pos.z)

  // Main skyscraper — multi-face textured
  const sk = bldMesh(6, 24, 6, { frontTex: TEX.bBlue, sideTex: TEX.bBlueSS, topTex: TEX.rooftop, col: 0x0e1a30, emi: 0x4f8cff, ei: .04 })
  sk.position.set(-8, 12, -4); g.add(sk)
  const sk2 = bldMesh(4, 8, 4, { frontTex: TEX.bBlue, sideTex: TEX.bBlueSS, topTex: TEX.rooftop, col: 0x102040, emi: 0x4f8cff, ei: .08 })
  sk2.position.set(-8, 28, -4); g.add(sk2)
  const rfledge = box(6.6, .45, 6.6, 0x1a2a4a); rfledge.position.set(-8, 24.25, -4); g.add(rfledge)
  // Glass crown strips
  for (let i = 0; i < 3; i++) {
    const s = box(6.1, .15, 6.1, 0x4f8cff, 0x4f8cff, .5); s.position.set(-8, 4 + i * 8, -4); g.add(s)
  }
  const ant = cyl(.05, .05, 5.5, 6, 0x4f8cff, 0x4f8cff, 2); ant.position.set(-8, 37.5, -4); g.add(ant)
  const ball = new THREE.Mesh(new THREE.SphereGeometry(.3, 9, 8),
    new THREE.MeshStandardMaterial({ color: 0x4f8cff, emissive: 0x4f8cff, emissiveIntensity: 6 }))
  ball.position.set(-8, 40.4, -4); ball.userData.blink = true; g.add(ball)

  // Server building
  const srv = bldMesh(5, 13, 5, { frontTex: TEX.bBlue, sideTex: TEX.bBlueSS, topTex: TEX.rooftop, col: 0x0f1c34, emi: 0x00e5ff, ei: .06 })
  srv.position.set(3, 6.5, -6); g.add(srv)
  for (let r = 0; r < 6; r++) { const rack = box(4, .28, .18, 0x00e5ff, 0x00e5ff, 1.8); rack.position.set(3, 1 + r * 2, -3.6); g.add(rack) }

  // AC units
  ;[[1.4, 13.3, -5.3], [2.6, 13.3, -6], [3.8, 13.3, -5], [4.4, 13.3, -7]].forEach(([x, y, z]) => {
    const ac = box(.9, .65, .75, 0x1a2840); ac.position.set(x, y, z); g.add(ac)
    const fn = cyl(.25, .25, .09, 8, 0x223444); fn.rotation.x = PI / 2; fn.position.set(x, y + .09, z - .38); g.add(fn)
  })

  // Analytics building with bar chart
  const an = bldMesh(5, 9, 4, { frontTex: TEX.bBlue, sideTex: TEX.bBlueSS, topTex: TEX.rooftop, col: 0x0f1f38, emi: 0x4f8cff, ei: .04 })
  an.position.set(7, 4.5, 1); g.add(an)
  ;[.5, .85, .6, 1.0, .72].forEach((h, i) => {
    const bar = box(.5, h * 3.5, .12, 0x4f8cff, 0x4f8cff, 1.5); bar.position.set(4.82 + i * .75, h * 1.75 + 1, 3.02); g.add(bar)
  })

  // Supporting buildings
  ;[[-4, 3.5, -2, 3, 2], [8, 5, 7, 3.5, 3], [-6, 4, 5, 3.5, 2.5], [0, 2, -2, 4, 2],
    [-10, 2.5, 2, 2.5, 2], [-2, 6, -8, 4, 3], [5, 3.5, -3, 3, 3], [-7, 5, -7, 3, 3]].forEach(([x, h, z, w, d]) => {
    const b = bldMesh(w, h, d, { frontTex: TEX.bBlue, sideTex: TEX.bBlueSS, topTex: TEX.rooftop, col: 0x0f1a30, emi: 0x4f8cff, ei: .03 })
    b.position.set(x, h / 2, z); g.add(b)
    const rl = box(w + .3, .14, d + .3, 0x1a2a44); rl.position.set(x, h + .07, z); g.add(rl)
  })

  const plz = pln(22, 22, 0x0e1828, TEX.concrete); plz.rotation.x = -PI / 2; plz.position.y = .07; g.add(plz)
  const lb1 = lbl('CIDADE DE DADOS', '#4f8cff', 1.0); lb1.position.set(-2, 43, -4); g.add(lb1)
  const lb2 = lbl('Projetos', '#88bbff', .65); lb2.position.set(-2, 41.5, -4); g.add(lb2)
  const ring = new THREE.Mesh(new THREE.RingGeometry(11, 11.6, 64),
    new THREE.MeshBasicMaterial({ color: 0x4f8cff, side: THREE.DoubleSide, transparent: true, opacity: .18 }))
  ring.rotation.x = -PI / 2; ring.position.y = .04; g.add(ring)
  g.userData = { districtId: 'projetos', name: 'Cidade de Dados', desc: D.desc }
  scene.add(g); buildings.push(g); D._group = g
}

export function buildSobre(scene, buildings, TEX, windowMaterials, lampLights) {
  const D = DISTRICTS.sobre; const g = new THREE.Group(); g.position.set(D.pos.x, 0, D.pos.z)

  // Main house body — multi-face
  const body = bldMesh(11, 5.5, 8, { frontTex: TEX.bGreen, sideTex: TEX.bGreenS, topTex: TEX.rooftop, col: 0x0c1a0c, emi: 0x06ffa5, ei: .03 })
  body.position.set(0, 2.75, 0); g.add(body)
  // Brick course lines
  for (let i = 0; i < 5; i++) { const s = box(11.1, .09, 8.1, 0x091408); s.position.set(0, .82 + i * 1.07, 0); g.add(s) }

  // Pitched roof
  const roof = new THREE.Mesh(new THREE.CylinderGeometry(0, 8.8, 4.2, 4),
    new THREE.MeshStandardMaterial({ color: 0x0a1a0a, roughness: .87 }))
  roof.rotation.y = PI / 4; roof.position.set(0, 7.6, 0); roof.castShadow = true; g.add(roof)
  const ridge = box(10.2, .18, .18, 0x0d1e0d); ridge.position.set(0, 9.75, 0); g.add(ridge)

  // Chimney
  const ch = box(.92, 2.9, .92, 0x1a2a12); ch.position.set(2.9, 8.35, 1.2); g.add(ch)
  for (let i = 0; i < 3; i++) {
    const sm = new THREE.Mesh(new THREE.SphereGeometry(.34 + i * .08, 7, 6),
      new THREE.MeshStandardMaterial({ color: 0x445544, transparent: true, opacity: .25 }))
    sm.position.set(2.9, 11.6 + i * .6, 1.2); sm.userData.smoke = true; sm.userData.phase = i * 1.3; sm.userData.startY = 11.6 + i * .6; g.add(sm)
  }

  // Windows with frame + glass
  ;[[-3.2, 3.5, -4.03], [3.2, 3.5, -4.03], [-3.2, 3.5, 4.03], [3.2, 3.5, 4.03]].forEach(([x, y, z]) => {
    const fr = box(2.2, 1.8, .12, 0x192a12); fr.position.set(x, y, z + (z < 0 ? -.01 : .01)); if (z > 0) fr.rotation.y = PI; g.add(fr)
    const wn = new THREE.Mesh(new THREE.PlaneGeometry(1.65, 1.3), wMat('#b8ffde', 1.5 + Math.random() * .4, windowMaterials))
    wn.position.set(x, y, z + (z < 0 ? .01 : -.01)); if (z > 0) wn.rotation.y = PI; g.add(wn)
    // Muntin bars
    const mh = box(.06, 1.3, .04, 0x192a12); mh.position.set(x, y, z + (z < 0 ? .03 : -.03)); g.add(mh)
    const mv = box(1.65, .06, .04, 0x192a12); mv.position.set(x, y, z + (z < 0 ? .03 : -.03)); g.add(mv)
  })

  // Front door
  const door = box(1.45, 2.65, .09, 0x1a3a12, 0x06ffa5, .08); door.position.set(0, 1.33, -4.05); g.add(door)
  const dfr = box(1.85, 2.95, .07, 0x2a4a1a); dfr.position.set(0, 1.48, -4.07); g.add(dfr)
  const knob = new THREE.Mesh(new THREE.SphereGeometry(.1, 8, 8),
    new THREE.MeshStandardMaterial({ color: 0xffd166, emissive: 0xffd166, emissiveIntensity: .6, metalness: .95 }))
  knob.position.set(.58, 1.33, -4.18); g.add(knob)
  for (let i = 0; i < 3; i++) { const s = box(2.9 - i * .45, .18, .65, 0x182816); s.position.set(0, i * .22, -4.6 - i * .28); g.add(s) }

  // Office wing
  const wing = bldMesh(8, 4.5, 6, { frontTex: TEX.bGreen, sideTex: TEX.bGreenS, topTex: TEX.rooftop, col: 0x0c1a0c, emi: 0x06ffa5, ei: .02 })
  wing.position.set(9.5, 2.25, 0); g.add(wing)
  const wRf = box(8.4, .3, 6.4, 0x0d1a0d); wRf.position.set(9.5, 4.65, 0); g.add(wRf)
  const gd = box(4.2, 3.1, .09, 0x224422, 0x06ffa5, .12); gd.position.set(9.5, 1.55, -3.05); g.add(gd)
  for (let s = 0; s < 6; s++) { const sl = box(4.1, .09, .07, 0x3a6a3a); sl.position.set(9.5, .4 + s * .52, -3.06); g.add(sl) }

  // Garden fence + lights
  for (let i = -8; i <= 8; i++) { const fp = box(.12, .9, .12, 0x1a3a18); fp.position.set(i * 1.08, .45, -6.85); g.add(fp) }
  const rail = box(18.2, .1, .1, 0x224420); rail.position.set(0, .88, -6.85); g.add(rail)
  ;[[-6, -6], [6, -6], [0, -6]].forEach(([x, z]) => {
    const pole = cyl(.042, .042, .65, 6, 0x1e3018); pole.position.set(x, .32, z); g.add(pole)
    const gl = new THREE.Mesh(new THREE.SphereGeometry(.15, 9, 8),
      new THREE.MeshStandardMaterial({ color: 0xccffcc, emissive: 0x06ffa5, emissiveIntensity: 2.2 }))
    gl.position.set(x, .7, z); g.add(gl)
    const pl = new THREE.PointLight(0x06ffa5, .55, 5); pl.position.set(x, .65, z); g.add(pl); lampLights.push(pl)
  })

  const plz = pln(20, 18, 0x0c1a0c, TEX.concrete); plz.rotation.x = -PI / 2; plz.position.set(2, .07, 0); g.add(plz)
  const lb1 = lbl('CASA & ESCRITÓRIO', '#06ffa5', .85); lb1.position.set(2, 12.5, 0); g.add(lb1)
  const lb2 = lbl('Sobre Mim', '#88ffcc', .65); lb2.position.set(2, 11.0, 0); g.add(lb2)
  const ring = new THREE.Mesh(new THREE.RingGeometry(12, 12.6, 64),
    new THREE.MeshBasicMaterial({ color: 0x06ffa5, side: THREE.DoubleSide, transparent: true, opacity: .16 }))
  ring.rotation.x = -PI / 2; ring.position.y = .04; g.add(ring)
  g.userData = { districtId: 'sobre', name: 'Casa & Escritório', desc: D.desc }
  scene.add(g); buildings.push(g); D._group = g
}

export function buildLaboratorio(scene, buildings, TEX, windowMaterials) {
  const D = DISTRICTS.laboratorio; const g = new THREE.Group(); g.position.set(D.pos.x, 0, D.pos.z)

  const main = bldMesh(14, 5, 10, { frontTex: TEX.bPurple, sideTex: TEX.bPurpleS, topTex: TEX.rooftop, col: 0x150c20, emi: 0xb97fff, ei: .05 })
  main.position.set(0, 2.5, 0); g.add(main)
  for (let i = 0; i < 4; i++) { const s = box(14.1, .12, 10.1, 0x291840); s.position.set(0, .72 + i * 1.2, 0); g.add(s) }

  // Glass dome
  const dome = new THREE.Mesh(new THREE.SphereGeometry(4.2, 22, 11, 0, PI * 2, 0, PI / 2),
    new THREE.MeshStandardMaterial({ color: 0xb97fff, transparent: true, opacity: .17, roughness: .04, metalness: .92, emissive: 0xb97fff, emissiveIntensity: .1, side: THREE.FrontSide }))
  dome.position.set(0, 5, 0); g.add(dome)
  // Dome ribs
  for (let i = 0; i < 8; i++) {
    const a = i / 8 * PI * 2
    const rib = new THREE.Mesh(
      new THREE.TubeGeometry(new THREE.QuadraticBezierCurve3(
        new THREE.Vector3(0, 5, 0), new THREE.Vector3(Math.cos(a) * 3.2, 7.5, Math.sin(a) * 3.2),
        new THREE.Vector3(Math.cos(a) * 4.2, 5, Math.sin(a) * 4.2)), 12, .045, 4, false),
      new THREE.MeshStandardMaterial({ color: 0x8855cc, emissive: 0xb97fff, emissiveIntensity: .38, metalness: .82 }))
    g.add(rib)
  }
  // Dome ring at base
  const dRing = new THREE.Mesh(new THREE.TorusGeometry(4.2, .1, 8, 40),
    new THREE.MeshStandardMaterial({ color: 0xb97fff, emissive: 0xb97fff, emissiveIntensity: .6, metalness: .8 }))
  dRing.rotation.x = PI / 2; dRing.position.set(0, 5.1, 0); g.add(dRing)

  // Cooling towers
  ;[[-6.5, 5.5], [6.5, 5.5]].forEach(([x, z]) => {
    const ct = cyl(1.35, 1.65, 6.8, 15, 0x110820, 0xb97fff, .04); ct.position.set(x, 3.4, z); g.add(ct)
    const ctRim = cyl(1.55, 1.35, .32, 15, 0x2a1040); ctRim.position.set(x, 6.86, z); g.add(ctRim)
    const vap = cyl(1.45, .85, 2.2, 12, 0xb97fff, 0xb97fff, .04)
    vap.material = vap.material.clone(); vap.material.transparent = true; vap.material.opacity = .06
    vap.position.set(x, 8.1, z); vap.userData.steam = true; vap.userData.phase = x; g.add(vap)
  })

  // Pipe network on roof
  for (let i = 0; i < 4; i++) {
    const pi = cyl(.1, .1, 4.8 + i, 8, 0x2a1540); pi.rotation.z = PI / 2; pi.position.set(-5.5 + i * 3.2, 5.8, 2.8); g.add(pi)
  }

  // Equipment
  ;[[3.2, 5.35, -2.8], [1.0, 5.35, -1.5], [-1.0, 5.35, -2], [5.0, 5.35, 1.0]].forEach(([x, y, z]) => {
    const eq = box(.85, .6 + Math.random() * .4, .85, 0x190d28); eq.position.set(x, y, z); g.add(eq)
  })

  // Side buildings
  ;[[8, 8, 4, 4, 3, TEX.bPurple, TEX.bPurpleS], [-8, 6, -3, 4, 3, TEX.bPurple, TEX.bPurpleS],
    [9, 4, -5, 3, 3, TEX.bGray, TEX.bGrayS], [-9, 5, 3, 3, 3, TEX.bPurple, TEX.bPurpleS]].forEach(([x, h, z, w, d, ft, st]) => {
    const b = bldMesh(w, h, d, { frontTex: ft, sideTex: st, topTex: TEX.rooftop, col: 0x110a1e, emi: 0xb97fff, ei: .04 })
    b.position.set(x, h / 2, z); g.add(b)
    const rl = box(w + .22, .15, d + .22, 0x1c0e2e); rl.position.set(x, h + .08, z); g.add(rl)
  })

  const plz = pln(22, 16, 0x0f0820, TEX.concrete); plz.rotation.x = -PI / 2; plz.position.y = .07; g.add(plz)
  const lb1 = lbl('LABORATÓRIO TECH', '#b97fff', .9); lb1.position.set(0, 12.5, 0); g.add(lb1)
  const lb2 = lbl('Linguagens & Ferramentas', '#ddaaff', .62); lb2.position.set(0, 11.0, 0); g.add(lb2)
  const ring = new THREE.Mesh(new THREE.RingGeometry(11, 11.6, 64),
    new THREE.MeshBasicMaterial({ color: 0xb97fff, side: THREE.DoubleSide, transparent: true, opacity: .16 }))
  ring.rotation.x = -PI / 2; ring.position.y = .04; g.add(ring)
  g.userData = { districtId: 'laboratorio', name: 'Laboratório Tech', desc: D.desc }
  scene.add(g); buildings.push(g); D._group = g
}

export function buildDashboards(scene, buildings, TEX, windowMaterials) {
  const D = DISTRICTS.dashboards; const g = new THREE.Group(); g.position.set(D.pos.x, 0, D.pos.z)

  // Tapered tower with per-face facades
  for (let i = 0; i < 12; i++) {
    const t = i / 12, w = 7 - t * 3.5
    const fl = bldMesh(w, 2.2, w, { frontTex: TEX.bYellow, sideTex: TEX.bYellowS, topTex: TEX.rooftop, col: 0x181000, emi: 0xffd166, ei: .04 + t * .1 })
    fl.position.set(0, i * 2.3 + 1.1, 0); g.add(fl)
    // Floor-edge glow stripe
    if (i > 0) {
      const eg = box(w + .32, .09, w + .32, 0xffd166, 0xffd166, .85); eg.position.set(0, i * 2.3, 0); g.add(eg)
    }
  }
  const topY = 12 * 2.3

  // Observation deck
  const deck = cyl(5.6, 5.6, .44, 28, 0x1a1400, 0xffd166, .13); deck.position.y = topY; g.add(deck)
  const deckRail = new THREE.Mesh(new THREE.TorusGeometry(5.6, .075, 8, 52),
    new THREE.MeshStandardMaterial({ color: 0xffd166, emissive: 0xffd166, emissiveIntensity: .65 }))
  deckRail.rotation.x = PI / 2; deckRail.position.y = topY + .58; g.add(deckRail)
  const spire = cyl(.065, .09, 8.5, 6, 0xffd166, 0xffd166, 1.2); spire.position.y = topY + 4.3; g.add(spire)
  const beacon = new THREE.Mesh(new THREE.SphereGeometry(.32, 9, 8),
    new THREE.MeshStandardMaterial({ color: 0xffd166, emissive: 0xffd166, emissiveIntensity: 7 }))
  beacon.position.y = topY + 8.7; beacon.userData.blink = true; g.add(beacon)

  // Holographic rings
  ;[7, 13, 20].forEach((y, i) => {
    const rm = new THREE.Mesh(new THREE.TorusGeometry(6.5 + i * 1.3, .075, 7, 52),
      new THREE.MeshStandardMaterial({ color: 0xffd166, emissive: 0xffd166, emissiveIntensity: .55, transparent: true, opacity: .35 - i * .08 }))
    rm.rotation.x = PI / 2; rm.position.y = y; rm.userData.rotateY = true; rm.userData.speed = .004 - i * .001; g.add(rm)
  })

  // Side buildings
  ;[[-12, 8, 2, 4.5, 3], [12, 9, -2, 4, 3], [-11, 5, -5, 3.5, 3], [11, 6, 4, 3, 3], [-6, 4, -8, 3, 3], [6, 5, -8, 3, 3]].forEach(([x, h, z, w, d]) => {
    const b = bldMesh(w, h, d, { frontTex: TEX.bYellow, sideTex: TEX.bYellowS, topTex: TEX.rooftop, col: 0x151000, emi: 0xffd166, ei: .04 })
    b.position.set(x, h / 2, z); g.add(b)
    const rl = box(w + .22, .15, d + .22, 0x201800); rl.position.set(x, h + .08, z); g.add(rl)
  })

  const plz = pln(26, 22, 0x121000, TEX.concrete); plz.rotation.x = -PI / 2; plz.position.y = .07; g.add(plz)
  const lb1 = lbl('TORRE DE INSIGHTS', '#ffd166', .95); lb1.position.set(0, topY + 12.5, 0); g.add(lb1)
  const lb2 = lbl('Dashboards & Análises', '#ffe999', .65); lb2.position.set(0, topY + 11.0, 0); g.add(lb2)
  const ring = new THREE.Mesh(new THREE.RingGeometry(12, 12.6, 64),
    new THREE.MeshBasicMaterial({ color: 0xffd166, side: THREE.DoubleSide, transparent: true, opacity: .18 }))
  ring.rotation.x = -PI / 2; ring.position.y = .04; g.add(ring)
  g.userData = { districtId: 'dashboards', name: 'Torre de Insights', desc: D.desc }
  scene.add(g); buildings.push(g); D._group = g
}

export function buildContato(scene, buildings, TEX, windowMaterials) {
  const D = DISTRICTS.contato; const g = new THREE.Group(); g.position.set(D.pos.x, 0, D.pos.z)

  const body = bldMesh(16, 5.5, 8, { frontTex: TEX.bRed, sideTex: TEX.bRedS, topTex: TEX.rooftop, col: 0x280a0a, emi: 0xff6b6b, ei: .05 })
  body.position.set(0, 2.75, 0); g.add(body)
  for (let i = 0; i < 4; i++) { const s = box(16.1, .12, 8.1, 0x3a0e0e); s.position.set(0, .82 + i * 1.2, 0); g.add(s) }

  // Barrel vault
  const arch = new THREE.Mesh(new THREE.CylinderGeometry(3.9, 3.9, 16.4, 34, 1, true, 0, PI),
    new THREE.MeshStandardMaterial({ color: 0x1c0808, roughness: .6, metalness: .3, side: THREE.DoubleSide }))
  arch.rotation.z = PI / 2; arch.rotation.y = PI / 2; arch.position.set(0, 5.5, 0); arch.castShadow = true; g.add(arch)
  for (let i = 0; i < 7; i++) {
    const rib = new THREE.Mesh(new THREE.TorusGeometry(3.9, .09, 7, 18, PI),
      new THREE.MeshStandardMaterial({ color: 0xff6b6b, emissive: 0xff6b6b, emissiveIntensity: .28, metalness: .82 }))
    rib.position.set(-7.5 + i * 2.5, 5.5, 0); rib.rotation.y = PI / 2; g.add(rib)
  }
  ;[-8.2, 8.2].forEach(x => {
    const eg = new THREE.Mesh(new THREE.CircleGeometry(3.9, 26, 0, PI),
      new THREE.MeshStandardMaterial({ color: 0x1c0808, side: THREE.DoubleSide }))
    eg.rotation.y = x < 0 ? PI / 2 : -PI / 2; eg.position.set(x, 5.5, 0); g.add(eg)
  })

  // Radio tower
  const tbase = cyl(.32, .42, 4.2, 11, 0x3a1010); tbase.position.set(8, 2.1, 0); g.add(tbase)
  const tmid = cyl(.22, .3, 6.5, 11, 0x4a1414, 0xff6b6b, .06); tmid.position.set(8, 7.25, 0); g.add(tmid)
  const ttop = cyl(.09, .13, 7.5, 9, 0x551818, 0xff6b6b, .1); ttop.position.set(8, 13.75, 0); g.add(ttop)
  ;[4, 6, 8, 10, 12].forEach(y => {
    const a = box(3.2, .1, .1, 0x441111); a.position.set(8, y, 0); g.add(a)
    const a2 = box(.1, .1, 3.2, 0x441111); a2.position.set(8, y + .08, 0); g.add(a2)
  })
  const beacon = new THREE.Mesh(new THREE.SphereGeometry(.27, 9, 8),
    new THREE.MeshStandardMaterial({ color: 0xff6b6b, emissive: 0xff6b6b, emissiveIntensity: 7 }))
  beacon.position.set(8, 17.7, 0); beacon.userData.blink = true; g.add(beacon)

  // Satellite dishes
  ;[[-4.5, 9.5, -1.8, 1.2, .6], [4, 9, -2, 1.0, .4], [0, 9, 2, .9, .5]].forEach(([x, y, z, r, tilt]) => {
    const d = new THREE.Mesh(new THREE.SphereGeometry(r, 18, 9, 0, PI * 2, 0, PI / 2),
      new THREE.MeshStandardMaterial({ color: 0x3a1010, roughness: .3, metalness: .82, side: THREE.DoubleSide }))
    d.rotation.x = PI / 2 - tilt; d.position.set(x, y, z); g.add(d)
    const pole = cyl(.055, .055, 1.7, 7, 0x441111); pole.position.set(x, y - 1.3, z); g.add(pole)
    const tip = new THREE.Mesh(new THREE.SphereGeometry(.11, 7, 7),
      new THREE.MeshStandardMaterial({ color: 0xff6b6b, emissive: 0xff6b6b, emissiveIntensity: 4.5 }))
    tip.position.set(x, y + .85, z - r * .68); g.add(tip)
  })

  // Canopy
  const canopy = box(6.2, .2, 2.6, 0x3a1010, 0xff6b6b, .38); canopy.position.set(0, 5, -5.15); g.add(canopy)
  ;[-2.5, 2.5].forEach(x => { const cp = cyl(.082, .082, 5.1, 7, 0x441111); cp.position.set(x, 2.55, -5.82); g.add(cp) })

  // Pulse rings
  ;[6.5, 10, 14].forEach((r, i) => {
    const pr = new THREE.Mesh(new THREE.RingGeometry(r, r + .2, 68),
      new THREE.MeshBasicMaterial({ color: 0xff6b6b, side: THREE.DoubleSide, transparent: true, opacity: .13 - i * .035 }))
    pr.rotation.x = -PI / 2; pr.position.y = .04 + i * .01; pr.userData.pulseRing = true; pr.userData.pulseOffset = i * .35; g.add(pr)
  })

  const plz = pln(22, 14, 0x180808, TEX.concrete); plz.rotation.x = -PI / 2; plz.position.y = .07; g.add(plz)
  const lb1 = lbl('ESTAÇÃO DE CONTATO', '#ff6b6b', .85); lb1.position.set(0, 20.5, 0); g.add(lb1)
  const lb2 = lbl('LinkedIn · GitHub · Currículo', '#ffaaaa', .62); lb2.position.set(0, 19.0, 0); g.add(lb2)
  const ring = new THREE.Mesh(new THREE.RingGeometry(11, 11.6, 64),
    new THREE.MeshBasicMaterial({ color: 0xff6b6b, side: THREE.DoubleSide, transparent: true, opacity: .18 }))
  ring.rotation.x = -PI / 2; ring.position.y = .04; g.add(ring)
  g.userData = { districtId: 'contato', name: 'Estação de Contato', desc: D.desc }
  scene.add(g); buildings.push(g); D._group = g
}

// ─── FILLER BUILDINGS (inner city) ────────────────────────────────────────────
export function buildFiller(scene, windowMaterials, TEX) {
  ;[
    [-40, 10, 5, 12, 5, 'bBlue'], [-40, -5, 4, 8, 4, 'bGray'], [-40, -18, 6, 15, 5, 'bBlue'],
    [40, 10, 5, 10, 4, 'bBlue'], [40, -5, 4, 9, 4, 'bGray'], [40, -18, 5, 13, 5, 'bGray'],
    [-42, -32, 6, 18, 5, 'bBlue'], [42, -32, 5, 16, 5, 'bGray'],
    [-50, 0, 4, 9, 4, 'bGray'], [-50, -14, 5, 11, 5, 'bBlue'], [50, 0, 4, 8, 4, 'bGray'], [50, -14, 4, 12, 4, 'bBlue'],
    [-62, -5, 5, 14, 4, 'bBlue'], [-62, -20, 4, 10, 4, 'bGray'], [62, -5, 4, 13, 4, 'bBlue'], [62, -20, 5, 11, 5, 'bGray'],
    [-28, -38, 4, 10, 4, 'bBlue'], [28, -38, 4, 8, 4, 'bGray'],
    [-14, -52, 5, 14, 5, 'bBlue'], [14, -52, 4, 12, 4, 'bGray'], [0, -56, 6, 16, 5, 'bGray'],
    [-36, 26, 4, 8, 4, 'bBlue'], [36, 26, 5, 9, 4, 'bGray'], [-22, 30, 4, 7, 4, 'bBlue'], [22, 30, 4, 6, 4, 'bBlue'],
    [-14, 36, 5, 10, 5, 'bGray'], [14, 36, 4, 9, 4, 'bBlue'], [0, 38, 5, 11, 5, 'bBlue'],
    [-20, -4, 3, 5, 3, 'bGray'], [20, -4, 3, 5, 3, 'bGray'], [-20, -10, 3, 4, 3, 'bBlue'], [20, -10, 3, 6, 3, 'bBlue'],
  ].forEach(([x, z, w, h, d, tk]) => {
    const ft = TEX[tk], st = TEX[tk + 'S']
    const b = bldMesh(w, h, d, { frontTex: ft, sideTex: st, topTex: TEX.rooftop, col: 0x0c1828 })
    b.position.set(x, h / 2, z); scene.add(b)
    const rf = box(w + .22, .14, d + .22, 0x0e1a28); rf.position.set(x, h + .08, z); scene.add(rf)
    if (Math.random() > .5) { const tank = cyl(.52, .52, .85, 9, 0x1a2030); tank.position.set(x, h + .58, z + (Math.random() - .5) * d * .4); scene.add(tank) }
    if (Math.random() > .6) { const ac = box(.8, .55, .7, 0x1a2438); ac.position.set(x + (Math.random() - .5) * w * .4, h + .38, z + (Math.random() - .5) * d * .4); scene.add(ac) }
  })
}

export function buildVegetation(scene) {
  // Road-lining trees
  ;[
    [-6, -6], [-6, -14], [-6, -24], [-6, -34], [-6, -44],
    [6, -6], [6, -14], [6, -24], [6, -34], [6, -44],
    [-12, 6], [12, 6], [-22, 6], [22, 6], [-34, 6], [34, 6],
    [-28, -8], [-28, -16], [-28, -24], [28, -8], [28, -16], [28, -24],
    [-5, 10], [5, 10], [-5, 18], [5, 18],
  ].forEach(([x, z], i) => scene.add(makeTree(x, z, 1, i % 2)))

  // Park clusters
  ;[
    [-17, -9], [-17, -13], [-15, -8], [-19, -11], [-13, -12],
    [17, -9], [17, -13], [15, -8], [19, -11], [13, -12],
    [-17, 6], [-17, 9], [17, 6], [17, 9],
    [-9, -35], [9, -35], [-7, -37], [7, -37],
    [-11, 18], [-9, 21], [11, 18], [9, 21],
    [-5, -5], [5, -5], [-5, -16], [5, -16],
  ].forEach(([x, z], i) => scene.add(makeTree(x, z, .9 + Math.random() * .22, i % 2)))

  // Bushes
  ;[
    [-32, -20], [-24, -20], [-32, -24], [-24, -24], [32, -20], [24, -20], [32, -24], [24, -24],
    [-8, -50], [8, -50], [0, -50], [-4, 22], [4, 22], [-4, 28], [4, 28],
    [-10, 5], [10, 5], [-8, -3], [8, -3], [0, -3],
  ].forEach(([x, z]) => scene.add(makeBush(x, z, .8)))

  // Flower beds
  const fColors = [0xff4488, 0xffaa00, 0xff6622, 0xcc44ff, 0xff88aa]
  ;[[0, -7, 16, 4], [-28, -22, 6, 6], [28, -22, 6, 6], [0, -44, 12, 6], [0, 25, 12, 4]].forEach(([cx, cz, fw, fd]) => {
    const bed = new THREE.Mesh(new THREE.PlaneGeometry(fw, fd),
      new THREE.MeshStandardMaterial({ color: 0x0a1208, roughness: .97 }))
    bed.rotation.x = -PI / 2; bed.position.set(cx, .04, cz); scene.add(bed)
    for (let f = 0; f < 22; f++) {
      const fc = fColors[f % fColors.length]
      const st = cyl(.03, .03, .28 + Math.random() * .18, 4, 0x0a1e08)
      st.position.set(cx + (Math.random() - .5) * fw * .8, .14, cz + (Math.random() - .5) * fd * .8); scene.add(st)
      const pt = new THREE.Mesh(new THREE.SphereGeometry(.15, 7, 6),
        new THREE.MeshStandardMaterial({ color: fc, emissive: fc, emissiveIntensity: .32 }))
      pt.position.set(st.position.x, st.position.y + .34, st.position.z); scene.add(pt)
    }
  })
}
