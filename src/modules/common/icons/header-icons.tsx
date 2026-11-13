import React from "react"

import { IconProps } from "types/icon"

// Outline icons used in the site header (same set and stroke as hecten.com)
const Outline = ({
  d,
  size,
  color = "currentColor",
  strokeWidth = 1.5,
  ...attributes
}: IconProps & { d: string }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    xmlns="http://www.w3.org/2000/svg"
    {...attributes}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={strokeWidth}
      d={d}
    />
  </svg>
)

export const AccountIcon: React.FC<IconProps> = ({ size = "28", ...props }) => (
  <Outline
    size={size}
    d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z"
    {...props}
  />
)

export const HelpIcon: React.FC<IconProps> = ({ size = "28", ...props }) => (
  <Outline
    size={size}
    d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
    {...props}
  />
)

export const OrderIcon: React.FC<IconProps> = ({ size = "28", ...props }) => (
  <Outline
    size={size}
    d="M13 9l3 3m0 0l-3 3m3-3H8m13 0a9 9 0 11-18 0 9 9 0 0118 0z"
    {...props}
  />
)

export const WishlistIcon: React.FC<IconProps> = ({ size = "28", ...props }) => (
  <Outline
    size={size}
    d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
    {...props}
  />
)

export const CartIcon: React.FC<IconProps> = ({ size = "22", ...props }) => (
  <Outline
    size={size}
    d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
    {...props}
  />
)

export const SearchIcon: React.FC<IconProps> = ({ size = "16", ...props }) => (
  <Outline
    size={size}
    strokeWidth={2}
    d="M21 21L15 15M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z"
    {...props}
  />
)
