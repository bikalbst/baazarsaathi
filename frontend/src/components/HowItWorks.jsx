const steps = [
  {
    number: '1',
    title: 'Discover',
    text: 'Find what you need in your local community.',
    className: 'bg-primary-container/20 text-primary-container',
  },
  {
    number: '2',
    title: 'Chat & Agree',
    text: 'Message the seller to negotiate and agree on terms.',
    className: 'bg-secondary-container/20 text-secondary-container',
  },
  {
    number: '3',
    title: 'Pay Securely',
    text: 'Meet up or use our secure escrow to finalize.',
    className: 'bg-tertiary-container/20 text-tertiary-container',
  },
]

export default function HowItWorks() {
  return (
    <section className="border-y border-surface-variant bg-white px-4 py-14 sm:px-6" aria-labelledby="how-it-works-title">
      <div className="mx-auto max-w-container-max">
        <h2 id="how-it-works-title" className="text-center text-3xl font-bold tracking-[-0.02em]">
          How it Works
        </h2>
        <div className="mt-9 grid gap-10 md:grid-cols-3">
          {steps.map((step) => (
            <article className="text-center" key={step.number}>
              <span className={'mx-auto flex h-14 w-14 items-center justify-center rounded-full text-xl font-bold ' + step.className}>
                {step.number}
              </span>
              <h3 className="mt-4 text-xl font-bold">{step.title}</h3>
              <p className="mx-auto mt-2 max-w-xs leading-6 text-on-surface-variant">{step.text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
