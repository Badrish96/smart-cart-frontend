'use client'

import React from 'react'

export interface SelectOption {
  value: string
  label: string
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  placeholder?: string
  options: SelectOption[]
}

export default function Select({
  label,
  error,
  placeholder,
  options,
  className = '',
  id,
  ...props
}: SelectProps) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-')

  return (
    <div className="flex flex-col gap-1 w-full">
      {label && (
        <label htmlFor={inputId} className="fs-sm fw-medium text-secondary">
          {label}
        </label>
      )}
      <select
        id={inputId}
        className={[
          'select-base',
          error ? 'input-base--error' : '',
          className,
        ]
          .filter(Boolean)
          .join(' ')}
        {...props}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && (
        <p className="input-error-msg" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}
