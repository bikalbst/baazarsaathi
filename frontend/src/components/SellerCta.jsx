import { ArrowRight, CheckCircle2 } from 'lucide-react'
import { Link } from 'react-router-dom'

const benefits = [
  'List an item in under two minutes',
  'Reach verified buyers in your area',
  'Get paid securely through escrow',
]

export default function SellerCta() {
  return (
    <section className="mx-auto max-w-container-max px-4 py-16 sm:px-6 lg:py-24">
      <div className="relative grid items-center gap-10 overflow-hidden rounded-[2rem] bg-ink p-8 sm:p-12 lg:grid-cols-[1.1fr_0.9fr] lg:p-16">
        {/* Decorative glow */}
        <div
          className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-brand/40 blur-3xl"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute -bottom-28 -left-20 h-64 w-64 rounded-full bg-gold/25 blur-3xl"
          aria-hidden="true"
        />

        <div className="relative">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gold">
            For sellers
          </p>
          <h2 className="text-balance mt-4 font-display text-3xl font-semibold leading-[1.12] tracking-[-0.01em] text-paper sm:text-4xl lg:text-[2.75rem]">
            Turn unused items into opportunity.
          </h2>
          <p className="mt-4 max-w-md text-base leading-7 text-paper/65">
            Join thousands of sellers earning from the things they no longer
            need — with the safety of escrow on every sale.
          </p>

          <ul className="mt-6 space-y-3">
            {benefits.map((benefit) => (
              <li key={benefit} className="flex items-center gap-3 text-sm text-paper/80">
                <CheckCircle2 className="h-4.5 w-4.5 shrink-0 text-gold" aria-hidden="true" />
                {benefit}
              </li>
            ))}
          </ul>

          <Link
            className="focus-ring group mt-8 inline-flex items-center gap-2 rounded-full bg-gold px-7 py-3.5 text-sm font-semibold text-ink shadow-md transition hover:-translate-y-0.5 hover:brightness-105"
            to="/post-item"
          >
            Post your first item
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
          </Link>
        </div>

        <div className="relative hidden lg:block">
          <img
            className="aspect-[4/3.4] w-full rounded-3xl border border-white/10 object-cover shadow-ambient-hover"
            src="/assets/home/community-marketplace-illustration.jpg"
            alt="People buying and selling in the BazaarSathi community"
          />
        </div>
      </div>
    </section>
  )
}
