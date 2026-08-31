import {
  Armchair,
  ArrowUpRight,
  CarFront,
  Gamepad2,
  MonitorSmartphone,
  Shirt,
  Wrench,
} from 'lucide-react'
import { Link } from 'react-router-dom'

const categories = [
  { name: 'Electronics', count: '3,140 items', icon: MonitorSmartphone },
  { name: 'Home & Garden', count: '2,480 items', icon: Armchair },
  { name: 'Vehicles', count: '960 items', icon: CarFront },
  { name: 'Fashion', count: '1,870 items', icon: Shirt },
  { name: 'Services', count: '740 items', icon: Wrench },
  { name: 'Hobbies', count: '1,120 items', icon: Gamepad2 },
]

export default function CategoryGrid() {
  return (
    <section className="mx-auto max-w-container-max px-4 py-16 sm:px-6 lg:py-20" aria-labelledby="categories-title">
      <div className="mb-10 flex flex-col gap-2 text-center">
        <p className="eyebrow">Categories</p>
        <h2
          id="categories-title"
          className="font-display text-3xl font-semibold tracking-[-0.01em] text-ink sm:text-4xl"
        >
          Browse by category
        </h2>
        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-ink-muted">
          From everyday essentials to rare finds — discover what your
          neighborhood has to offer.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-6">
        {categories.map(({ name, count, icon: Icon }) => (
          <Link
            key={name}
            className="focus-ring group flex min-h-40 flex-col justify-between rounded-2xl border border-line bg-white p-4 transition duration-300 hover:-translate-y-1 hover:border-brand/30 hover:shadow-card"
            to="/listings"
          >
            <div className="flex items-start justify-between">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-paper-warm text-ink-soft transition-colors duration-300 group-hover:bg-brand group-hover:text-paper">
                <Icon className="h-5 w-5" strokeWidth={1.9} aria-hidden="true" />
              </span>
              <ArrowUpRight
                className="h-4 w-4 text-ink-muted/40 transition-all duration-300 group-hover:translate-x-0.5 group-hover:text-brand"
                aria-hidden="true"
              />
            </div>
            <div>
              <p className="text-sm font-semibold text-ink sm:text-[0.95rem]">{name}</p>
              <p className="mt-0.5 text-xs text-ink-muted">{count}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
