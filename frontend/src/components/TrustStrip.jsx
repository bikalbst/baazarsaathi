import { MapPinCheck, ShieldCheck, UsersRound } from 'lucide-react'

const trustItems = [
  { label: 'Secure Escrow', icon: ShieldCheck },
  { label: 'Verified Community', icon: UsersRound },
  { label: 'Local Pickup', icon: MapPinCheck },
]

export default function TrustStrip() {
  return (
    <section className="border-b border-surface-variant bg-white" aria-label="Marketplace benefits">
      <div className="mx-auto grid max-w-3xl grid-cols-1 gap-4 px-4 py-5 text-sm font-semibold text-on-surface-variant sm:grid-cols-3">
        {trustItems.map(({ label, icon: Icon }) => (
          <div className="flex items-center justify-center gap-2" key={label}>
            <Icon className="h-5 w-5 text-primary-container" aria-hidden="true" />
            {label}
          </div>
        ))}
      </div>
    </section>
  )
}
