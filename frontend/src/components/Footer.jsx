import { Link } from 'react-router-dom'
import Brand from './Brand'

const footerGroups = [
  {
    title: 'Marketplace',
    links: [
      { label: 'Browse listings', to: '/listings' },
      { label: 'Post an item', to: '/post-item' },
      { label: 'How escrow works', to: '/' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About', to: '/' },
      { label: 'Careers', to: '/' },
      { label: 'Contact', to: '/' },
    ],
  },
  {
    title: 'Support',
    links: [
      { label: 'Help Center', to: '/' },
      { label: 'Safety guidelines', to: '/' },
      { label: 'Terms & Privacy', to: '/' },
    ],
  },
]

export default function Footer() {
  return (
    <footer className="bg-ink text-paper/70">
      <div className="mx-auto max-w-container-max px-4 py-14 sm:px-6">
        <div className="flex flex-col justify-between gap-12 md:flex-row">
          <div className="max-w-sm">
            <Brand light />
            <p className="mt-5 text-sm leading-6 text-paper/60">
              The trusted marketplace for buying and selling within your
              community — secure escrow, verified members, and local pickup
              across Nepal.
            </p>
          </div>

          <nav className="grid w-full max-w-xl grid-cols-2 gap-10 sm:grid-cols-3" aria-label="Footer">
            {footerGroups.map((group) => (
              <div key={group.title}>
                <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-paper/90">
                  {group.title}
                </h2>
                <ul className="mt-4 space-y-3">
                  {group.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        className="focus-ring rounded-sm text-sm text-paper/55 transition hover:text-paper"
                        to={link.to}
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-white/10 pt-6 text-xs text-paper/45 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} BazaarSathi. All rights reserved.</p>
          <p>Made with care in Kathmandu, Nepal.</p>
        </div>
      </div>
    </footer>
  )
}
