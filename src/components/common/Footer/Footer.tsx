import React from 'react'
import Link from 'next/link'
import { Globe, X, Tv, Users } from 'lucide-react'

interface FooterProps {
  dict: {
    footer: {
      tagline: string
      rights: string
      newsletter_heading: string
      newsletter_placeholder: string
      newsletter_button: string
      links: {
        shop: string
        about: string
        careers: string
        press: string
        privacy: string
        terms: string
        sitemap: string
      }
    }
    nav: {
      home: string
      explore: string
      contact: string
    }
  }
  lang: string
}

export default function Footer({ dict, lang }: FooterProps) {
  const { footer, nav } = dict

  return (
    <footer className="bg-secondary section-divider border-t pt-14 pb-8">
      <div className="max-w-[1280px] mx-auto px-6 max-sm:px-4">
        {/* Top row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div className="lg:col-span-1">
            <span className="block font-extrabold text-2xl text-accent tracking-wide mb-1">SMARTCART</span>
            <p className="text-xs text-muted mb-5">{footer.tagline}</p>
            <div className="flex items-center gap-3">
              {[Globe, X, Tv, Users].map((Icon, i) => (
                <button
                  key={i}
                  type="button"
                  className="navbar-icon-btn w-9 h-9"
                  aria-label="Social link"
                  title="Social link"
                >
                  <Icon size={16} />
                </button>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-bold text-primary uppercase tracking-widest mb-4">Quick Links</h4>
            <ul className="flex flex-col gap-2">
              {[
                { label: nav.home,    href: `/${lang}/home` },
                { label: nav.explore, href: `/${lang}/explore` },
                { label: nav.contact, href: `/${lang}/contact` },
              ].map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="nav-link text-sm text-secondary">{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-sm font-bold text-primary uppercase tracking-widest mb-4">Company</h4>
            <ul className="flex flex-col gap-2">
              {[footer.links.about, footer.links.careers, footer.links.press].map((label) => (
                <li key={label}>
                  <Link href="#" className="nav-link text-sm text-secondary">{label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="text-sm font-bold text-primary uppercase tracking-widest mb-4">
              {footer.newsletter_heading}
            </h4>
            <form className="flex gap-2" onSubmit={(e) => e.preventDefault()}>
              <input
                type="email"
                placeholder={footer.newsletter_placeholder}
                className="input-base flex-1 text-sm py-2 px-3 h-10"
              />
              <button type="submit" className="btn btn-primary px-4 h-10 text-sm rounded-lg whitespace-nowrap">
                {footer.newsletter_button}
              </button>
            </form>
          </div>
        </div>

        {/* Bottom row */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 section-divider border-t">
          <p className="text-xs text-muted">{footer.rights}</p>
          <div className="flex items-center gap-4">
            {[footer.links.privacy, footer.links.terms, footer.links.sitemap].map((label) => (
              <Link key={label} href="#" className="text-xs text-muted hover:text-accent transition-colors">
                {label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
