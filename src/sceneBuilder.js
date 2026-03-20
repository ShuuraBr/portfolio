import * as THREE from 'three'
import { DISTRICTS } from './cityData'

// ─── TEXTURE GENERATORS ──────────────────────────────────────────────────────
function mkTex(fn, repeatX = 1, repeatY = 1) {
  const t = new THREE.CanvasTexture(fn())
  t.wrapS = t.wrapT = THREE.RepeatWrapping
  t.repeat.set(repeatX, repeatY)
  return t
}

export function buildTextures() {
  const TEX = {}

  TEX.asphalt = mkTex(() => {
    const c = document.createElement('canvas'); c.width = 256; c.height = 256
    const x = c.getContext('2d'); x.fillStyle = '#0c1420'; x.fillRect(0, 0, 256, 256)
    for (let i = 0; i < 3000; i++) {
      x.fillStyle = `rgba(${60 + Math.random() * 40},${70 + Math.random() * 40},${90 + Math.random() * 40},${.03 + Math.random() * .04})`
      x.fillRect(Math.random() * 256, Math.random() * 256, 1 + Math.random() * 3, 1 + Math.random() * 2)
    }
    return c
  }, 10, 10)

  TEX.sidewalk = mkTex(() => {
    const c = document.createElement('canvas'); c.width = 256; c.height = 256
    const x = c.getContext('2d'); x.fillStyle = '#18243a'; x.fillRect(0, 0, 256, 256)
    x.strokeStyle = '#0e1828'; x.lineWidth = 2
    for (let i = 0; i <= 8; i++) {
      x.beginPath(); x.moveTo(i * 32, 0); x.lineTo(i * 32, 256); x.stroke()
      x.beginPath(); x.moveTo(0, i * 32); x.lineTo(256, i * 32); x.stroke()
    }
    return c
  }, 4, 4)

  TEX.grass = mkTex(() => {
    const c = document.createElement('canvas'); c.width = 128; c.height = 128
    const x = c.getContext('2d'); x.fillStyle = '#0a1a0a'; x.fillRect(0, 0, 128, 128)
    for (let i = 0; i < 600; i++) {
      x.fillStyle = `rgba(${8 + Math.random() * 25},${35 + Math.random() * 55},${8 + Math.random() * 18},.55)`
      x.fillRect(Math.random() * 128, Math.random() * 128, 1, 2 + Math.random() * 3)
    }
    return c
  }, 6, 6)

  TEX.concrete = mkTex(() => {
    const c = document.createElement('canvas'); c.width = 128; c.height = 128
    const x = c.getContext('2d'); x.fillStyle = '#111c2c'; x.fillRect(0, 0, 128, 128)
    for (let i = 0; i < 1000; i++) {
      x.fillStyle = `rgba(80,110,150,${.015 + Math.random() * .025})`
      x.fillRect(Math.random() * 128, Math.random() * 128, Math.random() * 4, Math.random() * 3)
    }
    return c
  }, 4, 4)

  function bldTex(wc, bg) {
    const c = document.createElement('canvas'); c.width = 256; c.height = 512
    const x = c.getContext('2d'); x.fillStyle = bg; x.fillRect(0, 0, 256, 512)
    const rows = 12, cols = 5, bw = 256 / cols, bh = 512 / rows
    for (let r = 0; r < rows; r++) for (let col = 0; col < cols; col++) {
      if (Math.random() < .22) continue
      const on = Math.random() > .38
      x.fillStyle = on ? wc : 'rgba(8,16,32,.85)'
      x.globalAlpha = on ? .45 + Math.random() * .55 : .25
      x.fillRect(col * bw + 5, r * bh + 5, bw - 10, bh - 9)
      x.globalAlpha = 1
    }
    return c
  }
  TEX.bBlue   = new THREE.CanvasTexture(bldTex('#88bbff', '#0b1626'))
  TEX.bGreen  = new THREE.CanvasTexture(bldTex('#88ffcc', '#091a0e'))
  TEX.bPurple = new THREE.CanvasTexture(bldTex('#cc99ff', '#110924'))
  TEX.bYellow = new THREE.CanvasTexture(bldTex('#ffee88', '#181200'))
  TEX.bRed    = new THREE.CanvasTexture(bldTex('#ffaaaa', '#1e0808'))
  TEX.bGray   = new THREE.CanvasTexture(bldTex('#aabbcc', '#0f151f'))

  return TEX
}

// ─── PRIMITIVES ───────────────────────────────────────────────────────────────
export function box(w, h, d, col, emi, ei, tex) {
  const mat = new THREE.MeshStandardMaterial({ color: new THREE.Color(col), roughness: .65, metalness: .25 })
  if (emi) { mat.emissive = new THREE.Color(emi); mat.emissiveIntensity = ei || 0 }
  if (tex) { mat.map = tex; mat.roughness = .8 }
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat)
  m.castShadow = true; m.receiveShadow = true; return m
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
  const m = new THREE.Mesh(new THREE.PlaneGeometry(7, 1.3), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(c), transparent: true, depthWrite: false, side: THREE.DoubleSide }))
  return m
}

export function wMat(col, ei, windowMaterials) {
  const m = new THREE.MeshStandardMaterial({ color: new THREE.Color(col), emissive: new THREE.Color(col), emissiveIntensity: ei })
  windowMaterials.push(m); return m
}

