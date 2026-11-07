import { cn } from '@/utils'

/** Brand mark: rounded primary tile with a bar-chart glyph. */
export function BrandLogo({ className }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        'bg-primary text-primary-foreground inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl',
        className,
      )}
    >
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
        <rect x="5" y="9" width="3" height="10" rx="1" />
        <rect x="10.5" y="5" width="3" height="14" rx="1" />
        <rect x="16" y="12" width="3" height="7" rx="1" />
      </svg>
    </span>
  )
}
