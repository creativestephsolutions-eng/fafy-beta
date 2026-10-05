export function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h1 className="mb-2 text-3xl font-extrabold tracking-tight">
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
