'use client'

import { useEffect, useRef, useState } from 'react'
import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react'

interface DatePickerProps {
  label?: string
  value: string          // ISO date string YYYY-MM-DD or ''
  onChange: (value: string) => void
  placeholder?: string
  error?: string
  maxDate?: Date         // defaults to today
  minYear?: number       // defaults to 1900
}

const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

function parseDate(iso: string): Date | null {
  if (!iso) return null
  const d = new Date(iso + 'T00:00:00')
  return isNaN(d.getTime()) ? null : d
}

function toIso(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function formatDisplay(iso: string): string {
  const d = parseDate(iso)
  if (!d) return ''
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
}

export default function DatePicker({
  label,
  value,
  onChange,
  placeholder = 'Select date',
  error,
  maxDate,
  minYear = 1900,
}: DatePickerProps) {
  const max = maxDate ?? new Date()
  const today = new Date()

  const selected = parseDate(value)
  const [open, setOpen] = useState(false)
  const [viewYear, setViewYear] = useState(selected?.getFullYear() ?? today.getFullYear())
  const [viewMonth, setViewMonth] = useState(selected?.getMonth() ?? today.getMonth())

  const wrapperRef = useRef<HTMLDivElement>(null)

  // Sync view when external value changes
  useEffect(() => {
    if (selected) {
      setViewYear(selected.getFullYear())
      setViewMonth(selected.getMonth())
    }
  }, [value]) // eslint-disable-line react-hooks/exhaustive-deps

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1) }
    else setViewMonth(m => m - 1)
  }

  const nextMonth = () => {
    const nextY = viewMonth === 11 ? viewYear + 1 : viewYear
    const nextM = viewMonth === 11 ? 0 : viewMonth + 1
    const firstOfNext = new Date(nextY, nextM, 1)
    if (firstOfNext > max) return
    setViewMonth(nextM)
    setViewYear(nextY)
  }

  const handleDayClick = (day: number, month: number, year: number) => {
    const d = new Date(year, month, day)
    if (d > max) return
    onChange(toIso(d))
    setOpen(false)
  }

  // Build calendar grid: days of viewMonth padded with prev/next month days
  const firstDay = new Date(viewYear, viewMonth, 1).getDay()
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()
  const daysInPrev = new Date(viewYear, viewMonth, 0).getDate()

  const cells: Array<{ day: number; month: number; year: number; otherMonth: boolean }> = []
  for (let i = firstDay - 1; i >= 0; i--) {
    const prevM = viewMonth === 0 ? 11 : viewMonth - 1
    const prevY = viewMonth === 0 ? viewYear - 1 : viewYear
    cells.push({ day: daysInPrev - i, month: prevM, year: prevY, otherMonth: true })
  }
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ day: d, month: viewMonth, year: viewYear, otherMonth: false })
  }
  const remaining = 42 - cells.length
  for (let d = 1; d <= remaining; d++) {
    const nextM = viewMonth === 11 ? 0 : viewMonth + 1
    const nextY = viewMonth === 11 ? viewYear + 1 : viewYear
    cells.push({ day: d, month: nextM, year: nextY, otherMonth: true })
  }

  // Year options: minYear → current year
  const maxYear = today.getFullYear()
  const yearOptions = Array.from({ length: maxYear - minYear + 1 }, (_, i) => maxYear - i)

  const isSelected = (day: number, month: number, year: number) =>
    selected?.getDate() === day &&
    selected?.getMonth() === month &&
    selected?.getFullYear() === year

  const isToday = (day: number, month: number, year: number) =>
    today.getDate() === day &&
    today.getMonth() === month &&
    today.getFullYear() === year

  const isFuture = (day: number, month: number, year: number) =>
    new Date(year, month, day) > max

  const canGoNext = () => {
    const firstOfNext = new Date(viewMonth === 11 ? viewYear + 1 : viewYear, viewMonth === 11 ? 0 : viewMonth + 1, 1)
    return firstOfNext <= max
  }

  const inputId = label?.toLowerCase().replace(/\s+/g, '-')

  return (
    <div className="flex flex-col gap-1 w-full" ref={wrapperRef}>
      {label && (
        <label htmlFor={inputId} className="fs-sm fw-medium text-secondary">
          {label}
        </label>
      )}

      <div className="relative">
        <button
          id={inputId}
          type="button"
          onClick={() => setOpen(v => !v)}
          className={[
            'dp-trigger',
            open ? 'dp-trigger--open' : '',
            !value ? 'dp-trigger--placeholder' : '',
            error ? 'dp-trigger--error' : '',
          ].filter(Boolean).join(' ')}
        >
          <span>{value ? formatDisplay(value) : placeholder}</span>
          <CalendarDays size={16} className="text-muted flex-shrink-0" />
        </button>

        {open && (
          <div className="dp-popover">
            {/* Header: prev | month select + year select | next */}
            <div className="dp-header">
              <button type="button" className="dp-nav-btn" onClick={prevMonth} aria-label="Previous month">
                <ChevronLeft size={16} />
              </button>

              <div className="flex items-center gap-2 flex-1 justify-center">
                <select
                  className="dp-select"
                  value={viewMonth}
                  onChange={(e) => setViewMonth(Number(e.target.value))}
                  aria-label="Month"
                >
                  {MONTHS.map((m, i) => (
                    <option key={m} value={i}>{m}</option>
                  ))}
                </select>

                <select
                  className="dp-select"
                  value={viewYear}
                  onChange={(e) => setViewYear(Number(e.target.value))}
                  aria-label="Year"
                >
                  {yearOptions.map((y) => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>

              <button
                type="button"
                className="dp-nav-btn"
                onClick={nextMonth}
                disabled={!canGoNext()}
                aria-label="Next month"
              >
                <ChevronRight size={16} />
              </button>
            </div>

            {/* Weekday headers */}
            <div className="dp-weekdays">
              {WEEKDAYS.map((w) => (
                <div key={w} className="dp-weekday">{w}</div>
              ))}
            </div>

            {/* Day grid */}
            <div className="dp-days">
              {cells.map((cell, i) => (
                <button
                  key={i}
                  type="button"
                  disabled={isFuture(cell.day, cell.month, cell.year)}
                  onClick={() => handleDayClick(cell.day, cell.month, cell.year)}
                  className={[
                    'dp-day',
                    isSelected(cell.day, cell.month, cell.year) ? 'dp-day--selected' : '',
                    isToday(cell.day, cell.month, cell.year) ? 'dp-day--today' : '',
                    cell.otherMonth ? 'dp-day--other-month' : '',
                    isFuture(cell.day, cell.month, cell.year) ? 'dp-day--future' : '',
                  ].filter(Boolean).join(' ')}
                >
                  {cell.day}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {error && (
        <p className="input-error-msg" role="alert">{error}</p>
      )}
    </div>
  )
}
