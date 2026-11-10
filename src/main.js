import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { Compass, RotateCcw, Layers3, MapPin, Info, PanelLeftClose, PanelLeftOpen, Sun, Moon, MousePointer2, ExternalLink } from 'lucide';
import { locations, locationById } from './locations.js';
import './style.css';

const base = import.meta.env.BASE_URL;
const asset = (path) => `${base}${path}`;
const icons = { Compass, RotateCcw, Layers3, MapPin, Info, PanelLeftClose, PanelLeftOpen, Sun, Moon, MousePointer2, ExternalLink };
// The vanilla `lucide` package exports icon *data tuples*, not objects with toSvg().
// Build native SVG nodes from its trusted definitions (no HTML-string injection).
const svgNode = ([tag, attributes, children = []]) => {
  const element = document.createElementNS('http://www.w3.org/2000/svg', tag);
  for (const [key, value] of Object.entries(attributes)) element.setAttribute(key, String(value));
  for (const child of children) element.appendChild(svgNode(child));
  return element;
};
const icon = (name, size = 18) => {
  const definition = icons[name];
  if (!definition) return '';
  const element = svgNode(definition);
  element.setAttribute('width', String(size));
  element.setAttribute('height', String(size));
  element.setAttribute('stroke-width', '1.7');
  element.setAttribute('aria-hidden', 'true');
  return element.outerHTML;
};
const app = document.querySelector('#app');
app.innerHTML = `
  <main class="shell">
    <header class="topbar">
      <a class="brand" href="#overview" aria-label="返回校园全景">
        <span class="brand-mark">${icon('Layers3', 24)}</span>
        <span class="brand-text"><strong>Campus Atlas</strong><small>校园数字孪生</small></span>
      </a>
      <div class="header-divider" aria-hidden="true"></div>
      <div class="header-label">总平面三维漫游 <span class="header-label-secondary">/ 基于概念方案复原</span></div>
      <div class="header-actions">
        <span class="live-status"><span></span>三维场景</span>
        <button type="button" class="icon-button theme-toggle" id="theme-toggle" aria-label="切换昼夜模式" title="切换昼夜模式">${icon('Moon', 19)}</button>
      </div>
    </header>
    <div class="workspace">
      <aside class="sidebar" id="sidebar">
        <div class="sidebar-inner">
          <div class="sidebar-top"><span>校园导览</span><button class="sidebar-collapse icon-button" id="sidebar-close" aria-label="收起导航栏">${icon('PanelLeftClose', 19)}</button></div>
          <div class="site-intro"><div class="site-intro-kicker">一座校园，一张立体地图</div><h1>在校园里<br>漫游。</h1><p>从图纸走进空间。拖动视角，探索建筑与水岸之间的联系。</p></div>
          <div class="sidebar-heading"><span>探索地点</span><span class="count">12 处</span></div>
          <nav class="location-list" aria-label="校园地点">
            ${locations.map((p) => `<button type="button" class="place" data-place="${p.id}" aria-label="前往${p.title}"><span class="place-number">${p.number}</span><span class="place-label">${p.title}<small>${p.en}</small></span><span class="place-dot" aria-hidden="true"></span></button>`).join('')}
          </nav>
          <div class="sidebar-footer"><span class="footer-dot"></span><span>示意级场景 · 非测绘数据</span></div>
        </div>
      </aside>
      <section class="viewer" aria-label="交互式三维校园场景">
        <div id="three-stage" class="three-stage"></div>
        <div class="viewer-gradient" aria-hidden="true"></div>
        <div class="viewer-top"><button class="icon-button floating sidebar-open" id="sidebar-open" aria-label="展开导航栏">${icon('PanelLeftOpen', 18)}</button><div class="scene-badge"><span class="scene-badge-icon">${icon('Compass', 15)}</span><span>校园总览 <span class="badge-divider">/</span> 交互式三维</span></div></div>
        <div class="north-indicator" aria-label="北方向">N<span>↑</span></div>
        <div class="loading" id="loading" role="status"><div class="loading-mark">${icon('Layers3', 34)}</div><div class="loading-title">正在绘制校园</div><div class="loading-subtitle" id="loading-status">准备三维资源…</div><div class="loading-track"><div id="loading-fill"></div></div></div>
        <div class="viewer-bottom">
          <div class="viewer-caption"><span class="caption-overline">鸟瞰视角</span><strong id="view-label">从湖畔看校园</strong><span id="view-subtitle">拖动旋转 · 滚轮缩放 · 右键平移</span></div>
          <div class="tools"><button class="tool" id="reset-view" title="返回全景" aria-label="返回全景">${icon('RotateCcw', 18)}<span>重置视角</span></button><button class="tool" id="top-view" title="切换俯视" aria-label="切换俯视">${icon('Layers3', 18)}<span>俯视图</span></button></div>
        </div>
        <div class="details" id="details" hidden><div class="details-head"><span class="details-index" id="details-index">01</span><button class="icon-button" id="details-close" aria-label="关闭地点说明">×</button></div><h2 id="details-title"></h2><p id="details-copy"></p><span class="details-foot">点击空白区域或按 Esc 返回</span></div>
        <div class="hint" id="hint">${icon('MousePointer2', 14)} <span>点击模型可快速查看地点</span></div>
      </section>
      <aside class="info-rail"><div class="info-rail-head">关于场景 ${icon('Info', 16)}</div><div class="info-block"><small>来源</small><strong>校园总平面图</strong><span>依据平面布局构建三维模型</span></div><div class="info-block"><small>内容</small><strong>12 个标注地点</strong><span>建筑 · 湖泊 · 石拱桥 · 绿地</span></div><div class="info-rail-note">基于设计图的概念级可视化，建筑高度与细部为推定，不用于测绘或施工。</div><a href="${asset('campus_masterplan.jpg')}" target="_blank" rel="noopener noreferrer" class="source-link">查看原始总平面图 ${icon('ExternalLink', 14)}</a></aside>
    </div>
  </main>`;

