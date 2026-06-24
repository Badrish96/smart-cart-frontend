'use client'

import React, { useState } from 'react'

interface TestimonialItem {
  name: string
  role: string
  rating: number
  text: string
}

interface TestimonialsSectionProps {
  dict: {
    heading: string
    heading_accent: string
    subheading: string
    items: TestimonialItem[]
  }
}

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg
          key={i}
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="currentColor"
          className={i < rating ? 'star-filled' : 'star-empty'}
        >
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
    </div>
  )
}

export default function TestimonialsSection({ dict }: TestimonialsSectionProps) {
  const [showAll, setShowAll] = useState(false)
  const visible = showAll ? dict.items : dict.items.slice(0, 3)

  return (
    <section className="py-20 bg-secondary">
      <div className="max-w-[1280px] mx-auto px-6 max-sm:px-4">
        <div className="text-center mb-10">
          <h2 className="section-heading mb-3">
            {dict.heading} <span className="text-accent">{dict.heading_accent}</span>
          </h2>
          <p className="section-subheading mx-auto">{dict.subheading}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {visible.map((item) => (
            <div key={item.name} className="testimonial-card">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="testimonial-avatar">{item.name.charAt(0)}</div>
                  <div>
                    <p className="text-sm font-semibold text-primary">{item.name}</p>
                    <p className="text-xs text-muted">{item.role}</p>
                  </div>
                </div>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="text-accent flex-shrink-0 mt-1">
                  <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z"/>
                </svg>
              </div>
              <Stars rating={item.rating} />
              <p className="text-sm text-secondary leading-relaxed mt-3">{item.text}</p>
            </div>
          ))}
        </div>

        {dict.items.length > 3 && (
          <div className="flex justify-center mt-10">
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => setShowAll(v => !v)}
            >
              {showAll ? 'Show Less' : 'View More'}
            </button>
          </div>
        )}
      </div>
    </section>
  )
}
