import { MessagesSquare, SearchCheck, ShieldCheck } from 'lucide-react'

const steps = [
  {
    number: '01',
    title: 'Discover',
    text: 'Browse curated listings from verified members in your neighborhood, filtered by what matters to you.',
    icon: SearchCheck,
  },
  {
    number: '02',
    title: 'Chat & agree',
    text: 'Message sellers directly to ask questions, negotiate fairly, and settle on terms — all in one place.',
    icon: MessagesSquare,
  },
  {
    number: '03',
    title: 'Pay securely',
    text: 'Your money is held in escrow and only released once the item is safely in your hands.',
    icon: ShieldCheck,
  },
]

export default function HowItWorks() {
  return (
    <section
      className="bg-paper px-4 py-16 sm:px-6 lg:py-24"
      aria-labelledby="how-it-works-title"
    >
      <div className="mx-auto max-w-container-max">
        <div className="mx-auto max-w-xl text-center">
          <p className="eyebrow">The process</p>
          <h2
            id="how-it-works-title"
            className="mt-2 font-display text-3xl font-semibold tracking-[-0.01em] text-ink sm:text-4xl"
          >
            How BazaarSathi works
          </h2>
          <p className="mt-3 text-sm leading-6 text-ink-muted">
            Three simple steps between you and a safe, local transaction.
          </p>
        </div>

        <div className="relative mt-14 grid gap-10 md:grid-cols-3 md:gap-8">
          {/* Connecting line behind steps on desktop */}
          <div
            className="absolute left-[16%] right-[16%] top-7 hidden border-t border-dashed border-outline-variant md:block"
            aria-hidden="true"
          />
          {steps.map((step) => (
            <article className="relative text-center" key={step.number}>
              <div className="relative mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-line bg-white shadow-ambient">
                <step.icon className="h-6 w-6 text-brand" strokeWidth={1.9} aria-hidden="true" />
              </div>
              <p className="mt-5 text-xs font-semibold uppercase tracking-[0.22em] text-gold">
                Step {step.number}
              </p>
              <h3 className="mt-2 font-display text-xl font-semibold text-ink">{step.title}</h3>
              <p className="mx-auto mt-2 max-w-xs text-sm leading-6 text-ink-muted">{step.text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
