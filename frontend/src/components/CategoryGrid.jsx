import {
  Armchair,
  CarFront,
  Gamepad2,
  MonitorSmartphone,
  Shirt,
  Wrench,
} from 'lucide-react'
import { Link } from 'react-router-dom'

const categories = [
  {
    name: 'Electronics',
    icon: MonitorSmartphone,
    iconClass: 'bg-primary-container/20 text-primary-container',
  },
  {
    name: 'Home & Garden',
    icon: Armchair,
    iconClass: 'bg-secondary-container/20 text-secondary-container',
  },
  {
    name: 'Vehicles',
    icon: CarFront,
    iconClass: 'bg-tertiary-container/20 text-tertiary-container',
  },
  {
    name: 'Fashion',
    icon: Shirt,
    iconClass: 'bg-primary-fixed/30 text-primary',
  },
  {
    name: 'Services',
    icon: Wrench,
    iconClass: 'bg-secondary-fixed/40 text-[#653e00]',
  },
  {
    name: 'Hobbies',
    icon: Gamepad2,
    iconClass: 'bg-tertiary-fixed/40 text-tertiary',
  },
]

export default function CategoryGrid() {
  return (
    <section className="mx-auto max-w-container-max px-4 py-12 sm:px-6" aria-labelledby="categories-title">
      <h2
        id="categories-title"
        className="mb-7 text-center text-3xl font-bold tracking-[-0.02em] text-on-surface"
      >
        Browse by Category
      </h2>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
        {categories.map(({ name, icon: Icon, iconClass }) => (
          <Link
            key={name}
            className="focus-ring group flex min-h-36 flex-col items-center justify-center rounded-xl bg-white p-4 shadow-ambient transition duration-300 hover:-translate-y-1 hover:shadow-ambient-hover"
            to="/listings"
          >
            <span
              className={'mb-3 flex h-16 w-16 items-center justify-center rounded-full transition-transform duration-300 group-hover:scale-110 ' + iconClass}
            >
              <Icon className="h-6 w-6" strokeWidth={2.25} aria-hidden="true" />
            </span>
            <span className="text-center text-sm font-semibold text-on-surface transition-colors group-hover:text-primary sm:text-base">
              {name}
            </span>
          </Link>
        ))}
      </div>
    </section>
  )
}
