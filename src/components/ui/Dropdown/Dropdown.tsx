'use client'

import React, { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { ChevronDown, Check } from 'lucide-react'

export interface DropdownOption {
  value: string
  label: string
}

interface DropdownProps {
  label?: string
  error?: string
  placeholder?: string
  options: DropdownOption[]
  value?: string
  onChange?: (value: string) => void
  onBlur?: () => void
  disabled?: boolean
  id?: string
}

export default function Dropdown({
  label,
  error,
  placeholder,
  options,
  value = '',
  onChange,
  onBlur,
  disabled = false,
  id,
}: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [menuVars, setMenuVars] = useState<Record<string, string>>({})
  const containerRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-')

  // Calculate fixed position from trigger's bounding rect so the menu
  // escapes any overflow:hidden/auto ancestor (e.g. modal scroll containers).
  const positionMenu = () => {
    if (!triggerRef.current) return
    const rect = triggerRef.current.getBoundingClientRect()
    const spaceBelow = window.innerHeight - rect.bottom
    const menuHeight = Math.min(options.length * 44, 220)
    const openUpward = spaceBelow < menuHeight + 8 && rect.top > menuHeight + 8

    setMenuVars({
      '--dd-top': `${openUpward ? rect.top - menuHeight - 4 : rect.bottom + 4}px`,
      '--dd-left': `${rect.left}px`,
      '--dd-width': `${rect.width}px`,
    })
  }

  useLayoutEffect(() => {
    if (isOpen) positionMenu()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen])

  // Reposition on scroll or resize while open
  useEffect(() => {
    if (!isOpen) return
    const handler = () => positionMenu()
    window.addEventListener('scroll', handler, true)
    window.addEventListener('resize', handler)
    return () => {
      window.removeEventListener('scroll', handler, true)
      window.removeEventListener('resize', handler)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen])

  // Close on outside click — must exclude both the trigger wrapper AND the
  // portal menu (rendered in document.body, outside containerRef).
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const target = e.target as Node
      const inTrigger = containerRef.current?.contains(target)
      const inMenu    = menuRef.current?.contains(target)
      if (!inTrigger && !inMenu) {
        setIsOpen(false)
        onBlur?.()
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [onBlur])

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') setIsOpen(false) }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [])

  const selectedLabel = options.find((o) => o.value === value)?.label

  const handleSelect = (optionValue: string) => {
    onChange?.(optionValue)
    setIsOpen(false)
    onBlur?.()
  }

  const triggerClasses = [
    'dropdown-trigger',
    isOpen ? 'dropdown-trigger--open' : '',
    error ? 'dropdown-trigger--error' : '',
  ].filter(Boolean).join(' ')

  const menu = isOpen ? (
    <div ref={menuRef} className="dropdown-menu dropdown-menu--fixed" role="listbox" aria-label={label} style={menuVars as React.CSSProperties}>
      {options.map((opt) => {
        const isActive = opt.value === value
        return (
          <button
            key={opt.value}
            type="button"
            role="option"
            aria-selected={isActive}
            className={`dropdown-option${isActive ? ' dropdown-option--active' : ''}`}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => handleSelect(opt.value)}
          >
            {opt.label}
            {isActive && <Check size={14} aria-hidden="true" />}
          </button>
        )
      })}
    </div>
  ) : null

  return (
    <div className="flex flex-col gap-1 w-full">
      {label && (
        <label htmlFor={inputId} className="fs-sm fw-medium text-secondary">
          {label}
        </label>
      )}

      <div ref={containerRef} className="dropdown-wrap">
        <button
          ref={triggerRef}
          id={inputId}
          type="button"
          className={triggerClasses}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          aria-label={label}
          disabled={disabled}
          onClick={() => setIsOpen((v) => !v)}
        >
          <span className={`dropdown-trigger-text${value ? ' dropdown-trigger-text--selected' : ' dropdown-trigger-text--placeholder'}`}>
            {selectedLabel ?? placeholder ?? ''}
          </span>
          <ChevronDown size={16} className={`dropdown-chevron${isOpen ? ' dropdown-chevron--open' : ''}`} aria-hidden="true" />
        </button>
      </div>

      {error && <p className="input-error-msg" role="alert">{error}</p>}

      {typeof document !== 'undefined' && menu ? createPortal(menu, document.body) : null}
    </div>
  )
}
