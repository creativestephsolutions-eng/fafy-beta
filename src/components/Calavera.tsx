export default function Calavera({ className = "h-16 w-16" }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 120" className={className} aria-hidden="true" fill="none">
      <defs>
        <filter id="calavera-glow" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="2.2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <g filter="url(#calavera-glow)" strokeLinecap="round" strokeLinejoin="round">
        {/* cranium */}
        <path d="M60 8 C34 8 20 30 20 54 C20 68 26 78 34 84 L34 96 C34 102 39 106 45 106 L75 106 C81 106 86 102 86 96 L86 84 C94 78 100 68 100 54 C100 30 86 8 60 8 Z"
          stroke="#2dd4bf" strokeWidth="2.5" />
        {/* brow dots */}
        <circle cx="38" cy="34" r="1.6" fill="#fb7185" stroke="none" />
        <circle cx="82" cy="34" r="1.6" fill="#fb7185" stroke="none" />
        <circle cx="60" cy="26" r="1.6" fill="#a78bfa" stroke="none" />
        {/* eyes — flower sockets */}
        <g stroke="#fb7185" strokeWidth="2.2">
          <circle cx="43" cy="56" r="10" />
          <circle cx="77" cy="56" r="10" />
        </g>
        <g stroke="#a78bfa" strokeWidth="1.6">
          <circle cx="43" cy="56" r="4.5" />
          <circle cx="77" cy="56" r="4.5" />
        </g>
        <circle cx="43" cy="56" r="1.8" fill="#a3e635" stroke="none" />
        <circle cx="77" cy="56" r="1.8" fill="#a3e635" stroke="none" />
        {/* nose — upside-down heart */}
        <path d="M60 66 L54 76 C54 79 57 81 60 79 C63 81 66 79 66 76 Z"
          stroke="#2dd4bf" strokeWidth="2" />
        {/* cheek swirls */}
        <path d="M28 70 q6 6 12 3" stroke="#a78bfa" strokeWidth="1.6" />
        <path d="M92 70 q-6 6 -12 3" stroke="#a78bfa" strokeWidth="1.6" />
        {/* teeth */}
        <path d="M40 96 L40 106 M50 96 L50 106 M60 96 L60 106 M70 96 L70 106 M80 96 L80 106"
          stroke="#2dd4bf" strokeWidth="1.8" />
        <path d="M36 96 L84 96" stroke="#2dd4bf" strokeWidth="1.8" />
        {/* forehead flower */}
        <g stroke="#fb7185" strokeWidth="1.6">
          <circle cx="60" cy="42" r="3" />
          <path d="M60 36 v-4 M60 48 v4 M54 42 h-4 M66 42 h4" />
        </g>
      </g>
    </svg>
  );
}
