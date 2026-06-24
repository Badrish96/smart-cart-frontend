import React from 'react'
import Button from '../../components/ui/Button'

interface CTASectionProps {
  dict: {
    heading: string
    heading_accent: string
    subheading: string
    button: string
  }
}

export default function CTASection({ dict }: CTASectionProps) {
  return (
    <section className="py-20 bg-secondary">
      <div className="max-w-[1280px] mx-auto px-6 max-sm:px-4">
        <div className="cta-banner">
          <h2 className="section-heading text-center">
            {dict.heading}{' '}
            <span className="text-accent">{dict.heading_accent}</span>
          </h2>
          <p className="section-subheading text-center max-w-md">{dict.subheading}</p>
          <Button variant="primary" size="lg">{dict.button}</Button>
        </div>
      </div>
    </section>
  )
}
