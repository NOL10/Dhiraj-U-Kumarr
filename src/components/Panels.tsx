import { useEffect, useRef, useState } from "react";

const NODE_ESSAYS: Record<string, { title: string; body: string; sub: string }> = {
  CINEMA: {
    title: "Cinema",
    sub: "On the argument inside the frame",
    body: "A film is a country arguing with itself for two and a half hours. I watch the arguments, then I go looking for the people who lost them.",
  },
  CULTURE: {
    title: "Culture",
    sub: "What survives the festival",
    body: "Culture is not the festival. It is the week after the festival, when everyone is tired and honest.",
  },
  PEOPLE: {
    title: "People",
    sub: "Every subject is a witness",
    body: "Nobody is a subject. Everybody is a witness. The interview begins the moment the recorder is switched off.",
  },
  HISTORY: {
    title: "History",
    sub: "The record is never missing",
    body: "The record is never missing. It is misfiled, in a language nobody in the room reads anymore.",
  },
  MEMORY: {
    title: "Memory",
    sub: "The unreliable narrator we must trust",
    body: "Memory is the only unreliable narrator we are legally required to trust. So I check it against paper.",
  },
  IDENTITY: {
    title: "Identity",
    sub: "A name changes shape",
    body: "A name changes shape depending on who is calling it. I write down every version.",
  },
  ART: {
    title: "Art",
    sub: "Restraint is the whole discipline",
    body: "Restraint is the whole discipline. Everything I cut is still in the book, holding up the floor.",
  },
  STORYTELLING: {
    title: "Storytelling",
    sub: "Structure is mercy",
    body: "Structure is mercy. Give the reader a door, a corridor, and a reason to keep walking.",
  },
};

const DESK_ITEMS: Record<string, { title: string; sub: string; body: string; meta: string }> = {
  notebook: {
    title: "The Notebook",
    sub: "Leather, half-ruined, carried through four cities.",
    meta: "Object no. 001 — The Beginning",
    body: "The first line of EMPRESS is on page 60, crossed out twice: 'She was four years old and already being watched.' Page 61 is blank. Page 62 tries again.",
  },
  manuscript: {
    title: "The Manuscript",
    sub: "Draft eleven. Still bleeding red.",
    meta: "Object no. 002 — The Work",
    body: "Two hundred thousand words became one hundred and twelve thousand. The chapter on 1983 was rewritten nine times before it stopped sounding like admiration and started sounding like a life.",
  },
  photograph: {
    title: "The Photograph",
    sub: "A contact strip from a studio floor, never printed.",
    meta: "Object no. 003 — The Evidence",
    body: "Between two takes she is not performing at all — and that half-second is the entire argument of the book. Nobody else kept this strip. I almost didn't find it.",
  },
  letter: {
    title: "The Letter",
    sub: "Sent in 1989. Answered in 2024.",
    meta: "Object no. 004 — The Thread",
    body: "A note sent in 1989 by a unit production assistant to his mother, describing a night shoot. He kept the carbon copy. Thirty-five years later he read it to me over the phone and wept.",
  },
};

const BOOK_PAGES = [
  {
    label: "Excerpt",
    chapter: "Before the light",
    body: "She arrives at the studio before the light does. The floor is still wet from the night wash. Somebody hands her tea she will not drink. In four hours a nation will decide, again, that it knows her.",
  },
  {
    label: "Chapter I",
    chapter: "A Child of the Frame — 1963–1975",
    body: "Meenampatti to Madras, the first contracts, the first exhaustion, the arithmetic of a family that had found its earner.",
  },
  {
    label: "Research",
    chapter: "The Method",
    body: "Built from 214 interviews, four private collections, two decades of trade press, and the call sheets of thirty-one productions — many of which were assumed to have been destroyed.",
  },
  {
    label: "A Note",
    chapter: "On the word 'icon'",
    body: "This book refuses the word 'icon' wherever a truer word exists. She was a worker of extraordinary precision. That is the higher compliment.",
  },
  {
    label: "The Method",
    chapter: "From the inside out",
    body: "I did not write about her from the outside. I wrote from the inside out — from the call sheets, the contracts, the unreturned letters. The method was the same as hers: show up, do the work, disappear.",
  },
  {
    label: "Legacy",
    chapter: "What remains",
    body: "What remains is not the image but the labor. The three hundred films. The eighteen-hour days. The refusal to be reduced to a single frame, however iconic that frame may be.",
  },
];

