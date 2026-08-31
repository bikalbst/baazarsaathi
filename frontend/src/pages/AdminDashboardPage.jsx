import { CheckCircle2, LayoutDashboard, List, LogOut, RefreshCw, Settings, ShoppingBag, Store, Users, WalletCards } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { apiRequest } from '../services/api'

const money = (value) => new Intl.NumberFormat('en-NP', {
  style: 'currency', currency: 'NPR', maximumFractionDigits: 2,
}).format(value || 0)

const idOf = (value) => String(value?._id || value?.id || value || '')

export default function AdminDashboardPage() {
  const { token, user, logout } = useAuth()
  const navigate = useNavigate()
  const [view, setView] = useState('overview')
  const [overview, setOverview] = useState({ stats: {}, orders: [] })
  const [autoAccept, setAutoAccept] = useState(false)
  const [loading, setLoading] = useState(true)
  const [savingSetting, setSavingSetting] = useState(false)
  const [approvingId, setApprovingId] = useState('')
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  const loadDashboard = useCallback(async () => {
    setLoading(true); setError('')
    try {
      const [overviewResponse, settingResponse] = await Promise.all([
        apiRequest('/api/orders/admin/overview', { token }),
        apiRequest('/api/orders/settings/auto-accept', { token }),
      ])
      setOverview(overviewResponse.data)
      setAutoAccept(settingResponse.data.autoAccept)
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => { loadDashboard() }, [loadDashboard])

  const updateAutoAccept = async (enabled) => {
    setSavingSetting(true); setError(''); setNotice('')
    try {
      const response = await apiRequest('/api/orders/settings/auto-accept', {
        method: 'PUT', token, body: { autoAccept: enabled },
      })
      setAutoAccept(response.data.autoAccept)
      setNotice(response.message)
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setSavingSetting(false)
    }
  }

  const approve = async (orderId) => {
    setApprovingId(orderId); setError(''); setNotice('')
    try {
      const response = await apiRequest(`/api/orders/${orderId}/approve`, { method: 'PUT', token })
      setNotice(response.message)
      await loadDashboard()
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setApprovingId('')
    }
  }

  const stats = overview.stats || {}
  const pendingOrders = overview.orders.filter((order) => order.paymentVerified && order.status === 'pending')
  const displayedOrders = view === 'approvals' ? pendingOrders : overview.orders

  const nav = [
    ['overview', 'Overview', LayoutDashboard],
    ['orders', 'All orders', ShoppingBag],
    ['approvals', `Approvals (${pendingOrders.length})`, CheckCircle2],
    ['settings', 'Escrow settings', Settings],
  ]

  return (
    <div className="min-h-screen bg-[#eef2ff] lg:grid lg:grid-cols-[270px_1fr]">
      <aside className="bg-[#24313d] text-white lg:sticky lg:top-0 lg:flex lg:h-screen lg:flex-col">
        <Link className="block border-b border-white/10 px-6 py-6 text-2xl font-extrabold" to="/">BazaarSathi <span className="text-primary-fixed">Admin</span></Link>
        <nav className="grid grid-cols-2 gap-2 p-4 sm:grid-cols-4 lg:grid-cols-1">
          {nav.map(([id, label, Icon]) => <button className={`flex items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-semibold ${view === id ? 'bg-primary text-white' : 'text-white/70 hover:bg-white/10'}`} key={id} type="button" onClick={() => setView(id)}><Icon className="h-5 w-5" />{label}</button>)}
        </nav>
        <div className="mt-auto border-t border-white/10 p-5">
          <p className="font-bold">{user.name}</p><p className="truncate text-sm text-white/55">{user.email}</p>
          <button className="mt-4 flex items-center gap-2 text-sm font-semibold text-white/75 hover:text-white" type="button" onClick={() => { logout(); navigate('/login') }}><LogOut className="h-4 w-4" />Logout</button>
        </div>
      </aside>

      <section className="min-w-0">
        <header className="flex flex-wrap items-center justify-between gap-4 bg-white px-5 py-5 shadow-sm sm:px-8"><div><p className="text-sm font-semibold uppercase tracking-wider text-primary">Administrator workspace</p><h1 className="text-3xl font-extrabold">{nav.find(([id]) => id === view)?.[1]}</h1></div><div className="flex gap-2"><Link className="rounded-lg border border-outline-variant px-4 py-2 font-semibold" to="/listings">View marketplace</Link><button className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 font-semibold text-white" type="button" onClick={loadDashboard}><RefreshCw className="h-4 w-4" />Refresh</button></div></header>
        <main className="p-5 sm:p-8">
          {error && <p className="mb-5 rounded-lg bg-red-50 p-4 font-medium text-red-700" role="alert">{error}</p>}
          {notice && <p className="mb-5 rounded-lg bg-emerald-50 p-4 font-medium text-emerald-800">{notice}</p>}
          {loading ? <div className="py-20 text-center font-semibold">Loading live marketplace data…</div> : <>
            {view === 'overview' && <Overview stats={stats} pendingOrders={pendingOrders} onApprove={approve} approvingId={approvingId} />}
            {(view === 'orders' || view === 'approvals') && <OrdersTable orders={displayedOrders} onApprove={approve} approvingId={approvingId} emptyText={view === 'approvals' ? 'No verified payments are awaiting approval.' : 'No orders found.'} />}
            {view === 'settings' && <SettingsPanel autoAccept={autoAccept} saving={savingSetting} onChange={updateAutoAccept} />}
          </>}
        </main>
      </section>
    </div>
  )
}

function Overview({ stats, pendingOrders, onApprove, approvingId }) {
  const cards = [
    ['Total users', stats.totalUsers, Users],
    ['Active listings', stats.activeListings, List],
    ['Paid orders', stats.paidOrders, Store],
    ['Commission earned', money(stats.commissionEarned), WalletCards],
  ]
  return <><section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">{cards.map(([label, value, Icon]) => <article className="rounded-xl bg-white p-6 shadow-sm" key={label}><div className="flex justify-between text-on-surface-variant"><h2 className="font-bold">{label}</h2><Icon className="h-6 w-6 text-primary" /></div><p className="mt-5 text-3xl font-extrabold">{value ?? 0}</p></article>)}</section><section className="mt-7 grid gap-5 md:grid-cols-3"><article className="rounded-xl bg-primary p-6 text-white"><p className="text-sm text-white/70">Verified volume</p><p className="mt-2 text-2xl font-extrabold">{money(stats.totalVolume)}</p></article><article className="rounded-xl bg-white p-6"><p className="text-sm text-on-surface-variant">Sold listings</p><p className="mt-2 text-2xl font-extrabold">{stats.soldListings || 0}</p></article><article className="rounded-xl bg-white p-6"><p className="text-sm text-on-surface-variant">Awaiting approval</p><p className="mt-2 text-2xl font-extrabold text-secondary">{stats.pendingApprovals || 0}</p></article></section><div className="mt-8"><h2 className="mb-4 text-2xl font-bold">Payments awaiting escrow release</h2><OrdersTable orders={pendingOrders} onApprove={onApprove} approvingId={approvingId} emptyText="No verified payments are awaiting approval." /></div></>
}

function OrdersTable({ orders, onApprove, approvingId, emptyText }) {
  if (!orders.length) return <div className="rounded-xl border border-dashed border-outline-variant bg-white py-14 text-center text-on-surface-variant">{emptyText}</div>
  return <div className="overflow-x-auto rounded-xl bg-white shadow-sm"><table className="w-full min-w-[1000px] text-left text-sm"><thead className="bg-[#e6ebfb] text-xs uppercase tracking-wider text-on-surface-variant"><tr><th className="px-5 py-4">Item</th><th>Buyer</th><th>Seller</th><th>Amount</th><th>Commission</th><th>Payment</th><th>Order</th><th>Action</th></tr></thead><tbody className="divide-y divide-outline-variant">{orders.map((order) => { const canApprove = order.paymentVerified && order.status === 'pending'; return <tr key={idOf(order)}><td className="px-5 py-4 font-bold">{order.listing?.title || 'Deleted listing'}<div className="mt-1 font-mono text-[10px] font-normal text-on-surface-variant">{order.paymentTransactionId || order.paymentId || idOf(order)}</div></td><td>{order.buyer?.name || 'Unknown'}<div className="text-xs text-on-surface-variant">{order.buyer?.email}</div></td><td>{order.seller?.name || 'Unknown'}<div className="text-xs text-on-surface-variant">{order.seller?.email}</div></td><td className="font-semibold">{money(order.amount)}</td><td>{money(order.commission)}</td><td><Badge value={order.paymentStatus || (order.paymentVerified ? 'paid' : 'initiated')} /></td><td><Badge value={order.status} /></td><td>{canApprove ? <button className="rounded-lg bg-primary px-4 py-2 font-bold text-white disabled:opacity-50" type="button" disabled={approvingId === idOf(order)} onClick={() => onApprove(idOf(order))}>{approvingId === idOf(order) ? 'Approving…' : 'Approve & release'}</button> : <span className="text-on-surface-variant">—</span>}</td></tr>})}</tbody></table></div>
}

function Badge({ value }) {
  const good = ['paid', 'completed'].includes(value)
  const bad = ['failed', 'cancelled', 'refunded'].includes(value)
  return <span className={`rounded-full px-2.5 py-1 text-xs font-bold capitalize ${good ? 'bg-emerald-100 text-emerald-800' : bad ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-900'}`}>{value}</span>
}

function SettingsPanel({ autoAccept, saving, onChange }) {
  return <section className="max-w-3xl rounded-2xl bg-white p-7 shadow-sm"><h2 className="text-2xl font-bold">Escrow release policy</h2><p className="mt-2 leading-7 text-on-surface-variant">When automatic approval is enabled, every payment confirmed by Khalti is immediately completed and 90% is released to the seller wallet. When disabled, an administrator must approve each verified payment.</p><label className="mt-7 flex items-center justify-between gap-5 rounded-xl bg-surface p-5"><span><strong className="block">Automatic payment approval</strong><span className="mt-1 block text-sm text-on-surface-variant">Current mode: {autoAccept ? 'instant release' : 'manual admin approval'}</span></span><input className="h-6 w-6 text-primary" type="checkbox" checked={autoAccept} disabled={saving} onChange={(event) => onChange(event.target.checked)} /></label></section>
}