const stage = document.querySelector('#three-stage');
const scene = new THREE.Scene();
scene.background = new THREE.Color('#dce9ec');
scene.fog = new THREE.Fog('#dce9ec', 340, 750);
const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 1400);
const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.6;
renderer.shadowMap.enabled = false;
stage.append(renderer.domElement);
const hemi = new THREE.HemisphereLight(0xd6edff, 0x7a8473, 3.3);
scene.add(hemi);
const sun = new THREE.DirectionalLight(0xfff0d7, 3.0);
sun.position.set(-95, 210, 125);scene.add(sun);
const fill = new THREE.DirectionalLight(0xc5e7fb, 1.35);
fill.position.set(90, 85, -120);scene.add(fill);

// Blender Z-up is converted by glTF to Three.js Y-up: plan Y becomes negative world Z.
const xyToWorld = ([x, y], height = 0) => new THREE.Vector3(x, height, -y);
const homeCamera = new THREE.Vector3(-172, 183, 238);
const homeTarget = new THREE.Vector3(-4, 0, 2);
camera.position.copy(homeCamera);
const controls = new OrbitControls(camera, renderer.domElement);
controls.target.copy(homeTarget);
controls.enableDamping = true;
controls.dampingFactor = 0.07;
controls.minDistance = 25;
controls.maxDistance = 560;
controls.maxPolarAngle = Math.PI * 0.49;
controls.enablePan = true;
controls.screenSpacePanning = true;
controls.update();

let model;
let activePlace = null;
let topDown = false;
let night = false;
let moveAnimation = null;
const loader = new GLTFLoader();
const loading = document.querySelector('#loading');
const loadFill = document.querySelector('#loading-fill');
const status = document.querySelector('#loading-status');
const glb = asset('models/campus.glb');
loader.load(glb, (gltf) => {
  model = gltf.scene;
  scene.add(model);
  model.traverse((object) => {
    if (object.isMesh) {
      object.frustumCulled = false;
      object.material.side = THREE.DoubleSide;
      if (object.material.isMeshStandardMaterial) object.material.envMapIntensity = 0.35;
    }
  });
  loading.classList.add('loaded');
  setTimeout(() => { loading.hidden = true; }, 500);
}, (progress) => {
  if (!progress.total) { status.textContent = '正在加载模型…'; return; }
  const pct = Math.min(100, Math.round(progress.loaded / progress.total * 100));
  loadFill.style.width = `${pct}%`;
  status.textContent = `正在加载模型 ${pct}%`;
}, (error) => {
  console.error('Campus GLB load failed', error);
  status.textContent = '模型加载失败，请检查网络并刷新页面。';
  loading.classList.add('failed');
});

function resize() {
  const { width, height } = stage.getBoundingClientRect();
  camera.aspect = Math.max(1, width) / Math.max(1, height);
  camera.updateProjectionMatrix();
  renderer.setSize(Math.max(1, width), Math.max(1, height), false);
}
const observer = new ResizeObserver(resize); observer.observe(stage); resize();

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
function focusView(position, target, zoom, duration = 1050) {
  if (moveAnimation) cancelAnimationFrame(moveAnimation);
  if (reducedMotion.matches) {
    camera.position.copy(position); controls.target.copy(target); controls.update(); return;
  }
  const startCamera = camera.position.clone();
  const startTarget = controls.target.clone();
  const destination = target.clone().add(position.clone().sub(target).normalize().multiplyScalar(zoom));
  const start = performance.now();
  const step = (now) => {
    const t = Math.min(1, (now - start) / duration);
    const eased = t * t * (3 - 2 * t);
    camera.position.lerpVectors(startCamera, destination, eased);
    controls.target.lerpVectors(startTarget, target, eased);
    controls.update();
    if (t < 1) moveAnimation = requestAnimationFrame(step);
    else moveAnimation = null;
  };
  moveAnimation = requestAnimationFrame(step);
}

