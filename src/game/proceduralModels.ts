import * as THREE from 'three';
import { BonusItemType, CharacterId, HatId, ObstacleType, PowerUpType } from '../types/game';

// Animation References Interface
// Maintains 100% compatibility with existing game loops, preview canvases, and animations
export interface CharacterAnimRefs {
  root: THREE.Group;
  head: THREE.Group;
  body: THREE.Group;
  tail: THREE.Group;
  leftFrontLeg: THREE.Group;
  rightFrontLeg: THREE.Group;
  leftBackLeg: THREE.Group;
  rightBackLeg: THREE.Group;
  leftEar: THREE.Group;
  rightEar: THREE.Group;
  hatGroup: THREE.Group;
  wingsGroup: THREE.Group;
  leftWing: THREE.Group;
  rightWing: THREE.Group;
}

// -------------------------------------------------------------
// PROCEDURAL PBR CANVAS TEXTURE CACHE
// Generates realistic fur, bark, stone, and eye textures on-the-fly
// Zero external network requests, zero 404 risk, 100% offline & fast
// -------------------------------------------------------------
const textureCache = new Map<string, THREE.CanvasTexture>();

function getOrCreateTexture(key: string, drawFn: (ctx: CanvasRenderingContext2D, size: number) => void, size = 512): THREE.CanvasTexture {
  if (textureCache.has(key)) {
    return textureCache.get(key)!;
  }

  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    drawFn(ctx, size);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.colorSpace = THREE.SRGBColorSpace;
  textureCache.set(key, texture);
  return texture;
}

// Realistic Tiger Pelt Texture: Tawny golden-orange coat, dense fine hair grain, organic curved tiger stripes
export function getTigerFurTexture(): THREE.CanvasTexture {
  return getOrCreateTexture('tiger_fur', (ctx, size) => {
    // Base warm tawny coat gradient
    const grad = ctx.createLinearGradient(0, 0, size, size);
    grad.addColorStop(0, '#e57a1e');
    grad.addColorStop(0.5, '#d36712');
    grad.addColorStop(1, '#b75008');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, size, size);

    // Fine hair grain fiber strokes
    ctx.lineWidth = 1;
    for (let i = 0; i < 4000; i++) {
      const x = Math.random() * size;
      const y = Math.random() * size;
      const len = 3 + Math.random() * 8;
      ctx.strokeStyle = Math.random() > 0.5 ? 'rgba(255, 200, 140, 0.18)' : 'rgba(120, 50, 10, 0.15)';
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + (Math.random() - 0.5) * 2, y + len);
      ctx.stroke();
    }

    // Realistic Anatomical Tiger Stripes (vertical curving bands with tapered tips & branching)
    ctx.fillStyle = '#1e130c';
    const stripeCount = 10;
    const spacing = size / stripeCount;

    for (let s = 0; s < stripeCount; s++) {
      const baseX = s * spacing + spacing * 0.5;
      const width = 12 + Math.random() * 10;
      ctx.beginPath();
      ctx.moveTo(baseX, 0);

      const midY1 = size * 0.35 + (Math.random() - 0.5) * 40;
      const midX1 = baseX + (Math.random() - 0.5) * 35;
      const midY2 = size * 0.7 + (Math.random() - 0.5) * 40;
      const midX2 = baseX + (Math.random() - 0.5) * 35;

      ctx.bezierCurveTo(midX1, midY1, midX2, midY2, baseX, size);
      ctx.bezierCurveTo(midX2 + width, midY2, midX1 + width, midY1, baseX + width, 0);
      ctx.closePath();
      ctx.fill();

      // Feathery edge fur on stripes
      ctx.strokeStyle = '#1e130c';
      ctx.lineWidth = 1.5;
      for (let j = 0; j < 30; j++) {
        const fy = Math.random() * size;
        const fx = baseX + (Math.random() - 0.5) * width;
        ctx.beginPath();
        ctx.moveTo(fx, fy);
        ctx.lineTo(fx + (Math.random() > 0.5 ? 6 : -6), fy + 4);
        ctx.stroke();
      }
    }
  });
}

// Realistic Panda Fur Texture: Coarse ivory-white woolly pelt with subtle warm shading and charcoal markings
export function getPandaFurTexture(): THREE.CanvasTexture {
  return getOrCreateTexture('panda_fur', (ctx, size) => {
    ctx.fillStyle = '#f5f4ef';
    ctx.fillRect(0, 0, size, size);

    // Fluffy fur texture noise
    ctx.lineWidth = 1.2;
    for (let i = 0; i < 5000; i++) {
      const x = Math.random() * size;
      const y = Math.random() * size;
      ctx.strokeStyle = Math.random() > 0.5 ? 'rgba(255,255,255,0.4)' : 'rgba(200,195,185,0.22)';
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + (Math.random() - 0.5) * 3, y + 4 + Math.random() * 5);
      ctx.stroke();
    }
  });
}

// Realistic Bunny Fur Texture: Silky warm-white hare fur with delicate fawn highlights
export function getBunnyFurTexture(): THREE.CanvasTexture {
  return getOrCreateTexture('bunny_fur', (ctx, size) => {
    const grad = ctx.createLinearGradient(0, 0, size, size);
    grad.addColorStop(0, '#fbfaf8');
    grad.addColorStop(0.5, '#f4ece1');
    grad.addColorStop(1, '#ebe0d0');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, size, size);

    ctx.lineWidth = 0.8;
    for (let i = 0; i < 4500; i++) {
      const x = Math.random() * size;
      const y = Math.random() * size;
      ctx.strokeStyle = Math.random() > 0.5 ? 'rgba(255,255,255,0.45)' : 'rgba(195,175,155,0.18)';
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + (Math.random() - 0.5) * 2, y + 3 + Math.random() * 4);
      ctx.stroke();
    }
  });
}

// Realistic Fox Fur Texture: Fiery russet-red pelt with golden guard hairs and white flecks
export function getFoxFurTexture(): THREE.CanvasTexture {
  return getOrCreateTexture('fox_fur', (ctx, size) => {
    const grad = ctx.createLinearGradient(0, 0, 0, size);
    grad.addColorStop(0, '#c74a16');
    grad.addColorStop(0.6, '#a8390b');
    grad.addColorStop(1, '#8b2a05');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, size, size);

    ctx.lineWidth = 1;
    for (let i = 0; i < 4500; i++) {
      const x = Math.random() * size;
      const y = Math.random() * size;
      const strokeCol = Math.random() > 0.6
        ? 'rgba(255, 180, 110, 0.25)'
        : Math.random() > 0.3
        ? 'rgba(110, 30, 5, 0.2)'
        : 'rgba(255, 235, 200, 0.15)';
      ctx.strokeStyle = strokeCol;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + (Math.random() - 0.5) * 2, y + 4 + Math.random() * 6);
      ctx.stroke();
    }
  });
}

