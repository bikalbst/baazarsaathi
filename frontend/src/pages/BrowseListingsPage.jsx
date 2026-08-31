import { Heart, Search, SlidersHorizontal } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Footer from '../components/Footer'
import Header from '../components/Header'
import { apiRequest } from '../services/api'

const formatNpr = (value) => new Intl.NumberFormat('en-NP', {
  style: 'currency',
  currency: 'NPR',
  maximumFractionDigits: 2,
}).format(value)

function BrowseCard({ listing }) {
  const [favorite, setFavorite] = useState(false)
  const image = listing.images?.[0] || '/assets/stitch/browse-listings-0.jpg'

  return (
    <article className="overflow-hidden rounded-xl bg-white shadow-ambient transition hover:-translate-y-1 hover:shadow-ambient-hover">
      <div className="relative aspect-[4/3] overflow-hidden">
        <Link to={`/listings/${listing._id}`}>
          <img className="h-full w-full object-cover transition duration-500 hover:scale-105" src={image} alt={listing.title} />
        </Link>
        <button className="absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full bg-white/95 text-on-surface-variant shadow-sm" type="button" aria-label="Toggle favorite" onClick={() => setFavorite(!favorite)}>
          <Heart className="h-5 w-5" fill={favorite ? '#a43a3a' : 'none'} color={favorite ? '#a43a3a' : 'currentColor'} />
        </button>
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <Link className="min-w-0 truncate text-lg font-bold hover:text-primary" to={`/listings/${listing._id}`}>{listing.title}</Link>
          <span className="shrink-0 text-lg font-bold text-primary-container">{formatNpr(listing.price)}</span>
        </div>
        <span className="mt-2 inline-flex rounded-full bg-primary-container/10 px-3 py-1 text-xs font-semibold capitalize text-primary">{listing.condition}</span>
        <div className="mt-4 flex items-center gap-2 border-t border-surface-variant pt-4 text-sm">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary-container text-xs font-bold text-[#684000]">{listing.seller?.name?.[0] || 'S'}</span>
          <span className="min-w-0 flex-1 truncate font-medium">{listing.seller?.name || 'BazaarSathi seller'}</span>
          <span className="capitalize text-on-surface-variant">{listing.status}</span>
        </div>
      </div>
    </article>
  )
}

export default function BrowseListingsPage() {
  const [listings, setListings] = useState([])
  const [search, setSearch] = useState('')
  const [submittedSearch, setSubmittedSearch] = useState('')
  const [category, setCategory] = useState('')
  const [condition, setCondition] = useState('')
  const [sort, setSort] = useState('newest')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    const params = new URLSearchParams({ status: 'active', sort })
    if (submittedSearch) params.set('search', submittedSearch)
    if (category) params.set('category', category)
    if (condition) params.set('condition', condition)
    setLoading(true)
    setError('')

    apiRequest(`/api/listings?${params}`)
      .then((response) => {
        if (active) setListings(response.data)
      })
      .catch((requestError) => {
        if (active) setError(requestError.message)
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [submittedSearch, category, condition, sort])

  return (
    <div className="min-h-screen bg-surface">
      <Header />
      <main className="mx-auto max-w-[1440px] px-4 py-10 sm:px-6">
        <div className="flex flex-col justify-between gap-4 border-b border-surface-variant pb-6 sm:flex-row sm:items-center">
          <div><h1 className="text-3xl font-bold">Marketplace</h1><span className="text-on-surface-variant">{listings.length} active listings</span></div>
          <label className="flex items-center gap-2 font-semibold">Sort by:
            <select className="rounded-lg border border-outline-variant bg-white px-4 py-2 font-normal" value={sort} onChange={(event) => setSort(event.target.value)}>
              <option value="newest">Most Recent</option><option value="price_asc">Price: Low to High</option><option value="price_desc">Price: High to Low</option><option value="most_viewed">Most Viewed</option>
            </select>
          </label>
        </div>
        <form className="mt-6 flex gap-3" onSubmit={(event) => { event.preventDefault(); setSubmittedSearch(search.trim()) }}>
          <input className="h-12 flex-1 rounded-lg border border-outline-variant bg-white px-4" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search listings…" />
          <button className="flex items-center gap-2 rounded-lg bg-primary px-5 font-bold text-white" type="submit"><Search className="h-5 w-5" />Search</button>
        </form>
        <div className="mt-7 grid gap-6 lg:grid-cols-[280px_1fr]">
          <aside className="rounded-2xl bg-white p-6 shadow-ambient lg:sticky lg:top-24 lg:self-start">
            <div className="flex items-center gap-3 border-b border-surface-variant pb-4"><SlidersHorizontal className="h-5 w-5" /><h2 className="text-lg font-bold">Filters</h2></div>
            <label className="mt-5 block text-sm font-semibold">Category
              <input className="mt-2 w-full rounded-lg border border-outline-variant px-3 py-2 font-normal" value={category} onChange={(event) => setCategory(event.target.value.trim().toLowerCase())} placeholder="e.g. electronics" />
            </label>
            <label className="mt-5 block text-sm font-semibold">Condition
              <select className="mt-2 w-full rounded-lg border border-outline-variant px-3 py-2 font-normal" value={condition} onChange={(event) => setCondition(event.target.value)}>
                <option value="">Any condition</option><option value="new">New</option><option value="like-new">Like new</option><option value="used">Used</option>
              </select>
            </label>
            <button className="mt-6 w-full rounded-lg bg-surface-container-high px-4 py-3 font-semibold" type="button" onClick={() => { setCategory(''); setCondition(''); setSearch(''); setSubmittedSearch('') }}>Reset Filters</button>
          </aside>
          <section>
            {loading && <p className="py-16 text-center font-semibold">Loading listings…</p>}
            {error && <p className="rounded-lg bg-red-50 p-4 text-red-700" role="alert">{error}</p>}
            {!loading && !error && listings.length === 0 && <p className="py-16 text-center text-on-surface-variant">No matching active listings found. A seller must post an item before it can be purchased.</p>}
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">{listings.map((listing) => <BrowseCard key={listing._id} listing={listing} />)}</div>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  )
}