// ─── STREET LAMP ─────────────────────────────────────────────────────────────
export function makeLamp(x, z, lampLights) {
  const g = new THREE.Group()
  const p = cyl(.065, .09, 5.5, 8, 0x2a3a50); p.position.y = 2.75; g.add(p)
  const arm = new THREE.Mesh(new THREE.CylinderGeometry(.04, .04, 1.4, 6), new THREE.MeshStandardMaterial({ color: 0x2a3a50, metalness: .8 }))
  arm.rotation.z = Math.PI / 2; arm.position.set(.7, 5.35, 0); g.add(arm)
  const hood = new THREE.Mesh(new THREE.CylinderGeometry(.22, .3, .3, 8), new THREE.MeshStandardMaterial({ color: 0x1a2840, metalness: .9 }))
  hood.position.set(1.4, 5.2, 0); g.add(hood)
  const bulb = new THREE.Mesh(new THREE.SphereGeometry(.12, 8, 8), new THREE.MeshStandardMaterial({ color: 0xfff8e0, emissive: 0xffe090, emissiveIntensity: 4 }))
  bulb.position.set(1.4, 5.05, 0); g.add(bulb)
  const pl = new THREE.PointLight(0xffe8a0, 1.4, 14); pl.position.set(1.4, 4.8, 0); g.add(pl)
  lampLights.push(pl)
  g.position.set(x, 0, z); return g
}

// ─── TREE ────────────────────────────────────────────────────────────────────
export function makeTree(x, z, s = 1, v = 0) {
  const g = new THREE.Group()
  const tk = cyl(.08, .14, 1.3 * s, 6, 0x3b1e08); tk.position.y = .65 * s; g.add(tk)
  if (v === 0) {
    [[1.1, 2.4, 0x0d3010], [.85, 1.8, 0x0b280e], [.55, 1.3, 0x0e3814]].forEach(([r, h, col], i) => {
      const f = new THREE.Mesh(new THREE.ConeGeometry(r * s, h * s, 7), new THREE.MeshStandardMaterial({ color: col, roughness: .9 }))
      f.position.y = (1.2 + h * .4 + i * 1.1) * s; f.castShadow = true; g.add(f)
    })
  } else {
    const fo = new THREE.Mesh(new THREE.SphereGeometry(.9 * s, 7, 6), new THREE.MeshStandardMaterial({ color: 0x0c2c0c, roughness: .85 }))
    fo.position.y = (1.2 + .9) * s; fo.castShadow = true; g.add(fo)
    const ft = new THREE.Mesh(new THREE.SphereGeometry(.65 * s, 6, 5), new THREE.MeshStandardMaterial({ color: 0x0f3816, roughness: .9 }))
    ft.position.y = (1.2 + 1.65) * s; g.add(ft)
  }
  g.position.set(x, 0, z); return g
}

export function makeBush(x, z, s = .8) {
  const g = new THREE.Group()
  ;[[0, 0, 0, .55], [-.3, -.1, .2, .4], [.35, -.05, -.2, .38], [0, .2, 0, .35]].forEach(([dx, dy, dz, r]) => {
    const m = new THREE.Mesh(new THREE.SphereGeometry(r * s, 6, 5), new THREE.MeshStandardMaterial({ color: 0x0a2808, roughness: .95 }))
    m.position.set(dx * s, (dy + .3) * s, dz * s); m.castShadow = true; g.add(m)
  })
  g.position.set(x, 0, z); return g
}

// ─── FOUNTAIN ────────────────────────────────────────────────────────────────
export function makeFountain(x, z, lampLights) {
  const g = new THREE.Group()
  const basin = cyl(3.2, 3.6, .55, 24, 0x1a2a38); basin.position.y = .28; g.add(basin)
  const water = new THREE.Mesh(new THREE.CircleGeometry(2.9, 32),
    new THREE.MeshStandardMaterial({ color: 0x1a4875, emissive: 0x0a2845, emissiveIntensity: .4, transparent: true, opacity: .88, metalness: .3, roughness: .1 }))
  water.rotation.x = -Math.PI / 2; water.position.y = .56; water.userData.water = true; g.add(water)
  const col = cyl(.18, .22, 1.2, 10, 0x223344); col.position.y = 1.1; g.add(col)
  const top = new THREE.Mesh(new THREE.SphereGeometry(.35, 10, 8), new THREE.MeshStandardMaterial({ color: 0x1a3050, roughness: .4, metalness: .6 }))
  top.position.y = 1.85; g.add(top)
  for (let i = 0; i < 10; i++) {
    const a = i / 10 * Math.PI * 2
    const d = new THREE.Mesh(new THREE.SphereGeometry(.07, 5, 5),
      new THREE.MeshStandardMaterial({ color: 0x5aaddd, emissive: 0x2277aa, emissiveIntensity: .5, transparent: true, opacity: .75 }))
    d.position.set(Math.cos(a) * .5, 2.1, Math.sin(a) * .5)
    d.userData.spray = true; d.userData.ang = a; d.userData.phase = i * .62; g.add(d)
  }
  const pl = new THREE.PointLight(0x3399cc, .7, 7); pl.position.y = .7; g.add(pl); lampLights.push(pl)
  for (let i = 0; i < 12; i++) {
    const a = i / 12 * Math.PI * 2
    const post = cyl(.06, .06, .4, 6, 0x1a2a38); post.position.set(Math.cos(a) * 3, .6, Math.sin(a) * 3); g.add(post)
  }
  g.position.set(x, 0, z); return g
}

