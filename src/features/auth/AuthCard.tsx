import React from 'react'

interface AuthCardProps {
  title: string
  subtitle: string
  children: React.ReactNode
  lang: string
}

export default function AuthCard({ title, subtitle, children }: AuthCardProps) {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 mt-12 bg-primary">
      <div className="w-full max-w-md">
        <div className="card-glass p-8">
          <div className="mb-6 text-center">
            <h1 className="text-h3 text-primary mb-1">{title}</h1>
            <p className="text-body-sm text-secondary">{subtitle}</p>
          </div>
          {children}
        </div>
      </div>
    </div>
  )
}
