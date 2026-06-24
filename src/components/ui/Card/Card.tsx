'use client'

import React from 'react'

interface CardProps {
  children: React.ReactNode
  className?: string
  onClick?: () => void
  hoverable?: boolean
}

export default function Card({
  children,
  className = '',
  onClick,
  hoverable = true,
}: CardProps) {
  const classNames = ['card', !hoverable ? 'hover:transform-none' : '', className]
    .filter(Boolean)
    .join(' ')

  if (onClick) {
    return (
      <div className={classNames} onClick={onClick} role="button">
        {children}
      </div>
    )
  }

  return <div className={classNames}>{children}</div>
}
