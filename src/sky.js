import * as THREE from 'three';

// Shader-based horizon follows the camera rather than adding distant terrain to
// the masterplan. Star locations are seeded so day/night and reload stay stable.
const DAY = { zenith: '#468cc8', middle: '#88c5eb', horizon: '#e6f3f8' };
const NIGHT = { zenith: '#061128', middle: '#14294d', horizon: '#314563' };

function seededRandom(seed = 64521) {
  let state = seed >>> 0;
  return () => ((state = (1664525 * state + 1013904223) >>> 0) / 4294967296);
}

export function createSky(scene) {
  const uniforms = {
    zenith: { value: new THREE.Color(DAY.zenith) },
    middle: { value: new THREE.Color(DAY.middle) },
    horizon: { value: new THREE.Color(DAY.horizon) },
  };
  const sky = new THREE.Mesh(
    new THREE.SphereGeometry(880, 32, 20),
    new THREE.ShaderMaterial({
      uniforms,
      side: THREE.BackSide,
      depthWrite: false,
      fog: false,
      vertexShader: `varying vec3 vDirection;
        void main() {
          vDirection = normalize(position);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }`,
      fragmentShader: `uniform vec3 zenith;
        uniform vec3 middle;
        uniform vec3 horizon;
        varying vec3 vDirection;
        void main() {
          float height = normalize(vDirection).y;
          vec3 color = mix(horizon, middle, smoothstep(-0.06, 0.26, height));
          color = mix(color, zenith, smoothstep(0.22, 0.95, height));
          gl_FragColor = vec4(color, 1.0);
          #include <tonemapping_fragment>
          #include <colorspace_fragment>
        }`,
    }),
  );
  sky.name = 'Day and night atmospheric sky';
  sky.frustumCulled = false;
  sky.renderOrder = -1000;
  scene.add(sky);

  // Uniform spherical stars with a soft pixel texture, rendered behind the site.
  const random = seededRandom();
  const positions = [];
  const colors = [];
  const palette = [new THREE.Color('#ffffff'), new THREE.Color('#d4e6ff'), new THREE.Color('#ffe6c5')];
  for (let i = 0; i < 700; i++) {
    const altitude = 0.055 + random() * 0.92;
    const azimuth = random() * Math.PI * 2;
    const horizontal = Math.sqrt(1 - altitude * altitude);
    const radius = 790;
    positions.push(Math.cos(azimuth) * horizontal * radius, altitude * radius, Math.sin(azimuth) * horizontal * radius);
    const color = palette[Math.floor(random() * palette.length)];
    colors.push(color.r, color.g, color.b);
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  const stars = new THREE.Points(geometry, new THREE.PointsMaterial({
    size: 2.15,
    sizeAttenuation: false,
    transparent: true,
    opacity: 0,
    vertexColors: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    fog: false,
    toneMapped: false,
  }));
  stars.name = 'Night starfield';
  stars.frustumCulled = false;
  stars.renderOrder = -990;
  scene.add(stars);

  // Moon reads as a quiet astronomical reference instead of a floating UI icon.
  const moonMaterial = new THREE.MeshBasicMaterial({ color: '#fff5de', fog: false, toneMapped: false, transparent: true, opacity: 0, depthWrite: false });
  const moon = new THREE.Mesh(new THREE.SphereGeometry(13, 24, 16), moonMaterial);
  moon.name = 'Night moon';
  moon.position.set(-270, 370, -610);
  moon.renderOrder = -985;
  scene.add(moon);

  function setNight(night) {
    const theme = night ? NIGHT : DAY;
    for (const key of ['zenith', 'middle', 'horizon']) uniforms[key].value.set(theme[key]);
    stars.visible = night;
    moon.visible = night;
  }
  function follow(camera) {
    // Anchoring celestial layers to the camera keeps their horizon consistent
    // after users pan beyond the site, with no parallax over the model.
    sky.position.copy(camera.position);
    stars.position.copy(camera.position);
    moon.position.set(camera.position.x - 270, camera.position.y + 370, camera.position.z - 610);
  }
  stars.material.opacity = 0.96;
  moonMaterial.opacity = 0.9;
  setNight(false);

  return { setNight, follow };
}
