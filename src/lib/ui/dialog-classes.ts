/**
 * Centered modal shell for native <dialog showModal()>.
 * Use margin:auto (not fixed corner positioning) so the panel sits in the
 * viewport center. Tailwind preflight zeroes margins — restore with m-auto.
 */
export const DIALOG_PANEL =
  "m-auto max-h-[min(90vh,720px)] w-[calc(100%-2rem)] max-w-lg overflow-visible rounded-xl border border-line bg-surface p-0 text-ink shadow-xl backdrop:bg-ink/40";
