import { Text3D, Text, useTexture, Center } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef, useState, type ReactNode } from "react";
import * as THREE from "three";
import { journey, range, bell, damp, clamp } from "@/lib/journey";

export const FONT_URL = "/fonts/sculpt.typeface.json";

const IVORY      = "#efe9df";
const CHAMPAGNE  = "#c8ab72";
const EMPRESS    = "#b0175c";

/* ────────────────────────────────────── Dust / atmosphere */

export function Dust({ count = 1200 }: { count?: number }) {
  const ref        = useRef<THREE.Points>(null);
  const clockRef   = useRef(0);

  const { positions, sizes, speeds } = useMemo(() => {
    const pos    = new Float32Array(count * 3);
    const sz     = new Float32Array(count);
    const spd    = new Float32Array(count);
    const colors = new Float32Array(count * 3);
    const cChamp = new THREE.Color(CHAMPAGNE);
    const cIvory = new THREE.Color(IVORY);
    const cEmpr  = new THREE.Color(EMPRESS);

    for (let i = 0; i < count; i++) {
      pos[i * 3]     = (Math.random() - 0.5) * 100;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 56;
      pos[i * 3 + 2] = -Math.random() * 320 + 24;
      sz[i]  = Math.random() * 2.2 + 0.4;
      spd[i] = Math.random() * 0.6 + 0.4;

      const r   = Math.random();
      const col = r < 0.72
        ? cChamp.clone().lerp(cIvory, Math.random())
        : cEmpr.clone().lerp(cChamp, Math.random() * 0.5);
      colors[i * 3]     = col.r;
      colors[i * 3 + 1] = col.g;
      colors[i * 3 + 2] = col.b;
    }
    return { positions: pos, sizes: sz, speeds: spd, colors };
  }, [count]);

  const posRef   = useRef(new Float32Array(positions));
  const colorArr = useMemo(() => {
    const c = new Float32Array(count * 3);
    const cC = new THREE.Color(CHAMPAGNE);
    const cI = new THREE.Color(IVORY);
    const cE = new THREE.Color(EMPRESS);
    for (let i = 0; i < count; i++) {
      const r   = Math.random();
      const col = r < 0.72
        ? cC.clone().lerp(cI, Math.random())
        : cE.clone().lerp(cC, Math.random() * 0.5);
      c[i * 3]     = col.r;
      c[i * 3 + 1] = col.g;
      c[i * 3 + 2] = col.b;
    }
    return c;
  }, [count]);

  useFrame((state, dt) => {
    if (!ref.current) return;
    clockRef.current += dt;
    const t = clockRef.current;

    ref.current.rotation.y += dt * 0.004;

    const mat = ref.current.material as THREE.PointsMaterial;
    // Opacity breathes with velocity
    mat.opacity = 0.22 + Math.abs(journey.velocity) * 0.0008 + Math.sin(t * 0.5) * 0.04;

    const posAttr = ref.current.geometry.attributes["position"];
    if (!posAttr) return;
    const pos = posAttr.array as Float32Array;

    for (let i = 0; i < count; i++) {
      const ix = i * 3, iy = ix + 1;
      const sp = speeds[i] ?? 1;
      // Gentle Lissajous-like drift
      pos[iy]! += Math.sin(t * 0.4 * sp + i * 0.7) * 0.003;
      pos[ix]! += Math.cos(t * 0.25 * sp + i * 0.4) * 0.0015;

      // Mouse repulsion — particles scatter near cursor
      const mx = journey.mouseX * 35;
      const my = journey.mouseY * 22;
      const dx = mx - (pos[ix] ?? 0);
      const dy = my - (pos[iy] ?? 0);
      const dist2 = dx * dx + dy * dy;
      if (dist2 < 100) {
        const force = (1 - dist2 / 100) * 0.035;
        pos[ix]! -= dx * force;
        pos[iy]! -= dy * force;
      }
    }
    posAttr.needsUpdate = true;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[posRef.current, 3]} />
        <bufferAttribute attach="attributes-size"     args={[sizes, 1]} />
        <bufferAttribute attach="attributes-color"    args={[colorArr, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.072}
        vertexColors
        transparent
        opacity={0.24}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

/* ────────────────────────────────────── 3D sculptural typography */

export function Sculpt({
  children,
  size       = 4,
  color      = IVORY,
  roughness  = 0.58,
  metalness  = 0.18,
  emissive   = "#000000",
  emissiveIntensity = 0.28,
  ...props
}: {
  children: string;
  size?: number;
  color?: string;
  roughness?: number;
  metalness?: number;
  emissive?: string;
  emissiveIntensity?: number;
} & React.ComponentProps<"group">) {
  return (
    <group {...props}>
      <Center>
        <Text3D
          font={FONT_URL}
          size={size}
          height={size * 0.30}
          curveSegments={6}
          bevelEnabled
          bevelThickness={size * 0.024}
          bevelSize={size * 0.018}
          bevelSegments={4}
        >
          {children}
          <meshStandardMaterial
            color={color}
            roughness={roughness}
            metalness={metalness}
            emissive={emissive === "#000000" ? color : emissive}
            emissiveIntensity={emissive === "#000000" ? 0 : emissiveIntensity}
            envMapIntensity={1.2}
          />
        </Text3D>
      </Center>
    </group>
  );
}

/* ────────────────────────────────────── Portrait */

export function Portrait({
  url,
  position,
  scale = 1,
  reveal,
}: {
  url: string;
  position: [number, number, number];
  scale?: number;
  reveal: [number, number];
}) {
  const tex    = useTexture(url);
  const g      = useRef<THREE.Group>(null);
  const layers = useRef<THREE.Group>(null);

  useFrame((_, dt) => {
    if (!g.current || !layers.current) return;
    const v = bell(journey.progress, reveal[0] - 0.05, reveal[1] + 0.05);
    g.current.scale.setScalar(scale * (0.93 + v * 0.07));

    layers.current.rotation.y = damp(layers.current.rotation.y, journey.mouseX * 0.18,  3, dt);
    layers.current.rotation.x = damp(layers.current.rotation.x, -journey.mouseY * 0.12, 3, dt);

    layers.current.children.forEach((c, i) => {
      c.position.x = damp(c.position.x,  journey.mouseX * i * 0.26, 3, dt);
      c.position.y = damp(c.position.y, -journey.mouseY * i * 0.17, 3, dt);
    });
  });

  return (
    <group ref={g} position={position}>
      <group ref={layers}>
        {[0, 1, 2, 3].map((i) => (
          <mesh key={i} position={[0, 0, i * 0.55]}>
            <planeGeometry args={[8, 10.4]} />
            <meshBasicMaterial
              map={tex}
              transparent
              opacity={i === 0 ? 1 : i === 1 ? 0.18 : i === 2 ? 0.09 : 0.04}
              depthWrite={i === 0}
              blending={i === 0 ? THREE.NormalBlending : THREE.AdditiveBlending}
            />
          </mesh>
        ))}
      </group>
      {/* Matte backing */}
      <mesh position={[0, 0, -0.3]}>
        <planeGeometry args={[9, 11.2]} />
        <meshBasicMaterial color="#080706" />
      </mesh>
      {/* Portrait light */}
      <pointLight position={[0, 3, 8]} intensity={120} color="#fff0d0" distance={28} />
      <spotLight
        position={[-6, 8, 6]}
        angle={0.5}
        penumbra={1}
        intensity={260}
        color={CHAMPAGNE}
        distance={30}
      />
    </group>
  );
}

/* ────────────────────────────────────── Constellation */

const NODES: { label: string; p: [number, number, number] }[] = [
  { label: "CINEMA",       p: [-6.2, 3.4,   0]  },
  { label: "CULTURE",      p: [ 5.6, 4.6,  -4]  },
  { label: "PEOPLE",       p: [-5.0,-3.6,  -6]  },
  { label: "HISTORY",      p: [ 6.6,-2.4,   2]  },
  { label: "MEMORY",       p: [ 0.4, 5.8,  -8]  },
  { label: "IDENTITY",     p: [-8.4, 0.8,  -3]  },
  { label: "ART",          p: [ 2.8,-5.4,  -2]  },
  { label: "STORYTELLING", p: [ 8.6, 1.6,  -7]  },
];

export function Constellation({
  z,
  onSelect,
}: {
  z: number;
  onSelect: (label: string) => void;
}) {
  const g         = useRef<THREE.Group>(null);
  const lineRef   = useRef<THREE.LineSegments>(null);
  const [hovered, setHovered] = useState<string | null>(null);

  // Build connection lines — connect each node to its 2 nearest neighbours
  const lines = useMemo(() => {
    const pts: number[] = [];
    NODES.forEach((n, i) => {
      // Two connections each: i+3 and i+5
      [3, 5].forEach((offset) => {
        const m = NODES[(i + offset) % NODES.length]!;
        pts.push(...n.p, ...m.p);
      });
    });
    return new Float32Array(pts);
  }, []);

  useFrame((state, dt) => {
    if (!g.current) return;
    g.current.rotation.y = damp(
      g.current.rotation.y,
      journey.mouseX * 0.55 + state.clock.elapsedTime * 0.038,
      1.8,
      dt,
    );
    g.current.rotation.x = damp(g.current.rotation.x, -journey.mouseY * 0.24, 1.8, dt);

    if (lineRef.current) {
      const mat = lineRef.current.material as THREE.LineBasicMaterial;
      mat.opacity = 0.12 + Math.sin(state.clock.elapsedTime * 0.7) * 0.06;
    }
  });

  return (
    <group ref={g} position={[0, 0, z]}>
      <lineSegments ref={lineRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[lines, 3]} />
        </bufferGeometry>
        <lineBasicMaterial
          color={CHAMPAGNE}
          transparent
          opacity={0.14}
          blending={THREE.AdditiveBlending}
        />
      </lineSegments>

      {NODES.map((n) => {
        const isHov = hovered === n.label;
        return (
          <group key={n.label} position={n.p}>
            {/* Outer glow halo */}
            <mesh scale={isHov ? 4.5 : 2.8}>
              <sphereGeometry args={[0.5, 16, 16]} />
              <meshBasicMaterial
                color={isHov ? EMPRESS : CHAMPAGNE}
                transparent
                opacity={isHov ? 0.10 : 0.05}
                blending={THREE.AdditiveBlending}
                depthWrite={false}
              />
            </mesh>

            {/* Mid glow */}
            <mesh scale={isHov ? 2.2 : 1.5}>
              <sphereGeometry args={[0.5, 16, 16]} />
              <meshBasicMaterial
                color={isHov ? EMPRESS : CHAMPAGNE}
                transparent
                opacity={isHov ? 0.18 : 0.09}
                blending={THREE.AdditiveBlending}
                depthWrite={false}
              />
            </mesh>

            {/* Core octahedron */}
            <mesh
              scale={isHov ? 1.8 : 1}
              onPointerOver={(e) => {
                e.stopPropagation();
                setHovered(n.label);
                document.body.dataset["cursor"] = "view";
              }}
              onPointerOut={() => {
                setHovered(null);
                delete document.body.dataset["cursor"];
              }}
              onClick={(e) => {
                e.stopPropagation();
                onSelect(n.label);
              }}
            >
              <octahedronGeometry args={[0.36, 0]} />
              <meshStandardMaterial
                color={isHov ? EMPRESS : CHAMPAGNE}
                emissive={isHov ? EMPRESS : CHAMPAGNE}
                emissiveIntensity={isHov ? 2.2 : 0.7}
                roughness={0.2}
                metalness={0.7}
                envMapIntensity={1.4}
              />
            </mesh>

            <Text
              position={[0, -0.95, 0]}
              fontSize={0.32}
              color={isHov ? IVORY : "#6e675e"}
              anchorX="center"
              letterSpacing={0.28}
              fillOpacity={isHov ? 1 : 0.7}
            >
              {n.label}
            </Text>
          </group>
        );
      })}
    </group>
  );
}

/* ────────────────────────────────────── Archive */

export function Archive({ z, url }: { z: number; url: string }) {
  const tex  = useTexture(url);
  const inst = useRef<THREE.InstancedMesh>(null);
  const count = 300;

  const matrices = useMemo(() => {
    const arr    = [] as THREE.Matrix4[];
    const dummy  = new THREE.Object3D();
    for (let i = 0; i < count; i++) {
      const side = i % 2 === 0 ? -1 : 1;
      dummy.position.set(
        side * (7.5 + Math.random() * 10),
        -6 + Math.floor(i / 12) * 1.12 + Math.random() * 0.18,
        -Math.random() * 65,
      );
      dummy.rotation.set(0, Math.random() * 0.28 * side, (Math.random() - 0.5) * 0.07);
      dummy.scale.set(0.34 + Math.random() * 0.28, 1.5 + Math.random() * 1.0, 1.1);
      dummy.updateMatrix();
      arr.push(dummy.matrix.clone());
    }
    return arr;
  }, []);

  useFrame(() => {
    if (!inst.current) return;
    matrices.forEach((m, i) => inst.current!.setMatrixAt(i, m));
    inst.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <group position={[0, 0, z]}>
      {/* Background photograph */}
      <mesh position={[0, 0, -48]}>
        <planeGeometry args={[68, 42]} />
        <meshBasicMaterial map={tex} transparent opacity={0.65} />
      </mesh>

      {/* Book spines */}
      <instancedMesh ref={inst} args={[undefined, undefined, count]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#221c15" roughness={0.96} metalness={0.04} />
      </instancedMesh>

      {/* Overhead spot */}
      <spotLight
        position={[0, 18, -14]}
        angle={0.42}
        penumbra={1}
        intensity={280}
        color={CHAMPAGNE}
        distance={80}
        castShadow
      />
      {/* Side accent */}
      <pointLight position={[-18, 4, -20]} intensity={60} color="#6a2438" distance={50} />
    </group>
  );
}

/* ────────────────────────────────────── Book */

export function Book({
  z,
  url,
  onOpen,
}: {
  z: number;
  url: string;
  onOpen: () => void;
}) {
  const tex  = useTexture(url);
  const g    = useRef<THREE.Group>(null);
  const drag = useRef({ active: false, x: 0, spin: 0, vel: 0 });

  useFrame((state, dt) => {
    if (!g.current) return;
    if (!drag.current.active) drag.current.vel *= 0.92;
    drag.current.spin += drag.current.vel * dt;
    g.current.rotation.y =
      drag.current.spin + Math.sin(state.clock.elapsedTime * 0.22) * 0.32;
    g.current.rotation.x = damp(
      g.current.rotation.x,
      -0.07 - journey.mouseY * 0.09,
      2.5,
      dt,
    );
    // Bob more noticeably
    g.current.position.y = Math.sin(state.clock.elapsedTime * 0.45) * 0.24;
  });

  const materials = useMemo(() => {
    const edge  = new THREE.MeshStandardMaterial({ color: "#e2dbd0", roughness: 0.92, metalness: 0.02 });
    const cloth = new THREE.MeshStandardMaterial({ color: "#0c0b0a", roughness: 0.88, metalness: 0.02 });
    const front = new THREE.MeshStandardMaterial({
      map:        tex,
      roughness:  0.50,
      metalness:  0.08,
      envMapIntensity: 0.6,
    });
    return [edge, cloth, cloth, cloth, front, cloth];
  }, [tex]);

  return (
    <group position={[0, 0, z]}>
      <group
        ref={g}
        onPointerDown={(e) => {
          e.stopPropagation();
          drag.current.active = true;
          drag.current.x = e.clientX;
        }}
        onPointerUp={() => { drag.current.active = false; }}
        onPointerLeave={() => {
          drag.current.active = false;
          delete document.body.dataset["cursor"];
        }}
        onPointerMove={(e) => {
          if (!drag.current.active) return;
          const d = (e.clientX - drag.current.x) * 0.011;
          drag.current.vel  = d * 14;
          drag.current.spin += d;
          drag.current.x    = e.clientX;
        }}
        onPointerOver={() => (document.body.dataset["cursor"] = "open")}
        onPointerOut={() => delete document.body.dataset["cursor"]}
        onClick={(e) => { e.stopPropagation(); onOpen(); }}
      >
        <mesh material={materials}>
          <boxGeometry args={[4.2, 6.2, 0.74]} />
        </mesh>
      </group>

      {/* Key light */}
      <spotLight
        position={[4, 9, 9]}
        angle={0.32}
        penumbra={0.85}
        intensity={500}
        color="#fff5e0"
        distance={44}
        castShadow
      />
      {/* Empress rim */}
      <spotLight
        position={[-7, -4, 6]}
        angle={0.55}
        penumbra={1}
        intensity={220}
        color={EMPRESS}
        distance={38}
      />
      {/* Champagne fill */}
      <pointLight position={[0, 4, 12]} intensity={80} color={CHAMPAGNE} distance={22} />
    </group>
  );
}

/* ────────────────────────────────────── Desk */

export function Desk({ z, url }: { z: number; url: string }) {
  const tex = useTexture(url);
  const g   = useRef<THREE.Group>(null);

  useFrame((_, dt) => {
    if (!g.current) return;
    g.current.rotation.x = damp(g.current.rotation.x, -0.40 - journey.mouseY * 0.055, 2, dt);
    g.current.rotation.z = damp(g.current.rotation.z,  journey.mouseX * 0.028,         2, dt);
  });

  return (
    <group position={[0, -3.2, z]} ref={g}>
      <mesh>
        <planeGeometry args={[32, 22]} />
        <meshBasicMaterial map={tex} />
      </mesh>
      <pointLight position={[0, 4, 7]}  intensity={110} color="#ffd8a0" distance={32} />
      <pointLight position={[8, 2, 4]}  intensity={40}  color="#c8ab72" distance={20} />
    </group>
  );
}

/* ────────────────────────────────────── Future works */

export function FutureWork({ z }: { z: number }) {
  const g = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!g.current) return;
    g.current.children.forEach((c, i) => {
      c.position.y  = Math.sin(state.clock.elapsedTime * 0.28 + i * 1.2) * 0.7 + i * 0.5 - 1.5;
      c.rotation.y  = state.clock.elapsedTime * 0.07 + i * 0.9;
      c.rotation.x  = Math.sin(state.clock.elapsedTime * 0.12 + i) * 0.06;
    });
  });

  return (
    <group position={[0, 0, z]} ref={g}>
      {[-7.5, -2.5, 2.5, 7.5].map((x, i) => (
        <mesh key={x} position={[x, 0, -i * 4.5]}>
          <boxGeometry args={[2.8, 4.0, 0.42]} />
          <meshStandardMaterial
            color="#131008"
            roughness={0.35}
            metalness={0.32}
            transparent
            opacity={0.55 - i * 0.07}
            emissive={CHAMPAGNE}
            emissiveIntensity={0.055 + Math.sin(i) * 0.02}
          />
        </mesh>
      ))}
    </group>
  );
}

/* ────────────────────────────────────── Fade veil */

export function Veil({ children }: { children?: ReactNode }) {
  const m = useRef<THREE.MeshBasicMaterial>(null);

  useFrame(() => {
    if (!m.current) return;
    const p     = journey.progress;
    const intro = 1 - range(p, 0.0, 0.025);
    const outro = range(p, 0.96, 1.0);
    m.current.opacity = clamp(Math.max(intro * 0.82, outro));
  });

  return (
    <>
      {children}
      <mesh position={[0, 0, -0.5]} renderOrder={999}>
        <planeGeometry args={[42, 26]} />
        <meshBasicMaterial ref={m} color="#000000" transparent depthTest={false} />
      </mesh>
    </>
  );
}
