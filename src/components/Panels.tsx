import { useEffect, useState } from "react";

const NODE_ESSAYS: Record<string, { title: string; body: string }> = {
  CINEMA: {
    title: "Cinema",
    body: "A film is a country arguing with itself for two and a half hours. I watch the arguments, then I go looking for the people who lost them.",
  },
  CULTURE: {
    title: "Culture",
    body: "Culture is not the festival. It is the week after the festival, when everyone is tired and honest.",
  },
  PEOPLE: {
    title: "People",
    body: "Nobody is a subject. Everybody is a witness. The interview begins the moment the recorder is switched off.",
  },
  HISTORY: {
    title: "History",
    body: "The record is never missing. It is misfiled, in a language nobody in the room reads anymore.",
  },
  MEMORY: {
    title: "Memory",
    body: "Memory is the only unreliable narrator we are legally required to trust. So I check it against paper.",
  },
  IDENTITY: {
    title: "Identity",
    body: "A name changes shape depending on who is calling it. I write down every version.",
  },
  ART: {
    title: "Art",
    body: "Restraint is the whole discipline. Everything I cut is still in the book, holding up the floor.",
  },
  STORYTELLING: {
    title: "Storytelling",
    body: "Structure is mercy. Give the reader a door, a corridor, and a reason to keep walking.",
  },
};

const DESK_ITEMS: Record<string, { title: string; body: string }> = {
  notebook: {
    title: "The Notebook",
    body: "Leather, half-ruined, carried through four cities. The first line of EMPRESS is on page 60, crossed out twice: 'She was four years old and already being watched.'",
  },
  manuscript: {
    title: "The Manuscript",
    body: "Draft eleven. Two hundred thousand words became one hundred and twelve thousand. The chapter on 1983 was rewritten nine times before it stopped sounding like admiration and started sounding like a life.",
  },
  photograph: {
    title: "The Photograph",
    body: "A contact strip from a studio floor, never printed. Between two takes she is not performing at all — and that half-second is the entire argument of the book.",
  },
  letter: {
    title: "The Letter",
    body: "A note sent in 1989 by a unit production assistant to his mother, describing a night shoot. He kept the carbon copy. Thirty-five years later he read it to me over the phone and wept.",
  },
};

const BOOK_PAGES = [
  {
    label: "Excerpt",
    body: "She arrives at the studio before the light does. The floor is still wet from the night wash. Somebody hands her tea she will not drink. In four hours a nation will decide, again, that it knows her.",
  },
  {
    label: "Chapter I",
    body: "A Child of the Frame — 1963–1975. Meenampatti to Madras, the first contracts, the first exhaustion, the arithmetic of a family that had found its earner.",
  },
  {
    label: "Research",
    body: "Built from 214 interviews, four private collections, two decades of trade press, and the call sheets of thirty-one productions — many of which were assumed to have been destroyed.",
  },
  {
    label: "A Note",
    body: "This book refuses the word 'icon' wherever a truer word exists. She was a worker of extraordinary precision. That is the higher compliment.",
  },
  {
    label: "The Method",
    body: "I did not write about her from the outside. I wrote from the inside out — from the call sheets, the contracts, the unreturned letters. The method was the same as hers: show up, do the work, disappear.",
  },
  {
    label: "Legacy",
    body: "What remains is not the image but the labor. The three hundred films. The eighteen-hour days. The refusal to be reduced to a single frame, however iconic that frame may be.",
  },
];

function Shell({
  onClose,
  eyebrow,
  title,
  children,
}: {
  onClose: () => void;
  eyebrow: string;
  title: string;
  children: React.ReactNode;
}) {
  useEffect(() => {
    const k = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[65] flex items-center justify-center px-6">
      <button
        aria-label="Close"
        onClick={onClose}
        data-cursor="close"
        className="absolute inset-0 bg-background/85 backdrop-blur-xl"
      />
      <div className="animate-scale-in relative w-full max-w-2xl border border-border bg-card/80 p-8 md:p-14">
        <p className="eyebrow text-champagne">{eyebrow}</p>
        <h3 className="display mt-4 text-4xl text-ivory md:text-6xl">{title}</h3>
        <div className="rule-line mt-8" />
        <div className="mt-8">{children}</div>
        <button
          onClick={onClose}
          className="eyebrow mt-10 border border-border px-5 py-2 text-ivory transition-colors hover:border-champagne hover:text-champagne"
        >
          Close
        </button>
      </div>
    </div>
  );
}

export function NodePanel({ id, onClose }: { id: string; onClose: () => void }) {
  const e = NODE_ESSAYS[id];
  if (!e) return null;
  return (
    <Shell onClose={onClose} eyebrow="The way he sees" title={e.title}>
      <p className="display text-2xl leading-snug text-foreground/85 italic">{e.body}</p>
    </Shell>
  );
}

export function DeskPanel({ id, onClose }: { id: string; onClose: () => void }) {
  const e = DESK_ITEMS[id];
  if (!e) return null;
  return (
    <Shell onClose={onClose} eyebrow="From the desk" title={e.title}>
      <p className="text-[15px] leading-relaxed text-foreground/80">{e.body}</p>
    </Shell>
  );
}

export function BookPanel({ onClose }: { onClose: () => void }) {
  const [currentPage, setCurrentPage] = useState(0);
  const [direction, setDirection] = useState(0);

  const nextPage = () => {
    if (currentPage < BOOK_PAGES.length - 1) {
      setDirection(1);
      setCurrentPage((prev) => prev + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 0) {
      setDirection(-1);
      setCurrentPage((prev) => prev - 1);
    }
  };

  const page = BOOK_PAGES[currentPage];

  if (!page) return null;

  return (
    <Shell onClose={onClose} eyebrow="Empress · Chapter One" title="From the pages">
      <div className="relative">
        <div
          className={`transition-all duration-500 ${
            direction === 1 ? 'translate-x-4 opacity-0' : direction === -1 ? '-translate-x-4 opacity-0' : 'translate-x-0 opacity-100'
          }`}
          key={currentPage}
        >
          <div className="border-t border-border pt-6">
            <span className="eyebrow text-champagne">{page.label}</span>
            <p className="mt-4 text-[17px] leading-relaxed text-foreground/90 font-light">{page.body}</p>
          </div>
        </div>

        <div className="mt-12 flex items-center justify-between border-t border-border pt-6">
          <button
            onClick={prevPage}
            disabled={currentPage === 0}
            className="eyebrow px-4 py-2 text-ivory transition-colors hover:text-champagne disabled:opacity-30 disabled:hover:text-ivory"
          >
            ← Previous
          </button>
          <div className="flex gap-2">
            {BOOK_PAGES.map((_, i) => (
              <button
                key={i}
                onClick={() => {
                  setDirection(i > currentPage ? 1 : -1);
                  setCurrentPage(i);
                }}
                className={`h-1 w-8 transition-all ${
                  i === currentPage ? 'bg-champagne' : 'bg-border hover:bg-muted-foreground'
                }`}
                aria-label={`Go to page ${i + 1}`}
              />
            ))}
          </div>
          <button
            onClick={nextPage}
            disabled={currentPage === BOOK_PAGES.length - 1}
            className="eyebrow px-4 py-2 text-ivory transition-colors hover:text-champagne disabled:opacity-30 disabled:hover:text-ivory"
          >
            Next →
          </button>
        </div>
      </div>
    </Shell>
  );
}
