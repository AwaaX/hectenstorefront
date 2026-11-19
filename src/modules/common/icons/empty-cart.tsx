/** Light grey line drawing of a cart with a "sparkle", for empty cart states */
const EmptyCartIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 330 320"
    fill="none"
    stroke="#ddd"
    strokeWidth="11"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden
    className={className}
  >
    <path d="M60 15l20 35M122 5v40M184 15l-20 35" />
    <path d="M10 95h230l-24 115H28z" />
    <path d="M240 95l12-55h63" />
    <path d="M216 210v18a8 8 0 0 1-8 8H32" />
    <circle cx="58" cy="286" r="20" />
    <circle cx="183" cy="286" r="20" />
  </svg>
)

export default EmptyCartIcon
