import { ChevronDown, Search } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Link } from 'react-router-dom'

const categories = ['Electronics', 'Home & Garden', 'Vehicles', 'Fashion', 'Services', 'Hobbies']

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
    <section
      className="relative flex min-h-[600px] items-center overflow-hidden border-b border-surface-variant bg-cover bg-center px-4 py-14 text-center sm:px-6"
      style={{ backgroundImage: "url('/assets/home/marketplace-hero.jpg')" }}
    >
      <div className="absolute inset-0 bg-surface/80" aria-hidden="true" />
      <div className="relative z-10 mx-auto w-full max-w-container-max">
        <h1 className="text-4xl font-extrabold tracking-[-0.03em] text-on-surface sm:text-5xl">
          Find what you need, locally.
        </h1>
        <p className="mx-auto mt-4 max-w-4xl text-xl font-bold tracking-[-0.02em] text-on-surface-variant sm:text-3xl">
          The safest way to buy and sell within your community in Nepal.
        </p>

        <form
          className="mx-auto mt-9 flex w-full max-w-4xl flex-col items-stretch justify-center gap-2 rounded-xl bg-white/95 p-2 shadow-ambient-hover backdrop-blur md:flex-row"
          role="search"
          onSubmit={handleSubmit}
        >
          <div className="relative md:w-[34%]">
            <label className="sr-only" htmlFor="hero-category">
              Select a category
            </label>
            <select
              id="hero-category"
              className="focus-ring h-14 w-full appearance-none rounded-lg border-0 bg-white px-4 pr-11 text-left text-on-surface"
              value={category}
              onChange={(event) => setCategory(event.target.value)}
            >
              <option value="">Select Category</option>
              {categories.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
            <ChevronDown
              className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-on-surface-variant"
              aria-hidden="true"
            />
          </div>

          <div className="relative md:w-1/2">
            <Search
              className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-on-surface-variant"
              aria-hidden="true"
            />
            <label className="sr-only" htmlFor="hero-query">
              Search for an item
            </label>
            <input
              id="hero-query"
              className="focus-ring h-14 w-full rounded-lg border-0 bg-white pl-12 pr-4 text-on-surface placeholder:text-on-surface-variant/70"
              placeholder="What are you looking for?"
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </div>

          <button
            className="focus-ring h-14 rounded-lg bg-secondary-container px-8 font-semibold text-[#684000] shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            type="submit"
          >
            Search
          </button>
        </form>
        <p className="sr-only" aria-live="polite">
          {message}
        </p>
        <Link className="mt-4 inline-flex font-semibold text-primary-container hover:underline" to="/post-item">
          Or post an item for sale →
        </Link>
      </div>
    </section>
  )
}