// Realistic Animal Eye: Limbal outer ring, deep striated radial iris filaments, dark pupil, corneal gloss
export function getRealisticEyeTexture(irisColorHex: string): THREE.CanvasTexture {
  return getOrCreateTexture(`eye_${irisColorHex}`, (ctx, size) => {
    const center = size / 2;
    const radius = size * 0.46;

    // Sclera / eye background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, size, size);

    // Dark Limbal outer ring
    ctx.beginPath();
    ctx.arc(center, center, radius, 0, Math.PI * 2);
    ctx.fillStyle = '#111111';
    ctx.fill();

    // Iris base
    ctx.beginPath();
    ctx.arc(center, center, radius * 0.94, 0, Math.PI * 2);
    ctx.fillStyle = irisColorHex;
    ctx.fill();

    // Radial iris striae / muscle fibers
    const rays = 48;
    for (let i = 0; i < rays; i++) {
      const angle = (i / rays) * Math.PI * 2;
      ctx.strokeStyle = i % 2 === 0 ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.4)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(center + Math.cos(angle) * (radius * 0.4), center + Math.sin(angle) * (radius * 0.4));
      ctx.lineTo(center + Math.cos(angle) * (radius * 0.92), center + Math.sin(angle) * (radius * 0.92));
      ctx.stroke();
    }

    // Pupil
    ctx.beginPath();
    ctx.arc(center, center, radius * 0.44, 0, Math.PI * 2);
    ctx.fillStyle = '#080808';
    ctx.fill();

    // Corneal specular gleam
    ctx.beginPath();
    ctx.arc(center - radius * 0.32, center - radius * 0.32, radius * 0.16, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.fill();

    ctx.beginPath();
    ctx.arc(center + radius * 0.28, center + radius * 0.28, radius * 0.09, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
    ctx.fill();
  }, 256);
}

// Realistic Ancient Mossy Stone Texture (for Ruins biome & obstacles)
export function getMossyStoneTexture(): THREE.CanvasTexture {
  return getOrCreateTexture('mossy_stone', (ctx, size) => {
    // Base weathered granite
    ctx.fillStyle = '#6e7571';
    ctx.fillRect(0, 0, size, size);

    // Stone block masonry lines
    ctx.strokeStyle = '#3d423f';
    ctx.lineWidth = 4;
    const rows = 4;
    const rowH = size / rows;
    for (let r = 0; r <= rows; r++) {
      ctx.beginPath();
      ctx.moveTo(0, r * rowH);
      ctx.lineTo(size, r * rowH);
      ctx.stroke();

      const offset = (r % 2) * (size / 4);
      for (let c = 0; c < 4; c++) {
        const x = (c * (size / 2) + offset) % size;
        ctx.beginPath();
        ctx.moveTo(x, r * rowH);
        ctx.lineTo(x, (r + 1) * rowH);
        ctx.stroke();
      }
    }

    // Stone texture grain & pitting
    for (let i = 0; i < 3000; i++) {
      const x = Math.random() * size;
      const y = Math.random() * size;
      ctx.fillStyle = Math.random() > 0.5 ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.12)';
      ctx.fillRect(x, y, 2, 2);
    }

    // Organic green moss patches
    ctx.fillStyle = 'rgba(56, 120, 60, 0.38)';
    for (let m = 0; m < 14; m++) {
      const mx = Math.random() * size;
      const my = Math.random() * size;
      const mr = 20 + Math.random() * 40;
      ctx.beginPath();
      ctx.arc(mx, my, mr, 0, Math.PI * 2);
      ctx.fill();
    }
  });
}

// Realistic Forest Bark Texture
export function getTreeBarkTexture(): THREE.CanvasTexture {
  return getOrCreateTexture('tree_bark', (ctx, size) => {
    ctx.fillStyle = '#4a2f1b';
    ctx.fillRect(0, 0, size, size);

    // Furrowed vertical ridges
    for (let i = 0; i < 200; i++) {
      const x = Math.random() * size;
      const w = 3 + Math.random() * 8;
      ctx.fillStyle = Math.random() > 0.5 ? '#2f1c0f' : '#69462d';
      ctx.fillRect(x, 0, w, size);
    }

    // Lichen moss accents
    ctx.fillStyle = 'rgba(70, 110, 60, 0.25)';
    for (let l = 0; l < 8; l++) {
      ctx.beginPath();
      ctx.arc(Math.random() * size, Math.random() * size, 15 + Math.random() * 25, 0, Math.PI * 2);
      ctx.fill();
    }
  });
}

// Realistic River Water Texture (for River/Waterfall Canyon biome)
export function getRiverWaterTexture(): THREE.CanvasTexture {
  return getOrCreateTexture('river_water', (ctx, size) => {
    const grad = ctx.createLinearGradient(0, 0, 0, size);
    grad.addColorStop(0, '#105670');
    grad.addColorStop(0.5, '#197696');
    grad.addColorStop(1, '#0c4459');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, size, size);

    // Wave ripples & foam crests
    ctx.strokeStyle = 'rgba(180, 240, 255, 0.4)';
    ctx.lineWidth = 3;
    for (let y = 15; y < size; y += 30) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      for (let x = 0; x <= size; x += 40) {
        ctx.quadraticCurveTo(x + 20, y + (Math.random() - 0.5) * 16, x + 40, y);
      }
      ctx.stroke();
    }

    // White water splash speckles
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    for (let s = 0; s < 400; s++) {
      ctx.fillRect(Math.random() * size, Math.random() * size, 2 + Math.random() * 3, 2);
    }
  });
}

// Realistic Dirt Track Texture
export function getDirtTrackTexture(): THREE.CanvasTexture {
  return getOrCreateTexture('dirt_track', (ctx, size) => {
    const grad = ctx.createLinearGradient(0, 0, size, 0);
    grad.addColorStop(0, '#a5733f');
    grad.addColorStop(0.5, '#c48f52');
    grad.addColorStop(1, '#a5733f');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, size, size);

    // Trodden wheel/foot ruts in center
    ctx.fillStyle = 'rgba(120, 75, 35, 0.25)';
    ctx.fillRect(size * 0.25, 0, size * 0.5, size);

    // Pebbles & fine soil texture
    for (let p = 0; p < 2500; p++) {
      const px = Math.random() * size;
      const py = Math.random() * size;
      ctx.fillStyle = Math.random() > 0.5 ? 'rgba(230, 190, 140, 0.35)' : 'rgba(80, 45, 20, 0.3)';
      ctx.beginPath();
      ctx.arc(px, py, 1 + Math.random() * 2, 0, Math.PI * 2);
      ctx.fill();
    }
  });
}

// Realistic Feather Wings Texture
export function getWingFeatherTexture(): THREE.CanvasTexture {
  return getOrCreateTexture('wing_feathers', (ctx, size) => {
    const grad = ctx.createLinearGradient(0, 0, 0, size);
    grad.addColorStop(0, '#e0f7fa');
    grad.addColorStop(0.5, '#80deea');
    grad.addColorStop(1, '#00acc1');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, size, size);

    // Golden luminous quill rachis
    ctx.strokeStyle = '#ffd54f';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(size * 0.5, 0);
    ctx.lineTo(size * 0.5, size);
    ctx.stroke();

    // Vane barb branches
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.lineWidth = 1.5;
    for (let y = 10; y < size; y += 8) {
      ctx.beginPath();
      ctx.moveTo(size * 0.5, y);
      ctx.lineTo(size * 0.1, y + 25);
      ctx.moveTo(size * 0.5, y);
      ctx.lineTo(size * 0.9, y + 25);
      ctx.stroke();
    }
  });
}

// -------------------------------------------------------------
// REALISTIC ANATOMICAL QUADRUPED CHARACTER BUILDER
// Builds anatomically believable quadrupeds (Tiger, Panda, Bunny, Fox)
// Forward direction is strictly along -Z axis at all times.
// -------------------------------------------------------------

function createRealisticEye(irisColor: string): THREE.Group {
  const eye = new THREE.Group();

  // Anatomical eyeball
  const scleraGeo = new THREE.SphereGeometry(0.12, 16, 16);
  const eyeTex = getRealisticEyeTexture(irisColor);
  const eyeMat = new THREE.MeshStandardMaterial({
    map: eyeTex,
    roughness: 0.1,
    metalness: 0.05,
  });
  const mesh = new THREE.Mesh(scleraGeo, eyeMat);
  mesh.rotation.y = -Math.PI * 0.5; // orient iris towards forward (-Z)
  eye.add(mesh);

  // Clear glossy cornea highlight
  const corneaGeo = new THREE.SphereGeometry(0.125, 12, 12);
  const corneaMat = new THREE.MeshPhysicalMaterial({
    roughness: 0.05,
    transmission: 0.9,
    transparent: true,
    opacity: 0.3,
  });
  const cornea = new THREE.Mesh(corneaGeo, corneaMat);
  eye.add(cornea);

  return eye;
}

// Realistic Paw with toe pads and subtle claws
function createRealisticPaw(color: number, padColor = 0x221815): THREE.Group {
  const paw = new THREE.Group();

  // Metacarpal main pad base
  const baseGeo = new THREE.BoxGeometry(0.22, 0.12, 0.28);
  const baseMat = new THREE.MeshStandardMaterial({ color, roughness: 0.75 });
  const base = new THREE.Mesh(baseGeo, baseMat);
  base.position.set(0, 0.06, -0.04);
  base.castShadow = true;
  paw.add(base);

  // 3 distinct front toes facing -Z
  const toeGeo = new THREE.SphereGeometry(0.065, 8, 8);
  toeGeo.scale(0.9, 0.8, 1.2);
  [-0.07, 0, 0.07].forEach((tx) => {
    const toe = new THREE.Mesh(toeGeo, baseMat);
    toe.position.set(tx, 0.05, -0.16);
    toe.castShadow = true;
    paw.add(toe);

    // Tiny dark claw tip
    const clawGeo = new THREE.ConeGeometry(0.018, 0.06, 6);
    const clawMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.3 });
    const claw = new THREE.Mesh(clawGeo, clawMat);
    claw.rotation.x = Math.PI * 0.45;
    claw.position.set(tx, 0.03, -0.21);
    paw.add(claw);
  });

  // Soft leathery ground contact pad underneath
  const padGeo = new THREE.PlaneGeometry(0.18, 0.22);
  const padMat = new THREE.MeshStandardMaterial({ color: padColor, roughness: 0.9 });
  const pad = new THREE.Mesh(padGeo, padMat);
  pad.rotation.x = Math.PI * 0.5;
  pad.position.set(0, 0.005, -0.04);
  paw.add(pad);

  return paw;
}

