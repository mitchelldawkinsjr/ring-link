import type { CSSProperties } from "react";

type IconProps = {
  name: string;
  className?: string;
  filled?: boolean;
  weight?: 100 | 200 | 300 | 400 | 500 | 600 | 700;
  size?: number;
  "aria-hidden"?: boolean;
};

export function Icon({
  name,
  className = "",
  filled = false,
  weight = 400,
  size,
  "aria-hidden": ariaHidden = true,
}: IconProps) {
  const style: CSSProperties = {
    fontVariationSettings: `'FILL' ${filled ? 1 : 0}, 'wght' ${weight}, 'GRAD' 0, 'opsz' 24`,
    fontSize: size ? `${size}px` : undefined,
    lineHeight: 1,
  };
  return (
    <span
      aria-hidden={ariaHidden}
      className={`material-symbols-outlined select-none ${className}`}
      style={style}
    >
      {name}
    </span>
  );
}
