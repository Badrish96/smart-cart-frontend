'use client'

import React, { useState } from 'react'
import { ChevronDown } from 'lucide-react'

interface FAQItem {
  q: string
  a: string
}

interface FAQSectionProps {
  dict: {
    heading: string
    heading_accent: string
    subheading: string
    items: FAQItem[]
  }
}

export default function FAQSection({ dict }: FAQSectionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <section className="py-20">
      <div className="max-w-[1280px] mx-auto px-6 max-sm:px-4">
        <div className="flex flex-col lg:flex-row gap-14">
          {/* Left heading */}
          <div className="lg:w-2/5 flex-shrink-0">
            <h2 className="section-heading mb-3">
              {dict.heading}{' '}
              <span className="text-accent">{dict.heading_accent}</span>
            </h2>
            <p className="section-subheading">{dict.subheading}</p>
          </div>

          {/* Right accordion */}
          <div className="flex-1">
            {dict.items.map((item, i) => (
              <div key={i} className="faq-item">
                <button
                  type="button"
                  className="faq-question"
                  onClick={() => setOpenIndex(openIndex === i ? null : i)}
                  aria-expanded={openIndex === i}
                >
                  <span>{item.q}</span>
                  <ChevronDown
                    size={18}
                    className={['faq-icon', openIndex === i ? 'faq-icon--open' : ''].filter(Boolean).join(' ')}
                  />
                </button>
                {openIndex === i && (
                  <p className="faq-answer">{item.a}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