export function createCharacterMesh(charId: CharacterId, hatId: HatId): CharacterAnimRefs {
  const root = new THREE.Group();

  // Species configuration
  const speciesConfig = {
    tiger: {
      furTexture: getTigerFurTexture(),
      bodyColor: 0xd96c14,
      underbellyColor: 0xf5ead8,
      irisColor: '#e09819', // amber golden iris
      snoutLength: 0.42,
      snoutWidth: 0.32,
      earShape: 'round',
      earScale: 0.18,
      tailLength: 1.1,
      tailRadius: 0.08,
      hasTailRings: true,
      hasWhiskerPoints: true,
      limbThick: 1.05,
    },
    panda: {
      furTexture: getPandaFurTexture(),
      bodyColor: 0xf5f3ee,
      underbellyColor: 0x1f1f24,
      irisColor: '#423326', // deep dark hazel iris
      snoutLength: 0.38,
      snoutWidth: 0.36,
      earShape: 'round',
      earScale: 0.22,
      tailLength: 0.28,
      tailRadius: 0.12,
      hasTailRings: false,
      hasWhiskerPoints: false,
      limbThick: 1.2,
    },
    bunny: {
      furTexture: getBunnyFurTexture(),
      bodyColor: 0xf2ebe1,
      underbellyColor: 0xfffcf7,
      irisColor: '#2b6fa8', // rich bright blue iris
      snoutLength: 0.32,
      snoutWidth: 0.26,
      earShape: 'tall',
      earScale: 0.65,
      tailLength: 0.25,
      tailRadius: 0.18,
      hasTailRings: false,
      hasWhiskerPoints: true,
      limbThick: 0.85,
    },
    fox: {
      furTexture: getFoxFurTexture(),
      bodyColor: 0xb5400e,
      underbellyColor: 0xf7f7f7,
      irisColor: '#2d7a3e', // forest green iris
      snoutLength: 0.48,
      snoutWidth: 0.25,
      earShape: 'pointed',
      earScale: 0.35,
      tailLength: 1.25,
      tailRadius: 0.18,
      hasTailRings: false,
      hasWhiskerPoints: true,
      limbThick: 0.9,
    },
  }[charId];

  // Primary Body PBR Material with Fur map
  const bodyMat = new THREE.MeshStandardMaterial({
    map: speciesConfig.furTexture,
    roughness: 0.85,
    metalness: 0.02,
  });

  const underbellyMat = new THREE.MeshStandardMaterial({
    color: speciesConfig.underbellyColor,
    roughness: 0.9,
  });

  const darkFurMat = new THREE.MeshStandardMaterial({
    color: 0x1f1f24,
    roughness: 0.88,
  });

  // --- Torso / Thorax Group ---
  // Muscular anatomical quadruped body
  const body = new THREE.Group();
  body.position.set(0, 0.72, 0);

  // Ribcage / Chest (tapered forward towards -Z)
  const ribGeo = new THREE.CylinderGeometry(0.42, 0.48, 0.75, 18);
  ribGeo.rotateX(Math.PI * 0.5);
  const ribMesh = new THREE.Mesh(ribGeo, bodyMat);
  ribMesh.position.set(0, 0.05, -0.15);
  ribMesh.castShadow = true;
  ribMesh.receiveShadow = true;
  body.add(ribMesh);

  // Muscular Haunches / Pelvis (towards +Z)
  const haunchGeo = new THREE.SphereGeometry(0.46, 18, 18);
  haunchGeo.scale(0.95, 1.05, 1.15);
  const haunchMesh = new THREE.Mesh(haunchGeo, bodyMat);
  haunchMesh.position.set(0, 0.06, 0.22);
  haunchMesh.castShadow = true;
  haunchMesh.receiveShadow = true;
  body.add(haunchMesh);

  // Anatomical Underbelly & Chest bib patch
  const bibGeo = new THREE.SphereGeometry(0.36, 14, 14);
  bibGeo.scale(0.85, 0.65, 1.2);
  const bibMesh = new THREE.Mesh(bibGeo, underbellyMat);
  bibMesh.position.set(0, -0.16, -0.05);
  bibMesh.castShadow = true;
  body.add(bibMesh);

  // Panda Shoulder Saddle / Dark Vest band
  if (charId === 'panda') {
    const vestGeo = new THREE.CylinderGeometry(0.48, 0.51, 0.42, 16);
    vestGeo.rotateX(Math.PI * 0.5);
    const vestMesh = new THREE.Mesh(vestGeo, darkFurMat);
    vestMesh.position.set(0, 0.05, -0.12);
    vestMesh.castShadow = true;
    body.add(vestMesh);
  }

  // Scapula / Shoulder Blades (left & right muscular bulges)
  const scapGeo = new THREE.SphereGeometry(0.24, 12, 12);
  scapGeo.scale(0.7, 1.1, 0.9);
  const scapL = new THREE.Mesh(scapGeo, charId === 'panda' ? darkFurMat : bodyMat);
  scapL.position.set(-0.35, 0.12, -0.32);
  scapL.castShadow = true;
  body.add(scapL);

  const scapR = new THREE.Mesh(scapGeo, charId === 'panda' ? darkFurMat : bodyMat);
  scapR.position.set(0.35, 0.12, -0.32);
  scapR.castShadow = true;
  body.add(scapR);

  root.add(body);

  // --- Head & Neck Assembly ---
  // Positioned forward (-Z) and elevated (+Y)
  const head = new THREE.Group();
  head.position.set(0, 1.22, -0.55);

  // Muscular neck
  const neckGeo = new THREE.CylinderGeometry(0.3, 0.38, 0.45, 14);
  neckGeo.rotateX(0.45);
  const neckMesh = new THREE.Mesh(neckGeo, bodyMat);
  neckMesh.position.set(0, -0.22, 0.14);
  neckMesh.castShadow = true;
  head.add(neckMesh);

  // Cranium / Skull
  const skullGeo = new THREE.SphereGeometry(0.38, 20, 20);
  skullGeo.scale(1.05, 0.95, 1.0);
  const skullMesh = new THREE.Mesh(skullGeo, bodyMat);
  skullMesh.castShadow = true;
  head.add(skullMesh);

  // Realistic Muzzle / Snout (extending forward along -Z)
  const snoutGeo = new THREE.CylinderGeometry(
    speciesConfig.snoutWidth * 0.7,
    speciesConfig.snoutWidth,
    speciesConfig.snoutLength,
    14
  );
  snoutGeo.rotateX(-Math.PI * 0.5);
  const snoutMat = charId === 'fox' || charId === 'tiger' ? underbellyMat : bodyMat;
  const snoutMesh = new THREE.Mesh(snoutGeo, snoutMat);
  snoutMesh.position.set(0, -0.08, -0.32);
  snoutMesh.castShadow = true;
  head.add(snoutMesh);

  // Realistic Leathery Rhinarium (Nose with nostrils)
  const noseGeo = new THREE.BoxGeometry(0.12, 0.08, 0.09);
  const noseMat = new THREE.MeshStandardMaterial({
    color: charId === 'bunny' ? 0xea9aa8 : 0x1f1917,
    roughness: 0.45,
    metalness: 0.1,
  });
  const nose = new THREE.Mesh(noseGeo, noseMat);
  nose.position.set(0, -0.04, -0.32 - speciesConfig.snoutLength * 0.5);
  head.add(nose);

  // Realistic 3D Eyes (Left & Right angled naturally on the face)
  const eyeL = createRealisticEye(speciesConfig.irisColor);
  eyeL.position.set(-0.25, 0.08, -0.26);
  eyeL.rotation.y = -0.32;
  head.add(eyeL);

  const eyeR = createRealisticEye(speciesConfig.irisColor);
  eyeR.position.set(0.25, 0.08, -0.26);
  eyeR.rotation.y = 0.32;
  head.add(eyeR);

  // Panda Black Eye Patches
  if (charId === 'panda') {
    const patchGeo = new THREE.SphereGeometry(0.16, 12, 12);
    patchGeo.scale(0.9, 1.2, 0.5);
    const patchL = new THREE.Mesh(patchGeo, darkFurMat);
    patchL.position.set(-0.24, 0.08, -0.25);
    patchL.rotation.z = -0.4;
    head.add(patchL);

    const patchR = new THREE.Mesh(patchGeo, darkFurMat);
    patchR.position.set(0.24, 0.08, -0.25);
    patchR.rotation.z = 0.4;
    head.add(patchR);
  }

  // Realistic Ears
  const leftEar = new THREE.Group();
  leftEar.position.set(-0.28, 0.35, -0.04);
  const rightEar = new THREE.Group();
  rightEar.position.set(0.28, 0.35, -0.04);

  const earMat = charId === 'panda' ? darkFurMat : bodyMat;
  const earInnerMat = new THREE.MeshStandardMaterial({
    color: charId === 'bunny' ? 0xf5afb8 : 0xedd6c5,
    roughness: 0.7,
  });

  if (speciesConfig.earShape === 'round') {
    // Tiger / Panda rounded cupped ears
    const earGeo = new THREE.SphereGeometry(speciesConfig.earScale, 14, 14, 0, Math.PI * 2, 0, Math.PI * 0.75);
    const earMeshL = new THREE.Mesh(earGeo, earMat);
    earMeshL.rotation.x = Math.PI * 0.3;
    leftEar.add(earMeshL);

    const innerGeo = new THREE.SphereGeometry(speciesConfig.earScale * 0.7, 10, 10);
    const innerL = new THREE.Mesh(innerGeo, earInnerMat);
    innerL.position.set(0, 0, -0.04);
    leftEar.add(innerL);

    const earMeshR = new THREE.Mesh(earGeo, earMat);
    earMeshR.rotation.x = Math.PI * 0.3;
    rightEar.add(earMeshR);

    const innerR = new THREE.Mesh(innerGeo, earInnerMat);
    innerR.position.set(0, 0, -0.04);
    rightEar.add(innerR);
  } else if (speciesConfig.earShape === 'tall') {
    // Bunny tall erect ears
    const bunnyEarGeo = new THREE.ConeGeometry(0.12, speciesConfig.earScale, 12);
    bunnyEarGeo.scale(1.1, 1, 0.4);
    const earMeshL = new THREE.Mesh(bunnyEarGeo, earMat);
    earMeshL.position.y = speciesConfig.earScale * 0.5;
    leftEar.add(earMeshL);

    const innerGeo = new THREE.ConeGeometry(0.08, speciesConfig.earScale * 0.8, 10);
    innerGeo.scale(1.0, 1, 0.2);
    const innerL = new THREE.Mesh(innerGeo, earInnerMat);
    innerL.position.set(0, speciesConfig.earScale * 0.45, -0.03);
    leftEar.add(innerL);

    const earMeshR = new THREE.Mesh(bunnyEarGeo, earMat);
    earMeshR.position.y = speciesConfig.earScale * 0.5;
    rightEar.add(earMeshR);

    const innerR = new THREE.Mesh(innerGeo, earInnerMat);
    innerR.position.set(0, speciesConfig.earScale * 0.45, -0.03);
    rightEar.add(innerR);
  } else {
    // Fox pointed triangular ears with dark backs and fluffy white inner tufts
    const foxEarGeo = new THREE.ConeGeometry(0.16, speciesConfig.earScale, 8);
    foxEarGeo.scale(1.2, 1, 0.5);
    const earMeshL = new THREE.Mesh(foxEarGeo, earMat);
    earMeshL.position.y = speciesConfig.earScale * 0.5;
    leftEar.add(earMeshL);

    const innerGeo = new THREE.ConeGeometry(0.1, speciesConfig.earScale * 0.75, 8);
    innerGeo.scale(1, 1, 0.3);
    const innerL = new THREE.Mesh(innerGeo, underbellyMat);
    innerL.position.set(0, speciesConfig.earScale * 0.42, -0.04);
    leftEar.add(innerL);

    const earMeshR = new THREE.Mesh(foxEarGeo, earMat);
    earMeshR.position.y = speciesConfig.earScale * 0.5;
    rightEar.add(earMeshR);

    const innerR = new THREE.Mesh(innerGeo, underbellyMat);
    innerR.position.set(0, speciesConfig.earScale * 0.42, -0.04);
    rightEar.add(innerR);
  }

  head.add(leftEar);
  head.add(rightEar);

  // Hat Anchor Point
  const hatGroup = new THREE.Group();
  hatGroup.position.set(0, 0.38, -0.05);
  head.add(hatGroup);
  attachHat(hatGroup, hatId);

  root.add(head);

  // --- Four Articulated Quadruped Limbs ---
  // Realistic joints: Humerus/Femur -> Radius/Tibia -> Paws with pads
  const legColor = charId === 'panda' ? 0x1f1f24 : speciesConfig.bodyColor;
  const legMat = charId === 'panda' ? darkFurMat : bodyMat;
  const sockMat = charId === 'fox' ? darkFurMat : legMat;

  // Front Left Leg
  const leftFrontLeg = new THREE.Group();
  leftFrontLeg.position.set(-0.35, 0.75, -0.32);

  const armGeo = new THREE.CylinderGeometry(0.11 * speciesConfig.limbThick, 0.09 * speciesConfig.limbThick, 0.42, 12);
  const armMeshL = new THREE.Mesh(armGeo, legMat);
  armMeshL.position.y = -0.21;
  armMeshL.castShadow = true;
  leftFrontLeg.add(armMeshL);

  const forearmGeo = new THREE.CylinderGeometry(0.09 * speciesConfig.limbThick, 0.08 * speciesConfig.limbThick, 0.36, 12);
  const forearmMeshL = new THREE.Mesh(forearmGeo, sockMat);
  forearmMeshL.position.y = -0.56;
  forearmMeshL.castShadow = true;
  leftFrontLeg.add(forearmMeshL);

  const pawFL = createRealisticPaw(charId === 'fox' ? 0x1f1f24 : legColor);
  pawFL.position.set(0, -0.74, 0);
  leftFrontLeg.add(pawFL);

  root.add(leftFrontLeg);

  // Front Right Leg
  const rightFrontLeg = new THREE.Group();
  rightFrontLeg.position.set(0.35, 0.75, -0.32);

  const armMeshR = new THREE.Mesh(armGeo, legMat);
  armMeshR.position.y = -0.21;
  armMeshR.castShadow = true;
  rightFrontLeg.add(armMeshR);

  const forearmMeshR = new THREE.Mesh(forearmGeo, sockMat);
  forearmMeshR.position.y = -0.56;
  forearmMeshR.castShadow = true;
  rightFrontLeg.add(forearmMeshR);

  const pawFR = createRealisticPaw(charId === 'fox' ? 0x1f1f24 : legColor);
  pawFR.position.set(0, -0.74, 0);
  rightFrontLeg.add(pawFR);

  root.add(rightFrontLeg);

  // Back Left Leg (Muscular thigh + backward hock angle)
  const leftBackLeg = new THREE.Group();
  leftBackLeg.position.set(-0.36, 0.78, 0.28);

  const thighGeo = new THREE.CylinderGeometry(0.16 * speciesConfig.limbThick, 0.12 * speciesConfig.limbThick, 0.45, 12);
  thighGeo.rotateX(0.25); // natural backward thigh rake
  const thighMeshL = new THREE.Mesh(thighGeo, legMat);
  thighMeshL.position.set(0, -0.2, 0.04);
  thighMeshL.castShadow = true;
  leftBackLeg.add(thighMeshL);

  const shinGeo = new THREE.CylinderGeometry(0.1 * speciesConfig.limbThick, 0.08 * speciesConfig.limbThick, 0.38, 12);
  shinGeo.rotateX(-0.2); // hock forward reflex
  const shinMeshL = new THREE.Mesh(shinGeo, sockMat);
  shinMeshL.position.set(0, -0.56, -0.02);
  shinMeshL.castShadow = true;
  leftBackLeg.add(shinMeshL);

  const pawBL = createRealisticPaw(charId === 'fox' ? 0x1f1f24 : legColor);
  pawBL.position.set(0, -0.76, -0.05);
  leftBackLeg.add(pawBL);

  root.add(leftBackLeg);

  // Back Right Leg
  const rightBackLeg = new THREE.Group();
  rightBackLeg.position.set(0.36, 0.78, 0.28);

  const thighMeshR = new THREE.Mesh(thighGeo, legMat);
  thighMeshR.position.set(0, -0.2, 0.04);
  thighMeshR.castShadow = true;
  rightBackLeg.add(thighMeshR);

  const shinMeshR = new THREE.Mesh(shinGeo, sockMat);
  shinMeshR.position.set(0, -0.56, -0.02);
  shinMeshR.castShadow = true;
  rightBackLeg.add(shinMeshR);

  const pawBR = createRealisticPaw(charId === 'fox' ? 0x1f1f24 : legColor);
  pawBR.position.set(0, -0.76, -0.05);
  rightBackLeg.add(pawBR);

  root.add(rightBackLeg);

  // --- Tail Assembly ---
  // Attached to haunches (+Z), gracefully flowing backward
  const tail = new THREE.Group();
  tail.position.set(0, 0.82, 0.46);

  if (charId === 'bunny') {
    // Fluffy round cotton tail
    const cottonGeo = new THREE.SphereGeometry(speciesConfig.tailRadius, 14, 14);
    const cottonMesh = new THREE.Mesh(cottonGeo, underbellyMat);
    cottonMesh.position.set(0, 0.05, 0.08);
    cottonMesh.castShadow = true;
    tail.add(cottonMesh);
  } else if (charId === 'panda') {
    // Panda stubby tail
    const pandaTailGeo = new THREE.SphereGeometry(speciesConfig.tailRadius, 12, 12);
    const pMesh = new THREE.Mesh(pandaTailGeo, darkFurMat);
    pMesh.position.set(0, -0.04, 0.08);
    pMesh.castShadow = true;
    tail.add(pMesh);
  } else {
    // Long curving tail (Tiger / Fox)
    const curvePoints = [
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0, 0.15, 0.35),
      new THREE.Vector3(0, 0.05, 0.75),
      new THREE.Vector3(0, 0.25, speciesConfig.tailLength),
    ];
    const curve = new THREE.CatmullRomCurve3(curvePoints);
    const tubeGeo = new THREE.TubeGeometry(curve, 18, speciesConfig.tailRadius, 10, false);
    const tailMesh = new THREE.Mesh(tubeGeo, bodyMat);
    tailMesh.castShadow = true;
    tail.add(tailMesh);

    // Fox white bushy tail tip / Tiger dark tip
    const tipGeo = new THREE.SphereGeometry(speciesConfig.tailRadius * 1.35, 10, 10);
    tipGeo.scale(1, 1, 1.4);
    const tipMat = charId === 'fox' ? underbellyMat : darkFurMat;
    const tipMesh = new THREE.Mesh(tipGeo, tipMat);
    tipMesh.position.copy(curvePoints[3]);
    tipMesh.castShadow = true;
    tail.add(tipMesh);
  }

  root.add(tail);

  // --- Magic Wings attached to Upper Back (+Z/Y) for Flying Power-up ---
  const wingsGroup = new THREE.Group();
  wingsGroup.position.set(0, 0.95, 0.05); // upper back between scapulae
  wingsGroup.visible = false;

  const wingMat = new THREE.MeshStandardMaterial({
    map: getWingFeatherTexture(),
    roughness: 0.15,
    metalness: 0.25,
    emissive: 0x0088aa,
    emissiveIntensity: 0.35,
    transparent: true,
    opacity: 0.95,
    side: THREE.DoubleSide,
  });

  const goldTrimMat = new THREE.MeshStandardMaterial({
    color: 0xffd54f,
    roughness: 0.2,
    metalness: 0.85,
    emissive: 0x664400,
  });

  // Left Wing Group
  const leftWing = new THREE.Group();
  leftWing.position.set(-0.25, 0, 0.05);
  for (let f = 0; f < 5; f++) {
    const fGeo = new THREE.ConeGeometry(0.14 - f * 0.018, 0.75 - f * 0.09, 8);
    const fMesh = new THREE.Mesh(fGeo, f === 0 ? goldTrimMat : wingMat);
    fMesh.rotation.z = 0.55 + f * 0.28;
    fMesh.rotation.x = -0.15;
    fMesh.position.set(-0.28 - f * 0.16, 0.18 - f * 0.08, f * 0.04);
    fMesh.castShadow = true;
    leftWing.add(fMesh);
  }
  wingsGroup.add(leftWing);

  // Right Wing Group
  const rightWing = new THREE.Group();
  rightWing.position.set(0.25, 0, 0.05);
  for (let f = 0; f < 5; f++) {
    const fGeo = new THREE.ConeGeometry(0.14 - f * 0.018, 0.75 - f * 0.09, 8);
    const fMesh = new THREE.Mesh(fGeo, f === 0 ? goldTrimMat : wingMat);
    fMesh.rotation.z = -(0.55 + f * 0.28);
    fMesh.rotation.x = -0.15;
    fMesh.position.set(0.28 + f * 0.16, 0.18 - f * 0.08, f * 0.04);
    fMesh.castShadow = true;
    rightWing.add(fMesh);
  }
  wingsGroup.add(rightWing);

  // Center celestial radiant star crystal
  const gemGeo = new THREE.OctahedronGeometry(0.15, 0);
  const gemMat = new THREE.MeshStandardMaterial({
    color: 0xffe066,
    emissive: 0xffb700,
    metalness: 0.9,
    roughness: 0.1,
  });
  const gemMesh = new THREE.Mesh(gemGeo, gemMat);
  gemMesh.position.set(0, 0.06, 0.1);
  wingsGroup.add(gemMesh);

  root.add(wingsGroup);

  return {
    root,
    head,
    body,
    tail,
    leftFrontLeg,
    rightFrontLeg,
    leftBackLeg,
    rightBackLeg,
    leftEar,
    rightEar,
    hatGroup,
    wingsGroup,
    leftWing,
    rightWing,
  };
}

