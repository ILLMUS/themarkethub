import { Link } from "react-router-dom";
import { useEffect, useRef, useState, useCallback } from "react";
import { Tag } from "lucide-react";

interface Category {
  id: string;
  name: string;
  icon: string | null;
  description: string | null;
}

interface PopularChipsProps {
  categories: Category[] | undefined;
  chipIconMap: Record<string, React.ElementType>;
}

export function PopularChips({ categories, chipIconMap }: PopularChipsProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const [glowIndex, setGlowIndex] = useState(-1);
  const [isAnimating, setIsAnimating] = useState(false);
  const glowIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const chips = categories?.slice(0, 9) ?? [];

  const startAnimations = useCallback(() => {
    if (isAnimating || !chips.length) return;
    setIsAnimating(true);

    // Gentle nudge right (just enough to reveal ~1 chip) then back
    const el = scrollRef.current;
    if (el) {
      const scrollAmount = Math.min(el.scrollWidth - el.clientWidth, 80);
      el.scrollTo({ left: scrollAmount, behavior: "smooth" });
      setTimeout(() => el.scrollTo({ left: 0, behavior: "smooth" }), 500);
    }

    // Start glow loop after scroll finishes
    setTimeout(() => {
      let idx = 0;
      setGlowIndex(0);
      glowIntervalRef.current = setInterval(() => {
        idx++;
        if (idx >= chips.length) idx = 0;
        setGlowIndex(idx);
      }, 1000);
    }, 1000);
  }, [isAnimating, chips.length]);

  const stopAnimations = useCallback(() => {
    setIsAnimating(false);
    setGlowIndex(-1);
    if (glowIntervalRef.current) {
      clearInterval(glowIntervalRef.current);
      glowIntervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          startAnimations();
        } else {
          stopAnimations();
        }
      },
      { threshold: 0.5 }
    );

    observer.observe(section);
    return () => {
      observer.disconnect();
      stopAnimations();
    };
  }, [startAnimations, stopAnimations]);

  return (
    <section ref={sectionRef} className="border-b bg-card">
      <div className="container py-5">
        <div
          ref={scrollRef}
          className="flex items-center gap-3 overflow-x-auto scrollbar-hide"
        >
          <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">
            Popular:
          </span>
          {chips.map((cat, i) => {
            const Icon = cat.icon ? chipIconMap[cat.icon] || Tag : null;
            const isGlowing = glowIndex === i;

            return (
              <Link
                key={cat.id}
                to={`/marketplace?category=${cat.id}`}
                className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-4 py-1.5 text-sm font-medium transition-all duration-300 ${
                  isGlowing
                    ? "bg-primary text-primary-foreground border-primary shadow-[0_0_16px_4px_hsl(var(--primary)/0.45)]"
                    : "bg-secondary/50 text-secondary-foreground hover:bg-primary hover:text-primary-foreground"
                }`}
              >
                {Icon && <Icon className="h-3.5 w-3.5" />}
                {cat.name}
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
