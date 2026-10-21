import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import {
  CharacterAnimRefs,
  attachHat,
  createBonusItemMesh,
  createButterfly,
  createCharacterMesh,
  createCoinMesh,
  createJungleBush,
  createMountainRock,
  createObstacleMesh,
  createPalmTree,
  createPineTree,
  createPowerUpMesh,
  createRuinsPillar,
  getDirtTrackTexture,
  getMossyStoneTexture,
  getRiverWaterTexture,
} from './proceduralModels';
import {
  BiomeType,
  BonusItemType,
  BonusNotification,
  CharacterId,
  GraphicsQuality,
  HatId,
  Lane,
  ObstacleType,
  PowerUpActive,
  PowerUpType,
  RunStats,
} from '../types/game';
import { sounds } from '../audio/SoundEffects';

// Constants
const LANE_WIDTH = 2.2;
const CHUNK_LENGTH = 28;
const NUM_CHUNKS = 9;
const TRACK_WIDTH = 7.6;

interface ActiveCoin {
  mesh: THREE.Group;
  lane: Lane;
  z: number;
  y: number;
  collected: boolean;
  baseY: number;
}

interface ActiveObstacle {
  mesh: THREE.Group;
  type: ObstacleType;
  lane: Lane;
  z: number;
  y: number;
  width: number;
  height: number;
  isOverhead: boolean;
  cleared: boolean;
}

interface ActivePowerUp {
  mesh: THREE.Group;
  type: PowerUpType;
  lane: Lane;
  z: number;
  y: number;
  collected: boolean;
}

interface ActiveBonusItem {
  mesh: THREE.Group;
  type: BonusItemType;
  lane: Lane;
  z: number;
  y: number;
  baseY: number;
  collected: boolean;
}

interface ChunkData {
  group: THREE.Group;
  z: number;
  biome: BiomeType;
  obstacles: ActiveObstacle[];
  coins: ActiveCoin[];
  powerUps: ActivePowerUp[];
  bonusItems: ActiveBonusItem[];
}

export class GameWorld {
  private container: HTMLElement;
  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private isSoftwareGl: boolean;
  private animFrameId = 0;
  private clock = new THREE.Clock();

  // Character
  private charRefs!: CharacterAnimRefs;
  private currentCharId: CharacterId = 'tiger';
  private currentHatId: HatId = 'none';

  // Player State
  private currentLane: Lane = 0;
  private targetLane: Lane = 0;
  private playerPos = new THREE.Vector3(0, 0, 0);
  private playerVelocityY = 0;
  private isGrounded = true;
  private isSliding = false;
  private slideTimer = 0;
  private isStumbling = false;
  private stumbleTimer = 0;
  private invulnerableTimer = 0;

  // Speeds, Mode & Quality
  private isKidsMode = false;
  private graphicsQuality: GraphicsQuality = 'HIGH';
  private currentBiome: BiomeType = 'JUNGLE';
  private announcedBiomes = new Set<string>();
  private baseSpeed = 16;
  private currentSpeed = 16;
  private distanceRun = 0;
  private coinsCollected = 0;
  private bonusPoints = 0;
  private powerupsUsedCount = 0;
  private reachedMilestones = new Set<number>();
  private reviveCount = 0;
  private comboCount = 0;
  private lastCoinTime = 0;

  // Active Powerups
  private activePowerUps = new Map<PowerUpType, PowerUpActive>();
  private shieldBubble: THREE.Mesh | null = null;
  private speedAura: THREE.Mesh | null = null;

  // Lighting & Environment
  private sunLight!: THREE.DirectionalLight;
  private hemiLight!: THREE.HemisphereLight;
  private ambLight!: THREE.AmbientLight;

  // Chunks & World
  private chunks: ChunkData[] = [];
  private butterflies: { group: THREE.Group; update: (t: number) => void }[] = [];
  private dustParticles: { mesh: THREE.Mesh; life: number; maxLife: number; vel: THREE.Vector3 }[] = [];
  private coinSparkles: { mesh: THREE.Mesh; life: number; maxLife: number; vel: THREE.Vector3 }[] = [];

  // Callbacks
  private onStatsUpdate: (stats: {
    score: number;
    distance: number;
    coins: number;
    bonusPoints: number;
    multiplier: number;
    biome?: BiomeType;
  }) => void;
  private onPowerUpsUpdate: (powerups: PowerUpActive[]) => void;
  private onBonusNotification?: (notification: BonusNotification) => void;
  private onTriggerRevivePrompt?: (stats: RunStats) => void;
  private onGameOver: (finalStats: RunStats) => void;

  // Game flow
  private isRunning = false;
  private isPaused = false;

  constructor(
    container: HTMLElement,
    options: {
      characterId: CharacterId;
      hatId: HatId;
      kidsMode: boolean;
      graphicsQuality?: GraphicsQuality;
      onStatsUpdate: (stats: {
        score: number;
        distance: number;
        coins: number;
        bonusPoints: number;
        multiplier: number;
        biome?: BiomeType;
      }) => void;
      onPowerUpsUpdate: (powerups: PowerUpActive[]) => void;
      onBonusNotification?: (notification: BonusNotification) => void;
      onTriggerRevivePrompt?: (stats: RunStats) => void;
      onGameOver: (finalStats: RunStats) => void;
    }
  ) {
    this.container = container;
    this.currentCharId = options.characterId;
    this.currentHatId = options.hatId;
    this.isKidsMode = options.kidsMode;
    this.graphicsQuality = options.graphicsQuality || 'HIGH';
    this.onStatsUpdate = options.onStatsUpdate;
    this.onPowerUpsUpdate = options.onPowerUpsUpdate;
    this.onBonusNotification = options.onBonusNotification;
    this.onTriggerRevivePrompt = options.onTriggerRevivePrompt;
    this.onGameOver = options.onGameOver;

    // Detect software GL
    this.isSoftwareGl = (() => {
      const gl = document.createElement('canvas').getContext('webgl2');
      if (!gl) return true;
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
      const gpu = String(gl.getParameter(param));
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    })();

    // Renderer setup
    this.renderer = new THREE.WebGLRenderer({
      antialias: !this.isSoftwareGl,
      powerPreference: 'high-performance',
      alpha: false,
    });
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;
    this.applyQualitySettings(this.graphicsQuality);
    this.renderer.setSize(container.clientWidth, container.clientHeight);

    container.appendChild(this.renderer.domElement);

    // Scene & Atmospheric Fog
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x87ceeb);
    this.scene.fog = new THREE.FogExp2(0x1f472e, 0.009);

    this.camera = new THREE.PerspectiveCamera(
      58,
      container.clientWidth / container.clientHeight,
      0.1,
      280
    );
    this.camera.position.set(0, 4.4, 6.8);
    this.camera.lookAt(0, 1.4, -6);

    // Lighting & Studio Environment
    this.setupLighting();
    this.setupEnvironment();

    // Spawn Character
    this.setupCharacter();

    // Spawn Initial World Chunks
    this.setupTrack();

    // Setup Particle Pools
    this.setupParticles();

