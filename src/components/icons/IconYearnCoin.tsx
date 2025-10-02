// src/components/icons/IconYearnCoin.tsx
import React from "react";

type Props = {
  className?: string;                   // e.g. "w-14 h-14"
  primary?: string;                     // coin blue
  light?: string;                       // white accents
  innerRingWidth?: number;              // tweak ring thickness
  yStrokeWidth?: number;                // tweak the "Y" stroke width
};

const IconYearnCoin: React.FC<Props> = ({
  className = "w-14 h-14",
  primary = "#2F6BFF",
  light = "#FFFFFF",
  innerRingWidth = 16,
  yStrokeWidth = 20,
}) => (
  <svg
    viewBox="0 0 256 256"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-hidden="true"
    focusable="false"
  >
    {/* outer white rim */}
    <circle cx="128" cy="128" r="126" fill={light} />
    {/* blue coin body */}
    <circle cx="128" cy="128" r="118" fill={primary} />
    {/* inner white ring */}
    <circle
      cx="128"
      cy="128"
      r="92"
      fill="none"
      stroke={light}
      strokeWidth={innerRingWidth}
    />
    {/* Y mark (rounded, centered) */}
    <path
      d="M128 168 V84"
      stroke={light}
      strokeWidth={yStrokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
    <path
      d="M128 104 L82 64"
      stroke={light}
      strokeWidth={yStrokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
    <path
      d="M128 104 L174 64"
      stroke={light}
      strokeWidth={yStrokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
  </svg>
);

export default IconYearnCoin;
