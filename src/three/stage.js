import * as THREE from 'three';
import { LANGS, STR } from '../lib/i18n.js';
import { ANCHOR_LABEL, ART_LABEL, ART_PRESETS, BRANDS, CURRENCIES, FREE_SHIP_OVER_KWD, GOVERNORATES, PROMOS, SEED_PARTS, SHIP_FLAT_KWD } from '../lib/data.js';
import { C, IcApple, IcBox, IcCar, IcCard, IcCart, IcChat, IcCheck, IcCheck2, IcChevD, IcChevL, IcChevR, IcClock, IcCross, IcFile, IcFlame, IcFunnel, IcGauge, IcGlobe, IcGoogle, IcImage, IcKnet, IcLayers, IcMinus, IcMoon, IcOut, IcPackage, IcPencil, IcPercent, IcPhone, IcPin, IcPlus, IcPrint, IcReset, IcSearch, IcSend, IcShield, IcSort, IcSparkle, IcSpinner, IcStar, IcSun, IcTag, IcTrash, IcTruck, IcUpload, IcUser, IcWrench, IcX, IcZap, P, R, makeIcon } from '../components/icons.jsx';
import { LOCALE, PRIO, brandOf, clamp, cx, dateFmt, money, store, timeFmt, uid } from '../lib/util.js';
import { Ctx, useApp, useT } from '../lib/ctx.js';
import { ART, ArtBattery, ArtBrake, ArtCoilover, ArtDefs, ArtExhaust, ArtFilter, ArtGearbox, ArtHeadlight, ArtPlug, ArtRadiator, ArtTurbo, ArtWheel, ArtWing, PartArt, Stage, bolts, hatch, holes } from '../components/art.jsx';

/* ============================================================================
   8 · THE 3D STAGE
   A coupe assembled from procedural geometry: extruded body shell, glass
   house, four wheel stations and twelve named sub-assemblies. Selecting a
   part pushes every assembly out along its own service direction, ramps the
   emissive on the chosen one, and flies the camera to its world position.
   ========================================================================== */

const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* Push direction for each assembly when the car comes apart (x fwd, y up, z right) */
const EXPLODE_DIR = {
  hood:      [0.15, 1.5, 0],
  plugs:     [0.1, 1.15, 0],
  airbox:    [0.35, 0.95, 0.75],
  turbo:     [0.55, 0.35, -0.95],
  radiator:  [1.5, 0.2, 0],
  battery:   [0.2, 0.9, 1.05],
  gearbox:   [-0.35, -0.95, 0],
  exhaust:   [-0.6, -1.05, 0],
  brakeFL:   [0.2, 0.15, 1.45],
  wheelFL:   [0.15, 0.1, 2.1],
  suspFL:    [0.4, 1.1, 0.9],
  headlightR:[1.35, 0.35, -0.6],
  wing:      [-0.7, 1.15, 0],
  door:      [0, 0.1, 1.7],
  glass:     [0, 1.25, 0]
};

class Helix extends THREE.Curve {
  constructor(radius, height, turns) { super(); this.r = radius; this.h = height; this.t = turns; }
  getPoint(t, target) {
    const p = target || new THREE.Vector3();
    const a = t * Math.PI * 2 * this.t;
    return p.set(Math.cos(a) * this.r, t * this.h, Math.sin(a) * this.r);
  }
}

function fadeTexture() {
  const c = document.createElement('canvas');
  c.width = c.height = 256;
  const g = c.getContext('2d').createRadialGradient(128, 128, 0, 128, 128, 128);
  g.addColorStop(0, 'rgba(255,255,255,1)');
  g.addColorStop(0.55, 'rgba(255,255,255,.55)');
  g.addColorStop(1, 'rgba(255,255,255,0)');
  const ctx = c.getContext('2d');
  ctx.fillStyle = g; ctx.fillRect(0, 0, 256, 256);
  const t = new THREE.CanvasTexture(c);
  return t;
}
function finTexture() {
  const c = document.createElement('canvas');
  c.width = 128; c.height = 128;
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#0b0e12'; ctx.fillRect(0, 0, 128, 128);
  ctx.strokeStyle = '#59626f'; ctx.lineWidth = 2;
  for (let i = 2; i < 128; i += 6) { ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, 128); ctx.stroke(); }
  ctx.strokeStyle = '#1a1f27'; ctx.lineWidth = 3;
  for (let i = 8; i < 128; i += 22) { ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(128, i); ctx.stroke(); }
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(2, 1);
  return t;
}