// -------------------------------------------------------------
// ACCESSORIES ATTACHMENT
// -------------------------------------------------------------
export function attachHat(parent: THREE.Group, hatId: HatId) {
  while (parent.children.length > 0) {
    parent.remove(parent.children[0]);
  }

  if (hatId === 'none') return;

  if (hatId === 'explorer') {
    // Khaki safari pith helmet
    const domeGeo = new THREE.SphereGeometry(0.38, 16, 16, 0, Math.PI * 2, 0, Math.PI * 0.5);
    const helmetMat = new THREE.MeshStandardMaterial({ color: 0xd9c298, roughness: 0.6 });
    const dome = new THREE.Mesh(domeGeo, helmetMat);

    const brimGeo = new THREE.CylinderGeometry(0.52, 0.55, 0.05, 20);
    const brim = new THREE.Mesh(brimGeo, helmetMat);
    brim.position.y = -0.02;

    const bandGeo = new THREE.CylinderGeometry(0.39, 0.39, 0.08, 20);
    const bandMat = new THREE.MeshStandardMaterial({ color: 0x5a3d28, roughness: 0.8 });
    const band = new THREE.Mesh(bandGeo, bandMat);
    band.position.y = 0.05;

    parent.add(dome);
    parent.add(brim);
    parent.add(band);
    parent.position.y = 0.28;
  } else if (hatId === 'crown') {
    // Royal golden crown
    const crownMat = new THREE.MeshStandardMaterial({
      color: 0xffd700,
      metalness: 0.85,
      roughness: 0.25,
    });
    const baseGeo = new THREE.CylinderGeometry(0.3, 0.33, 0.12, 16, 1, true);
    const base = new THREE.Mesh(baseGeo, crownMat);
    parent.add(base);

    const gemMat = new THREE.MeshStandardMaterial({
      color: 0xe60033,
      metalness: 0.4,
      roughness: 0.1,
    });
    const peakCount = 5;
    for (let i = 0; i < peakCount; i++) {
      const angle = (i / peakCount) * Math.PI * 2;
      const peakGeo = new THREE.ConeGeometry(0.055, 0.16, 8);
      const peak = new THREE.Mesh(peakGeo, crownMat);
      peak.position.set(Math.cos(angle) * 0.31, 0.13, Math.sin(angle) * 0.31);
      parent.add(peak);

      const gemGeo = new THREE.SphereGeometry(0.03, 8, 8);
      const gem = new THREE.Mesh(gemGeo, gemMat);
      gem.position.set(Math.cos(angle) * 0.32, 0.02, Math.sin(angle) * 0.32);
      parent.add(gem);
    }
    parent.position.y = 0.32;
  } else if (hatId === 'party') {
    const coneGeo = new THREE.ConeGeometry(0.22, 0.52, 16);
    const coneMat = new THREE.MeshStandardMaterial({ color: 0x00c8ff, roughness: 0.4 });
    const cone = new THREE.Mesh(coneGeo, coneMat);
    cone.position.y = 0.24;

    const pomGeo = new THREE.SphereGeometry(0.08, 12, 12);
    const pomMat = new THREE.MeshStandardMaterial({ color: 0xffdd00, roughness: 0.8 });
    const pom = new THREE.Mesh(pomGeo, pomMat);
    pom.position.y = 0.52;

    parent.add(cone);
    parent.add(pom);
    parent.rotation.z = -0.15;
    parent.position.y = 0.3;
  } else if (hatId === 'flower') {
    const ringGeo = new THREE.TorusGeometry(0.35, 0.04, 8, 20);
    const ringMat = new THREE.MeshStandardMaterial({ color: 0x2e8b57, roughness: 0.8 });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = Math.PI * 0.5;
    parent.add(ring);

    const flowerColors = [0xff69b4, 0xffd700, 0x00bfff, 0xff4500, 0xba55d3];
    for (let i = 0; i < 7; i++) {
      const angle = (i / 7) * Math.PI * 2;
      const fGeo = new THREE.SphereGeometry(0.06, 8, 8);
      const fMat = new THREE.MeshStandardMaterial({
        color: flowerColors[i % flowerColors.length],
        roughness: 0.5,
      });
      const flower = new THREE.Mesh(fGeo, fMat);
      flower.position.set(Math.cos(angle) * 0.36, 0.02, Math.sin(angle) * 0.36);
      parent.add(flower);
    }
    parent.position.y = 0.26;
  } else if (hatId === 'scarf') {
    const neckRingGeo = new THREE.TorusGeometry(0.38, 0.09, 10, 20);
    const scarfMat = new THREE.MeshStandardMaterial({ color: 0xd62828, roughness: 0.7 });
    const neckRing = new THREE.Mesh(neckRingGeo, scarfMat);
    neckRing.rotation.x = Math.PI * 0.5;
    neckRing.position.y = -0.48;

    const tailGeo = new THREE.BoxGeometry(0.12, 0.42, 0.06);
    const tail1 = new THREE.Mesh(tailGeo, scarfMat);
    tail1.position.set(0.16, -0.65, 0.28);
    tail1.rotation.z = 0.2;
    tail1.rotation.y = -0.2;

    parent.add(neckRing);
    parent.add(tail1);
  }
}

