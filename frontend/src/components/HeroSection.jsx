import { ArrowRight, ChevronDown, Search, ShieldCheck, Star, BadgeCheck } from 'lucide-react'
import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'

const categories = ['Electronics', 'Home & Garden', 'Vehicles', 'Fashion', 'Services', 'Hobbies']

const stats = [
  { value: '12k+', label: 'Active listings' },
  { value: '4.9/5', label: 'Member rating' },
  { value: '100%', label: 'Escrow protected' },
]

export default function HeroSection() {
  const navigate = useNavigate()
  const [category, setCategory] = useState('')
  const [query, setQuery] = useState('')
  const [message, setMessage] = useState('')

  const handleSubmit = (event) => {
    event.preventDefault()
    const subject = query.trim() || 'all items'
    const area = category || 'all categories'
    setMessage('Searching ' + area + ' for ' + subject + '.')
    navigate('/listings')
  }

  return (
    <section className="bg-grain relative overflow-hidden border-b border-line">
      <div className="mx-auto grid max-w-container-max items-center gap-14 px-4 pb-16 pt-16 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:pb-24 lg:pt-24">
        {/* Left: copy + search */}
        <div>
          <p className="eyebrow flex items-center gap-2">
            <ShieldCheck className="h-4 w-4" aria-hidden="true" />
            Nepal's trusted community marketplace
          </p>

          <h1 className="text-balance mt-5 font-display text-4xl font-semibold leading-[1.08] tracking-[-0.02em] text-ink sm:text-5xl lg:text-[3.6rem]">
            Buy and sell locally,
            <span className="text-brand"> with complete confidence.</span>
          </h1>

          <p className="mt-5 max-w-lg text-lg leading-8 text-ink-muted">
            BazaarSathi connects you with verified neighbors and secures every
            payment through escrow — so you only pay when you have the item in
            hand.
          </p>

          <form
            className="mt-8 flex w-full max-w-2xl flex-col gap-2 rounded-2xl border border-line bg-white p-2 shadow-card sm:flex-row sm:items-center"
            role="search"
            onSubmit={handleSubmit}
          >
            <div className="relative sm:w-[38%]">
              <label className="sr-only" htmlFor="hero-category">
                Select a category
              </label>
              <select
                id="hero-category"
                className="focus-ring h-12 w-full appearance-none rounded-xl border-0 bg-transparent px-4 pr-10 text-left text-sm font-medium text-ink"
                value={category}
                onChange={(event) => setCategory(event.target.value)}
              >
                <option value="">All categories</option>
                {categories.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
              <ChevronDown
                className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted"
                aria-hidden="true"
              />
            </div>

            <div className="relative flex-1 border-t border-line sm:border-l sm:border-t-0">
              <Search
                className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted"
                aria-hidden="true"
              />
              <label className="sr-only" htmlFor="hero-query">
                Search for an item
              </label>
              <input
                id="hero-query"
                className="focus-ring h-12 w-full rounded-xl border-0 bg-transparent pl-11 pr-4 text-sm text-ink placeholder:text-ink-muted/70"
                placeholder="What are you looking for?"
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </div>

            <button
              className="focus-ring h-12 shrink-0 rounded-xl bg-brand px-7 text-sm font-semibold text-paper shadow-sm transition hover:bg-brand-deep"
              type="submit"
            >
              Search
            </button>
          </form>
          <p className="sr-only" aria-live="polite">
            {message}
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-x-10 gap-y-4">
            {stats.map((stat) => (
              <div key={stat.label}>
                <p className="font-display text-2xl font-semibold text-ink">{stat.value}</p>
                <p className="mt-0.5 text-xs font-medium uppercase tracking-[0.14em] text-ink-muted">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Right: layered editorial visual */}
        <div className="relative hidden lg:block" aria-hidden="true">
          <div className="absolute -right-6 -top-6 h-40 w-40 rounded-full bg-gold-soft" />
          <div className="absolute -bottom-8 -left-8 h-32 w-32 rounded-2xl bg-brand-soft" />
          <div className="relative overflow-hidden rounded-[1.75rem] border border-line bg-paper-deep shadow-ambient-hover">
            <img
              className="aspect-[4/4.4] w-full object-cover"
              src="/assets/home/marketplace-hero.jpg"
              alt=""
            />
          </div>

          {/* Floating trust card */}
          <div className="absolute -left-10 bottom-10 w-64 rounded-2xl border border-line bg-white/95 p-4 shadow-card backdrop-blur">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-soft text-brand">
                <BadgeCheck className="h-5 w-5" aria-hidden="true" />
              </span>
              <div>
                <p className="text-sm font-semibold text-ink">Escrow secured</p>
                <p className="text-xs text-ink-muted">Funds held until handover</p>
              </div>
            </div>
            <div className="mt-3 flex items-center gap-1.5 border-t border-line pt-3 text-xs font-medium text-ink-soft">
              <Star className="h-3.5 w-3.5 fill-gold text-gold" aria-hidden="true" />
              Rated 4.9 by 3,200+ members
            </div>
          </div>
        </div>
      </div>

      <Link
        className="group mx-auto -mt-6 mb-10 flex w-fit items-center gap-2 text-sm font-semibold text-brand transition hover:text-brand-deep lg:hidden"
        to="/post-item"
      >
        Or post an item for sale
        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
      </Link>
    </section>
  )
}
