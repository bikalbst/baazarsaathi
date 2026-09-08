import { ChevronDown, ImagePlus, Sparkles } from 'lucide-react'
import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Footer from '../components/Footer'
import Header from '../components/Header'
import { useAuth } from '../context/AuthContext'
import { apiRequest } from '../services/api'

function SectionTitle({ children }) {
  return <h2 className="border-b border-surface-variant pb-3 text-2xl font-bold">{children}</h2>
}

function FormInput({ label, name, placeholder, type = 'text', ...props }) {
  return (
    <label className="mt-5 block">
      <span className="mb-2 block text-sm font-semibold">{label}</span>
      <input className="focus-ring h-12 w-full rounded-lg border border-outline-variant bg-surface-container px-4 placeholder:text-on-surface-variant/60" name={name} type={type} placeholder={placeholder} required {...props} />
    </label>
  )
}

export default function PostItemPage() {
  const { token } = useAuth()
  const navigate = useNavigate()
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [prediction, setPrediction] = useState(null)
  const [predicting, setPredicting] = useState(false)
  const formRef = useRef(null)

  const estimatePrice = async () => {
    const form = new FormData(formRef.current)
    setPredicting(true); setError(''); setPrediction(null)
    try {
      const response = await apiRequest('/api/price/predict', {
        method: 'POST',
        token,
        body: {
          title: form.get('title'),
          description: form.get('description'),
          category: form.get('category'),
          condition: form.get('condition'),
        },
      })
      setPrediction(response.data)
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setPredicting(false)
    }
  }

  const useSuggestedPrice = () => {
    formRef.current.elements.price.value = prediction.predictedPrice
    formRef.current.elements.price.focus()
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setSubmitting(true)
    const form = new FormData(event.currentTarget)
    const images = form.get('images')
      .split(',')
      .map((image) => image.trim())
      .filter(Boolean)

    try {
      const response = await apiRequest('/api/listings', {
        method: 'POST',
        token,
        body: {
          title: form.get('title'),
          description: form.get('description'),
          category: form.get('category'),
          condition: form.get('condition'),
          price: Number(form.get('price')),
          images,
        },
      })
      navigate(`/listings/${response.data._id}`)
    } catch (requestError) {
      setError(requestError.message)
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-surface">
      <Header />
      <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <div className="text-center"><h1 className="text-4xl font-extrabold tracking-[-0.03em] text-primary">Post Your Item</h1><p className="mt-3 text-on-surface-variant">Create a real marketplace listing buyers can purchase.</p></div>
        <form ref={formRef} className="mt-8 rounded-2xl bg-white p-6 shadow-ambient sm:p-10" onSubmit={handleSubmit}>
          <SectionTitle>Basic Information</SectionTitle>
          <FormInput label="Title" name="title" placeholder="What are you selling?" maxLength="150" />
          <label className="mt-5 block"><span className="mb-2 block text-sm font-semibold">Description</span><textarea className="focus-ring min-h-36 w-full resize-y rounded-lg border border-outline-variant bg-surface-container p-4" name="description" placeholder="Describe your item in detail…" maxLength="5000" required /></label>

          <div className="mt-9"><SectionTitle>Category and condition</SectionTitle></div>
          <label className="relative mt-5 block"><span className="mb-2 block text-sm font-semibold">Category</span><select className="focus-ring h-12 w-full appearance-none rounded-lg border border-outline-variant bg-surface-container px-4" name="category" defaultValue="" required><option value="" disabled>Select a category</option><option value="electronics">Electronics</option><option value="home-garden">Home & Garden</option><option value="vehicles">Vehicles</option><option value="fashion">Fashion</option><option value="sports">Sports</option><option value="other">Other</option></select><ChevronDown className="pointer-events-none absolute bottom-3 right-4 h-5 w-5 text-on-surface-variant" /></label>
          <fieldset className="mt-5"><legend className="mb-3 text-sm font-semibold">Condition</legend><div className="flex flex-wrap gap-6">{[['new', 'New'], ['like-new', 'Like New'], ['used', 'Used']].map(([value, label]) => <label className="flex items-center gap-2" key={value}><input className="h-5 w-5 text-primary focus:ring-primary" type="radio" name="condition" value={value} required />{label}</label>)}</div></fieldset>

          <div className="mt-9"><SectionTitle>Pricing</SectionTitle></div>
          <FormInput label="Price (NPR)" name="price" placeholder="0.00" type="number" min="0.01" step="0.01" />
          <div className="mt-4 rounded-xl border border-primary/20 bg-primary/5 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3"><div><p className="font-bold">Random Forest price assistant</p><p className="mt-1 text-sm text-on-surface-variant">Complete the item details, then get a data-driven NPR estimate.</p></div><button className="flex items-center gap-2 rounded-lg border border-primary px-4 py-2 font-semibold text-primary disabled:opacity-50" type="button" onClick={estimatePrice} disabled={predicting}><Sparkles className="h-4 w-4" />{predicting ? 'Estimating…' : 'Estimate price'}</button></div>
            {prediction && <div className="mt-4 rounded-lg bg-white p-4"><div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-sm text-on-surface-variant">Suggested price</p><p className="text-2xl font-extrabold text-primary">NPR {prediction.predictedPrice.toLocaleString()}</p><p className="mt-1 text-xs text-on-surface-variant">Range: NPR {prediction.suggestedRange.minimum.toLocaleString()}–{prediction.suggestedRange.maximum.toLocaleString()} · {prediction.algorithm}</p></div><button className="rounded-lg bg-primary px-4 py-2 font-semibold text-white" type="button" onClick={useSuggestedPrice}>Use this price</button></div><p className="mt-3 text-xs text-on-surface-variant">{prediction.disclaimer} Training source: {prediction.trainingSource}.</p></div>}
          </div>

          <div className="mt-9"><SectionTitle>Images</SectionTitle></div>
          <label className="mt-5 block"><span className="mb-2 block text-sm font-semibold">Image URLs (optional)</span><span className="relative block"><ImagePlus className="absolute left-4 top-3 h-6 w-6 text-on-surface-variant" /><input className="focus-ring h-12 w-full rounded-lg border border-outline-variant bg-surface-container pl-12 pr-4" name="images" placeholder="https://example.com/photo.jpg, https://…" /></span><span className="mt-2 block text-xs text-on-surface-variant">Separate multiple image URLs with commas. Direct file upload will be added with Cloudinary.</span></label>

          {error && <p className="mt-6 rounded-lg bg-red-50 p-3 text-sm font-medium text-red-700" role="alert">{error}</p>}
          <div className="mt-10 flex justify-end border-t border-surface-variant pt-6"><button className="rounded-lg bg-primary px-9 py-3 font-bold text-white shadow-md hover:bg-[#005c3e] disabled:cursor-not-allowed disabled:opacity-60" type="submit" disabled={submitting}>{submitting ? 'Posting…' : 'Post Item'}</button></div>
        </form>
      </main>
      <Footer />
    </div>
  )
}