function createStage(canvas, onFrame) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 120);
  const disposables = [];
  const keep = o => { disposables.push(o); return o; };

  /* ---- studio environment, baked once into a PMREM probe ---- */
  const envScene = new THREE.Scene();
  const lightBox = (w, h, d, color, intensity, pos) => {
    const m = new THREE.Mesh(
      new THREE.PlaneGeometry(w, h),
      new THREE.MeshBasicMaterial({ color: new THREE.Color(color).multiplyScalar(intensity), side: THREE.DoubleSide })
    );
    m.position.set(pos[0], pos[1], pos[2]);
    m.lookAt(0, 1, 0);
    envScene.add(m);
  };
  envScene.add(new THREE.Mesh(
    new THREE.SphereGeometry(30, 16, 12),
    new THREE.MeshBasicMaterial({ color: 0x0a0e14, side: THREE.BackSide })
  ));
  lightBox(16, 8, 0, 0xffffff, 2.6, [0, 12, 2]);
  lightBox(10, 6, 0, 0x22e1ff, 1.5, [-12, 3, -8]);
  lightBox(10, 6, 0, 0x7c5cff, 1.1, [12, 4, -7]);
  lightBox(14, 3, 0, 0xffb020, 0.5, [0, 1, 14]);
  const pmrem = new THREE.PMREMGenerator(renderer);
  const envMap = pmrem.fromScene(envScene, 0.03).texture;
  scene.environment = envMap;
  pmrem.dispose();

  /* ---- materials ---- */
  const M = {
    paint: new THREE.MeshPhysicalMaterial({ color: 0x101a2c, metalness: 0.72, roughness: 0.3, clearcoat: 1, clearcoatRoughness: 0.06, envMapIntensity: 1.35 }),
    glass: new THREE.MeshPhysicalMaterial({ color: 0x060a10, metalness: 0.2, roughness: 0.06, transparent: true, opacity: 0.62, clearcoat: 1, envMapIntensity: 2 }),
    chrome: new THREE.MeshStandardMaterial({ color: 0xe6edf5, metalness: 1, roughness: 0.1, envMapIntensity: 1.6 }),
    alloy: new THREE.MeshStandardMaterial({ color: 0x9fadbd, metalness: 0.95, roughness: 0.24, envMapIntensity: 1.3 }),
    dark: new THREE.MeshStandardMaterial({ color: 0x232b36, metalness: 0.85, roughness: 0.45 }),
    rubber: new THREE.MeshStandardMaterial({ color: 0x0a0d12, metalness: 0, roughness: 0.95 }),
    carbon: new THREE.MeshStandardMaterial({ color: 0x14181f, metalness: 0.55, roughness: 0.32 }),
    red: new THREE.MeshStandardMaterial({ color: 0xd12b1c, metalness: 0.45, roughness: 0.32 }),
    copper: new THREE.MeshStandardMaterial({ color: 0xb9763a, metalness: 0.95, roughness: 0.3 }),
    titan: new THREE.MeshStandardMaterial({ color: 0x8e99a8, metalness: 1, roughness: 0.28 }),
    ceramic: new THREE.MeshStandardMaterial({ color: 0xe7dfd0, metalness: 0, roughness: 0.55 }),
    lens: new THREE.MeshStandardMaterial({ color: 0x0a1a22, emissive: 0x9fe9ff, emissiveIntensity: 1.4, roughness: 0.2, metalness: 0.3 }),
    tail: new THREE.MeshStandardMaterial({ color: 0x2a0509, emissive: 0xff2b3d, emissiveIntensity: 1.6, roughness: 0.3 }),
    neon: new THREE.MeshBasicMaterial({ color: 0x22e1ff, transparent: true, opacity: 0.55 }),
    neonV: new THREE.MeshBasicMaterial({ color: 0x7c5cff, transparent: true, opacity: 0.4 })
  };
  Object.values(M).forEach(keep);

  /* ---- ground plane, contact shadow and neon rings ---- */
  const groundMat = keep(new THREE.MeshStandardMaterial({
    color: 0x0b0f15, metalness: 0.65, roughness: 0.34, transparent: true,
    alphaMap: keep(fadeTexture()), envMapIntensity: 0.9
  }));
  const ground = new THREE.Mesh(keep(new THREE.CircleGeometry(13, 64)), groundMat);
  ground.rotation.x = -Math.PI / 2; ground.receiveShadow = true;
  scene.add(ground);

  const grid = new THREE.GridHelper(26, 52, 0x2b3646, 0x1a2230);
  grid.material.transparent = true; grid.material.opacity = 0.5; grid.position.y = 0.004;
  scene.add(grid); keep(grid.material); keep(grid.geometry);

  const shadowMat = keep(new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.55, alphaMap: keep(fadeTexture()) }));
  const contact = new THREE.Mesh(keep(new THREE.PlaneGeometry(7.4, 3.6)), shadowMat);
  contact.rotation.x = -Math.PI / 2; contact.position.y = 0.006;
  scene.add(contact);

  [[2.9, M.neon], [3.35, M.neonV]].forEach(([r, mat]) => {
    const ring = new THREE.Mesh(keep(new THREE.RingGeometry(r, r + 0.02, 96)), mat);
    ring.rotation.x = -Math.PI / 2; ring.position.y = 0.008;
    scene.add(ring);
  });

  /* ---- lights ---- */
  const key = new THREE.DirectionalLight(0xffffff, 2.1);
  key.position.set(4.5, 7.5, 5); key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024);
  key.shadow.camera.near = 1; key.shadow.camera.far = 24;
  key.shadow.camera.left = -5; key.shadow.camera.right = 5;
  key.shadow.camera.top = 5; key.shadow.camera.bottom = -5;
  key.shadow.bias = -0.0012;
  scene.add(key);
  const rimA = new THREE.SpotLight(0x22e1ff, 26, 22, 0.7, 0.6, 1.4);
  rimA.position.set(-6, 3.4, -5.5); scene.add(rimA);
  const rimB = new THREE.SpotLight(0x7c5cff, 20, 22, 0.75, 0.6, 1.4);
  rimB.position.set(6.5, 2.8, -5); scene.add(rimB);
  const fill = new THREE.HemisphereLight(0x3d4a5c, 0x05070a, 0.5);
  scene.add(fill);

  /* ---- the car ---- */
  const car = new THREE.Group();
  car.position.y = 0.02;
  scene.add(car);

  const groups = {};
  const mesh = (geo, mat, pos, rot, parent, shadow) => {
    keep(geo);
    const m = new THREE.Mesh(geo, mat);
    if (pos) m.position.set(pos[0], pos[1], pos[2]);
    if (rot) m.rotation.set(rot[0], rot[1], rot[2]);
    m.castShadow = shadow !== false; m.receiveShadow = false;
    (parent || car).add(m);
    return m;
  };
  const assembly = (name, origin) => {
    const g = new THREE.Group();
    g.position.set(origin[0], origin[1], origin[2]);
    const d = EXPLODE_DIR[name] || [0, 1, 0];
    g.userData = {
      anchor: name,
      base: g.position.clone(),
      dir: new THREE.Vector3(d[0], d[1], d[2]),
      mats: []
    };
    car.add(g);
    groups[name] = g;
    return g;
  };
  /* Assembly meshes get their own material instance so selection can ramp
     emissive without touching the rest of the car. */
  const own = (g, srcMat) => {
    const m = srcMat.clone();
    m.emissive = new THREE.Color(0x22e1ff);
    m.emissiveIntensity = 0;
    keep(m);
    g.userData.mats.push(m);
    return m;
  };

  /* Body shell — extruded side profile with wheel arches cut through */
  /* Traced as one closed outline: along the sill (arches cut in as arcs),
     up the nose, back across the beltline, down the tail. */
  const profile = new THREE.Shape();
  profile.moveTo(-2.3, 0.2);
  profile.lineTo(-1.9, 0.2);
  profile.absarc(-1.42, 0.2, 0.48, Math.PI, 0, true);
  profile.lineTo(1.02, 0.16);
  profile.absarc(1.5, 0.16, 0.48, Math.PI, 0, true);
  profile.lineTo(2.16, 0.2);
  profile.lineTo(2.42, 0.34);
  profile.lineTo(2.45, 0.64);
  profile.lineTo(2.18, 0.84);
  profile.lineTo(1.28, 0.9);
  profile.lineTo(0.2, 0.94);
  profile.lineTo(-1.2, 0.92);
  profile.lineTo(-2.3, 0.86);
  profile.lineTo(-2.36, 0.52);
  profile.closePath();
  const bodyGeo = new THREE.ExtrudeGeometry(profile, {
    depth: 1.84, bevelEnabled: true, bevelThickness: 0.07, bevelSize: 0.07, bevelSegments: 3, curveSegments: 14
  });
  bodyGeo.translate(0, 0, -0.92);
  const body = mesh(bodyGeo, M.paint, [0, 0, 0], null, car);
  body.receiveShadow = true;

  /* Greenhouse — glass, with a painted roof skin */
  const cabin = new THREE.Shape();
  cabin.moveTo(1.24, 0.9);
  cabin.lineTo(0.46, 1.42);
  cabin.lineTo(-0.72, 1.46);
  cabin.lineTo(-1.62, 0.92);
  cabin.closePath();
  const glassGeo = new THREE.ExtrudeGeometry(cabin, { depth: 1.66, bevelEnabled: true, bevelThickness: 0.03, bevelSize: 0.03, bevelSegments: 2 });
  glassGeo.translate(0, 0, -0.83);
  const glassG = assembly('glass', [0, 0, 0]);
  glassG.userData.base.set(0, 0, 0);
  const glassMesh = new THREE.Mesh(keep(glassGeo), own(glassG, M.glass));
  glassG.add(glassMesh);
  mesh(new THREE.BoxGeometry(1.2, 0.05, 1.6), M.paint, [-0.15, 1.45, 0], null, glassG);

  /* Skirts, splitter, diffuser, tail bar */
  mesh(new THREE.BoxGeometry(2.2, 0.1, 0.08), M.carbon, [0, 0.2, 0.9], null, car);
  mesh(new THREE.BoxGeometry(2.2, 0.1, 0.08), M.carbon, [0, 0.2, -0.9], null, car);
  mesh(new THREE.BoxGeometry(0.5, 0.05, 1.8), M.carbon, [2.3, 0.17, 0], null, car);
  mesh(new THREE.BoxGeometry(0.42, 0.14, 1.7), M.carbon, [-2.24, 0.2, 0], null, car);
  mesh(new THREE.BoxGeometry(0.06, 0.09, 1.44), M.tail, [-2.36, 0.72, 0], null, car);
  mesh(new THREE.BoxGeometry(0.3, 0.06, 0.5), M.dark, [1.9, 0.95, 0.62], [0, 0.2, 0.1], car);
  mesh(new THREE.BoxGeometry(0.3, 0.06, 0.5), M.dark, [1.9, 0.95, -0.62], [0, -0.2, -0.1], car);
  /* seats and wheel, visible through the glass */
  mesh(new THREE.BoxGeometry(0.3, 0.5, 0.36), M.dark, [-0.35, 0.72, 0.36], [0, 0, 0.12], car, false);
  mesh(new THREE.BoxGeometry(0.3, 0.5, 0.36), M.dark, [-0.35, 0.72, -0.36], [0, 0, 0.12], car, false);
  mesh(new THREE.TorusGeometry(0.13, 0.025, 8, 22), M.dark, [0.42, 0.86, -0.38], [0, 0, 1.15], car, false);

  /* ---- hood ---- */
  const hood = assembly('hood', [1.7, 0.88, 0]);
  const hoodShape = new THREE.Shape();
  hoodShape.moveTo(-0.5, -0.86); hoodShape.lineTo(0.46, -0.78);
  hoodShape.lineTo(0.46, 0.78); hoodShape.lineTo(-0.5, 0.86);
  hoodShape.closePath();
  const hoodGeo = new THREE.ExtrudeGeometry(hoodShape, { depth: 0.06, bevelEnabled: true, bevelThickness: 0.02, bevelSize: 0.02, bevelSegments: 2 });
  hoodGeo.rotateX(-Math.PI / 2);
  const hoodMesh = new THREE.Mesh(keep(hoodGeo), own(hood, M.paint));
  hoodMesh.castShadow = true;
  hood.add(hoodMesh);
  mesh(new THREE.BoxGeometry(0.32, 0.03, 0.5), M.carbon, [0.1, 0.07, 0], null, hood);

  /* ---- cylinder head + plugs ---- */
  const plugs = assembly('plugs', [1.62, 0.74, 0]);
  const headMat = own(plugs, M.alloy);
  const headMesh = new THREE.Mesh(keep(new THREE.BoxGeometry(0.74, 0.16, 0.62)), headMat);
  headMesh.castShadow = true; plugs.add(headMesh);
  for (let i = 0; i < 6; i++) {
    const x = -0.26 + (i % 3) * 0.26, z = i < 3 ? 0.17 : -0.17;
    mesh(new THREE.CylinderGeometry(0.026, 0.026, 0.2, 10), M.ceramic, [x, 0.16, z], null, plugs);
    mesh(new THREE.CylinderGeometry(0.036, 0.036, 0.04, 10), M.chrome, [x, 0.05, z], null, plugs);
  }
  mesh(new THREE.BoxGeometry(0.7, 0.34, 0.6), M.dark, [0, -0.26, 0], null, plugs);
  mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.14, 14), M.copper, [0.3, -0.3, 0.34], [Math.PI / 2, 0, 0], plugs);

  /* ---- airbox + intake ---- */
  const airbox = assembly('airbox', [1.42, 1.0, 0.46]);
  const abMat = own(airbox, M.dark);
  const ab = new THREE.Mesh(keep(new THREE.BoxGeometry(0.4, 0.24, 0.34)), abMat);
  ab.castShadow = true; airbox.add(ab);
  const intake = new THREE.TubeGeometry(
    new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.18, 0.02, -0.06), new THREE.Vector3(-0.02, 0.1, -0.24),
      new THREE.Vector3(0.24, -0.02, -0.42), new THREE.Vector3(0.3, -0.18, -0.5)
    ]), 24, 0.055, 12, false);
  const intakeMesh = new THREE.Mesh(keep(intake), own(airbox, M.carbon));
  airbox.add(intakeMesh);
  mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.18, 16), M.red, [-0.28, 0, 0.06], [0, 0, Math.PI / 2], airbox);

  /* ---- turbo ---- */
  const turbo = assembly('turbo', [1.86, 0.62, -0.42]);
  const snailMat = own(turbo, M.alloy);
  const snail = new THREE.Mesh(keep(new THREE.TorusGeometry(0.13, 0.075, 12, 26, Math.PI * 1.7)), snailMat);
  snail.rotation.y = Math.PI / 2; snail.castShadow = true; turbo.add(snail);
  mesh(new THREE.CylinderGeometry(0.085, 0.085, 0.1, 16), M.alloy, [0, 0, 0.12], [Math.PI / 2, 0, 0], turbo);
  mesh(new THREE.CylinderGeometry(0.06, 0.09, 0.12, 16), M.titan, [0, 0, -0.14], [Math.PI / 2, 0, 0], turbo);
  const manifold = new THREE.TubeGeometry(
    new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.02, 0.02, -0.16), new THREE.Vector3(-0.22, 0.1, -0.06),
      new THREE.Vector3(-0.42, 0.14, 0.02), new THREE.Vector3(-0.6, 0.08, 0.06)
    ]), 24, 0.045, 10, false);
  turbo.add(new THREE.Mesh(keep(manifold), own(turbo, M.copper)));
  mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.12, 12), M.dark, [0.02, 0.2, 0.02], null, turbo);

  /* ---- radiator ---- */
  const radiator = assembly('radiator', [2.22, 0.58, 0]);
  const finMat = own(radiator, new THREE.MeshStandardMaterial({ map: keep(finTexture()), metalness: 0.8, roughness: 0.5 }));
  const rad = new THREE.Mesh(keep(new THREE.BoxGeometry(0.08, 0.52, 1.26)), finMat);
  rad.castShadow = true; radiator.add(rad);
  mesh(new THREE.BoxGeometry(0.11, 0.08, 1.3), M.alloy, [0, 0.29, 0], null, radiator);
  mesh(new THREE.BoxGeometry(0.11, 0.08, 1.3), M.alloy, [0, -0.29, 0], null, radiator);
  mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.16, 12), M.dark, [-0.1, 0.2, 0.5], [0, 0, Math.PI / 2], radiator);

  /* ---- battery ---- */
  const battery = assembly('battery', [1.36, 0.86, 0.52]);
  const batMat = own(battery, new THREE.MeshStandardMaterial({ color: 0x1b2130, metalness: 0.3, roughness: 0.6 }));
  const bat = new THREE.Mesh(keep(new THREE.BoxGeometry(0.32, 0.24, 0.24)), batMat);
  bat.castShadow = true; battery.add(bat);
  mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.05, 10), M.copper, [0.1, 0.14, 0.07], null, battery);
  mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.05, 10), M.chrome, [-0.1, 0.14, 0.07], null, battery);

  /* ---- gearbox + driveshaft ---- */
  const gearbox = assembly('gearbox', [0.75, 0.42, 0]);
  const gbMat = own(gearbox, M.alloy);
  const bell = new THREE.Mesh(keep(new THREE.CylinderGeometry(0.24, 0.19, 0.24, 22)), gbMat);
  bell.rotation.z = Math.PI / 2; bell.castShadow = true; gearbox.add(bell);
  mesh(new THREE.CylinderGeometry(0.16, 0.12, 0.5, 18), M.dark, [-0.36, 0, 0], [0, 0, Math.PI / 2], gearbox);
  const shaftMesh = new THREE.Mesh(keep(new THREE.CylinderGeometry(0.045, 0.045, 1.5, 14)), own(gearbox, M.chrome));
  shaftMesh.rotation.z = Math.PI / 2; shaftMesh.position.set(-1.36, -0.02, 0);
  gearbox.add(shaftMesh);
  mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.12, 18), M.dark, [-2.14, -0.02, 0], [0, 0, Math.PI / 2], gearbox);
  mesh(new THREE.BoxGeometry(0.1, 0.16, 0.1), M.dark, [0.04, 0.2, 0], null, gearbox);

  /* ---- exhaust ---- */
  const exhaust = assembly('exhaust', [0, 0.34, 0]);
  const pipeCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(1.72, 0.06, -0.34), new THREE.Vector3(1.1, -0.02, -0.3),
    new THREE.Vector3(0.2, 0.0, -0.24), new THREE.Vector3(-0.7, 0.02, -0.2),
    new THREE.Vector3(-1.5, 0.04, -0.24), new THREE.Vector3(-2.0, 0.06, -0.3)
  ]);
  const pipeMesh = new THREE.Mesh(keep(new THREE.TubeGeometry(pipeCurve, 60, 0.055, 12, false)), own(exhaust, M.titan));
  pipeMesh.castShadow = true; exhaust.add(pipeMesh);
  mesh(new THREE.CylinderGeometry(0.14, 0.14, 0.6, 20), M.titan, [-1.05, 0.0, -0.22], [0, 0, Math.PI / 2], exhaust);
  [-0.24, 0.24].forEach((z, i) => {
    mesh(new THREE.CylinderGeometry(0.075, 0.09, 0.26, 18, 1, true), M.titan, [-2.3, 0.06, z], [0, 0, Math.PI / 2], exhaust);
    mesh(new THREE.CircleGeometry(0.072, 18), M.rubber, [-2.44, 0.06, z], [0, -Math.PI / 2, 0], exhaust, false);
  });
  mesh(new THREE.TorusGeometry(0.09, 0.02, 8, 18), M.titan, [-2.12, 0.06, 0.24], [0, Math.PI / 2, 0], exhaust);

  /* ---- rear wing ---- */
  const wing = assembly('wing', [-2.1, 1.14, 0]);
  const wingMat = own(wing, M.carbon);
  const blade = new THREE.Mesh(keep(new THREE.BoxGeometry(0.34, 0.045, 1.62)), wingMat);
  blade.castShadow = true; wing.add(blade);
  mesh(new THREE.BoxGeometry(0.06, 0.05, 1.62), M.carbon, [-0.19, 0.045, 0], [0, 0, -0.32], wing);
  [-0.68, 0.68].forEach(z => {
    mesh(new THREE.BoxGeometry(0.05, 0.34, 0.05), M.alloy, [0.06, -0.19, z], [0, 0, 0.1], wing);
    mesh(new THREE.BoxGeometry(0.03, 0.44, 0.3), M.carbon, [0.02, -0.02, z + (z > 0 ? 0.12 : -0.12)], null, wing);
  });

  /* ---- headlamps ---- */
  [['headlightR', -0.58], ['headlightL', 0.58]].forEach(([name, z]) => {
    const g = name === 'headlightR' ? assembly('headlightR', [2.24, 0.7, z]) : null;
    const parent = g || car;
    const src = g ? own(g, M.lens) : M.lens;
    const shell = new THREE.Mesh(keep(new THREE.BoxGeometry(0.16, 0.16, 0.48)), src);
    if (g) { shell.castShadow = true; g.add(shell); }
    else { shell.position.set(2.24, 0.7, z); car.add(shell); }
    const pod = (dz) => mesh(new THREE.CylinderGeometry(0.055, 0.055, 0.06, 16), M.chrome,
      g ? [0.08, 0, dz] : [2.32, 0.7, z + dz], [0, 0, Math.PI / 2], parent, false);
    pod(-0.11); pod(0.11);
  });

  /* ---- wheel stations ---- */
  const wheelStation = (x, z, front, left) => {
    const isTarget = front && left;
    const stationName = isTarget ? 'wheelFL' : 'wheel_' + x + '_' + z;
    const g = isTarget ? assembly('wheelFL', [x, 0.36, z]) : (() => {
      const grp = new THREE.Group(); grp.position.set(x, 0.36, z); car.add(grp); return grp;
    })();
    const tireMat = isTarget ? own(g, M.rubber) : M.rubber;
    const rimMat = isTarget ? own(g, M.alloy) : M.alloy;
    const tire = new THREE.Mesh(keep(new THREE.CylinderGeometry(0.38, 0.38, 0.3, 34)), tireMat);
    tire.rotation.x = Math.PI / 2; tire.castShadow = true; g.add(tire);
    const rim = new THREE.Mesh(keep(new THREE.CylinderGeometry(0.27, 0.27, 0.31, 26)), rimMat);
    rim.rotation.x = Math.PI / 2; g.add(rim);
    mesh(new THREE.TorusGeometry(0.27, 0.03, 8, 30), M.chrome, [0, 0, 0], [0, 0, 0], g, false);
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2;
      mesh(new THREE.BoxGeometry(0.06, 0.24, 0.04), M.alloy,
        [Math.cos(a) * 0.14, Math.sin(a) * 0.14, z > 0 ? 0.14 : -0.14], [0, 0, a + Math.PI / 2], g, false);
    }
    mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.34, 14), M.dark, [0, 0, 0], [Math.PI / 2, 0, 0], g, false);

    /* brakes ride in their own assembly on the target corner */
    const bg = isTarget ? assembly('brakeFL', [x, 0.36, z]) : g;
    const discMat = isTarget ? own(bg, M.chrome) : M.chrome;
    const disc = new THREE.Mesh(keep(new THREE.CylinderGeometry(0.24, 0.24, 0.028, 30)), discMat);
    disc.rotation.x = Math.PI / 2;
    if (isTarget) { disc.position.set(0, 0, z > 0 ? 0.05 : -0.05); } else { disc.position.set(0, 0, z > 0 ? 0.05 : -0.05); }
    bg.add(disc);
    const cal = new THREE.Mesh(keep(new THREE.BoxGeometry(0.1, 0.2, 0.09)),
      isTarget ? own(bg, M.red) : M.red);
    cal.position.set(-0.12, 0.15, z > 0 ? 0.05 : -0.05);
    bg.add(cal);

    /* front-left coilover */
    if (isTarget) {
      const susp = assembly('suspFL', [x - 0.02, 0.62, z - 0.16]);
      const dampMat = own(susp, M.dark);
      const damper = new THREE.Mesh(keep(new THREE.CylinderGeometry(0.05, 0.05, 0.44, 14)), dampMat);
      damper.castShadow = true; susp.add(damper);
      const spring = new THREE.Mesh(
        keep(new THREE.TubeGeometry(new Helix(0.11, 0.34, 6), 90, 0.022, 8, false)),
        own(susp, M.titan)
      );
      spring.position.y = -0.16; susp.add(spring);
      mesh(new THREE.CylinderGeometry(0.11, 0.11, 0.03, 18), M.alloy, [0, 0.23, 0], null, susp);
      mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.03, 18), M.chrome, [0, -0.22, 0], null, susp);
    }
  };
  wheelStation(1.5, 0.86, true, true);
  wheelStation(1.5, -0.86, true, false);
  wheelStation(-1.42, 0.86, false, true);
  wheelStation(-1.42, -0.86, false, false);

  /* selection halo shared by every assembly */
  const haloMat = keep(new THREE.MeshBasicMaterial({ color: 0x22e1ff, transparent: true, opacity: 0 }));
  const haloGeo = keep(new THREE.TorusGeometry(0.46, 0.012, 8, 48));
  const halo = new THREE.Mesh(haloGeo, haloMat);
  halo.rotation.x = -Math.PI / 2;
  halo.visible = false;
  scene.add(halo);

  /* ---- camera rig ---- */
  const state = {
    theta: -0.72, phi: 1.17, radius: 8.2,
    tTheta: -0.72, tPhi: 1.17, tRadius: 8.2,
    target: new THREE.Vector3(0, 0.62, 0),
    tTarget: new THREE.Vector3(0, 0.62, 0),
    explode: 0, tExplode: 0,
    selected: null, dark: true, idle: 0, dragging: false, paused: false
  };
  const applyCamera = () => {
    const s = Math.sin(state.phi), c = Math.cos(state.phi);
    camera.position.set(
      state.target.x + state.radius * s * Math.sin(state.theta),
      state.target.y + state.radius * c,
      state.target.z + state.radius * s * Math.cos(state.theta)
    );
    camera.lookAt(state.target);
  };
  applyCamera();

  /* ---- pointer orbit ---- */
  let lastX = 0, lastY = 0, pid = null;
  const onDown = e => {
    if (e.target.dataset && e.target.dataset.hotspot) return;
    pid = e.pointerId; state.dragging = true; state.idle = 0;
    lastX = e.clientX; lastY = e.clientY;
    canvas.setPointerCapture && canvas.setPointerCapture(pid);
  };
  const onMove = e => {
    if (!state.dragging || e.pointerId !== pid) return;
    state.tTheta -= (e.clientX - lastX) * 0.007;
    state.tPhi = clamp(state.tPhi - (e.clientY - lastY) * 0.006, 0.32, 1.46);
    lastX = e.clientX; lastY = e.clientY; state.idle = 0;
  };
  const onUp = e => {
    if (e.pointerId !== pid) return;
    state.dragging = false; pid = null;
  };
  const onWheel = e => {
    e.preventDefault();
    state.tRadius = clamp(state.tRadius + e.deltaY * 0.006, 3.4, 14);
    state.idle = 0;
  };
  canvas.addEventListener('pointerdown', onDown);
  window.addEventListener('pointermove', onMove);
  window.addEventListener('pointerup', onUp);
  window.addEventListener('pointercancel', onUp);
  canvas.addEventListener('wheel', onWheel, { passive: false });

  /* ---- hotspot projection ---- */
  const hotspotNames = Object.keys(ANCHOR_LABEL);
  const vec = new THREE.Vector3();
  let frameSkip = 0;

  const setTheme = dark => {
    state.dark = dark;
    const bg = dark ? 0x090c11 : 0xdfe5ee;
    scene.background = new THREE.Color(bg);
    scene.fog = new THREE.Fog(bg, 13, 30);
    groundMat.color.setHex(dark ? 0x0b0f15 : 0xb9c3d1);
    groundMat.metalness = dark ? 0.65 : 0.35;
    grid.material.opacity = dark ? 0.5 : 0.3;
    grid.material.color.setHex(dark ? 0x2b3646 : 0x8b98a9);
    shadowMat.opacity = dark ? 0.55 : 0.35;
    renderer.toneMappingExposure = dark ? 1.15 : 1.32;
    fill.intensity = dark ? 0.5 : 0.9;
    M.paint.color.setHex(dark ? 0x101a2c : 0x1b2a44);
    M.neon.opacity = dark ? 0.55 : 0.3;
    M.neonV.opacity = dark ? 0.4 : 0.2;
  };
  setTheme(true);

  const resize = () => {
    const w = canvas.clientWidth || 1, h = canvas.clientHeight || 1;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  };
  resize();

  const clock = new THREE.Clock();
  let raf = 0;

  const tick = () => {
    raf = requestAnimationFrame(tick);
    if (state.paused) return;
    const dt = Math.min(clock.getDelta(), 0.05);
    const t = clock.elapsedTime;
    state.idle += dt;

    if (!state.dragging && !state.selected && state.idle > 2.5 && !REDUCED) state.tTheta -= dt * 0.12;

    state.theta += (state.tTheta - state.theta) * 0.09;
    state.phi += (state.tPhi - state.phi) * 0.09;
    state.radius += (state.tRadius - state.radius) * 0.07;
    state.target.lerp(state.tTarget, 0.07);
    state.explode += (state.tExplode - state.explode) * 0.075;
    applyCamera();

    /* every assembly rides out along its own service direction */
    Object.keys(groups).forEach(name => {
      const g = groups[name];
      const u = g.userData;
      const amount = state.explode * (state.selected === name ? 1.35 : 1);
      const tx = u.base.x + u.dir.x * amount * 0.55;
      const ty = u.base.y + u.dir.y * amount * 0.55;
      const tz = u.base.z + u.dir.z * amount * 0.55;
      g.position.x += (tx - g.position.x) * 0.12;
      g.position.y += (ty - g.position.y) * 0.12;
      g.position.z += (tz - g.position.z) * 0.12;
      const on = state.selected === name;
      const target = on ? 0.55 + Math.sin(t * 3.2) * 0.25 : 0;
      u.mats.forEach(m => {
        m.emissiveIntensity += (target - m.emissiveIntensity) * 0.12;
      });
      const sc = on ? 1.035 : 1;
      g.scale.x += (sc - g.scale.x) * 0.12;
      g.scale.y = g.scale.z = g.scale.x;
    });

    if (state.selected && groups[state.selected]) {
      groups[state.selected].getWorldPosition(vec);
      halo.visible = true;
      halo.position.set(vec.x, 0.012, vec.z);
      haloMat.opacity += (0.5 - haloMat.opacity) * 0.1;
      halo.scale.setScalar(1 + Math.sin(t * 2.4) * 0.04);
    } else {
      haloMat.opacity += (0 - haloMat.opacity) * 0.12;
      if (haloMat.opacity < 0.01) halo.visible = false;
    }

    renderer.render(scene, camera);

    /* feed projected hotspot positions back to the HUD (every 2nd frame) */
    if (onFrame && (frameSkip = (frameSkip + 1) % 2) === 0) {
      const w = canvas.clientWidth, h = canvas.clientHeight;
      const out = [];
      for (let i = 0; i < hotspotNames.length; i++) {
        const g = groups[hotspotNames[i]];
        if (!g) continue;
        g.getWorldPosition(vec);
        const depth = camera.position.distanceTo(vec);
        vec.project(camera);
        out.push({
          anchor: hotspotNames[i],
          x: (vec.x * 0.5 + 0.5) * w,
          y: (-vec.y * 0.5 + 0.5) * h,
          on: vec.z < 1,
          depth
        });
      }
      onFrame(out);
    }
  };
  tick();

  const io = new IntersectionObserver(entries => {
    state.paused = !entries[0].isIntersecting;
  }, { threshold: 0.01 });
  io.observe(canvas);
  const onVis = () => { state.paused = document.hidden; };
  document.addEventListener('visibilitychange', onVis);
  const ro = new ResizeObserver(resize);
  ro.observe(canvas);

  return {
    select(anchor) {
      state.selected = anchor;
      if (anchor && groups[anchor]) {
        state.tExplode = 1;
        const g = groups[anchor];
        const u = g.userData;
        state.tTarget.set(
          u.base.x + u.dir.x * 0.7,
          Math.max(0.35, u.base.y + u.dir.y * 0.7),
          u.base.z + u.dir.z * 0.7
        );
        state.tRadius = 4.1;
        state.tPhi = clamp(1.05 - u.dir.y * 0.12, 0.5, 1.3);
        state.tTheta = Math.atan2(u.dir.z || (u.base.z || 0.4), u.dir.x || 1) * 0.55 - 0.5;
        state.idle = 0;
      } else {
        state.tTarget.set(0, 0.62, 0);
        state.tRadius = 8.2;
      }
    },
    setExplode(on) {
      state.tExplode = on ? 1 : 0;
      if (!on) { state.tTarget.set(0, 0.62, 0); state.tRadius = 8.2; }
    },
    explodeState: () => state.tExplode > 0.5,
    reset() {
      state.tTheta = -0.72; state.tPhi = 1.17; state.tRadius = 8.2;
      state.tTarget.set(0, 0.62, 0); state.idle = 0;
    },
    setTheme,
    dispose() {
      cancelAnimationFrame(raf);
      io.disconnect(); ro.disconnect();
      document.removeEventListener('visibilitychange', onVis);
      canvas.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onUp);
      canvas.removeEventListener('wheel', onWheel);
      disposables.forEach(o => o && o.dispose && o.dispose());
      envMap.dispose();
      renderer.dispose();
    }
  };
}


export { EXPLODE_DIR, Helix, REDUCED, createStage, fadeTexture, finTexture };