// -------------------------------------------------------------
// COLLECTIBLES & POWERUPS
// -------------------------------------------------------------

export function createCoinMesh(): THREE.Group {
  const group = new THREE.Group();

  const coinGeo = new THREE.CylinderGeometry(0.38, 0.38, 0.08, 20);
  const coinMat = new THREE.MeshStandardMaterial({
    color: 0xffd700,
    metalness: 0.88,
    roughness: 0.18,
    emissive: 0x443300,
  });
  const coin = new THREE.Mesh(coinGeo, coinMat);
  coin.rotation.z = Math.PI * 0.5;
  coin.castShadow = true;
  group.add(coin);

  const starGeo = new THREE.SphereGeometry(0.12, 8, 8);
  const starMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    metalness: 0.9,
    roughness: 0.1,
  });
  const starFront = new THREE.Mesh(starGeo, starMat);
  starFront.scale.set(1, 0.4, 1);
  starFront.position.x = 0.045;
  group.add(starFront);

  const starBack = new THREE.Mesh(starGeo, starMat);
  starBack.scale.set(1, 0.4, 1);
  starBack.position.x = -0.045;
  group.add(starBack);

  return group;
}

export function createPowerUpMesh(type: PowerUpType): THREE.Group {
  const group = new THREE.Group();

  if (type === 'MAGNET') {
    const uGeo = new THREE.TorusGeometry(0.35, 0.1, 12, 24, Math.PI);
    const uMat = new THREE.MeshStandardMaterial({ color: 0xe63946, metalness: 0.6, roughness: 0.2 });
    const horseshoe = new THREE.Mesh(uGeo, uMat);
    group.add(horseshoe);

    const tipGeo = new THREE.CylinderGeometry(0.105, 0.105, 0.18, 12);
    const tipMat = new THREE.MeshStandardMaterial({ color: 0xf1faee, metalness: 0.9, roughness: 0.1 });
    const tipL = new THREE.Mesh(tipGeo, tipMat);
    tipL.position.set(-0.35, -0.08, 0);
    const tipR = new THREE.Mesh(tipGeo, tipMat);
    tipR.position.set(0.35, -0.08, 0);
    group.add(tipL);
    group.add(tipR);
  } else if (type === 'SHIELD') {
    const bubbleGeo = new THREE.SphereGeometry(0.48, 16, 16);
    const bubbleMat = new THREE.MeshStandardMaterial({
      color: 0x48cae4,
      transparent: true,
      opacity: 0.55,
      metalness: 0.1,
      roughness: 0.1,
      emissive: 0x0077b6,
    });
    const bubble = new THREE.Mesh(bubbleGeo, bubbleMat);
    group.add(bubble);

    const starGeo = new THREE.OctahedronGeometry(0.24, 0);
    const starMat = new THREE.MeshStandardMaterial({
      color: 0xffd166,
      metalness: 0.8,
      roughness: 0.2,
      emissive: 0xaa8800,
    });
    const star = new THREE.Mesh(starGeo, starMat);
    group.add(star);
  } else if (type === 'BOOST') {
    const curvePoints = [
      new THREE.Vector3(-0.3, -0.2, 0),
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0.3, 0.25, 0),
    ];
    const curve = new THREE.CatmullRomCurve3(curvePoints);
    const bananaGeo = new THREE.TubeGeometry(curve, 16, 0.14, 8, false);
    const bananaMat = new THREE.MeshStandardMaterial({
      color: 0xffe600,
      metalness: 0.3,
      roughness: 0.3,
      emissive: 0x665500,
    });
    const banana = new THREE.Mesh(bananaGeo, bananaMat);
    group.add(banana);
  } else if (type === 'DOUBLE_COIN') {
    const diskGeo = new THREE.CylinderGeometry(0.42, 0.42, 0.1, 20);
    const diskMat = new THREE.MeshStandardMaterial({
      color: 0x9b5de5,
      metalness: 0.6,
      roughness: 0.2,
      emissive: 0x3c096c,
    });
    const disk = new THREE.Mesh(diskGeo, diskMat);
    disk.rotation.z = Math.PI * 0.5;
    group.add(disk);

    const ringGeo = new THREE.TorusGeometry(0.26, 0.05, 8, 16);
    const ringMat = new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xffffff });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.y = Math.PI * 0.5;
    group.add(ring);
  } else if (type === 'DOUBLE_POINTS') {
    const octaGeo = new THREE.OctahedronGeometry(0.4, 1);
    const octaMat = new THREE.MeshStandardMaterial({
      color: 0x00f5d4,
      metalness: 0.7,
      roughness: 0.15,
      emissive: 0x007f5f,
    });
    const diamond = new THREE.Mesh(octaGeo, octaMat);
    group.add(diamond);

    const ringGeo = new THREE.TorusGeometry(0.52, 0.04, 8, 20);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0x70e000 });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = Math.PI * 0.35;
    group.add(ring);
  } else if (type === 'FLYING') {
    const wingMat = new THREE.MeshStandardMaterial({
      color: 0x80deea,
      roughness: 0.15,
      metalness: 0.3,
      emissive: 0x00acc1,
      transparent: true,
      opacity: 0.9,
    });
    const goldFeatherMat = new THREE.MeshStandardMaterial({
      color: 0xffd54f,
      roughness: 0.2,
      metalness: 0.8,
      emissive: 0x664400,
    });

    const leftWingGroup = new THREE.Group();
    for (let f = 0; f < 3; f++) {
      const fGeo = new THREE.ConeGeometry(0.12 - f * 0.02, 0.55 - f * 0.09, 8);
      const fMesh = new THREE.Mesh(fGeo, f === 0 ? goldFeatherMat : wingMat);
      fMesh.rotation.z = 0.55 + f * 0.35;
      fMesh.position.set(-0.2 - f * 0.14, 0.12 - f * 0.09, 0);
      leftWingGroup.add(fMesh);
    }
    group.add(leftWingGroup);

    const rightWingGroup = new THREE.Group();
    for (let f = 0; f < 3; f++) {
      const fGeo = new THREE.ConeGeometry(0.12 - f * 0.02, 0.55 - f * 0.09, 8);
      const fMesh = new THREE.Mesh(fGeo, f === 0 ? goldFeatherMat : wingMat);
      fMesh.rotation.z = -(0.55 + f * 0.35);
      fMesh.position.set(0.2 + f * 0.14, 0.12 - f * 0.09, 0);
      rightWingGroup.add(fMesh);
    }
    group.add(rightWingGroup);

    const starGeo = new THREE.OctahedronGeometry(0.22, 0);
    const starMat = new THREE.MeshStandardMaterial({
      color: 0xffe066,
      emissive: 0xffaa00,
      metalness: 0.9,
      roughness: 0.1,
    });
    const star = new THREE.Mesh(starGeo, starMat);
    group.add(star);

    const haloGeo = new THREE.TorusGeometry(0.38, 0.035, 8, 20);
    const haloMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const halo = new THREE.Mesh(haloGeo, haloMat);
    halo.position.y = 0.3;
    halo.rotation.x = Math.PI * 0.5;
    group.add(halo);
  }

  return group;
}

