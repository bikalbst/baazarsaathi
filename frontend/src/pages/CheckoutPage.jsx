import { ArrowLeft, CreditCard, LockKeyhole, ShieldCheck, Store, WalletCards } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import Footer from '../components/Footer'
import { useAuth } from '../context/AuthContext'
import { apiRequest } from '../services/api'

const formatNpr = (value) => new Intl.NumberFormat('en-NP', {
  style: 'currency',
  currency: 'NPR',
  maximumFractionDigits: 2,
}).format(value)

export default function CheckoutPage() {
  const { listingId } = useParams()
  const { token } = useAuth()
  const [listing, setListing] = useState(null)
  const [method, setMethod] = useState('khalti_wallet')
  const [agreed, setAgreed] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    let active = true

    apiRequest(`/api/listings/${listingId}`)
      .then((response) => {
        if (active) setListing(response.data)
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
  }, [listingId])

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')

    if (!agreed) {
      setError('Please agree to the terms before payment.')
      return
    }

    setSubmitting(true)

    try {
      const response = await apiRequest('/api/orders/create', {
        method: 'POST',
        token,
        body: { listingId, paymentMethod: method },
      })
      const { order, payment } = response.data
      sessionStorage.setItem('bazaarsathi_pending_payment', JSON.stringify({
        orderId: order._id,
        pidx: payment.pidx,
      }))
      window.location.assign(payment.paymentUrl)
    } catch (requestError) {
      setError(requestError.message)
      setSubmitting(false)
    }
  }

  if (loading) {
    return <main className="flex min-h-screen items-center justify-center bg-surface text-lg font-semibold">Loading checkout…</main>
  }

  if (!listing) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-5 bg-surface px-5 text-center">
        <h1 className="text-3xl font-bold">Checkout unavailable</h1>
        <p className="text-red-700">{error || 'Listing not found'}</p>
        <Link className="font-semibold text-primary hover:underline" to="/listings">Return to listings</Link>
      </main>
    )
  }

  const image = listing.images?.[0] || '/assets/stitch/checkout-0.jpg'

  return (
    <div className="flex min-h-screen flex-col bg-surface">
      <main className="mx-auto w-full max-w-[1440px] flex-1 px-4 py-10 sm:px-7">
        <Link className="inline-flex items-center gap-2 font-semibold text-on-surface-variant hover:text-primary" to={`/listings/${listing._id}`}>
          <ArrowLeft className="h-5 w-5" />Back to Details
        </Link>
        <h1 className="mt-8 text-4xl font-extrabold tracking-[-0.03em] sm:text-5xl">Secure Checkout</h1>
        <form className="mt-10 grid gap-8 lg:grid-cols-[1.25fr_.9fr]" onSubmit={handleSubmit}>
          <section className="rounded-2xl bg-white p-6 shadow-ambient sm:p-9">
            <h2 className="border-b border-surface-variant pb-5 text-2xl font-bold">Order Summary</h2>
            <div className="mt-7 grid gap-6 sm:grid-cols-[220px_1fr]">
              <img className="aspect-square w-full rounded-xl object-cover" src={image} alt={listing.title} />
              <div>
                <h3 className="text-xl font-bold">{listing.title}</h3>
                <p className="mt-2 flex items-center gap-2 text-on-surface-variant">
                  <Store className="h-5 w-5 text-primary" />Seller: {listing.seller?.name || 'BazaarSathi seller'}
                </p>
                <div className="mt-7 rounded-xl bg-surface-container p-5">
                  <div className="flex justify-between"><span>Item price</span><span>{formatNpr(listing.price)}</span></div>
                  <div className="mt-3 flex justify-between"><span>Buyer payment fee</span><span>{formatNpr(0)}</span></div>
                  <div className="mt-4 flex justify-between border-t border-outline-variant pt-4 text-2xl font-bold">
                    <span>Total Amount</span><span className="text-primary">{formatNpr(listing.price)}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-8 flex gap-4 rounded-xl bg-surface-container p-5 font-semibold text-on-surface-variant">
              <ShieldCheck className="h-7 w-7 shrink-0 text-primary" />
              BazaarSathi verifies the payment before the escrow can be released to the seller.
            </div>
          </section>
          <section className="rounded-2xl border border-surface-variant bg-white p-6 shadow-ambient sm:p-9">
            <h2 className="border-b border-surface-variant pb-5 text-2xl font-bold">Payment Method</h2>
            <div className="mt-7 space-y-4">
              <label className={`flex cursor-pointer items-center gap-4 rounded-xl border p-5 ${method === 'khalti_wallet' ? 'border-primary bg-surface-container' : 'border-surface-variant'}`}>
                <input className="h-5 w-5 text-primary focus:ring-primary" type="radio" name="payment" value="khalti_wallet" checked={method === 'khalti_wallet'} onChange={() => setMethod('khalti_wallet')} />
                <WalletCards className="h-7 w-7 text-[#5c2d91]" />
                <span className="flex-1 text-lg font-bold">Khalti Wallet</span>
                <span className="rounded-md bg-[#5c2d91] px-4 py-2 text-xs font-bold text-white">KHALTI</span>
              </label>
              <label className={`flex cursor-pointer items-center gap-4 rounded-xl border p-5 ${method === 'card' ? 'border-primary bg-surface-container' : 'border-surface-variant'}`}>
                <input className="h-5 w-5 text-primary focus:ring-primary" type="radio" name="payment" value="card" checked={method === 'card'} onChange={() => setMethod('card')} />
                <CreditCard className="h-7 w-7 text-primary" />
                <span className="flex-1 text-lg font-bold">Debit/Credit Card</span>
                <span className="rounded-md bg-primary px-3 py-2 text-xs font-bold text-white">VISA / SCT</span>
              </label>
            </div>
            {method === 'card' && (
              <p className="mt-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-900">
                Card details are entered securely on Khalti’s hosted checkout. Card payments are available for enabled live merchants, not in Khalti sandbox.
              </p>
            )}
            <label className="mt-12 flex items-start gap-3 font-medium text-on-surface-variant">
              <input className="mt-1 h-5 w-5 rounded border-outline-variant text-primary focus:ring-primary" type="checkbox" checked={agreed} onChange={(event) => setAgreed(event.target.checked)} />
              <span>I agree to the <span className="font-semibold text-primary">Terms of Service</span> and <span className="font-semibold text-primary">Refund Policy</span>.</span>
            </label>
            <button className="mt-7 flex h-14 w-full items-center justify-center gap-3 rounded-lg bg-primary-container font-bold text-white shadow-md hover:bg-primary disabled:cursor-not-allowed disabled:opacity-60" type="submit" disabled={submitting || listing.status !== 'active'}>
              <LockKeyhole className="h-5 w-5" />{submitting ? 'Opening Khalti…' : 'Continue to secure payment'}
            </button>
            {error && <p className="mt-4 rounded-lg bg-red-50 p-3 text-center text-sm font-medium text-red-700" role="alert">{error}</p>}
          </section>
        </form>
      </main>
      <Footer />
    </div>
  )
}
