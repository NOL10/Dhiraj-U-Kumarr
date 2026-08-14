import { Text3D, Text, useTexture, Center } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef, useState, type ReactNode } from "react";
import * as THREE from "three";
import { journey, range, bell, damp, clamp } from "@/lib/journey";

export const FONT_URL =
  "/fonts/sculpt.typeface.json";

const IVORY = "#efe9df";
const CHAMPAGNE = "#c8ab72";
const EMPRESS = "#b0175c";

/* ------------------------------------------------------------------ dust */

export function Dust({ count = 900 }: { count?: number }) {
  const ref = useRef<THREE.Points>(null);
  const positions = useMemo(() => {
    const a = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    const colors = new Float32Array(count * 3);
    const color = new THREE.Color(CHAMPAGNE);
    const ivory = new THREE.Color(IVORY);
    
    for (let i = 0; i < count; i++) {
      a[i * 3] = (Math.random() - 0.5) * 90;
      a[i * 3 + 1] = (Math.random() - 0.5) * 50;
      a[i * 3 + 2] = -Math.random() * 300 + 20;
      sizes[i] = Math.random() * 2 + 0.5;
      
      const mixedColor = color.clone().lerp(ivory, Math.random());
      colors[i * 3] = mixedColor.r;
      colors[i * 3 + 1] = mixedColor.g;
      colors[i * 3 + 2] = mixedColor.b;
    }
    return { positions: a, sizes, colors };
  }, [count]);

  const initialPositions = useRef(positions.positions);

  useFrame((state, dt) => {
    if (!ref.current) return;
    ref.current.rotation.y += dt * 0.006;
    const m = ref.current.material as THREE.PointsMaterial;
    m.opacity = 0.28 + Math.abs(journey.velocity) * 0.0006;
    
    // Interactive particles - react to mouse
    const positionAttr = ref.current.geometry.attributes['position'];
    if (!positionAttr) return;
    
    const pos = positionAttr.array as Float32Array;
    for (let i = 0; i < count; i++) {
      const ix = i * 3;
      const iy = ix + 1;
      const iz = ix + 2;
      
      if (pos[ix] === undefined || pos[iy] === undefined) continue;
      
      // Gentle floating motion
      pos[iy]! += Math.sin(state.clock.elapsedTime * 0.5 + i) * 0.002;
      pos[ix]! += Math.cos(state.clock.elapsedTime * 0.3 + i) * 0.001;
      
      // Mouse interaction
      const dx = journey.mouseX * 30 - pos[ix]!;
      const dy = journey.mouseY * 20 - pos[iy]!;
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      if (dist < 8) {
        const force = (8 - dist) / 8;
        pos[ix]! += dx * force * 0.02;
        pos[iy]! += dy * force * 0.02;
      }
    }
    positionAttr.needsUpdate = true;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions.positions, 3]} />
        <bufferAttribute attach="attributes-size" args={[positions.sizes, 1]} />
        <bufferAttribute attach="attributes-color" args={[positions.colors, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.075}
        vertexColors
        transparent
        opacity={0.3}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

/* ------------------------------------------------- sculptural typography */

export function Sculpt({
  children,
  size = 4,
  color = IVORY,
  roughness = 0.62,
  metalness = 0.12,
  emissive = "#000000",
  ...props
}: {
  children: string;
  size?: number;
  color?: string;
  roughness?: number;
  metalness?: number;
  emissive?: string;
} & React.ComponentProps<"group">) {
  return (
    <group {...props}>
      <Center>
        <Text3D
          font={FONT_URL}
          size={size}
          height={size * 0.28}
          curveSegments={5}
          bevelEnabled
          bevelThickness={size * 0.022}
          bevelSize={size * 0.016}
          bevelSegments={3}
        >
          {children}
          <meshStandardMaterial
            color={color}
            roughness={roughness}
            metalness={metalness}
            emissive={emissive}
            emissiveIntensity={0.35}
          />
        </Text3D>
      </Center>
    </group>
  );
}

/* -------------------------------------------------------------- portrait */

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
  const tex = useTexture(url);
  const g = useRef<THREE.Group>(null);
  const layers = useRef<THREE.Group>(null);

  useFrame((_, dt) => {
    if (!g.current || !layers.current) return;
    const v = bell(journey.progress, reveal[0] - 0.05, reveal[1] + 0.05);
    g.current.scale.setScalar(scale * (0.94 + v * 0.06));
    layers.current.rotation.y = damp(
      layers.current.rotation.y,
      journey.mouseX * 0.16,
      3,
      dt,
    );
    layers.current.rotation.x = damp(
      layers.current.rotation.x,
      -journey.mouseY * 0.1,
      3,
      dt,
    );
    layers.current.children.forEach((c, i) => {
      c.position.x = damp(c.position.x, journey.mouseX * i * 0.22, 3, dt);
      c.position.y = damp(c.position.y, -journey.mouseY * i * 0.14, 3, dt);
    });
  });

  return (
    <group ref={g} position={position}>
      <group ref={layers}>
        {[0, 1, 2].map((i) => (
          <mesh key={i} position={[0, 0, i * 0.6]}>
            <planeGeometry args={[8, 10]} />
            <meshBasicMaterial
              map={tex}
              transparent
              opacity={i === 0 ? 1 : 0.24}
              depthWrite={i === 0}
              blending={i === 0 ? THREE.NormalBlending : THREE.AdditiveBlending}
            />
          </mesh>
        ))}
      </group>
      <mesh position={[0, 0, -0.2]}>
        <planeGeometry args={[8.6, 10.6]} />
        <meshBasicMaterial color="#0b0a09" />
      </mesh>
    </group>
  );
}

/* ---------------------------------------------------------- constellation */

const NODES: { label: string; p: [number, number, number] }[] = [
  { label: "CINEMA", p: [-6, 3.2, 0] },
  { label: "CULTURE", p: [5.4, 4.4, -4] },
  { label: "PEOPLE", p: [-4.8, -3.4, -6] },
  { label: "HISTORY", p: [6.4, -2.2, 2] },
  { label: "MEMORY", p: [0.4, 5.6, -8] },
  { label: "IDENTITY", p: [-8.2, 0.6, -3] },
  { label: "ART", p: [2.6, -5.2, -2] },
  { label: "STORYTELLING", p: [8.4, 1.4, -7] },
];

export function Constellation({
  z,
  onSelect,
}: {
  z: number;
  onSelect: (label: string) => void;
}) {
  const g = useRef<THREE.Group>(null);
  const lineRef = useRef<THREE.LineSegments>(null);
  const [hovered, setHovered] = useState<string | null>(null);

  const lines = useMemo(() => {
    const pts: number[] = [];
    NODES.forEach((n, i) => {
      const m = NODES[(i + 3) % NODES.length]!;
      pts.push(...n.p, ...m.p);
    });
    return new Float32Array(pts);
  }, []);

  useFrame((state, dt) => {
    if (!g.current) return;
    g.current.rotation.y = damp(
      g.current.rotation.y,
      journey.mouseX * 0.5 + state.clock.elapsedTime * 0.04,
      2,
      dt,
    );
    g.current.rotation.x = damp(g.current.rotation.x, -journey.mouseY * 0.22, 2, dt);
    
    // Animate line opacity based on time
    if (lineRef.current) {
      const material = lineRef.current.material as THREE.LineBasicMaterial;
      material.opacity = 0.16 + Math.sin(state.clock.elapsedTime * 0.8) * 0.06;
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
          opacity={0.16}
          blending={THREE.AdditiveBlending}
        />
      </lineSegments>
      {NODES.map((n) => (
        <group key={n.label} position={n.p}>
          {/* Glow effect */}
          <mesh scale={hovered === n.label ? 2.2 : 1.4}>
            <sphereGeometry args={[0.5, 16, 16]} />
            <meshBasicMaterial
              color={hovered === n.label ? EMPRESS : CHAMPAGNE}
              transparent
              opacity={hovered === n.label ? 0.15 : 0.08}
              blending={THREE.AdditiveBlending}
            />
          </mesh>
          
          <mesh
            onPointerOver={(e) => {
              e.stopPropagation();
              setHovered(n.label);
              document.body.dataset['cursor'] = 'view';
            }}
            onPointerOut={() => {
              setHovered(null);
              delete document.body.dataset['cursor'];
            }}
            onClick={(e) => {
              e.stopPropagation();
              onSelect(n.label);
            }}
            scale={hovered === n.label ? 1.7 : 1}
          >
            <octahedronGeometry args={[0.34, 0]} />
            <meshStandardMaterial
              color={hovered === n.label ? EMPRESS : CHAMPAGNE}
              emissive={hovered === n.label ? EMPRESS : CHAMPAGNE}
              emissiveIntensity={hovered === n.label ? 1.4 : 0.5}
              roughness={0.3}
              metalness={0.6}
            />
          </mesh>
          <Text
            position={[0, -0.85, 0]}
            fontSize={0.34}
            color={hovered === n.label ? IVORY : "#8d867a"}
            anchorX="center"
            letterSpacing={0.22}
          >
            {n.label}
          </Text>
        </group>
      ))}
    </group>
  );
}

/* --------------------------------------------------------------- archive */

export function Archive({ z, url }: { z: number; url: string }) {
  const tex = useTexture(url);
  const inst = useRef<THREE.InstancedMesh>(null);
  const count = 260;

  const matrices = useMemo(() => {
    const arr: THREE.Matrix4[] = [];
    const dummy = new THREE.Object3D();
    for (let i = 0; i < count; i++) {
      const side = i % 2 === 0 ? -1 : 1;
      dummy.position.set(
        side * (7 + Math.random() * 9),
        -6 + Math.floor(i / 12) * 1.15 + Math.random() * 0.2,
        -Math.random() * 60,
      );
      dummy.rotation.set(0, Math.random() * 0.3 * side, (Math.random() - 0.5) * 0.08);
      dummy.scale.set(0.36 + Math.random() * 0.3, 1.5 + Math.random() * 0.9, 1.1);
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
      <mesh position={[0, 0, -46]}>
        <planeGeometry args={[62, 40]} />
        <meshBasicMaterial map={tex} transparent opacity={0.72} />
      </mesh>
      <instancedMesh ref={inst} args={[undefined, undefined, count]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#2a231c" roughness={0.95} />
      </instancedMesh>
      <spotLight
        position={[0, 16, -12]}
        angle={0.45}
        penumbra={1}
        intensity={220}
        color={CHAMPAGNE}
        distance={70}
      />
    </group>
  );
}

/* ------------------------------------------------------------------ book */

export function Book({
  z,
  url,
  onOpen,
}: {
  z: number;
  url: string;
  onOpen: () => void;
}) {
  const tex = useTexture(url);
  const g = useRef<THREE.Group>(null);
  const drag = useRef({ active: false, x: 0, spin: 0, vel: 0 });

  useFrame((state, dt) => {
    if (!g.current) return;
    if (!drag.current.active) drag.current.vel *= 0.94;
    drag.current.spin += drag.current.vel * dt;
    g.current.rotation.y =
      drag.current.spin + Math.sin(state.clock.elapsedTime * 0.25) * 0.28;
    g.current.rotation.x = damp(
      g.current.rotation.x,
      -0.06 - journey.mouseY * 0.08,
      2.5,
      dt,
    );
    g.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.18;
  });

  const materials = useMemo(() => {
    const edge = new THREE.MeshStandardMaterial({ color: "#e6dfd0", roughness: 0.9 });
    const cloth = new THREE.MeshStandardMaterial({ color: "#0d0c0b", roughness: 0.85 });
    const front = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.55 });
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
        onPointerUp={() => (drag.current.active = false)}
        onPointerLeave={() => {
          drag.current.active = false;
          delete document.body.dataset['cursor'];
        }}
        onPointerMove={(e) => {
          if (!drag.current.active) return;
          const d = (e.clientX - drag.current.x) * 0.01;
          drag.current.vel = d * 12;
          drag.current.spin += d;
          drag.current.x = e.clientX;
        }}
        onPointerOver={() => (document.body.dataset['cursor'] = 'open')}
        onPointerOut={() => delete document.body.dataset['cursor']}
        onClick={(e) => {
          e.stopPropagation();
          onOpen();
        }}
      >
        <mesh material={materials}>
          <boxGeometry args={[4.2, 6.2, 0.72]} />
        </mesh>
      </group>
      <spotLight
        position={[3, 8, 8]}
        angle={0.35}
        penumbra={0.9}
        intensity={420}
        color="#fff3dd"
        distance={40}
      />
      <spotLight
        position={[-6, -3, 5]}
        angle={0.6}
        penumbra={1}
        intensity={180}
        color={EMPRESS}
        distance={35}
      />
    </group>
  );
}

/* ------------------------------------------------------------------ desk */

export function Desk({ z, url }: { z: number; url: string }) {
  const tex = useTexture(url);
  const g = useRef<THREE.Group>(null);
  useFrame((_, dt) => {
    if (!g.current) return;
    g.current.rotation.x = damp(g.current.rotation.x, -0.42 - journey.mouseY * 0.05, 2, dt);
    g.current.rotation.z = damp(g.current.rotation.z, journey.mouseX * 0.03, 2, dt);
  });
  return (
    <group position={[0, -3.2, z]} ref={g}>
      <mesh>
        <planeGeometry args={[30, 20]} />
        <meshBasicMaterial map={tex} />
      </mesh>
      <pointLight position={[0, 3, 6]} intensity={90} color="#ffd9a0" distance={30} />
    </group>
  );
}

/* -------------------------------------------------------------- future work */

export function FutureWork({ z }: { z: number }) {
  const g = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (!g.current) return;
    g.current.children.forEach((c, i) => {
      c.position.y = Math.sin(state.clock.elapsedTime * 0.3 + i) * 0.6 + i * 0.4 - 1;
      c.rotation.y = state.clock.elapsedTime * 0.08 + i;
    });
  });
  return (
    <group position={[0, 0, z]} ref={g}>
      {[-7, -2.5, 2.5, 7].map((x, i) => (
        <mesh key={x} position={[x, 0, -i * 4]}>
          <boxGeometry args={[2.6, 3.8, 0.4]} />
          <meshStandardMaterial
            color="#171310"
            roughness={0.4}
            metalness={0.3}
            transparent
            opacity={0.55 - i * 0.08}
            emissive={CHAMPAGNE}
            emissiveIntensity={0.06}
          />
        </mesh>
      ))}
    </group>
  );
}

/* ------------------------------------------------------------- fade veil */

export function Veil({ children }: { children?: ReactNode }) {
  const m = useRef<THREE.MeshBasicMaterial>(null);
  useFrame(() => {
    if (!m.current) return;
    const p = journey.progress;
    const intro = 1 - range(p, 0.0, 0.02);
    const outro = range(p, 0.965, 1);
    m.current.opacity = clamp(Math.max(intro * 0.78, outro));
  });
  return (
    <>
      {children}
      <mesh position={[0, 0, -0.6]} renderOrder={999}>
        <planeGeometry args={[40, 24]} />
        <meshBasicMaterial ref={m} color="#000000" transparent depthTest={false} />
      </mesh>
    </>
  );
}
