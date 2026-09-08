import { Heart } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { apiRequest } from '../services/api'

export default function FavoriteButton({ listingId, className = '', iconClassName = 'h-6 w-6' }) {
  const { token, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [favorite, setFavorite] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    if (!isAuthenticated || !listingId) {
      setFavorite(false)
      return () => { active = false }
    }

    apiRequest(`/api/activity/favorites/${listingId}`, { token })
      .then((response) => { if (active) setFavorite(response.data.isFavorite) })
      .catch((requestError) => { if (active) setError(requestError.message) })
    return () => { active = false }
  }, [isAuthenticated, listingId, token])

  const toggle = async () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: location } })
      return
    }

    setBusy(true); setError('')
    const nextValue = !favorite
    setFavorite(nextValue)
    try {
      await apiRequest(nextValue ? '/api/activity/favorites' : `/api/activity/favorites/${listingId}`, {
        method: nextValue ? 'POST' : 'DELETE',
        token,
        ...(nextValue ? { body: { listingId } } : {}),
      })
    } catch (requestError) {
      setFavorite(!nextValue)
      setError(requestError.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <button
      className={className}
      type="button"
      onClick={toggle}
      disabled={busy}
      aria-label={favorite ? 'Remove from favorites' : 'Add to favorites'}
      title={error || (favorite ? 'Remove from favorites' : 'Add to favorites')}
    >
      <Heart className={iconClassName} fill={favorite ? '#a43a3a' : 'none'} color={favorite ? '#a43a3a' : 'currentColor'} />
    </button>
  )
}
