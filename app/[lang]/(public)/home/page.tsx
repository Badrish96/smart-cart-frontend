import { notFound } from 'next/navigation'
import dynamic from 'next/dynamic'
import { getDictionary, hasLocale } from '../../dictionaries'

// Above the fold — SSR on, code-split JS bundle
const HomeProductsClient = dynamic(
  () => import('../../../../src/features/home/HomeProductsClient'),
  { loading: () => <div style={{ minHeight: '100vh' }} /> }
)

// Static server components — just code-split, no ssr flag needed
const StatsSection    = dynamic(() => import('../../../../src/features/home/StatsSection'))
const FeaturesSection = dynamic(() => import('../../../../src/features/home/FeaturesSection'))
const JourneySection  = dynamic(() => import('../../../../src/features/home/JourneySection'))
const CTASection      = dynamic(() => import('../../../../src/features/home/CTASection'))

const TestimonialsSection = dynamic(
  () => import('../../../../src/features/home/TestimonialsSection')
)
const FAQSection = dynamic(
  () => import('../../../../src/features/home/FAQSection')
)

interface Props {
  params: Promise<{ lang: string }>
}

export default async function HomePage({ params }: Props) {
  const { lang } = await params
  if (!hasLocale(lang)) notFound()
  const dict = await getDictionary(lang)

  return (
    <>
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
