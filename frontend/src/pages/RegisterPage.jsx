import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AuthLayout, { AuthField } from '../components/AuthLayout'
import { useAuth } from '../context/AuthContext'

export default function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    const form = new FormData(event.currentTarget)
    const password = form.get('password')

    if (password !== form.get('confirmPassword')) {
      setError('Passwords do not match')
      return
    }

    setLoading(true)

    try {
      await register({
        name: form.get('name'),
        email: form.get('email'),
        password,
      })
      navigate('/account', { replace: true })
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout mode="register">
      <h1 className="text-4xl font-extrabold tracking-[-0.03em] text-on-surface sm:text-5xl">
        Join our community
      </h1>
      <p className="mt-4 text-lg text-on-surface-variant sm:text-xl">
        Start buying and selling locally today
      </p>
      <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
        <AuthField label="Full Name" name="name" placeholder="e.g. Ram Bahadur" autoComplete="name" />
        <AuthField label="Email address" name="email" type="email" placeholder="you@example.com" autoComplete="email" />
        <AuthField label="Password" name="password" type="password" placeholder="••••••••" autoComplete="new-password" />
        <AuthField label="Confirm Password" name="confirmPassword" type="password" placeholder="••••••••" autoComplete="new-password" />
        <button className="focus-ring h-14 w-full rounded-lg bg-primary px-6 font-bold text-white shadow-md transition hover:bg-[#005c3e] disabled:cursor-not-allowed disabled:opacity-60" type="submit" disabled={loading}>
          {loading ? 'Creating account…' : 'Create Account'}
        </button>
        {error && (
          <p className="rounded-lg bg-red-50 p-3 text-center text-sm font-medium text-red-700" role="alert">
            {error}
          </p>
        )}
      </form>
      <div className="my-7 flex items-center gap-4 text-sm text-on-surface-variant">
        <span className="h-px flex-1 bg-outline-variant" />
        OR
        <span className="h-px flex-1 bg-outline-variant" />
      </div>
      <button className="focus-ring h-14 w-full rounded-lg border border-outline-variant bg-white font-semibold text-on-surface shadow-sm hover:bg-surface" type="button">
        <span className="mr-2 font-bold text-[#4285f4]">G</span>
        Continue with Google
      </button>
    </AuthLayout>
  )
}
