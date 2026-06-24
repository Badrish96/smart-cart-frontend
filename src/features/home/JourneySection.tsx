import React from 'react'
import { Search, ShoppingCart, Truck, Gift } from 'lucide-react'

interface Step {
  title: string
  desc: string
}

interface JourneySectionProps {
  dict: {
    heading: string
    heading_accent: string
    subheading: string
    steps: Step[]
  }
}

const stepIcons = [Search, ShoppingCart, Truck, Gift]

export default function JourneySection({ dict }: JourneySectionProps) {
  return (
    <section className="py-20 bg-secondary">
      <div className="max-w-[1280px] mx-auto px-6 max-sm:px-4">
        <div className="text-center mb-14">
          <h2 className="section-heading mb-3">
            {dict.heading}{' '}
            <span className="text-accent">{dict.heading_accent}</span>
          </h2>
          <p className="section-subheading mx-auto">{dict.subheading}</p>
        </div>

        {/* Steps row with connector lines */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {dict.steps.map((step, i) => {
            const Icon = stepIcons[i]
            return (
              <div key={step.title} className="flex flex-col items-center text-center gap-3">
                <div className="journey-step-number">
                  <Icon size={22} className="text-accent" />
                </div>
                <span className="text-xs font-bold tracking-widest uppercase text-accent">
                  Step {String(i + 1).padStart(2, '0')}
                </span>
                <h3 className="text-base font-semibold text-primary">{step.title}</h3>
                <p className="text-sm text-secondary leading-relaxed max-w-[200px]">{step.desc}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
