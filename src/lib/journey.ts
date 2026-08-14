// Shared, render-free state for the cinematic journey.
// Updated by Lenis (scroll) and pointer events, read inside useFrame.

export const journey = {
  progress: 0, // 0..1 through the whole world
  velocity: 0,
  mouseX: 0, // -1..1
  mouseY: 0, // -1..1
  explode: 0, // 0..1 — the EXPLORE pull-back
  reduced: false,
  touchStartX: 0,
  touchStartY: 0,
  isTouching: false,
};

export type Chapter = {
  id: string;
  label: string;
  start: number;
  end: number;
};

export const CHAPTERS: Chapter[] = [
  { id: "dhiraj", label: "Dhiraj", start: 0.0, end: 0.13 },
  { id: "world", label: "World", start: 0.13, end: 0.26 },
  { id: "mind", label: "Mind", start: 0.26, end: 0.39 },
  { id: "archive", label: "Archive", start: 0.39, end: 0.52 },
  { id: "empress", label: "Empress", start: 0.52, end: 0.65 },
  { id: "desk", label: "Desk", start: 0.65, end: 0.78 },
  { id: "next", label: "Next", start: 0.78, end: 1.0 },
];

export const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));

/** 0 before `a`, 1 after `b`, smooth in between. */
export function range(p: number, a: number, b: number) {
  return clamp((p - a) / (b - a));
}

export function smooth(t: number) {
  return t * t * (3 - 2 * t);
}

/** Rises to 1 at the middle of [a,b] then falls back to 0. */
export function bell(p: number, a: number, b: number) {
  const t = range(p, a, b);
  return smooth(1 - Math.abs(t * 2 - 1));
}

export function damp(current: number, target: number, lambda: number, dt: number) {
  return current + (target - current) * (1 - Math.exp(-lambda * dt));
}
