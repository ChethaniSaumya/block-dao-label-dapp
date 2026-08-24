import { useMemo } from "react";

/**
 * Decorative gold dust drifting behind the hero — the certificate art has a
 * field of small lights around the globe, and this carries that texture into
 * the space the artwork fades out to.
 *
 * Deterministic: positions come from a seeded generator so React re-renders
 * never reshuffle the field. Purely presentational, so it is hidden from
 * assistive technology and ignores pointer events. Motion is CSS-only
 * (transform + opacity, both GPU-composited) and stops entirely under
 * `prefers-reduced-motion`.
 */

/** Small deterministic PRNG — same field on every render and every visit. */
function seeded(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

export function Particles({
  count = 70,
  className = "",
  fixed = false,
  seed = 20260815,
}: {
  count?: number;
  className?: string;
  /**
   * Pin the field to the viewport instead of the parent. Used for the
   * page-wide layer so the dust carries through every section below the hero
   * rather than being trapped inside one box.
   */
  fixed?: boolean;
  /** Change to get a different arrangement from the same generator. */
  seed?: number;
}) {
  const dots = useMemo(() => {
    const rand = seeded(seed);
    return Array.from({ length: count }, () => {
      // Mostly fine dust, with roughly one in six a brighter mote so the field
      // has depth. Sizes are deliberately well above 1px — below that a dot
      // with a soft radial edge renders as an invisible sub-pixel smudge.
      const bright = rand() < 0.18;
      const size = bright ? 4 + rand() * 3 : 2 + rand() * 1.8;
      return {
        left: rand() * 100,
        top: rand() * 100,
        size,
        opacity: (bright ? 0.6 : 0.32) + rand() * 0.35,
        glow: bright ? 10 : 5,
        duration: 14 + rand() * 18,
        delay: -rand() * 30,
        drift: (rand() - 0.5) * 26,
      };
    });
  }, [count, seed]);

  return (
    <div
      aria-hidden="true"
      className={`${fixed ? "fixed z-0" : "absolute"} inset-0 overflow-hidden pointer-events-none ${className}`}
    >
      {dots.map((d, i) => (
        <span
          key={i}
          className="particle"
          style={{
            left: `${d.left}%`,
            top: `${d.top}%`,
            width: `${d.size}px`,
            height: `${d.size}px`,
            opacity: d.opacity,
            boxShadow: `0 0 ${d.glow}px ${d.glow / 4}px rgba(200,162,74,0.55)`,
            animationDuration: `${d.duration}s`,
            animationDelay: `${d.delay}s`,
            ["--drift" as string]: `${d.drift}px`,
          }}
        />
      ))}
    </div>
  );
}