// ─── GROUND & ROADS ──────────────────────────────────────────────────────────
export function buildGround(scene, TEX) {
  const g = pln(400, 400, 0x09111e); g.rotation.x = -Math.PI / 2; g.receiveShadow = true; scene.add(g)
  const parkMat = new THREE.MeshStandardMaterial({ color: 0x081408, map: TEX.grass, roughness: .95 })
  ;[[-14, -11, 10, 8], [14, -11, 10, 8], [-14, 5, 10, 7], [14, 5, 10, 7], [0, -33, 24, 8], [0, 16, 22, 7]].forEach(([x, z, w, d]) => {
    const p = new THREE.Mesh(new THREE.PlaneGeometry(w, d), parkMat)
    p.rotation.x = -Math.PI / 2; p.position.set(x, .015, z); p.receiveShadow = true; scene.add(p)
  })
}

export function buildRoads(scene, TEX) {
  const asfMat = new THREE.MeshStandardMaterial({ color: 0x0c1420, map: TEX.asphalt, roughness: .92 })
  const dashMat = new THREE.MeshStandardMaterial({ color: 0xffd166, emissive: 0xffd166, emissiveIntensity: .25 })
  const edgeMat = new THREE.MeshStandardMaterial({ color: 0xc0c8d8, emissive: 0x808898, emissiveIntensity: .06 })

  function road(w, h, x, z, rot = 0) {
    const r = new THREE.Mesh(new THREE.PlaneGeometry(w, h), asfMat)
    r.rotation.x = -Math.PI / 2; r.rotation.z = rot; r.position.set(x, .02, z); r.receiveShadow = true; scene.add(r)
    const isW = rot !== 0; const len = isW ? w : h; const n = Math.floor(len / 5)
    for (let i = 0; i < n; i++) {
      const d = new THREE.Mesh(new THREE.PlaneGeometry(.12, 1.9), dashMat); d.rotation.x = -Math.PI / 2
      d.position.set(isW ? x - len / 2 + i * (len / n) + len / n / 2 : x, .032, isW ? z : z - len / 2 + i * (len / n) + len / n / 2)
      scene.add(d)
    }
    const off = (isW ? h : w) / 2 - .25
    for (const s of [-1, 1]) {
      const e = new THREE.Mesh(new THREE.PlaneGeometry(isW ? w : .16, isW ? .16 : h), edgeMat); e.rotation.x = -Math.PI / 2
      e.position.set(isW ? x : x + s * off, .033, isW ? z + s * off : z); scene.add(e)
    }
  }

  road(7, 150, 0, -5); road(150, 7, 0, 0, Math.PI / 2); road(7, 50, 0, -44)
  road(50, 5, -14, -22, Math.PI / 2); road(50, 5, 14, -22, Math.PI / 2); road(7, 28, 0, 14)
  road(38, 5, -14, 5, Math.PI / 2); road(38, 5, 14, 5, Math.PI / 2)
  road(7, 18, -28, -11); road(7, 18, 28, -11)
}

export function buildSidewalks(scene, TEX) {
  const swMat = new THREE.MeshStandardMaterial({ color: 0x131e2e, map: TEX.sidewalk, roughness: .88 })
  function sw(w, h, x, z, rot = 0) {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), swMat)
    m.rotation.x = -Math.PI / 2; m.rotation.z = rot; m.position.set(x, .05, z); m.receiveShadow = true; scene.add(m)
  }
  sw(2, 150, 4.2, -5); sw(2, 150, -4.2, -5)
  sw(150, 2, 0, 4.2, Math.PI / 2); sw(150, 2, 0, -4.2, Math.PI / 2)
  sw(2, 50, 4.2, -44); sw(2, 50, -4.2, -44)
}

export function buildLamps(scene, lampLights) {
  ;[
    [-4.5, -3], [4.5, -3], [-4.5, -10], [4.5, -10], [-4.5, -20], [4.5, -20],
    [-4.5, -32], [4.5, -32], [-4.5, -42], [4.5, -42],
    [-11, 4.5], [11, 4.5], [-22, 4.5], [22, 4.5], [-35, 4.5], [35, 4.5],
    [-14, -17], [14, -17], [-14, -27], [14, -27],
    [-4.5, 8], [4.5, 8], [-4.5, 18], [4.5, 18],
    [28, -8], [28, -16], [28, -27], [-28, -8], [-28, -16], [-28, -27],
  ].forEach(([x, z]) => scene.add(makeLamp(x, z, lampLights)))
}

export function buildFountains(scene, lampLights) {
  scene.add(makeFountain(0, 13, lampLights))
  scene.add(makeFountain(-28, 2, lampLights))
  scene.add(makeFountain(28, 2, lampLights))
}

