// Two overlapping circles = two people/tasks moving in sync (tandem).
// Sized via the `size` prop; color inherits from currentColor so it
// adapts to light backgrounds (navy) or dark ones (white), as needed.
function Logo({ size = 28, showWordmark = true, wordmarkColor = 'var(--ink)' }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
        <circle cx="16" cy="20" r="12" fill="var(--amber)" />
        <circle cx="26" cy="20" r="12" fill="var(--teal)" fillOpacity="0.85" />
      </svg>
      {showWordmark && (
        <span
          style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 600,
            fontSize: size * 0.75,
            color: wordmarkColor,
            letterSpacing: '-0.01em',
          }}
        >
          Tandem
        </span>
      )}
    </div>
  );
}

export default Logo;