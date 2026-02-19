import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Header from '../components/Header'
import FeaturedListingsCard from '../components/FeaturedListingsCard'
import { Home, CircleDollarSign, Zap } from 'lucide-react'

const heroImages = [
  'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1200&h=600&fit=crop',
  'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1200&h=600&fit=crop',
  'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1200&h=600&fit=crop',
]

const featuredListings = [
  {
    id: 1,
    title: 'Modern 2-Bedroom Apartment in Westlands',
    location: 'Westlands, Nairobi',
    price: 45000,
    image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400&h=300&fit=crop',
    description: 'Spacious modern apartment with excellent amenities and secure parking.',
  },
  {
    id: 2,
    title: 'Cozy Studio in Kilimani',
    location: 'Kilimani, Nairobi',
    price: 28000,
    image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400&h=300&fit=crop',
    description: 'Affordable studio apartment perfect for singles and young professionals.',
  },
  {
    id: 3,
    title: '3-Bedroom Family Home in Karen',
    location: 'Karen, Nairobi',
    price: 65000,
    image: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400&h=300&fit=crop',
    description: 'Spacious family home with garden and secure gated community access.',
  },
  {
    id: 4,
    title: 'Luxury Penthouse in Upper Hill',
    location: 'Upper Hill, Nairobi',
    price: 95000,
    image: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&h=300&fit=crop',
    description: 'Premium penthouse with modern amenities and stunning city views.',
  },
  {
    id: 5,
    title: 'Spacious Apartment in Nairobi CBD',
    location: 'Nairobi CBD',
    price: 52000,
    image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400&h=300&fit=crop',
    description: 'Convenient CBD location with excellent transport connectivity.',
  },
  {
    id: 6,
    title: 'Furnished Bedsitter in Eastleigh',
    location: 'Eastleigh, Nairobi',
    price: 18000,
    image: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400&h=300&fit=crop',
    description: 'Budget-friendly furnished option ideal for students and working professionals.',
  },
]

export default function Landing() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % heroImages.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen bg-background dark:bg-dark-background">
      <Header isLanding={true} />

      {/* Hero Section */}
      <section className="relative w-full h-screen max-h-[600px] md:max-h-[700px] overflow-hidden">
        {/* Image Carousel */}
        <div className="absolute inset-0">
          {heroImages.map((image, index) => (
            <img
              key={index}
              src={image}
              alt={`Hero slide ${index + 1}`}
              loading={index === 0 ? 'eager' : 'lazy'}
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
                index === currentImageIndex ? 'opacity-100' : 'opacity-0'
              }`}
            />
          ))}
        </div>

        {/* Dark overlay */}
        <div className="absolute inset-0 bg-dark/70"></div>

        {/* Content */}
        <div className="relative h-full flex flex-col items-center justify-center px-4 text-center">
          <div className="max-w-2xl space-y-6">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-light leading-tight">
              FIND YOUR PERFECT HOME.
            </h1>
            <p className="text-lg sm:text-xl text-light/90 font-light">
              Discover trusted rental homes across Kenya. From urban apartments to suburban family houses, find your ideal living space.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Link
                to="/login"
                className="button-primary px-8 py-3 text-base font-medium"
              >
                Find a House
              </Link>
              <Link
                to="/signup"
                className="button-secondary bg-light text-dark hover:bg-opacity-90 px-8 py-3 text-base font-medium transition-colors"
              >
                List a House
              </Link>
            </div>

            {/* Scroll to About link */}
            <button
              onClick={() => {
                const aboutSection = document.querySelector('#about')
                aboutSection?.scrollIntoView({ behavior: 'smooth' })
              }}
              className="text-light hover:text-light/80 transition-colors text-sm font-medium pt-4"
            >
              Learn about Kejani Homes →
            </button>
          </div>
        </div>

        {/* Image indicators */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          {heroImages.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentImageIndex(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentImageIndex ? 'bg-light w-8' : 'bg-light/50'
              }`}
            />
          ))}
        </div>
      </section>

      {/* Featured Listings Section */}
      <section id="featured" className="py-12 md:py-16 px-4 bg-background dark:bg-dark-background">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-dark dark:text-light mb-3">Featured Listings</h2>
            <p className="text-muted dark:text-dark-muted text-lg">Explore handpicked properties available now</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredListings.map((listing) => (
              <FeaturedListingsCard key={listing.id} listing={listing} />
            ))}
          </div>

          <div className="text-center mt-12">
            <Link
              to="/login"
              className="button-primary inline-block px-8 py-3"
            >
              View All Listings
            </Link>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-12 md:py-16 px-4 bg-foreground dark:bg-dark-foreground">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-dark dark:text-light text-center mb-12">About Kejani Homes</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* What is Kejani */}
            <div className="card space-y-4 bg-background dark:bg-dark-background">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex-center">
                <Home className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-dark dark:text-light">What is Kejani Homes?</h3>
              <p className="text-muted dark:text-dark-muted">
                Kejani Homes is a trusted platform connecting tenants with verified landlords and property agents across Kenya. We make finding your next home easy, safe, and transparent.
              </p>
            </div>

            {/* For Tenants */}
            <div className="card space-y-4 bg-background dark:bg-dark-background">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex-center">
                <CircleDollarSign className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-dark dark:text-light">For Tenants</h3>
              <p className="text-muted dark:text-dark-muted">
                Browse thousands of verified listings, compare prices, connect directly with landlords, and secure your ideal home with confidence and transparency.
              </p>
            </div>

            {/* For Landlords & Agents */}
            <div className="card space-y-4 bg-background dark:bg-dark-background">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex-center">
                <Zap className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-dark dark:text-light">For Landlords & Agents</h3>
              <p className="text-muted dark:text-dark-muted">
                List properties quickly, reach qualified tenants, manage inquiries efficiently, and grow your rental business with our powerful platform.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-foreground dark:bg-dark-foreground border-t border-border dark:border-dark-border py-8 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-muted dark:text-dark-muted text-sm">
            DESIGNED BY <span className="font-semibold text-dark dark:text-light">NEON HUB CODE HOUSE</span>
          </p>
          <p className="text-muted dark:text-dark-muted text-xs mt-2">
            © 2024 Kejani Homes. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}