// ─── DISTRICTS ────────────────────────────────────────────────────────────────
export function buildProjetos(scene, buildings, TEX, windowMaterials) {
  const D = DISTRICTS.projetos; const g = new THREE.Group(); g.position.set(D.pos.x, 0, D.pos.z)
  const sk = box(6, 24, 6, 0x0e1a30, 0x4f8cff, .1, TEX.bBlue); sk.position.set(-8, 12, -4); g.add(sk)
  const sk2 = box(4, 8, 4, 0x122040, 0x4f8cff, .18, TEX.bBlue); sk2.position.set(-8, 28, -4); g.add(sk2)
  const rfledge = box(6.4, .4, 6.4, 0x1a2a4a); rfledge.position.set(-8, 24.2, -4); g.add(rfledge)
  const ant = cyl(.05, .05, 5, 6, 0x4f8cff, 0x4f8cff, 2); ant.position.set(-8, 37, -4); g.add(ant)
  const ball = new THREE.Mesh(new THREE.SphereGeometry(.28, 8, 8), new THREE.MeshStandardMaterial({ color: 0x4f8cff, emissive: 0x4f8cff, emissiveIntensity: 6 }))
  ball.position.set(-8, 39.8, -4); ball.userData.blink = true; g.add(ball)
  for (let f = 0; f < 10; f++) for (let c = 0; c < 3; c++) {
    const on = Math.random() > .28
    const wm = new THREE.Mesh(new THREE.PlaneGeometry(.9, .55), wMat(on ? '#88bbff' : '#131e30', on ? .55 + Math.random() * .8 : .04, windowMaterials))
    wm.position.set(-9.5 + c * 1.4, 1.5 + f * 2.2, -7.02); wm.rotation.y = Math.PI; g.add(wm)
    const w2 = wm.clone(); w2.position.set(-9.5 + c * 1.4, 1.5 + f * 2.2, -.98); g.add(w2)
  }
  const srv = box(5, 13, 5, 0x0f1c34, 0x00e5ff, .08, TEX.bBlue); srv.position.set(3, 6.5, -6); g.add(srv)
  for (let r = 0; r < 6; r++) { const rack = box(4, .28, .18, 0x00e5ff, 0x00e5ff, 1.8); rack.position.set(3, 1 + r * 2, -3.6); g.add(rack) }
  ;[[1.4, 13.2, -5.3], [2.6, 13.2, -6], [3.8, 13.2, -5], [4.4, 13.2, -7]].forEach(([x, y, z]) => {
    const ac = box(.85, .6, .7, 0x1a2840); ac.position.set(x, y, z); g.add(ac)
    const fn = cyl(.24, .24, .09, 8, 0x223444); fn.rotation.x = Math.PI / 2; fn.position.set(x, y + .08, z - .37); g.add(fn)
  })
  const an = box(5, 9, 4, 0x0f1f38, 0x4f8cff, .06, TEX.bBlue); an.position.set(7, 4.5, 1); g.add(an)
  ;[.5, .85, .6, 1.0, .72].forEach((h, i) => { const bar = box(.5, h * 3.5, .12, 0x4f8cff, 0x4f8cff, 1.5); bar.position.set(4.82 + i * .75, h * 1.75 + 1, 3.02); g.add(bar) })
  ;[[-4, 3.5, -2, 3, 2, TEX.bBlue], [8, 5, 7, 3.5, 3, TEX.bBlue], [-6, 4, 5, 3.5, 2.5, TEX.bGray],
    [0, 2, -2, 4, 2, TEX.bGray], [-10, 2.5, 2, 2.5, 2, TEX.bBlue], [-2, 6, -8, 4, 3, TEX.bBlue],
    [5, 3.5, -3, 3, 3, TEX.bGray], [-7, 5, -7, 3, 3, TEX.bBlue]].forEach(([x, h, z, w, d, tx]) => {
    const b = box(w, h, d, 0x0f1a30, 0x4f8cff, .04, tx); b.position.set(x, h / 2, z); g.add(b)
    const rl = box(w + .3, .14, d + .3, 0x1a2a44); rl.position.set(x, h + .07, z); g.add(rl)
  })
  const plz = pln(22, 22, 0x0e1828, TEX.concrete); plz.rotation.x = -Math.PI / 2; plz.position.y = .06; g.add(plz)
  const lb1 = lbl('CIDADE DE DADOS', '#4f8cff', 1.0); lb1.position.set(-2, 42, -4); g.add(lb1)
  const lb2 = lbl('Projetos', '#88bbff', .65); lb2.position.set(-2, 40.5, -4); g.add(lb2)
  const ring = new THREE.Mesh(new THREE.RingGeometry(11, 11.5, 64), new THREE.MeshBasicMaterial({ color: 0x4f8cff, side: THREE.DoubleSide, transparent: true, opacity: .18 }))
  ring.rotation.x = -Math.PI / 2; ring.position.y = .04; g.add(ring)
  g.userData = { districtId: 'projetos', name: 'Cidade de Dados', desc: D.desc }
  scene.add(g); buildings.push(g); D._group = g
}

