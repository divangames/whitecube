import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { PerfTierProvider } from './context/PerfTierContext'
import Navbar from './components/Navbar'
import ScrollToTop from './components/ScrollToTop'
import Hero from './components/Hero'
import Ticker from './components/Ticker'
import CookieConsentBar from './components/CookieConsentBar'
import YandexMetrika from './components/YandexMetrika'
import { appBasename } from './lib/appBasename'

const Services     = lazy(() => import('./components/Services'))
const Stats        = lazy(() => import('./components/Stats'))
const WhyUs        = lazy(() => import('./components/WhyUs'))
const Reviews      = lazy(() => import('./components/Reviews'))
const Contact      = lazy(() => import('./components/Contact'))
const Footer       = lazy(() => import('./components/Footer'))
const PrivacyPolicy  = lazy(() => import('./pages/PrivacyPolicy'))
const TermsOfService = lazy(() => import('./pages/TermsOfService'))

const SectionFallback = () => <div className="min-h-[40vh]" aria-hidden />

function MainPage() {
  return (
    <div className="min-h-screen bg-ink font-sans">
      <Navbar />
      <main>
        <Hero />
        <Ticker />
        <Suspense fallback={<SectionFallback />}>
          <Services />
        </Suspense>
        <Suspense fallback={<SectionFallback />}>
          <Stats />
        </Suspense>
        <Suspense fallback={<SectionFallback />}>
          <WhyUs />
        </Suspense>
        <Suspense fallback={<SectionFallback />}>
          <Reviews />
        </Suspense>
        <Suspense fallback={<SectionFallback />}>
          <Contact />
        </Suspense>
      </main>
      <Suspense fallback={null}>
        <Footer />
      </Suspense>
      <ScrollToTop />
      <CookieConsentBar />
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter basename={appBasename()}>
      <YandexMetrika />
      <PerfTierProvider>
        <Routes>
          <Route path="/" element={<MainPage />} />
          <Route
            path="/privacy"
            element={
              <Suspense fallback={<div className="min-h-screen bg-ink" />}>
                <PrivacyPolicy />
              </Suspense>
            }
          />
          <Route
            path="/terms"
            element={
              <Suspense fallback={<div className="min-h-screen bg-ink" />}>
                <TermsOfService />
              </Suspense>
            }
          />
          {/* Любой другой путь → главная */}
          <Route path="*" element={<MainPage />} />
        </Routes>
      </PerfTierProvider>
    </BrowserRouter>
  )
}
