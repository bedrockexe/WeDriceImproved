import { Header } from './components/Landing/Header'
import { HeroSection } from './components/Landing/HeroSection'
import { FeaturedCars } from './components/Landing/FeaturedCars'
import { WhyChooseUs } from './components/Landing/WhyChooseUs'
import { HowItWorks } from './components/Landing/HowItWorks'
import { Testimonials } from './components/Landing/Testimonials'
import { FAQ } from './components/Landing/FAQ'
import { Footer } from './components/Landing/Footer'

export default function Landing() {
  return (
    <div className="flex flex-col min-h-screen w-full">
      <Header />
      <main>
        <HeroSection />
        <FeaturedCars />
        <WhyChooseUs />
        <HowItWorks />
        <Testimonials />
        <FAQ />
      </main>
      <Footer />
    </div>
  )
}