export function buildSobre(scene, buildings, TEX, windowMaterials, lampLights) {
  const D = DISTRICTS.sobre; const g = new THREE.Group(); g.position.set(D.pos.x, 0, D.pos.z)
  const body = box(11, 5.5, 8, 0x0c1a0c, 0x06ffa5, .04, TEX.bGreen); body.position.set(0, 2.75, 0); g.add(body)
  for (let i = 0; i < 5; i++) { const s = box(11, .1, 8, 0x0a1608); s.position.set(0, .8 + i * 1.08, .01); g.add(s) }
  const roof = new THREE.Mesh(new THREE.CylinderGeometry(0, 8.5, 4, 4), new THREE.MeshStandardMaterial({ color: 0x0a1a0a, roughness: .85 }))
  roof.rotation.y = Math.PI / 4; roof.position.set(0, 7.5, 0); roof.castShadow = true; g.add(roof)
  const ridge = box(10, .18, .18, 0x0d1e0d); ridge.position.set(0, 9.6, 0); g.add(ridge)
  const ch = box(.9, 2.8, .9, 0x1a2a12); ch.position.set(2.8, 8.3, 1.2); g.add(ch)
  for (let i = 0; i < 3; i++) {
    const sm = new THREE.Mesh(new THREE.SphereGeometry(.32 + i * .08, 7, 6), new THREE.MeshStandardMaterial({ color: 0x445544, transparent: true, opacity: .25 }))
    sm.position.set(2.8, 11.5 + i * .6, 1.2); sm.userData.smoke = true; sm.userData.phase = i * 1.3; sm.userData.startY = 11.5 + i * .6; g.add(sm)
  }
  ;[[-3.2, 3.5, -4.03], [3.2, 3.5, -4.03], [-3.2, 3.5, 4.03], [3.2, 3.5, 4.03]].forEach(([x, y, z]) => {
    const fr = box(2.1, 1.7, .1, 0x192a12); fr.position.set(x, y, z + (z < 0 ? -.01 : .01)); if (z > 0) fr.rotation.y = Math.PI; g.add(fr)
    const wn = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 1.25), wMat('#b8ffde', 1.4 + Math.random() * .4, windowMaterials))
    wn.position.set(x, y, z + (z < 0 ? .01 : -.01)); if (z > 0) wn.rotation.y = Math.PI; g.add(wn)
  })
  const door = box(1.4, 2.6, .08, 0x1a3a12, 0x06ffa5, .08); door.position.set(0, 1.3, -4.04); g.add(door)
  const dfr = box(1.8, 2.9, .06, 0x2a4a1a); dfr.position.set(0, 1.45, -4.06); g.add(dfr)
  for (let i = 0; i < 3; i++) { const s = box(2.8 - i * .4, .18, .6, 0x182816); s.position.set(0, i * .22, -4.58 - i * .26); g.add(s) }
  const wing = box(8, 4.5, 6, 0x0c1a0c, 0x06ffa5, .03, TEX.bGreen); wing.position.set(9.5, 2.25, 0); g.add(wing)
  const wRf = box(8.4, .3, 6.4, 0x0d1a0d); wRf.position.set(9.5, 4.65, 0); g.add(wRf)
  const gd = box(4.2, 3, .08, 0x224422, 0x06ffa5, .12); gd.position.set(9.5, 1.5, -3.04); g.add(gd)
  for (let s = 0; s < 6; s++) { const sl = box(4, .08, .06, 0x3a6a3a); sl.position.set(9.5, .4 + s * .52, -3.05); g.add(sl) }
  for (let i = -8; i <= 8; i++) { const fp = box(.12, .9, .12, 0x1a3a18); fp.position.set(i * 1.08, .45, -6.8); g.add(fp) }
  const rail = box(18, .1, .1, 0x224420); rail.position.set(0, .88, -6.8); g.add(rail)
  ;[[-6, -6], [6, -6], [0, -6]].forEach(([x, z]) => {
    const pole = cyl(.04, .04, .6, 6, 0x1e3018); pole.position.set(x, .3, z); g.add(pole)
    const gl = new THREE.Mesh(new THREE.SphereGeometry(.14, 8, 8), new THREE.MeshStandardMaterial({ color: 0xccffcc, emissive: 0x06ffa5, emissiveIntensity: 2 }))
    gl.position.set(x, .66, z); g.add(gl)
    const pl = new THREE.PointLight(0x06ffa5, .5, 4); pl.position.set(x, .6, z); g.add(pl); lampLights.push(pl)
  })
  const plz = pln(20, 18, 0x0c1a0c, TEX.concrete); plz.rotation.x = -Math.PI / 2; plz.position.set(2, .06, 0); g.add(plz)
  const lb1 = lbl('CASA & ESCRITÓRIO', '#06ffa5', .85); lb1.position.set(2, 12, 0); g.add(lb1)
  const lb2 = lbl('Sobre Mim', '#88ffcc', .65); lb2.position.set(2, 10.5, 0); g.add(lb2)
  const ring = new THREE.Mesh(new THREE.RingGeometry(12, 12.5, 64), new THREE.MeshBasicMaterial({ color: 0x06ffa5, side: THREE.DoubleSide, transparent: true, opacity: .16 }))
  ring.rotation.x = -Math.PI / 2; ring.position.y = .04; g.add(ring)
  g.userData = { districtId: 'sobre', name: 'Casa & Escritório', desc: D.desc }
  scene.add(g); buildings.push(g); D._group = g
}

