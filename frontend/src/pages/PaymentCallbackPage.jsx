import { CheckCircle2, LoaderCircle, XCircle } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { apiRequest } from '../services/api'

export default function PaymentCallbackPage() {
  const { token } = useAuth()
  const [searchParams] = useSearchParams()
  const started = useRef(false)
  const [state, setState] = useState({ status: 'loading', message: 'Verifying your Khalti payment…' })

  useEffect(() => {
    if (started.current) return
    started.current = true

    const pidx = searchParams.get('pidx')
    const callbackOrderId = searchParams.get('purchase_order_id')
    let storedPayment = null

    try {
      storedPayment = JSON.parse(sessionStorage.getItem('bazaarsathi_pending_payment'))
    } catch {
      storedPayment = null
    }

    const orderId = callbackOrderId || storedPayment?.orderId

    if (!pidx || !orderId) {
      setState({ status: 'error', message: 'Khalti did not return the payment identifiers required for verification.' })
      return
    }

    apiRequest('/api/orders/khalti-verify', {
      method: 'POST',
      token,
      body: { orderId, pidx },
    })
      .then((response) => {
        sessionStorage.removeItem('bazaarsathi_pending_payment')
        setState({ status: 'success', message: response.message })
      })
      .catch((requestError) => {
        setState({ status: 'error', message: requestError.message })
      })
  }, [searchParams, token])

  const Icon = state.status === 'loading' ? LoaderCircle : state.status === 'success' ? CheckCircle2 : XCircle
  const iconColor = state.status === 'success' ? 'text-primary' : state.status === 'error' ? 'text-red-600' : 'text-primary-container'

  return (
    <main className="flex min-h-screen items-center justify-center bg-surface px-5">
      <section className="w-full max-w-xl rounded-2xl bg-white p-10 text-center shadow-ambient">
        <Icon className={`mx-auto h-16 w-16 ${iconColor} ${state.status === 'loading' ? 'animate-spin' : ''}`} />
        <h1 className="mt-6 text-3xl font-bold">{state.status === 'loading' ? 'Checking payment' : state.status === 'success' ? 'Payment verified' : 'Payment not verified'}</h1>
        <p className="mt-4 text-on-surface-variant">{state.message}</p>
        {state.status !== 'loading' && (
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            {state.status === 'success' && <Link className="inline-flex rounded-lg bg-primary px-6 py-3 font-bold text-white" to="/account">View my purchase</Link>}
            <Link className="inline-flex rounded-lg border border-outline-variant bg-white px-6 py-3 font-bold" to="/listings">Return to marketplace</Link>
          </div>
        )}
      </section>
    </main>
  )
}
