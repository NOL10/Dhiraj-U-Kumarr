import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Suspense, useRef, useState } from "react";
import * as THREE from "three";
import { journey, range, bell, damp } from "@/lib/journey";
import {
  EffectComposer,
  Bloom,
  ChromaticAberration,
  Vignette,
  Noise,
} from "@react-three/postprocessing";
import { BlendFunction } from "postprocessing";
import {
  Archive,
  Book,
  Constellation,
  Desk,
  Dust,
  FutureWork,
  Portrait,
  Sculpt,
  Veil,
} from "./pieces";

import portraitUrl  from "@/assets/portrait.jpg";
import coverUrl     from "@/assets/empress-cover.jpeg";
import deskUrl      from "@/assets/desk.jpg";
import archiveUrl   from "@/assets/archive.jpg";

/** Z position of each chapter's stage in the world. */
const Z = {
  hero:    -13,
  portrait: -68,
  words:    -88,
  mind:    -107,
  archive: -146,
  book:    -185,
  desk:    -223,
  future:  -262,
  final:   -301,
};

const TRAVEL = 300;

/* ─────────────────────────────────────── Camera rig */
function CameraRig() {
  const { camera } = useThree();
  const target = useRef(new THREE.Vector3());

  useFrame((state, dt) => {
    const p  = journey.progress;
    const ex = journey.explode;

    // Base dolly — forward through the world
    const z    = 8 - p * TRAVEL;
    // More dramatic sway arcs + a subtle S-curve lift
    const sway = Math.sin(p * 12) * 2.8 * (1 - ex) + Math.sin(p * 5) * 1.1 * (1 - ex);
    const lift = Math.sin(p * 7.5) * 1.8 + bell(p, 0.72, 0.9) * -2.2;

    const px = sway + journey.mouseX * 2.2 * (1 - ex) + ex * 28;
    const py = lift + journey.mouseY * -1.3 * (1 - ex) + ex * 18;
    const pz = z + ex * 128;

    const l = journey.reduced ? 14 : 2.4;
    camera.position.x = damp(camera.position.x, px, l, dt);
    camera.position.y = damp(camera.position.y, py, l, dt);
    camera.position.z = damp(camera.position.z, pz, l, dt);

    target.current.set(
      journey.mouseX * 1.4 * (1 - ex) - ex * 9,
      journey.mouseY * -0.7 * (1 - ex),
      z - 24 - ex * 65,
    );
    camera.lookAt(target.current);

    const cam = camera as THREE.PerspectiveCamera;
    // Wider base FOV (46) + more dramatic velocity breathing + explore pull-back
    const targetFov = 46 + Math.min(Math.abs(journey.velocity) * 0.014, 10) + ex * 22;
    cam.fov = damp(cam.fov, targetFov, 3.2, dt);
    cam.updateProjectionMatrix();

    // Fog gets thinner during explore so more of the world is visible
    state.scene.fog = new THREE.FogExp2("#040302", 0.0068 - ex * 0.003);
  });

  return null;
}

/* ─────────────────────────────────────── Hero title */
function HeroTitle() {
  const g    = useRef<THREE.Group>(null);
  const back = useRef<THREE.Group>(null);
  const glow = useRef<THREE.PointLight>(null);

  useFrame((state, dt) => {
    const p = journey.progress;

    if (g.current) {
      const v = range(p, 0.005, 0.07);
      g.current.position.y = damp(g.current.position.y, -2 + v * 2.2, 2, dt);
      g.current.visible = p < 0.22;
    }
    if (back.current) {
      const v = range(p, 0.04, 0.14);
      back.current.position.y = damp(back.current.position.y, -6 + v * 5.6, 2, dt);
    }
    // Pulsing hero light
    if (glow.current) {
      glow.current.intensity = 380 + Math.sin(state.clock.elapsedTime * 1.4) * 60;
    }
  });

  return (
    <group>
      <group ref={g} position={[0, 0, Z.hero]}>
        <Sculpt size={5.4} roughness={0.48} metalness={0.22}>DHIRAJ</Sculpt>
      </group>
      <group ref={back} position={[0, -6, Z.hero - 16]}>
        <Sculpt size={3.1} color="#7a7268" roughness={0.85} metalness={0.04}>
          U. KUMMAR
        </Sculpt>
      </group>

      {/* Key light — warm gold */}
      <pointLight
        ref={glow}
        position={[0, 3, Z.hero + 10]}
        intensity={380}
        color="#fff2d8"
        distance={72}
      />
      {/* Left fill — champagne */}
      <spotLight
        position={[-14, 10, Z.hero + 14]}
        angle={0.55}
        penumbra={1}
        intensity={700}
        color="#c8ab72"
        distance={68}
        castShadow
        shadow-mapSize={[1024, 1024]}
      />
      {/* Right accent — empress */}
      <spotLight
        position={[16, -7, Z.hero + 8]}
        angle={0.45}
        penumbra={1}
        intensity={220}
        color="#b0175c"
        distance={60}
      />
      {/* Back rim */}
      <pointLight position={[0, -2, Z.hero - 8]} intensity={80} color="#3a1a2a" distance={30} />
    </group>
  );
}

