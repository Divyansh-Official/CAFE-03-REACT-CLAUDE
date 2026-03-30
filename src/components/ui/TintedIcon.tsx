import React from 'react';
import tints from '../../data/icons_tint_sections.json';

type TintSection = keyof typeof tints;
type TintKey<S extends TintSection> = keyof (typeof tints)[S];

interface TintedIconProps {
  src: string;
  alt?: string;
  section: TintSection;
  tintKey?: string;
  /** Base size in px — will scale with clamp() */
  size?: number;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Renders an icon with the correct CSS filter tint for its section.
 * Icons from icons.json are black (color=000000), filters convert them
 * to white, brand red, or any other colour defined in icons_tint_sections.json.
 */
export const TintedIcon: React.FC<TintedIconProps> = ({
  src, alt = '', section, tintKey = 'default', size = 20, className = '', style = {}
}) => {
  const sectionTints = tints[section] as Record<string, string> | undefined;
  const filter = sectionTints?.[tintKey] ?? 'brightness(0) invert(1)';

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      style={{
        width:  `clamp(${Math.round(size * 0.75)}px, ${size / 16}rem, ${Math.round(size * 1.2)}px)`,
        height: `clamp(${Math.round(size * 0.75)}px, ${size / 16}rem, ${Math.round(size * 1.2)}px)`,
        filter,
        display: 'block',
        flexShrink: 0,
        ...style,
      }}
    />
  );
};

/**
 * Returns a responsive icon size in px based on viewport width.
 * Call inside a component; uses window.innerWidth at render time.
 */
export const useIconSize = (base: number = 20): number => {
  const vw = typeof window !== 'undefined' ? window.innerWidth : 1280;
  if (vw < 375)  return Math.round(base * 0.80);
  if (vw < 640)  return Math.round(base * 0.90);
  if (vw < 1024) return base;
  if (vw < 1440) return Math.round(base * 1.10);
  return Math.round(base * 1.20);
};

export default TintedIcon;
