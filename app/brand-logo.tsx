export default function BrandLogo() {
  return (
    <svg
      aria-hidden="true"
      width="210"
      height="48"
      viewBox="0 0 210 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: 'block', width: '100%', height: 'auto' }}
    >
      {/* Padhaku Graduation Emblem */}
      <rect x="2" y="6" width="36" height="36" rx="11" fill="currentColor" />
      <path d="M20 13L31 18.5L20 24L9 18.5L20 13Z" fill="#c4b5fd" />
      <path
        d="M13 21.5V27.5C13 29.8 16.1 31.8 20 31.8C23.9 31.8 27 29.8 27 27.5V21.5"
        stroke="#f7f8fa"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      <circle cx="30.5" cy="24.5" r="1.8" fill="#c4b5fd" />

      {/* Padhaku Wordmark */}
      <text
        x="46"
        y="34"
        fill="currentColor"
        style={{
          fontFamily: 'Epilogue, Arial, sans-serif',
          fontWeight: 900,
          fontSize: '30px',
          letterSpacing: '-0.03em',
        }}
      >
        Padhaku.
      </text>
    </svg>
  );
}
