import { Eye, LayoutDashboard, MessageSquare, Package, Pencil, ReceiptText, Trash2, User, WalletCards } from 'lucide-react'
import Footer from '../components/Footer'
import Header from '../components/Header'

const navItems = [
  ['Overview', LayoutDashboard], ['My Listings', Package], ['Orders', ReceiptText],
  ['Earnings', WalletCards], ['Messages', MessageSquare], ['Profile', User],
]

const rows = [
  { title: 'Vintage Canon AE-1', price: '18,500', status: 'Active', views: 142, date: 'Oct 24, 2023', image: '/assets/stitch/seller-dashboard-0.jpg' },
  { title: 'Ergonomic Desk Chair', price: '8,200', status: 'Sold', views: 89, date: 'Oct 15, 2023', image: '/assets/stitch/seller-dashboard-1.jpg' },
  { title: 'Handmade Ceramic Mugs', price: '1,200', status: 'Pending', views: 45, date: 'Oct 26, 2023', image: '/assets/stitch/seller-dashboard-2.jpg' },
]

function Metric({ title, value, detail, icon: Icon, orange = false }) {
  return (
    <article className="rounded-2xl bg-white p-7 shadow-ambient">
      <div className="flex items-center justify-between text-on-surface-variant"><h2 className="font-bold">{title}</h2><span className={'rounded-full p-2 ' + (orange ? 'bg-secondary-container/10 text-secondary-container' : 'bg-primary-container/10 text-primary-container')}><Icon className="h-5 w-5" /></span></div>
      <p className="mt-6 text-4xl font-extrabold tracking-[-0.03em]">{value}</p>
      <p className={'mt-4 text-sm font-semibold ' + (title === 'Total Earned' ? 'text-primary-container' : 'text-on-surface-variant')}>{detail}</p>
    </article>
  )
}

export default function SellerDashboardPage() {
  return (
    <div className="min-h-screen bg-surface-container">
      <Header />
      <main className="mx-auto grid min-w-0 max-w-[1440px] gap-7 px-4 py-8 sm:px-6 lg:grid-cols-[270px_1fr]">
        <aside className="min-w-0 rounded-2xl bg-white p-4 shadow-ambient lg:self-start">
          <nav className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-1">
            {navItems.map(([label, Icon], index) => (
              <button className={'flex items-center gap-3 rounded-xl px-5 py-4 text-left font-semibold ' + (index === 0 ? 'bg-surface-container text-primary' : 'text-on-surface-variant hover:bg-surface')} key={label} type="button">
                <Icon className="h-5 w-5" />{label}
              </button>
            ))}
          </nav>
        </aside>
        <section className="min-w-0">
          <h1 className="text-4xl font-extrabold tracking-[-0.03em]">Seller Dashboard</h1>
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            <Metric title="Total Earned" value="NPR 45,200" detail="+12% this month" icon={WalletCards} />
            <Metric title="Pending Payout" value="NPR 12,850" detail="Expected transfer: Tomorrow" icon={ReceiptText} orange />
            <Metric title="Active Listings" value="14" detail="3 views in last hour" icon={Package} />
          </div>
          <div className="mt-7 overflow-hidden rounded-2xl bg-white shadow-ambient">
            <div className="flex items-center justify-between border-b border-surface-variant px-6 py-5"><h2 className="text-2xl font-bold">My Listings</h2><button className="font-semibold text-primary" type="button">View All</button></div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-left">
                <thead className="bg-surface"><tr className="text-xs uppercase tracking-wider text-on-surface-variant"><th className="px-6 py-4">Item</th><th>Price (NPR)</th><th>Status</th><th>Views</th><th>Date Posted</th><th>Actions</th></tr></thead>
                <tbody className="divide-y divide-surface-variant">
                  {rows.map((row) => (
                    <tr key={row.title}>
                      <td className="px-6 py-4"><div className="flex items-center gap-4"><img className="h-14 w-14 rounded-lg object-cover" src={row.image} alt="" /><strong>{row.title}</strong></div></td>
                      <td className="font-semibold">{row.price}</td>
                      <td><span className={'rounded-full px-3 py-1 text-sm ' + (row.status === 'Active' ? 'bg-primary-container/10 text-primary' : row.status === 'Pending' ? 'bg-secondary-container/10 text-secondary' : 'bg-surface-container-high text-on-surface-variant')}>{row.status}</span></td>
                      <td>{row.views}</td><td>{row.date}</td>
                      <td><div className="flex gap-3">{row.status === 'Sold' ? <Eye className="h-5 w-5" /> : <><Pencil className="h-5 w-5" /><Trash2 className="h-5 w-5" /></>}</div></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
