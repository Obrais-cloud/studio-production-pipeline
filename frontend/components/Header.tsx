"use client";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-[var(--color-border)] bg-[var(--color-surface)]/80 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--color-accent)] text-white font-bold text-lg">
            S
          </div>
          <div>
            <h1 className="text-lg font-semibold text-white">Studio Production Pipeline</h1>
            <p className="text-xs text-[var(--color-muted)]">Gestor de producción de contenido</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="h-2.5 w-2.5 rounded-full bg-[var(--color-success)]" />
          <span className="text-xs text-[var(--color-muted)]">Backend activo</span>
        </div>
      </div>
    </header>
  );
}
