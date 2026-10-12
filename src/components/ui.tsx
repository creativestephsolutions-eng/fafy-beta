export function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h1 className="mb-2 font-display text-3xl font-bold tracking-tight">
      <span className="text-neonTeal text-glow-teal">{children}</span>
    </h1>
  );
}

export function Kicker({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-4 text-xs font-bold uppercase tracking-[0.25em] text-neonCoral">
      {children}
    </p>
  );
}

export function Divider() {
  return <div className="my-6 h-px bg-gradient-to-r from-transparent via-neonTeal/60 to-transparent" />;
}

export function NeonButton({
  children,
  href,
  onClick,
  type,
  className = "",
}: {
  children: React.ReactNode;
  href?: string;
  onClick?: () => void;
  type?: "button" | "submit";
  className?: string;
}) {
  const cls = `btn-neon ${className}`;
  if (href)
    return (
      <a href={href} className={cls}>
        {children}
      </a>
    );
  return (
    <button type={type ?? "button"} onClick={onClick} className={cls}>
      {children}
    </button>
  );
}

export function GhostButton({
  children,
  href,
  onClick,
  type,
  className = "",
}: {
  children: React.ReactNode;
  href?: string;
  onClick?: () => void;
  type?: "button" | "submit";
  className?: string;
}) {
  const cls = `btn-ghost ${className}`;
  if (href)
    return (
      <a href={href} className={cls}>
        {children}
      </a>
    );
  return (
    <button type={type ?? "button"} onClick={onClick} className={cls}>
      {children}
    </button>
  );
}

export function StepCard({
  n,
  title,
  children,
}: {
  n: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="card">
      <div className="mb-1 text-xs font-bold uppercase tracking-[0.2em] text-neonViolet">{n}</div>
      <h3 className="mb-1 text-lg font-bold text-cream">{title}</h3>
      <p className="text-sm text-cream/80">{children}</p>
    </div>
  );
}

export function AdviceDisclaimer() {
  return (
    <div className="card border-neonViolet/30">
      <p className="text-sm text-cream/80">
        <strong className="text-neonViolet">Before you take my advice:</strong> my advice, opinions, etc.
        are simply that. As with all advice: listen, consider what was said, and if it makes sense
        to you, apply it properly in your life.
      </p>
    </div>
  );
}