/* ────────────────────────────────────── Close key hook */
function useEscClose(onClose: () => void) {
  useEffect(() => {
    const k = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [onClose]);
}

/* ────────────────────────────────────── Panel Shell */
function Shell({
  onClose,
  eyebrow,
  title,
  meta,
  children,
  accentColor = "champagne",
}: {
  onClose: () => void;
  eyebrow: string;
  title: string;
  meta?: string;
  children: React.ReactNode;
  accentColor?: "champagne" | "empress";
}) {
  useEscClose(onClose);
  const [mounted, setMounted] = useState(false);
  useEffect(() => { requestAnimationFrame(() => setMounted(true)); }, []);

  const accent = accentColor === "empress" ? "var(--empress)" : "var(--champagne)";

  return (
    <div className="fixed inset-0 z-[65] flex items-center justify-center">
      {/* Backdrop */}
      <button
        aria-label="Close panel"
        onClick={onClose}
        data-cursor="close"
        className="absolute inset-0"
        style={{
          background: "oklch(0.04 0.005 58 / 0.92)",
          backdropFilter: "blur(20px) saturate(120%)",
        }}
      />

      {/* Panel */}
      <div
        className="relative w-full max-w-3xl mx-4 md:mx-auto transition-all duration-700 ease-out"
        style={{
          opacity: mounted ? 1 : 0,
          transform: mounted ? "translateY(0) scale(1)" : "translateY(24px) scale(0.98)",
        }}
      >
        {/* Corner brackets */}
        <div
          className="absolute top-0 left-0 w-10 h-10 pointer-events-none"
          style={{ borderTop: `1px solid ${accent}`, borderLeft: `1px solid ${accent}`, opacity: 0.5 }}
        />
        <div
          className="absolute bottom-0 right-0 w-10 h-10 pointer-events-none"
          style={{ borderBottom: `1px solid ${accent}`, borderRight: `1px solid ${accent}`, opacity: 0.5 }}
        />

        {/* Inner card */}
        <div
          className="border border-border/60 p-8 md:p-14"
          style={{
            background: "oklch(0.08 0.006 65 / 0.95)",
            backdropFilter: "blur(8px)",
          }}
        >
          {/* Header row */}
          <div className="flex items-start justify-between gap-6 mb-8">
            <div>
              <p className="eyebrow" style={{ color: accent }}>{eyebrow}</p>
              {meta && (
                <p className="eyebrow-sm mt-1 text-muted-foreground/40">{meta}</p>
              )}
            </div>
            <button
              onClick={onClose}
              data-cursor="close"
              className="eyebrow flex items-center gap-2 text-muted-foreground/50 transition-colors duration-300 hover:text-ivory shrink-0 pt-0.5"
            >
              <span>Esc</span>
              <span className="border border-border/60 px-1.5 py-0.5 text-[9px] leading-none">✕</span>
            </button>
          </div>

          {/* Title */}
          <h3
            className="display text-5xl text-ivory md:text-7xl"
            style={{ lineHeight: 0.88 }}
          >
            {title}
          </h3>

          {/* Rule */}
          <div
            className="mt-8 h-px w-full"
            style={{
              background: `linear-gradient(90deg, ${accent}, transparent)`,
              opacity: 0.4,
            }}
          />

          {/* Content */}
          <div className="mt-8">{children}</div>

          {/* Close button */}
          <div className="mt-12 flex items-center justify-between border-t border-border/40 pt-6">
            <button
              onClick={onClose}
              data-cursor="close"
              className="eyebrow flex items-center gap-3 text-muted-foreground/60 transition-all duration-300 hover:text-champagne group"
            >
              <span
                className="inline-block h-px w-5 bg-current transition-all duration-300 group-hover:w-8"
              />
              Close
            </button>
            <p className="eyebrow-sm text-[9px] text-muted-foreground/25">
              Dhiraj U. Kummar
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ────────────────────────────────────── Node panel */
export function NodePanel({ id, onClose }: { id: string; onClose: () => void }) {
  const e = NODE_ESSAYS[id];
  if (!e) return null;
  return (
    <Shell onClose={onClose} eyebrow="The way he sees" title={e.title} meta={e.sub}>
      <blockquote className="display italic text-2xl leading-snug text-foreground/85 md:text-3xl">
        "{e.body}"
      </blockquote>
    </Shell>
  );
}

/* ────────────────────────────────────── Desk panel */
export function DeskPanel({ id, onClose }: { id: string; onClose: () => void }) {
  const e = DESK_ITEMS[id];
  if (!e) return null;
  return (
    <Shell onClose={onClose} eyebrow="From the desk" title={e.title} meta={e.meta}>
      <p className="text-sm leading-[1.9] text-champagne/80 font-light mb-6 italic">{e.sub}</p>
      <p className="text-[15px] leading-[1.95] text-foreground/75 font-light">{e.body}</p>
    </Shell>
  );
}

/* ────────────────────────────────────── Book panel */
export function BookPanel({ onClose }: { onClose: () => void }) {
  const [current, setCurrent] = useState(0);
  const [animating, setAnimating] = useState(false);
  const [direction, setDirection] = useState<1 | -1>(1);
  const contentRef = useRef<HTMLDivElement>(null);

  const navigate = (next: number, dir: 1 | -1) => {
    if (animating || next < 0 || next >= BOOK_PAGES.length) return;
    setAnimating(true);
    setDirection(dir);
    // brief exit → then enter
    setTimeout(() => {
      setCurrent(next);
      setAnimating(false);
    }, 320);
  };

  const page = BOOK_PAGES[current]!;

  return (
    <Shell
      onClose={onClose}
      eyebrow="Empress · Biography of Sridevi"
      title="From the pages"
      accentColor="empress"
    >
      {/* Page content */}
      <div
        ref={contentRef}
        className="transition-all duration-300 ease-in-out"
        style={{
          opacity: animating ? 0 : 1,
          transform: animating
            ? `translateX(${direction * 16}px)`
            : "translateX(0)",
        }}
      >
        <div className="border-t border-border/40 pt-7">
          <div className="flex items-baseline gap-4 mb-5">
            <span className="eyebrow" style={{ color: "var(--empress)" }}>{page.label}</span>
            <span className="eyebrow-sm text-muted-foreground/40">{page.chapter}</span>
          </div>
          <p className="text-[17px] leading-[2] text-foreground/85 font-light">{page.body}</p>
        </div>
      </div>

      {/* Pagination */}
      <div className="mt-10 flex items-center justify-between border-t border-border/40 pt-6">
        <button
          onClick={() => navigate(current - 1, -1)}
          disabled={current === 0}
          className="eyebrow flex items-center gap-2 text-ivory transition-all duration-300 hover:text-champagne disabled:opacity-25 group"
        >
          <span className="inline-block w-5 h-px bg-current transition-all duration-300 group-hover:w-8 group-disabled:w-5" />
          Prev
        </button>

        {/* Dot indicators */}
        <div className="flex items-center gap-2">
          {BOOK_PAGES.map((_, i) => (
            <button
              key={i}
              onClick={() => navigate(i, i > current ? 1 : -1)}
              aria-label={`Page ${i + 1}`}
              className="transition-all duration-400"
              style={{
                height: 2,
                width: i === current ? 28 : 10,
                background: i === current ? "var(--empress)" : "var(--border-strong)",
                borderRadius: 1,
              }}
            />
          ))}
        </div>

        <button
          onClick={() => navigate(current + 1, 1)}
          disabled={current === BOOK_PAGES.length - 1}
          className="eyebrow flex items-center gap-2 text-ivory transition-all duration-300 hover:text-champagne disabled:opacity-25 group"
        >
          Next
          <span className="inline-block w-5 h-px bg-current transition-all duration-300 group-hover:w-8 group-disabled:w-5" />
        </button>
      </div>

      {/* Page count */}
      <p className="mt-4 text-center eyebrow-sm text-[9px] text-muted-foreground/30">
        {String(current + 1).padStart(2, "0")} / {String(BOOK_PAGES.length).padStart(2, "0")}
      </p>
    </Shell>
  );
}
