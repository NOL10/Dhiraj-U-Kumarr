import { useEffect, useRef, useState } from "react";
import { CHAPTERS, journey } from "@/lib/journey";

/* ---------------------------------------------------------- reveal block */

function Reveal({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => e && setSeen(e.isIntersecting || e.intersectionRatio > 0.1),
      { threshold: [0, 0.15] },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div
      ref={ref}
      className={`transition-all duration-[1400ms] ease-out ${
        seen ? "translate-y-0 opacity-100 blur-0" : "translate-y-8 opacity-0 blur-[6px]"
      } ${className}`}
    >
      {children}
    </div>
  );
}

/* ------------------------------------------------------------------- nav */

export function Nav({
  onExplore,
  exploring,
}: {
  onExplore: () => void;
  exploring: boolean;
}) {
  const [active, setActive] = useState(0);
  const [pct, setPct] = useState(0);

  useEffect(() => {
    let raf = 0;
    const tick = () => {
      const p = journey.progress;
      setPct(p);
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
      <header className="pointer-events-none fixed inset-x-0 top-0 z-50 flex items-center justify-between px-5 py-5 md:px-10">
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          data-cursor="explore"
          className="pointer-events-auto display text-[15px] tracking-[0.32em] text-ivory uppercase"
        >
          Dhiraj
        </button>
        <nav className="pointer-events-auto hidden gap-7 md:flex">
          {CHAPTERS.map((c, i) => (
            <button
              key={c.id}
              onClick={() => go(i)}
              className={`eyebrow transition-colors duration-500 ${
                i === active ? "text-champagne" : "hover:text-ivory"
              }`}
            >
              {c.label}
            </button>
          ))}
        </nav>
        <button
          onClick={onExplore}
          data-cursor={exploring ? "return" : "explore"}
          className="pointer-events-auto eyebrow border border-border px-4 py-2 text-ivory transition-colors duration-500 hover:border-champagne hover:text-champagne"
        >
          {exploring ? "Return" : "Explore"}
        </button>
      </header>

      {/* vertical progress spine */}
      <div className="pointer-events-none fixed top-1/2 right-5 z-50 hidden h-48 w-px -translate-y-1/2 bg-border md:block">
        <div
          className="w-px bg-champagne transition-[height] duration-200"
          style={{ height: `${pct * 100}%` }}
        />
        <span className="eyebrow absolute -right-1 -bottom-8 rotate-90 text-[9px] text-champagne">
          {String(Math.round(pct * 100)).padStart(2, "0")}
        </span>
      </div>
    </>
  );
}

/* -------------------------------------------------------------- sections */

const BIO = [
  "Dhiraj U. Kummar writes about the people who become myths — and about the ordinary hours that myths are made of.",
  "He works the way an archivist works: slowly, in rooms full of paper, chasing a single sentence through decades of record until it finally tells the truth.",
  "His subject is memory. How a country remembers a face. How a family remembers a voice. How cinema remembers everything and forgives nothing.",
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
      {/* I — arrival */}
      <section className="flex h-[150vh] flex-col items-center justify-center text-center">
        <Reveal>
          <p className="eyebrow breathe">Author · Storyteller · Observer</p>
          <p className="mt-6 max-w-xs text-[11px] tracking-[0.28em] text-muted-foreground uppercase">
            Scroll to enter
          </p>
        </Reveal>
      </section>

      {/* II — who is dhiraj */}
      <section className="flex h-[150vh] items-center px-6 md:px-20">
        <div className="max-w-4xl">
          <Reveal>
            <h1 className="display text-[13vw] leading-[0.82] text-ivory md:text-[8vw]">
              Who is
              <br />
              <span className="italic text-champagne">Dhiraj?</span>
            </h1>
          </Reveal>
          <div className="mt-16 grid gap-14 md:grid-cols-3">
            {BIO.map((t, i) => (
              <Reveal key={i} className={i === 1 ? "md:mt-24" : i === 2 ? "md:mt-48" : ""}>
                <div className="border-t border-border pt-5">
                  <span className="eyebrow text-champagne">0{i + 1}</span>
                  <p className="mt-4 text-[15px] leading-relaxed text-foreground/80">{t}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* III — the way he sees */}
      <section className="flex h-[150vh] items-center justify-end px-6 md:px-20">
        <div className="max-w-md text-right">
          <Reveal>
            <p className="eyebrow">The Author's Mind</p>
            <h2 className="display mt-5 text-[10vw] leading-[0.86] text-ivory md:text-[5vw]">
              The way
              <br />
              he sees
            </h2>
            <p className="mt-6 text-sm leading-relaxed text-muted-foreground">
              Eight preoccupations, orbiting each other. Drag to look around. Touch a node
              to hear the thought behind it.
            </p>
          </Reveal>
        </div>
      </section>

      {/* IV — archive */}
      <section className="flex h-[150vh] items-center px-6 md:px-20">
        <Reveal className="max-w-lg">
          <p className="eyebrow">The Archive</p>
          <h2 className="display mt-5 text-[11vw] leading-[0.86] text-ivory md:text-[5.5vw]">
            Rooms full
            <br />
            of paper
          </h2>
          <p className="mt-6 text-sm leading-relaxed text-muted-foreground">
            Interviews, transcripts, call sheets, letters, contact strips, marginalia.
            Most of it will never be published. All of it is why the book is true.
          </p>
          <p className="mt-10 eyebrow text-champagne">
            This archive grows as the work grows
          </p>
        </Reveal>
      </section>

      {/* V — empress */}
      <section className="flex h-[150vh] flex-col justify-center px-6 md:px-20">
        <Reveal>
          <p className="eyebrow text-empress">Chapter One</p>
          <h2 className="display mt-6 text-[18vw] leading-[0.8] text-ivory md:text-[11vw]">
            Empress
          </h2>
          <p className="mt-6 max-w-sm text-sm leading-relaxed text-muted-foreground">
            The definitive biography of Sridevi. Drag the volume to turn it. Open it to
            read from the manuscript.
          </p>
          <button
            onClick={onOpenBook}
            data-cursor="open"
            className="mt-10 eyebrow border border-champagne/60 px-6 py-3 text-champagne transition-colors duration-500 hover:bg-champagne hover:text-primary-foreground"
          >
            Open the book
          </button>
        </Reveal>
      </section>

      {/* VI — desk */}
      <section className="flex h-[150vh] items-center px-6 md:px-20">
        <div className="w-full">
          <Reveal>
            <p className="eyebrow">From the Desk</p>
            <h2 className="display mt-4 text-[10vw] leading-[0.9] text-ivory md:text-[4.5vw]">
              Where it actually happens
            </h2>
          </Reveal>
          <div className="mt-12 grid gap-px border border-border md:grid-cols-4">
            {[
              { id: "notebook", t: "The Notebook", s: "First lines, written badly on purpose" },
              { id: "manuscript", t: "The Manuscript", s: "Draft eleven, still bleeding red" },
              { id: "photograph", t: "The Photograph", s: "A frame nobody printed" },
              { id: "letter", t: "The Letter", s: "Sent in 1989, answered in 2024" },
            ].map((o) => (
              <button
                key={o.id}
                onClick={() => onOpenDesk(o.id)}
                data-cursor="read"
                className="group border border-border bg-background/40 p-6 text-left backdrop-blur-sm transition-colors duration-500 hover:bg-charcoal/60"
              >
                <p className="display text-xl text-ivory">{o.t}</p>
                <p className="mt-3 text-xs leading-relaxed text-muted-foreground">{o.s}</p>
                <span className="eyebrow mt-6 block text-champagne opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                  Read →
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* VII — what comes next */}
      <section className="flex h-[150vh] flex-col items-center justify-center px-6 text-center">
        <Reveal>
          <h2 className="display text-[12vw] leading-[0.9] text-ivory md:text-[6vw]">
            What comes next?
          </h2>
          <p className="mt-8 text-sm tracking-[0.24em] text-champagne uppercase">
            Empress was only the beginning
          </p>
          <p className="mx-auto mt-6 max-w-sm text-sm leading-relaxed text-muted-foreground">
            Three objects are already forming in the dark. They have no titles yet. When
            they do, they will appear here.
          </p>
        </Reveal>
      </section>

      {/* VIII — final */}
      <section className="flex h-[150vh] flex-col items-center justify-center px-6 text-center">
        <Reveal>
          <h2 className="display text-[9vw] leading-[0.9] text-ivory md:text-[4vw]">
            Dhiraj U. Kummar
          </h2>
          <p className="eyebrow mt-6">Author · Storyteller · Observer</p>
          <div className="rule-line mx-auto mt-12 w-40" />
          <p className="display mt-12 text-2xl italic text-champagne">
            The story continues.
          </p>
          <a
            href="mailto:hello@dhirajukummar.com"
            data-cursor="write"
            className="mt-14 inline-block eyebrow border border-border px-6 py-3 text-ivory transition-colors duration-500 hover:border-champagne hover:text-champagne"
          >
            Contact
          </a>
        </Reveal>
      </section>
      <div className="h-[60vh]" />
    </div>
  );
}