export function buildLaboratorio(scene, buildings, TEX, windowMaterials) {
  const D = DISTRICTS.laboratorio; const g = new THREE.Group(); g.position.set(D.pos.x, 0, D.pos.z)
  const main = box(14, 5, 10, 0x150c20, 0xb97fff, .06, TEX.bPurple); main.position.set(0, 2.5, 0); g.add(main)
  for (let i = 0; i < 4; i++) { const s = box(14, .13, 10, 0x291840); s.position.set(0, .7 + i * 1.2, 0); g.add(s) }
  const dome = new THREE.Mesh(new THREE.SphereGeometry(4, 20, 10, 0, Math.PI * 2, 0, Math.PI / 2),
    new THREE.MeshStandardMaterial({ color: 0xb97fff, transparent: true, opacity: .18, roughness: .05, metalness: .9, emissive: 0xb97fff, emissiveIntensity: .1, side: THREE.FrontSide }))
  dome.position.set(0, 5, 0); g.add(dome)
  for (let i = 0; i < 8; i++) {
    const a = i / 8 * Math.PI * 2
    const ribGeo = new THREE.TubeGeometry(new THREE.QuadraticBezierCurve3(new THREE.Vector3(0, 5, 0), new THREE.Vector3(Math.cos(a) * 3, 7, Math.sin(a) * 3), new THREE.Vector3(Math.cos(a) * 4, 5, Math.sin(a) * 4)), 10, .04, 4, false)
    g.add(new THREE.Mesh(ribGeo, new THREE.MeshStandardMaterial({ color: 0x8855cc, emissive: 0xb97fff, emissiveIntensity: .35, metalness: .8 })))
  }
  ;[[-6.5, 5.5], [6.5, 5.5]].forEach(([x, z]) => {
    const ct = cyl(1.3, 1.6, 6.5, 14, 0x110820, 0xb97fff, .04); ct.position.set(x, 3.25, z); g.add(ct)
    const vap = cyl(1.4, .8, 2, 12, 0xb97fff, 0xb97fff, .04)
    vap.material = vap.material.clone(); vap.material.transparent = true; vap.material.opacity = .06
    vap.position.set(x, 8, z); vap.userData.steam = true; vap.userData.phase = x; g.add(vap)
  })
  for (let i = 0; i < 5; i++) {
    const on = Math.random() > .32
    const wn = new THREE.Mesh(new THREE.PlaneGeometry(.9, .7), wMat(on ? '#cc88ff' : '#180d2a', on ? .45 + Math.random() * .6 : .04, windowMaterials))
    wn.position.set(-4.8 + i * 2.4, 2.5, -5.02); g.add(wn)
  }
  ;[[8, 8, 4, 4, 3, TEX.bPurple], [-8, 6, -3, 4, 3, TEX.bPurple], [9, 4, -5, 3, 3, TEX.bGray], [-9, 5, 3, 3, 3, TEX.bPurple]].forEach(([x, h, z, w, d, tx]) => {
    const b = box(w, h, d, 0x110a1e, 0xb97fff, .05, tx); b.position.set(x, h / 2, z); g.add(b)
    const rl = box(w + .2, .14, d + .2, 0x1c0e2e); rl.position.set(x, h + .07, z); g.add(rl)
  })
  const plz = pln(22, 16, 0x0f0820, TEX.concrete); plz.rotation.x = -Math.PI / 2; plz.position.y = .06; g.add(plz)
  const lb1 = lbl('LABORATÓRIO TECH', '#b97fff', .9); lb1.position.set(0, 12, 0); g.add(lb1)
  const lb2 = lbl('Linguagens & Ferramentas', '#ddaaff', .62); lb2.position.set(0, 10.5, 0); g.add(lb2)
  const ring = new THREE.Mesh(new THREE.RingGeometry(11, 11.5, 64), new THREE.MeshBasicMaterial({ color: 0xb97fff, side: THREE.DoubleSide, transparent: true, opacity: .16 }))
  ring.rotation.x = -Math.PI / 2; ring.position.y = .04; g.add(ring)
  g.userData = { districtId: 'laboratorio', name: 'Laboratório Tech', desc: D.desc }
  scene.add(g); buildings.push(g); D._group = g
}

export function buildDashboards(scene, buildings, TEX, windowMaterials) {
  const D = DISTRICTS.dashboards; const g = new THREE.Group(); g.position.set(D.pos.x, 0, D.pos.z)
  for (let i = 0; i < 12; i++) {
    const t = i / 12, w = 7 - t * 3.5
    const fl = box(w, 2.2, w, 0x181000, 0xffd166, .04 + t * .12, TEX.bYellow); fl.position.set(0, i * 2.3 + 1.1, 0); g.add(fl)
  }
  for (let i = 1; i < 12; i++) {
    const w = 7 - (i / 12) * 3.5
    const eg = box(w + .28, .08, w + .28, 0xffd166, 0xffd166, .9); eg.position.set(0, i * 2.3, 0); g.add(eg)
  }
  const topY = 12 * 2.3
  const deck = cyl(5.5, 5.5, .42, 24, 0x1a1400, 0xffd166, .14); deck.position.y = topY; g.add(deck)
  const rail = new THREE.Mesh(new THREE.TorusGeometry(5.5, .07, 6, 48), new THREE.MeshStandardMaterial({ color: 0xffd166, emissive: 0xffd166, emissiveIntensity: .6 }))
  rail.rotation.x = Math.PI / 2; rail.position.y = topY + .56; g.add(rail)
  const spire = cyl(.06, .08, 8, 6, 0xffd166, 0xffd166, 1.2); spire.position.y = topY + 4; g.add(spire)
  const beacon = new THREE.Mesh(new THREE.SphereGeometry(.3, 8, 8), new THREE.MeshStandardMaterial({ color: 0xffd166, emissive: 0xffd166, emissiveIntensity: 6 }))
  beacon.position.y = topY + 8.2; beacon.userData.blink = true; g.add(beacon)
  ;[7, 13, 19].forEach((y, i) => {
    const rm = new THREE.Mesh(new THREE.TorusGeometry(6 + i * 1.2, .07, 6, 48), new THREE.MeshStandardMaterial({ color: 0xffd166, emissive: 0xffd166, emissiveIntensity: .5, transparent: true, opacity: .35 - i * .08 }))
    rm.rotation.x = Math.PI / 2; rm.position.y = y; rm.userData.rotateY = true; rm.userData.speed = .004 - i * .001; g.add(rm)
  })
  ;[[-12, 8, 2, 4.5, 3], [12, 9, -2, 4, 3], [-11, 5, -5, 3.5, 3], [11, 6, 4, 3, 3], [-6, 4, -8, 3, 3], [6, 5, -8, 3, 3]].forEach(([x, h, z, w, d]) => {
    const b = box(w, h, d, 0x151000, 0xffd166, .05, TEX.bYellow); b.position.set(x, h / 2, z); g.add(b)
    const rl = box(w + .2, .14, d + .2, 0x201800); rl.position.set(x, h + .07, z); g.add(rl)
  })
  for (let f = 0; f < 11; f++) for (let c = 0; c < 4; c++) {
    const on = Math.random() > .25
    const wn = new THREE.Mesh(new THREE.PlaneGeometry(.55, .44), wMat(on ? '#ffe090' : '#191200', on ? .5 + Math.random() * .65 : .04, windowMaterials))
    wn.position.set(-2.5 + c * 1.6, 1.3 + f * 2.3, -3.52); g.add(wn)
  }
  const plz = pln(26, 22, 0x121000, TEX.concrete); plz.rotation.x = -Math.PI / 2; plz.position.y = .06; g.add(plz)
  const lb1 = lbl('TORRE DE INSIGHTS', '#ffd166', .95); lb1.position.set(0, topY + 12, 0); g.add(lb1)
  const lb2 = lbl('Dashboards & Análises', '#ffe999', .65); lb2.position.set(0, topY + 10.5, 0); g.add(lb2)
  const ring = new THREE.Mesh(new THREE.RingGeometry(12, 12.5, 64), new THREE.MeshBasicMaterial({ color: 0xffd166, side: THREE.DoubleSide, transparent: true, opacity: .18 }))
  ring.rotation.x = -Math.PI / 2; ring.position.y = .04; g.add(ring)
  g.userData = { districtId: 'dashboards', name: 'Torre de Insights', desc: D.desc }
  scene.add(g); buildings.push(g); D._group = g
}

