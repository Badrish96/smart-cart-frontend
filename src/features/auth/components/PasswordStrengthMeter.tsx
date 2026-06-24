'use client'

const BARS = 5

interface StrengthLabels {
  label: string
  weak: string
  fair: string
  strong: string
  very_strong: string
}

interface StrengthResult {
  score: number
  cssLevel: string
  labelKey: keyof Omit<StrengthLabels, 'label'>
}

function computeStrength(password: string): StrengthResult {
  if (!password) return { score: 0, cssLevel: '', labelKey: 'weak' }

  let score = 0
  if (password.length >= 8)         score++
  if (/[A-Z]/.test(password))       score++
  if (/[a-z]/.test(password))       score++
  if (/[0-9]/.test(password))       score++
  if (/[^A-Za-z0-9]/.test(password)) score++

  if (score <= 2) return { score, cssLevel: 'weak',        labelKey: 'weak' }
  if (score === 3) return { score, cssLevel: 'fair',       labelKey: 'fair' }
  if (score === 4) return { score, cssLevel: 'strong',     labelKey: 'strong' }
  return              { score, cssLevel: 'very-strong', labelKey: 'very_strong' }
}

interface Props {
  password: string
  labels: StrengthLabels
}

export default function PasswordStrengthMeter({ password, labels }: Props) {
  if (!password) return null

  const { score, cssLevel, labelKey } = computeStrength(password)

  return (
    <div className={`pwd-strength pwd-strength--${cssLevel}`} aria-live="polite">
      <div className="pwd-strength-bars" aria-hidden="true">
        {Array.from({ length: BARS }, (_, i) => (
          <div
            key={i}
            className={`pwd-strength-bar${i < score ? ' pwd-strength-bar--filled' : ''}`}
          />
        ))}
      </div>
      <div className="pwd-strength-footer">
        <span className="pwd-strength-label">{labels.label}</span>
        <span className="pwd-strength-value">{labels[labelKey]}</span>
      </div>
    </div>
  )
}
