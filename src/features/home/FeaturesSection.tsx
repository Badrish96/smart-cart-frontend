import React from 'react'
import { Headphones, Zap, Users, Globe, Star, Leaf } from 'lucide-react'

interface FeatureItem {
  title: string
  desc: string
}

interface FeaturesSectionProps {
  dict: {
    heading: string
    heading_accent: string
    subheading: string
    items: FeatureItem[]
  }
}

const icons = [Headphones, Zap, Users, Globe, Star, Leaf]

export default function FeaturesSection({ dict }: FeaturesSectionProps) {
  return (
    <section className="py-20">
      <div className="max-w-[1280px] mx-auto px-6 max-sm:px-4">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
          <h2 className="section-heading">
            {dict.heading}{' '}
            <span className="text-accent">{dict.heading_accent}</span>
          </h2>
          <p className="section-subheading md:max-w-xs">{dict.subheading}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {dict.items.map((item, i) => {
            const Icon = icons[i % icons.length]
            return (
              <div key={item.title} className="feature-card">
                <div className="feature-icon-wrap">
                  <Icon size={22} />
                </div>
                <h3 className="text-base font-semibold text-primary mb-2">{item.title}</h3>
                <p className="text-sm text-secondary leading-relaxed">{item.desc}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
