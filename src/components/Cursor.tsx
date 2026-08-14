import { useEffect, useRef, useState } from "react";

export function Cursor() {
  const dot = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);
  const [label, setLabel] = useState<string>("");
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(pointer: coarse)").matches) return;
    setEnabled(true);

    const pos = { x: innerWidth / 2, y: innerHeight / 2 };
    const soft = { x: pos.x, y: pos.y };
    let raf = 0;

    const move = (e: PointerEvent) => {
      pos.x = e.clientX;
      pos.y = e.clientY;
      const el = e.target as HTMLElement | null;
      const tag = el?.closest?.("[data-cursor]") as HTMLElement | null;
      setLabel(tag?.dataset['cursor'] ?? document.body.dataset['cursor'] ?? "");
    };

    const loop = () => {
      soft.x += (pos.x - soft.x) * 0.16;
      soft.y += (pos.y - soft.y) * 0.16;
      if (dot.current)
        dot.current.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0)`;
      if (ring.current)
        ring.current.style.transform = `translate3d(${soft.x}px, ${soft.y}px, 0)`;
      raf = requestAnimationFrame(loop);
    };

    window.addEventListener("pointermove", move);
    raf = requestAnimationFrame(loop);
    return () => {
      window.removeEventListener("pointermove", move);
      cancelAnimationFrame(raf);
    };
  }, []);

  if (!enabled) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[70] hidden md:block">
      <div
        ref={dot}
        className="absolute -ml-[2px] -mt-[2px] h-1 w-1 rounded-full bg-ivory"
      />
      <div
        ref={ring}
        className="absolute flex items-center justify-center rounded-full border border-champagne/50 transition-[width,height,background-color] duration-300"
        style={{
          width: label ? 74 : 30,
          height: label ? 74 : 30,
          marginLeft: label ? -37 : -15,
          marginTop: label ? -37 : -15,
          backgroundColor: label ? "color-mix(in oklab, var(--empress) 22%, transparent)" : "transparent",
        }}
      >
        <span className="eyebrow text-[9px] text-ivory">{label.toUpperCase()}</span>
      </div>
    </div>
  );
}
