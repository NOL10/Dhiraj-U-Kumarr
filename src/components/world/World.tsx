import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Suspense, useRef, useState } from "react";
import * as THREE from "three";
import { journey, range, bell, damp } from "@/lib/journey";
import { EffectComposer, Bloom, ChromaticAberration, Vignette } from "@react-three/postprocessing";
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

import portraitUrl from "@/assets/portrait.jpg";
import coverUrl from "@/assets/empress-cover.jpeg";
import deskUrl from "@/assets/desk.jpg";
import archiveUrl from "@/assets/archive.jpg";

/** Z position of each chapter's stage in the world. */
const Z = {
  hero: -13,
  portrait: -68,
  words: -88,
  mind: -107,
  archive: -146,
  book: -185,
  desk: -223,
  future: -262,
  final: -301,
};

const TRAVEL = 300;

function CameraRig() {
  const { camera } = useThree();
  const target = useRef(new THREE.Vector3());

  useFrame((state, dt) => {
    const p = journey.progress;
    const ex = journey.explode;

    // Base dolly: forward travel through the world.
    const z = 8 - p * TRAVEL;
    const sway = Math.sin(p * 14) * 2.4 * (1 - ex);
    const lift = Math.sin(p * 8.5) * 1.4 + bell(p, 0.72, 0.9) * -1.6;

    const px = sway + journey.mouseX * 1.9 * (1 - ex) + ex * 26;
    const py = lift + journey.mouseY * -1.1 * (1 - ex) + ex * 16;
    const pz = z + ex * 120;

    const l = journey.reduced ? 12 : 2.6;
    camera.position.x = damp(camera.position.x, px, l, dt);
    camera.position.y = damp(camera.position.y, py, l, dt);
    camera.position.z = damp(camera.position.z, pz, l, dt);

    target.current.set(
      journey.mouseX * 1.2 * (1 - ex) - ex * 8,
      journey.mouseY * -0.6 * (1 - ex),
      z - 22 - ex * 60,
    );
    camera.lookAt(target.current);

    const cam = camera as THREE.PerspectiveCamera;
    const targetFov =
      42 + Math.min(Math.abs(journey.velocity) * 0.01, 8) + ex * 18;
    cam.fov = damp(cam.fov, targetFov, 3, dt);
    cam.updateProjectionMatrix();

    state.scene.fog = new THREE.FogExp2("#050403", 0.0075 - ex * 0.004);
  });
  return null;
}

function HeroTitle() {
  const g = useRef<THREE.Group>(null);
  const back = useRef<THREE.Group>(null);
  useFrame((_, dt) => {
    const p = journey.progress;
    if (g.current) {
      const v = range(p, 0.005, 0.06);
      g.current.position.y = damp(g.current.position.y, -2 + v * 2, 2, dt);
      (g.current as THREE.Group).visible = p < 0.2;
    }
    if (back.current) {
      const v = range(p, 0.04, 0.12);
      back.current.position.y = damp(back.current.position.y, -6 + v * 5.4, 2, dt);
    }
  });

  return (
    <group>
      <group ref={g} position={[0, 0, Z.hero]}>
        <Sculpt size={5.4}>DHIRAJ</Sculpt>
      </group>
      <group ref={back} position={[0, -6, Z.hero - 16]}>
        <Sculpt size={3.1} color="#8d867a" roughness={0.8} metalness={0.05}>
          U. KUMMAR
        </Sculpt>
      </group>
      <pointLight position={[0, 2, Z.hero + 9]} intensity={420} color="#fff0d6" distance={60} />
      <spotLight
        position={[-12, 8, Z.hero + 12]}
        angle={0.6}
        penumbra={1}
        intensity={620}
        color="#c8ab72"
        distance={60}
      />
      <spotLight
        position={[14, -6, Z.hero + 6]}
        angle={0.5}
        penumbra={1}
        intensity={160}
        color="#b0175c"
        distance={55}
      />
    </group>
  );
}

const WORDS: { w: string; p: [number, number, number]; r: number; s: number }[] = [
  { w: "AUTHOR", p: [-9, 4, Z.words + 14], r: 0.22, s: 3.2 },
  { w: "STORY", p: [11, -3.4, Z.words - 2], r: -0.3, s: 4.4 },
  { w: "MEMORY", p: [-6, -6.5, Z.words - 20], r: 0.1, s: 5.6 },
  { w: "CINEMA", p: [8, 6.5, Z.words - 34], r: -0.14, s: 3.8 },
  { w: "LEGACY", p: [-12, 1.5, Z.words - 48], r: 0.4, s: 6.2 },
  { w: "OBSERVATION", p: [4, -8, Z.archive + 24], r: 0.06, s: 2.4 },
  { w: "WRITING", p: [-10, 7, Z.book + 30], r: -0.2, s: 3.4 },
];

function WordField() {
  const g = useRef<THREE.Group>(null);
  useFrame((_, dt) => {
    if (!g.current) return;
    g.current.children.forEach((c, i) => {
      c.rotation.y = damp(
        c.rotation.y,
        (WORDS[i]?.r ?? 0) + journey.mouseX * 0.12,
        1.8,
        dt,
      );
    });
  });
  return (
    <group ref={g}>
      {WORDS.map((word) => (
        <group key={word.w} position={word.p}>
          <Sculpt size={word.s} color="#3a332b" roughness={0.9} metalness={0.05}>
            {word.w}
          </Sculpt>
        </group>
      ))}
    </group>
  );
}

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
      dpr={[1, 1.7]}
      gl={{ 
        antialias: true, 
        powerPreference: "high-performance"
      }}
      shadows
      camera={{ position: [0, 0, 8], fov: 42, near: 0.1, far: 500 }}
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.2;
        setReady(true);
      }}
    >
      <color attach="background" args={["#050403"]} />
      <ambientLight intensity={0.35} color="#8a7f6d" />
      <directionalLight
        position={[10, 10, 5]}
        intensity={0.3}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-camera-far={50}
        shadow-camera-left={-20}
        shadow-camera-right={20}
        shadow-camera-top={20}
        shadow-camera-bottom={-20}
      />
      <CameraRig />
      <Suspense fallback={null}>
        <Veil>
          <HeroTitle />
          <WordField />
          <Portrait
            url={portraitUrl}
            position={[0, 0.6, Z.portrait]}
            scale={1.25}
            reveal={[0.14, 0.24]}
          />
          <Constellation z={Z.mind} onSelect={onNode} />
          <Archive z={Z.archive} url={archiveUrl} />
          <Book z={Z.book} url={coverUrl} onOpen={onBook} />
          <Desk z={Z.desk} url={deskUrl} />
          <FutureWork z={Z.future} />
          <group position={[0, 0, Z.final]}>
            <Sculpt size={2.1} color="#efe9df" roughness={0.5}>
              DHIRAJ U. KUMMAR
            </Sculpt>
            <pointLight position={[0, 0, 10]} intensity={140} color="#fff0d6" distance={40} />
          </group>
          <Dust />
        </Veil>
      </Suspense>
      <EffectComposer>
        <Bloom luminanceThreshold={0.3} luminanceSmoothing={0.9} height={300} intensity={0.3} />
        <ChromaticAberration offset={new THREE.Vector2(0.001, 0.001)} />
        <Vignette eskil={false} offset={0.1} darkness={0.2} />
      </EffectComposer>
      {ready ? null : null}
    </Canvas>
  );
}
