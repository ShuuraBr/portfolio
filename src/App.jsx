import { useEffect, useRef, useState, useCallback } from 'react'
import * as THREE from 'three'
import { DISTRICTS, FLY_TARGETS } from './cityData'
import {
  buildTextures, buildGround, buildRoads, buildSidewalks,
  buildLamps, buildFountains, buildFiller, buildVegetation, buildStars,
  buildProjetos, buildSobre, buildLaboratorio, buildDashboards, buildContato,
} from './sceneBuilder'

// ─── DAY/NIGHT HELPERS ───────────────────────────────────────────────────────
function getDayFraction() {
  const now = new Date()
  return (now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds()) / 86400
}

function getTimeIcon(sunH) {
  if (sunH < -.1) return '🌙'
  if (sunH < .18) return '🌅'
  if (sunH > .65) return '☀️'
  return '⛅'
}

function getCycleLabel(sunH) {
  if (sunH < -.1) return 'Noite'
  if (sunH < .2) return 'Entardecer'
  return 'Dia'
}

function getTimeStr() {
  const now = new Date()
  return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
}

// ─── MINIMAP ─────────────────────────────────────────────────────────────────
function Minimap({ cam, activeId }) {
  const mmRef = useRef(null)

  useEffect(() => {
    const canvas = mmRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    ctx.clearRect(0, 0, 116, 96)
    ctx.fillStyle = 'rgba(8,12,30,.92)'
    ctx.fillRect(0, 0, 116, 96)

    const sc = 1.9, ox = 58, oz = 48

    ctx.strokeStyle = '#0a1825'
    ctx.lineWidth = 3
    ctx.beginPath(); ctx.moveTo(ox, 0); ctx.lineTo(ox, 96); ctx.stroke()
    ctx.beginPath(); ctx.moveTo(0, oz); ctx.lineTo(116, oz); ctx.stroke()

    Object.values(DISTRICTS).forEach(d => {
      const mx = ox + d.pos.x * sc, mz = oz + d.pos.z * sc
      ctx.shadowColor = d.color; ctx.shadowBlur = d.id === activeId ? 8 : 3
      ctx.fillStyle = d.color
      ctx.beginPath(); ctx.arc(mx, mz, d.id === activeId ? 5 : 3.5, 0, Math.PI * 2); ctx.fill()
      ctx.shadowBlur = 0
    })

    const cx = ox + cam.tx * sc, cz = oz + cam.tz * sc
    ctx.fillStyle = 'rgba(126,200,240,.9)'
    ctx.beginPath(); ctx.arc(cx, cz, 3, 0, Math.PI * 2); ctx.fill()

    const cone = 14
    const a1 = cam.theta - .45, a2 = cam.theta + .45
    ctx.fillStyle = 'rgba(126,200,240,.08)'
    ctx.beginPath(); ctx.moveTo(cx, cz)
    ctx.lineTo(cx + Math.sin(a1) * cone, cz + Math.cos(a1) * cone)
    ctx.lineTo(cx + Math.sin(a2) * cone, cz + Math.cos(a2) * cone)
    ctx.closePath(); ctx.fill()
  })

  return (
    <div id="minimap-wrap">
      <div id="minimap-label">Mapa da Cidade</div>
      <canvas id="minimap-canvas" ref={mmRef} width={116} height={96} />
    </div>
  )
}

// ─── SIDE PANEL ──────────────────────────────────────────────────────────────
function SidePanel({ activeId, onClose, onFly }) {
  const d = DISTRICTS[activeId]
  if (!d) return null
  const visible = !!activeId

  return (
    <div id="side-panel" className={visible ? '' : 'hidden'}>
      <div className="panel-header">
        <div className="panel-district-tag" style={{ background: d.tagBg, color: d.color }}>{d.tag}</div>
        <div className="panel-title" style={{ color: d.color }}>{d.name}</div>
        <div className="panel-desc">{d.desc}</div>
      </div>
      <div className="panel-items">
        {d.links
          ? d.links.map(item => (
              <a key={item.title} className="panel-link" href={item.href}>
                <span className="panel-link-icon">{item.icon}</span>
                <div className="panel-link-info">
                  <span className="panel-link-title">{item.title}</span>
                  <span className="panel-link-url">{item.url}</span>
                </div>
              </a>
            ))
          : d.items.map(item => (
              <div key={item.title} className="panel-item" style={{ borderLeftColor: d.color }}>
                <div className="item-title"><span className="item-icon">{item.icon}</span>{item.title}</div>
                <div className="item-sub">{item.sub}</div>
              </div>
            ))
        }
      </div>
    </div>
  )
}

