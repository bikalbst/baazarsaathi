import { Link } from 'react-router-dom'

export default function Brand({ compact = false, light = false }) {
  return (
    <Link
      className="focus-ring flex shrink-0 items-center gap-2.5 rounded-lg"
      to="/"
      aria-label="BazaarSathi home"
    >
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand shadow-sm">
        <svg aria-hidden="true" className="h-5 w-5" viewBox="0 0 24 24" fill="none">
          <path
            d="M5.5 8.5h13l-1.2 11a1.5 1.5 0 0 1-1.5 1.4H8.2a1.5 1.5 0 0 1-1.5-1.4l-1.2-11Z"
            stroke="#faf9f7"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
          <path
            d="M9 8.5V7a3 3 0 0 1 6 0v1.5"
            stroke="#d9b36a"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </svg>
      </span>
      {!compact && (
        <span
          className={
            'font-display text-xl font-semibold tracking-[-0.01em] max-[360px]:hidden sm:text-[1.35rem] ' +
            (light ? 'text-paper' : 'text-ink')
          }
        >
          Bazaar<span className={light ? 'text-gold' : 'text-brand'}>Sathi</span>
        </span>
      )}
    </Link>
  )
}
