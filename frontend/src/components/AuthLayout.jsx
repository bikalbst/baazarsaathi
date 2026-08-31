import { Link } from 'react-router-dom'
import Brand from './Brand'

export function AuthField({ label, name, type = 'text', placeholder, autoComplete }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-on-surface">{label}</span>
      <input
        className="focus-ring h-14 w-full rounded-lg border border-outline-variant bg-white px-4 text-on-surface shadow-sm placeholder:text-on-surface-variant/50"
        name={name}
        type={type}
        placeholder={placeholder}
        autoComplete={autoComplete}
        required
      />
    </label>
  )
}

export default function AuthLayout({ children, mode }) {
  return (
    <main className="min-h-screen bg-white">
      <div className="grid min-h-screen lg:grid-cols-2">
        <section className="hidden items-center justify-center bg-[#e8f3fb] p-10 lg:flex">
          <div className="h-[78vh] w-full max-w-[640px] overflow-hidden rounded-3xl bg-white shadow-ambient-hover">
            <img
              className="h-full w-full object-cover"
              src="/assets/stitch/login-0.jpg"
              alt="People buying and selling at the BazaarSathi community market"
            />
          </div>
        </section>
        <section className="relative flex items-center justify-center overflow-hidden px-5 py-12 sm:px-10">
          <div className="absolute -bottom-28 -right-28 h-64 w-64 rounded-full bg-primary-container/5" />
          <div className="relative w-full max-w-xl">
            <Brand compact />
            <div className="mt-12">{children}</div>
            <p className="mt-8 text-center text-on-surface-variant">
              {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
              <Link
                className="font-semibold text-primary hover:underline"
                to={mode === 'login' ? '/register' : '/login'}
              >
                {mode === 'login' ? 'Register' : 'Login'}
              </Link>
            </p>
          </div>
        </section>
      </div>
    </main>
  )
}
