import type { ElementType, ComponentPropsWithoutRef, ReactNode } from "react";

type GlassCardProps<T extends ElementType> = {
  as?: T;
  children: ReactNode;
  className?: string;
  glow?: boolean;
} & Omit<ComponentPropsWithoutRef<T>, "as" | "className" | "children">;

export function GlassCard<T extends ElementType = "div">({
  as,
  children,
  className = "",
  glow = false,
  ...rest
}: GlassCardProps<T>) {
  const Tag = (as ?? "div") as ElementType;
  return (
    <Tag
      className={`glass-card relative rounded-xl ${glow ? "inner-glow" : ""} ${className}`}
      {...rest}
    >
      {children}
    </Tag>
  );
}
