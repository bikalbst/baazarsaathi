import { Link } from 'react-router-dom'

export default function SellerCta() {
  return (
    <section className="mx-auto max-w-container-max px-4 py-14 sm:px-6">
      <div className="grid items-center gap-8 overflow-hidden rounded-3xl bg-surface-container p-7 sm:p-10 md:grid-cols-2">
        <div>
          <h2 className="max-w-xl text-4xl font-extrabold tracking-[-0.03em] sm:text-5xl">
            Turn unused items into opportunity.
          </h2>
          <p className="mt-5 max-w-lg text-lg leading-7 text-on-surface-variant">
            Start selling today and reach thousands of buyers in your area.
          </p>
          <Link className="mt-7 inline-flex rounded-lg bg-primary-container px-7 py-4 font-bold text-white shadow-md transition hover:-translate-y-0.5 hover:bg-primary" to="/post-item">
            Post Your First Item
          </Link>
        </div>
        <div className="flex justify-center md:justify-end">
          <img
            className="aspect-square w-full max-w-md rounded-2xl border border-surface-variant bg-white object-cover shadow-ambient"
            src="/assets/home/community-marketplace-illustration.jpg"
            alt="People buying and selling in the BazaarSathi community"
          />
        </div>
      </div>
    </section>
  )
}
