interface Props {
  size?: number;
  className?: string;
}

/**
 * Simple animated spinner using inline SVG + Tailwind animate-spin.
 * No external dependencies required.
 */
export function MenuallySpinner({ size = 80, className }: Props) {
  return (
    <div
      className={className}
      style={{ width: size, height: size }}
      role="status"
      aria-label="Cargando"
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        className="size-full animate-spin"
      >
        <circle
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeDasharray="60"
          strokeDashoffset="20"
          className="text-[#114821]"
        />
      </svg>
    </div>
  );
}
