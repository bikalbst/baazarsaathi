import { Box, MessageCircle, Plus, RefreshCw, ShoppingBag, Store } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Footer from '../components/Footer'
import Header from '../components/Header'
import { useAuth } from '../context/AuthContext'
import { useChat } from '../context/ChatContext'
import { apiRequest } from '../services/api'

const money = (value) => new Intl.NumberFormat('en-NP', { style: 'currency', currency: 'NPR', maximumFractionDigits: 2 }).format(value || 0)
const dateTime = (value) => value ? new Date(value).toLocaleString() : 'Not completed'

function Status({ children, tone = 'neutral' }) {
  const tones = { paid: 'bg-emerald-100 text-emerald-800', active: 'bg-emerald-100 text-emerald-800', sold: 'bg-blue-100 text-blue-800', completed: 'bg-blue-100 text-blue-800', failed: 'bg-red-100 text-red-800', cancelled: 'bg-red-100 text-red-800', neutral: 'bg-surface-container-high text-on-surface-variant' }
  return <span className={`rounded-full px-2.5 py-1 text-xs font-bold capitalize ${tones[tone] || tones.neutral}`}>{children}</span>
}

function OrderCard({ order, mode }) {
  const party = mode === 'purchase' ? order.seller : order.buyer
  const paymentStatus = order.paymentStatus || (order.paymentVerified ? 'paid' : 'initiated')
  return (
    <article className="rounded-xl border border-outline-variant bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3"><div><h3 className="font-bold">{order.listing?.title || 'Deleted listing'}</h3><p className="mt-1 text-sm text-on-surface-variant">{mode === 'purchase' ? 'Seller' : 'Buyer'}: {party?.name || party?.email || 'Marketplace user'}</p></div><div className="flex gap-2"><Status tone={paymentStatus}>{paymentStatus}</Status><Status tone={order.status}>{order.status}</Status></div></div>
      <dl className="mt-4 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4"><div><dt className="text-on-surface-variant">Quantity</dt><dd className="font-semibold">{order.quantity || 1}</dd></div><div><dt className="text-on-surface-variant">Purchase price</dt><dd className="font-semibold">{money(order.price || order.amount)}</dd></div><div><dt className="text-on-surface-variant">Purchased</dt><dd className="font-semibold">{dateTime(order.paidAt || order.createdAt)}</dd></div><div><dt className="text-on-surface-variant">Payment reference</dt><dd className="truncate font-mono text-xs" title={order.paymentTransactionId || order.paymentId}>{order.paymentTransactionId || order.paymentId || 'Pending'}</dd></div></dl>
    </article>
  )
}

export default function AccountPage() {
  const { token, user } = useAuth()
  const { openInbox } = useChat()
  const [tab, setTab] = useState('listings')
  const [listings, setListings] = useState([])
  const [orders, setOrders] = useState({ purchases: [], sales: [] })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadAccount = useCallback(async () => {
    setLoading(true); setError('')
    try {
      const [listingResponse, orderResponse] = await Promise.all([
        apiRequest('/api/listings/mine', { token }),
        apiRequest('/api/orders', { token }),
      ])
      setListings(listingResponse.data)
      setOrders(orderResponse.data)
    } catch (requestError) { setError(requestError.message) } finally { setLoading(false) }
  }, [token])

  useEffect(() => { loadAccount() }, [loadAccount])

  const tabs = [
    { id: 'listings', label: `My listings (${listings.length})`, icon: Store },
    { id: 'purchases', label: `Purchases (${orders.purchases.length})`, icon: ShoppingBag },
    { id: 'sales', label: `Sales (${orders.sales.length})`, icon: Box },
  ]

  return (
    <div className="min-h-screen bg-surface"><Header /><main className="mx-auto max-w-container-max px-4 py-10 sm:px-6"><div className="flex flex-wrap items-end justify-between gap-5"><div><p className="font-semibold text-primary">My account</p><h1 className="mt-1 text-4xl font-extrabold tracking-tight">Welcome, {user.name}</h1><p className="mt-2 text-on-surface-variant">Buy, sell, track orders, and chat from one place.</p></div><div className="flex gap-2"><button className="focus-ring flex items-center gap-2 rounded-lg border border-outline-variant bg-white px-4 py-3 font-semibold" type="button" onClick={openInbox}><MessageCircle className="h-5 w-5" />Messages</button><Link className="focus-ring flex items-center gap-2 rounded-lg bg-primary px-4 py-3 font-semibold text-white" to="/post-item"><Plus className="h-5 w-5" />Post item</Link></div></div>
      <section className="mt-8 grid gap-4 sm:grid-cols-3"><div className="rounded-xl bg-white p-5 shadow-sm"><div className="text-sm text-on-surface-variant">Listings</div><div className="mt-1 text-3xl font-extrabold">{listings.length}</div></div><div className="rounded-xl bg-white p-5 shadow-sm"><div className="text-sm text-on-surface-variant">Purchases</div><div className="mt-1 text-3xl font-extrabold">{orders.purchases.length}</div></div><div className="rounded-xl bg-white p-5 shadow-sm"><div className="text-sm text-on-surface-variant">Sales</div><div className="mt-1 text-3xl font-extrabold">{orders.sales.length}</div></div></section>
      <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-b border-outline-variant"><div className="flex gap-1 overflow-x-auto">{tabs.map(({ id, label, icon: Icon }) => <button className={`flex items-center gap-2 border-b-2 px-4 py-3 font-semibold ${tab === id ? 'border-primary text-primary' : 'border-transparent text-on-surface-variant'}`} key={id} type="button" onClick={() => setTab(id)}><Icon className="h-4 w-4" />{label}</button>)}</div><button className="mb-2 flex items-center gap-2 px-3 py-2 text-sm font-semibold text-on-surface-variant" type="button" onClick={loadAccount}><RefreshCw className="h-4 w-4" />Refresh</button></div>
      {error && <p className="mt-5 rounded-lg bg-red-50 p-4 text-red-700">{error}</p>}
      {loading ? <div className="py-16 text-center font-semibold">Loading account activity…</div> : <section className="mt-6 space-y-4">{tab === 'listings' && (listings.length ? listings.map((listing) => <article className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-outline-variant bg-white p-4 shadow-sm" key={listing._id}><div className="flex min-w-0 items-center gap-4"><img className="h-16 w-20 rounded-lg object-cover" src={listing.images?.[0] || '/assets/stitch/product-detail-0.jpg'} alt="" /><div className="min-w-0"><Link className="truncate font-bold hover:text-primary" to={`/listings/${listing._id}`}>{listing.title}</Link><p className="mt-1 text-sm text-on-surface-variant">{money(listing.price)} · {listing.views} views</p></div></div><Status tone={listing.status}>{listing.status}</Status></article>) : <Empty text="You have not posted an item yet." />)}{tab === 'purchases' && (orders.purchases.length ? orders.purchases.map((order) => <OrderCard key={order._id} order={order} mode="purchase" />) : <Empty text="You have not purchased an item yet." />)}{tab === 'sales' && (orders.sales.length ? orders.sales.map((order) => <OrderCard key={order._id} order={order} mode="sale" />) : <Empty text="No one has purchased your listings yet." />)}</section>}
      </main><Footer /></div>
  )
}

function Empty({ text }) { return <div className="rounded-xl border border-dashed border-outline-variant bg-white py-14 text-center text-on-surface-variant">{text}</div> }
