import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import AuthLayout, { AuthField } from '../components/AuthLayout'
import { useAuth } from '../context/AuthContext'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setLoading(true)

    const form = new FormData(event.currentTarget)

    try {
      const user = await login({
        email: form.get('email'),
        password: form.get('password'),
        remember: form.get('remember') === 'on',
      })
      const requestedPath = location.state?.from?.pathname
      const fallbackPath = user.role === 'admin' ? '/admin' : '/account'
      navigate(requestedPath || fallbackPath, { replace: true })
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout mode="login">
      <h1 className="text-4xl font-extrabold tracking-[-0.03em] text-on-surface sm:text-5xl">
        Welcome back
      </h1>
      <p className="mt-4 text-lg text-on-surface-variant sm:text-xl">
        Login to manage your listings and messages
      </p>
      <form className="mt-10 space-y-6" onSubmit={handleSubmit}>
        <AuthField
          label="Email address"
          name="email"
          type="email"
          placeholder="you@example.com"
          autoComplete="email"
        />
        <div>
          <div className="mb-2 flex items-center justify-between">
            <label className="text-sm font-semibold text-on-surface" htmlFor="login-password">Password</label>
            <button className="text-sm font-semibold text-primary hover:underline" type="button">
              Forgot password?
            </button>
          </div>
          <input
            id="login-password"
            className="focus-ring h-14 w-full rounded-lg border border-outline-variant bg-white px-4 text-on-surface shadow-sm"
            name="password"
            type="password"
            placeholder="••••••••"
            autoComplete="current-password"
            required
          />
        </div>
        <label className="flex items-center gap-3 text-on-surface-variant">
          <input className="h-5 w-5 rounded border-outline-variant text-primary focus:ring-primary" name="remember" type="checkbox" />
          Remember me
        </label>
        <button className="focus-ring h-14 w-full rounded-lg bg-primary px-6 font-bold text-white shadow-md transition hover:bg-[#005c3e] disabled:cursor-not-allowed disabled:opacity-60" type="submit" disabled={loading}>
          {loading ? 'Logging in…' : 'Login'}
        </button>
        {error && (
          <p className="rounded-lg bg-red-50 p-3 text-center text-sm font-medium text-red-700" role="alert">
            {error}
          </p>
        )}
      </form>
      <div className="my-8 flex items-center gap-4 text-sm text-on-surface-variant">
        <span className="h-px flex-1 bg-outline-variant" />
        Or continue with
        <span className="h-px flex-1 bg-outline-variant" />
      </div>
      <button className="focus-ring h-14 w-full rounded-lg border border-outline-variant bg-white font-semibold text-on-surface shadow-sm hover:bg-surface" type="button">
        <span className="mr-2 font-bold text-[#4285f4]">G</span>
        Continue with Google
      </button>
    </AuthLayout>
  )
}
