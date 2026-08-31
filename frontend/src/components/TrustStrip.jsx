import { MapPinCheck, ShieldCheck, UsersRound } from 'lucide-react'

const trustItems = [
  {
    label: 'Secure escrow',
    description: 'Payment released only after handover',
    icon: ShieldCheck,
  },
  {
    label: 'Verified community',
    description: 'Identity-checked buyers and sellers',
    icon: UsersRound,
  },
  {
    label: 'Local pickup',
    description: 'Meet safely in your own neighborhood',
    icon: MapPinCheck,
  },
]

export default function TrustStrip() {
  return (
    <section className="border-b border-line bg-white" aria-label="Marketplace benefits">
      <div className="mx-auto grid max-w-container-max grid-cols-1 divide-y divide-line px-4 py-2 sm:grid-cols-3 sm:divide-x sm:divide-y-0 sm:px-6">
        {trustItems.map(({ label, description, icon: Icon }) => (
          <div className="flex items-center gap-4 px-2 py-5 sm:justify-center" key={label}>
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand-soft text-brand">
              <Icon className="h-5 w-5" aria-hidden="true" />
            </span>
            <div>
              <p className="text-sm font-semibold text-ink">{label}</p>
              <p className="mt-0.5 text-xs text-ink-muted">{description}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
