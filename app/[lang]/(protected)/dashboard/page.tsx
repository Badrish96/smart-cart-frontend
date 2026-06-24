import { notFound } from 'next/navigation'
import { getDictionary, hasLocale } from '../../dictionaries'

interface Props {
  params: Promise<{ lang: string }>
}

export default async function DashboardPage({ params }: Props) {
  const { lang } = await params

  if (!hasLocale(lang)) notFound()

  await getDictionary(lang)

  return (
    <div className="container py-32">
      <h1 className="text-3xl font-bold text-primary">Dashboard</h1>
      <p className="mt-2 text-secondary">
        Protected route — authenticated users only.
      </p>
    </div>
  )
}
