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
    <header className="sticky top-0 z-50 border-b border-black/[0.03] bg-white shadow-sm">
      <nav
        className="mx-auto flex h-16 max-w-container-max items-center justify-between gap-4 px-4 sm:px-6"
        aria-label="Main navigation"
      >
        <Brand />

        <div className="hidden items-center gap-5 text-sm font-semibold text-on-surface-variant lg:flex">
          <Link className="transition-colors hover:text-primary" to="/listings">Browse</Link>
        </div>

        <form
          className="hidden h-11 w-full max-w-[390px] items-center rounded-full bg-surface-container-high px-5 md:flex"
          role="search"
          onSubmit={handleSearch}
        >
          <Search className="mr-3 h-5 w-5 shrink-0 text-on-surface-variant" aria-hidden="true" />
          <label className="sr-only" htmlFor="header-search">
            Search marketplace items
          </label>
          <input
            id="header-search"
            className="w-full border-0 bg-transparent p-0 text-base text-on-surface outline-none placeholder:text-on-surface-variant/70 focus:ring-0"
            placeholder="Search items..."
            type="search"
          />
        </form>

        <div className="flex shrink-0 items-center gap-2 sm:gap-4">
          {isAuthenticated ? (
            <>
              <Link className="focus-ring rounded-lg px-2 py-2 text-sm font-semibold text-on-surface-variant hover:text-primary" to="/account">Account<span className="hidden sm:inline"> · {user.name}</span></Link>
              <button
                className="focus-ring rounded-lg px-2 py-2 text-sm font-semibold text-on-surface-variant transition-colors hover:text-primary sm:text-base"
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
              className="focus-ring rounded-lg px-2 py-2 text-sm font-semibold text-on-surface-variant transition-colors hover:text-primary sm:text-base"
              to="/login"
            >
              Login
            </Link>
          )}
          <Link
            className="focus-ring rounded-lg bg-secondary-container px-4 py-2.5 text-sm font-semibold text-[#684000] transition hover:-translate-y-0.5 hover:shadow-md sm:px-6 sm:text-base"
            to="/post-item"
          >
            Post Item
          </Link>
        </div>
      </nav>
    </header>
  )
}