export function createBonusItemMesh(type: BonusItemType): THREE.Group {
  const group = new THREE.Group();

  if (type === 'COIN_BONUS') {
    const coinGeo = new THREE.CylinderGeometry(0.55, 0.55, 0.12, 24);
    const coinMat = new THREE.MeshStandardMaterial({
      color: 0xffd700,
      metalness: 0.88,
      roughness: 0.18,
      emissive: 0x554400,
    });
    const coin = new THREE.Mesh(coinGeo, coinMat);
    coin.rotation.z = Math.PI * 0.5;
    coin.castShadow = true;
    group.add(coin);
  } else if (type === 'SUPER_COIN') {
    const coinGeo = new THREE.CylinderGeometry(0.72, 0.72, 0.16, 28);
    const coinMat = new THREE.MeshStandardMaterial({
      color: 0xff9e00,
      metalness: 0.92,
      roughness: 0.12,
      emissive: 0x773300,
    });
    const coin = new THREE.Mesh(coinGeo, coinMat);
    coin.rotation.z = Math.PI * 0.5;
    coin.castShadow = true;
    group.add(coin);
  } else if (type === 'STAR_BONUS') {
    const starMat = new THREE.MeshStandardMaterial({
      color: 0xffdd00,
      metalness: 0.85,
      roughness: 0.2,
      emissive: 0xaa7700,
    });
    const center = new THREE.Mesh(new THREE.SphereGeometry(0.25, 12, 12), starMat);
    group.add(center);

    const points = 5;
    for (let i = 0; i < points; i++) {
      const angle = (i / points) * Math.PI * 2;
      const coneGeo = new THREE.ConeGeometry(0.18, 0.52, 8);
      const cone = new THREE.Mesh(coneGeo, starMat);
      cone.position.set(Math.cos(angle) * 0.38, Math.sin(angle) * 0.38, 0);
      cone.rotation.z = angle - Math.PI * 0.5;
      group.add(cone);
    }
  } else if (type === 'GIFT_BOX') {
    const boxGeo = new THREE.BoxGeometry(0.65, 0.65, 0.65);
    const boxMat = new THREE.MeshStandardMaterial({
      color: 0xffb703,
      metalness: 0.6,
      roughness: 0.25,
      emissive: 0x442200,
    });
    const box = new THREE.Mesh(boxGeo, boxMat);
    box.castShadow = true;
    group.add(box);

    const ribbonMat = new THREE.MeshStandardMaterial({
      color: 0xd90429,
      roughness: 0.4,
      metalness: 0.2,
      emissive: 0x330005,
    });
    const rVerGeo = new THREE.BoxGeometry(0.14, 0.66, 0.66);
    const rVer = new THREE.Mesh(rVerGeo, ribbonMat);
    group.add(rVer);

    const rHorGeo = new THREE.BoxGeometry(0.66, 0.66, 0.14);
    const rHor = new THREE.Mesh(rHorGeo, ribbonMat);
    group.add(rHor);
  }

  return group;
}