function openPlace(place) {
  activePlace = place;
  document.querySelectorAll('.place').forEach((node) => node.classList.toggle('active', node.dataset.place === place.id));
  const point = xyToWorld(place.position, place.category === 'building' ? 8 : 1);
  const offset = new THREE.Vector3(-48, 61, 75);
  focusView(point.clone().add(offset), point, place.id === 'bridge' ? 60 : 105);
  document.querySelector('#details-index').textContent = place.number;
  document.querySelector('#details-title').textContent = place.title;
  document.querySelector('#details-copy').textContent = place.summary;
  document.querySelector('#details').hidden = false;
  document.querySelector('#view-label').textContent = place.title;
  document.querySelector('#view-subtitle').textContent = place.en;
  window.location.hash = place.id;
}
function reset() {
  activePlace = null;
  topDown = false;
  document.querySelector('#details').hidden = true;
  document.querySelectorAll('.place').forEach((node) => node.classList.remove('active'));
  document.querySelector('#view-label').textContent = '从湖畔看校园';
  document.querySelector('#view-subtitle').textContent = '拖动旋转 · 滚轮缩放 · 右键平移';
  focusView(homeCamera, homeTarget, homeCamera.distanceTo(homeTarget), 1150);
  if (window.location.hash) history.replaceState(null, '', window.location.pathname + window.location.search);
}
document.querySelectorAll('.place').forEach((node) => node.addEventListener('click', () => openPlace(locationById.get(node.dataset.place))));
document.querySelector('#reset-view').addEventListener('click', reset);
document.querySelector('.brand').addEventListener('click', (event) => { event.preventDefault();reset(); });
document.querySelector('#details-close').addEventListener('click', reset);
document.querySelector('#top-view').addEventListener('click', () => {
  topDown = !topDown;
  if (topDown) {
    const target = activePlace ? xyToWorld(activePlace.position, 1) : new THREE.Vector3(0, 0, 0);
    focusView(target.clone().add(new THREE.Vector3(0, 255, 0.1)), target, 255);
    document.querySelector('#view-label').textContent = '校园总平面俯视';
    document.querySelector('#view-subtitle').textContent = '按总平面图方向浏览';
  } else if (activePlace) openPlace(activePlace);
  else reset();
});

document.querySelector('#theme-toggle').addEventListener('click', () => {
  night = !night;
  document.body.classList.toggle('night', night);
  document.querySelector('#theme-toggle').innerHTML = icon(night ? 'Sun' : 'Moon', 19);
  document.querySelector('#theme-toggle').setAttribute('aria-label', night ? '切换日间模式' : '切换夜间模式');
  scene.background.set(night ? '#0b1d2c' : '#dce9ec');
  scene.fog.color.set(night ? '#0b1d2c' : '#dce9ec');
  hemi.intensity = night ? 1.65 : 3.3;
  sun.intensity = night ? 0.8 : 3.0;
  fill.intensity = night ? 1.2 : 1.35;
  renderer.toneMappingExposure = night ? 1.15 : 1.6;
});

const sidebar = document.querySelector('#sidebar');
document.querySelector('#sidebar-close').addEventListener('click', () => document.body.classList.add('sidebar-hidden'));
document.querySelector('#sidebar-open').addEventListener('click', () => document.body.classList.remove('sidebar-hidden'));
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') { if (activePlace) reset(); else if (innerWidth < 760) document.body.classList.add('sidebar-hidden'); }
});

// A restrained marker makes plan-localized locations clickable directly on the model.
const markers = new THREE.Group(); scene.add(markers);
const markerGeometry = new THREE.SphereGeometry(1.3, 14, 10);
for (const place of locations) {
  if (place.category === 'landscape') continue;
  const dot = new THREE.Mesh(markerGeometry, new THREE.MeshBasicMaterial({ color: 0xd99f63, depthTest: false }));
  dot.position.copy(xyToWorld(place.position, place.id === 'library' ? 43 : place.id === 'residence' ? 40 : 26));
  dot.userData.locationId = place.id;
  markers.add(dot);
}
const raycaster = new THREE.Raycaster(); const pointer = new THREE.Vector2(); let pointerStart = null;
renderer.domElement.addEventListener('pointerdown', (event) => { pointerStart = { x: event.clientX, y: event.clientY }; });
renderer.domElement.addEventListener('pointerup', (event) => {
  if (!model || !pointerStart || Math.hypot(event.clientX - pointerStart.x, event.clientY - pointerStart.y) > 6) return;
  const rect = renderer.domElement.getBoundingClientRect();
  pointer.set((event.clientX - rect.left) / rect.width * 2 - 1, -(event.clientY - rect.top) / rect.height * 2 + 1);
  raycaster.setFromCamera(pointer, camera);
  const hits = raycaster.intersectObjects(markers.children, false);
  if (hits[0]) { openPlace(locationById.get(hits[0].object.userData.locationId)); return; }
});

function animate() { requestAnimationFrame(animate); controls.update(); renderer.render(scene, camera); }
animate();
const requestedPlace = window.location.hash.slice(1);
if (locationById.has(requestedPlace)) openPlace(locationById.get(requestedPlace));
