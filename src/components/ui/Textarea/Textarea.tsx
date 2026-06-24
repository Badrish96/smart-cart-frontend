'use client'

import React from 'react'

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
}

export default function Textarea({
  label,
  error,
  className = '',
  id,
  ...props
}: TextareaProps) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-')

  return (
    <div className="flex flex-col gap-1 w-full">
      {label && (
        <label htmlFor={inputId} className="fs-sm fw-medium text-secondary">
          {label}
        </label>
      )}
      <textarea
        id={inputId}
        className={[
          'textarea-base',
          error ? 'input-base--error' : '',
          className,
        ]
          .filter(Boolean)
          .join(' ')}
        {...props}
      />
      {error && (
        <p className="input-error-msg" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}