// -------------------------------------------------------------
// REALISTIC OBSTACLES (PBR Materials & Natural Form)
// -------------------------------------------------------------
export function createObstacleMesh(type: ObstacleType): THREE.Group {
  const group = new THREE.Group();

  if (type === 'LOG') {
    // Weathered fallen mossy tree trunk
    const logGeo = new THREE.CylinderGeometry(0.34, 0.38, 2.1, 16);
    const logMat = new THREE.MeshStandardMaterial({
      map: getTreeBarkTexture(),
      roughness: 0.9,
    });
    const logMesh = new THREE.Mesh(logGeo, logMat);
    logMesh.rotation.z = Math.PI * 0.5;
    logMesh.position.y = 0.34;
    logMesh.castShadow = true;
    logMesh.receiveShadow = true;
    group.add(logMesh);

    // Realistic moss clumps
    const mossGeo = new THREE.SphereGeometry(0.18, 8, 8);
    const mossMat = new THREE.MeshStandardMaterial({ color: 0x2d6a4f, roughness: 0.95 });
    const moss1 = new THREE.Mesh(mossGeo, mossMat);
    moss1.scale.set(1.5, 0.6, 1.2);
    moss1.position.set(0.4, 0.56, 0);
    group.add(moss1);
  } else if (type === 'ROCK') {
    // Natural craggy riverbed boulder
    const rockGeo = new THREE.DodecahedronGeometry(0.52, 1);
    const rockMat = new THREE.MeshStandardMaterial({
      map: getMossyStoneTexture(),
      roughness: 0.9,
    });
    const rock = new THREE.Mesh(rockGeo, rockMat);
    rock.scale.set(1.35, 0.8, 1.05);
    rock.position.y = 0.35;
    rock.castShadow = true;
    rock.receiveShadow = true;
    group.add(rock);
  } else if (type === 'MUSHROOM') {
    // Forest giant bracket fungus / cap
    const stemGeo = new THREE.CylinderGeometry(0.18, 0.28, 0.48, 12);
    const stemMat = new THREE.MeshStandardMaterial({ color: 0xe8dfd8, roughness: 0.7 });
    const stem = new THREE.Mesh(stemGeo, stemMat);
    stem.position.y = 0.24;
    stem.castShadow = true;
    group.add(stem);

    const capGeo = new THREE.SphereGeometry(0.62, 16, 16, 0, Math.PI * 2, 0, Math.PI * 0.55);
    const capMat = new THREE.MeshStandardMaterial({ color: 0xba2d32, roughness: 0.45 });
    const cap = new THREE.Mesh(capGeo, capMat);
    cap.scale.set(1.3, 0.75, 1.0);
    cap.position.y = 0.46;
    cap.castShadow = true;
    group.add(cap);

    // Natural spore spots
    const dotGeo = new THREE.SphereGeometry(0.08, 8, 8);
    const dotMat = new THREE.MeshBasicMaterial({ color: 0xf5f0eb });
    [-0.32, 0, 0.32].forEach((x, idx) => {
      const dot = new THREE.Mesh(dotGeo, dotMat);
      dot.position.set(x, 0.72 + (idx === 1 ? 0.05 : 0), 0.2);
      group.add(dot);
    });
  } else if (type === 'HIGH_VINE') {
    // Hanging jungle lianas & bamboo archway
    const postGeo = new THREE.CylinderGeometry(0.12, 0.14, 3.2, 12);
    const bambooMat = new THREE.MeshStandardMaterial({
      map: getTreeBarkTexture(),
      roughness: 0.75,
    });

    const postL = new THREE.Mesh(postGeo, bambooMat);
    postL.position.set(-1.25, 1.6, 0);
    postL.castShadow = true;
    const postR = new THREE.Mesh(postGeo, bambooMat);
    postR.position.set(1.25, 1.6, 0);
    postR.castShadow = true;
    group.add(postL);
    group.add(postR);

    const barGeo = new THREE.CylinderGeometry(0.12, 0.12, 2.7, 12);
    const bar = new THREE.Mesh(barGeo, bambooMat);
    bar.rotation.z = Math.PI * 0.5;
    bar.position.set(0, 2.7, 0);
    bar.castShadow = true;
    group.add(bar);

    const vineMat = new THREE.MeshStandardMaterial({ color: 0x2d6a4f, roughness: 0.85 });
    for (let x = -0.8; x <= 0.8; x += 0.35) {
      const vineLen = 1.35;
      const vGeo = new THREE.CylinderGeometry(0.035, 0.035, vineLen, 6);
      const vine = new THREE.Mesh(vGeo, vineMat);
      vine.position.set(x, 2.7 - vineLen / 2, 0);
      group.add(vine);
    }
  } else if (type === 'BAMBOO_GATE') {
    // Ancient stone/wood lintel bridge arch
    const postGeo = new THREE.CylinderGeometry(0.15, 0.18, 3.0, 10);
    const woodMat = new THREE.MeshStandardMaterial({
      map: getTreeBarkTexture(),
      roughness: 0.85,
    });

    const pL = new THREE.Mesh(postGeo, woodMat);
    pL.position.set(-1.2, 1.5, 0);
    const pR = new THREE.Mesh(postGeo, woodMat);
    pR.position.set(1.2, 1.5, 0);
    group.add(pL);
    group.add(pR);

    const plankGeo = new THREE.BoxGeometry(2.8, 0.6, 0.25);
    const plank = new THREE.Mesh(plankGeo, woodMat);
    plank.position.set(0, 2.4, 0);
    plank.castShadow = true;
    group.add(plank);
  } else if (type === 'TOTEM_POLE') {
    // Ancient carved stone monolith / totem pillar
    const totemGeo = new THREE.CylinderGeometry(0.42, 0.48, 2.8, 16);
    const totemMat = new THREE.MeshStandardMaterial({
      map: getMossyStoneTexture(),
      roughness: 0.85,
    });
    const totem = new THREE.Mesh(totemGeo, totemMat);
    totem.position.y = 1.4;
    totem.castShadow = true;
    group.add(totem);
  } else if (type === 'PALM_STUMP') {
    // Weathered ancient stump
    const stumpGeo = new THREE.CylinderGeometry(0.46, 0.58, 2.4, 14);
    const stumpMat = new THREE.MeshStandardMaterial({
      map: getTreeBarkTexture(),
      roughness: 0.9,
    });
    const stump = new THREE.Mesh(stumpGeo, stumpMat);
    stump.position.y = 1.2;
    stump.castShadow = true;
    group.add(stump);
  }

  return group;
}

