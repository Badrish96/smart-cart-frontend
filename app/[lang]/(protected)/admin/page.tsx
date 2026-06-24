import { redirect } from 'next/navigation'

interface Props {
  params: Promise<{ lang: string }>
}

export default async function AdminPage({ params }: Props) {
  const { lang } = await params
  redirect(`/${lang}/admin/products`)
}
