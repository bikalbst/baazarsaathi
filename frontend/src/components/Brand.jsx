import { Link } from 'react-router-dom'

export default function Brand({ compact = false }) {
  return (
    <Link
      className="focus-ring flex shrink-0 items-center gap-2 rounded-lg text-primary"
      to="/"
      aria-label="BazaarSathi home"
    >
      <svg
        aria-hidden="true"
        className="h-8 w-8 shrink-0"
        viewBox="0 0 48 48"
        fill="none"
      >
        <path d="M12 17.5h24l2.6 23H9.4l2.6-23Z" fill="#10b981" />
        <path
          d="M17 18v-3.2C17 9.95 20.13 6 24 6s7 3.95 7 8.8V18"
          stroke="#f59e0b"
          strokeWidth="4"
          strokeLinecap="round"
        />
        <path
          d="M11.7 18.2c5.9 1.3 8.4 5.25 11.25 9.7 2.66 4.15 5.63 8.77 14.45 11.15L38.6 40H9.4l2.3-21.8Z"
          fill="#059669"
        />
        <path
          d="M15.2 14.3c1.2 7.8 6.45 10.3 11 12.45 4.08 1.93 7.63 3.6 9.8 8.45"
          stroke="white"
          strokeWidth="3"
          strokeLinecap="round"
        />
      </svg>
      {!compact && (
        <span className="text-xl font-bold tracking-[-0.02em] max-[360px]:hidden sm:text-2xl">
          BazaarSathi
        </span>
      )}
    </Link>
  )
}