export function buildContato(scene, buildings, TEX, windowMaterials) {
  const D = DISTRICTS.contato; const g = new THREE.Group(); g.position.set(D.pos.x, 0, D.pos.z)
  const body = box(16, 5.5, 8, 0x280a0a, 0xff6b6b, .06, TEX.bRed); body.position.set(0, 2.75, 0); g.add(body)
  for (let i = 0; i < 4; i++) { const s = box(16, .12, 8, 0x3a0e0e); s.position.set(0, .8 + i * 1.2, 0); g.add(s) }
  const arch = new THREE.Mesh(new THREE.CylinderGeometry(3.8, 3.8, 16, 32, 1, true, 0, Math.PI), new THREE.MeshStandardMaterial({ color: 0x1c0808, roughness: .6, metalness: .3, side: THREE.DoubleSide }))
  arch.rotation.z = Math.PI / 2; arch.rotation.y = Math.PI / 2; arch.position.set(0, 5.5, 0); arch.castShadow = true; g.add(arch)
  for (let i = 0; i < 7; i++) {
    const rib = new THREE.Mesh(new THREE.TorusGeometry(3.8, .08, 6, 16, Math.PI), new THREE.MeshStandardMaterial({ color: 0xff6b6b, emissive: 0xff6b6b, emissiveIntensity: .25, metalness: .8 }))
    rib.position.set(-7.5 + i * 2.5, 5.5, 0); rib.rotation.y = Math.PI / 2; g.add(rib)
  }
  ;[-8, 8].forEach(x => {
    const eg = new THREE.Mesh(new THREE.CircleGeometry(3.8, 24, 0, Math.PI), new THREE.MeshStandardMaterial({ color: 0x1c0808, side: THREE.DoubleSide }))
    eg.rotation.y = x < 0 ? Math.PI / 2 : -Math.PI / 2; eg.position.set(x, 5.5, 0); g.add(eg)
  })
  const tpole = cyl(.3, .4, 4, 10, 0x3a1010); tpole.position.set(8, 2, 0); g.add(tpole)
  const tmid = cyl(.2, .28, 6, 10, 0x4a1414, 0xff6b6b, .06); tmid.position.set(8, 7, 0); g.add(tmid)
  const ttop = cyl(.08, .12, 7, 8, 0x551818, 0xff6b6b, .1); ttop.position.set(8, 13.5, 0); g.add(ttop)
  ;[4, 6, 8, 10, 12].forEach(y => {
    const a = box(3, .1, .1, 0x441111); a.position.set(8, y, 0); g.add(a)
  })
  const beacon = new THREE.Mesh(new THREE.SphereGeometry(.25, 8, 8), new THREE.MeshStandardMaterial({ color: 0xff6b6b, emissive: 0xff6b6b, emissiveIntensity: 6 }))
  beacon.position.set(8, 17.2, 0); beacon.userData.blink = true; g.add(beacon)
  ;[[-4.5, 9.5, -1.8, 1.2, .6], [4, 9, -2, 1.0, .4], [0, 9, 2, .9, .5]].forEach(([x, y, z, r, tilt]) => {
    const d = new THREE.Mesh(new THREE.SphereGeometry(r, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2), new THREE.MeshStandardMaterial({ color: 0x3a1010, roughness: .3, metalness: .8, side: THREE.DoubleSide }))
    d.rotation.x = Math.PI / 2 - tilt; d.position.set(x, y, z); g.add(d)
  })
  const canopy = box(6, .2, 2.5, 0x3a1010, 0xff6b6b, .35); canopy.position.set(0, 5, -5.1); g.add(canopy)
  ;[-2.5, 2.5].forEach(x => { const cp = cyl(.08, .08, 5, 6, 0x441111); cp.position.set(x, 2.5, -5.8); g.add(cp) })
  for (let i = 0; i < 6; i++) {
    const on = Math.random() > .35
    const wn = new THREE.Mesh(new THREE.PlaneGeometry(.9, .7), wMat(on ? '#ff9999' : '#200a0a', on ? .45 + Math.random() * .55 : .04, windowMaterials))
    wn.position.set(-5.5 + i * 2.1, 2.8, -4.02); g.add(wn)
  }
  ;[6, 9, 12].forEach((r, i) => {
    const pr = new THREE.Mesh(new THREE.RingGeometry(r, r + .18, 64), new THREE.MeshBasicMaterial({ color: 0xff6b6b, side: THREE.DoubleSide, transparent: true, opacity: .13 - i * .035 }))
    pr.rotation.x = -Math.PI / 2; pr.position.y = .04 + i * .01; pr.userData.pulseRing = true; pr.userData.pulseOffset = i * .35; g.add(pr)
  })
  const plz = pln(22, 14, 0x180808, TEX.concrete); plz.rotation.x = -Math.PI / 2; plz.position.y = .06; g.add(plz)
  const lb1 = lbl('ESTAÇÃO DE CONTATO', '#ff6b6b', .85); lb1.position.set(0, 20, 0); g.add(lb1)
  const lb2 = lbl('LinkedIn · GitHub · Currículo', '#ffaaaa', .62); lb2.position.set(0, 18.5, 0); g.add(lb2)
  const ring = new THREE.Mesh(new THREE.RingGeometry(11, 11.5, 64), new THREE.MeshBasicMaterial({ color: 0xff6b6b, side: THREE.DoubleSide, transparent: true, opacity: .18 }))
  ring.rotation.x = -Math.PI / 2; ring.position.y = .04; g.add(ring)
  g.userData = { districtId: 'contato', name: 'Estação de Contato', desc: D.desc }
  scene.add(g); buildings.push(g); D._group = g
}

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
    const b = box(w, h, d, 0x0c1828, 0, 0, TEX[tk]); b.position.set(x, h / 2, z); scene.add(b)
    const rf = box(w + .2, .14, d + .2, 0x0e1a28); rf.position.set(x, h + .07, z); scene.add(rf)
    if (Math.random() > .5) { const tank = cyl(.5, .5, .8, 8, 0x1a2030); tank.position.set(x, h + .55, z + (Math.random() - .5) * d * .4); scene.add(tank) }
    const nw = Math.max(1, Math.floor(h / 2.5))
    for (let i = 0; i < nw; i++) {
      if (Math.random() > .42) {
        const on = Math.random() > .32
        const wn = new THREE.Mesh(new THREE.PlaneGeometry(.5, .38), wMat(on ? '#7799bb' : '#0a1520', on ? .28 + Math.random() * .45 : .02, windowMaterials))
        wn.position.set(x + (Math.random() - .5) * w * .55, 1.2 + i * 2.1, z - d / 2 - .01); scene.add(wn)
      }
    }
  })
}