    // Bind Resize
    window.addEventListener('resize', this.onResize);
  }

  private applyQualitySettings(quality: GraphicsQuality) {
    if (this.isSoftwareGl) {
      this.renderer.setPixelRatio(1);
      this.renderer.shadowMap.enabled = false;
      return;
    }

    if (quality === 'LOW') {
      this.renderer.setPixelRatio(1.0);
      this.renderer.shadowMap.enabled = false;
    } else if (quality === 'MEDIUM') {
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
      this.renderer.shadowMap.enabled = true;
      this.renderer.shadowMap.type = THREE.BasicShadowMap;
    } else {
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2.0));
      this.renderer.shadowMap.enabled = true;
      this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    }
  }

  public setGraphicsQuality(quality: GraphicsQuality) {
    this.graphicsQuality = quality;
    this.applyQualitySettings(quality);
    if (this.sunLight && this.sunLight.shadow) {
      const mapRes = quality === 'LOW' ? 512 : quality === 'MEDIUM' ? 1024 : 2048;
      this.sunLight.shadow.mapSize.set(mapRes, mapRes);
    }
  }

  private setupLighting() {
    // Warm natural key sunlight
    this.sunLight = new THREE.DirectionalLight(0xfff3d6, 1.85);
    this.sunLight.position.set(20, 40, 20);
    this.sunLight.castShadow = !this.isSoftwareGl && this.graphicsQuality !== 'LOW';
    if (this.sunLight.castShadow) {
      const mapRes = this.graphicsQuality === 'HIGH' ? 2048 : 1024;
      this.sunLight.shadow.mapSize.width = mapRes;
      this.sunLight.shadow.mapSize.height = mapRes;
      this.sunLight.shadow.camera.near = 0.5;
      this.sunLight.shadow.camera.far = 100;
      this.sunLight.shadow.camera.left = -16;
      this.sunLight.shadow.camera.right = 16;
      this.sunLight.shadow.camera.top = 20;
      this.sunLight.shadow.camera.bottom = -16;
      this.sunLight.shadow.bias = -0.0005;
      this.sunLight.shadow.normalBias = 0.02;
    }
    this.scene.add(this.sunLight);

    // Natural hemisphere fill (sky light & ground bounce)
    this.hemiLight = new THREE.HemisphereLight(0x90e0ef, 0x2d6a4f, 1.15);
    this.scene.add(this.hemiLight);

    // Ambient fill
    this.ambLight = new THREE.AmbientLight(0xffffff, 0.45);
    this.scene.add(this.ambLight);
  }

  private setupEnvironment() {
    const pmremGenerator = new THREE.PMREMGenerator(this.renderer);
    this.scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    // Natural atmospheric cumulus clouds
    const cloudMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.85 });
    for (let i = 0; i < 20; i++) {
      const cloudGroup = new THREE.Group();
      const count = 3 + Math.floor(Math.random() * 3);
      for (let j = 0; j < count; j++) {
        const cGeo = new THREE.SphereGeometry(3 + Math.random() * 2.5, 8, 8);
        const cMesh = new THREE.Mesh(cGeo, cloudMat);
        cMesh.position.set(j * 3, Math.random() * 1.5, Math.random() * 2);
        cloudGroup.add(cMesh);
      }
      cloudGroup.position.set(
        (Math.random() - 0.5) * 160,
        28 + Math.random() * 20,
        -Math.random() * 220
      );
      this.scene.add(cloudGroup);
    }
  }

  private setupCharacter() {
    this.charRefs = createCharacterMesh(this.currentCharId, this.currentHatId);
    this.scene.add(this.charRefs.root);
    this.playerPos.set(0, 0, 0);
    this.charRefs.root.position.copy(this.playerPos);

    // Protective Bubble for Star Shield
    const bubbleGeo = new THREE.SphereGeometry(1.25, 20, 20);
    const bubbleMat = new THREE.MeshStandardMaterial({
      color: 0x48cae4,
      transparent: true,
      opacity: 0.45,
      roughness: 0.1,
      metalness: 0.2,
      emissive: 0x0077b6,
    });
    this.shieldBubble = new THREE.Mesh(bubbleGeo, bubbleMat);
    this.shieldBubble.position.set(0, 0.8, 0);
    this.shieldBubble.visible = false;
    this.charRefs.root.add(this.shieldBubble);

    // Boost rainbow aura ring
    const ringGeo = new THREE.TorusGeometry(0.9, 0.08, 8, 24);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0xffdd00 });
    this.speedAura = new THREE.Mesh(ringGeo, ringMat);
    this.speedAura.rotation.x = Math.PI * 0.5;
    this.speedAura.position.set(0, 0.2, 0);
    this.speedAura.visible = false;
    this.charRefs.root.add(this.speedAura);
  }

  public setCharacter(charId: CharacterId, hatId: HatId) {
    this.currentCharId = charId;
    this.currentHatId = hatId;
    this.scene.remove(this.charRefs.root);
    this.setupCharacter();
  }

  public setKidsMode(enabled: boolean) {
    this.isKidsMode = enabled;
    this.baseSpeed = enabled ? 12 : 16;
    if (this.currentSpeed < this.baseSpeed) {
      this.currentSpeed = this.baseSpeed;
    }
  }

  public getBiomeForDistance(distance: number): BiomeType {
    if (this.activePowerUps.has('FLYING')) return 'SKY';
    const cycle = Math.floor(distance / 500) % 4;
    switch (cycle) {
      case 0: return 'JUNGLE';
      case 1: return 'RUINS';
      case 2: return 'WATERFALL';
      case 3: return 'MOUNTAIN';
      default: return 'JUNGLE';
    }
  }

  private announceBiome(biome: BiomeType) {
    const key = `${biome}-${Math.floor(this.distanceRun / 500)}`;
    if (this.announcedBiomes.has(key)) return;
    this.announcedBiomes.add(key);

    const announcements: Record<BiomeType, { title: string; subtitle: string; icon: string; color: string }> = {
      JUNGLE: {
        title: 'Tropical Jungle Canopy 🌿',
        subtitle: 'Lush tropical trees, hanging vines & wild trails!',
        icon: '🌴',
        color: '#2d6a4f',
      },
      RUINS: {
        title: 'Ancient Stone Ruins 🏛️',
        subtitle: 'Weathered temples, carved monoliths & mossy flagstones!',
        icon: '🏛️',
        color: '#b08968',
      },
      WATERFALL: {
        title: 'River & Waterfall Canyon 🌊',
        subtitle: 'Rushing mountain stream, wet rocks & canyon mist!',
        icon: '🌊',
        color: '#0077b6',
      },
      MOUNTAIN: {
        title: 'Highland Mountain Forest 🏔️',
        subtitle: 'Alpine pine trees, craggy boulders & cool mountain air!',
        icon: '🌲',
        color: '#457b9d',
      },
      SKY: {
        title: 'Magical Sky Flight 🪽✨',
        subtitle: 'Soaring high above the jungle canopy!',
        icon: '🪽',
        color: '#00b4d8',
      },
    };

    const info = announcements[biome];
    if (info) {
      this.onBonusNotification?.({
        id: `biome-${key}-${Date.now()}`,
        title: info.title,
        subtitle: info.subtitle,
        icon: info.icon,
        color: info.color,
      });
    }
  }

  private setupTrack() {
    for (let i = 0; i < NUM_CHUNKS; i++) {
      const zPos = -i * CHUNK_LENGTH;
      const biome = this.getBiomeForDistance(-zPos);
      const chunk = this.createChunk(zPos, i < 2, biome);
      this.chunks.push(chunk);
      this.scene.add(chunk.group);
    }
  }

  private createChunk(zPos: number, isStartingChunk = false, biome: BiomeType = 'JUNGLE'): ChunkData {
    const group = new THREE.Group();
    group.position.z = zPos;

    // Running Track Ground Mesh with Realistic PBR Texture
    const pathGeo = new THREE.PlaneGeometry(TRACK_WIDTH, CHUNK_LENGTH);
    const pathMat = new THREE.MeshStandardMaterial({
      map: biome === 'RUINS' ? getMossyStoneTexture() : getDirtTrackTexture(),
      roughness: biome === 'RUINS' ? 0.85 : 0.9,
      metalness: 0.05,
    });
    const pathMesh = new THREE.Mesh(pathGeo, pathMat);
    pathMesh.rotation.x = -Math.PI * 0.5;
    pathMesh.position.y = 0.01;
    pathMesh.receiveShadow = true;
    group.add(pathMesh);

    // Three-lane guide markers / dividers
    const dividerMat = new THREE.MeshStandardMaterial({
      color: biome === 'RUINS' ? 0x8d99ae : 0xd4a373,
      roughness: 0.9,
    });
    for (let z = -CHUNK_LENGTH / 2 + 2; z < CHUNK_LENGTH / 2; z += 3.5) {
      [-LANE_WIDTH / 2, LANE_WIDTH / 2].forEach((x) => {
        const stoneGeo = new THREE.BoxGeometry(0.18, 0.04, 0.8);
        const stone = new THREE.Mesh(stoneGeo, dividerMat);
        stone.position.set(x, 0.02, z);
        stone.receiveShadow = true;
        group.add(stone);
      });
    }

    // Flanking Terrain Margins (Jungle grass, Ancient flagstones, River channels, or Mountain pine floor)
    const marginGeo = new THREE.PlaneGeometry(80, CHUNK_LENGTH);
    const marginColor = {
      JUNGLE: 0x2d6a4f,
      RUINS: 0x4a4e4d,
      WATERFALL: 0x105670,
      MOUNTAIN: 0x1b3b22,
      SKY: 0x80deea,
    }[biome];

    const marginMat = new THREE.MeshStandardMaterial({
      color: marginColor,
      map: biome === 'WATERFALL' ? getRiverWaterTexture() : undefined,
      roughness: biome === 'WATERFALL' ? 0.2 : 0.95,
      metalness: biome === 'WATERFALL' ? 0.15 : 0.02,
    });

    const leftMargin = new THREE.Mesh(marginGeo, marginMat);
    leftMargin.rotation.x = -Math.PI * 0.5;
    leftMargin.position.set(-TRACK_WIDTH / 2 - 40, 0, 0);
    leftMargin.receiveShadow = true;
    group.add(leftMargin);

    const rightMargin = new THREE.Mesh(marginGeo, marginMat);
    rightMargin.rotation.x = -Math.PI * 0.5;
    rightMargin.position.set(TRACK_WIDTH / 2 + 40, 0, 0);
    rightMargin.receiveShadow = true;
    group.add(rightMargin);

    // Track boundary curbs
    const borderMat = new THREE.MeshStandardMaterial({
      color: biome === 'RUINS' ? 0x5c5d5e : 0x6f4e37,
      roughness: 0.85,
    });
    [-TRACK_WIDTH / 2, TRACK_WIDTH / 2].forEach((x) => {
      const railGeo = new THREE.CylinderGeometry(0.12, 0.12, CHUNK_LENGTH, 8);
      const rail = new THREE.Mesh(railGeo, borderMat);
      rail.rotation.x = Math.PI * 0.5;
      rail.position.set(x, 0.12, 0);
      rail.castShadow = true;
      group.add(rail);
    });

    // Biome-Specific Environment Props
    const propCount = 2 + Math.floor(Math.random() * 2);
    for (let i = 0; i < propCount; i++) {
      const side = Math.random() > 0.5 ? 1 : -1;
      const x = side * (TRACK_WIDTH / 2 + 2.5 + Math.random() * 4.5);
      const z = (Math.random() - 0.5) * CHUNK_LENGTH;

      if (biome === 'RUINS') {
        const pillar = createRuinsPillar();
        pillar.position.set(x, 0, z);
        pillar.scale.setScalar(0.85 + Math.random() * 0.3);
        group.add(pillar);

        if (Math.random() > 0.5) {
          const rock = createMountainRock();
          rock.position.set(x + (Math.random() - 0.5) * 2, 0, z + (Math.random() - 0.5) * 2);
          group.add(rock);
        }
      } else if (biome === 'MOUNTAIN') {
        const pine = createPineTree();
        pine.position.set(x, 0, z);
        pine.scale.setScalar(0.85 + Math.random() * 0.35);
        group.add(pine);

        const rock = createMountainRock();
        rock.position.set(x + (Math.random() - 0.5) * 2, 0, z + (Math.random() - 0.5) * 2);
        group.add(rock);
      } else if (biome === 'WATERFALL') {
        const rock = createMountainRock();
        rock.position.set(x, 0, z);
        rock.scale.setScalar(0.9 + Math.random() * 0.4);
        group.add(rock);

        const bush = createJungleBush();
        bush.position.set(x + (Math.random() - 0.5) * 2, 0, z + (Math.random() - 0.5) * 2);
        group.add(bush);
      } else {
        // JUNGLE
        const tree = createPalmTree();
        tree.position.set(x, 0, z);
        tree.scale.setScalar(0.85 + Math.random() * 0.3);
        group.add(tree);

        const bush = createJungleBush();
        bush.position.set(x + (Math.random() - 0.5) * 2, 0, z + (Math.random() - 0.5) * 2);
        group.add(bush);
      }
    }

    // Occasional Butterflies in Jungle and Waterfall biomes
    if ((biome === 'JUNGLE' || biome === 'WATERFALL') && Math.random() > 0.4) {
      const bFly = createButterfly();
      bFly.group.position.set(
        (Math.random() - 0.5) * TRACK_WIDTH,
        1.5,
        (Math.random() - 0.5) * CHUNK_LENGTH
      );
      group.add(bFly.group);
      this.butterflies.push(bFly);
    }

    const obstacles: ActiveObstacle[] = [];
    const coins: ActiveCoin[] = [];
    const powerUps: ActivePowerUp[] = [];
    const bonusItems: ActiveBonusItem[] = [];

    if (!isStartingChunk) {
      this.populateChunkContent(group, obstacles, coins, powerUps, bonusItems, zPos);
    }

    return {
      group,
      z: zPos,
      biome,
      obstacles,
      coins,
      powerUps,
      bonusItems,
    };
  }

  private populateChunkContent(
    group: THREE.Group,
    obstacles: ActiveObstacle[],
    coins: ActiveCoin[],
    powerUps: ActivePowerUp[],
    bonusItems: ActiveBonusItem[],
    chunkZ: number
  ) {
    const lanes: Lane[] = [-1, 0, 1];
    const spacing = this.isKidsMode ? 14 : 10;
    const obstacleTypes: ObstacleType[] = [
      'LOG',
      'ROCK',
      'MUSHROOM',
      'HIGH_VINE',
      'BAMBOO_GATE',
      'TOTEM_POLE',
      'PALM_STUMP',
    ];

    const obstacleCount = this.isKidsMode ? 1 : (Math.random() > 0.4 ? 2 : 1);

    for (let step = 0; step < obstacleCount; step++) {
      const localZ = -CHUNK_LENGTH / 2 + 6 + step * spacing;
      const worldZ = chunkZ + localZ;

      const type = obstacleTypes[Math.floor(Math.random() * obstacleTypes.length)];
      const blockedLane = lanes[Math.floor(Math.random() * lanes.length)];

      const obsMesh = createObstacleMesh(type);
      obsMesh.position.set(blockedLane * LANE_WIDTH, 0, localZ);
      group.add(obsMesh);

      const isOverhead = type === 'HIGH_VINE' || type === 'BAMBOO_GATE';
      const isLowJump = type === 'LOG' || type === 'ROCK' || type === 'MUSHROOM';

      obstacles.push({
        mesh: obsMesh,
        type,
        lane: blockedLane,
        z: worldZ,
        y: isOverhead ? 2.2 : 0.4,
        width: 1.8,
        height: isOverhead ? 1.0 : (isLowJump ? 0.7 : 2.5),
        isOverhead,
        cleared: false,
      });

      if (isLowJump) {
        [-2.5, 0, 2.5].forEach((offsetZ, idx) => {
          const coinZ = worldZ + offsetZ;
          const coinY = idx === 1 ? 2.0 : 1.1;
          const coinMesh = createCoinMesh();
          coinMesh.position.set(blockedLane * LANE_WIDTH, coinY, localZ + offsetZ);
          group.add(coinMesh);

          coins.push({
            mesh: coinMesh,
            lane: blockedLane,
            z: coinZ,
            y: coinY,
            baseY: coinY,
            collected: false,
          });
        });
      } else if (isOverhead) {
        [-2, 0, 2].forEach((offsetZ) => {
          const coinZ = worldZ + offsetZ;
          const coinY = 0.5;
          const coinMesh = createCoinMesh();
          coinMesh.position.set(blockedLane * LANE_WIDTH, coinY, localZ + offsetZ);
          group.add(coinMesh);

          coins.push({
            mesh: coinMesh,
            lane: blockedLane,
            z: coinZ,
            y: coinY,
            baseY: coinY,
            collected: false,
          });
        });
      }
    }

    // Regular Coin Runs
    const openLanes = lanes.filter((l) => !obstacles.some((o) => Math.abs(o.z - chunkZ) < 8 && o.lane === l));
    const targetCoinLane = openLanes.length > 0 ? openLanes[Math.floor(Math.random() * openLanes.length)] : 0;

    const coinCount = this.isKidsMode ? 5 : 4;
    for (let c = 0; c < coinCount; c++) {
      const localZ = -CHUNK_LENGTH / 2 + 3 + c * 2.2;
      const worldZ = chunkZ + localZ;
      if (obstacles.some((o) => Math.abs(o.z - worldZ) < 2.0 && o.lane === targetCoinLane)) {
        continue;
      }
      const coinMesh = createCoinMesh();
      coinMesh.position.set(targetCoinLane * LANE_WIDTH, 0.75, localZ);
      group.add(coinMesh);

      coins.push({
        mesh: coinMesh,
        lane: targetCoinLane,
        z: worldZ,
        y: 0.75,
        baseY: 0.75,
        collected: false,
      });
    }

    // Power-up Pickups (~25% chance per chunk)
    const powerUpTypes: PowerUpType[] = ['MAGNET', 'SHIELD', 'BOOST', 'DOUBLE_POINTS', 'DOUBLE_COIN', 'FLYING'];
    if (Math.random() < 0.28) {
      const puType = powerUpTypes[Math.floor(Math.random() * powerUpTypes.length)];
      const puLane = lanes[Math.floor(Math.random() * lanes.length)];
      const localZ = (Math.random() - 0.5) * (CHUNK_LENGTH - 10);
      const worldZ = chunkZ + localZ;

      if (!obstacles.some((o) => Math.abs(o.z - worldZ) < 3.0 && o.lane === puLane)) {
        const puMesh = createPowerUpMesh(puType);
        puMesh.position.set(puLane * LANE_WIDTH, 1.0, localZ);
        group.add(puMesh);

        powerUps.push({
          mesh: puMesh,
          type: puType,
          lane: puLane,
          z: worldZ,
          y: 1.0,
          collected: false,
        });
      }
    }

    // Bonus Reward Items (~30% chance per chunk)
    const bonusTypes: BonusItemType[] = ['COIN_BONUS', 'SUPER_COIN', 'STAR_BONUS', 'GIFT_BOX'];
    if (Math.random() < 0.32) {
      const bType = bonusTypes[Math.floor(Math.random() * bonusTypes.length)];
      const bLane = lanes[Math.floor(Math.random() * lanes.length)];
      const localZ = (Math.random() - 0.5) * (CHUNK_LENGTH - 10);
      const worldZ = chunkZ + localZ;

      if (
        !obstacles.some((o) => Math.abs(o.z - worldZ) < 3.0 && o.lane === bLane) &&
        !powerUps.some((p) => Math.abs(p.z - worldZ) < 3.0 && p.lane === bLane)
      ) {
        const bMesh = createBonusItemMesh(bType);
        bMesh.position.set(bLane * LANE_WIDTH, 0.9, localZ);
        group.add(bMesh);

        bonusItems.push({
          mesh: bMesh,
          type: bType,
          lane: bLane,
          z: worldZ,
          y: 0.9,
          baseY: 0.9,
          collected: false,
        });
      }
    }
  }

  private setupParticles() {
    const dustGeo = new THREE.DodecahedronGeometry(0.18, 0);
    const dustMat = new THREE.MeshBasicMaterial({
      color: 0xe0d6c3,
      transparent: true,
      opacity: 0.6,
    });
    for (let i = 0; i < 30; i++) {
      const mesh = new THREE.Mesh(dustGeo, dustMat.clone());
      mesh.visible = false;
      this.scene.add(mesh);
      this.dustParticles.push({
        mesh,
        life: 0,
        maxLife: 0.45,
        vel: new THREE.Vector3(),
      });
    }

    const sparkGeo = new THREE.OctahedronGeometry(0.12, 0);
    const sparkMat = new THREE.MeshBasicMaterial({
      color: 0xffea00,
      transparent: true,
      opacity: 0.9,
    });
    for (let i = 0; i < 40; i++) {
      const mesh = new THREE.Mesh(sparkGeo, sparkMat.clone());
      mesh.visible = false;
      this.scene.add(mesh);
      this.coinSparkles.push({
        mesh,
        life: 0,
        maxLife: 0.6,
        vel: new THREE.Vector3(),
      });
    }
  }

  private spawnDust(pos: THREE.Vector3, count = 3, scale = 1.0) {
    let spawned = 0;
    for (const p of this.dustParticles) {
      if (p.life <= 0) {
        p.life = p.maxLife;
        p.mesh.visible = true;
        p.mesh.scale.setScalar(scale);
        p.mesh.position.set(
          pos.x + (Math.random() - 0.5) * 0.4,
          0.05,
          pos.z + (Math.random() - 0.5) * 0.4
        );
        p.vel.set(
          (Math.random() - 0.5) * 1.5,
          0.8 + Math.random() * 1.2,
          1.5 + Math.random() * 2.5
        );
        spawned++;
        if (spawned >= count) break;
      }
    }
  }

  private spawnSparkles(pos: THREE.Vector3, count = 8) {
    let spawned = 0;
    for (const p of this.coinSparkles) {
      if (p.life <= 0) {
        p.life = p.maxLife;
        p.mesh.visible = true;
        p.mesh.position.copy(pos);
        p.vel.set(
          (Math.random() - 0.5) * 4.5,
          2.5 + Math.random() * 3.5,
          (Math.random() - 0.5) * 4.5
        );
        spawned++;
        if (spawned >= count) break;
      }
    }
  }

  public start(initialBoost?: PowerUpType) {
    this.resetRun();
    this.isRunning = true;
    this.isPaused = false;
    this.clock.start();
    if (initialBoost) {
      this.applyPowerUp(initialBoost, 18);
    }
    this.loop();
  }

  public applyPowerUp(type: PowerUpType, duration = 15) {
    const finalDuration = type === 'FLYING' ? 14 : duration;
    this.activePowerUps.set(type, {
      type,
      duration: finalDuration,
      timeLeft: finalDuration,
    });
    if (type === 'FLYING') {
      sounds.playFlying();
      if (this.charRefs.wingsGroup) this.charRefs.wingsGroup.visible = true;
    }
    if (type === 'SHIELD' && this.shieldBubble) {
      this.shieldBubble.visible = true;
    }
    if (type === 'BOOST' && this.speedAura) {
      this.speedAura.visible = true;
    }
  }

  public pause() {
    this.isPaused = true;
  }

  public resume() {
    this.isPaused = false;
    this.clock.getDelta();
  }

  public resetRun() {
    this.distanceRun = 0;
    this.coinsCollected = 0;
    this.comboCount = 0;
    this.currentLane = 0;
    this.targetLane = 0;
    this.playerPos.set(0, 0, 0);
    this.playerVelocityY = 0;
    this.isGrounded = true;
    this.isSliding = false;
    this.isStumbling = false;
    this.slideTimer = 0;
    this.stumbleTimer = 0;
    this.invulnerableTimer = 0;
    this.activePowerUps.clear();
    this.currentSpeed = this.baseSpeed;
    this.currentBiome = 'JUNGLE';
    this.announcedBiomes.clear();

    for (let i = 0; i < this.chunks.length; i++) {
      this.scene.remove(this.chunks[i].group);
    }
    this.chunks = [];
    this.setupTrack();

    if (this.shieldBubble) this.shieldBubble.visible = false;
    if (this.speedAura) this.speedAura.visible = false;
  }

  public moveLeft() {
    if (!this.isRunning || this.isPaused || this.isStumbling) return;
    if (this.targetLane > -1) {
      this.targetLane = (this.targetLane - 1) as Lane;
      sounds.playLaneSwitch();
    }
  }

  public moveRight() {
    if (!this.isRunning || this.isPaused || this.isStumbling) return;
    if (this.targetLane < 1) {
      this.targetLane = (this.targetLane + 1) as Lane;
      sounds.playLaneSwitch();
    }
  }

  public jump() {
    if (!this.isRunning || this.isPaused || this.isStumbling) return;
    if (this.isGrounded) {
      this.playerVelocityY = this.isKidsMode ? 14.5 : 13.5;
      this.isGrounded = false;
      this.isSliding = false;
      this.slideTimer = 0;
      sounds.playJump();
      this.spawnDust(this.playerPos, 4);
    }
  }

  public slide() {
    if (!this.isRunning || this.isPaused || this.isStumbling) return;
    if (!this.isSliding) {
      this.isSliding = true;
      this.slideTimer = 0.65;
      sounds.playSlide();
      this.spawnDust(this.playerPos, 5, 0.6);

      if (!this.isGrounded) {
        this.playerVelocityY = -14;
      }
    }
  }

  private loop = () => {
    if (!this.isRunning) return;
    this.animFrameId = requestAnimationFrame(this.loop);
    const delta = Math.min(this.clock.getDelta(), 0.05);

    if (!this.isPaused) {
      this.update(delta);
    }

    this.renderer.render(this.scene, this.camera);
  };

  private update(delta: number) {
    const now = performance.now() / 1000;

    // Power-up Boost modification
    const isBoostActive = this.activePowerUps.has('BOOST');
    const isFlying = this.activePowerUps.has('FLYING');
    const targetSpeed = isBoostActive
      ? this.baseSpeed * 1.55
      : this.baseSpeed + Math.min(this.distanceRun * 0.004, this.isKidsMode ? 4 : 9);
    this.currentSpeed = THREE.MathUtils.damp(this.currentSpeed, targetSpeed, 4, delta);

    // Update Distance
    const speedInUnits = this.currentSpeed * delta;
    this.distanceRun += speedInUnits;

    // Biome Monitoring & Atmospheric Interpolation
    const targetBiome = this.getBiomeForDistance(this.distanceRun);
    if (targetBiome !== this.currentBiome) {
      this.currentBiome = targetBiome;
      this.announceBiome(targetBiome);
    }

    const biomeAtmospheres: Record<BiomeType, { sky: number; fog: number; fogDensity: number; hemiSky: number; hemiGround: number }> = {
      JUNGLE: { sky: 0x87ceeb, fog: 0x1f472e, fogDensity: 0.009, hemiSky: 0x90e0ef, hemiGround: 0x2d6a4f },
      RUINS: { sky: 0xe0a96d, fog: 0x3d3024, fogDensity: 0.010, hemiSky: 0xf4a261, hemiGround: 0x6b4226 },
      WATERFALL: { sky: 0x48cae4, fog: 0x12404e, fogDensity: 0.011, hemiSky: 0x00b4d8, hemiGround: 0x0077b6 },
      MOUNTAIN: { sky: 0x78909c, fog: 0x263238, fogDensity: 0.012, hemiSky: 0xb0bec5, hemiGround: 0x37474f },
      SKY: { sky: 0x90e0ef, fog: 0x48cae4, fogDensity: 0.005, hemiSky: 0xfff3b0, hemiGround: 0x80deea },
    };

    const atmos = biomeAtmospheres[this.currentBiome];
    (this.scene.background as THREE.Color).lerp(new THREE.Color(atmos.sky), delta * 1.5);
    if (this.scene.fog && this.scene.fog instanceof THREE.FogExp2) {
      this.scene.fog.color.lerp(new THREE.Color(atmos.fog), delta * 1.5);
      this.scene.fog.density = THREE.MathUtils.damp(this.scene.fog.density, atmos.fogDensity, 1.5, delta);
    }
    this.hemiLight.color.lerp(new THREE.Color(atmos.hemiSky), delta * 1.5);
    this.hemiLight.groundColor.lerp(new THREE.Color(atmos.hemiGround), delta * 1.5);

    // Move world chunks toward +Z
    for (const chunk of this.chunks) {
      chunk.group.position.z += speedInUnits;
      chunk.z += speedInUnits;
      for (const obs of chunk.obstacles) obs.z += speedInUnits;
      for (const coin of chunk.coins) coin.z += speedInUnits;
      for (const pu of chunk.powerUps) pu.z += speedInUnits;
      for (const b of chunk.bonusItems) b.z += speedInUnits;
    }

    // Recycle Chunks passing behind camera
    const firstChunk = this.chunks[0];
    if (firstChunk && firstChunk.group.position.z > 32) {
      const recycled = this.chunks.shift()!;
      this.scene.remove(recycled.group);

      const lastChunk = this.chunks[this.chunks.length - 1];
      const newZ = lastChunk.z - CHUNK_LENGTH;
      const biomeForNewChunk = this.getBiomeForDistance(-newZ);
      const freshChunk = this.createChunk(newZ, false, biomeForNewChunk);
      this.chunks.push(freshChunk);
      this.scene.add(freshChunk.group);
    }

    // --- Player Physics & Smooth Lane Banking ---
    const targetX = this.targetLane * LANE_WIDTH;
    this.playerPos.x = THREE.MathUtils.damp(this.playerPos.x, targetX, 14, delta);

    const xDiff = targetX - this.playerPos.x;
    const targetTilt = isFlying ? -xDiff * 0.35 : -xDiff * 0.22;
    this.charRefs.root.rotation.z = THREE.MathUtils.damp(this.charRefs.root.rotation.z, targetTilt, 12, delta);
    this.charRefs.root.rotation.y = THREE.MathUtils.damp(this.charRefs.root.rotation.y, xDiff * 0.18, 12, delta);

    // Vertical Motion: Magic Flight vs Ground Jump & Gravity
    if (isFlying) {
      const flightAltitude = 3.3 + Math.sin(now * 3.2) * 0.22;
      this.playerPos.y = THREE.MathUtils.damp(this.playerPos.y, flightAltitude, 4.8, delta);
      this.isGrounded = false;
      this.playerVelocityY = 0;
      this.isSliding = false;
    } else {
      const gravity = this.isKidsMode ? 32 : 36;
      if (!this.isGrounded) {
        this.playerVelocityY -= gravity * delta;
        this.playerPos.y += this.playerVelocityY * delta;

        if (this.playerPos.y <= 0) {
          this.playerPos.y = 0;
          this.playerVelocityY = 0;
          this.isGrounded = true;
          this.spawnDust(this.playerPos, 3);
        }
      }
    }

    // Slide Timer
    if (this.isSliding) {
      this.slideTimer -= delta;
      if (this.slideTimer <= 0) {
        this.isSliding = false;
      }
    }

    // Stumble / Invulnerability Timer
    if (this.isStumbling) {
      this.stumbleTimer -= delta;
      if (this.stumbleTimer <= 0) {
        this.isStumbling = false;
      }
    }
    if (this.invulnerableTimer > 0) {
      this.invulnerableTimer -= delta;
      this.charRefs.root.visible = Math.floor(now * 15) % 2 === 0;
    } else {
      this.charRefs.root.visible = true;
    }

    this.charRefs.root.position.copy(this.playerPos);

    // -------------------------------------------------------------
    // NATURAL QUADRUPED GAIT & ANIMATION
    // Realistic diagonal trotting/galloping coordination, spine flexion,
    // head bobbing, tail sway, jumping, and sliding posture
    // -------------------------------------------------------------
    const runCycleSpeed = this.currentSpeed * 1.15;
    const runCycle = now * runCycleSpeed;

    if (isFlying) {
      if (this.charRefs.wingsGroup) this.charRefs.wingsGroup.visible = true;
      if (this.charRefs.leftWing && this.charRefs.rightWing) {
        const flapRate = 18;
        const flapAngle = Math.sin(now * flapRate) * 0.45 + 0.22;
        this.charRefs.leftWing.rotation.z = flapAngle;
        this.charRefs.rightWing.rotation.z = -flapAngle;
        this.charRefs.leftWing.rotation.y = Math.cos(now * flapRate) * 0.15;
        this.charRefs.rightWing.rotation.y = -Math.cos(now * flapRate) * 0.15;
      }

      this.charRefs.root.scale.set(1, 1, 1);
      this.charRefs.head.rotation.x = -0.22;
      this.charRefs.leftFrontLeg.rotation.x = -0.65;
      this.charRefs.rightFrontLeg.rotation.x = -0.65;
      this.charRefs.leftBackLeg.rotation.x = 0.75;
      this.charRefs.rightBackLeg.rotation.x = 0.75;
      this.charRefs.leftEar.rotation.x = 0.35;
      this.charRefs.rightEar.rotation.x = 0.35;
      this.charRefs.tail.rotation.x = 0.25 + Math.sin(now * 5) * 0.15;

      if (Math.random() > 0.45) {
        this.spawnSparkles(this.playerPos, 1);
      }
    } else {
      if (this.charRefs.wingsGroup) this.charRefs.wingsGroup.visible = false;

      if (this.isSliding) {
        // Believable low-posture quadruped slide
        this.charRefs.root.scale.set(1.15, 0.55, 1.35);
        this.charRefs.root.position.y = 0.18;
        this.charRefs.head.rotation.x = 0.18;
        this.charRefs.leftFrontLeg.rotation.x = -0.8;
        this.charRefs.rightFrontLeg.rotation.x = -0.8;
        this.charRefs.leftBackLeg.rotation.x = 0.9;
        this.charRefs.rightBackLeg.rotation.x = 0.9;
        this.charRefs.tail.rotation.x = -0.25;
        if (Math.random() > 0.5) this.spawnDust(this.playerPos, 1, 0.4);
      } else if (!this.isGrounded) {
        // Airborne jump arc: front limbs reach forward, rear limbs extend back
        this.charRefs.root.scale.set(1, 1, 1);
        this.charRefs.head.rotation.x = -0.15;
        this.charRefs.leftFrontLeg.rotation.x = -0.55;
        this.charRefs.rightFrontLeg.rotation.x = -0.55;
        this.charRefs.leftBackLeg.rotation.x = 0.6;
        this.charRefs.rightBackLeg.rotation.x = 0.6;
        this.charRefs.leftEar.rotation.x = 0.35;
        this.charRefs.rightEar.rotation.x = 0.35;
        this.charRefs.tail.rotation.x = 0.35;
      } else {
        // Natural Quadruped Trot / Gallop Gait
        this.charRefs.root.scale.set(1, 1, 1);

        // Diagonal leg pair coordination
        const frontLeftAngle = Math.sin(runCycle) * 0.75;
        const frontRightAngle = -Math.sin(runCycle) * 0.75;
        const backLeftAngle = -Math.sin(runCycle + 0.15) * 0.7;
        const backRightAngle = Math.sin(runCycle + 0.15) * 0.7;

        this.charRefs.leftFrontLeg.rotation.x = frontLeftAngle;
        this.charRefs.rightFrontLeg.rotation.x = frontRightAngle;
        this.charRefs.leftBackLeg.rotation.x = backLeftAngle;
        this.charRefs.rightBackLeg.rotation.x = backRightAngle;

        // Spine flexion & extension
        this.charRefs.body.rotation.x = Math.sin(runCycle * 2) * 0.08;
        this.charRefs.body.position.y = 0.72 + Math.abs(Math.sin(runCycle * 2)) * 0.06;

        // Head counter-bobbing
        this.charRefs.head.position.y = 1.22 + Math.cos(runCycle * 2) * 0.05;
        this.charRefs.head.rotation.x = -Math.sin(runCycle * 2) * 0.04;

        // Natural dynamic tail sway
        this.charRefs.tail.rotation.y = Math.sin(runCycle) * 0.35;
        this.charRefs.tail.rotation.x = 0.15 + Math.cos(runCycle * 2) * 0.08;

        // Ear bounce
        this.charRefs.leftEar.rotation.z = -0.28 + Math.sin(runCycle * 2) * 0.08;
        this.charRefs.rightEar.rotation.z = 0.28 - Math.sin(runCycle * 2) * 0.08;

        // Running dust puffs at leg contact
        if (Math.abs(frontLeftAngle) > 0.65 && Math.random() > 0.6) {
          this.spawnDust(this.playerPos, 1);
        }
      }
    }

    // --- Power-up Timers & Auras ---
    const activeList: PowerUpActive[] = [];
    const hasShield = this.activePowerUps.has('SHIELD');
    const hasMagnet = this.activePowerUps.has('MAGNET');
    const isDoubleCoin = this.activePowerUps.has('DOUBLE_COIN');
    const isDoublePoints = this.activePowerUps.has('DOUBLE_POINTS');
    const multiplier = isDoublePoints ? 2 : 1;

    if (this.shieldBubble) {
      this.shieldBubble.visible = hasShield || this.invulnerableTimer > 0;
      if (this.shieldBubble.visible) {
        this.shieldBubble.rotation.y += delta * 1.5;
      }
    }

    if (this.speedAura) {
      this.speedAura.visible = isBoostActive;
      if (isBoostActive) {
        this.speedAura.rotation.z += delta * 8;
        this.speedAura.scale.setScalar(1 + Math.sin(now * 12) * 0.15);
      }
    }

    for (const [type, pu] of this.activePowerUps.entries()) {
      pu.timeLeft -= delta;
      if (pu.timeLeft <= 0) {
        this.activePowerUps.delete(type);
        if (type === 'FLYING') {
          this.invulnerableTimer = Math.max(this.invulnerableTimer, 2.5);
          if (this.charRefs.wingsGroup) this.charRefs.wingsGroup.visible = false;
        }
      } else {
        activeList.push(pu);
      }
    }
    this.onPowerUpsUpdate(activeList);

    // --- Milestone Thresholds Checking ---
    const milestonesList = [250, 500, 750, 1000, 1500, 2000, 2500, 3000, 4000, 5000];
    for (const threshold of milestonesList) {
      if (this.distanceRun >= threshold && !this.reachedMilestones.has(threshold)) {
        this.reachedMilestones.add(threshold);
        const bonusScore = 150 * multiplier;
        const bonusCoins = 10;
        this.bonusPoints += bonusScore;
        this.coinsCollected += bonusCoins;
        sounds.playMilestone();
        this.spawnSparkles(this.playerPos, 22);

        this.onBonusNotification?.({
          id: `milestone-${threshold}-${Date.now()}`,
          title: `Milestone: ${threshold}m!`,
          subtitle: `+${bonusScore} Pts & +${bonusCoins} Coins!`,
          icon: '🏆',
          color: '#38b000',
        });
        break;
      }
    }

    for (const b of this.butterflies) {
      b.update(now);
    }

    // --- Coin Collection & Magnet Attraction ---
    const isCurrentlyFlying = this.activePowerUps.has('FLYING');
    const magnetRadius = (hasMagnet || isCurrentlyFlying) ? 14 : 2.0;

    for (const chunk of this.chunks) {
      for (const coin of chunk.coins) {
        if (coin.collected) continue;

        coin.mesh.rotation.y += delta * 3.5;
        coin.mesh.position.y = coin.baseY + Math.sin(now * 4 + coin.z) * 0.12;

        const distZ = Math.abs(coin.z - this.playerPos.z);
        const distX = Math.abs(coin.mesh.position.x - this.playerPos.x);
        const distY = Math.abs(coin.mesh.position.y - (this.playerPos.y + 0.8));

        if ((hasMagnet || isCurrentlyFlying) && distZ < magnetRadius && distX < 6) {
          coin.mesh.position.x = THREE.MathUtils.damp(coin.mesh.position.x, this.playerPos.x, 14, delta);
          coin.mesh.position.y = THREE.MathUtils.damp(coin.mesh.position.y, this.playerPos.y + 0.8, 14, delta);
          coin.z = THREE.MathUtils.damp(coin.z, this.playerPos.z, 14, delta);
        }

        const collectDistanceX = this.isKidsMode ? 1.4 : 1.1;
        const collectDistanceZ = 1.2;
        const collectDistanceY = isCurrentlyFlying ? 4.2 : 1.5;

        if (distZ < collectDistanceZ && distX < collectDistanceX && distY < collectDistanceY) {
          coin.collected = true;
          coin.mesh.visible = false;

          if (now - this.lastCoinTime < 0.6) {
            this.comboCount = Math.min(this.comboCount + 1, 7);
          } else {
            this.comboCount = 0;
          }
          this.lastCoinTime = now;

          const coinGain = isDoubleCoin ? 2 : 1;
          this.coinsCollected += coinGain;
          sounds.playCoin(this.comboCount);

          this.spawnSparkles(coin.mesh.position, 6);
        }
      }

      // Bonus Items Pickups
      for (const item of chunk.bonusItems) {
        if (item.collected) continue;

        item.mesh.rotation.y += delta * 2.8;
        item.mesh.position.y = item.baseY + Math.sin(now * 3.5 + item.z) * 0.15;

        const distZ = Math.abs(item.z - this.playerPos.z);
        const distX = Math.abs(item.mesh.position.x - this.playerPos.x);
        const distY = Math.abs(item.mesh.position.y - (this.playerPos.y + 0.8));

        if (distZ < 1.3 && distX < 1.15 && distY < 1.5) {
          item.collected = true;
          item.mesh.visible = false;

          if (item.type === 'COIN_BONUS') {
            const addedCoins = (isDoubleCoin ? 2 : 1) * 5;
            this.coinsCollected += addedCoins;
            this.bonusPoints += 50 * multiplier;
            sounds.playBonus();
            this.spawnSparkles(item.mesh.position, 16);
            this.onBonusNotification?.({
              id: `bonus-coin-${Date.now()}`,
              title: 'Golden Coin Bonus!',
              subtitle: `+${addedCoins} Extra Coins!`,
              icon: '🪙',
              color: '#ffea00',
            });
          } else if (item.type === 'SUPER_COIN') {
            const addedCoins = (isDoubleCoin ? 2 : 1) * 15;
            this.coinsCollected += addedCoins;
            this.bonusPoints += 150 * multiplier;
            sounds.playBonus();
            this.spawnSparkles(item.mesh.position, 24);
            this.onBonusNotification?.({
              id: `super-coin-${Date.now()}`,
              title: 'Super Coin Bonus!',
              subtitle: `+${addedCoins} Mega Coins!`,
              icon: '🌟',
              color: '#ff9e00',
            });
          } else if (item.type === 'STAR_BONUS') {
            const addedPoints = 250 * multiplier;
            this.bonusPoints += addedPoints;
            sounds.playStar();
            this.spawnSparkles(item.mesh.position, 20);
            this.onBonusNotification?.({
              id: `star-bonus-${Date.now()}`,
              title: 'Star Bonus!',
              subtitle: `+${addedPoints} Score Points!`,
              icon: '⭐',
              color: '#ffd166',
            });
          } else if (item.type === 'GIFT_BOX') {
            const roll = Math.random();
            sounds.playPowerUp();
            this.spawnSparkles(item.mesh.position, 26);
            if (roll < 0.4) {
              const addedCoins = 25;
              this.coinsCollected += addedCoins;
              this.onBonusNotification?.({
                id: `gift-${Date.now()}`,
                title: 'Golden Gift Box!',
                subtitle: `Unwrapped: +${addedCoins} Coins!`,
                icon: '🎁',
                color: '#ffd700',
              });
            } else if (roll < 0.75) {
              const addedPts = 500 * multiplier;
              this.bonusPoints += addedPts;
              this.onBonusNotification?.({
                id: `gift-${Date.now()}`,
                title: 'Golden Gift Box!',
                subtitle: `Unwrapped: +${addedPts} Score Points!`,
                icon: '🎁',
                color: '#ffd700',
              });
            } else {
              this.activePowerUps.set('SHIELD', { type: 'SHIELD', duration: 15, timeLeft: 15 });
              this.coinsCollected += 10;
              this.onBonusNotification?.({
                id: `gift-${Date.now()}`,
                title: 'Golden Gift Box!',
                subtitle: 'Star Shield Activated + 10 Coins!',
                icon: '🛡️',
                color: '#48cae4',
              });
            }
          }
        }
      }

      // Power-up Pickups
      for (const pu of chunk.powerUps) {
        if (pu.collected) continue;

        pu.mesh.rotation.y += delta * 2.5;
        pu.mesh.position.y = 1.0 + Math.sin(now * 3 + pu.z) * 0.15;

        const distZ = Math.abs(pu.z - this.playerPos.z);
        const distX = Math.abs(pu.mesh.position.x - this.playerPos.x);

        if (distZ < 1.3 && distX < 1.2) {
          pu.collected = true;
          pu.mesh.visible = false;

          const duration = pu.type === 'FLYING' ? 14 : pu.type === 'BOOST' ? 6 : pu.type === 'SHIELD' ? 15 : 10;
          this.activePowerUps.set(pu.type, {
            type: pu.type,
            duration,
            timeLeft: duration,
          });
          this.powerupsUsedCount++;

          if (pu.type === 'FLYING') {
            sounds.playFlying();
            this.spawnSparkles(pu.mesh.position, 28);
          } else {
            sounds.playPowerUp();
            this.spawnSparkles(pu.mesh.position, 14);
          }

          const puAnnouncements: Record<PowerUpType, { title: string; subtitle: string; icon: string; color: string }> = {
            FLYING: { title: 'FLYING MODE! 🪽✨', subtitle: 'Soar above the jungle & obstacles!', icon: '🪽', color: '#00b4d8' },
            MAGNET: { title: 'Rainbow Magnet!', subtitle: 'Attracting all nearby coins!', icon: '🧲', color: '#e63946' },
            SHIELD: { title: 'Star Shield!', subtitle: 'Protected from 1 crash!', icon: '🛡️', color: '#48cae4' },
            BOOST: { title: 'Banana Boost!', subtitle: 'Speed dash & coin vacuum!', icon: '🍌', color: '#ffd166' },
            DOUBLE_POINTS: { title: 'Double Points!', subtitle: '2X score points active!', icon: '⚡', color: '#00f5d4' },
            DOUBLE_COIN: { title: 'Double Coins!', subtitle: '2X coins active!', icon: '🪙', color: '#9b5de5' },
          };
          const info = puAnnouncements[pu.type];
          if (info) {
            this.onBonusNotification?.({
              id: `pu-${pu.type}-${Date.now()}`,
              title: info.title,
              subtitle: info.subtitle,
              icon: info.icon,
              color: info.color,
            });
          }
        }
      }

      // Obstacle Collision Detection
      const isFlyingObstacleCheck = this.activePowerUps.has('FLYING');
      for (const obs of chunk.obstacles) {
        if (obs.cleared) continue;

        const distZ = obs.z - this.playerPos.z;

        if (distZ > 2.0) {
          obs.cleared = true;
          continue;
        }

        const collThresholdZ = 0.9;
        if (Math.abs(distZ) < collThresholdZ) {
          const inSameLane = Math.abs(obs.mesh.position.x - this.playerPos.x) < 0.95;

          if (inSameLane) {
            let hit = false;

            if (isFlyingObstacleCheck || this.playerPos.y > 1.8) {
              hit = false;
            } else if (obs.isOverhead) {
              if (!this.isSliding) {
                hit = true;
              }
            } else if (obs.type === 'LOG' || obs.type === 'ROCK' || obs.type === 'MUSHROOM') {
              if (this.playerPos.y < 0.7) {
                hit = true;
              }
            } else {
              hit = true;
            }

            if (hit) {
              if (isBoostActive) {
                obs.cleared = true;
                obs.mesh.visible = false;
                this.spawnSparkles(obs.mesh.position, 12);
              } else if (this.invulnerableTimer > 0) {
                // Grace period
              } else if (hasShield) {
                this.activePowerUps.delete('SHIELD');
                obs.cleared = true;
                obs.mesh.visible = false;
                this.invulnerableTimer = 2.0;
                this.isStumbling = true;
                this.stumbleTimer = 0.4;
                sounds.playShieldBreak();
                this.spawnSparkles(this.playerPos, 16);
              } else {
                if (this.reviveCount < 2 && this.onTriggerRevivePrompt) {
                  this.pause();
                  this.isStumbling = true;
                  sounds.playHit();
                  const stats = this.getCurrentStats();
                  this.onTriggerRevivePrompt(stats);
                  return;
                }

                this.triggerGameOver();
                return;
              }
            }
          }
        }
      }
    }

    // Update Particles
    for (const p of this.dustParticles) {
      if (p.life > 0) {
        p.life -= delta;
        p.mesh.position.addScaledVector(p.vel, delta);
        const progress = 1 - p.life / p.maxLife;
        p.mesh.scale.setScalar((1 - progress * 0.5) * 0.8);
        (p.mesh.material as THREE.MeshBasicMaterial).opacity = 0.6 * (1 - progress);
        if (p.life <= 0) p.mesh.visible = false;
      }
    }

    for (const p of this.coinSparkles) {
      if (p.life > 0) {
        p.life -= delta;
        p.mesh.position.addScaledVector(p.vel, delta);
        p.vel.y -= 9.8 * delta;
        const progress = 1 - p.life / p.maxLife;
        (p.mesh.material as THREE.MeshBasicMaterial).opacity = 1 - progress;
        if (p.life <= 0) p.mesh.visible = false;
      }
    }

    // Camera Tracking
    const cameraTargetX = this.playerPos.x * 0.4;
    const cameraTargetY = 3.8 + (this.playerPos.y > 0 ? this.playerPos.y * 0.35 : 0);
    const cameraTargetZ = isBoostActive ? 7.6 : 6.8;

    this.camera.position.x = THREE.MathUtils.damp(this.camera.position.x, cameraTargetX, 8, delta);
    this.camera.position.y = THREE.MathUtils.damp(this.camera.position.y, cameraTargetY, 8, delta);
    this.camera.position.z = THREE.MathUtils.damp(this.camera.position.z, cameraTargetZ, 4, delta);
    this.camera.lookAt(this.playerPos.x * 0.2, 1.2 + this.playerPos.y * 0.3, -8);

    // Report stats
    const currentScore = Math.floor(
      this.distanceRun * 2 * multiplier + this.coinsCollected * 10 * multiplier + this.bonusPoints
    );
    this.onStatsUpdate({
      score: currentScore,
      distance: Math.floor(this.distanceRun),
      coins: this.coinsCollected,
      bonusPoints: this.bonusPoints,
      multiplier,
      biome: this.currentBiome,
    });
  }

  public reviveRun() {
    this.reviveCount++;
    this.invulnerableTimer = 3.5;
    this.isStumbling = false;
    this.stumbleTimer = 0;
    this.currentSpeed = this.baseSpeed;
    this.isPaused = false;
    this.isRunning = true;

    for (const chunk of this.chunks) {
      for (const obs of chunk.obstacles) {
        if (Math.abs(obs.z - this.playerPos.z) < 22) {
          obs.cleared = true;
          obs.mesh.visible = false;
        }
      }
    }

    sounds.playRevive();
    this.spawnSparkles(this.playerPos, 25);
    this.clock.getDelta();
  }

  public skipReviveAndGameOver() {
    this.triggerGameOver();
  }

  public getCurrentStats(): RunStats {
    const isDoublePoints = this.activePowerUps.has('DOUBLE_POINTS');
    const multiplier = isDoublePoints ? 2 : 1;
    const finalScore = Math.floor(
      this.distanceRun * 2 * multiplier + this.coinsCollected * 10 * multiplier + this.bonusPoints
    );
    return {
      score: finalScore,
      distance: Math.floor(this.distanceRun),
      coins: this.coinsCollected,
      bonusPoints: this.bonusPoints,
      powerupsCollected: this.powerupsUsedCount,
      milestonesReached: Array.from(this.reachedMilestones),
      reviveCount: this.reviveCount,
      isNewHighScore: false,
      currentBiome: this.currentBiome,
    };
  }

  private triggerGameOver() {
    this.isRunning = false;
    this.isStumbling = true;
    sounds.playHit();
    sounds.playGameOver();

    this.charRefs.root.rotation.x = -0.3;
    this.charRefs.root.position.y = 0.1;
    this.spawnDust(this.playerPos, 8, 0.8);

    const stats = this.getCurrentStats();
    this.onGameOver(stats);
  }

  private onResize = () => {
    if (!this.container || !this.renderer || !this.camera) return;
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  };

  public dispose() {
    this.isRunning = false;
    cancelAnimationFrame(this.animFrameId);
    window.removeEventListener('resize', this.onResize);
    this.renderer.dispose();
    if (this.renderer.domElement.parentNode) {
      this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
    }
  }
}
