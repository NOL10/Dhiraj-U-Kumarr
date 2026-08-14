import { useEffect, useRef, useState } from "react";

const LABEL_MAP: Record<string, string> = {
  explore:     "Explore",
  return:      "Return",
  open:        "Open",
  read:        "Read",
  view:        "View",
  write:       "Write",
  close:       "Close",
  mute:        "Mute",
  listen:      "Listen",
};

/* Each cursor mode has a unique visual treatment */
const MODE_STYLES: Record<string, { size: number; border: string; bg: string; mix: string }> = {
  default: { size: 28,  border: "oklch(0.83 0.072 78 / 35%)",  bg: "transparent",                           mix: "normal"     },
  explore: { size: 80,  border: "oklch(0.83 0.072 78 / 55%)",  bg: "oklch(0.83 0.072 78 / 8%)",             mix: "normal"     },
  return:  { size: 80,  border: "oklch(0.52 0.23 352 / 60%)",  bg: "oklch(0.52 0.23 352 / 10%)",            mix: "normal"     },
  open:    { size: 80,  border: "oklch(0.83 0.072 78 / 50%)",  bg: "oklch(0.83 0.072 78 / 6%)",             mix: "normal"     },
  read:    { size: 70,  border: "oklch(0.96 0.016 88 / 40%)",  bg: "oklch(0.83 0.072 78 / 5%)",             mix: "normal"     },
  view:    { size: 70,  border: "oklch(0.52 0.23 352 / 50%)",  bg: "oklch(0.52 0.23 352 / 8%)",             mix: "normal"     },
  write:   { size: 70,  border: "oklch(0.83 0.072 78 / 45%)",  bg: "oklch(0.83 0.072 78 / 6%)",             mix: "normal"     },
  close:   { size: 64,  border: "oklch(0.96 0.016 88 / 30%)",  bg: "oklch(0.07 0.005 58 / 40%)",            mix: "normal"     },
  mute:    { size: 60,  border: "oklch(0.58 0.012 78 / 40%)",  bg: "transparent",                           mix: "normal"     },
  listen:  { size: 60,  border: "oklch(0.83 0.072 78 / 40%)",  bg: "oklch(0.83 0.072 78 / 5%)",             mix: "normal"     },
};

export function Cursor() {
  const dotRef  = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const [mode, setMode]       = useState("default");
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(pointer: coarse)").matches) return;
    setEnabled(true);

    const pos  = { x: innerWidth  / 2, y: innerHeight / 2 };
    const ring = { x: pos.x, y: pos.y };
    let raf = 0;

    const onMove = (e: PointerEvent) => {
      pos.x = e.clientX;
      pos.y = e.clientY;

      // Determine mode from closest data-cursor ancestor or body dataset
      const el  = e.target as HTMLElement | null;
      const tag = el?.closest?.("[data-cursor]") as HTMLElement | null;
      const raw = tag?.dataset["cursor"] ?? document.body.dataset["cursor"] ?? "";
      setMode(raw || "default");
    };

    const loop = () => {
      // Dot — instant (tracks exactly)
      const dx = pos.x  - ring.x;
      const dy = pos.y  - ring.y;
      ring.x += dx * 0.13;
      ring.y += dy * 0.13;

      if (dotRef.current) {
        dotRef.current.style.transform  = `translate3d(${pos.x}px,${pos.y}px,0)`;
      }
      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${ring.x}px,${ring.y}px,0)`;
      }
      raf = requestAnimationFrame(loop);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    raf = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  if (!enabled) return null;

  const s     = MODE_STYLES[mode] ?? MODE_STYLES["default"]!;
  const half  = s.size / 2;
  const label = LABEL_MAP[mode] ?? "";

  return (
    <div className="pointer-events-none fixed inset-0 z-[70] hidden md:block">
      {/* ── Dot — sharp, instant */}
      <div
        ref={dotRef}
        style={{
          position: "absolute",
          width:  4,
          height: 4,
          borderRadius: "50%",
          background: "var(--ivory)",
          marginLeft: -2,
          marginTop:  -2,
          mixBlendMode: "difference" as React.CSSProperties["mixBlendMode"],
          willChange: "transform",
        }}
      />

      {/* ── Ring — lagging, morphing */}
      <div
        ref={ringRef}
        style={{
          position:    "absolute",
          width:       s.size,
          height:      s.size,
          marginLeft:  -half,
          marginTop:   -half,
          borderRadius: "50%",
          border:      `1px solid ${s.border}`,
          background:  s.bg,
          mixBlendMode: s.mix as React.CSSProperties["mixBlendMode"],
          display:     "flex",
          alignItems:  "center",
          justifyContent: "center",
          transition:  "width 0.45s cubic-bezier(0.16,1,0.3,1), height 0.45s cubic-bezier(0.16,1,0.3,1), margin 0.45s cubic-bezier(0.16,1,0.3,1), border-color 0.4s ease, background 0.4s ease",
          willChange:  "transform",
        }}
      >
        {label && (
          <span
            ref={textRef}
            style={{
              fontFamily:    "var(--font-sans)",
              fontSize:      "0.5625rem",
              fontWeight:    500,
              letterSpacing: "0.42em",
              textTransform: "uppercase",
              color:         "var(--ivory)",
              opacity:       label ? 1 : 0,
              transition:    "opacity 0.3s ease",
              userSelect:    "none",
              whiteSpace:    "nowrap",
            }}
          >
            {label}
          </span>
        )}
      </div>
    </div>
  );
}