export function buildVegetation(scene) {
  ;[
    [-6, -4], [-6, -10], [-6, -18], [-6, -28], [-6, -38], [-6, -48],
    [6, -4], [6, -10], [6, -18], [6, -28], [6, -38], [6, -48],
    [-11, 6], [11, 6], [-20, 6], [20, 6], [-30, 6], [30, 6], [-40, 6], [40, 6],
    [-28, -6], [-28, -14], [-28, -20], [28, -6], [28, -14], [28, -20],
    [-4, 10], [4, 10], [-4, 18], [4, 18],
  ].forEach(([x, z], i) => scene.add(makeTree(x, z, 1, i % 2)))
  ;[
    [-17, -9], [-17, -13], [-15, -8], [-19, -11], [-13, -12],
    [17, -9], [17, -13], [15, -8], [19, -11], [13, -12],
    [-17, 6], [-17, 9], [17, 6], [17, 9],
    [-9, -34], [9, -34], [-7, -36], [7, -36],
    [-11, 17], [-9, 20], [11, 17], [9, 20],
    [-5, -5], [5, -5], [-5, -15], [5, -15],
  ].forEach(([x, z], i) => scene.add(makeTree(x, z, .9 + Math.random() * .2, i % 2)))
  ;[
    [-32, -20], [-24, -20], [-32, -24], [-24, -24], [32, -20], [24, -20], [32, -24], [24, -24],
    [-8, -50], [8, -50], [0, -50], [-4, 22], [4, 22], [-4, 28], [4, 28], [-10, 5], [10, 5], [-8, -3], [8, -3], [0, -3],
  ].forEach(([x, z]) => scene.add(makeBush(x, z, .8)))
  const fColors = [0xff4488, 0xffaa00, 0xff6622, 0xcc44ff, 0xff88aa]
  ;[[0, -6, 16, 4], [-28, -22, 6, 6], [28, -22, 6, 6], [0, -44, 12, 6], [0, 26, 12, 4]].forEach(([cx, cz, fw, fd]) => {
    const bed = new THREE.Mesh(new THREE.PlaneGeometry(fw, fd), new THREE.MeshStandardMaterial({ color: 0x0a1208, roughness: .95 }))
    bed.rotation.x = -Math.PI / 2; bed.position.set(cx, .04, cz); scene.add(bed)
    for (let f = 0; f < 20; f++) {
      const fc = fColors[f % fColors.length]
      const st = cyl(.03, .03, .28 + Math.random() * .18, 4, 0x0a1e08); st.position.set(cx + (Math.random() - .5) * fw * .8, .14, cz + (Math.random() - .5) * fd * .8); scene.add(st)
      const pt = new THREE.Mesh(new THREE.SphereGeometry(.14, 6, 5), new THREE.MeshStandardMaterial({ color: fc, emissive: fc, emissiveIntensity: .28 }))
      pt.position.set(st.position.x, st.position.y + .32, st.position.z); scene.add(pt)
    }
  })
}

export function buildStars(scene) {
  const geo = new THREE.BufferGeometry(); const pos = []
  for (let i = 0; i < 2500; i++) {
    const t = Math.random() * Math.PI * 2, p = Math.random() * Math.PI * .45, r = 180 + Math.random() * 60
    pos.push(Math.cos(t) * Math.sin(p) * r, Math.cos(p) * r * .5 + 30, Math.sin(t) * Math.sin(p) * r)
  }
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3))
  const stars = new THREE.Points(geo, new THREE.PointsMaterial({ color: 0xaabbff, size: .28, sizeAttenuation: true, transparent: true, opacity: .8 }))
  stars.userData.starField = true; scene.add(stars)
}
