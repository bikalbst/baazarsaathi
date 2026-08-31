import { Search } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import Brand from './Brand'
import { useAuth } from '../context/AuthContext'

export default function Header() {
  const navigate = useNavigate()
  const { isAuthenticated, user, logout } = useAuth()

  const handleSearch = (event) => {
    event.preventDefault()
    navigate('/listings')
  }

  return (
    <header className="sticky top-0 z-50 border-b border-line/70 bg-paper/85 backdrop-blur-md">
      <nav
        className="mx-auto flex h-[4.25rem] max-w-container-max items-center justify-between gap-4 px-4 sm:px-6"
        aria-label="Main navigation"
      >
        <Brand />

        <div className="hidden items-center gap-8 text-sm font-medium text-ink-soft lg:flex">
          <Link className="transition-colors hover:text-brand" to="/listings">
            Browse
          </Link>
          <Link className="transition-colors hover:text-brand" to="/post-item">
            Sell
          </Link>
        </div>

        <form
          className="hidden h-11 w-full max-w-[380px] items-center rounded-full border border-line bg-white px-5 transition focus-within:border-brand/40 focus-within:shadow-ambient md:flex"
          role="search"
          onSubmit={handleSearch}
        >
          <Search className="mr-3 h-4 w-4 shrink-0 text-ink-muted" aria-hidden="true" />
          <label className="sr-only" htmlFor="header-search">
            Search marketplace items
          </label>
          <input
            id="header-search"
            className="w-full border-0 bg-transparent p-0 text-sm text-ink outline-none placeholder:text-ink-muted/70 focus:ring-0"
            placeholder="Search items, brands, sellers..."
            type="search"
          />
        </form>

        <div className="flex shrink-0 items-center gap-1 sm:gap-3">
          {isAuthenticated ? (
            <>
              <Link
                className="focus-ring rounded-lg px-3 py-2 text-sm font-medium text-ink-soft transition-colors hover:text-brand"
                to="/account"
              >
                Account<span className="hidden sm:inline"> · {user.name}</span>
              </Link>
              <button
                className="focus-ring rounded-lg px-3 py-2 text-sm font-medium text-ink-soft transition-colors hover:text-brand"
                type="button"
                onClick={() => {
                  logout()
                  navigate('/')
                }}
              >
                Logout
              </button>
            </>
          ) : (
            <Link
              className="focus-ring rounded-lg px-3 py-2 text-sm font-medium text-ink-soft transition-colors hover:text-brand"
              to="/login"
            >
              Log in
            </Link>
          )}
          <Link
            className="focus-ring rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-paper shadow-sm transition hover:-translate-y-0.5 hover:bg-brand-deep hover:shadow-md"
            to="/post-item"
          >
            Post an item
          </Link>
        </div>
      </nav>
    </header>
  )
}