/* ─────────────────────────────────────── Floating word field */
const WORDS: { w: string; p: [number, number, number]; r: number; s: number }[] = [
  { w: "AUTHOR",      p: [-9,    4,    Z.words + 14],  r:  0.22, s: 3.2 },
  { w: "STORY",       p: [11,   -3.4,  Z.words - 2],   r: -0.30, s: 4.4 },
  { w: "MEMORY",      p: [-6,   -6.5,  Z.words - 20],  r:  0.10, s: 5.6 },
  { w: "CINEMA",      p: [8,     6.5,  Z.words - 34],  r: -0.14, s: 3.8 },
  { w: "LEGACY",      p: [-12,   1.5,  Z.words - 48],  r:  0.40, s: 6.2 },
  { w: "OBSERVATION", p: [4,    -8,    Z.archive + 24], r: 0.06, s: 2.4 },
  { w: "WRITING",     p: [-10,   7,    Z.book + 30],   r: -0.20, s: 3.4 },
];

function WordField() {
  const g = useRef<THREE.Group>(null);

  useFrame((state, dt) => {
    if (!g.current) return;
    g.current.children.forEach((c, i) => {
      c.rotation.y = damp(
        c.rotation.y,
        (WORDS[i]?.r ?? 0) + journey.mouseX * 0.14,
        1.6,
        dt,
      );
      // Subtle vertical float per word
      c.position.y = damp(
        c.position.y,
        (WORDS[i]?.p[1] ?? 0) + Math.sin(state.clock.elapsedTime * 0.22 + i * 1.3) * 0.4,
        0.8,
        dt,
      );
    });
  });

  return (
    <group ref={g}>
      {WORDS.map((word) => (
        <group key={word.w} position={word.p}>
          <Sculpt size={word.s} color="#2e2820" roughness={0.92} metalness={0.03}>
            {word.w}
          </Sculpt>
        </group>
      ))}
    </group>
  );
}

/* ─────────────────────────────────────── Scene ambient / global lights */
function SceneLights() {
  const rimRef   = useRef<THREE.DirectionalLight>(null);
  const fillRef  = useRef<THREE.PointLight>(null);

  useFrame((state) => {
    // Rim light slowly orbits
    if (rimRef.current) {
      rimRef.current.position.x = Math.sin(state.clock.elapsedTime * 0.06) * 18;
      rimRef.current.position.z = Math.cos(state.clock.elapsedTime * 0.06) * 12 + 5;
    }
    // Fill dims as user dives deeper into the world
    if (fillRef.current) {
      fillRef.current.intensity = 0.25 + (1 - journey.progress) * 0.18;
    }
  });

  return (
    <>
      <ambientLight intensity={0.28} color="#8a7860" />
      <directionalLight
        ref={rimRef}
        position={[10, 12, 5]}
        intensity={0.38}
        color="#fff0d0"
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-camera-far={60}
        shadow-camera-left={-24}
        shadow-camera-right={24}
        shadow-camera-top={24}
        shadow-camera-bottom={-24}
      />
      {/* Soft hemisphere fill */}
      <pointLight ref={fillRef} position={[0, 30, -80]} intensity={0.4} color="#c8a870" distance={200} />
      {/* Deep ambient tint at back */}
      <pointLight position={[0, -10, -260]} intensity={0.6} color="#1a0a14" distance={120} />
    </>
  );
}

/* ─────────────────────────────────────── Post-processing */
function PostFX() {
  return (
    <EffectComposer multisampling={0}>
      <Bloom
        luminanceThreshold={0.24}
        luminanceSmoothing={0.88}
        intensity={0.55}
        mipmapBlur
      />
      <ChromaticAberration
        offset={new THREE.Vector2(0.0008, 0.0008)}
      />
      <Noise
        opacity={0.028}
        blendFunction={BlendFunction.ADD}
      />
      <Vignette eskil={false} offset={0.12} darkness={0.55} />
    </EffectComposer>
  );
}

/* ─────────────────────────────────────── World */
export default function World({
  onNode,
  onBook,
}: {
  onNode: (label: string) => void;
  onBook: () => void;
}) {
  const [ready, setReady] = useState(false);

  return (
    <Canvas
      dpr={[1, 1.8]}
      gl={{
        antialias:       true,
        powerPreference: "high-performance",
        stencil:         false,
      }}
      shadows="soft"
      camera={{ position: [0, 0, 8], fov: 46, near: 0.1, far: 520 }}
      onCreated={({ gl }) => {
        gl.toneMapping         = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.28;
        setReady(true);
      }}
    >
      <color attach="background" args={["#040302"]} />

      <SceneLights />
      <CameraRig />

      <Suspense fallback={null}>
        <Veil>
          <HeroTitle />
          <WordField />
          <Portrait
            url={portraitUrl}
            position={[0, 0.6, Z.portrait]}
            scale={1.28}
            reveal={[0.14, 0.25]}
          />
          <Constellation z={Z.mind} onSelect={onNode} />
          <Archive z={Z.archive} url={archiveUrl} />
          <Book z={Z.book} url={coverUrl} onOpen={onBook} />
          <Desk z={Z.desk} url={deskUrl} />
          <FutureWork z={Z.future} />
          <group position={[0, 0, Z.final]}>
            <Sculpt size={2.1} color="#efe9df" roughness={0.44} metalness={0.18}>
              DHIRAJ U. KUMMAR
            </Sculpt>
            <pointLight position={[0, 0, 10]} intensity={160} color="#fff2d0" distance={45} />
            <spotLight
              position={[-8, 6, 8]}
              angle={0.5}
              penumbra={1}
              intensity={200}
              color="#c8ab72"
              distance={40}
            />
          </group>
          <Dust />
        </Veil>
      </Suspense>

      {ready && <PostFX />}
    </Canvas>
  );
}
