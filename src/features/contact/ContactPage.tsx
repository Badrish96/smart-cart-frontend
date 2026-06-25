'use client'

import Link from 'next/link'
import { Mail, Phone, MapPin, MessageCircle, Clock, ArrowRight } from 'lucide-react'
import { ROUTES } from '@/src/routes'

const SUPPORT_EMAIL = 'badrishchoubeystar@gmail.com'
const SUPPORT_PHONE = '+91 95408 49758'
const SUPPORT_PHONE_RAW = '+919540849758'

interface Props {
  lang: string
}

export default function ContactPage({ lang }: Props) {
  return (
    <div className="contact-page">
      {/* Hero */}
      <section className="contact-hero">
        <div className="contact-hero-inner">
          <p className="text-overline text-accent mb-3">Get in Touch</p>
          <h1 className="text-h1 text-primary mb-4">We&apos;re here to help</h1>
          <p className="text-body text-secondary contact-hero-desc">
            Have a question about your order, a product, or just want to say hello?
            Reach out — we typically respond within a few hours.
          </p>
        </div>
      </section>

      {/* Cards grid */}
      <section className="contact-grid-section">
        <div className="contact-grid">

          {/* Email support — opens mailto */}
          <a
            href={`mailto:${SUPPORT_EMAIL}?subject=Support%20Request%20—%20SmartCart`}
            className="contact-card contact-card--primary link-plain"
          >
            <div className="contact-card-icon-wrap contact-card-icon-wrap--accent">
              <Mail size={24} />
            </div>
            <h3 className="text-h4 text-primary mt-4 mb-2">Email Support</h3>
            <p className="text-body-sm text-secondary mb-4">
              Send us an email and we&apos;ll get back to you as soon as possible.
            </p>
            <span className="contact-card-value">{SUPPORT_EMAIL}</span>
            <div className="contact-card-cta">
              <span className="fs-sm fw-semibold text-accent">Open mail app</span>
              <ArrowRight size={14} className="text-accent" />
            </div>
          </a>

          {/* Phone */}
          <a
            href={`tel:${SUPPORT_PHONE_RAW}`}
            className="contact-card link-plain"
          >
            <div className="contact-card-icon-wrap">
              <Phone size={24} />
            </div>
            <h3 className="text-h4 text-primary mt-4 mb-2">Phone</h3>
            <p className="text-body-sm text-secondary mb-4">
              Call us directly for immediate assistance with your order or product.
            </p>
            <span className="contact-card-value">{SUPPORT_PHONE}</span>
            <div className="contact-card-cta">
              <span className="fs-sm fw-semibold text-accent">Call now</span>
              <ArrowRight size={14} className="text-accent" />
            </div>
          </a>

          {/* WhatsApp */}
          <a
            href={`https://wa.me/${SUPPORT_PHONE_RAW.replace('+', '')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="contact-card link-plain"
          >
            <div className="contact-card-icon-wrap">
              <MessageCircle size={24} />
            </div>
            <h3 className="text-h4 text-primary mt-4 mb-2">WhatsApp</h3>
            <p className="text-body-sm text-secondary mb-4">
              Chat with us on WhatsApp for quick queries and order updates.
            </p>
            <span className="contact-card-value">{SUPPORT_PHONE}</span>
            <div className="contact-card-cta">
              <span className="fs-sm fw-semibold text-accent">Open WhatsApp</span>
              <ArrowRight size={14} className="text-accent" />
            </div>
          </a>

        </div>
      </section>

      {/* Info strip */}
      <section className="contact-info-strip">
        <div className="contact-info-strip-inner">

          <div className="contact-info-item">
            <Clock size={18} className="text-accent flex-shrink-0" />
            <div>
              <p className="fs-sm fw-semibold text-primary">Support Hours</p>
              <p className="fs-sm text-secondary">Mon – Sat, 10 AM – 7 PM IST</p>
            </div>
          </div>

          <div className="contact-info-divider" />

          <div className="contact-info-item">
            <Mail size={18} className="text-accent flex-shrink-0" />
            <div>
              <p className="fs-sm fw-semibold text-primary">Email Response</p>
              <p className="fs-sm text-secondary">Usually within 2–4 hours</p>
            </div>
          </div>

          <div className="contact-info-divider" />

          <div className="contact-info-item">
            <MapPin size={18} className="text-accent flex-shrink-0" />
            <div>
              <p className="fs-sm fw-semibold text-primary">Based in</p>
              <p className="fs-sm text-secondary">India 🇮🇳</p>
            </div>
          </div>

        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="max-w-[680px] mx-auto px-6 text-center">
          <h2 className="text-h2 text-primary mb-4">Browse our collection</h2>
          <p className="text-body text-secondary mb-8">
            Find the perfect headphones for your style and budget.
          </p>
          <Link href={ROUTES.products(lang)} className="btn btn-primary btn-lg link-plain">
            Explore Products
          </Link>
        </div>
      </section>
    </div>
  )
}
