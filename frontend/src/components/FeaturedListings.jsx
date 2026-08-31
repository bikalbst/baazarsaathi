import { ArrowRight, Heart, MapPin, Store } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'

const listings = [
  {
    id: 'macbook-pro',
    title: 'MacBook Pro 14"',
    price: 'NPR 140,000',
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
    <article className="group flex min-w-0 flex-col overflow-hidden rounded-xl border border-transparent bg-white shadow-ambient transition duration-300 hover:-translate-y-1 hover:border-surface-variant hover:shadow-ambient-hover">
      <div className="relative aspect-[4/3] overflow-hidden bg-surface-variant">
        <img
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          src={listing.image}
          alt={listing.imageAlt}
        />
        <button
          className={'focus-ring absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full bg-white/95 shadow-sm backdrop-blur transition ' + (isFavorite ? 'text-tertiary' : 'text-on-surface-variant hover:text-tertiary')}
          type="button"
          aria-label={(isFavorite ? 'Remove ' : 'Add ') + listing.title + (isFavorite ? ' from favorites' : ' to favorites')}
          aria-pressed={isFavorite}
          onClick={() => onFavorite(listing.id)}
        >
          <Heart className="h-5 w-5" fill={isFavorite ? 'currentColor' : 'none'} aria-hidden="true" />
        </button>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-start justify-between gap-3">
          <h3 className="min-w-0 truncate text-xl font-bold tracking-[-0.02em] text-on-surface sm:text-2xl">
            {listing.title}
          </h3>
          <span className="shrink-0 text-xl font-bold text-primary-container sm:text-2xl">
            {listing.price}
          </span>
        </div>

        <div className="mt-4 flex items-center gap-2 border-t border-surface-variant pt-4">
          <img
            className="h-8 w-8 shrink-0 rounded-full object-cover"
            src={listing.avatar}
            alt=""
          />
          <span className="min-w-0 flex-1 truncate text-sm font-semibold text-on-surface">
            {listing.seller}
          </span>
          <span className="flex max-w-[48%] shrink-0 items-center gap-1 rounded-full bg-surface-variant/60 px-2 py-1 text-xs font-medium text-on-surface-variant">
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
      className="mx-auto mb-14 max-w-container-max rounded-2xl bg-surface-container-low px-4 py-8 sm:px-6"
      aria-labelledby="featured-title"
    >
      <div className="mb-7 flex items-end justify-between gap-4">
        <h2
          id="featured-title"
          className="text-3xl font-bold tracking-[-0.02em] text-on-surface"
        >
          Featured Listings
        </h2>
        <Link
          className="focus-ring group flex shrink-0 items-center gap-1 rounded-md text-sm font-semibold text-primary hover:underline sm:text-base"
          to="/listings"
        >
          View all
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
    </section>
  )
}
