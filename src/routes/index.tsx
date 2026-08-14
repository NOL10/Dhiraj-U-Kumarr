import { createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense, useEffect, useRef, useState, useCallback } from "react";
import { journey } from "@/lib/journey";
import { Cursor } from "@/components/Cursor";
import { Nav, Story } from "@/components/Overlay";
import { BookPanel, DeskPanel, NodePanel } from "@/components/Panels";
import { useAmbientSound } from "@/hooks/useAmbientSound";

const World = lazy(() => import("@/components/world/World"));

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dhiraj U. Kummar — Author, Storyteller, Observer" },
      {
        name: "description",
        content:
          "Enter the world of author Dhiraj U. Kummar: a cinematic 3D archive of his ideas, his writing desk, and EMPRESS — the definitive biography of Sridevi.",
      },
      { property: "og:title", content: "Dhiraj U. Kummar — Author, Storyteller, Observer" },
      {
        property: "og:description",
        content:
          "A digital installation: the archive, the desk, and EMPRESS — the definitive biography of Sridevi.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  const [mounted, setMounted] = useState(false);
  const [node, setNode] = useState<string | null>(null);
  const [desk, setDesk] = useState<string | null>(null);
  const [book, setBook] = useState(false);
  const [exploring, setExploring] = useState(false);
  const [sound, setSound] = useState(false);
  const exploreRef = useRef(false);
  
  useAmbientSound({ enabled: sound, volume: 0.6 });

  const toggleExplore = useCallback(() => {
    exploreRef.current = !exploreRef.current;
    setExploring(exploreRef.current);
  }, []);

  const toggleSound = useCallback(() => {
    setSound((prev) => !prev);
  }, []);

  useEffect(() => {
    setMounted(true);
    journey.reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let lenis: { destroy: () => void; raf: (t: number) => void } | null = null;
    let raf = 0;
    let cancelled = false;

    const readScroll = () => {
      const max = document.documentElement.scrollHeight - innerHeight;
      journey.progress = max > 0 ? Math.min(1, Math.max(0, scrollY / max)) : 0;
    };

    if (!journey.reduced) {
      import("lenis").then(({ default: Lenis }) => {
        if (cancelled) return;
        const l = new Lenis({ lerp: 0.075, wheelMultiplier: 0.95 });
        lenis = l as unknown as { destroy: () => void; raf: (t: number) => void };
        l.on("scroll", (e: { progress: number; velocity: number }) => {
          journey.progress = e.progress;
          journey.velocity = e.velocity;
        });
        const loop = (t: number) => {
          l.raf(t);
          raf = requestAnimationFrame(loop);
        };
        raf = requestAnimationFrame(loop);
      });
    } else {
      window.addEventListener("scroll", readScroll, { passive: true });
      readScroll();
    }

    const move = (e: PointerEvent) => {
      journey.mouseX = (e.clientX / innerWidth) * 2 - 1;
      journey.mouseY = (e.clientY / innerHeight) * 2 - 1;
    };
    window.addEventListener("pointermove", move);

    // Touch gesture support
    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        journey.isTouching = true;
        journey.touchStartX = e.touches[0]!.clientX;
        journey.touchStartY = e.touches[0]!.clientY;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!journey.isTouching || e.touches.length === 0) return;
      const touch = e.touches[0]!;
      journey.mouseX = (touch.clientX / innerWidth) * 2 - 1;
      journey.mouseY = (touch.clientY / innerHeight) * 2 - 1;
    };

    const handleTouchEnd = () => {
      journey.isTouching = false;
    };

    // Pinch to zoom gesture
    let initialPinchDistance = 0;
    const handlePinchStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        initialPinchDistance = Math.hypot(
          e.touches[0]!.clientX - e.touches[1]!.clientX,
          e.touches[0]!.clientY - e.touches[1]!.clientY
        );
      }
    };

    const handlePinchMove = (e: TouchEvent) => {
      if (e.touches.length === 2 && initialPinchDistance > 0) {
        const currentDistance = Math.hypot(
          e.touches[0]!.clientX - e.touches[1]!.clientX,
          e.touches[0]!.clientY - e.touches[1]!.clientY
        );
        const delta = currentDistance - initialPinchDistance;
        
        // Use pinch to trigger explore mode
        if (delta > 50 && !exploreRef.current) {
          toggleExplore();
        } else if (delta < -50 && exploreRef.current) {
          toggleExplore();
        }
      }
    };

    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: true });
    window.addEventListener("touchend", handleTouchEnd);
    window.addEventListener("touchstart", handlePinchStart, { passive: true });
    window.addEventListener("touchmove", handlePinchMove, { passive: true });

    let exRaf = 0;
    const exLoop = () => {
      const target = exploreRef.current ? 1 : 0;
      journey.explode += (target - journey.explode) * 0.05;
      exRaf = requestAnimationFrame(exLoop);
    };
    exRaf = requestAnimationFrame(exLoop);

    // Keyboard navigation
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowDown':
        case 'PageDown':
          e.preventDefault();
          window.scrollBy({ top: window.innerHeight * 0.8, behavior: 'smooth' });
          break;
        case 'ArrowUp':
        case 'PageUp':
          e.preventDefault();
          window.scrollBy({ top: -window.innerHeight * 0.8, behavior: 'smooth' });
          break;
        case 'Home':
          e.preventDefault();
          window.scrollTo({ top: 0, behavior: 'smooth' });
          break;
        case 'End':
          e.preventDefault();
          window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'smooth' });
          break;
        case 'Escape':
          if (node) setNode(null);
          if (desk) setDesk(null);
          if (book) setBook(false);
          if (exploring) toggleExplore();
          break;
        case 'e':
        case 'E':
          if (!e.ctrlKey && !e.metaKey) {
            toggleExplore();
          }
          break;
        case 's':
        case 'S':
          if (!e.ctrlKey && !e.metaKey) {
            setSound((s) => !s);
          }
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      cancelAnimationFrame(exRaf);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("scroll", readScroll);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
      window.removeEventListener("touchstart", handlePinchStart);
      window.removeEventListener("touchmove", handlePinchMove);
      lenis?.destroy();
    };
  }, [node, desk, book, exploring, toggleExplore]);

  return (
    <main className="relative bg-background">
      <div className="fixed inset-0 z-10">
        {mounted && (
          <Suspense fallback={null}>
            <World onNode={setNode} onBook={() => setBook(true)} />
          </Suspense>
        )}
      </div>

      <Nav onExplore={toggleExplore} exploring={exploring} />

      <Story onOpenBook={() => setBook(true)} onOpenDesk={setDesk} />

      <button
        onClick={toggleSound}
        data-cursor={sound ? "mute" : "listen"}
        className="pointer-events-auto fixed bottom-6 left-5 z-50 eyebrow text-[9px] text-muted-foreground transition-colors hover:text-champagne md:left-10"
      >
        Sound {sound ? "On" : "Off"}
      </button>
      <p className="pointer-events-none fixed right-5 bottom-6 z-50 hidden eyebrow text-[9px] md:block">
        Empress · Chapter One
      </p>

      <div className="vignette" />
      <div className="film-grain" />

      {node && <NodePanel id={node} onClose={() => setNode(null)} />}
      {desk && <DeskPanel id={desk} onClose={() => setDesk(null)} />}
      {book && <BookPanel onClose={() => setBook(false)} />}
    </main>
  );
}
