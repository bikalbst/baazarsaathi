import { ArrowLeft, Eye, MessageSquare, ShoppingCart, Star } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import Footer from '../components/Footer'
import Header from '../components/Header'
import FavoriteButton from '../components/FavoriteButton'
import { apiRequest } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { useChat } from '../context/ChatContext'

const formatNpr = (value) => new Intl.NumberFormat('en-NP', {
  style: 'currency',
  currency: 'NPR',
  maximumFractionDigits: 2,
}).format(value)

export default function ProductDetailPage() {
  const { listingId } = useParams()
  const navigate = useNavigate()
  const { isAuthenticated, token, user } = useAuth()
  const { startConversation } = useChat()
  const [listing, setListing] = useState(null)
  const [activeImage, setActiveImage] = useState('')
  const [reviews, setReviews] = useState([])
  const [reviewTotal, setReviewTotal] = useState(0)
  const [error, setError] = useState('')
  const [chatError, setChatError] = useState('')
  const [openingChat, setOpeningChat] = useState(false)

  useEffect(() => {
    let active = true
    apiRequest(`/api/listings/${listingId}`, { token })
      .then((listingResponse) => {
        if (!active) return
        setListing(listingResponse.data)
        setActiveImage(listingResponse.data.images?.[0] || '/assets/stitch/product-detail-0.jpg')
      })
      .catch((requestError) => {
        if (active) setError(requestError.message)
      })
    apiRequest(`/api/reviews/listing/${listingId}?limit=20`)
      .then((response) => {
        if (!active) return
        setReviews(response.data.reviews)
        setReviewTotal(response.data.pagination.total)
      })
      .catch(() => { if (active) { setReviews([]); setReviewTotal(0) } })
    return () => { active = false }
  }, [listingId, token])

  if (error) return <main className="flex min-h-screen flex-col items-center justify-center gap-5 bg-surface"><h1 className="text-3xl font-bold">Listing unavailable</h1><p className="text-red-700">{error}</p><Link className="text-primary" to="/listings">Browse listings</Link></main>
  if (!listing) return <main className="flex min-h-screen items-center justify-center bg-surface font-semibold">Loading listing…</main>

  const images = listing.images?.length ? listing.images : ['/assets/stitch/product-detail-0.jpg']
  const sellerId = listing.seller?._id || listing.seller
  const isOwnListing = String(sellerId) === String(user?.id || user?._id)

  const messageSeller = async () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: `/listings/${listingId}` } } })
      return
    }
    setOpeningChat(true); setChatError('')
    try { await startConversation({ participantId: sellerId, listingId: listing._id }) }
    catch (requestError) { setChatError(requestError.message) }
    finally { setOpeningChat(false) }
  }

  return (
    <div className="min-h-screen bg-surface">
      <Header />
      <main className="mx-auto max-w-container-max px-4 py-8 sm:px-6">
        <Link className="mb-7 inline-flex items-center gap-2 font-semibold text-on-surface-variant hover:text-primary" to="/listings"><ArrowLeft className="h-5 w-5" />Back to marketplace</Link>
        <section className="grid gap-10 lg:grid-cols-2">
          <div>
            <div className="aspect-[4/3] overflow-hidden rounded-xl bg-white shadow-sm"><img className="h-full w-full object-cover" src={activeImage} alt={listing.title} /></div>
            {images.length > 1 && <div className="mt-4 grid grid-cols-5 gap-3">{images.map((image, index) => <button className={`aspect-square overflow-hidden rounded-lg border-2 bg-white ${activeImage === image ? 'border-primary-container' : 'border-transparent'}`} key={image} type="button" onClick={() => setActiveImage(image)} aria-label={`Show image ${index + 1}`}><img className="h-full w-full object-cover" src={image} alt="" /></button>)}</div>}
          </div>
          <div className="flex flex-col">
            <div className="flex items-start justify-between gap-4">
              <div><h1 className="text-3xl font-extrabold tracking-[-0.03em] sm:text-4xl">{listing.title}</h1><p className="mt-4 text-3xl font-bold text-primary-container">{formatNpr(listing.price)}</p></div>
              <FavoriteButton className="rounded-full p-2 text-on-surface-variant hover:bg-white disabled:opacity-60" iconClassName="h-7 w-7" listingId={listing._id} />
            </div>
            <div className="mt-5 flex flex-wrap items-center gap-4 text-sm text-on-surface-variant"><span className="rounded-full bg-surface-container-high px-4 py-2 font-semibold capitalize text-on-surface">{listing.condition}</span><span className="capitalize">{listing.category}</span><span className="flex items-center gap-1"><Eye className="h-4 w-4" />{listing.views} views</span></div>
            <div className="mt-7"><h2 className="font-bold">Description</h2><p className="mt-3 whitespace-pre-wrap text-base leading-7 text-on-surface-variant">{listing.description}</p></div>
            <div className="mt-8 flex items-center gap-4 rounded-xl border border-surface-variant bg-white p-5 shadow-sm"><span className="flex h-14 w-14 items-center justify-center rounded-full bg-secondary-container text-xl font-bold">{listing.seller?.name?.[0] || 'S'}</span><div><div className="font-bold">{listing.seller?.name || 'BazaarSathi seller'}</div><div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-on-surface-variant"><span className="capitalize">{listing.seller?.reputation?.tier?.replace('-', ' ') || 'New'} seller</span>{listing.seller?.reputation?.ratingCount > 0 && <span className="flex items-center gap-1"><Star className="h-4 w-4 fill-amber-400 text-amber-500" />{listing.seller.reputation.averageRating} ({listing.seller.reputation.ratingCount})</span>}</div></div></div>
            <div className="mt-auto grid gap-4 pt-8 sm:grid-cols-2">
              {listing.status === 'active' ? <Link className="flex h-14 items-center justify-center gap-3 rounded-lg bg-primary-container font-bold text-white shadow-md hover:bg-primary" to={`/checkout/${listing._id}`}><ShoppingCart className="h-5 w-5" />Buy Now</Link> : <span className="flex h-14 items-center justify-center rounded-lg bg-surface-container-high font-bold capitalize">{listing.status}</span>}
              <button className="flex h-14 items-center justify-center gap-3 rounded-lg border border-outline-variant bg-white font-bold hover:bg-surface-container-low disabled:cursor-not-allowed disabled:opacity-50" type="button" onClick={messageSeller} disabled={isOwnListing || openingChat}><MessageSquare className="h-5 w-5" />{isOwnListing ? 'Your listing' : openingChat ? 'Opening chat…' : 'Message Seller'}</button>
            </div>
            {chatError && <p className="mt-3 text-sm font-medium text-red-700">{chatError}</p>}
          </div>
        </section>
        <section className="mt-12 border-t border-surface-variant pt-9">
          <div className="flex items-end justify-between gap-4"><div><p className="font-semibold text-primary">Verified buyers</p><h2 className="mt-1 text-2xl font-extrabold">Reviews for this listing</h2></div><span className="text-sm text-on-surface-variant">{reviewTotal} review{reviewTotal === 1 ? '' : 's'}</span></div>
          {reviews.length === 0 ? <p className="mt-5 rounded-xl border border-dashed border-outline-variant bg-white p-8 text-center text-on-surface-variant">No buyer reviews yet.</p> : <div className="mt-5 grid gap-4 md:grid-cols-2">{reviews.map((review) => <article className="rounded-xl border border-outline-variant bg-white p-5 shadow-sm" key={review._id}><div className="flex items-center justify-between gap-3"><span className="font-bold">{review.reviewer?.name || 'Verified buyer'}</span><span className="flex items-center gap-1 font-semibold"><Star className="h-4 w-4 fill-amber-400 text-amber-500" />{review.rating}/5</span></div><p className="mt-3 text-sm leading-6 text-on-surface-variant">{review.comment || 'Rating submitted without a written comment.'}</p><time className="mt-3 block text-xs text-on-surface-variant">{new Date(review.createdAt).toLocaleDateString()}</time></article>)}</div>}
        </section>
      </main>
      <Footer />
    </div>
  )
}
