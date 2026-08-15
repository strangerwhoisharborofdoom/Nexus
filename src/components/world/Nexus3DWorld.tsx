import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RegionId } from '../../types';
import { REGIONS } from '../../data/regionsData';
import { Compass, RotateCw, Sparkles, Eye, Move } from 'lucide-react';

interface Nexus3DWorldProps {
  currentRegionId: RegionId;
  restorationPercentage: number;
  allRestorations: Record<RegionId, number>;
  isPuzzleActive: boolean;
  onSelectRegion?: (regionId: RegionId) => void;
  celebrationTrigger?: number;
}

export const Nexus3DWorld: React.FC<Nexus3DWorldProps> = ({
  currentRegionId,
  restorationPercentage,
  allRestorations,
  isPuzzleActive,
  onSelectRegion,
  celebrationTrigger,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);

  // Interaction State
  const [isAutoRotate, setIsAutoRotate] = useState(true);
  const [cameraMode, setCameraMode] = useState<'orbit' | 'focus'>('orbit');
  const isDraggingRef = useRef(false);
  const previousMousePositionRef = useRef({ x: 0, y: 0 });
  const userRotationRef = useRef({ x: 0, y: 0 });

  // Animated objects refs
  const worldGroupRef = useRef<THREE.Group | null>(null);
  const districtGroupsRef = useRef<Record<string, THREE.Group>>({});
  const elevatorRef = useRef<THREE.Mesh | null>(null);
  const awakeningWindowMatsRef = useRef<THREE.MeshBasicMaterial[]>([]);
  const coreMeshRef = useRef<THREE.Mesh | null>(null);
  const ringsRef = useRef<THREE.Mesh[]>([]);
  const waterMeshRef = useRef<THREE.Mesh | null>(null);
  const laserBeamsRef = useRef<THREE.Line[]>([]);
  const lightsRef = useRef<{
    ambient: THREE.AmbientLight;
    dir: THREE.DirectionalLight;
    point: THREE.PointLight;
    sectorLights: THREE.PointLight[];
  } | null>(null);

  // Camera target positions
  const targetCamPos = useRef(new THREE.Vector3(0, 18, 38));
  const targetLookAt = useRef(new THREE.Vector3(0, 4, 0));

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Scene setup with rich atmosphere
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.fog = new THREE.FogExp2(0x020617, 0.015);

    // Camera
    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 22, 45);
    cameraRef.current = camera;

    // High-performance WebGL Renderer with ACES tone mapping
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.35;
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Lighting Setup
    const ambientLight = new THREE.AmbientLight(0x0f172a, 1.4);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0x38bdf8, 2.8);
    dirLight.position.set(25, 45, 25);
    scene.add(dirLight);

    const pointLight = new THREE.PointLight(0x06b6d4, 4.5, 90);
    pointLight.position.set(0, 8, 0);
    scene.add(pointLight);

    // Multi-color dynamic sector rim lights
    const sectorLight1 = new THREE.PointLight(0x06b6d4, 2.5, 30);
    sectorLight1.position.set(-12, 10, -12);
    scene.add(sectorLight1);

    const sectorLight2 = new THREE.PointLight(0x0284c7, 2.5, 30);
    sectorLight2.position.set(14, 8, -8);
    scene.add(sectorLight2);

    const sectorLight3 = new THREE.PointLight(0x10b981, 2.5, 30);
    sectorLight3.position.set(-16, 12, 10);
    scene.add(sectorLight3);

    const sectorLight4 = new THREE.PointLight(0xf59e0b, 2.5, 30);
    sectorLight4.position.set(14, 10, 12);
    scene.add(sectorLight4);

    const sectorLight5 = new THREE.PointLight(0x8b5cf6, 2.5, 30);
    sectorLight5.position.set(0, 10, -18);
    scene.add(sectorLight5);

    lightsRef.current = {
      ambient: ambientLight,
      dir: dirLight,
      point: pointLight,
      sectorLights: [sectorLight1, sectorLight2, sectorLight3, sectorLight4, sectorLight5],
    };

    // World Master Group (Can be rotated with user interaction)
    const worldGroup = new THREE.Group();
    scene.add(worldGroup);
    worldGroupRef.current = worldGroup;

    // -------------------------------------------------------------
    // Base Planetary Platform with Shiny Metallic & Holographic Rim
    // -------------------------------------------------------------
    const baseGeo = new THREE.CylinderGeometry(26, 28, 2.8, 48);
    const baseMat = new THREE.MeshStandardMaterial({
      color: 0x050914,
      roughness: 0.18,
      metalness: 0.92,
      flatShading: false,
    });
    const baseMesh = new THREE.Mesh(baseGeo, baseMat);
    baseMesh.position.y = -1.4;
    worldGroup.add(baseMesh);

    // Shiny Glowing Holographic Rim Ring
    const rimGeo = new THREE.TorusGeometry(26.2, 0.25, 12, 64);
    const rimMat = new THREE.MeshStandardMaterial({
      color: 0x06b6d4,
      emissive: 0x0284c7,
      roughness: 0.1,
      metalness: 0.95,
    });
    const rimMesh = new THREE.Mesh(rimGeo, rimMat);
    rimMesh.rotation.x = Math.PI / 2;
    rimMesh.position.y = 0.05;
    worldGroup.add(rimMesh);

    // Outer Glowing Hex Grid Floor
    const gridHelper = new THREE.GridHelper(64, 48, 0x06b6d4, 0x1e293b);
    gridHelper.position.y = 0.08;
    worldGroup.add(gridHelper);

    // ==============================================================
    // SECTOR 1: THE AWAKENING (Monolithic City, Pulsing Neon & Transit Lift)
    // ==============================================================
    const gAwakening = new THREE.Group();
    gAwakening.position.set(-11, 0, -11);
    awakeningWindowMatsRef.current = [];

    for (let i = 0; i < 12; i++) {
      const h = 6 + (i % 5) * 3 + Math.random() * 2.5;
      const bGeo = new THREE.BoxGeometry(2.4, h, 2.4);
      const bMat = new THREE.MeshStandardMaterial({
        color: 0x070c18,
        roughness: 0.15,
        metalness: 0.94,
      });
      const box = new THREE.Mesh(bGeo, bMat);
      const xPos = (i % 4) * 3.4 - 5.1;
      const zPos = Math.floor(i / 4) * 3.4 - 3.4;
      box.position.set(xPos, h / 2, zPos);
      gAwakening.add(box);

      // Shiny Glowing Neon Edge Conduits
      const lineGeo = new THREE.BoxGeometry(0.18, h + 0.1, 0.18);
      const lineMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
      const line = new THREE.Mesh(lineGeo, lineMat);
      line.position.copy(box.position);
      line.position.x += 1.2;
      line.position.z += 1.2;
      gAwakening.add(line);

      // Glowing Spire Antenna on tallest towers
      if (h > 12) {
        const antennaGeo = new THREE.CylinderGeometry(0.08, 0.15, 4, 8);
        const antennaMat = new THREE.MeshStandardMaterial({
          color: 0x38bdf8,
          emissive: 0x06b6d4,
          metalness: 0.9,
          roughness: 0.1,
        });
        const antenna = new THREE.Mesh(antennaGeo, antennaMat);
        antenna.position.set(xPos, h + 2, zPos);
        gAwakening.add(antenna);

        // Blinking Beacon Sphere
        const beaconGeo = new THREE.SphereGeometry(0.3, 12, 12);
        const beaconMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
        const beacon = new THREE.Mesh(beaconGeo, beaconMat);
        beacon.position.set(xPos, h + 4, zPos);
        gAwakening.add(beacon);
      }

      // Windows Array
      const winGeo = new THREE.PlaneGeometry(0.35, 0.35);
      const winMat = new THREE.MeshBasicMaterial({ color: 0x082f49, side: THREE.DoubleSide });
      awakeningWindowMatsRef.current.push(winMat);

      for (let floor = 2; floor < h - 1; floor += 1.3) {
        const win = new THREE.Mesh(winGeo, winMat);
        win.position.set(xPos, floor, zPos + 1.21);
        gAwakening.add(win);
      }
    }

    // High-speed Mag-Lev Elevator Lift
    const elevatorShaftGeo = new THREE.CylinderGeometry(0.35, 0.35, 22, 12);
    const elevatorShaftMat = new THREE.MeshStandardMaterial({
      color: 0x334155,
      metalness: 0.95,
      roughness: 0.1,
    });
    const shaftMesh = new THREE.Mesh(elevatorShaftGeo, elevatorShaftMat);
    shaftMesh.position.set(0, 11, 2.5);
    gAwakening.add(shaftMesh);

    const carGeo = new THREE.BoxGeometry(1.4, 1.2, 1.4);
    const carMat = new THREE.MeshStandardMaterial({
      color: 0x06b6d4,
      emissive: 0x083344,
      roughness: 0.1,
      metalness: 0.95,
    });
    const carMesh = new THREE.Mesh(carGeo, carMat);
    carMesh.position.set(0, 2, 2.5);
    gAwakening.add(carMesh);
    elevatorRef.current = carMesh;

    worldGroup.add(gAwakening);
    districtGroupsRef.current['awakening'] = gAwakening;

    // ==============================================================
    // SECTOR 2: THE FLOODED DISTRICT (Aqueducts, Cascades & Hydro-Turbines)
    // ==============================================================
    const gFlooded = new THREE.Group();
    gFlooded.position.set(13, 0, -9);

    // Glowing Shimmering Hydro Basin
    const waterGeo = new THREE.CylinderGeometry(8.5, 8.5, 0.6, 32);
    const waterMat = new THREE.MeshStandardMaterial({
      color: 0x0284c7,
      roughness: 0.05,
      metalness: 0.95,
      transparent: true,
      opacity: 0.88,
    });
    const waterMesh = new THREE.Mesh(waterGeo, waterMat);
    waterMesh.position.y = 0.3;
    gFlooded.add(waterMesh);
    waterMeshRef.current = waterMesh;

    // Marble Hydro Pylons
    for (let a = 0; a < 8; a++) {
      const angle = (a / 8) * Math.PI * 2;
      const pGeo = new THREE.CylinderGeometry(0.7, 0.9, 8, 12);
      const pMat = new THREE.MeshStandardMaterial({
        color: 0x1e293b,
        roughness: 0.3,
        metalness: 0.8,
      });
      const pMesh = new THREE.Mesh(pGeo, pMat);
      pMesh.position.set(Math.cos(angle) * 6.5, 4, Math.sin(angle) * 6.5);
      gFlooded.add(pMesh);

      // Radiant Crystal Cap on Pylons
      const capGeo = new THREE.OctahedronGeometry(0.6, 0);
      const capMat = new THREE.MeshStandardMaterial({
        color: 0x38bdf8,
        emissive: 0x0284c7,
        roughness: 0.1,
        metalness: 0.9,
      });
      const cap = new THREE.Mesh(capGeo, capMat);
      cap.position.set(Math.cos(angle) * 6.5, 8.5, Math.sin(angle) * 6.5);
      gFlooded.add(cap);
    }

    // Rotating Hydro Turbine
    const turbineGeo = new THREE.TorusGeometry(2.5, 0.4, 8, 16);
    const turbineMat = new THREE.MeshStandardMaterial({
      color: 0x0ea5e9,
      metalness: 0.9,
      roughness: 0.15,
    });
    const turbine = new THREE.Mesh(turbineGeo, turbineMat);
    turbine.position.set(0, 3, 0);
    turbine.rotation.x = Math.PI / 2;
    gFlooded.add(turbine);

    worldGroup.add(gFlooded);
    districtGroupsRef.current['flooded'] = gFlooded;

    // ==============================================================
    // SECTOR 3: THE GRAVITY GARDENS (Floating Islands & Orbiting Crystals)
    // ==============================================================
    const gGravity = new THREE.Group();
    gGravity.position.set(-15, 0, 9);

    for (let k = 0; k < 6; k++) {
      const isGeo = new THREE.DodecahedronGeometry(2.0 + (k % 3) * 0.7, 0);
      const isMat = new THREE.MeshStandardMaterial({
        color: 0x064e3b,
        roughness: 0.25,
        metalness: 0.8,
        flatShading: true,
      });
      const island = new THREE.Mesh(isGeo, isMat);
      island.position.set((k - 2.5) * 3.5, 6 + Math.sin(k * 1.2) * 3.5, (k % 2) * 3.5);
      (island as any).initialY = island.position.y;
      (island as any).rotSpeed = 0.012 + k * 0.004;
      gGravity.add(island);

      // Floating Emerald Crystal atop each island
      const cryGeo = new THREE.OctahedronGeometry(0.8, 0);
      const cryMat = new THREE.MeshStandardMaterial({
        color: 0x10b981,
        emissive: 0x047857,
        roughness: 0.1,
        metalness: 0.95,
      });
      const crystal = new THREE.Mesh(cryGeo, cryMat);
      crystal.position.set(island.position.x, island.position.y + 2.8, island.position.z);
      (crystal as any).initialY = crystal.position.y;
      gGravity.add(crystal);
    }
    worldGroup.add(gGravity);
    districtGroupsRef.current['gravity'] = gGravity;

    // ==============================================================
    // SECTOR 4: THE CLOCKWORK ARCHIVE (Towering Golden Brass Gears)
    // ==============================================================
    const gClockwork = new THREE.Group();
    gClockwork.position.set(13, 0, 11);

    const gearGeo = new THREE.TorusGeometry(5.0, 0.7, 12, 32);
    const gearMat = new THREE.MeshStandardMaterial({
      color: 0xd97706,
      emissive: 0x78350f,
      roughness: 0.18,
      metalness: 0.95,
    });
    const gear1 = new THREE.Mesh(gearGeo, gearMat);
    gear1.rotation.x = Math.PI / 2;
    gear1.position.y = 4.5;
    gClockwork.add(gear1);

    const gear2 = new THREE.Mesh(gearGeo, gearMat);
    gear2.rotation.y = Math.PI / 3;
    gear2.position.set(0, 7, 0);
    gear2.scale.set(0.75, 0.75, 0.75);
    gClockwork.add(gear2);

    const gear3 = new THREE.Mesh(gearGeo, gearMat);
    gear3.rotation.x = Math.PI / 4;
    gear3.position.set(2, 9, 2);
    gear3.scale.set(0.5, 0.5, 0.5);
    gClockwork.add(gear3);

    worldGroup.add(gClockwork);
    districtGroupsRef.current['clockwork'] = gClockwork;

    // ==============================================================
    // SECTOR 5: THE MEMORY VAULT (Holographic Neural Pillars)
    // ==============================================================
    const gMemory = new THREE.Group();
    gMemory.position.set(0, 0, -17);

    for (let m = 0; m < 9; m++) {
      const pGeo = new THREE.OctahedronGeometry(1.4, 0);
      const pMat = new THREE.MeshStandardMaterial({
        color: 0x8b5cf6,
        emissive: 0x4c1d95,
        roughness: 0.15,
        metalness: 0.9,
        wireframe: m % 2 === 0,
      });
      const pMesh = new THREE.Mesh(pGeo, pMat);
      pMesh.position.set((m - 4) * 2.8, 5 + Math.sin(m * 1.4) * 2.5, 0);
      gMemory.add(pMesh);
    }
    worldGroup.add(gMemory);
    districtGroupsRef.current['memory'] = gMemory;

    // ==============================================================
    // SECTOR 6: THE CENTRAL CORE (Fusion Tokamak & Multi-Rings)
    // ==============================================================
    const gCore = new THREE.Group();
    gCore.position.set(0, 7, 0);

    const coreGeo = new THREE.IcosahedronGeometry(4.0, 3);
    const coreMat = new THREE.MeshStandardMaterial({
      color: 0x06b6d4,
      emissive: 0x083344,
      roughness: 0.1,
      metalness: 0.98,
    });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    gCore.add(coreMesh);
    coreMeshRef.current = coreMesh;

    // 4 Concentric Counter-Rotating Shiny Rings
    const ringRadii = [6.0, 8.2, 10.4, 12.6];
    const ringMeshes: THREE.Mesh[] = [];
    ringRadii.forEach((r, idx) => {
      const rGeo = new THREE.TorusGeometry(r, 0.16, 12, 64);
      const rMat = new THREE.MeshBasicMaterial({
        color:
          idx === 0
            ? 0x06b6d4
            : idx === 1
            ? 0x3b82f6
            : idx === 2
            ? 0x10b981
            : 0xec4899,
      });
      const rMesh = new THREE.Mesh(rGeo, rMat);
      rMesh.rotation.x = Math.PI / 2 + idx * 0.25;
      rMesh.rotation.y = idx * 0.35;
      gCore.add(rMesh);
      ringMeshes.push(rMesh);
    });
    ringsRef.current = ringMeshes;

    // Ascending Laser Column to Zenith
    const beamGeo = new THREE.CylinderGeometry(0.3, 0.3, 40, 16);
    const beamMat = new THREE.MeshBasicMaterial({
      color: 0xec4899,
      transparent: true,
      opacity: 0.6,
    });
    const beam = new THREE.Mesh(beamGeo, beamMat);
    beam.position.y = 20;
    gCore.add(beam);

    worldGroup.add(gCore);
    districtGroupsRef.current['core'] = gCore;

    // -------------------------------------------------------------
    // Multi-Colored Laser Beams Connecting Sectors to the Core
    // -------------------------------------------------------------
    const sectorPoints = [
      { x: -11, y: 5, z: -11, color: 0x06b6d4 },
      { x: 13, y: 4, z: -9, color: 0x0284c7 },
      { x: -15, y: 6, z: 9, color: 0x10b981 },
      { x: 13, y: 5, z: 11, color: 0xf59e0b },
      { x: 0, y: 5, z: -17, color: 0x8b5cf6 },
    ];

    const laserLines: THREE.Line[] = [];
    sectorPoints.forEach((sp) => {
      const lineMat = new THREE.LineBasicMaterial({
        color: sp.color,
        linewidth: 2,
        transparent: true,
        opacity: 0.7,
      });
      const points = [new THREE.Vector3(sp.x, sp.y, sp.z), new THREE.Vector3(0, 7, 0)];
      const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
      const line = new THREE.Line(lineGeo, lineMat);
      worldGroup.add(line);
      laserLines.push(line);
    });
    laserBeamsRef.current = laserLines;

    // -------------------------------------------------------------
    // Rich Stardust & Atmospheric Shimmer Particles
    // -------------------------------------------------------------
    const partCount = 700;
    const partGeo = new THREE.BufferGeometry();
    const posArr = new Float32Array(partCount * 3);
    const colArr = new Float32Array(partCount * 3);

    for (let p = 0; p < partCount * 3; p += 3) {
      posArr[p] = (Math.random() - 0.5) * 70;
      posArr[p + 1] = Math.random() * 32 + 0.5;
      posArr[p + 2] = (Math.random() - 0.5) * 70;

      const rndCol = Math.random();
      if (rndCol < 0.25) {
        colArr[p] = 0.02; colArr[p + 1] = 0.71; colArr[p + 2] = 0.83; // Cyan
      } else if (rndCol < 0.5) {
        colArr[p] = 0.06; colArr[p + 1] = 0.72; colArr[p + 2] = 0.50; // Emerald
      } else if (rndCol < 0.75) {
        colArr[p] = 0.96; colArr[p + 1] = 0.62; colArr[p + 2] = 0.04; // Amber
      } else {
        colArr[p] = 0.92; colArr[p + 1] = 0.28; colArr[p + 2] = 0.60; // Pink
      }
    }
    partGeo.setAttribute('position', new THREE.BufferAttribute(posArr, 3));
    partGeo.setAttribute('color', new THREE.BufferAttribute(colArr, 3));

    const partMat = new THREE.PointsMaterial({
      size: 0.55,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
    });
    const particles = new THREE.Points(partGeo, partMat);
    worldGroup.add(particles);

    // -------------------------------------------------------------
    // Interactive Mouse Orbit & Parallax Drag Handling
    // -------------------------------------------------------------
    const handlePointerDown = (e: MouseEvent | TouchEvent) => {
      isDraggingRef.current = true;
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      previousMousePositionRef.current = { x: clientX, y: clientY };
    };

    const handlePointerMove = (e: MouseEvent | TouchEvent) => {
      if (!isDraggingRef.current || !worldGroupRef.current) return;
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

      const deltaX = clientX - previousMousePositionRef.current.x;
      const deltaY = clientY - previousMousePositionRef.current.y;

      userRotationRef.current.y += deltaX * 0.006;
      userRotationRef.current.x += deltaY * 0.003;
      userRotationRef.current.x = Math.max(-0.4, Math.min(0.6, userRotationRef.current.x));

      worldGroupRef.current.rotation.y = userRotationRef.current.y;
      worldGroupRef.current.rotation.x = userRotationRef.current.x;

      previousMousePositionRef.current = { x: clientX, y: clientY };
    };

    const handlePointerUp = () => {
      isDraggingRef.current = false;
    };

    const dom = renderer.domElement;
    dom.addEventListener('mousedown', handlePointerDown);
    window.addEventListener('mousemove', handlePointerMove);
    window.addEventListener('mouseup', handlePointerUp);
    dom.addEventListener('touchstart', handlePointerDown, { passive: true });
    window.addEventListener('touchmove', handlePointerMove, { passive: true });
    window.addEventListener('touchend', handlePointerUp);

    // -------------------------------------------------------------
    // Main 60FPS Game Render Loop
    // -------------------------------------------------------------
    let animationFrameId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const elapsed = clock.getElapsedTime();

      // Auto Orbit Rotation if enabled and not actively dragging
      if (isAutoRotate && !isDraggingRef.current && worldGroupRef.current) {
        userRotationRef.current.y += 0.002;
        worldGroupRef.current.rotation.y = userRotationRef.current.y;
      }

      // Animate Shiny Core Pulse
      if (coreMeshRef.current) {
        const scale = 1 + Math.sin(elapsed * 2.8) * 0.07;
        coreMeshRef.current.scale.set(scale, scale, scale);
        coreMeshRef.current.rotation.y += 0.01;
        coreMeshRef.current.rotation.x += 0.005;
      }

      // Animate 4 Concentric Gyro Rings
      ringsRef.current.forEach((ring, idx) => {
        ring.rotation.z += 0.012 * (idx % 2 === 0 ? 1 : -1);
        ring.rotation.x += 0.006;
      });

      // Animate Sector 01 Elevator
      if (elevatorRef.current) {
        const elevY = 3 + Math.sin(elapsed * 1.1) * 8 + 8;
        elevatorRef.current.position.y = Math.max(2, Math.min(19, elevY));
      }

      // Animate Sector 03 Gravity Islands & Crystals Floating
      const gGrav = districtGroupsRef.current['gravity'];
      if (gGrav) {
        gGrav.children.forEach((child: any) => {
          if (child.initialY !== undefined) {
            child.position.y = child.initialY + Math.sin(elapsed * 1.6 + child.position.x) * 0.7;
            child.rotation.y += child.rotSpeed || 0.01;
          }
        });
      }

      // Animate Sector 04 Clockwork Gears Rotating with real ratios
      const gClock = districtGroupsRef.current['clockwork'];
      if (gClock) {
        gClock.children.forEach((gear, idx) => {
          gear.rotation.z += 0.018 * (idx % 2 === 0 ? 1 : -1.3);
        });
      }

      // Animate Sector 05 Memory Neural Pillars
      const gMem = districtGroupsRef.current['memory'];
      if (gMem) {
        gMem.children.forEach((p, idx) => {
          p.rotation.y += 0.025;
          p.position.y = 5 + Math.sin(elapsed * 2.2 + idx) * 0.9;
        });
      }

      // Water Surface Shimmer
      if (waterMeshRef.current) {
        waterMeshRef.current.rotation.z = Math.sin(elapsed * 0.5) * 0.05;
      }

      // Smooth Camera Lerp
      if (cameraRef.current) {
        cameraRef.current.position.lerp(targetCamPos.current, 0.045);
        cameraRef.current.lookAt(targetLookAt.current);
      }

      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }
    };

    animate();

    // Resize Handler
    const resizeObserver = new ResizeObserver(() => {
      if (!container || !cameraRef.current || !rendererRef.current) return;
      const newW = container.clientWidth;
      const newH = container.clientHeight;
      cameraRef.current.aspect = newW / newH;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(newW, newH);
    });
    resizeObserver.observe(container);

    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      dom.removeEventListener('mousedown', handlePointerDown);
      window.removeEventListener('mousemove', handlePointerMove);
      window.removeEventListener('mouseup', handlePointerUp);
      dom.removeEventListener('touchstart', handlePointerDown);
      window.removeEventListener('touchmove', handlePointerMove);
      window.removeEventListener('touchend', handlePointerUp);
      if (rendererRef.current && rendererRef.current.domElement) {
        container.removeChild(rendererRef.current.domElement);
        rendererRef.current.dispose();
      }
    };
  }, [isAutoRotate]);

  // Update Dynamic Lighting & Windows when Sectors are restored
  useEffect(() => {
    const reg = REGIONS[currentRegionId];
    if (!reg) return;

    const sectorRestoration = allRestorations[currentRegionId] || 0;
    const awakeningRestoration = allRestorations['awakening'] || 0;
    const isAwakened = awakeningRestoration >= 100;

    // Light up Sector 01 city skyscraper windows based on restoration
    if (awakeningWindowMatsRef.current.length > 0) {
      awakeningWindowMatsRef.current.forEach((mat) => {
        if (isAwakened) {
          mat.color.setHex(0x38bdf8); // Radiant cyan windows
        } else if (awakeningRestoration > 40) {
          mat.color.setHex(0x0284c7); // Blue windows
        } else {
          mat.color.setHex(0x082f49); // Dim dormant windows
        }
      });
    }

    // Dynamic camera focus positions
    if (isPuzzleActive) {
      switch (currentRegionId) {
        case 'awakening':
          targetCamPos.current.set(-11, 15, -1);
          targetLookAt.current.set(-11, 4, -11);
          break;
        case 'flooded':
          targetCamPos.current.set(13, 15, 1);
          targetLookAt.current.set(13, 3, -9);
          break;
        case 'gravity':
          targetCamPos.current.set(-15, 17, 20);
          targetLookAt.current.set(-15, 6, 9);
          break;
        case 'clockwork':
          targetCamPos.current.set(13, 17, 22);
          targetLookAt.current.set(13, 5, 11);
          break;
        case 'memory':
          targetCamPos.current.set(0, 15, -7);
          targetLookAt.current.set(0, 4, -17);
          break;
        case 'core':
          targetCamPos.current.set(0, 13, 18);
          targetLookAt.current.set(0, 7, 0);
          break;
        default:
          targetCamPos.current.set(0, 19, 40);
          targetLookAt.current.set(0, 4, 0);
      }
    } else {
      // Global 3D Overview Camera
      targetCamPos.current.set(0, 24, 44);
      targetLookAt.current.set(0, 4, 0);
    }

    // Dynamic Point Lighting & Atmosphere
    if (lightsRef.current) {
      const colorHex = parseInt(reg.themeColor.replace('#', '0x'), 16);
      lightsRef.current.point.color.setHex(colorHex);
      lightsRef.current.point.intensity = 2.5 + (sectorRestoration / 100) * 3.5;

      if (sectorRestoration >= 100) {
        lightsRef.current.ambient.intensity = 1.8;
      } else {
        lightsRef.current.ambient.intensity = 1.2;
      }
    }

    // Core Emissive Color State
    if (coreMeshRef.current) {
      const globalAvg =
        (Object.values(allRestorations) as number[]).reduce((a, b) => a + b, 0) / 6;
      const coreMat = coreMeshRef.current.material as THREE.MeshStandardMaterial;
      if (coreMat) {
        if (globalAvg > 80) {
          coreMat.emissive.setHex(0xec4899);
        } else if (globalAvg > 40) {
          coreMat.emissive.setHex(0x38bdf8);
        } else {
          coreMat.emissive.setHex(0x083344);
        }
      }
    }
  }, [currentRegionId, restorationPercentage, allRestorations, isPuzzleActive]);

  // World Shockwave effect on celebration trigger
  useEffect(() => {
    if (!celebrationTrigger || !cameraRef.current) return;
    targetCamPos.current.y += 3.0;
    setTimeout(() => {
      targetCamPos.current.y -= 3.0;
    }, 450);
  }, [celebrationTrigger]);

  const handleResetCamera = () => {
    userRotationRef.current = { x: 0, y: 0 };
    if (worldGroupRef.current) {
      worldGroupRef.current.rotation.set(0, 0, 0);
    }
  };

  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden bg-slate-950">
      {/* 3D WebGL Canvas */}
      <div
        ref={containerRef}
        className="w-full h-full cursor-grab active:cursor-grabbing"
        style={{
          background: `radial-gradient(circle at center, ${REGIONS[currentRegionId]?.skyGradient[1]} 0%, #020617 85%)`,
        }}
      />

      {/* 3D Interactive World Controls Bar (Shiny Glassmorphism HUD) */}
      <div className="absolute bottom-4 left-4 z-20 flex items-center gap-2 px-3 py-2 rounded-2xl glass-panel-3d text-xs font-mono text-slate-300 shadow-[0_8px_32px_rgba(0,0,0,0.6)]">
        <div className="flex items-center gap-1.5 pr-2 border-r border-slate-700/60">
          <Move className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
          <span className="hidden sm:inline text-[11px] text-cyan-200">DRAG TO ROTATE 3D</span>
        </div>

        {/* Toggle Auto Rotation */}
        <button
          onClick={() => setIsAutoRotate((prev) => !prev)}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-xl transition-all game-btn-3d ${
            isAutoRotate
              ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/50 shadow-[0_0_10px_rgba(6,182,212,0.3)]'
              : 'bg-slate-900/80 text-slate-400 border border-slate-800'
          }`}
          title="Toggle Auto Planetary Orbit"
        >
          <RotateCw className={`w-3 h-3 ${isAutoRotate ? 'animate-spin' : ''}`} />
          <span className="text-[10px]">ORBIT</span>
        </button>

        {/* Reset Camera View */}
        <button
          onClick={handleResetCamera}
          className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700 text-slate-300 transition-all game-btn-3d"
          title="Reset Camera Angle"
        >
          <Compass className="w-3 h-3 text-amber-400" />
          <span className="text-[10px]">RESET</span>
        </button>
      </div>
    </div>
  );
};
