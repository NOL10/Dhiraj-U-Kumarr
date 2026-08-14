import { useEffect, useRef, useState } from "react";
import { CHAPTERS, journey } from "@/lib/journey";

/* ─────────────────────────────────────── Reveal block */

function Reveal({
  children,
  className = "",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [seen, setSeen] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => { if (e && e.intersectionRatio > 0.08) setSeen(true); },
      { threshold: [0, 0.1] },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`transition-all ease-out ${
        seen ? "translate-y-0 opacity-100 blur-0" : "translate-y-10 opacity-0 blur-[8px]"
      } ${className}`}
      style={{ transitionDuration: "1100ms", transitionDelay: seen ? `${delay}ms` : "0ms" }}
    >
      {children}
    </div>
  );
}

/* ─────────────────────────────────────── Marquee strip */

function MarqueeStrip({
  items,
  reverse = false,
  accent = false,
}: {
  items: string[];
  reverse?: boolean;
  accent?: boolean;
}) {
  const repeated = [...items, ...items, ...items, ...items];
  return (
    <div className="overflow-hidden py-3 border-y border-border/60 select-none">
      <div className={reverse ? "marquee-track-reverse" : "marquee-track"}>
        {repeated.map((item, i) => (
          <span
            key={i}
            className={`eyebrow mx-8 shrink-0 ${accent ? "text-champagne" : "text-muted-foreground/60"}`}
          >
            {item}
            <span className={`ml-8 ${accent ? "text-empress" : "text-border"}`}>◆</span>
          </span>
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────── Stat block */

function Stat({ num, label, delay = 0 }: { num: string; label: string; delay?: number }) {
  return (
    <Reveal delay={delay}>
      <div className="border-t border-border pt-5 group">
        <p className="display text-5xl text-champagne md:text-6xl">{num}</p>
        <p className="eyebrow mt-3 text-muted-foreground/80">{label}</p>
      </div>
    </Reveal>
  );
}

/* ─────────────────────────────────────── Nav */

export function Nav({
  onExplore,
  exploring,
}: {
  onExplore: () => void;
  exploring: boolean;
}) {
  const [active, setActive] = useState(0);
  const [pct, setPct] = useState(0);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    let raf = 0;
    const tick = () => {
      const p = journey.progress;
      setPct(p);
      setScrolled(p > 0.015);
      const i = CHAPTERS.findIndex((c) => p >= c.start && p < c.end);
      setActive(i < 0 ? CHAPTERS.length - 1 : i);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  const go = (i: number) => {
    const c = CHAPTERS[i];
    if (!c) return;
    const doc = document.documentElement.scrollHeight - innerHeight;
    window.scrollTo({ top: (c.start + 0.01) * doc, behavior: "smooth" });
  };

  return (
    <>
      {/* ── Header bar */}
      <header
        className="pointer-events-none fixed inset-x-0 top-0 z-50 flex items-center justify-between px-5 py-5 md:px-10 transition-all duration-700"
        style={{
          background: scrolled
            ? "linear-gradient(to bottom, oklch(0.055 0.006 58 / 0.85) 0%, transparent 100%)"
            : "transparent",
          backdropFilter: scrolled ? "blur(12px) saturate(140%)" : "none",
        }}
      >
        {/* Wordmark */}
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          data-cursor="explore"
          className="pointer-events-auto group flex items-baseline gap-3"
        >
          <span className="display text-[13px] tracking-[0.36em] text-ivory uppercase transition-colors duration-500 group-hover:text-champagne">
            Dhiraj
          </span>
          <span className="eyebrow-sm hidden text-muted-foreground/60 md:inline">
            U. Kummar
          </span>
        </button>

        {/* Chapter nav */}
        <nav className="pointer-events-auto hidden gap-8 md:flex">
          {CHAPTERS.map((c, i) => (
            <button
              key={c.id}
              onClick={() => go(i)}
              className="relative eyebrow transition-all duration-500 group"
              style={{ color: i === active ? "var(--champagne)" : undefined }}
            >
              <span className={`transition-colors duration-500 ${i === active ? "text-champagne" : "text-muted-foreground/70 hover:text-ivory"}`}>
                {c.label}
              </span>
              {/* Active underline */}
              <span
                className="absolute -bottom-0.5 left-0 h-px bg-champagne transition-all duration-500 ease-out"
                style={{ width: i === active ? "100%" : "0%" }}
              />
            </button>
          ))}
        </nav>

        {/* Explore button */}
        <button
          onClick={onExplore}
          data-cursor={exploring ? "return" : "explore"}
          className="pointer-events-auto relative overflow-hidden eyebrow border border-border/80 px-5 py-2.5 text-ivory transition-all duration-500 hover:border-champagne hover:text-champagne group"
        >
          <span className="relative z-10 flex items-center gap-2">
            <span
              className="inline-block h-1.5 w-1.5 rounded-full bg-current transition-all duration-500"
              style={{ background: exploring ? "var(--empress)" : undefined }}
            />
            {exploring ? "Return" : "Explore"}
          </span>
          <span className="absolute inset-0 bg-champagne/5 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        </button>
      </header>

      {/* ── Vertical progress spine */}
      <div className="pointer-events-none fixed top-1/2 right-5 z-50 hidden h-52 w-px -translate-y-1/2 md:flex flex-col">
        <div className="w-px flex-1 bg-border/60 relative overflow-hidden">
          <div
            className="absolute top-0 left-0 w-px bg-champagne transition-[height] duration-200"
            style={{ height: `${pct * 100}%` }}
          />
        </div>
        <div className="mt-3 flex flex-col items-center gap-1.5">
          <span className="eyebrow-sm block rotate-90 text-[9px] text-champagne/80 whitespace-nowrap">
            {String(Math.round(pct * 100)).padStart(2, "0")}
          </span>
        </div>
      </div>

      {/* ── Left vertical label */}
      <div className="pointer-events-none fixed top-1/2 left-5 z-50 hidden -translate-y-1/2 md:block">
        <div className="rule-line-v h-24 mx-auto mb-3" />
        <p
          className="eyebrow-sm text-[9px] text-muted-foreground/50 whitespace-nowrap"
          style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}
        >
          {CHAPTERS[active]?.label ?? ""}
        </p>
        <div className="rule-line-v h-24 mx-auto mt-3" />
      </div>
    </>
  );
}

/* ─────────────────────────────────────── Story sections */

const BIO = [
  "Dhiraj U. Kummar writes about the people who become myths — and about the ordinary hours that myths are made of.",
  "He works the way an archivist works: slowly, in rooms full of paper, chasing a single sentence through decades of record until it finally tells the truth.",
  "His subject is memory. How a country remembers a face. How a family remembers a voice. How cinema remembers everything and forgives nothing.",
];

const MARQUEE_WORDS = [
  "Author", "Storyteller", "Observer", "Biographer",
  "Archivist", "EMPRESS", "Sridevi", "Cinema",
  "Memory", "Legacy", "Dhiraj U. Kummar",
];

const MARQUEE_WORDS_2 = [
  "214 Interviews", "4 Private Collections",
  "2 Decades of Research", "300 Films",
  "112,000 Words", "1 Definitive Biography",
];

export function Story({
  onOpenBook,
  onOpenDesk,
}: {
  onOpenBook: () => void;
  onOpenDesk: (id: string) => void;
}) {
  return (
    <div className="relative z-30">

      {/* ══════════════════════════════════ I — Arrival */}
      <section className="flex h-[160vh] flex-col items-center justify-center text-center">
        <Reveal>
          <p className="eyebrow breathe tracking-[0.5em] text-champagne/70">
            Author · Storyteller · Observer
          </p>
          <div className="mt-10 flex items-center justify-center gap-4">
            <div className="rule-line w-16" />
            <p className="eyebrow-sm text-[9px] text-muted-foreground/50">Scroll to enter</p>
            <div className="rule-line w-16" />
          </div>
        </Reveal>
      </section>

      {/* ══════════════════════════════════ II — Who is Dhiraj */}
      <section className="flex min-h-[160vh] items-center px-6 md:px-20 py-32">
        <div className="max-w-5xl w-full">
          <Reveal>
            <p className="eyebrow text-champagne mb-8">The Author</p>
            <h1 className="display-tight text-[15vw] leading-[0.8] text-ivory md:text-[9vw]">
              Who is
              <br />
              <em className="italic text-champagne not-italic" style={{ fontStyle: "italic" }}>Dhiraj?</em>
            </h1>
          </Reveal>

          <div className="mt-20 grid gap-0 md:grid-cols-3">
            {BIO.map((t, i) => (
              <Reveal key={i} delay={i * 120}>
                <div
                  className="border-t border-border pt-6 pr-10 pb-10"
                  style={{ marginTop: i === 1 ? "clamp(3rem, 8vw, 7rem)" : i === 2 ? "clamp(6rem, 16vw, 14rem)" : 0 }}
                >
                  <span className="eyebrow text-champagne/60 block mb-5">0{i + 1}</span>
                  <p className="text-[15px] leading-[1.9] text-foreground/75 font-light">{t}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════ Marquee strip */}
      <MarqueeStrip items={MARQUEE_WORDS} />

      {/* ══════════════════════════════════ III — The Author's Mind */}
      <section className="flex min-h-[160vh] items-center justify-end px-6 md:px-20 py-32">
        <div className="max-w-lg text-right">
          <Reveal>
            <p className="eyebrow mb-6">The Author's Mind</p>
            <h2 className="display-tight text-[12vw] leading-[0.84] text-ivory md:text-[6vw]">
              The way
              <br />
              <em style={{ fontStyle: "italic" }} className="text-champagne">he sees</em>
            </h2>
          </Reveal>
          <Reveal delay={200}>
            <p className="mt-8 text-sm leading-[1.9] text-muted-foreground/80 font-light">
              Eight preoccupations, orbiting each other in three-dimensional space.
              Drag to look around. Touch a node to hear the thought behind it.
            </p>
            <div className="rule-line mt-8 ml-auto w-20" />
          </Reveal>
        </div>
      </section>

      {/* ══════════════════════════════════ IV — Archive */}
      <section className="flex min-h-[160vh] items-center px-6 md:px-20 py-32">
        <div className="max-w-3xl w-full">
          <Reveal>
            <p className="eyebrow text-champagne mb-6">The Archive</p>
            <h2 className="display-tight text-[13vw] leading-[0.84] text-ivory md:text-[6.5vw]">
              Rooms full
              <br />
              of paper
            </h2>
          </Reveal>
          <Reveal delay={150}>
            <p className="mt-10 text-[15px] leading-[1.9] text-muted-foreground/75 font-light max-w-md">
              Interviews, transcripts, call sheets, letters, contact strips, marginalia.
              Most of it will never be published. All of it is why the book is true.
            </p>
          </Reveal>

          {/* Stats row */}
          <div className="mt-16 grid grid-cols-2 gap-x-12 gap-y-8 md:grid-cols-4">
            <Stat num="214" label="Interviews" delay={0} />
            <Stat num="4" label="Private collections" delay={80} />
            <Stat num="20+" label="Years of research" delay={160} />
            <Stat num="300" label="Films documented" delay={240} />
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════ Marquee strip 2 */}
      <MarqueeStrip items={MARQUEE_WORDS_2} reverse accent />

      {/* ══════════════════════════════════ V — Empress */}
      <section className="flex min-h-[160vh] flex-col justify-center px-6 md:px-20 py-32">
        <Reveal>
          <p className="eyebrow-sm text-empress/80 tracking-[0.5em] mb-6">Chapter One</p>
          <h2 className="display-tight leading-[0.78] text-ivory"
            style={{ fontSize: "clamp(5rem, 20vw, 18rem)" }}>
            Empress
          </h2>
        </Reveal>

        <Reveal delay={150}>
          <div className="mt-10 flex flex-col md:flex-row md:items-end gap-8 md:gap-16">
            <div className="max-w-sm">
              <p className="text-[15px] leading-[1.9] text-muted-foreground/75 font-light">
                The definitive biography of Sridevi.
                Drag the volume to turn it. Open it to read from the manuscript.
              </p>
            </div>
            <button
              onClick={onOpenBook}
              data-cursor="open"
              className="group relative overflow-hidden border border-champagne/50 px-8 py-4 eyebrow text-champagne transition-all duration-700 hover:text-primary-foreground shrink-0"
            >
              <span className="relative z-10 flex items-center gap-3">
                Open the book
                <span className="text-xs opacity-60 group-hover:opacity-100 transition-opacity duration-300">→</span>
              </span>
              <span className="absolute inset-0 bg-champagne translate-y-full transition-transform duration-500 group-hover:translate-y-0" />
            </button>
          </div>
          <div className="rule-line mt-14 w-40" />
        </Reveal>
      </section>

      {/* ══════════════════════════════════ VI — Desk */}
      <section className="flex min-h-[160vh] items-center px-6 md:px-20 py-32">
        <div className="w-full">
          <Reveal>
            <p className="eyebrow text-muted-foreground/60 mb-4">From the Desk</p>
            <h2 className="display-tight text-[11vw] leading-[0.88] text-ivory md:text-[5vw]">
              Where it
              <br />
              actually happens
            </h2>
          </Reveal>

          <Reveal delay={120}>
            <div className="mt-14 grid grid-cols-1 gap-px bg-border/40 md:grid-cols-4">
              {[
                { id: "notebook",    t: "The Notebook",    s: "First lines, written badly on purpose",  n: "01" },
                { id: "manuscript",  t: "The Manuscript",  s: "Draft eleven, still bleeding red",        n: "02" },
                { id: "photograph",  t: "The Photograph",  s: "A frame nobody printed",                  n: "03" },
                { id: "letter",      t: "The Letter",      s: "Sent in 1989, answered in 2024",          n: "04" },
              ].map((o) => (
                <button
                  key={o.id}
                  onClick={() => onOpenDesk(o.id)}
                  data-cursor="read"
                  className="group relative overflow-hidden bg-background/40 p-7 text-left backdrop-blur-sm transition-all duration-700 hover:bg-charcoal/70"
                >
                  {/* Number */}
                  <span className="eyebrow-sm text-[9px] text-muted-foreground/40 block mb-6">{o.n}</span>
                  {/* Title */}
                  <p className="display text-xl text-ivory leading-tight group-hover:text-champagne transition-colors duration-500">{o.t}</p>
                  {/* Subtitle */}
                  <p className="mt-3 text-xs leading-relaxed text-muted-foreground/60 font-light">{o.s}</p>
                  {/* Read prompt */}
                  <div className="mt-8 flex items-center gap-2 overflow-hidden">
                    <span
                      className="eyebrow text-champagne text-[9px] -translate-x-2 opacity-0 transition-all duration-500 group-hover:translate-x-0 group-hover:opacity-100"
                    >
                      Read
                    </span>
                    <span
                      className="h-px bg-champagne/60 w-0 transition-all duration-700 group-hover:w-8"
                    />
                  </div>
                  {/* Hover shimmer */}
                  <span className="absolute inset-0 pointer-events-none border border-champagne/0 transition-colors duration-500 group-hover:border-champagne/20" />
                </button>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ══════════════════════════════════ VII — What comes next */}
      <section className="flex min-h-[160vh] flex-col items-center justify-center px-6 text-center py-32">
        <Reveal>
          <p className="eyebrow text-muted-foreground/50 mb-10">Future Works</p>
          <h2 className="display-tight leading-[0.86] text-ivory"
            style={{ fontSize: "clamp(3rem, 13vw, 10rem)" }}>
            What comes
            <br />
            <em style={{ fontStyle: "italic" }} className="text-champagne">next?</em>
          </h2>
        </Reveal>
        <Reveal delay={180}>
          <p className="mt-10 text-sm tracking-[0.26em] text-champagne/80 uppercase">
            Empress was only the beginning
          </p>
          <p className="mx-auto mt-6 max-w-sm text-sm leading-[1.9] text-muted-foreground/65 font-light">
            Three objects are already forming in the dark.
            They have no titles yet. When they do, they will appear here.
          </p>
          <div className="rule-line mx-auto mt-14 w-28" />
        </Reveal>
      </section>

      {/* ══════════════════════════════════ VIII — Final */}
      <section className="flex min-h-[160vh] flex-col items-center justify-center px-6 text-center py-32">
        <Reveal>
          <div className="rule-line mx-auto mb-16 w-24" />
          <p className="eyebrow text-muted-foreground/50 mb-8">Author · Storyteller · Observer</p>
          <h2 className="display text-[8vw] leading-[0.9] text-ivory md:text-[3.8vw]">
            Dhiraj U. Kummar
          </h2>
        </Reveal>

        <Reveal delay={200}>
          <div className="mt-16 flex flex-col items-center gap-6">
            <a
              href="mailto:hello@dhirajukummar.com"
              data-cursor="write"
              className="eyebrow border-b border-champagne/40 pb-1 text-champagne transition-colors duration-500 hover:border-champagne hover:text-ivory"
            >
              hello@dhirajukummar.com
            </a>
            <div className="rule-line mx-auto w-24 mt-6" />
            <p className="eyebrow-sm text-[9px] text-muted-foreground/30 mt-2">
              © {new Date().getFullYear()} Dhiraj U. Kummar
            </p>
          </div>
        </Reveal>
      </section>

    </div>
  );
}