// ─── MAIN APP ────────────────────────────────────────────────────────────────
export default function App() {
  const canvasRef = useRef(null)
  const sceneRef = useRef(null) // holds { scene, camera, renderer, ... }

  const [activeId, setActiveId] = useState(null)
  const [statPos, setStatPos] = useState('0, 0')
  const [statCycle, setStatCycle] = useState('Dia')
  const [timeIcon, setTimeIcon] = useState('⛅')
  const [timeLabel, setTimeLabel] = useState('--:--')
  const [tooltip, setTooltip] = useState({ visible: false, name: '', desc: '', x: 0, y: 0 })
  const [btnPressed, setBtnPressed] = useState({})
  const [loadPct, setLoadPct] = useState(0)
  const [loaded, setLoaded] = useState(false)
  const [flashText, setFlashText] = useState({ text: '', color: '#fff' })

  // Camera state kept as ref to avoid re-renders on every frame
  const camRef = useRef({ theta: .3, phi: .50, radius: 45, tx: 0, ty: 0, tz: 0 })
  const keysRef = useRef({})
  const btnRef = useRef({})
  const flyingRef = useRef(false)

  const flyToDistrict = useCallback((id) => {
    const t = FLY_TARGETS[id]
    if (!t) return
    flyingRef.current = true
    const cam = camRef.current
    const s = { tx: cam.tx, tz: cam.tz, r: cam.radius, phi: cam.phi }
    const dur = 1000, start = performance.now()
    const tick = (now) => {
      const p = Math.min((now - start) / dur, 1)
      const e = p < .5 ? 2 * p * p : -1 + (4 - 2 * p) * p
      cam.tx = s.tx + (t.tx - s.tx) * e
      cam.tz = s.tz + (t.tz - s.tz) * e
      cam.radius = s.r + (t.radius - s.r) * e
      cam.phi = s.phi + (t.phi - s.phi) * e
      if (p < 1) requestAnimationFrame(tick)
      else flyingRef.current = false
    }
    requestAnimationFrame(tick)
    setActiveId(id)
    const d = DISTRICTS[id]
    setFlashText({ text: d.name, color: d.color })
    setTimeout(() => setFlashText({ text: '', color: '#fff' }), 1200)
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    // ── SCENE SETUP ──────────────────────────────────────────────────────────
    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x050810)
    scene.fog = new THREE.FogExp2(0x050810, .008)

    const camera = new THREE.PerspectiveCamera(55, innerWidth / innerHeight, .1, 500)
    camera.position.set(0, 22, 42)
    camera.lookAt(0, 0, 0)

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' })
    renderer.setSize(innerWidth, innerHeight)
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2))
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.0

    // ── LIGHTS ───────────────────────────────────────────────────────────────
    const hemisphereLight = new THREE.HemisphereLight(0x4488cc, 0x0a1808, .6); scene.add(hemisphereLight)
    const ambientLight = new THREE.AmbientLight(0xffffff, .1); scene.add(ambientLight)
    const sunLight = new THREE.DirectionalLight(0xfff8e8, 1.5)
    sunLight.castShadow = true
    sunLight.shadow.mapSize.set(2048, 2048)
    sunLight.shadow.camera.left = -80; sunLight.shadow.camera.right = 80
    sunLight.shadow.camera.top = 80; sunLight.shadow.camera.bottom = -80
    sunLight.shadow.camera.far = 200; sunLight.shadow.bias = -.001
    scene.add(sunLight)
    const moonLight = new THREE.DirectionalLight(0x3344aa, .0); scene.add(moonLight)
    Object.values(DISTRICTS).forEach(d => {
      const pt = new THREE.PointLight(new THREE.Color(d.color), 1.8, 35)
      pt.position.set(d.pos.x, 5, d.pos.z); scene.add(pt); d._light = pt
    })

    // ── BUILD SCENE ──────────────────────────────────────────────────────────
    const lampLights = []
    const windowMaterials = []
    const buildings = []
    const TEX = buildTextures()

    buildGround(scene, TEX)
    buildRoads(scene, TEX)
    buildSidewalks(scene, TEX)
    buildLamps(scene, lampLights)
    buildFountains(scene, lampLights)
    buildProjetos(scene, buildings, TEX, windowMaterials)
    buildSobre(scene, buildings, TEX, windowMaterials, lampLights)
    buildLaboratorio(scene, buildings, TEX, windowMaterials)
    buildDashboards(scene, buildings, TEX, windowMaterials)
    buildContato(scene, buildings, TEX, windowMaterials)
    buildFiller(scene, windowMaterials, TEX)
    buildVegetation(scene)
    buildStars(scene)

    // ── DAY/NIGHT ────────────────────────────────────────────────────────────
    function updateDayNight() {
      const frac = getDayFraction()
      const ang = (frac - .25) * Math.PI * 2
      const sunH = Math.sin(ang)
      const t = Math.max(0, sunH)
      const isNight = sunH < -.1
      const isDusk = !isNight && sunH < .2

      let sr, sg, sb
      if (sunH > .4) { sr = .38 * t; sg = .55 * t; sb = .9 * t }
      else if (sunH > 0) { sr = .65 * t + .02; sg = .45 * t + .04; sb = .35 * t + .06 }
      else if (sunH > -.3) { sr = .07; sg = .05; sb = .11 }
      else { sr = .018; sg = .022; sb = .06 }
      scene.background.setRGB(sr, sg, sb)
      scene.fog.color.setRGB(sr * .55, sg * .55, sb * .55)

      const sx = -Math.cos(ang) * 80, sy = Math.sin(ang) * 80, sz = 30
      sunLight.position.set(sx, sy, sz)
      moonLight.position.set(-sx, -Math.abs(sy) * .4 - 10, -sz)

      if (sunH > .2) { sunLight.intensity = 1.4 * t; sunLight.color.setRGB(1, .97, .88) }
      else if (sunH > 0) { sunLight.intensity = .75; sunLight.color.setRGB(1, .68, .3) }
      else sunLight.intensity = 0

      moonLight.intensity = isNight ? .45 : .0
      ambientLight.intensity = isNight ? .07 : .16 + t * .22
      ambientLight.color.setRGB(isNight ? .28 : .55 + t * .4, isNight ? .32 : .5 + t * .44, isNight ? .58 : .65 + t * .3)
      hemisphereLight.intensity = isNight ? .07 : .35 + t * .48
      hemisphereLight.color.setRGB(isNight ? .14 : .28 + t * .48, isNight ? .18 : .4 + t * .42, isNight ? .5 : .65 + t * .28)

      const lampsOn = sunH < .18
      lampLights.forEach(l => l.intensity = lampsOn ? 1.4 : .0)
      windowMaterials.forEach(m => {
        if (!m._bei) m._bei = m.emissiveIntensity
        m.emissiveIntensity = lampsOn ? m._bei : m._bei * .15
      })

      scene.traverse(o => {
        if (o.userData.starField && o.material) {
          o.material.opacity = isNight ? .82 : sunH > .45 ? 0 : Math.max(0, .25 * (1 - sunH * 5))
        }
      })

      renderer.toneMappingExposure = isNight ? .58 : isDusk ? .82 : .98 + t * .08
      scene.fog.density = isNight ? .013 : .007

      setStatCycle(getCycleLabel(sunH))
      setTimeIcon(getTimeIcon(sunH))
      setTimeLabel(getTimeStr())
    }

    updateDayNight()

    // ── RAYCASTER ────────────────────────────────────────────────────────────
    const raycaster = new THREE.Raycaster()
    const mouse = new THREE.Vector2()

    function handleMouseMove(e) {
      mouse.x = (e.clientX / innerWidth) * 2 - 1
      mouse.y = -(e.clientY / innerHeight) * 2 + 1
      raycaster.setFromCamera(mouse, camera)
      const hits = raycaster.intersectObjects(buildings, true)
      if (hits.length) {
        let o = hits[0].object
        while (o.parent && !o.userData.districtId) o = o.parent
        if (o.userData.districtId) {
          setTooltip({ visible: true, name: o.userData.name, desc: o.userData.desc, x: e.clientX + 16, y: e.clientY - 20 })
          canvas.style.cursor = 'pointer'
          return
        }
      }
      setTooltip(t => ({ ...t, visible: false }))
      canvas.style.cursor = 'default'
    }

    function handleClick(e) {
      mouse.x = (e.clientX / innerWidth) * 2 - 1
      mouse.y = -(e.clientY / innerHeight) * 2 + 1
      raycaster.setFromCamera(mouse, camera)
      const hits = raycaster.intersectObjects(buildings, true)
      if (hits.length) {
        let o = hits[0].object
        while (o.parent && !o.userData.districtId) o = o.parent
        if (o.userData.districtId) flyToDistrict(o.userData.districtId)
      }
    }

    // ── ORBIT DRAG ───────────────────────────────────────────────────────────
    let drag = false, dl = { x: 0, y: 0 }
    function onMouseDown(e) { if (e.button === 0) { drag = true; dl = { x: e.clientX, y: e.clientY } } }
    function onMouseUp() { drag = false }
    function onMouseDrag(e) {
      if (!drag) return
      const cam = camRef.current
      cam.theta -= (e.clientX - dl.x) * .005
      cam.phi = Math.max(.12, Math.min(1.15, cam.phi - (e.clientY - dl.y) * .004))
      dl = { x: e.clientX, y: e.clientY }
    }
    function onWheel(e) {
      const cam = camRef.current
      cam.radius = Math.max(12, Math.min(90, cam.radius + e.deltaY * .06))
    }

    // Touch
    let lt = null, pd = null
    function onTouchStart(e) {
      if (e.touches.length === 1) lt = { x: e.touches[0].clientX, y: e.touches[0].clientY }
      if (e.touches.length === 2) { const dx = e.touches[0].clientX - e.touches[1].clientX, dy = e.touches[0].clientY - e.touches[1].clientY; pd = Math.hypot(dx, dy) }
    }
    function onTouchMove(e) {
      const cam = camRef.current
      if (e.touches.length === 1 && lt) {
        cam.theta -= (e.touches[0].clientX - lt.x) * .006
        cam.phi = Math.max(.12, Math.min(1.15, cam.phi - (e.touches[0].clientY - lt.y) * .005))
        lt = { x: e.touches[0].clientX, y: e.touches[0].clientY }
      }
      if (e.touches.length === 2 && pd) {
        const dx = e.touches[0].clientX - e.touches[1].clientX, dy = e.touches[0].clientY - e.touches[1].clientY
        const d = Math.hypot(dx, dy)
        cam.radius = Math.max(12, Math.min(90, cam.radius - (d - pd) * .1))
        pd = d
      }
    }

    canvas.addEventListener('mousedown', onMouseDown)
    window.addEventListener('mouseup', onMouseUp)
    window.addEventListener('mousemove', onMouseDrag)
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('click', handleClick)
    window.addEventListener('wheel', onWheel, { passive: true })
    canvas.addEventListener('touchstart', onTouchStart, { passive: true })
    canvas.addEventListener('touchmove', onTouchMove, { passive: true })
    canvas.addEventListener('touchend', () => { lt = null; pd = null })

    // Keys
    window.addEventListener('keydown', e => { keysRef.current[e.key.toLowerCase()] = true })
    window.addEventListener('keyup', e => { keysRef.current[e.key.toLowerCase()] = false })

    // Resize
    function onResize() {
      camera.aspect = innerWidth / innerHeight
      camera.updateProjectionMatrix()
      renderer.setSize(innerWidth, innerHeight)
    }
    window.addEventListener('resize', onResize)

    // ── ANIMATE LOOP ─────────────────────────────────────────────────────────
    const clock = new THREE.Clock()
    let time = 0, lastDayUpdate = -99
    let rafId

    function animate() {
      rafId = requestAnimationFrame(animate)
      const dt = clock.getDelta(); time += dt

      // Camera movement
      if (!flyingRef.current) {
        const cam = camRef.current
        const spd = .24, fx = Math.sin(cam.theta), fz = Math.cos(cam.theta)
        const rx = Math.cos(cam.theta), rz = -Math.sin(cam.theta)
        const k = keysRef.current, b = btnRef.current
        if (k['w'] || k['arrowup'] || b['fwd']) { cam.tx -= fx * spd; cam.tz -= fz * spd }
        if (k['s'] || k['arrowdown'] || b['back']) { cam.tx += fx * spd; cam.tz += fz * spd }
        if (k['a'] || k['arrowleft'] || b['left']) { cam.tx -= rx * spd; cam.tz -= rz * spd }
        if (k['d'] || k['arrowright'] || b['right']) { cam.tx += rx * spd; cam.tz += rz * spd }
        cam.tx = Math.max(-100, Math.min(100, cam.tx))
        cam.tz = Math.max(-100, Math.min(100, cam.tz))
        const cx = cam.tx + cam.radius * Math.sin(cam.theta) * Math.cos(cam.phi)
        const cy = Math.max(5, cam.radius * Math.sin(cam.phi) + 4)
        const cz = cam.tz + cam.radius * Math.cos(cam.theta) * Math.cos(cam.phi)
        camera.position.set(cx, cy, cz)
        camera.lookAt(cam.tx, cam.ty + 1, cam.tz)
        setStatPos(`${cam.tx.toFixed(0)}, ${cam.tz.toFixed(0)}`)
      }

      // Day/night every 10s
      if (time - lastDayUpdate > 10) { lastDayUpdate = time; updateDayNight() }

      // Object animations
      scene.traverse(obj => {
        if (obj.userData.blink && obj.material) obj.material.emissiveIntensity = 4 + 3 * Math.sin(time * 2.5)
        if (obj.userData.rotateY) obj.rotation.y += obj.userData.speed || .004
        if (obj.userData.smoke && obj.material) {
          obj.position.y += .0015
          obj.material.opacity = Math.max(.04, .22 + .08 * Math.sin(time * .4 + obj.userData.phase))
          if (obj.userData.startY && obj.position.y > obj.userData.startY + 1.8) obj.position.y = obj.userData.startY
        }
        if (obj.userData.water && obj.material) obj.material.emissiveIntensity = .3 + .12 * Math.sin(time * 1.8)
        if (obj.userData.spray) {
          const a = obj.userData.ang, ph = obj.userData.phase
          const r = .5 + .28 * Math.sin(time * 2.2 + ph)
          obj.position.x = Math.cos(a) * r; obj.position.z = Math.sin(a) * r
          obj.position.y = 2.1 + .38 * Math.abs(Math.sin(time * 3.2 + ph))
        }
        if (obj.userData.steam && obj.material && obj.material.opacity !== undefined) {
          obj.scale.y = 1 + .09 * Math.sin(time * .75 + obj.userData.phase)
          obj.material.opacity = .05 + .04 * Math.abs(Math.sin(time * .55 + obj.userData.phase))
        }
        if (obj.userData.pulseRing && obj.material) {
          obj.material.opacity = Math.max(.02, .11 + Math.sin(time * 2 + obj.userData.pulseOffset) * .065)
        }
      })

      Object.values(DISTRICTS).forEach(d => {
        if (d._light) d._light.intensity = 1.5 + Math.sin(time * 1.5 + d.pos.x * .1) * .5
      })

      renderer.render(scene, camera)
    }
    animate()

    // ── LOADING ──────────────────────────────────────────────────────────────
    let p = 0
    const iv = setInterval(() => {
      p = Math.min(p + Math.random() * 9 + 3, 100)
      setLoadPct(Math.round(p))
      if (p >= 100) {
        clearInterval(iv)
        setTimeout(() => {
          setLoaded(true)
          flyToDistrict('projetos')
        }, 400)
      }
    }, 55)

    return () => {
      cancelAnimationFrame(rafId)
      clearInterval(iv)
      renderer.dispose()
      canvas.removeEventListener('mousedown', onMouseDown)
      window.removeEventListener('mouseup', onMouseUp)
      window.removeEventListener('mousemove', onMouseDrag)
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('click', handleClick)
      window.removeEventListener('wheel', onWheel)
      window.removeEventListener('resize', onResize)
      window.removeEventListener('keydown', () => {})
      window.removeEventListener('keyup', () => {})
    }
  }, [flyToDistrict])

  // ── BUTTON HANDLERS ──────────────────────────────────────────────────────
  const bindBtn = (key) => ({
    onPointerDown: (e) => { e.preventDefault(); btnRef.current[key] = true; setBtnPressed(p => ({ ...p, [key]: true })) },
    onPointerUp: () => { btnRef.current[key] = false; setBtnPressed(p => ({ ...p, [key]: false })) },
    onPointerLeave: () => { btnRef.current[key] = false; setBtnPressed(p => ({ ...p, [key]: false })) },
  })

  const districtList = Object.values(DISTRICTS)

  return (
    <>
      {/* Loading */}
      <div id="loading" className={loaded ? 'fade' : ''}>
        <div className="load-title">DATA CITY</div>
        <div className="load-sub">CONSTRUINDO METRÓPOLE · · ·</div>
        <div className="load-bar-wrap"><div className="load-bar" style={{ width: `${loadPct}%` }} /></div>
        <div className="load-pct">{loadPct}%</div>
      </div>

      {/* Canvas */}
      <div id="canvas-wrap">
        <canvas ref={canvasRef} />
      </div>

      {/* Topbar */}
      <div id="topbar">
        <div className="brand">
          <span className="brand-label">Portfólio Interativo</span>
          <span className="brand-title">Data City 3D</span>
        </div>
        <div className="stat-block">
          <span className="stat-label">Distrito</span>
          <span className="stat-val">{activeId ? DISTRICTS[activeId]?.subtitle : '—'}</span>
        </div>
        <div className="stat-block">
          <span className="stat-label">Posição</span>
          <span className="stat-val">{statPos}</span>
        </div>
        <div className="stat-block">
          <span className="stat-label">Ciclo</span>
          <span className="stat-val">{statCycle}</span>
        </div>
        <div id="nav-tabs">
          {districtList.map(d => (
            <button key={d.id} className={`nav-tab${activeId === d.id ? ' active' : ''}`} onClick={() => flyToDistrict(d.id)}>
              {d.id === 'projetos' ? '🏙' : d.id === 'sobre' ? '🏠' : d.id === 'laboratorio' ? '🔬' : d.id === 'dashboards' ? '📊' : '📡'} {d.subtitle}
            </button>
          ))}
        </div>
        <div id="time-badge">
          <span id="time-icon">{timeIcon}</span>
          <span id="time-label">{timeLabel}</span>
        </div>
      </div>

      {/* Controls */}
      <div id="controls">
        <div className="ctrl-grid">
          <div />
          <button className={`ctrl-btn${btnPressed.fwd ? ' pressed' : ''}`} {...bindBtn('fwd')}>▲</button>
          <div />
          <button className={`ctrl-btn${btnPressed.left ? ' pressed' : ''}`} {...bindBtn('left')}>◀</button>
          <button className="ctrl-btn center" onClick={() => flyToDistrict(activeId || 'projetos')}>⊙</button>
          <button className={`ctrl-btn${btnPressed.right ? ' pressed' : ''}`} {...bindBtn('right')}>▶</button>
          <div />
          <button className={`ctrl-btn${btnPressed.back ? ' pressed' : ''}`} {...bindBtn('back')}>▼</button>
          <div />
        </div>
        <div className="ctrl-hint">Arraste · Scroll=zoom</div>
      </div>

      {/* Minimap */}
      <Minimap cam={camRef.current} activeId={activeId} />

      {/* Side Panel */}
      <SidePanel activeId={activeId} onFly={flyToDistrict} />

      {/* Tooltip */}
      <div id="tooltip" className={tooltip.visible ? 'visible' : ''} style={{ left: tooltip.x, top: tooltip.y }}>
        <div className="tt-name">{tooltip.name}</div>
        <div className="tt-desc">{tooltip.desc}</div>
      </div>

      {/* District flash */}
      <div id="district-flash" style={{ opacity: flashText.text ? 1 : 0, color: flashText.color }}>
        {flashText.text}
      </div>

      {/* Bottom nav */}
      <div id="bottom-nav">
        {districtList.map(d => (
          <button key={d.id} className={`bnav-btn${activeId === d.id ? ' active' : ''}`} onClick={() => flyToDistrict(d.id)}>
            <span>{d.id === 'projetos' ? '🏙' : d.id === 'sobre' ? '🏠' : d.id === 'laboratorio' ? '🔬' : d.id === 'dashboards' ? '📊' : '📡'}</span>
            {d.subtitle}
          </button>
        ))}
      </div>
    </>
  )
}
