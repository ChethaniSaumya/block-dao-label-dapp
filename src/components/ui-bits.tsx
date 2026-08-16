import { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Shared surface primitives, styled after the Dealer Rights Certificate:
 * a deep navy ground, gold foil accents, hairline rules instead of shadows,
 * and engraved corner ornament on the surfaces that carry the most weight.
 */

export function Section({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn("mx-auto max-w-7xl px-4 sm:px-6 lg:px-8", className)}
    >
      {children}
    </section>
  );
}

export function Card({
  children,
  className,
  /** Draws art-deco corner ticks — reserve it for feature surfaces. */
  ornament = false,
}: {
  children: ReactNode;
  className?: string;
  ornament?: boolean;
}) {
  // `.plate` and Tailwind's `bg-*` utilities live in the same cascade layer, so
  // whichever is declared last wins regardless of the class order written here.
  // Skip the plate entirely when the caller supplies its own background, or the
  // card ends up with the plate's surface and the caller's foreground colour.
  const hasOwnBackground = /(^|\s)bg-/.test(className ?? "");

  return (
    <div
      // No `overflow-hidden` here: several cards deliberately place badges and
      // ornaments outside their bounds (e.g. the step numbers on the home
      // page), and clipping decapitates them. The gilded top edge is inset
      // instead of clipped, so it never overshoots the rounded corners.
      className={cn(
        "relative rounded-lg border border-border p-6 shadow-elegant",
        !hasOwnBackground && "plate gilt-edge",
        ornament && "ornament",
        className,
      )}
    >
      {children}
    </div>
  );
}

/** Hairline divider that fades at both ends, as on the certificate frame. */
export function Rule({ className }: { className?: string }) {
  return <hr className={cn("rule-gold my-6", className)} />;
}

export function Badge({
  children,
  variant = "default",
}: {
  children: ReactNode;
  variant?: "default" | "success" | "warning" | "muted" | "destructive";
}) {
  const styles = {
    default:
      "bg-[rgba(200,162,74,0.12)] text-gold-lift border border-[rgba(200,162,74,0.32)]",
    success:
      "bg-[rgba(79,169,124,0.12)] text-[#7FCFA4] border border-[rgba(79,169,124,0.32)]",
    warning:
      "bg-[rgba(217,166,60,0.12)] text-[#E9CE86] border border-[rgba(217,166,60,0.34)]",
    destructive:
      "bg-[rgba(196,87,74,0.12)] text-[#E59A8F] border border-[rgba(196,87,74,0.34)]",
    muted:
      "bg-[rgba(148,161,184,0.10)] text-muted-foreground border border-[rgba(148,161,184,0.22)]",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-[0.68rem] font-medium tracking-[0.08em] uppercase",
        styles[variant],
      )}
    >
      {children}
    </span>
  );
}

/** Primary action — gold foil plate with dark engraved lettering. */
export function GoldButton({
  children,
  onClick,
  className,
  disabled,
  type = "button",
}: {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
  type?: "button" | "submit";
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "inline-flex items-center justify-center gap-2 px-6 py-3 rounded-md",
        "bg-gradient-gold text-gold-foreground font-semibold tracking-[0.02em]",
        "shadow-gold hover:brightness-110 active:scale-[0.99] transition",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold",
        "disabled:opacity-40 disabled:pointer-events-none",
        className,
      )}
    >
      {children}
    </button>
  );
}

/** Secondary action — gold hairline on the navy ground. */
export function OutlineButton({
  children,
  onClick,
  className,
  disabled,
}: {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "inline-flex items-center justify-center gap-2 px-6 py-3 rounded-md",
        "border border-[rgba(200,162,74,0.34)] bg-transparent text-gold-lift font-medium",
        "hover:bg-[rgba(200,162,74,0.10)] hover:border-gold transition",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold",
        "disabled:opacity-40 disabled:pointer-events-none",
        className,
      )}
    >
      {children}
    </button>
  );
}

/**
 * Page masthead — small-caps eyebrow, engraved title, fading gold rule.
 * The same three-part device the certificate uses for its own heading.
 */
export function PageHeader({
  title,
  subtitle,
  eyebrow,
}: {
  title: string;
  subtitle?: string;
  eyebrow?: string;
}) {
  return (
    <div className="mb-10">
      {eyebrow && <div className="eyebrow mb-2">{eyebrow}</div>}
      <h1 className="font-engraved text-3xl md:text-4xl font-medium">
        {title}
      </h1>
      <hr className="rule-gold mt-4 max-w-xs" />
      {subtitle && (
        <p className="mt-4 text-muted-foreground max-w-2xl">{subtitle}</p>
      )}
    </div>
  );
}