// -------------------------------------------------------------
// BIOME SCENERY ASSETS
// (Tropical Trees, Ancient Ruins Pillars, Mountain Pines, Boulders)
// -------------------------------------------------------------

export function createPalmTree(): THREE.Group {
  const tree = new THREE.Group();

  const trunkMat = new THREE.MeshStandardMaterial({
    map: getTreeBarkTexture(),
    roughness: 0.85,
  });

  const segments = 6;
  let currentY = 0;
  for (let i = 0; i < segments; i++) {
    const radiusTop = 0.32 - i * 0.025;
    const radiusBottom = 0.36 - i * 0.025;
    const height = 0.95;
    const trunkGeo = new THREE.CylinderGeometry(radiusTop, radiusBottom, height, 10);
    const seg = new THREE.Mesh(trunkGeo, trunkMat);
    seg.position.set(Math.sin(i * 0.35) * 0.2, currentY + height / 2, 0);
    seg.rotation.z = Math.sin(i * 0.3) * 0.08;
    seg.castShadow = true;
    tree.add(seg);
    currentY += height;
  }

  // Realistic tropical fronds
  const frondMat = new THREE.MeshStandardMaterial({
    color: 0x1b4332,
    roughness: 0.65,
    side: THREE.DoubleSide,
  });
  const frondCount = 7;
  for (let i = 0; i < frondCount; i++) {
    const angle = (i / frondCount) * Math.PI * 2;
    const frondGroup = new THREE.Group();
    frondGroup.position.set(0, currentY, 0);
    frondGroup.rotation.y = angle;

    const leafGeo = new THREE.ConeGeometry(0.65, 2.6, 8);
    leafGeo.scale(1, 1, 0.15);
    const leaf = new THREE.Mesh(leafGeo, frondMat);
    leaf.position.set(0, 0.8, 1.0);
    leaf.rotation.x = 1.1;
    leaf.castShadow = true;
    frondGroup.add(leaf);
    tree.add(frondGroup);
  }

  return tree;
}

// Ancient Ruins Stone Pillar
export function createRuinsPillar(): THREE.Group {
  const pillar = new THREE.Group();
  const stoneMat = new THREE.MeshStandardMaterial({
    map: getMossyStoneTexture(),
    roughness: 0.88,
  });

  // Base plinth
  const baseGeo = new THREE.BoxGeometry(1.2, 0.5, 1.2);
  const base = new THREE.Mesh(baseGeo, stoneMat);
  base.position.y = 0.25;
  base.castShadow = true;
  pillar.add(base);

  // Column shaft
  const colGeo = new THREE.CylinderGeometry(0.45, 0.5, 3.8, 14);
  const col = new THREE.Mesh(colGeo, stoneMat);
  col.position.y = 2.4;
  col.castShadow = true;
  pillar.add(col);

  // Capital / top
  const capGeo = new THREE.BoxGeometry(1.1, 0.4, 1.1);
  const cap = new THREE.Mesh(capGeo, stoneMat);
  cap.position.y = 4.4;
  cap.castShadow = true;
  pillar.add(cap);

  return pillar;
}

// Mountain Alpine Pine Tree
export function createPineTree(): THREE.Group {
  const tree = new THREE.Group();
  const trunkMat = new THREE.MeshStandardMaterial({
    map: getTreeBarkTexture(),
    roughness: 0.9,
  });
  const trunkGeo = new THREE.CylinderGeometry(0.25, 0.35, 4.5, 8);
  const trunk = new THREE.Mesh(trunkGeo, trunkMat);
  trunk.position.y = 2.25;
  trunk.castShadow = true;
  tree.add(trunk);

  // Tiered pine foliage cones
  const needleMat = new THREE.MeshStandardMaterial({
    color: 0x1b3b22,
    roughness: 0.8,
  });

  const tiers = 4;
  for (let t = 0; t < tiers; t++) {
    const radius = 1.8 - t * 0.35;
    const height = 1.6;
    const coneGeo = new THREE.ConeGeometry(radius, height, 8);
    const cone = new THREE.Mesh(coneGeo, needleMat);
    cone.position.y = 2.0 + t * 1.1;
    cone.castShadow = true;
    tree.add(cone);
  }

  return tree;
}

// River Canyon Boulder
export function createMountainRock(): THREE.Group {
  const group = new THREE.Group();
  const rockGeo = new THREE.DodecahedronGeometry(1.2, 1);
  const rockMat = new THREE.MeshStandardMaterial({
    map: getMossyStoneTexture(),
    roughness: 0.9,
  });
  const rock = new THREE.Mesh(rockGeo, rockMat);
  rock.scale.set(1.4, 0.9, 1.2);
  rock.position.y = 0.8;
  rock.castShadow = true;
  group.add(rock);
  return group;
}

export function createJungleBush(): THREE.Group {
  const bush = new THREE.Group();
  const bushMat = new THREE.MeshStandardMaterial({ color: 0x2d6a4f, roughness: 0.85 });
  const counts = 3;
  for (let i = 0; i < counts; i++) {
    const r = 0.5 + Math.random() * 0.3;
    const sphere = new THREE.Mesh(new THREE.DodecahedronGeometry(r, 1), bushMat);
    sphere.position.set((Math.random() - 0.5) * 0.6, r * 0.7, (Math.random() - 0.5) * 0.6);
    sphere.castShadow = true;
    bush.add(sphere);
  }
  return bush;
}

export function createButterfly(): { group: THREE.Group; update: (t: number) => void } {
  const group = new THREE.Group();
  const wingMat = new THREE.MeshStandardMaterial({
    color: Math.random() > 0.5 ? 0x00f5d4 : 0xfee440,
    side: THREE.DoubleSide,
    roughness: 0.3,
  });

  const wingGeo = new THREE.PlaneGeometry(0.2, 0.16);
  const leftWing = new THREE.Mesh(wingGeo, wingMat);
  leftWing.position.x = -0.1;
  const rightWing = new THREE.Mesh(wingGeo, wingMat);
  rightWing.position.x = 0.1;

  group.add(leftWing);
  group.add(rightWing);

  const initialY = 1.5 + Math.random() * 1.5;
  const speed = 6 + Math.random() * 4;

  const update = (time: number) => {
    const flap = Math.sin(time * speed) * 0.8;
    leftWing.rotation.y = flap;
    rightWing.rotation.y = -flap;
    group.position.y = initialY + Math.sin(time * 2) * 0.25;
  };

  return { group, update };
}
