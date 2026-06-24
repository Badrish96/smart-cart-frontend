import React from 'react'
import { TrendingUp, Award, Tag, Users } from 'lucide-react'

interface StatsSectionProps {
  dict: {
    products_value: string
    products_label: string
    brands_value: string
    brands_label: string
    savings_value: string
    savings_label: string
    customers_value: string
    customers_label: string
  }
}

export default function StatsSection({ dict }: StatsSectionProps) {
  const stats = [
    { icon: TrendingUp, value: dict.products_value, label: dict.products_label },
    { icon: Award,      value: dict.brands_value,   label: dict.brands_label },
    { icon: Tag,        value: dict.savings_value,  label: dict.savings_label },
    { icon: Users,      value: dict.customers_value, label: dict.customers_label },
  ]

  return (
    <section className="py-20 border-t border-b section-divider">
      <div className="max-w-[1280px] mx-auto px-6 max-sm:px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((s) => (
            <div key={s.label} className="flex flex-col items-center text-center gap-2">
              <s.icon size={28} className="text-accent mb-1" />
              <span className="stat-value">{s.value}</span>
              <span className="stat-label">{s.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
