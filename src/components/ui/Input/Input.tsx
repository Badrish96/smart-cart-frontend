'use client'

import React from 'react'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

export default function Input({
  label,
  error,
  leftIcon,
  rightIcon,
  className = '',
  id,
  ...props
}: InputProps) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-')

  return (
    <div className="flex flex-col gap-1 w-full">
      {label && (
        <label htmlFor={inputId} className="fs-sm fw-medium text-secondary">
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        {leftIcon && (
          <span className="input-icon input-icon--left">{leftIcon}</span>
        )}
        <input
          id={inputId}
          className={[
            'input-base',
            leftIcon ? 'input-base--left-pad' : '',
            rightIcon ? 'input-base--right-pad' : '',
            error ? 'input-base--error' : '',
            className,
          ]
            .filter(Boolean)
            .join(' ')}
          {...props}
        />
        {rightIcon && (
          <span className="input-icon input-icon--right">{rightIcon}</span>
        )}
      </div>
      {error && (
        <p className="input-error-msg" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}
