import CategoryGrid from '../components/CategoryGrid'
import FeaturedListings from '../components/FeaturedListings'
import Footer from '../components/Footer'
import Header from '../components/Header'
import HeroSection from '../components/HeroSection'
import HowItWorks from '../components/HowItWorks'
import SellerCta from '../components/SellerCta'
import TrustStrip from '../components/TrustStrip'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-surface text-on-surface">
      <Header />
      <main>
        <HeroSection />
        <TrustStrip />
        <CategoryGrid />
        <FeaturedListings />
        <HowItWorks />
        <SellerCta />
      </main>
      <Footer />
    </div>
  )
}
