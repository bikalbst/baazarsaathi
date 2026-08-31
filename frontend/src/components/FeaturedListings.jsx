import { ArrowRight, BadgeCheck, Heart, MapPin, Store } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'

const listings = [
  {
    id: 'macbook-pro',
    title: 'MacBook Pro 14"',
    price: 'NPR 140,000',
    condition: 'Like new',
    image: '/assets/home/macbook-pro.jpg',
    imageAlt: 'MacBook Pro on a bright minimalist desk',
    seller: 'Alex J.',
    avatar: '/assets/home/alex-avatar.jpg',
    location: 'Kathmandu',
    locationType: 'place',
  },
  {
    id: 'vintage-couch',
    title: 'Vintage Leather Couch',
    price: 'NPR 45,000',
    condition: 'Gently used',
    image: '/assets/home/leather-couch.jpg',
    imageAlt: 'Vintage caramel leather couch in a warm loft',
    seller: 'Sarah M.',
    avatar: '/assets/home/sarah-avatar.jpg',
    location: 'Pokhara',
    locationType: 'place',
  },
  {
    id: 'mountain-bike',
    title: 'Trek Mountain Bike',
    price: 'NPR 55,000',
    condition: 'Verified shop',
    image: '/assets/home/mountain-bike.jpg',
    imageAlt: 'Black mountain bike beside a white brick wall',
    seller: 'BikeHub Shop',
    avatar: '/assets/home/bikehub-avatar.jpg',
    location: 'Patan',
    locationType: 'store',
  },
]

function ListingCard({ listing, isFavorite, onFavorite }) {
  const LocationIcon = listing.locationType === 'store' ? Store : MapPin

  return (
    <article className="group flex min-w-0 flex-col overflow-hidden rounded-2xl border border-line bg-white transition duration-300 hover:-translate-y-1 hover:border-brand/25 hover:shadow-card">
      <div className="relative aspect-[4/3] overflow-hidden bg-paper-deep">
        <img
          className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]"
          src={listing.image}
          alt={listing.imageAlt}
        />
        <span className="absolute left-3 top-3 rounded-full bg-ink/75 px-3 py-1 text-[0.7rem] font-semibold uppercase tracking-[0.08em] text-paper backdrop-blur">
          {listing.condition}
        </span>
        <button
          className={
            'focus-ring absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/95 shadow-sm backdrop-blur transition ' +
            (isFavorite ? 'text-tertiary' : 'text-ink-muted hover:text-tertiary')
          }
          type="button"
          aria-label={(isFavorite ? 'Remove ' : 'Add ') + listing.title + (isFavorite ? ' from favorites' : ' to favorites')}
          aria-pressed={isFavorite}
          onClick={() => onFavorite(listing.id)}
        >
          <Heart className="h-4.5 w-4.5" fill={isFavorite ? 'currentColor' : 'none'} aria-hidden="true" />
        </button>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-3">
          <h3 className="min-w-0 truncate text-base font-semibold tracking-[-0.01em] text-ink">
            {listing.title}
          </h3>
          <span className="shrink-0 font-display text-lg font-semibold text-brand">
            {listing.price}
          </span>
        </div>

        <div className="mt-4 flex items-center gap-2.5 border-t border-line pt-4">
          <img className="h-8 w-8 shrink-0 rounded-full object-cover" src={listing.avatar} alt="" />
          <span className="flex min-w-0 flex-1 items-center gap-1 truncate text-sm font-medium text-ink">
            <span className="truncate">{listing.seller}</span>
            <BadgeCheck className="h-4 w-4 shrink-0 text-brand" aria-hidden="true" />
          </span>
          <span className="flex max-w-[46%] shrink-0 items-center gap-1 rounded-full bg-paper-warm px-2.5 py-1 text-xs font-medium text-ink-soft">
            <LocationIcon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            <span className="truncate">{listing.location}</span>
          </span>
        </div>
      </div>
    </article>
  )
}

export default function FeaturedListings() {
  const [favorites, setFavorites] = useState(new Set())

  const toggleFavorite = (listingId) => {
    setFavorites((current) => {
      const next = new Set(current)
      if (next.has(listingId)) {
        next.delete(listingId)
      } else {
        next.add(listingId)
      }
      return next
    })
  }

  return (
    <section
      id="featured-listings"
      className="border-y border-line bg-paper-warm"
      aria-labelledby="featured-title"
    >
      <div className="mx-auto max-w-container-max px-4 py-16 sm:px-6 lg:py-20">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow">Handpicked for you</p>
            <h2
              id="featured-title"
              className="mt-2 font-display text-3xl font-semibold tracking-[-0.01em] text-ink sm:text-4xl"
            >
              Featured listings
            </h2>
          </div>
          <Link
            className="focus-ring group flex shrink-0 items-center gap-1.5 rounded-full border border-line bg-white px-5 py-2.5 text-sm font-semibold text-ink transition hover:border-brand/40 hover:text-brand"
            to="/listings"
          >
            View all listings
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {listings.map((listing) => (
            <ListingCard
              key={listing.id}
              listing={listing}
              isFavorite={favorites.has(listing.id)}
              onFavorite={toggleFavorite}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
