import type { CSSProperties } from "react";

type Props = {
  /** 0-100 reputation score */
  score: number;
  /** Diameter in px */
  size?: number;
  /** Stroke ring color (Tailwind class won't work; pass hex) */
  color?: string;
  /** Track color */
  trackColor?: string;
  className?: string;
  showLabel?: boolean;
  label?: string;
};

export function ReputationRing({
  score,
  size = 80,
  color = "#d83f2e",
  trackColor = "rgba(255, 180, 168, 0.12)",
  className = "",
  showLabel = true,
  label,
}: Props) {
  const safe = Math.max(0, Math.min(100, score));
  const stroke = Math.max(4, Math.round(size * 0.08));
  const r = size / 2 - stroke;
  const circumference = 2 * Math.PI * r;
  const dash = (safe / 100) * circumference;
  const cx = size / 2;
  const fontPx = Math.round(size * 0.32);
  const labelStyle: CSSProperties = { color };
  return (
    <div
      className={`relative inline-flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
    >
      <svg
        className="-rotate-90"
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        aria-hidden
      >
        <circle
          cx={cx}
          cy={cx}
          r={r}
          stroke={trackColor}
          strokeWidth={stroke}
          fill="transparent"
        />
        <circle
          cx={cx}
          cy={cx}
          r={r}
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${dash} ${circumference}`}
          fill="transparent"
          style={{ filter: `drop-shadow(0 0 6px ${color}55)` }}
        />
      </svg>
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        <span
          className="font-display font-extrabold leading-none"
          style={{ ...labelStyle, fontSize: fontPx }}
        >
          {Math.round(safe)}
        </span>
        {showLabel ? (
          <span className="mt-1 font-body text-[10px] font-semibold uppercase tracking-[0.05em] text-on-surface-variant/80">
            {label ?? "Score"}
          </span>
        ) : null}
      </div>
    </div>
  );
}
