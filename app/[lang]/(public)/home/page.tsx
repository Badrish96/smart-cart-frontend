import { notFound } from 'next/navigation'
import { getDictionary, hasLocale } from '../../dictionaries'
import HomeProductsClient  from '../../../../src/features/home/HomeProductsClient'
import StatsSection        from '../../../../src/features/home/StatsSection'
import FeaturesSection     from '../../../../src/features/home/FeaturesSection'
import JourneySection      from '../../../../src/features/home/JourneySection'
import TestimonialsSection from '../../../../src/features/home/TestimonialsSection'
import FAQSection          from '../../../../src/features/home/FAQSection'
import CTASection          from '../../../../src/features/home/CTASection'

interface Props {
  params: Promise<{ lang: string }>
}

export default async function HomePage({ params }: Props) {
  const { lang } = await params
  if (!hasLocale(lang)) notFound()
  const dict = await getDictionary(lang)

  return (
    <>
      {/* HeroSection + CollectionSection share a single products fetch */}
      <HomeProductsClient
        heroDict={dict.hero}
        productsDict={dict.products}
        collectionDict={dict.collection}
        lang={lang}
      />
      <StatsSection      dict={dict.stats} />
      <FeaturesSection   dict={dict.features} />
      <JourneySection    dict={dict.journey} />
      <TestimonialsSection dict={dict.testimonials} />
      <FAQSection        dict={dict.faq} />
      <CTASection        dict={dict.cta} />
    </>
  )
}
